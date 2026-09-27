const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const app = express();
app.use(bodyParser.json());
const PORT = 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session setup
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234', // your MySQL password
  database: 'asg2',
  port:3306
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Serve student registration form
app.get('/student_signup', (req, res) => {
  res.sendFile(path.join(__dirname,"public",'student_signup.html'));
});

// Handle student application POST
app.post('/student_signup', (req, res) => {
  const { name, email, stu_password, course } = req.body;
  const sql = 'INSERT INTO students (name, email, stu_password, course) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, stu_password, course], (err, result) => {
    if (err) {
      console.error('Error inserting student:', err);
      return res.send('Error saving application.');
    }
    // Save student info
    const insertedId = result.insertId;
    req.session.studentId = insertedId;
    req.session.studentEmail = email;
    req.session.studentPassword = stu_password;
    req.session.studentName = name;
    req.session.course = course;
    res.redirect('/student_home');
  });
});

// Serve sign-in page
app.get('/student_login', (req, res) => {
  res.sendFile(path.join(__dirname,'public' , 'student_login.html'));
});

// Handle sign-in
app.post('/student_login', (req, res) => {
  const { email, stu_password } = req.body;
  const sql = 'SELECT * FROM students WHERE email = ? AND stu_password = ?';
  db.query(sql, [email, stu_password], (err, results) => {
    if (err) {
      console.error('Sign-in error:', err);
      return res.send('Error during sign-in.');
    }

    if (results.length > 0) {
      req.session.studentId = results[0].id;
      req.session.studentEmail = results[0].email;
      req.session.studentPassword = results[0].stu_password;
      req.session.studentName = results[0].name;

      res.redirect('/student_home'); // redirect to dashboard
    } else {
        res.send('Invalid credentials. Please try again.');
    }
  });
});

// Profile page to show stored session data
app.get('/profile', (req, res) => {
  if (req.session.studentId) {
    res.send(`Your ID is ${req.session.studentId} and email is ${req.session.studentEmail}`);
  } else {
    res.send('You are not signed in.');
  }
});

// Dashboard page
app.get('/student_home', (req, res) => {
  if (req.session.studentId) {
      res.sendFile(path.join(__dirname,'public' , 'student_home.html'));
  } else {
    res.redirect('/student_login');
  }
});

app.get('/getstudentinfo', (req, res) => {
  if (!req.session.studentId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const sql = 'SELECT id, name, email, course FROM students WHERE id = ?';
  db.query(sql, [req.session.studentId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch student info' });
    }

    res.json(results[0]);
  });
});



app.get('/student_profile', (req, res) => {
  if (!req.session.studentId) return res.redirect('/student_login');
  res.sendFile(path.join(__dirname, 'public', 'student_profile.html'));
});


app.post('/update_student_profile', (req, res) => {
  if (!req.session.studentId) {
    return res.json({ success: false, message: 'Not logged in' });
  }

  const { name, email, stu_password, course } = req.body;
  const id = req.session.studentId;

  const sql = 'UPDATE students SET name = ?, email = ?, stu_password = ?, course= ? WHERE id = ?';
  db.query(sql, [name, email, stu_password, course, id], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.json({ success: false });
    }

    // Update session variables
    req.session.studentName = name;
    req.session.studentEmail = email;
    req.session.studentCourse = course;
    return res.json({ success: true });
  });
});


app.get('/company_signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','company_signup.html'));
});

app.post('/company_signup', (req, res) => {
  const { name, email, password } = req.body;
  const sql = 'INSERT INTO companies (name, email, password) VALUES (?, ?, ?)';
  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error('Signup error:', err);
      return res.send('Signup failed.');
    }
    const insertedId = result.insertId;
    req.session.companyId = insertedId;
    req.session.companyName = name;
    req.session.companyEmail = email;
    res.redirect('/company_home');
  });
});

app.get('/company_login', (req, res) => {
  res.sendFile(path.join(__dirname,'public','company_login.html'));
});

app.post('/company_login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM companies WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.send('Error during login.');

    if (results.length > 0) {
      req.session.companyId = results[0].id;
      req.session.companyName = results[0].name;
      req.session.companyEmail = results[0].email;
      res.redirect('/company_home');
    } else {
      res.send('Invalid credentials');
    }
  });
});

app.get('/company_home', (req, res) => {
  if (req.session.companyId) {
    res.sendFile(path.join(__dirname, 'public', 'company_home.html'));
  } else {
    res.redirect('/company_login');
  }
});


