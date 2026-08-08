const Household = require('../models/Household');
const Person = require('../models/Person');

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

exports.getHouseholds = async (req, res) => {
  const { search, district, sector, number, phone, agent } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { number: new RegExp(search, 'i') },
      { headName: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  if (district) filter.district = district;
  if (sector) filter.sector = sector;
  if (number) filter.number = number;
  if (phone) filter.phone = new RegExp(phone, 'i');
  if (agent) filter.agent = agent;

  const households = await Household.find(filter)
    .populate('agent', 'firstName lastName email')
    .populate('members', 'firstName lastName gender relationToHead');
  res.json(households);
};

exports.getHouseholdById = async (req, res) => {
  const household = await Household.findById(req.params.id)
    .populate('agent', 'firstName lastName email')
    .populate('members', 'firstName lastName gender relationToHead');
  if (!household) return res.status(404).json({ message: 'Ménage introuvable' });
  res.json(household);
};

exports.exportHouseholdsExcel = async (req, res) => {
  let ExcelJS;
  try {
    ExcelJS = requireOptional('exceljs');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const households = await Household.find()
    .populate('agent', 'firstName lastName email');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ménages');

  worksheet.columns = [
    { header: 'Numéro', key: 'number', width: 15 },
    { header: 'Chef de ménage', key: 'headName', width: 25 },
    { header: 'Adresse', key: 'address', width: 35 },
    { header: 'Quartier', key: 'district', width: 15 },
    { header: 'Secteur', key: 'sector', width: 15 },
    { header: 'Téléphone', key: 'phone', width: 18 },
    { header: 'Agent', key: 'agent', width: 25 },
    { header: 'Personnes', key: 'peopleCount', width: 12 },
    { header: 'Date de recensement', key: 'censusDate', width: 20 },
  ];

  households.forEach((household) => {
    worksheet.addRow({
      number: household.number,
      headName: household.headName,
      address: household.address,
      district: household.district,
      sector: household.sector,
      phone: household.phone || '—',
      agent: household.agent ? `${household.agent.firstName} ${household.agent.lastName}` : '—',
      peopleCount: household.peopleCount,
      censusDate: household.censusDate.toLocaleDateString(),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="households.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportHouseholdsPdf = async (req, res) => {
  let PDFDocument;
  try {
    PDFDocument = requireOptional('pdfkit');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const households = await Household.find()
    .populate('agent', 'firstName lastName email');

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="households.pdf"');

  doc.pipe(res);
  doc.fontSize(18).text('Liste des ménages', { align: 'center' });
  doc.moveDown(1);

  households.forEach((household, index) => {
    doc.fontSize(12).text(`${index + 1}. ${household.number} — ${household.headName}`);
    doc.fontSize(10).fillColor('gray').text(
      `Quartier: ${household.district} | Secteur: ${household.sector} | Téléphone: ${household.phone || '—'} | Agent: ${household.agent ? `${household.agent.firstName} ${household.agent.lastName}` : '—'}`
    );
    doc.text(`Adresse: ${household.address}`);
    doc.text(`Personnes: ${household.peopleCount} | Recensement: ${household.censusDate.toLocaleDateString()}`);
    doc.moveDown(0.8);
  });

  doc.end();
};

const generateHouseholdNumber = async (district, sector) => {
  const prefix = `${district.trim()[0].toUpperCase()}${sector.trim()[0].toUpperCase()}`;
  const existing = await Household.find({ number: new RegExp(`^${prefix}\\d{3}$`) }).sort({ number: -1 }).limit(1).select('number');
  let sequence = 1;
  if (existing.length > 0) {
    const lastNumber = existing[0].number;
    const lastSeq = parseInt(lastNumber.slice(2), 10);
    if (!Number.isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

exports.createHousehold = async (req, res) => {
  const { headName, address, district, sector, phone, censusDate, agent } = req.body;
  if (!district || !sector) {
    return res.status(400).json({ message: 'Quartier et secteur sont requis pour générer le numéro de ménage.' });
  }
  const number = await generateHouseholdNumber(district, sector);
  const assignedAgent = req.user.role === 'ADMIN' ? agent || req.user._id : req.user._id;
  const household = await Household.create({ number, headName, address, district, sector, phone, censusDate, agent: assignedAgent });
  res.status(201).json(household);
};

exports.updateHousehold = async (req, res) => {
  const household = await Household.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!household) return res.status(404).json({ message: 'Ménage introuvable' });
  res.json(household);
};

exports.deleteHousehold = async (req, res) => {
  const household = await Household.findByIdAndDelete(req.params.id);
  if (!household) return res.status(404).json({ message: 'Ménage introuvable' });
  await Person.deleteMany({ household: household._id });
  res.json({ message: 'Ménage supprimé' });
};
