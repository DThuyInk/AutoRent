function checkAvailability(carId, startDate, endDate, bookings) {
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');

  console.log(`Checking availability for car ${carId} from ${start} to ${end}`);
  console.log(`Found ${bookings.length} existing bookings for this car`);

  for (const booking of bookings) {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    
    console.log(`Existing booking: ${bookingStart} to ${bookingEnd}`);

    if (start < bookingEnd && end > bookingStart) {
      console.log('Conflict detected!');
      return true;
    }
  }

  console.log('No conflicts found');
  return false;
}

module.exports = { checkAvailability };

