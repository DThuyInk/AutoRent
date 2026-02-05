const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { 
    type: String,
    required: true 
  },
  carId: { 
    type: String,
    required: true 
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  rentalDays: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
