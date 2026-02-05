const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');
const { checkAvailability } = require('../utils/availability');
const { calculateRentalCost } = require('../utils/pricing');

async function getBookingsList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const userId = req.query.userId;
    const carId = req.query.carId;

    const skip = (page - 1) * limit;
    let filter = {};

    if (res.locals.user && res.locals.user.role === 'User') {
      filter.userId = res.locals.user.id;
    } else if (res.locals.user && res.locals.user.role === 'Owner') {
      const ownerId = res.locals.user.id;
      console.log(`\n=== Owner Booking Filter ===`);
      console.log(`Owner ID: ${ownerId}`);
      
      const ownerCars = await Car.find({ ownerId: ownerId });
      console.log(`Found ${ownerCars.length} cars for this owner`);
      
      if (ownerCars.length > 0) {
        ownerCars.forEach(car => console.log(`  - Car ID: ${car.id}, License: ${car.licensePlate}`));
      }
      
      const carIds = ownerCars.map(car => car.id);
      if (carIds.length > 0) {
        filter.carId = { $in: carIds };
        console.log(`Filter applied: carId in [${carIds.join(', ')}]`);
      } else {
        filter.carId = { $in: [] };
        console.log(`Owner has no cars, returning empty`);
      }
      console.log(`=== End Filter ===\n`);
    } else if (res.locals.user && res.locals.user.role === 'Admin') {
      if (userId) filter.userId = userId;
    }

    if (status) filter.status = status;
    if (carId && res.locals.user && res.locals.user.role !== 'Owner') {
      filter.carId = carId;
    }

    const bookings = await Booking.find(filter).skip(skip).limit(limit);
    const total = await Booking.countDocuments(filter);

    console.log(`Query filter:`, filter);
    console.log(`Found ${total} bookings total, returning ${bookings.length} on this page`);

    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const user = await User.findOne({ id: booking.userId });
      const car = await Car.findOne({ id: booking.carId });
      return {
        ...booking.toObject(),
        userName: user ? user.name : 'Unknown',
        carLicense: car ? car.licensePlate : 'Unknown'
      };
    }));

    res.render('bookings/list', {
      pageTitle: 'Danh Sách Booking',
      currentPage: 'bookings',
      bookings: enrichedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filter: { status, userId, carId }
    });
  } catch (error) {
    res.render('bookings/list', {
      pageTitle: 'Danh Sách Booking',
      currentPage: 'bookings',
      errorMessage: 'Lỗi khi tải danh sách booking: ' + error.message,
      bookings: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    });
  }
}

async function getCreateBookingForm(req, res) {
  try {
    const users = await User.find({});
    const cars = await Car.find({});

    res.render('bookings/create', {
      pageTitle: 'Tạo Booking Mới',
      currentPage: 'bookingCreate',
      users,
      cars,
      user: res.locals.user  // Pass current user info
    });
  } catch (error) {
    res.render('bookings/create', {
      pageTitle: 'Tạo Booking Mới',
      currentPage: 'bookingCreate',
      errorMessage: 'Lỗi khi tải form tạo booking: ' + error.message,
      users: [],
      cars: [],
      user: res.locals.user
    });
  }
}

