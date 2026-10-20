import Ticket from '../models/Ticket.js';

// @desc    Obtenir les statistiques des tickets
// @route   GET /api/stats
export async function getStats(req, res, next) {
  try {
    // 1. Nombre total de tickets
    const totalTickets = await Ticket.countDocuments();

    // 2. Nombre de tickets par statut (open, in_progress, resolved, closed)
    const ticketsByStatus = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Nombre de tickets par priorité (low, medium, high)
    const ticketsByPriority = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Nombre de tickets assignés à chaque agent (Top Agents)
    const ticketsByAgent = await Ticket.aggregate([
      {
        $match: { assignedTo: { $ne: null } } // On ignore les tickets non assignés
      },
      {
        $group: {
          _id: '$assignedTo',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users', // Le nom de la collection dans MongoDB
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      {
        $unwind: '$agent' // Transforme le tableau 'agent' en objet
      },
      {
        $project: {
          _id: 0,
          agentId: '$_id',
          name: '$agent.name',
          count: 1,
        },
      },
      { $sort: { count: -1 } }, // Trier du plus grand au plus petit
      { $limit: 5 } // On garde les 5 meilleurs agents
    ]);

    // Formater les données pour faciliter la lecture côté Frontend
    res.status(200).json({
      totalTickets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByAgent,
    });
  } catch (error) {
    next(error);
  }
}