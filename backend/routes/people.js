const express = require('express');
const multer = require('multer');

const { protect, authorize } = require('../middleware/auth');
const {
  getPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  exportPeopleExcel,
  exportPeoplePdf,
} = require('../controllers/personController');

const router = express.Router();

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Mo
  },
});

router.use(protect);

router.get('/export/excel', authorize('ADMIN', 'AGENT'), exportPeopleExcel);
router.get('/export/pdf', authorize('ADMIN', 'AGENT'), exportPeoplePdf);
router.get('/', getPeople);
router.get('/:id', getPersonById);

// Ici on ajoute upload.single("photo")
router.post(
  '/',
  authorize('ADMIN', 'AGENT'),
  upload.single('photo'),
  createPerson
);

router.put(
  '/:id',
  authorize('ADMIN', 'AGENT'),
  upload.single('photo'),
  updatePerson
);

router.delete('/:id', authorize('ADMIN'), deletePerson);

module.exports = router;