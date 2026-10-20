import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la modale de création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' });
  const [error, setError] = useState('');

  // Charger les tickets au montage du composant
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tickets', newTicket);
      setIsModalOpen(false); // Fermer la modale
      setNewTicket({ title: '', description: '', priority: 'medium' }); // Reset
      fetchTickets(); // Rafraîchir la liste
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du ticket");
    }
  };

  // Calcul des statistiques basées sur les tickets chargés
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bienvenue, {user?.name}. Voici un aperçu de vos tickets.</p>
        </div>

        {/* Cartes de Statistiques Dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tickets Ouverts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{openTickets}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">En cours</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressTickets}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Résolus</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{resolvedTickets}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

       {/* Liste des tickets */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
    <h2 className="text-lg font-bold text-gray-900">Vos Tickets</h2>
    
    {/* 👇 On affiche le bouton UNIQUEMENT si c'est un client */}
    {user?.role === 'client' && (
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        + Nouveau Ticket
      </button>
    )}
  </div>
  
          
          {loading ? (
            <div className="p-10 text-center text-gray-500">Chargement des tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Aucun ticket pour le moment.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <Link to={`/tickets/${ticket._id}`} key={ticket._id} className="block p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
  <div className="flex justify-between items-center">
    <div>
      <h3 className="text-md font-semibold text-gray-900">{ticket.title}</h3>
      <p className="text-sm text-gray-500 mt-1 truncate max-w-xl">{ticket.description}</p>
      <div className="mt-2 flex space-x-3 text-xs">
        <span className="font-medium text-gray-500">Statut: <span className="uppercase text-blue-600">{ticket.status}</span></span>
        <span className="font-medium text-gray-500">Priorité: <span className="uppercase text-red-500">{ticket.priority}</span></span>
      </div>
    </div>
    <div>
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
        ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
        'bg-green-100 text-green-700'
      }`}>
        {ticket.status === 'open' ? 'Ouvert' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
      </span>
    </div>
  </div>
</Link>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* MODALE DE CRÉATION DE TICKET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Créer un ticket</h2>
            
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  className="mt-1 w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Priorité</label>
                <select
                  className="mt-1 w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}