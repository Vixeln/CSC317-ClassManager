/**
 * Course Controller
 * Handles the logic for the catalog
 */

const Course = require("../models/Course");
const Class = require("../models/Class");
const Term = require("../models/Term");

// View: Shows the HTML page
exports.getSearchPage = async (req, res) => {
  try {
    const subjects = await Course.getAllSubjects();
    res.render("courses/search", {
      title: "Search Classes",
      user: req.session.user,
      subjects: subjects
    });
  } catch (error) {
  res.render("courses/search", {
    title: "Search Classes",
    user: req.session.user,
      subjects: []
  });
  }
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

exports.getClasses = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const results = await Class.getClasses(page, limit);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
