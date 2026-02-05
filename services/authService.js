const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');

// Service function - Register new user
async function registerUser(username, password, name, email, phone, address, role) {
  // Validate required fields
  if (!username?.trim()) {
    throw new Error('Username không được rỗng');
  }
  if (!password?.trim()) {
    throw new Error('Password không được rỗng');
  }
  if (!name?.trim()) {
    throw new Error('Name không được rỗng');
  }
  if (!email?.trim()) {
    throw new Error('Email không được rỗng');
  }
  if (!phone?.trim()) {
    throw new Error('Phone không được rỗng');
  }
  if (!role) {
    throw new Error('Role không được rỗng');
  }

  // Check if username already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error('Username đã tồn tại');
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error('Email đã tồn tại');
  }

  // Validate role
  const validRoles = ['User', 'Owner', 'Admin'];
  if (!validRoles.includes(role)) {
    throw new Error('Role không hợp lệ. Hãy chọn: User, Owner hoặc Admin');
  }

  // Generate new user ID
  const totalUsers = await User.countDocuments();
  const userId = 'U' + String(totalUsers + 1).padStart(3, '0');

  // Create new user
  const newUser = new User({
    id: userId,
    username,
    password,
    name,
    email,
    phone,
    address: address || '',
    role
  });

  await newUser.save();

  // Generate JWT token
  const token = generateToken(newUser);

  // Return user data with token
  const userObj = newUser.toObject();
  delete userObj.password;
  return {
    user: userObj,
    token
  };
}

// Service function - Login user
async function loginUser(username, password) {
  if (!username?.trim()) {
    throw new Error('Username không được rỗng');
  }
  if (!password?.trim()) {
    throw new Error('Password không được rỗng');
  }

  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('Username hoặc password không đúng');
  }

  // Check password
  if (user.password !== password) {
    throw new Error('Username hoặc password không đúng');
  }

  // Generate JWT token
  const token = generateToken(user);

  // Return user data with token
  const userObj = user.toObject();
  delete userObj.password;
  return {
    user: userObj,
    token
  };
}

module.exports = {
  registerUser,
  loginUser
};
