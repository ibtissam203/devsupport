import { Router } from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  assignTicket, 
  updateTicketStatus 
} from '../controllers/ticket.controller.js';
import { addComment, getComments } from '../controllers/comment.controller.js'; // <-- Nouvel import
import { auth } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';

const router = Router();

router.use(auth);

router.route('/')
  .post(authorize('client'), createTicket)
  .get(getTickets);

// Routes pour les commentaires (imbriquées dans les tickets)
router.route('/:id/comments')
  .post(addComment) // Tout utilisateur connecté peut commenter
  .get(getComments);

router.route('/:id')
  .get(getTicketById);

router.put('/:id/assign', authorize('admin'), assignTicket);
router.put('/:id/status', authorize('agent', 'admin'), updateTicketStatus);

export default router;