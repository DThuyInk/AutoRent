const { getCarsData } = require('../services/carService');

async function getCars(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const skip = (page - 1) * limit;
    const filter = status ? { status } : {};

    const { cars, total } = await getCarsData(filter, { skip, limit });

    res.json({
      success: true,
      data: cars,
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
      message: 'Lỗi khi lấy danh sách xe',
      error: error.message
    });
  }
}

module.exports = { getCars };
