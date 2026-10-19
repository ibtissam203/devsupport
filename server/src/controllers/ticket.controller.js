import Ticket from '../models/Ticket.js';

// @desc    Créer un nouveau ticket (Client uniquement)
// @route   POST /api/tickets
export async function createTicket(req, res, next) {
  try {
    const { title, description, priority } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      createdBy: req.user.id, // Injecté par le middleware auth
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
}

// @desc    Lister les tickets
// @route   GET /api/tickets
export async function getTickets(req, res, next) {
  try {
    let query = {};

    // Un client ne voit que SES tickets
    if (req.user.role === 'client') {
      query.createdBy = req.user.id;
    }
    // Un agent voit les tickets qui lui sont assignés OU les tickets ouverts (non assignés)
    else if (req.user.role === 'agent') {
      query.$or = [{ assignedTo: req.user.id }, { assignedTo: null }];
    }
    // Un admin voit TOUS les tickets (query reste vide {})

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}

// @desc    Voir un ticket spécifique
// @route   GET /api/tickets/:id
export async function getTicketById(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    // Sécurité : Un client ne peut voir que ses propres tickets
    if (req.user.role === 'client' && ticket.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé à ce ticket' });
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}

// @desc    Assigner un ticket à un agent (Admin uniquement pour l'instant)
// @route   PUT /api/tickets/:id/assign
export async function assignTicket(req, res, next) {
  try {
    const { agentId } = req.body;
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: agentId, status: 'in_progress' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    res.status(200).json({ message: 'Ticket assigné avec succès', ticket });
  } catch (error) {
    next(error);
  }
}

// @desc    Changer le statut d'un ticket (Agent ou Admin)
// @route   PUT /api/tickets/:id/status
export async function updateTicketStatus(req, res, next) {
  try {
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    res.status(200).json({ message: 'Statut mis à jour', ticket });
  } catch (error) {
    next(error);
  }
}