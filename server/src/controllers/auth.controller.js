import User from '../models/User.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement par le modèle)
    const user = await User.create({
      name,
      email,
      password,
      // On autorise le rôle 'agent' ou 'client' à l'inscription, mais pas 'admin' pour des raisons de sécurité
      role: role === 'agent' ? 'agent' : 'client', 
    });

    // Générer les tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // On renvoie l'utilisateur sans le mot de passe
    user.password = undefined;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Connexion de l'utilisateur
// @route   POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur et inclure le mot de passe (car on a mis select: false dans le modèle)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer les tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.password = undefined;

    res.status(200).json({
      message: 'Connexion réussie',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

// @desc    Rafraîchir l'Access Token
// @route   POST /api/auth/refresh
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token manquant' });
    }

    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    // Générer un nouveau Access Token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    // Si le token est invalide ou expiré
    res.status(401).json({ message: 'Refresh token invalide ou expiré' });
  }
}

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    // req.user est injecté par le middleware "auth" que l'on va créer juste après
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}