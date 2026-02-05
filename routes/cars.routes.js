const express = require('express');
const { getCars } = require('../controllers/carController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/v1/cars - Admin only
router.get('/', authenticateToken, authorizeRole('Admin'), getCars);

module.exports = router;
