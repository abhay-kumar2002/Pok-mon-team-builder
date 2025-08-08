import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Pokedex from './pages/Pokedex';
import PokemonDetail from './pages/PokemonDetail';
import TeamBuilder from './pages/TeamBuilder';
import Compare from './pages/Compare';
import StoryMode from './pages/StoryMode';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Pokedex />} />
                <Route path="/pokemon/:name" element={<PokemonDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <TeamBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compare"
                  element={
                    <ProtectedRoute>
                      <Compare />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/story"
                  element={
                    <ProtectedRoute>
                      <StoryMode />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;