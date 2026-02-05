const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const { checkAvailability } = require('../utils/availability');
const { calculateRentalCost } = require('../utils/pricing');
const { validateBooking } = require('../utils/bookingValidator');
const { createContract } = require('./contractService');
const { excludeUserSensitiveFields } = require('./userService');

// Service function - Get bookings data
async function getBookingsData(filter, pagination) {
  const bookings = await Booking.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit);
  const total = await Booking.countDocuments(filter);
  
  return { bookings, total };
}

// Service function - Create booking data
async function createBookingData(userId, carId, startDate, endDate) {
  validateBooking({ carId, startDate, endDate });

  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  const car = await Car.findOne({ id: carId });
  if (!car) {
    throw new Error('Xe không tồn tại');
  }

  const existingBookings = await Booking.find({ carId: carId });
  if (checkAvailability(carId, startDate, endDate, existingBookings)) {
    throw new Error('Xe không sẵn sàng trong khoảng thời gian này');
  }

  const cost = calculateRentalCost(startDate, endDate, car.pricePerDay);

  const startDateStr = new Date(startDate).toISOString().split('T')[0];
  const endDateStr = new Date(endDate).toISOString().split('T')[0];

  const totalBookings = await Booking.countDocuments();
  const bookingId = 'B' + String(totalBookings + 1).padStart(3, '0');

  const newBooking = new Booking({
    id: bookingId,
    userId,
    carId,
    startDate: startDateStr,
    endDate: endDateStr,
    rentalDays: cost.rentalDays,
    pricePerDay: cost.pricePerDay,
    totalCost: cost.totalCost,
    status: 'pending'
  });

  await newBooking.save();

  if (newBooking.status === 'confirmed') {
    try {
      await createContract(newBooking);
    } catch (contractError) {
      console.error('Cảnh báo: Tạo hợp đồng thất bại -', contractError.message);
    }
  }

  return newBooking;
}

// Service function - Get booking detail with user and car info
async function getBookingDetailData(bookingId) {
  const booking = await Booking.findOne({ id: bookingId });
  
  if (!booking) {
    throw new Error('Đơn đặt không tồn tại');
  }

  // Populate user and car information
  const user = await User.findOne({ id: booking.userId });
  const car = await Car.findOne({ id: booking.carId });

  return {
    ...booking.toObject(),
    user: excludeUserSensitiveFields(user),
    car
  };
}

// Service function - Get bookings for owner's cars
async function getOwnerBookingsData(ownerId, pagination) {
  // Get all cars owned by this owner
  const cars = await Car.find({ ownerId });
  const carIds = cars.map(car => car.id);

  // Get bookings for these cars
  const bookings = await Booking.find({ carId: { $in: carIds } })
    .skip(pagination.skip)
    .limit(pagination.limit);
  
  const total = await Booking.countDocuments({ carId: { $in: carIds } });

  return { bookings, total };
}

// Service function - Get bookings by status
async function getBookingsByStatusData(status, pagination) {
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
  }

  const bookings = await Booking.find({ status })
    .skip(pagination.skip)
    .limit(pagination.limit);
  
  const total = await Booking.countDocuments({ status });

  return { bookings, total };
}

module.exports = {
  getBookingsData,
  createBookingData,
  getBookingDetailData,
  getOwnerBookingsData,
  getBookingsByStatusData
};
