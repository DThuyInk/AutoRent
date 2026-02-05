const { getContractsData } = require('../services/contractService');

async function getContracts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status, userId, carId, bookingId } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (carId) filter.carId = carId;
    if (bookingId) filter.bookingId = bookingId;

    const { contracts, total } = await getContractsData(filter, { skip, limit });

    res.json({
      success: true,
      data: contracts,
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
      message: 'Lỗi khi lấy danh sách hợp đồng',
      error: error.message
    });
  }
}

module.exports = {
  getContracts
};
