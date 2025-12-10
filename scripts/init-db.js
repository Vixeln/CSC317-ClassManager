/**
 * Database Initialization Script
 *
 * Run this script to create the necessary tables in your PostgreSQL database.
 * Usage: npm run db:init
 */

require("dotenv").config();
const Course = require("../models/Courses.js");
const { pool } = require("../config/database");

const createTables = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        has_profile_image BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Users table created");

    // Create profile_images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        data BYTEA NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Profile images table created");

    // Create courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
				subject VARCHAR(5) NOT NULL DEFAULT 'N/A',
				number INTEGER NOT NULL,
				credit INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(subject, number)
      )
    `); // The UNIQUE constraint was suggested by Claude Haiku
    console.log("✓ Courses table created");

    // Create classes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
				course_id INTEGER REFERENCES courses(id),
				meeting_location VARCHAR(30),
				start_time TIMESTAMP NOT NULL,
				end_time TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Classes table created");

    // Create instructors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
				course_id INTEGER REFERENCES courses(id),
				name VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Instructors table created");

    // Create session table for connect-pg-simple
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" VARCHAR NOT NULL COLLATE "default",
        "sess" JSON NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL,
        PRIMARY KEY ("sid")
      )
    `);

    // Create index on session expire for cleanup
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire")
    `);
    console.log("✓ Session table created");

    // Create indexes for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_profile_images_user_id ON profile_images(user_id)
    `);
    console.log("✓ Indexes created");

    if (process.env.NODE_ENV === "development") await populateTables();
		// Test finding course subject
    // if (process.env.NODE_ENV === "development") console.log(await Course.findCourseBySubject("MATH"));

    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

/**
 * @type {{subject: string, number: number, credit: number}[]}
 */
const testCourses = [
  { subject: "CSC", number: 101, credit: 3 },
  { subject: "CSC", number: 115, credit: 3 },
  { subject: "MATH", number: 101, credit: 3 },
  { subject: "MATH", number: 228, credit: 3 },
  { subject: "CSC", number: 415, credit: 5 },
  { subject: "PHYS", number: 230, credit: 3 },
];

async function populateTables() {
  // Using for...of loop instead of forEach because we're handling async functions
  for (const course of testCourses) {
    console.log(`Attempt to insert ${course.subject} ${course.number} to courses`);
		await Course.createCourse(course);
  }
}

createTables();
