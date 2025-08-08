import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeLinkClass = 'bg-poke-red text-white';
  const inactiveLinkClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`;
  
  const buttonClasses = 'px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors';

  return (
    <header className="bg-slate-800 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
                <img className="h-8 w-auto" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" />
                <span className="text-white text-xl font-bold">PokéBuilder</span>
            </NavLink>
          </div>
          <div className="hidden md:flex items-center">
            <div className="flex items-baseline space-x-4">
              <NavLink
                to="/"
                className={linkClasses}
              >
                Pokédex
              </NavLink>
              <NavLink
                to="/team"
                className={linkClasses}
              >
                Team Builder
              </NavLink>
              <NavLink
                to="/compare"
                className={linkClasses}
              >
                Compare
              </NavLink>
              <NavLink
                to="/story"
                className={linkClasses}
              >
                Story Mode
              </NavLink>
            </div>

            <div className="ml-6 pl-6 border-l border-slate-700 flex items-baseline space-x-4">
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className={linkClasses}>
                    Profile
                  </NavLink>
                  <button onClick={handleLogout} className={buttonClasses}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClasses}>
                    Login
                  </NavLink>
                   <NavLink to="/register" className={({isActive}) => `${linkClasses({isActive})} ${isActive ? '' : 'bg-poke-blue hover:bg-blue-600'}`}>
                    Sign Up
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;