async function submitCreateBooking(req, res) {
  try {
    let { userId, carId, startDate, endDate } = req.body;

    if (res.locals.user && res.locals.user.role === 'User') {
      userId = res.locals.user.id;
    }

    if (!userId || !userId.trim()) {
      const users = await User.find({});
      const cars = await Car.find({});
      return res.render('bookings/create', {
        pageTitle: 'Tạo Booking Mới',
        currentPage: 'bookings',
        errorMessage: 'User ID không được rỗng',
        users,
        cars,
        user: res.locals.user
      });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      const users = await User.find({});
      const cars = await Car.find({});
      return res.render('bookings/create', {
        pageTitle: 'Tạo Booking Mới',
        currentPage: 'bookings',
        errorMessage: 'Người dùng không tồn tại',
        users,
        cars
      });
    }

    const car = await Car.findOne({ id: carId });
    if (!car) {
      const users = await User.find({});
      const cars = await Car.find({});
      return res.render('bookings/create', {
        pageTitle: 'Tạo Booking Mới',
        currentPage: 'bookings',
        errorMessage: 'Xe không tồn tại',
        users,
        cars
      });
    }

    const existingBookings = await Booking.find({ carId });
    if (checkAvailability(carId, startDate, endDate, existingBookings)) {
      const users = await User.find({});
      const cars = await Car.find({});
      return res.render('bookings/create', {
        pageTitle: 'Tạo Booking Mới',
        currentPage: 'bookings',
        errorMessage: 'Xe không sẵn sàng trong khoảng thời gian này',
        users,
        cars
      });
    }

    const cost = calculateRentalCost(startDate, endDate, car.pricePerDay);

    const totalBookings = await Booking.countDocuments();
    const bookingId = 'B' + String(totalBookings + 1).padStart(3, '0');

    const newBooking = new Booking({
      id: bookingId,
      userId,
      carId,
      startDate: cost.startDate,
      endDate: cost.endDate,
      rentalDays: cost.rentalDays,
      pricePerDay: cost.pricePerDay,
      totalCost: cost.totalCost,
      status: 'pending'
    });

    await newBooking.save();

    res.redirect(`/bookings/${bookingId}?success=Booking được tạo thành công!`);
  } catch (error) {
    const users = await User.find({});
    const cars = await Car.find({});
    res.render('bookings/create', {
      pageTitle: 'Tạo Booking Mới',
      currentPage: 'bookings',
      errorMessage: 'Lỗi khi tạo booking: ' + error.message,
      users,
      cars
    });
  }
}

async function getBookingDetail(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id });

    if (!booking) {
      return res.render('bookings/detail', {
        pageTitle: 'Chi Tiết Booking',
        currentPage: 'bookings',
        errorMessage: 'Không tìm thấy booking này'
      });
    }

    const user = await User.findOne({ id: booking.userId });
    const car = await Car.findOne({ id: booking.carId });

    res.render('bookings/detail', {
      pageTitle: `Chi Tiết Booking - ${id}`,
      currentPage: 'bookings',
      booking: {
        ...booking.toObject(),
        user: user ? user.toObject() : null,
        car: car ? car.toObject() : null
      }
    });
  } catch (error) {
    res.render('bookings/detail', {
      pageTitle: 'Chi Tiết Booking',
      currentPage: 'bookings',
      errorMessage: 'Lỗi khi tải chi tiết booking: ' + error.message
    });
  }
}

async function getEditBookingForm(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ id });

    if (!booking) {
      return res.render('bookings/edit', {
        pageTitle: 'Chỉnh Sửa Booking',
        currentPage: 'bookings',
        errorMessage: 'Không tìm thấy booking này'
      });
    }

    res.render('bookings/edit', {
      pageTitle: `Chỉnh Sửa Booking - ${id}`,
      currentPage: 'bookings',
      booking: booking.toObject()
    });
  } catch (error) {
    res.render('bookings/edit', {
      pageTitle: 'Chỉnh Sửa Booking',
      currentPage: 'bookings',
      errorMessage: 'Lỗi khi tải form chỉnh sửa: ' + error.message
    });
  }
}

async function submitEditBooking(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOne({ id });
    if (!booking) {
      return res.render('bookings/edit', {
        pageTitle: 'Chỉnh Sửa Booking',
        currentPage: 'bookings',
        errorMessage: 'Không tìm thấy booking này'
      });
    }

    booking.status = status;
    await booking.save();

    res.redirect(`/bookings/${id}?success=Booking được cập nhật thành công!`);
  } catch (error) {
    res.render('bookings/edit', {
      pageTitle: 'Chỉnh Sửa Booking',
      currentPage: 'bookings',
      errorMessage: 'Lỗi khi cập nhật booking: ' + error.message,
      booking: req.body
    });
  }
}

async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    await Booking.deleteOne({ id });
    res.redirect('/bookings?success=Booking được xóa thành công!');
  } catch (error) {
    res.redirect(`/bookings/${id}?error=Lỗi khi xóa booking: ${error.message}`);
  }
}

module.exports = {
  getBookingsList,
  getCreateBookingForm,
  submitCreateBooking,
  getBookingDetail,
  getEditBookingForm,
  submitEditBooking,
  deleteBooking
};
