/**
 * Section model (The class instance, is the class full?)
 * Database operations for storing user profile images using PostgreSQL
 */

const { query } = require('../config/database');

const { query } = require('../config/database');

// Find a single section by ID
const findById = async (id) => {
  const sql = `
    SELECT s.*, c.title, c.code, t.name as term_name
    FROM sections s
    JOIN courses c ON s.course_id = c.id
    JOIN terms t ON s.term_id = t.id
    WHERE s.id = $1
  `;
  const result = await query(sql, [id]);
  return result.rows[0];
};

// Check if a section has open seats
const hasSpace = async (id) => {
  const sql = `SELECT open_seats FROM sections WHERE id = $1`;
  const result = await query(sql, [id]);
  if (result.rows.length === 0) return false;
  return result.rows[0].open_seats > 0;
};

module.exports = { findById, hasSpace };