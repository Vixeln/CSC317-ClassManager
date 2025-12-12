/**
 * Database Test Script
 *
 * Run this script to test functions/queries on the database.
 * Usage: npm run db:test
 *
 * The current file is testing if class retrieval works
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
    // Only attempting to add a subset of test classes because a lot of the test classes have undefined locations which will get added to the table every time we try to add it.
    // for (const testClass of testClasses.slice(0, 8)) {
    //   await Class.add(testClass);
    // }
		
		// Test fetching class from database
		console.log(await Class.getById(3));
  } catch (error) {
    console.error("Testing failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();
