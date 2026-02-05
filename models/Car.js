const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  licensePlate: { type: String, unique: true, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  color: String,
  pricePerDay: { type: Number, required: true },
  ownerId: {
    type: String,
    required: true
  },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'maintenance'],
    default: 'available'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', carSchema);
