const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSectors,
  createSector,
  updateSector,
  deleteSector,
  exportSectorsExcel,
  exportSectorsPdf,
} = require('../controllers/sectorController');

const router = express.Router();
router.use(protect);

router.get('/', authorize('ADMIN', 'AGENT'), getSectors);
router.get('/export/excel', authorize('ADMIN'), exportSectorsExcel);
router.get('/export/pdf', authorize('ADMIN'), exportSectorsPdf);
router.post('/', authorize('ADMIN'), createSector);
router.put('/:id', authorize('ADMIN'), updateSector);
router.delete('/:id', authorize('ADMIN'), deleteSector);

module.exports = router;
