import { Router } from 'express';
import authRoutes from './auth.routes.js';
import ticketRoutes from './ticket.routes.js'; 
import statsRoutes from './stats.routes.js';
const router = Router();

// Route de test
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'devsupport-api', time: new Date() });
});

// Route d'authentification
router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/stats', statsRoutes);

export default router;