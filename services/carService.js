const Car = require('../models/Car');

// Service function - Get cars data
async function getCarsData(filter, pagination) {
  const cars = await Car.find(filter).skip(pagination.skip).limit(pagination.limit);
  const total = await Car.countDocuments(filter);
  
  return { cars, total };
}

module.exports = { getCarsData };
