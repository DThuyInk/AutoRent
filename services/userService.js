const User = require('../models/User');
const Booking = require('../models/Booking');

// Helper function - Remove sensitive fields from user object
function excludeUserSensitiveFields(user) {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.username;
  delete userObj.password;
  return userObj;
}

// Service function - Get all users
async function getAllUsers(filter, pagination) {
  const users = await User.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit);
  const total = await User.countDocuments(filter);
  
  // Remove sensitive fields from all users
  const sanitizedUsers = users.map(user => excludeUserSensitiveFields(user));
  
  return { users: sanitizedUsers, total };
}

// Service function - Get user by ID
async function getUserById(userId) {
  const user = await User.findOne({ id: userId });
  
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  return excludeUserSensitiveFields(user);
}

// Service function - Get user's bookings
async function getUserBookings(userId, pagination) {
  // Check if user exists
  const user = await User.findOne({ id: userId });
  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  // Get bookings for this user
  const bookings = await Booking.find({ userId })
    .skip(pagination.skip)
    .limit(pagination.limit);
  const total = await Booking.countDocuments({ userId });

  return { bookings, total };
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserBookings,
  excludeUserSensitiveFields
};
