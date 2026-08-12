const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Tentative de connexion:', email);

  try {
    const user = await User.findOne({ email });

    console.log('👤 Utilisateur trouvé:', !!user);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        message: 'Identifiants invalides'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log('🔑 Mot de passe valide:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Identifiants invalides'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET est manquant dans les variables Render');
      return res.status(500).json({
        message: 'Configuration serveur incorrecte'
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '12h'
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('❌ ERREUR LOGIN :');
    console.error(error);

    res.status(500).json({
      message: 'Erreur serveur'
    });
  }
};