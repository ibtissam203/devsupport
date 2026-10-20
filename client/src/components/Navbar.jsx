import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
              DevSupport<span className="text-gray-900">.</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
               {/* 👇 Nouveau lien conditionnel */}
                {(user.role === 'admin' || user.role === 'agent') && (
                  <Link to="/admin/stats" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Statistiques
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.name} <span className="text-xs text-gray-400 ml-1">({user.role})</span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Connexion</Link>
                <Link to="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">S'inscrire</Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}