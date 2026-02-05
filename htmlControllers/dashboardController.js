const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');

async function getDashboard(req, res) {
  try {
    const totalCars = await Car.countDocuments();
    const availableCars = await Car.countDocuments({ status: 'available' });
    const maintenanceCars = await Car.countDocuments({ status: 'maintenance' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    
    const totalUsers = await User.countDocuments();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('shared/dashboard', {
      pageTitle: 'Dashboard',
      currentPage: 'dashboard',
      stats: {
        totalCars,
        availableCars,
        maintenanceCars,
        totalBookings,
        pendingBookings,
        confirmedBookings,
        totalUsers
      },
      recentBookings: recentBookings.map(b => b.toObject())
    });
  } catch (error) {
    res.render('shared/dashboard', {
      pageTitle: 'Dashboard',
      currentPage: 'dashboard',
      errorMessage: 'Lỗi khi tải dashboard: ' + error.message,
      stats: {},
      recentBookings: []
    });
  }
}

module.exports = {
  getDashboard
};
