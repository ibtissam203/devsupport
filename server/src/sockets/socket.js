import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Middleware d'authentification pour Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token manquant'));
    }
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded; // On attache l'utilisateur au socket
      next();
    } catch (err) {
      next(new Error('Token invalide'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Utilisateur connecté au socket: ${socket.user.id}`);

    // Permet au client de rejoindre une "Room" spécifique à un ticket
    socket.on('join_ticket', (ticketId) => {
      socket.join(ticketId);
      console.log(`👀 User ${socket.user.id} a rejoint le ticket ${ticketId}`);
    });

    // Permet au client de quitter la "Room"
    socket.on('leave_ticket', (ticketId) => {
      socket.leave(ticketId);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Utilisateur déconnecté: ${socket.user.id}`);
    });
  });

  return io;
}

// Fonction utilitaire pour récupérer l'instance de IO ailleurs dans l'app
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO n\'est pas initialisé');
  }
  return io;
}