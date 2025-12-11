/**
 * Term model
 * Database operations for users using PostgreSQL
 */

const { query } = require('../config/database');

// Find the currently active semester (e.g., Fall 2025)
const findActive = async () => {
  const sql = `SELECT * FROM terms WHERE is_active = true LIMIT 1`;
  const result = await query(sql);
  return result.rows[0];
};

// Get all terms
const findAll = async () => {
  const sql = `SELECT * FROM terms ORDER BY start_date DESC`;
  const result = await query(sql);
  return result.rows;
};

module.exports = { findActive, findAll };