const express = require('express');
const {
  getBookings,
  createBooking,
  getBookingDetail,
  getOwnerBookings,
  getBookingsByStatus
} = require('../controllers/bookingController');
const { authenticateToken, authorizeRole, checkOwnershipOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware to check if Owner can only view their own bookings
function checkOwnerBookings(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Người dùng chưa xác thực'
    });
  }

  const paramId = req.params.id;

  // Admin can access everything
  if (req.user.role === 'Admin') {
    return next();
  }

  // Owner can only access their own bookings
  if (req.user.role === 'Owner' && req.user.id !== paramId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem booking của owner khác'
    });
  }

  next();
}

// GET /api/v1/bookings - Admin only
router.get('/', authenticateToken, authorizeRole('Admin'), getBookings);

// GET /api/v1/bookings/status/:status - Admin only (get bookings by status) - MUST be before /:id
router.get('/status/:status', authenticateToken, authorizeRole('Admin'), getBookingsByStatus);

// GET /api/v1/bookings/owners/:id - Admin or Owner (can only view their own) - MUST be before /:id
router.get('/owners/:id', authenticateToken, authorizeRole('Admin', 'Owner'), checkOwnerBookings, getOwnerBookings);

// GET /api/v1/bookings/:id - Admin only - MUST be AFTER /status/:status and /owners/:id
router.get('/:id', authenticateToken, authorizeRole('Admin'), getBookingDetail);

// POST /api/v1/bookings - Admin or User
router.post('/', authenticateToken, authorizeRole('Admin', 'User'), createBooking);

module.exports = router;
