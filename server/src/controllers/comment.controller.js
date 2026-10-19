import Comment from '../models/Comment.js';
import Ticket from '../models/Ticket.js';
import { getIO } from '../sockets/socket.js'; // On va créer ceci après

// @desc    Ajouter un commentaire à un ticket
// @route   POST /api/tickets/:id/comments
export async function addComment(req, res, next) {
  try {
    const { content } = req.body;
    const ticketId = req.params.id;

    // Vérifier que le ticket existe
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    // Créer le commentaire
    const comment = await Comment.create({
      content,
      ticket: ticketId,
      author: req.user.id,
    });

    // Peupler les infos de l'auteur pour l'envoyer en temps réel
    await comment.populate('author', 'name role');

    // 🔥 ENVOI EN TEMPS RÉEL via Socket.IO
    const io = getIO();
    // On envoie l'événement à toutes les personnes qui regardent ce ticket (Room)
    io.to(ticketId.toString()).emit('new_comment', comment);

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
}

// @desc    Récupérer les commentaires d'un ticket
// @route   GET /api/tickets/:id/comments
export async function getComments(req, res, next) {
  try {
    const comments = await Comment.find({ ticket: req.params.id })
      .populate('author', 'name role')
      .sort('createdAt'); // Du plus ancien au plus récent

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
}