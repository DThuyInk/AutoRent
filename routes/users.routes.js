const express = require('express');
const {
  getUsers,
  getUserDetail,
  getUserAllBookings
} = require('../controllers/userController');
const { authenticateToken, authorizeRole, checkOwnershipOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// GET /api/v1/users - Admin only
router.get('/', authenticateToken, authorizeRole('Admin'), getUsers);

// GET /api/v1/users/:id - Admin or own data (User/Owner can only view their own)
router.get('/:id', authenticateToken, checkOwnershipOrAdmin, getUserDetail);

// GET /api/v1/users/:id/bookings - Admin or own bookings
router.get('/:id/bookings', authenticateToken, checkOwnershipOrAdmin, getUserAllBookings);

module.exports = router;
