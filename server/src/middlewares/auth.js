import { verifyAccessToken } from '../utils/jwt.js';

// Middleware pour vérifier si l'utilisateur est connecté
export function auth(req, res, next) {
  try {
    // Le token est généralement envoyé dans le header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = verifyAccessToken(token);
    
    // Injecter les infos de l'utilisateur dans la requête
    req.user = { id: decoded.id, role: decoded.role };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}