import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pour l'assignation (Admin)
  const [agents, setAgents] = useState([]);

  const commentsEndRef = useRef(null);

  // 1. Charger les données
  const fetchData = async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/comments`)
      ]);
      
      setTicket(ticketRes.data.ticket);
      setActivities(ticketRes.data.activities);
      setComments(commentsRes.data);
    } catch (err) {
      setError("Erreur lors du chargement du ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 2. Gérer le temps réel (Socket.IO)
  useEffect(() => {
    if (!socket) return;

    // Rejoindre la room du ticket
    socket.emit('join_ticket', id);

    // Écouter les nouveaux commentaires
    const handleNewComment = (comment) => {
      setComments((prev) => [...prev, comment]);
    };

    // Écouter les mises à jour du ticket (statut, assignation...)
    const handleTicketUpdated = ({ ticket: updatedTicket, log }) => {
      setTicket(updatedTicket); // Met à jour le statut instantanément
      if (log) {
        setActivities((prev) => [...prev, log]); // Ajoute l'action dans l'historique
      }
    };

    socket.on('new_comment', handleNewComment);
    socket.on('ticket_updated', handleTicketUpdated);

    // Nettoyage
    return () => {
      socket.emit('leave_ticket', id);
      socket.off('new_comment', handleNewComment);
      socket.off('ticket_updated', handleTicketUpdated);
    };
  }, [socket, id]);

  // Auto-scroll vers le dernier commentaire
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // 3. Actions (Agent/Admin)
  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tickets/${id}/status`, { status: newStatus });
      // La mise à jour de l'UI se fera automatiquement via Socket.IO !
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tickets/${id}/comments`, { content: newComment });
      setNewComment('');
      // L'ajout dans la liste se fera automatiquement via Socket.IO !
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error || !ticket) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto py-10 px-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Retour au tableau de bord
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale (Ticket + Discussion) */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête du ticket */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-gray-400 mb-1 block">{ticket.ticketNumber}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                  {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                </span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
                <p>Créé par : <span className="font-medium text-gray-900">{ticket.createdBy?.name}</span></p>
                <p>Priorité : <span className="font-medium uppercase text-red-500">{ticket.priority}</span></p>
                {ticket.assignedTo && (
                  <p>Assigné à : <span className="font-medium text-blue-600">{ticket.assignedTo.name}</span></p>
                )}
              </div>
            </div>

            {/* Discussion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="font-bold text-gray-800">Discussion</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className={`flex flex-col ${comment.author?._id === user?.id ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      comment.author?._id === user?.id 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}>
                      <p className="text-xs font-semibold mb-1 opacity-80">{comment.author?.name} ({comment.author?.role})</p>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>
              <form onSubmit={handleSendComment} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                <input type="text" placeholder="Écrire un commentaire..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700">Envoyer</button>
              </form>
            </div>
          </div>

          {/* Colonne latérale (Actions & Historique) */}
          <div className="space-y-6">
            {/* Actions Agent/Admin */}
            {user.role !== 'client' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Actions (Support)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Changer le statut</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Historique d'activité */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Historique</h3>
              <div className="space-y-4">
                {activities.map((act) => (
                  <div key={act._id} className="text-sm">
                    <p className="text-gray-800 font-medium">{act.user?.name}</p>
                    <p className="text-gray-500 text-xs">{act.details}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}