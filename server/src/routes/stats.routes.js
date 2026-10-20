import { Router } from 'express';
import { getStats } from '../controllers/stats.controller.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// Seuls les admins et les agents peuvent voir les statistiques globales
router.get('/', auth, authorize('admin', 'agent'), getStats);

export default router;