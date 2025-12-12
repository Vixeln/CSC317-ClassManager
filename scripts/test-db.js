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
const testClass = {
  courseId: 1,
  daysOfWeek: ["Monday", "Tuesday"],
  startTime: "08:00:00",
  endTime: "10:00:00",
  location: "Mars",
};

async function testDatabase() {
	console.log("Testing code: \n")
  try {
		// This function could cause an error if the class already exists
    await Class.add(testClass);
  } catch (error) {
    console.error("Testing failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase()