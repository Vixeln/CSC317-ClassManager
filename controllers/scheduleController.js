/**
 * Schedule Controller
 * Handles the user's personal schedule actions
 */

const Registration = require('../models/Registration');

// View
exports.getSchedulePage = (req, res) => {
  res.render('schedule/index', { 
    title: 'My Schedule',
    user: req.session.user
  });
};

// API: Get My Classes
exports.getMyClasses = async (req, res) => {
  try {
    const classes = await Registration.getSchedule(req.session.user.id);
    res.json({ success: true, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// API: Save (Clear + Add New)
exports.saveSchedule = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { sectionIds } = req.body; 

    await Registration.clearAll(userId); // Clear old
    
    if (sectionIds && sectionIds.length > 0) {
        for (const id of sectionIds) {
        await Registration.add(userId, id); // Add new
        }
    }

    res.json({ success: true, message: 'Saved!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// API: Clear
exports.clearSchedule = async (req, res) => {
  try {
    await Registration.clearAll(req.session.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};