/**
 * Course model
 * Database operations for courses using PostgreSQL
 */
const { query } = require("../config/database");

/**
 *
 * @param {string} subject The subject the course is under. E.g: CSC 101, 'CSC' is the course subject and stands for Computer Science Course
 * @param {number} number The couse number. E.g: CSC 101, '101' is the number
 * @param {string} description Description of the course for students to see
 * @param {number} credit The amount units students will get once they finish the course
 */
async function createCourse({ subject, number, description, credit }) {
  try {
    const result = await query(
      `INSERT INTO courses (subject, number, credit)
			VALUES ($1, $2, $3)
			RETURNING id, subject, number, credit`,
      [subject, number, credit]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting course: ", error);
  }
}


module.exports = {
  createCourse
};
