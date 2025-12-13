/**
 * Course Controller
 * Handles the logic for the catalog
 */

const Course = require("../models/Course");
const Class = require("../models/Class");


// simple endpoint to list all classes

exports.listAllClasses = async (req, res) => {
  try {
    const page = 1;
    const limit = 100; // or whatever max size you want

    // Class.getClasses is already defined in models/Class.js
    const result = await Class.getClasses(page, limit);

    res.json({
      success: true,
      data: result.classes,  // array of class rows with course info
    });
  } catch (err) {
    console.error('Error in listAllClasses:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load classes.',
      error: err.message,
    });
  }
};

// View: Shows the HTML page
exports.getSearchPage = async (req, res) => {
   try {
    // get a bunch of classes with course info
    const page = 1;
    const limit = 200;
    const result = await Class.getClasses(page, limit);

    res.render("courses/search", {
      title: "Search Classes",
      user: req.session.user,
      classes: result.classes  // 🔸 pass to EJS
    });
  } catch (err) {
    console.error("Error loading search page:", err);
    // fall back to empty list if something goes wrong
    res.render("courses/search", {
      title: "Search Classes",
      user: req.session.user,
      classes: []
    });
  }
};

// API: Returns JSON data
exports.searchClasses = async (req, res) => {
  try {
    const { subject, time } = req.query;
    //const activeTerm = await Term.findActive();
    //const termId =  1;

    const results = await Course.search({ subject, time });
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in searchClasses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClasses = async (req, res) => {
  try {
   // const activeTerm = await Term.findActive();
    //const termId = 1;

    // Reuse Course.search with no subject/time filters
    const results = await Course.search({ 
      subject: null, 
      time: null, 
    //  term: termId 
    });

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error in getClasses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// NEW: simple endpoint to list all classes


exports.listAllClasses = async (req, res) => {
  try {
    // use Class.getClasses(page, limit) from your Class model
    const page = 1;
    const limit = 100; // or whatever max you like
    const result = await Class.getClasses(page, limit);

    return res.json({
      success: true,
      data: result.classes,   // array of classes with course info
    });
  } catch (err) {
    console.error('Error in listAllClasses:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load classes.',
      error: err.message,
    });
  }
};
