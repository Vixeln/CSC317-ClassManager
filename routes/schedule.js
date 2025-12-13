/**
 * routes/schedule.js
 * Handles the student's personal schedule
 */

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
//const { isAuthenticated } = require('../middlewares/auth');

//router.use(isAuthenticated);

router.get('/', scheduleController.getSchedulePage);
router.get('/api/my-classes', scheduleController.getMyClasses);
router.post('/api/add', scheduleController.addToSchedule); // add a class with conflict + seat checking 
router.post('/api/save', scheduleController.saveSchedule);
router.post('/api/clear', scheduleController.clearSchedule);

router.post('/api/generate', scheduleController.generateSchedules);

module.exports = router;