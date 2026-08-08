const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['M', 'F', 'Other'], required: true },
  birthDate: { type: Date },
  profession: { type: String },
  maritalStatus: { type: String },
  educationLevel: { type: String },
  phone: { type: String },
  relationToHead: { type: String, required: true },
  district: { type: String },
  sector: { type: String },
  photo: { type: String },
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Person', personSchema);
