import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function TicketDetails() {
  const { id } = useParams(); // Récupère l'ID du ticket depuis l'URL
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Référence pour garder la connexion Socket.IO
  const socketRef = useRef(null);
  const commentsEndRef = useRef(null);

  // 1. Charger le ticket et ses commentaires au démarrage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          api.get(`/tickets/${id}`),
          api.get(`/tickets/${id}/comments`)
        ]);
        setTicket(ticketRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Configurer Socket.IO
  useEffect(() => {
    // Connexion au serveur Socket.IO
    const token = localStorage.getItem('accessToken');
    const socket = io('http://localhost:5000', {
      auth: { token }
    });
    socketRef.current = socket;

    // Rejoindre la "room" du ticket
    socket.emit('join_ticket', id);

    // Écouter l'événement "new_comment"
    socket.on('new_comment', (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    // Nettoyage lors de la fermeture de la page
    return () => {
      socket.emit('leave_ticket', id);
      socket.disconnect();
    };
  }, [id]);

  // Auto-scroll vers le dernier commentaire
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // 3. Envoyer un commentaire
  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/tickets/${id}/comments`, { content: newComment });
      setNewComment(''); // Vider le champ
      // Note : Le commentaire sera ajouté à la liste via l'événement Socket.IO !
    } catch (err) {
      console.error("Erreur lors de l'ajout du commentaire", err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!ticket) return <div className="min-h-screen flex items-center justify-center">Ticket introuvable.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-10 px-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Retour au tableau de bord
        </Link>

        {/* En-tête du ticket */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
              {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
            </span>
          </div>
          <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-6 text-sm text-gray-500">
            <p>Créé par : <span className="font-medium text-gray-900">{ticket.createdBy?.name}</span></p>
            <p>Priorité : <span className="font-medium uppercase text-red-500">{ticket.priority}</span></p>
            {ticket.assignedTo && (
              <p>Assigné à : <span className="font-medium text-blue-600">{ticket.assignedTo.name}</span></p>
            )}
          </div>
        </div>

        {/* Section Commentaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-800">Discussion</h2>
          </div>
          
          {/* Liste des commentaires */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-400 mt-10 text-sm">Aucun commentaire pour le moment.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className={`flex flex-col ${comment.author?._id === user?.id ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    comment.author?._id === user?.id 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {comment.author?.name} ({comment.author?.role})
                    </p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Formulaire d'envoi */}
          <form onSubmit={handleSendComment} className="p-4 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Écrire un commentaire..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Envoyer
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}