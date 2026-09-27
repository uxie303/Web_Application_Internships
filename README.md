# Internship Web Application

A full-stack internship management web application developed using **Node.js, Express.js, MySQL, HTML, CSS, and JavaScript**.

The application provides separate functionality for **students and companies**, allowing students to create accounts, browse internships, and submit applications, while companies can create internship listings and manage applications.

## Features

### Student

* Student registration and login
* Student profile management
* Browse available internships
* View internship details
* Apply for internships
* View submitted applications
* Track application status

### Company

* Company registration and login
* Company profile management
* Create internship listings
* View and manage posted internships
* View student applications
* Update application status

## Technologies Used

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Authentication:** Express Session
* **Environment Configuration:** dotenv
* **Development Tools:** PowerShell, MySQL

## Project Structure

```text
Web_Application_Internships/
│
├── public/
│   ├── index.html
│   ├── application.html
│   ├── login.html
│   ├── register.html
│   ├── style.css
│   └── script.js
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
└── server.js
```

## Database

The application uses **MySQL** to store information including:

* Student accounts and profiles
* Company accounts and profiles
* Internship listings
* Internship applications
* Application statuses

Database credentials are stored using environment variables rather than directly in the source code.

## Running the Project Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root based on `.env.example`.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=asg2
DB_PORT=3306
SESSION_SECRET=your_session_secret
```

### 3. Start the server

```bash
node server.js
```

The application will run at:

```text
http://localhost:8080
```

## Security Considerations

* Database credentials are stored using environment variables.
* `.env` is excluded from version control.
* `.env.example` provides a template without exposing real credentials.
* Session configuration is separated from the application source code.

For a production deployment, additional security measures such as password hashing, stronger session configuration, input validation, HTTPS, and additional access controls should be implemented.

## Project Purpose

This project demonstrates practical experience with:

* Full-stack web development
* REST-style backend routes
* Database integration
* User authentication and sessions
* CRUD operations
* Frontend and backend integration
* Environment-based configuration
* Basic web application security

## Author

**Uzair Zubair**

Cybersecurity Student
University of Wollongong in Dubai
