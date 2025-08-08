
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Pokemon } from '../types';

interface AppContextType {
  team: Pokemon[];
  addToTeam: (pokemon: Pokemon) => boolean;
  removeFromTeam: (pokemonId: number) => void;
  compareList: Pokemon[];
  addToCompare: (pokemon: Pokemon) => boolean;
  removeFromCompare: (pokemonId: number) => void;
  clearCompare: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [team, setTeam] = useState<Pokemon[]>(() => {
    try {
      const savedTeam = localStorage.getItem('pokemonTeam');
      return savedTeam ? JSON.parse(savedTeam) : [];
    } catch (error) {
      console.error('Failed to parse team from localStorage', error);
      return [];
    }
  });

  const [compareList, setCompareList] = useState<Pokemon[]>([]);

  useEffect(() => {
    localStorage.setItem('pokemonTeam', JSON.stringify(team));
  }, [team]);

  const addToTeam = (pokemon: Pokemon): boolean => {
    if (team.length < 6 && !team.some(p => p.id === pokemon.id)) {
      setTeam(prevTeam => [...prevTeam, pokemon]);
      return true;
    }
    return false;
  };

  const removeFromTeam = (pokemonId: number) => {
    setTeam(prevTeam => prevTeam.filter(p => p.id !== pokemonId));
  };

  const addToCompare = (pokemon: Pokemon): boolean => {
    if (compareList.length < 2 && !compareList.some(p => p.id === pokemon.id)) {
      setCompareList(prevList => [...prevList, pokemon]);
      return true;
    }
    return false;
  };

  const removeFromCompare = (pokemonId: number) => {
    setCompareList(prevList => prevList.filter(p => p.id !== pokemonId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <AppContext.Provider value={{ team, addToTeam, removeFromTeam, compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
