import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Erreur stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement des statistiques...</div>;
  if (!stats) return <div className="min-h-screen flex items-center justify-center">Erreur de chargement.</div>;

  // Couleurs pour les graphiques
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6b7280'];

  // Formater les données pour Recharts
  const statusData = stats.ticketsByStatus.map(item => ({
    name: item._id === 'open' ? 'Ouvert' : item._id === 'in_progress' ? 'En cours' : 'Résolu',
    value: item.count
  }));

  const priorityData = stats.ticketsByPriority.map(item => ({
    name: item._id === 'low' ? 'Basse' : item._id === 'medium' ? 'Moyenne' : 'Haute',
    count: item.count
  }));

  // Calcul du taux de résolution
  const resolvedCount = stats.ticketsByStatus.find(s => s._id === 'resolved' || s._id === 'closed')?.count || 0;
  const resolutionRate = stats.totalTickets === 0 ? 0 : Math.round((resolvedCount / stats.totalTickets) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Globales</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité du support.</p>
        </div>

        {/* Cartes KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Total des tickets</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalTickets}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Tickets Actifs (Ouverts + En cours)</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {stats.ticketsByStatus.filter(s => s._id === 'open' || s._id === 'in_progress').reduce((acc, curr) => acc + curr.count, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Taux de résolution</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{resolutionRate}%</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique 1 : Tickets par statut */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Répartition par statut</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique 2 : Tickets par priorité */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Volume par priorité</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}