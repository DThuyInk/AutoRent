const express = require('express');
const { 
  getCarsList, 
  getCarDetail, 
  getCreateCarForm,
  submitCreateCar,
  getEditCarForm,
  submitEditCar,
  deleteCar
} = require('../htmlControllers/carHtmlController');

const { 
  getBookingsList, 
  getCreateBookingForm, 
  submitCreateBooking, 
  getBookingDetail,
  getEditBookingForm,
  submitEditBooking,
  deleteBooking
} = require('../htmlControllers/bookingHtmlController');

const { 
  getUsersList, 
  getUserProfile,
  getEditUserForm,
  submitEditUser,
  deleteUser
} = require('../htmlControllers/userHtmlController');

const { getDashboard } = require('../htmlControllers/dashboardController');

const {
  getLoginForm,
  submitLogin,
  getRegisterForm,
  submitRegister,
  logout
} = require('../htmlControllers/authHtmlController');

const { requireAuth } = require('../htmlControllers/sessionMiddleware');
const { authorizeRole } = require('../htmlControllers/authorizationMiddleware');

const router = express.Router();

router.get('/login', getLoginForm);
router.post('/login', submitLogin);
router.get('/register', getRegisterForm);
router.post('/register', submitRegister);
router.get('/logout', logout);

router.get('/dashboard', requireAuth, authorizeRole('Admin'), getDashboard);

router.get('/cars', requireAuth, authorizeRole('Owner', 'Admin'), getCarsList);
router.get('/cars/create', requireAuth, authorizeRole('Owner', 'Admin'), getCreateCarForm);
router.post('/cars', requireAuth, authorizeRole('Owner', 'Admin'), submitCreateCar);
router.get('/cars/:id', requireAuth, authorizeRole('Owner', 'Admin'), getCarDetail);
router.get('/cars/:id/edit', requireAuth, authorizeRole('Owner', 'Admin'), getEditCarForm);
router.post('/cars/:id', requireAuth, authorizeRole('Owner', 'Admin'), submitEditCar);
router.get('/cars/:id/delete', requireAuth, authorizeRole('Owner', 'Admin'), deleteCar);

router.get('/bookings', requireAuth, getBookingsList);
router.get('/bookings/create', requireAuth, getCreateBookingForm);
router.post('/bookings', requireAuth, submitCreateBooking);
router.get('/bookings/:id', requireAuth, getBookingDetail);
router.get('/bookings/:id/edit', requireAuth, getEditBookingForm);
router.post('/bookings/:id', requireAuth, submitEditBooking);
router.get('/bookings/:id/delete', requireAuth, deleteBooking);

router.get('/users', requireAuth, authorizeRole('Admin'), getUsersList);
router.get('/users/:id', requireAuth, authorizeRole('Admin'), getUserProfile);
router.get('/users/:id/edit', requireAuth, authorizeRole('Admin'), getEditUserForm);
router.post('/users/:id', requireAuth, authorizeRole('Admin'), submitEditUser);
router.get('/users/:id/delete', requireAuth, authorizeRole('Admin'), deleteUser);

router.get('/', (req, res) => {
  if (req.cookies.token && req.cookies.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

router.use((req, res, next) => {
  if (req.path === '/dashboard' && !req.cookies.token) {
    return res.redirect('/login');
  }
  next();
});

module.exports = router;
