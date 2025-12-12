/**
 * Course Controller
 * Handles the logic for the catalog
 */

const Course = require("../models/Course");
const Class = require("../models/Class");
const Term = require("../models/Term");

// View: Shows the HTML page
exports.getSearchPage = (req, res) => {
  res.render("courses/search", {
    title: "Search Classes",
    user: req.session.user,
  });
};

// API: Returns JSON data
exports.searchClasses = async (req, res) => {
  try {
    const { subject, time } = req.query;
    const activeTerm = await Term.findActive();
    const termId = activeTerm ? activeTerm.id : 1;

    const results = await Course.search({ subject, time, term: termId });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const activeTerm = await Term.findActive();
    const termId = activeTerm ? activeTerm.id : 1;

    // Reuse Course.search with no subject/time filters
    const results = await Course.search({ subject: null, time: null, term: termId });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
