/**
 * Course model
 * Database operations for users using PostgreSQL
 */

const { query } = require('../config/database');

const search = async ({ subject, time, term }) => {
  let sql = `
    SELECT 
      c.id, c.code, c.title, c.credits, c.description,
      s.id as section_id, s.instructor, s.open_seats, s.total_seats,
      m.day, m.start_time, m.end_time, m.location
    FROM courses c
    JOIN sections s ON c.id = s.course_id
    LEFT JOIN meetings m ON s.id = m.section_id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;

  if (subject) {
    sql += ` AND c.code ILIKE $${paramIndex}`;
    params.push(`%${subject}%`);
    paramIndex++;
  }

  if (time) {
    if (time === 'morning') sql += ` AND m.start_time < 1200`;
    else if (time === 'afternoon') sql += ` AND m.start_time >= 1200 AND m.start_time < 1700`;
    else if (time === 'evening') sql += ` AND m.start_time >= 1700`;
  }

  // Use the active term ID to filter old classes
  if (term) {
    sql += ` AND s.term_id = $${paramIndex}`;
    params.push(term);
  }

  sql += ` ORDER BY c.code, s.crn`;

  const result = await query(sql, params);
  return result.rows;
};

module.exports = { search };