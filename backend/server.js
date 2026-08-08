const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const householdRoutes = require('./routes/households');
const personRoutes = require('./routes/people');
const statsRoutes = require('./routes/stats');
const sectorRoutes = require('./routes/sectors');
const districtRoutes = require('./routes/districts');

const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();

/* ==========================
   MIDDLEWARES
========================== */

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Augmenter la taille maximale des requêtes JSON
app.use(express.json({
  limit: '10mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use(morgan('dev'));

// Dossier des fichiers uploadés
app.use('/uploads', express.static('uploads'));

/* ==========================
   ROUTES
========================== */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/people', personRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/districts', districtRoutes);

/* ==========================
   ROUTE D'ACCUEIL
========================== */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Plateforme de recensement de Dounsy - Backend actif'
  });
});

/* ==========================
   GESTION DES ERREURS
========================== */

app.use(errorHandler);

/* ==========================
   LANCEMENT DU SERVEUR
========================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});