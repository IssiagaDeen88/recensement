const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  manager: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('District', districtSchema);
