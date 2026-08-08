const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/reset-password', resetUserPassword);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
