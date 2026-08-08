const fs = require('fs');
const path = require('path');
const Person = require('../models/Person');
const Household = require('../models/Household');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

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

exports.getPeople = async (req, res) => {
  const { search, household, relation, phone, district, sector } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { relationToHead: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }
  if (household) filter.household = household;
  if (relation) filter.relationToHead = new RegExp(relation, 'i');
  if (phone) filter.phone = new RegExp(phone, 'i');
  if (district) filter.district = district;
  if (sector) filter.sector = sector;

  const people = await Person.find(filter).populate('household', 'number headName district sector');
  res.json(people);
};

exports.exportPeopleExcel = async (req, res) => {
  let ExcelJS;
  try {
    ExcelJS = requireOptional('exceljs');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const { search, household, relation, phone, district, sector } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { relationToHead: new RegExp(search, 'i') },
      { phone: new RegExp(phone, 'i') },
    ];
  }
  if (household) filter.household = household;
  if (relation) filter.relationToHead = new RegExp(relation, 'i');
  if (phone) filter.phone = new RegExp(phone, 'i');
  if (district) filter.district = district;
  if (sector) filter.sector = sector;

  const people = await Person.find(filter).populate('household', 'number headName district sector');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Personnes');

  worksheet.columns = [
    { header: 'Photo', key: 'photo', width: 15 },
    { header: 'Nom complet', key: 'fullName', width: 30 },
    { header: 'Relation', key: 'relation', width: 18 },
    { header: 'Quartier', key: 'district', width: 18 },
    { header: 'Secteur', key: 'sector', width: 18 },
    { header: 'Ménage', key: 'household', width: 24 },
    { header: 'Téléphone', key: 'phone', width: 18 },
    { header: 'Date de naissance', key: 'birthDate', width: 18 },
    { header: 'Profession', key: 'profession', width: 20 },
    { header: 'État civil', key: 'maritalStatus', width: 18 },
    { header: 'Éducation', key: 'educationLevel', width: 20 },
  ];

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const row = worksheet.addRow({
      photo: '',
      fullName: `${person.firstName} ${person.lastName}`,
      relation: person.relationToHead,
      district: person.district || person.household?.district || '—',
      sector: person.sector || person.household?.sector || '—',
      household: person.household ? `${person.household.number} - ${person.household.headName}` : '—',
      phone: person.phone || '—',
      birthDate: person.birthDate ? new Date(person.birthDate).toLocaleDateString() : '—',
      profession: person.profession || '—',
      maritalStatus: person.maritalStatus || '—',
      educationLevel: person.educationLevel || '—',
    });
    row.height = 60;

    if (person.photo) {
      const photoPath = path.join(UPLOADS_DIR, path.basename(person.photo));
      if (fs.existsSync(photoPath)) {
        const ext = path.extname(person.photo).replace('.', '').toLowerCase();
        const imageId = workbook.addImage({ filename: photoPath, extension: ext || 'jpeg' });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: i + 1 },
          br: { col: 1, row: i + 2 },
        });
      }
    }
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="people.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportPeoplePdf = async (req, res) => {
  let PDFDocument;
  try {
    PDFDocument = requireOptional('pdfkit');
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  const { search, household, relation, phone, district, sector } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { relationToHead: new RegExp(search, 'i') },
      { phone: new RegExp(phone, 'i') },
    ];
  }
  if (household) filter.household = household;
  if (relation) filter.relationToHead = new RegExp(relation, 'i');
  if (phone) filter.phone = new RegExp(phone, 'i');
  if (district) filter.district = district;
  if (sector) filter.sector = sector;

  const people = await Person.find(filter).populate('household', 'number headName district sector');

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="people.pdf"');

  doc.pipe(res);
  doc.fontSize(18).text('Liste des personnes', { align: 'center' });
  doc.moveDown(1);

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const startY = doc.y;
    const photoSize = 60;
    const leftMargin = 40;
    const textX = leftMargin + photoSize + 10;

    if (person.photo) {
      const photoPath = path.join(UPLOADS_DIR, path.basename(person.photo));
      if (fs.existsSync(photoPath)) {
        try {
          doc.image(photoPath, leftMargin, startY, { width: photoSize, height: photoSize });
        } catch (e) { /* image invalide, on ignore */ }
      }
    }

    doc.fontSize(12).fillColor('black').text(
      `${i + 1}. ${person.firstName} ${person.lastName} (${person.relationToHead})`,
      textX, startY, { width: 450 }
    );
    doc.fontSize(10).fillColor('gray').text(
      `Quartier: ${person.district || person.household?.district || '—'} | Secteur: ${person.sector || person.household?.sector || '—'} | Ménage: ${person.household ? person.household.number : '—'} | Tel: ${person.phone || '—'}`,
      textX, null, { width: 450 }
    );
    doc.text(
      `Profession: ${person.profession || '—'} | État civil: ${person.maritalStatus || '—'} | Éducation: ${person.educationLevel || '—'}`,
      textX, null, { width: 450 }
    );

    const endY = doc.y;
    doc.y = Math.max(endY, startY + photoSize + 5);
    doc.x = leftMargin;
    doc.moveDown(0.5);
  }

  doc.end();
};

exports.getPersonById = async (req, res) => {
  const person = await Person.findById(req.params.id).populate('household', 'number headName district sector');
  if (!person) return res.status(404).json({ message: 'Personne introuvable' });
  res.json(person);
};

exports.createPerson = async (req, res) => {
  try {
    const {
      household: householdId,
      firstName,
      lastName,
      gender,
      birthDate,
      profession,
      maritalStatus,
      educationLevel,
      phone,
      relationToHead,
      district,
      sector,
    } = req.body;

    const household = await Household.findById(householdId);

    if (!household) {
      return res.status(404).json({
        message: 'Ménage introuvable',
      });
    }

    // Si Multer est utilisé
    const photo = req.file ? req.file.filename : req.body.photo || null;

    const person = await Person.create({
      household: householdId,
      firstName,
      lastName,
      gender,
      birthDate,
      profession,
      maritalStatus,
      educationLevel,
      phone,
      relationToHead,
      district: district || household.district,
      sector: sector || household.sector,
      photo,
    });

    await Household.findByIdAndUpdate(householdId, {
      $inc: { peopleCount: 1 },
    });

    res.status(201).json(person);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updatePerson = async (req, res) => {
  try {

    const data = {
      ...req.body,
    };

    if (req.file) {
      data.photo = req.file.filename;
    }

    const person = await Person.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!person) {
      return res.status(404).json({
        message: 'Personne introuvable',
      });
    }

    res.json(person);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deletePerson = async (req, res) => {
  const person = await Person.findByIdAndDelete(req.params.id);
  if (!person) return res.status(404).json({ message: 'Personne introuvable' });
  await Household.findByIdAndUpdate(person.household, { $inc: { peopleCount: -1 } });
  res.json({ message: 'Personne supprimée' });
};
