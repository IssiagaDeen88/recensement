const District = require('../models/District');
const { logAction } = require('../middleware/logger');

const requireOptional = (moduleName) => {
  try {
    return require(moduleName);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Module "${moduleName}" manquant. Installez-le avec npm install ${moduleName}`);
    }
    throw err;
  }
};

exports.getDistricts = async (req, res) => {
  const districts = await District.find();
  res.json(districts);
};

exports.createDistrict = async (req, res) => {
  const district = await District.create(req.body);
  await logAction(req.user._id, `Création du quartier ${district.name}`);
  res.status(201).json(district);
};

exports.updateDistrict = async (req, res) => {
  const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!district) return res.status(404).json({ message: 'Quartier introuvable' });
  await logAction(req.user._id, `Modification du quartier ${district.name}`);
  res.json(district);
};

exports.deleteDistrict = async (req, res) => {
  const district = await District.findByIdAndDelete(req.params.id);
  if (!district) return res.status(404).json({ message: 'Quartier introuvable' });
  await logAction(req.user._id, `Suppression du quartier ${district.name}`);
  res.json({ message: 'Quartier supprimé' });
};

exports.exportDistrictsExcel = async (req, res) => {
  let ExcelJS;
  try {
    ExcelJS = requireOptional('exceljs');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const districts = await District.find();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Quartiers');

  worksheet.columns = [
    { header: 'Nom du quartier', key: 'name', width: 30 },
    { header: 'Responsable', key: 'manager', width: 30 },
    { header: 'Date de création', key: 'createdAt', width: 20 },
  ];

  districts.forEach((district) => {
    worksheet.addRow({
      name: district.name,
      manager: district.manager || '—',
      createdAt: district.createdAt.toLocaleDateString(),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="districts.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportDistrictsPdf = async (req, res) => {
  let PDFDocument;
  try {
    PDFDocument = requireOptional('pdfkit');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const districts = await District.find();
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="districts.pdf"');

  doc.pipe(res);
  doc.fontSize(18).text('Liste des quartiers', { align: 'center' });
  doc.moveDown(1);

  districts.forEach((district, index) => {
    doc.fontSize(12).text(`${index + 1}. ${district.name}`);
    doc.fontSize(10).fillColor('gray').text(`Responsable: ${district.manager || '—'} | Créé le: ${district.createdAt.toLocaleDateString()}`);
    doc.moveDown(0.5);
  });

  doc.end();
};
