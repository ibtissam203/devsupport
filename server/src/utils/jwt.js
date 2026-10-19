import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Générer un Access Token (courte durée)
export function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );
}

// Générer un Refresh Token (longue durée)
export function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES }
  );
}

// Vérifier un Access Token
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// Vérifier un Refresh Token
export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}