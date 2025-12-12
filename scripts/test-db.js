/**
 * Database Test Script
 *
 * Run this script to test functions/queries on the database.
 * Usage: npm run db:test
 * 
 * The current file is testing if class insertion works
 */

require("dotenv").config();

const Class = require("../models/Class");
const { pool } = require("../config/database");

/**
 * @type {import("../models/Class.js").Class}
 */

async function testDatabase() {
  const testClasses = require("../config/test-classes.json").classes;

  console.log("Testing code: \n");
  try {
		// This function could cause an error if the class already exists
    for (const testClass of testClasses) {
    await Class.add(testClass);
    }
  } catch (error) {
    console.error("Testing failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase()