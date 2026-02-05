const { getCarsData } = require('../services/carService');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');

async function getCarsList(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const searchQuery = req.query.search;

    const skip = (page - 1) * limit;
    let filter = {};

    if (res.locals.user && res.locals.user.role === 'Owner') {
      filter.ownerId = res.locals.user.id;
    }

    if (status) filter.status = status;
    if (searchQuery) {
      filter.$or = [
        { licensePlate: { $regex: searchQuery, $options: 'i' } },
        { brand: { $regex: searchQuery, $options: 'i' } },
        { model: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const cars = await Car.find(filter).skip(skip).limit(limit);
    const total = await Car.countDocuments(filter);

    const enrichedCars = await Promise.all(cars.map(async (car) => {
      const owner = await User.findOne({ id: car.ownerId });
      return {
        ...car.toObject(),
        ownerName: owner ? owner.name : 'Unknown'
      };
    }));

    res.render('cars/list', {
      pageTitle: 'Danh Sách Xe',
      currentPage: 'cars',
      cars: enrichedCars,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filter: { status },
      searchQuery
    });
  } catch (error) {
    res.render('cars/list', {
      pageTitle: 'Danh Sách Xe',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi tải danh sách xe: ' + error.message,
      cars: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 1 }
    });
  }
}

async function getCarDetail(req, res) {
  try {
    const { id } = req.params;
    const car = await Car.findOne({ id });

    if (!car) {
      return res.render('cars/detail', {
        pageTitle: 'Chi Tiết Xe',
        currentPage: 'cars',
        errorMessage: 'Không tìm thấy xe này'
      });
    }

    const owner = await User.findOne({ id: car.ownerId });

    const bookings = await Booking.find({ carId: id });
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      const customer = await User.findOne({ id: booking.userId });
      return {
        ...booking.toObject(),
        customerName: customer ? customer.name : 'Unknown'
      };
    }));

    res.render('cars/detail', {
      pageTitle: `Chi Tiết Xe - ${car.brand} ${car.model}`,
      currentPage: 'cars',
      car: { ...car.toObject(), ownerName: owner ? owner.name : 'Unknown' },
      bookings: enrichedBookings
    });
  } catch (error) {
    res.render('cars/detail', {
      pageTitle: 'Chi Tiết Xe',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi tải chi tiết xe: ' + error.message
    });
  }
}

async function getCreateCarForm(req, res) {
  try {
    const owners = await User.find({ role: 'Owner' });

    res.render('cars/create', {
      pageTitle: 'Thêm Xe Mới',
      currentPage: 'cars',
      owners,
      user: res.locals.user  
    });
  } catch (error) {
    res.render('cars/create', {
      pageTitle: 'Thêm Xe Mới',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi tải form tạo xe: ' + error.message,
      owners: [],
      user: res.locals.user
    });
  }
}

async function submitCreateCar(req, res) {
  try {
    let { licensePlate, brand, model, year, color, pricePerDay, ownerId } = req.body;

    if (res.locals.user && res.locals.user.role === 'Owner') {
      ownerId = res.locals.user.id;
    }

    const existingCar = await Car.findOne({ licensePlate });
    if (existingCar) {
      const owners = await User.find({ role: 'Owner' });
      return res.render('cars/create', {
        pageTitle: 'Thêm Xe Mới',
        currentPage: 'cars',
        errorMessage: 'Biển số xe này đã tồn tại',
        owners,
        user: res.locals.user
      });
    }

    const totalCars = await Car.countDocuments();
    const carId = 'C' + String(totalCars + 1).padStart(3, '0');

    const newCar = new Car({
      id: carId,
      licensePlate,
      brand,
      model,
      year: parseInt(year),
      color,
      pricePerDay: parseFloat(pricePerDay),
      ownerId,
      status: 'available'
    });

    await newCar.save();

    res.redirect(`/cars/${carId}?success=Xe được thêm thành công!`);
  } catch (error) {
    const owners = await User.find({ role: 'Owner' });
    res.render('cars/create', {
      pageTitle: 'Thêm Xe Mới',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi tạo xe: ' + error.message,
      owners
    });
  }
}

async function getEditCarForm(req, res) {
  try {
    const { id } = req.params;
    const car = await Car.findOne({ id });

    if (!car) {
      return res.render('cars/edit', {
        pageTitle: 'Chỉnh Sửa Xe',
        currentPage: 'cars',
        errorMessage: 'Không tìm thấy xe này'
      });
    }

    const owners = await User.find({ role: 'Owner' });

    res.render('cars/edit', {
      pageTitle: `Chỉnh Sửa - ${car.brand} ${car.model}`,
      currentPage: 'cars',
      car: car.toObject(),
      owners
    });
  } catch (error) {
    res.render('cars/edit', {
      pageTitle: 'Chỉnh Sửa Xe',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi tải form chỉnh sửa: ' + error.message
    });
  }
}

async function submitEditCar(req, res) {
  try {
    const { id } = req.params;
    const { brand, model, year, color, pricePerDay, ownerId, status } = req.body;

    const car = await Car.findOne({ id });
    if (!car) {
      return res.render('cars/edit', {
        pageTitle: 'Chỉnh Sửa Xe',
        currentPage: 'cars',
        errorMessage: 'Không tìm thấy xe này'
      });
    }

    car.brand = brand;
    car.model = model;
    car.year = parseInt(year);
    car.color = color;
    car.pricePerDay = parseFloat(pricePerDay);
    car.ownerId = ownerId;
    car.status = status;
    car.updatedAt = new Date();

    await car.save();

    res.redirect(`/cars/${id}?success=Xe được cập nhật thành công!`);
  } catch (error) {
    res.render('cars/edit', {
      pageTitle: 'Chỉnh Sửa Xe',
      currentPage: 'cars',
      errorMessage: 'Lỗi khi cập nhật xe: ' + error.message,
      car: req.body
    });
  }
}

async function deleteCar(req, res) {
  try {
    const { id } = req.params;
    await Car.deleteOne({ id });
    res.redirect('/cars?success=Xe được xóa thành công!');
  } catch (error) {
    res.redirect(`/cars/${id}?error=Lỗi khi xóa xe: ${error.message}`);
  }
}

module.exports = {
  getCarsList,
  getCarDetail,
  getCreateCarForm,
  submitCreateCar,
  getEditCarForm,
  submitEditCar,
  deleteCar
};
