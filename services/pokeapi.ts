
import { POKEAPI_BASE_URL } from '../constants';
import { PokemonListResponse, Pokemon } from '../types';

export const getPokemons = async (limit = 20, offset = 0): Promise<PokemonListResponse> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Pokémon list');
  }
  return response.json();
};

export const getPokemonDetails = async (nameOrId: string): Promise<Pokemon> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${nameOrId.toLowerCase()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch details for Pokémon: ${nameOrId}`);
  }
  return response.json();
};

export const getResource = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch resource at ${url}`);
  }
  return response.json();
};
