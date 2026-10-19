import { Router } from 'express';
import { register, login, refresh, getMe } from '../controllers/auth.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Route protégée : il faut être connecté pour voir son profil
router.get('/me', auth, getMe);

export default router;