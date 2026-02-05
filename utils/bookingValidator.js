function validateBooking(booking) {
  if (!booking.carId || booking.carId.trim() === '') {
    throw new Error('Lỗi: carId không được rỗng');
  }

  if (!booking.startDate) {
    throw new Error('Lỗi: startDate không được rỗng');
  }

  if (!booking.endDate) {
    throw new Error('Lỗi: endDate không được rỗng');
  }

  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);

  if (endDate <= startDate) {
    throw new Error('Lỗi: Ngày kết thúc phải sau ngày bắt đầu');
  }

  return true;
}

module.exports = { validateBooking };
