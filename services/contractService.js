const Contract = require('../models/Contract');

// Service function - Get contracts data
async function getContractsData(filter, pagination) {
  const contracts = await Contract.find(filter)
    .skip(pagination.skip)
    .limit(pagination.limit);
  const total = await Contract.countDocuments(filter);
  
  return { contracts, total };
}

// Service function - Create contract
async function createContract(bookingData) {
  try {
    console.log('Creating contract for booking:', bookingData.id);
    const totalContracts = await Contract.countDocuments();
    const contractId = 'CT' + String(totalContracts + 1).padStart(3, '0');

    const newContract = new Contract({
      id: contractId,
      bookingId: bookingData.id,
      userId: bookingData.userId,
      carId: bookingData.carId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      rentalDays: bookingData.rentalDays,
      pricePerDay: bookingData.pricePerDay,
      totalCost: bookingData.totalCost,
      status: 'active'
    });

    await newContract.save();
    console.log('Contract created successfully:', contractId);
    return newContract;
  } catch (error) {
    console.error('Lỗi khi tạo hợp đồng:', error.message);
    throw error;
  }
}

module.exports = {
  getContractsData,
  createContract
};
