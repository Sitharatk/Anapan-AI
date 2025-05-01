const express = require('express');
const router = express.Router();
const competitorController = require('../controllers/competitorController');

// GET /api/competitors/intel
router.get('/intel', competitorController.getCompetitorIntel);

module.exports = router;