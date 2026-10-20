import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast'; // <-- Import
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('accessToken');
      const newSocket = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000', {
        auth: { token }
      });

      setSocket(newSocket);

      // 🔔 ÉCOUTE DES ÉVÉNEMENTS POUR LES NOTIFICATIONS
      newSocket.on('ticket_created', (ticket) => {
        // Si on est un agent ou un admin, on est notifié d'un nouveau ticket
        if (user.role !== 'client') {
          toast.success(`Nouveau ticket : ${ticket.ticketNumber}`, {
            icon: '🎫',
            duration: 4000,
          });
        }
      });

      newSocket.on('ticket_updated', ({ ticket, log }) => {
        // On notifie lors d'un changement de statut
        if (log && log.action === 'status_changed') {
          toast(`Le ticket ${ticket.ticketNumber} a été mis à jour`, {
            icon: '🔄',
            style: { background: '#fef08a', color: '#854d0e' } // Jaune clair
          });
        }
        // On notifie lors d'une assignation
        if (log && log.action === 'assigned') {
          toast.success(`Ticket ${ticket.ticketNumber} assigné`, {
            icon: '👨‍💻',
          });
        }
      });

      // Nettoyage à la déconnexion
      return () => {
        newSocket.off('ticket_created');
        newSocket.off('ticket_updated');
        newSocket.disconnect();
      };
    } else {
      if (socket) socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);