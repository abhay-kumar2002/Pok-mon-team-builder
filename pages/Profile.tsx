import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import PokemonTypePill from '../components/PokemonTypePill';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { team } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null; // Should be protected by ProtectedRoute
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-poke-blue">Welcome, {user.name}!</h1>
        <p className="text-slate-400 mt-2">{user.email}</p>
        <button
          onClick={handleLogout}
          className="mt-4 bg-poke-red hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-poke-yellow mb-4">Your Current Team</h2>
        {team.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {team.map(pokemon => (
              <Link key={pokemon.id} to={`/pokemon/${pokemon.name}`} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="w-24 h-24" />
                <h3 className="font-bold capitalize text-center">{pokemon.name}</h3>
                <div className="flex gap-1">
                  {pokemon.types.map(({ type }) => <PokemonTypePill key={type.name} type={type.name} size="sm" />)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-lg">Your team is empty.</p>
            <Link to="/" className="mt-4 inline-block bg-poke-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              Go to Pokédex to build your team!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
