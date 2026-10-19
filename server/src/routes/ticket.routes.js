import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  assignTicket, 
  updateTicketStatus 
} from '../controllers/ticket.controller.js';
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

// Toutes les routes en dessous nécessitent d'être connecté
router.use(auth);

router.route('/')
  .post(authorize('client'), createTicket) // Seul un client peut créer un ticket
  .get(getTickets);                        // Tout le monde (filtré selon le rôle) peut lister

router.route('/:id')
  .get(getTicketById);                     // Voir un ticket précis

// Routes réservées aux admins
router.put('/:id/assign', authorize('admin'), assignTicket);

// Routes réservées aux agents et admins
router.put('/:id/status', authorize('agent', 'admin'), updateTicketStatus);

export default router;