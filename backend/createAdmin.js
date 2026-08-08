const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const parseArgs = () => {
  return process.argv.slice(2).reduce((acc, arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    acc[key] = rest.join('=');
    return acc;
  }, {});
};

const args = parseArgs();

const firstName = args.firstName || process.env.ADMIN_FIRST_NAME || 'Admin';
const lastName = args.lastName || process.env.ADMIN_LAST_NAME || 'User';
const email = args.email || process.env.ADMIN_EMAIL;
const password = args.password || process.env.ADMIN_PASSWORD;
const phone = args.phone || process.env.ADMIN_PHONE || '';
const role = args.role || process.env.ADMIN_ROLE || 'ADMIN';
const status = args.status || process.env.ADMIN_STATUS || 'ACTIVE';

const usage = () => {
  console.log(`Usage: node createAdmin.js --email=admin@example.com --password=YourPassword123`);
  console.log('Optional args: --firstName, --lastName, --phone, --role, --status');
  console.log('Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
};

const run = async () => {
  if (!email || !password) {
    console.error('Erreur : email et password sont requis.');
    usage();
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error(`Un utilisateur avec l'email ${email} existe déjà.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    password: hashedPassword,
    role,
    status,
  });

  console.log('Administrateur créé avec succès :');
  console.log({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
  });
  process.exit(0);
};

run().catch((error) => {
  console.error('Erreur lors de la création de l administrateur :', error.message);
  process.exit(1);
});
