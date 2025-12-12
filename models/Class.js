/**
 * Class model
 *
 * @description An instance of a course. This represents the available sections of a course, what time to meet, where to meet, what section number it is.
 *
 * @fileoverview Database operations for class using PostgreSQL
 * A course is comprised of:
 * - The class number (also it's primary key)
 * - The course it represents
 * - Class meeting start time
 * - Class meeting end time
 * - Class meeting days
 * 	- Represented as an array of texts that could be: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
 * - Instructor
 *
 */
const { query } = require("../config/database");

/**
 * The following are type declarations for relevant objects to add clarity. They do not affect the syntax of the code and are only for documentation
 * @typedef {{courseId: number,location: string,startTime: string,endTime: string,daysOfWeek: string[],maxSeats: number,availableSeats: number,maxWait: number,availableWaitList: number}} Class
 * */

/**
 * @description Attempts to initialize the classes table.
 *
 */
async function createTable() {
	// Note the current set up allows for duplicate classes with the same time and days if the location is null
  await query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
				course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
				meeting_location VARCHAR(30),
				start_time TIME NOT NULL,
				end_time TIME NOT NULL,
				days_of_week TEXT[] NOT NULL,
				max_seat INTEGER,
				available_seat INTEGER,
				max_wait_list INTEGER,
				available_wait_list INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(course_id, meeting_location, start_time, end_time, days_of_week)
      )
  `);
}

/**
 *
 * @param {Class} newClass
 * @returns
 */
async function add(newClass) {
  const { courseId, location, startTime, endTime, daysOfWeek } = newClass;

  try {
    const result = await query(
      `INSERT INTO classes (course_id, meeting_location, start_time, end_time, days_of_week, max_seat, available_seat, max_wait_list, available_wait_list)
			VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $7)
			RETURNING id, course_id, meeting_location, start_time, end_time, days_of_week, max_seat, available_seat, max_wait_list, available_wait_list`,
      [courseId, location, startTime, endTime, daysOfWeek, maxSeats, maxWait]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting class: \n", error);
  }
}

/**
 *
 * @param {number} classId
 * @returns {Promise<Class>} The class from the id
 */
async function getById(classId) {
  try {
    const result = await query(
      `SELECT 
        c.id, 
        c.meeting_location, 
        c.start_time, 
        c.end_time, 
        c.days_of_week,
        c.max_seat,
        c.available_seat,
        c.max_wait_list,
        c.available_wait_list,
        co.id as course_id,
        co.subject,
        co.number,
        co.credit
       FROM classes c
       JOIN courses co ON c.course_id = co.id
       WHERE c.id = $1`,
      [classId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error getting class: \n", error);
  }
}

module.exports = { createTable, add, getById };
