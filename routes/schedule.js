/**
 * routes/schedule.js
 * Handles the student's personal schedule
 */

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', scheduleController.getSchedulePage);
router.get('/api/my-classes', scheduleController.getMyClasses);
router.post('/api/save', scheduleController.saveSchedule);
router.post('/api/clear', scheduleController.clearSchedule);

module.exports = router;