import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nouvel état
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Réinitialiser l'erreur

    // Vérification des mots de passe
    if (password !== confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }

    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    }

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-sm text-gray-500">Rejoignez DevSupport pour gérer vos tickets.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nom complet</label>
              <input
                type="text"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ibtissam Abdouni"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Adresse Email</label>
              <input
                type="email"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <input
                type="password"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Nouveau champ : Confirmation du mot de passe */}
            <div>
              <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
              <input
                type="password"
                className={`mt-1 w-full px-4 py-3 border rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  confirmPassword && password !== confirmPassword 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {/* Message d'erreur en direct si les mots de passe ne correspondent pas */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={password !== confirmPassword || !password}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                S'inscrire
              </button>
            </div>
          </form>
          
          <p className="text-center text-sm text-gray-600">
            Déjà un compte ? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}