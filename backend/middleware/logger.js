const Log = require('../models/Log');

exports.logAction = async (userId, action) => {
  try {
    await Log.create({ user: userId, action });
  } catch (error) {
    console.error('Erreur de journalisation:', error.message);
  }
};
