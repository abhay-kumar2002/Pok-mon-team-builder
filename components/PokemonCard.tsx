
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPokemonDetails } from '../services/pokeapi';
import { Pokemon } from '../types';
import PokemonTypePill from './PokemonTypePill';

interface PokemonCardProps {
  name: string;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ name }) => {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setIsLoading(true);
        const data = await getPokemonDetails(name);
        setPokemon(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, [name]);

  if (isLoading || !pokemon) {
    return (
      <div className="bg-slate-800 rounded-lg p-4 h-64 flex justify-center items-center">
        <div className="animate-pulse w-full h-full bg-slate-700 rounded-md"></div>
      </div>
    );
  }

  return (
    <Link to={`/pokemon/${pokemon.name}`}>
      <div className="bg-slate-800 rounded-lg p-4 text-center transition-transform transform hover:scale-105 hover:shadow-2xl hover:shadow-poke-red/30 cursor-pointer h-64 flex flex-col justify-between">
        <img
          src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
          alt={pokemon.name}
          className="mx-auto h-36 w-36 object-contain"
        />
        <div>
            <h3 className="text-lg font-bold capitalize text-white mb-2">
                {pokemon.name}
            </h3>
            <div className="flex justify-center gap-2">
                {pokemon.types.map(({ type }) => (
                <PokemonTypePill key={type.name} type={type.name} size="sm" />
                ))}
            </div>
        </div>
      </div>
    </Link>
  );
};

export default PokemonCard;
