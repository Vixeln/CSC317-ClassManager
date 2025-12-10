/**
 * Course Controller
 * Handles the logic for the catalog
 */

const Course = require('../models/Course');
const Term = require('../models/Term');

// View: Shows the HTML page
exports.getSearchPage = (req, res) => {
  res.render('courses/search', { 
    title: 'Search Classes',
    user: req.session.user
  });
};

// API: Returns JSON data
exports.searchClasses = async (req, res) => {
  try {
    const { subject, time } = req.query;
    const activeTerm = await Term.findActive(); // You need models/Term.js!
    const termId = activeTerm ? activeTerm.id : 1; 

    const results = await Course.search({ subject, time, term: termId });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};