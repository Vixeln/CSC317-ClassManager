/**
 * Database Initialization Script
 *
 * Run this script to create the necessary tables in your PostgreSQL database.
 * Usage: npm run db:init
 */

require("dotenv").config();
const { pool } = require("../config/database");

const dropTables = async () => {
  try {
    // Drop all tables in cascade to handle foreign key constraints
    await pool.query(`
      DROP TABLE IF EXISTS instructors CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS profile_images CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS "session" CASCADE;
    `);
    console.log("\n✅ Database deletion complete!");
  } catch (error) {
    console.error("Error deleting database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

dropTables();
