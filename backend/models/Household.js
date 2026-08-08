const mongoose = require('mongoose');

const householdSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  headName: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  sector: { type: String, required: true },
  phone: { type: String },
  peopleCount: { type: Number, default: 0 },
  censusDate: { type: Date, default: Date.now },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Household', householdSchema);
