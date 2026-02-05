const User = require('../models/User');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

async function getUsersList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const searchQuery = req.query.search;

    const skip = (page - 1) * limit;
    let filter = {};

    if (role) filter.role = role;
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.render('users/list', {
      pageTitle: 'Danh Sách User',
      currentPage: 'users',
      users: users.map(u => u.toObject()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filter: { role },
      searchQuery
    });
  } catch (error) {
    res.render('users/list', {
      pageTitle: 'Danh Sách User',
      currentPage: 'users',
      errorMessage: 'Lỗi khi tải danh sách user: ' + error.message,
      users: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const { id } = req.params;
    const bookingPage = parseInt(req.query.bookingPage) || 1;
    const bookingLimit = 10;
    const bookingSkip = (bookingPage - 1) * bookingLimit;

    const user = await User.findOne({ id });

    if (!user) {
      return res.render('users/profile', {
        pageTitle: 'Hồ Sơ User',
        currentPage: 'users',
        errorMessage: 'Không tìm thấy user này'
      });
    }

    const bookings = await Booking.find({ userId: id })
      .skip(bookingSkip)
      .limit(bookingLimit);
    const totalBookings = await Booking.countDocuments({ userId: id });

    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const car = await Car.findOne({ id: booking.carId });
      return {
        ...booking.toObject(),
        car: car ? car.toObject() : null
      };
    }));

    let cars = [];
    if (user.role === 'Owner') {
      cars = await Car.find({ ownerId: id });
    }

    res.render('users/profile', {
      pageTitle: `Hồ Sơ - ${user.name}`,
      currentPage: 'users',
      user: user.toObject(),
      bookings: enrichedBookings,
      bookingPagination: {
        page: bookingPage,
        limit: bookingLimit,
        total: totalBookings,
        totalPages: Math.ceil(totalBookings / bookingLimit)
      },
      cars: cars.map(c => c.toObject())
    });
  } catch (error) {
    res.render('users/profile', {
      pageTitle: 'Hồ Sơ User',
      currentPage: 'users',
      errorMessage: 'Lỗi khi tải hồ sơ: ' + error.message
    });
  }
}

async function getEditUserForm(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findOne({ id });

    if (!user) {
      return res.render('users/edit', {
        pageTitle: 'Chỉnh Sửa User',
        currentPage: 'users',
        errorMessage: 'Không tìm thấy user này'
      });
    }

    res.render('users/edit', {
      pageTitle: `Chỉnh Sửa - ${user.name}`,
      currentPage: 'users',
      user: user.toObject()
    });
  } catch (error) {
    res.render('users/edit', {
      pageTitle: 'Chỉnh Sửa User',
      currentPage: 'users',
      errorMessage: 'Lỗi khi tải form chỉnh sửa: ' + error.message
    });
  }
}

async function submitEditUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, address, role, password } = req.body;

    const user = await User.findOne({ id });
    if (!user) {
      return res.render('users/edit', {
        pageTitle: 'Chỉnh Sửa User',
        currentPage: 'users',
        errorMessage: 'Không tìm thấy user này'
      });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.role = role;
    if (password && password.trim()) {
      user.password = password; 
    }
    user.updatedAt = new Date();

    await user.save();

    res.redirect(`/users/${id}?success=User được cập nhật thành công!`);
  } catch (error) {
    res.render('users/edit', {
      pageTitle: 'Chỉnh Sửa User',
      currentPage: 'users',
      errorMessage: 'Lỗi khi cập nhật user: ' + error.message,
      user: req.body
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await User.deleteOne({ id });
    res.redirect('/users?success=User được xóa thành công!');
  } catch (error) {
    res.redirect(`/users/${id}?error=Lỗi khi xóa user: ${error.message}`);
  }
}

module.exports = {
  getUsersList,
  getUserProfile,
  getEditUserForm,
  submitEditUser,
  deleteUser
};
