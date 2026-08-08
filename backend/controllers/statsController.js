const Household = require('../models/Household');
const Person = require('../models/Person');
const User = require('../models/User');

exports.getDashboardStats = async (req, res) => {
  const householdsCount = await Household.countDocuments();
  const peopleCount = await Person.countDocuments();
  const agentsCount = await User.countDocuments({ role: 'AGENT', status: 'ACTIVE' });
  const byDistrict = await Household.aggregate([
    { $group: { _id: '$district', count: { $sum: 1 } } },
  ]);
  const bySector = await Household.aggregate([
    { $group: { _id: '$sector', count: { $sum: 1 } } },
  ]);
  res.json({ householdsCount, peopleCount, agentsCount, byDistrict, bySector });
};
