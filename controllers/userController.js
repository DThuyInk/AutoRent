const {
  getAllUsers,
  getUserById,
  getUserBookings
} = require('../services/userService');

async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { role } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (role) filter.role = role;

    const { users, total } = await getAllUsers(filter, { skip, limit });

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng',
      error: error.message
    });
  }
}

async function getUserDetail(req, res) {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng',
      error: error.message
    });
  }
}

async function getUserAllBookings(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const { bookings, total } = await getUserBookings(id, { skip, limit });

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách booking của người dùng',
      error: error.message
    });
  }
}

module.exports = {
  getUsers,
  getUserDetail,
  getUserAllBookings
};
