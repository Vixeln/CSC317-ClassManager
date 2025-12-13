/**
 * Course model
 *
 * @description A course is NOT the same as a class, a course simply represents the type of material that will be taught in the curriculum. It does not include meeting times or section numbers, those are classes.
 *
 * @fileoverview Database operations for course using PostgreSQL
 * A course is comprised of:
 * - course subject
 * - course number
 * - course description
 * - credit
 *
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

async function findCourseBySubject(subject) {
  try {
    const result = await query(
      `SELECT * FROM courses
			WHERE subject = $1
			`,
      [subject]
    );
    return result;
  } catch (error) {
    console.error("Error finding course: ", error);
  }
}

const search = async ({ subject, time }) => {
  let sql = `
      SELECT 
        c.id, c.subject, c.number, c.credit,
	      cl.start_time, cl.end_time, cl.days_of_week
    FROM courses c
    LEFT JOIN classes cl ON c.id = cl.id
    WHERE 1 = 1;
  `;

  const params = [];
  let paramIndex = 1;

  if (subject) {
    sql += ` AND c.subject ILIKE $${paramIndex}`;
    params.push(`%${subject}%`);
    paramIndex++;
  }

  if (time) {
    if (time === "morning") sql += ` AND cl.start_time < 1200`;
    else if (time === "afternoon")
      sql += ` AND cl.start_time >= 1200 AND cl.start_time < 1700`;
    else if (time === "evening") sql += ` AND cl.start_time >= 1700`;
  }

  sql += ` ORDER BY c.subject, c.number`;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = { search, createCourse, findCourseBySubject };
