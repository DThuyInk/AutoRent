const { 
  getBookingsData, 
  createBookingData,
  getBookingDetailData,
  getOwnerBookingsData,
  getBookingsByStatusData
} = require('../services/bookingService');

async function getBookings(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, userId, carId } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (carId) filter.carId = carId;

    const { bookings, total } = await getBookingsData(filter, { skip, limit });

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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn đặt',
      error: error.message
    });
  }
}

async function createBooking(req, res) {
  try {
    const { userId, carId, startDate, endDate } = req.body;

    if (!userId?.trim()) {
      return res.status(400).json({ success: false, message: 'userId không được rỗng' });
    }

    const newBooking = await createBookingData(userId, carId, startDate, endDate);

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    if (error.message.includes('không được rỗng')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes('không sẵn sàng')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn đặt',
      error: error.message
    });
  }
}

async function getBookingDetail(req, res) {
  try {
    const { id } = req.params;

    const bookingDetail = await getBookingDetailData(id);

    res.json({
      success: true,
      data: bookingDetail
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
      message: 'Lỗi khi lấy chi tiết đơn đặt',
      error: error.message
    });
  }
}

async function getOwnerBookings(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const { bookings, total } = await getOwnerBookingsData(id, { skip, limit });

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
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách booking của owner',
      error: error.message
    });
  }
}

async function getBookingsByStatus(req, res) {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const { bookings, total } = await getBookingsByStatusData(status, { skip, limit });

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
    if (error.message.includes('không hợp lệ')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách booking theo status',
      error: error.message
    });
  }
}

module.exports = {
  getBookings,
  createBooking,
  getBookingDetail,
  getOwnerBookings,
  getBookingsByStatus
};
