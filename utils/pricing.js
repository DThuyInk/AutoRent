function calculateRentalCost(startDate, endDate, pricePerDay) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = end - start;
  const rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const totalCost = rentalDays * pricePerDay;

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    rentalDays: rentalDays,
    pricePerDay: pricePerDay,
    totalCost: totalCost
  };
}

module.exports = { calculateRentalCost };
