
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Pokemon } from '../types';
import PokemonTypePill from '../components/PokemonTypePill';

const CompareStatChart: React.FC<{ pokemons: Pokemon[] }> = ({ pokemons }) => {
  if (pokemons.length === 0) return null;

  const statNames = pokemons[0].stats.map(s => s.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace('-', ' ').toUpperCase());

  const data = statNames.map((name, index) => {
    const statData: { subject: string; [key: string]: string | number } = { subject: name };
    pokemons.forEach(p => {
      statData[p.name] = p.stats[index].base_stat;
    });
    statData.fullMark = 255;
    return statData;
  });

  const colors = ['#EF5350', '#2196F3'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <Legend />
        {pokemons.map((p, i) => (
            <Radar key={p.id} name={p.name} dataKey={p.name} stroke={colors[i]} fill={colors[i]} fillOpacity={0.5} />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
};

const PokemonCompareCard: React.FC<{ pokemon: Pokemon, onRemove: (id: number) => void }> = ({ pokemon, onRemove }) => {
    return (
        <div className="bg-slate-800 rounded-lg p-6 flex flex-col items-center relative h-full">
            <button onClick={() => onRemove(pokemon.id)} className="absolute top-2 right-2 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            <Link to={`/pokemon/${pokemon.name}`} className="flex flex-col items-center">
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="w-48 h-48" />
                <h3 className="text-2xl font-bold capitalize mt-2">{pokemon.name}</h3>
            </Link>
            <div className="flex gap-2 mt-2">
                {pokemon.types.map(({ type }) => <PokemonTypePill key={type.name} type={type.name} />)}
            </div>
            <div className="text-left w-full mt-4 space-y-2">
                <p><strong>Height:</strong> {pokemon.height / 10} m</p>
                <p><strong>Weight:</strong> {pokemon.weight / 10} kg</p>
                <p><strong>Abilities:</strong> {pokemon.abilities.map(a => <span key={a.ability.name} className="capitalize block">{a.ability.name}</span>)}</p>
            </div>
        </div>
    )
}

const Compare: React.FC = () => {
    const { compareList, removeFromCompare, clearCompare } = useApp();

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-poke-yellow">Pokémon Comparison</h1>
                <p className="text-slate-400 mt-2">Compare two Pokémon side-by-side.</p>
            </div>
            {compareList.length > 0 && 
                <div className="text-center">
                    <button onClick={clearCompare} className="bg-poke-red text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">Clear Comparison</button>
                </div>
            }

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {compareList.map(pokemon => (
                    <PokemonCompareCard key={pokemon.id} pokemon={pokemon} onRemove={removeFromCompare} />
                ))}
                 {Array.from({ length: 2 - compareList.length }).map((_, index) => (
                    <div key={index} className="border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center h-[500px]">
                        <span className="text-slate-500 text-2xl mb-4">Select a Pokémon to Compare</span>
                         <Link to="/" className="mt-4 inline-block bg-poke-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                            Go to Pokédex
                        </Link>
                    </div>
                ))}
            </div>

            {compareList.length === 2 && (
                <div className="bg-slate-800 rounded-lg p-6 mt-8">
                    <h2 className="text-2xl font-bold text-center text-poke-yellow mb-4">Stat Comparison</h2>
                    <CompareStatChart pokemons={compareList} />
                </div>
            )}
        </div>
    );
};

export default Compare;
