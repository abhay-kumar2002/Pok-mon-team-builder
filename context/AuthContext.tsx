import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';

// NOTE: This is a simplified, client-side-only authentication system.
// In a real-world application, you would NEVER store user credentials on the client.
// All authentication logic should be handled by a secure backend server.

interface User {
  name: string;
  email: string;
}

// Storing the password here is for demo purposes only. NEVER do this in production.
interface StoredUser extends User {
  password_plaintext: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password_plaintext: string) => void;
  logout: () => void;
  register: (name: string, email: string, password_plaintext: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUsersFromStorage = (): StoredUser[] => {
  try {
    const users = localStorage.getItem('pokeUsers');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Failed to parse users from localStorage', error);
    return [];
  }
};

const setUsersInStorage = (users: StoredUser[]) => {
  localStorage.setItem('pokeUsers', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem('authUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      } finally {
        setIsLoading(false);
      }
    };
    // Add a small delay to simulate async loading
    const timer = setTimeout(checkSession, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = (email: string, password_plaintext: string) => {
    const users = getUsersFromStorage();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!foundUser || foundUser.password_plaintext !== password_plaintext) {
      throw new Error('Invalid email or password.');
    }

    // Exclude password from the session user object
    const { password_plaintext: _, ...userToStore } = foundUser;
    localStorage.setItem('authUser', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const register = (name: string, email: string, password_plaintext: string) => {
    const users = getUsersFromStorage();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: StoredUser = { name, email, password_plaintext };
    setUsersInStorage([...users, newUser]);
    
    // Automatically log in after registration
    const { password_plaintext: _, ...userToStore } = newUser;
    localStorage.setItem('authUser', JSON.stringify(userToStore));
    setUser(userToStore);
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};