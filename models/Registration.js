/**
 * Registration model
 * Database operations for users using PostgreSQL
 */

const { query } = require('../config/database');

const getSchedule = async (userId) => {
  const sql = `
    SELECT r.id, c.code, c.title, m.day, m.start_time, m.end_time, m.location, s.instructor
    FROM registrations r
    JOIN sections s ON r.section_id = s.id
    JOIN courses c ON s.course_id = c.id
    LEFT JOIN meetings m ON s.id = m.section_id
    WHERE r.user_id = $1
  `;
  const result = await query(sql, [userId]);
  return result.rows;
};

// Clear everything (for the "Clear" button)
const clearAll = async (userId) => {
  return await query(`DELETE FROM registrations WHERE user_id = $1`, [userId]);
};

// Add a single class
const add = async (userId, sectionId) => {
  const sql = `
    INSERT INTO registrations (user_id, section_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
  `;
  return await query(sql, [userId, sectionId]);
};

module.exports = { getSchedule, clearAll, add };