app.get('/getcompanyinfo', (req, res) => {
  if (req.session.companyId) {
    res.json({
      id: req.session.companyId,
      name: req.session.companyName,
      email: req.session.companyEmail
    });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});


// POST route to create internship
app.post('/create_internship', (req, res) => {
  const { title, description, location, salary, type, date_posted } = req.body;
  const companyId = req.session.companyId;

  if (!companyId) return res.send('Not logged in');

  const sql = 'INSERT INTO internships (company_id, title, description, location, salary, type, date_posted) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [companyId, title, description, location, salary, type, date_posted], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.json({ success: true, message: 'Internship created successfully' });
  });
});

// GET internships for company
app.get('/company_internships', (req, res) => {

  const sql = 'SELECT * FROM internships WHERE company_id = ? ORDER BY date_posted DESC';
  db.query(sql, req.session.companyId,(err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


app.get('/internship/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM internships WHERE id = ?';
  db.query(sql, req.session.companyId, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    const internship = results[0];
    res.json(internship);
  });
});

// Update internship by ID
app.post('/internship/:id', (req, res) => {
  const id = req.params.id;
  const { title, description, location, salary, type, date_posted } = req.body;

  const sql = `
    UPDATE internships SET
    title = ?, description = ?, location = ?, salary = ?, type = ?, date_posted = ?
    WHERE id = ?
  `;
  db.query(sql, [title, description, location, salary, type, date_posted, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Update failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Internship not found' });
    }
    res.json({ success: true });
  });
});

// Delete internship by ID
app.delete('/internship/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM internships WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Delete failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Internship not found' });
    }
    res.json({ success: true });
  });
});

app.get('/get_applications', (req, res) => {
  const companyId = req.session.companyId;
  if (!companyId) return res.status(401).json({ error: 'Not logged in' });

  const sql = `
    SELECT ia.id, s.name AS student_name, i.title AS internship_title, ia.status
    FROM internship_applications ia
    JOIN students s ON ia.student_id = s.id
    JOIN internships i ON ia.internship_id = i.id
    WHERE i.company_id = ?
  `;
  db.query(sql, [companyId], (err, results) => {
    if (err) {
      console.error('Failed to fetch applications:', err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
    res.json(results);
  });
});


app.post('/update_application_status/:id', (req, res) => {
  const appId = req.params.id;
  const { status } = req.body;

  const sql = 'UPDATE internship_applications SET status = ? WHERE id = ?';
  db.query(sql, [status, appId], (err, result) => {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});



// Serve company profile page
app.get('/company_profile', (req, res) => {
  if (!req.session.companyId) return res.redirect('/company_login');
  res.sendFile(path.join(__dirname, 'public', 'company_profile.html'));
});

// Handle profile update
app.post('/update_company_profile', (req, res) => {
  if (!req.session.companyId) {
    return res.json({ success: false, message: 'Not logged in' });
  }

  const { name, email, password } = req.body;
  const id = req.session.companyId;

  const sql = 'UPDATE companies SET name = ?, email = ?, password = ? WHERE id = ?';
  db.query(sql, [name, email, password, id], (err, result) => {
    if (err) {
      console.error('Error updating company:', err);
      return res.json({ success: false });
    }

    // Update session variables
    req.session.companyName = name;
    req.session.companyEmail = email;
    return res.json({ success: true });
  });
});

app.get('/internships', (req, res) => {
  const sql = `
    SELECT internships.*, companies.name AS company_name
    FROM internships
    JOIN companies ON internships.company_id = companies.id
    ORDER BY date_posted DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching internships:', err);
      return res.status(500).json({ error: 'Failed to load internships' });
    }
    res.json(results);
  });
});


app.post('/apply', (req, res) => {
  const { studentId, internshipId } = req.body;
  if (!studentId || !internshipId) {
    return res.status(400).json({ error: 'Missing studentId or internshipId' });
  }

  // Check for existing application
  db.query(
    'SELECT * FROM internship_applications WHERE student_id = ? AND internship_id = ?',
    [studentId, internshipId],
    (err, existing) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Already applied' });
      }

      // Insert new application
      db.query(
        'INSERT INTO internship_applications (student_id, internship_id) VALUES (?, ?)',
        [studentId, internshipId],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({ error: 'Application failed' });
          }
          res.json({ success: true });
        }
      );
    }
  );
});


app.get('/applied/:studentId', (req, res) => {
  const { studentId } = req.params;

  db.query(
    'SELECT internship_id FROM internship_applications WHERE student_id = ?',
    [studentId],
    (err, results) => {
      if (err) {
        console.log(results);
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch applications' });
      }
      res.json(results);
    }
  );
});




app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send('Logout error');
    res.redirect('/'); // redirect to main portal page
  });
});



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'portal.html'));
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
