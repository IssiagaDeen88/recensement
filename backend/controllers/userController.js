const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getUsers = async (req, res) => {
  const users = await User.find({ role: 'AGENT' }).select('-password');
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, role, district, sector } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, phone, password: hashed, role, district, sector });
  res.status(201).json(user);
};

exports.updateUser = async (req, res) => {
  const updates = req.body;
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json(user);
};

exports.resetUserPassword = async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 8) {
    return res.status(400).json({ message: 'Mot de passe obligatoire (8 caractères minimum).' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json({ message: 'Mot de passe réinitialisé avec succès.' });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
  res.json({ message: 'Utilisateur supprimé' });
};
