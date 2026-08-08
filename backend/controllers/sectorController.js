const Sector = require('../models/Sector');
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

exports.getSectors = async (req, res) => {
  const sectors = await Sector.find();
  res.json(sectors);
};

exports.createSector = async (req, res) => {
  const sector = await Sector.create(req.body);
  await logAction(req.user._id, `Création du secteur ${sector.name}`);
  res.status(201).json(sector);
};

exports.updateSector = async (req, res) => {
  const sector = await Sector.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sector) return res.status(404).json({ message: 'Secteur introuvable' });
  await logAction(req.user._id, `Modification du secteur ${sector.name}`);
  res.json(sector);
};

exports.deleteSector = async (req, res) => {
  const sector = await Sector.findByIdAndDelete(req.params.id);
  if (!sector) return res.status(404).json({ message: 'Secteur introuvable' });
  await logAction(req.user._id, `Suppression du secteur ${sector.name}`);
  res.json({ message: 'Secteur supprimé' });
};

exports.exportSectorsExcel = async (req, res) => {
  let ExcelJS;
  try {
    ExcelJS = requireOptional('exceljs');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const sectors = await Sector.find();
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Secteurs');

  worksheet.columns = [
    { header: 'Nom du secteur', key: 'name', width: 30 },
    { header: 'Responsable', key: 'manager', width: 30 },
    { header: 'Date de création', key: 'createdAt', width: 20 },
  ];

  sectors.forEach((sector) => {
    worksheet.addRow({
      name: sector.name,
      manager: sector.manager || '—',
      createdAt: sector.createdAt.toLocaleDateString(),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="sectors.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportSectorsPdf = async (req, res) => {
  let PDFDocument;
  try {
    PDFDocument = requireOptional('pdfkit');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const sectors = await Sector.find();
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="sectors.pdf"');

  doc.pipe(res);
  doc.fontSize(18).text('Liste des secteurs', { align: 'center' });
  doc.moveDown(1);

  sectors.forEach((sector, index) => {
    doc.fontSize(12).text(`${index + 1}. ${sector.name}`);
    doc.fontSize(10).fillColor('gray').text(`Responsable: ${sector.manager || '—'} | Créé le: ${sector.createdAt.toLocaleDateString()}`);
    doc.moveDown(0.5);
  });

  doc.end();
};
