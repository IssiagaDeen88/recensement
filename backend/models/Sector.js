const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manager: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Sector', sectorSchema);
