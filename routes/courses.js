/**
 * routes/courses.js
 * Handles all catalog and course detail requests
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/', courseController.getSearchPage);
router.get('/api/search', courseController.searchClasses);

router.get('/api/classes', courseController.listAllClasses);

module.exports = router;