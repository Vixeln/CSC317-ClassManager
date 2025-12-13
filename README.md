# Class Manager

A class management system for students to register and manage classes with ease and _style_.Unlike the SFSU Student Center, our app is simple and fast and does not require users to wait 15 to 30 seconds just for it to respond.

## Features

- Look up classes for Computer Science majors as a student
- Register or log into your student account
  - Edit user name or profile image
- Manage classes in your semester schedule
  - Add a class to your schedule
  - Remove a class from your schedule
  - Clear your schedule

## Contributors

### People

- Vireak Ny - 923791086 - vixeln
- Luis Buenavista - 923271073 - lrbuenavista16
- Bahara Mehry - 924344431 - bmehry25
- Ethan Garcia - 921840371 - CaligulaXO

### Work Distribution

- Git Master: Vireak Ny (@Vixeln)
- Database: Vireak Ny (@Vixeln)
- HTML/CSS/JS: Ethan Garcia (@CaligulaXO)
- Backend: Bahara Mehry (@bmehry25), Luis Buenavista (@lrbuenavista16)

## Project Structure

```
.
├── app.js                     # Application entry point
├── package.json               # NPM project configuration
├── README.md                  # This file
├── config/                    # Configuration files
│   ├── database.js            # PostgreSQL connection pool
│   ├── test-classes.json      # Dummy data to populate classes table
│   └── test-courses.json      # Dummy data to populate courses table
├── controllers/               # Route controllers
│   ├── authController.js      # Authentication logic
│   ├── courseController.js    # Logic to interact with courses on the database
│   ├── scheduleController.js  # User-related logic
│   └── userController.js      # User-related logic
├── middlewares/               # Custom middleware
│   ├── auth.js                # Authentication middleware
│   ├── error-handler.js       # Error handling middleware
│   ├── locals.js              # Template locals middleware
│   └── upload.js              # File upload middleware
├── models/                    # Database operations
│   ├── Class.js               # User data access functions
│   ├── Course.js              # User data access functions
│   ├── Image.js               # Profile image data access functions
│   ├── Registration.js        # Class registration access functions
│   └── User.js                # User data access functions
├── public/                    # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── routes/                    # Express routes
│   ├── auth.js                # Authentication routes
│   ├── courses.js             # Class search page and api routes
│   ├── index.js               # Public routes
│   ├── schedule.js            # User-added classes page and api routes
│   └── user.js                # Protected user routes
├── scripts/                   # Utility scripts
│   ├── clean-db.js            # Reset database tables
│   ├── test-db.js             # Test js functions on database
│   └── init-db.js             # Database initialization
└── views/                     # EJS templates
    ├── partials/              # Reusable template parts (header, footer, etc.)
    ├── auth/                  # Authentication templates
    ├── schedule/              # User's registered classes page
    ├── courses/               # List of courses page
    └── user/                  # User-related templates
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v18.\*)

### Installation

1. Fork and clone the repository:

```bash
# Fork on GitHub first, then clone your fork
git clone https://github.com/Vixeln/CSC317-ClassManager.git
cd CSC317-ClassManager
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Modify the `.env` file with your configuration:

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[your_password]@localhost:5432/csc317_project
SESSION_SECRET=your_secure_secret_key
```

5. Create the database and initialize tables:

```bash
createdb csc317_project
npm run db:init
```

This script will also populate the tables with dummy classes and courses

6. Start the development server:

```bash
npm run dev
```

7. Open your browser and visit `http://localhost:3000`

## Development

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when files change.

### Test javascript code on the database

Write javascript in `scripts/test-db.js` and test it by running

```bash
npm run db:test
```

### Running in Production Mode

```bash
npm start
```

## Deployment

For deployment to Render.com:

1. Create a PostgreSQL database on Render
2. Create a Web Service connected to your GitHub repository
3. Set environment variables (DATABASE_URL, SESSION_SECRET, NODE_ENV)
4. Initialize the database using Render Shell: `npm run db:init`

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## License

This project is available for educational purposes.

## Acknowledgments

- This project was built on top of the authentication template provided by @goleador
- Built with Express.js, PostgreSQL, and other open-source technologies
