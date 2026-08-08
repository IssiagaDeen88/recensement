const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getHouseholds,
  getHouseholdById,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  exportHouseholdsExcel,
  exportHouseholdsPdf,
} = require('../controllers/householdController');

const router = express.Router();

router.use(protect);

router.get('/', getHouseholds);
router.get('/export/excel', exportHouseholdsExcel);
router.get('/export/pdf', exportHouseholdsPdf);
router.get('/:id', getHouseholdById);
router.post('/', authorize('ADMIN', 'AGENT'), createHousehold);
router.put('/:id', authorize('ADMIN', 'AGENT'), updateHousehold);
router.delete('/:id', authorize('ADMIN'), deleteHousehold);

module.exports = router;
