const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  exportDistrictsExcel,
  exportDistrictsPdf,
} = require('../controllers/districtController');

const router = express.Router();
router.use(protect);

router.get('/', authorize('ADMIN', 'AGENT'), getDistricts);
router.get('/export/excel', authorize('ADMIN'), exportDistrictsExcel);
router.get('/export/pdf', authorize('ADMIN'), exportDistrictsPdf);
router.post('/', authorize('ADMIN'), createDistrict);
router.put('/:id', authorize('ADMIN'), updateDistrict);
router.delete('/:id', authorize('ADMIN'), deleteDistrict);

module.exports = router;
