import React, { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || '/profile';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
       if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-lg shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-poke-yellow">Login</h1>
            <p className="mt-2 text-slate-400">Access your team and more!</p>
        </div>
        {error && <div className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg" role="alert">{error}</div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-slate-300 block mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-poke-red focus:outline-none"
              placeholder="ash@poke.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-slate-300 block mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-poke-red focus:outline-none"
              placeholder="Pikachu123"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-poke-red hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-poke-blue hover:underline">
              Sign Up
            </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;