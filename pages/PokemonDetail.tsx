
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { getPokemonDetails, getResource } from '../services/pokeapi';
import { useApp } from '../context/AppContext';
import { Pokemon, PokemonSpecies, EvolutionChain, ChainLink, PokemonType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import PokemonTypePill from '../components/PokemonTypePill';

const StatChart: React.FC<{ stats: Pokemon['stats'] }> = ({ stats }) => {
    const data = stats.map(stat => ({
      subject: stat.stat.name.replace('special-attack', 'Sp. Atk').replace('special-defense', 'Sp. Def').replace('-', ' ').toUpperCase(),
      A: stat.base_stat,
      fullMark: 255,
    }));
  
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 255]} tick={false} axisLine={false} />
          <Radar name="Base Stats" dataKey="A" stroke="#EF5350" fill="#EF5350" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
};

const EvolutionDisplay: React.FC<{ chain: EvolutionChain }> = ({ chain }) => {
    const evolutionLine = useMemo(() => {
        const line: { name: string, id: string }[] = [];
        let currentLink: ChainLink | undefined = chain.chain;
        while (currentLink) {
            const urlParts = currentLink.species.url.split('/');
            const id = urlParts[urlParts.length - 2];
            line.push({ name: currentLink.species.name, id });
            currentLink = currentLink.evolves_to[0];
        }
        return line;
    }, [chain]);

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            {evolutionLine.map((evo, index) => (
                <React.Fragment key={evo.id}>
                    <Link to={`/pokemon/${evo.name}`} className="flex flex-col items-center gap-2 text-center transition-transform hover:scale-105">
                        <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`} 
                            alt={evo.name}
                            className="w-24 h-24 bg-slate-700/50 rounded-full"
                        />
                        <span className="capitalize font-semibold">{evo.name}</span>
                    </Link>
                    {index < evolutionLine.length - 1 && (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const PokemonDetail: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const { addToTeam, addToCompare } = useApp();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [species, setSpecies] = useState<PokemonSpecies | null>(null);
    const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
    const [typeDetails, setTypeDetails] = useState<PokemonType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!name) return;
            setIsLoading(true);
            setError(null);
            try {
                const pokemonData = await getPokemonDetails(name);
                setPokemon(pokemonData);
                const speciesData = await getResource<PokemonSpecies>(pokemonData.species.url);
                setSpecies(speciesData);
                const evolutionData = await getResource<EvolutionChain>(speciesData.evolution_chain.url);
                setEvolutionChain(evolutionData);

                const typePromises = pokemonData.types.map(t => getResource<PokemonType>(t.type.url));
                const typesData = await Promise.all(typePromises);
                setTypeDetails(typesData);

            } catch (err) {
                setError('Could not find this Pokémon. Please check the name and try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [name]);
    
    const handleAddToTeam = () => {
        if (pokemon) {
          const success = addToTeam(pokemon);
          setNotification(success ? `${pokemon.name} added to your team!` : 'Your team is full or this Pokémon is already on it.');
          setTimeout(() => setNotification(''), 3000);
        }
    };
    
    const handleAddToCompare = () => {
        if (pokemon) {
            const success = addToCompare(pokemon);
            setNotification(success ? `${pokemon.name} added to comparison!` : 'Comparison list is full or this Pokémon is already in it.');
            setTimeout(() => setNotification(''), 3000);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;
    if (!pokemon) return null;

    const flavorText = species?.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\n\f]/g, ' ');
    
    const weaknesses = new Map<string, number>();
    typeDetails.forEach(type => {
        type.damage_relations.double_damage_from.forEach(t => {
            weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 2);
        });
    });
    typeDetails.forEach(type => {
        type.damage_relations.half_damage_from.forEach(t => {
            weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 0.5);
        });
        type.damage_relations.no_damage_from.forEach(t => {
            weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 0);
        });
    });

    const finalWeaknesses = Array.from(weaknesses.entries()).filter(([, multiplier]) => multiplier > 1).map(([type]) => type);
    const resistances = Array.from(weaknesses.entries()).filter(([, multiplier]) => multiplier < 1 && multiplier > 0).map(([type]) => type);
    const immunities = Array.from(weaknesses.entries()).filter(([, multiplier]) => multiplier === 0).map(([type]) => type);


    return (
        <div className="space-y-12">
            {notification && (
                <div className="fixed top-20 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
                    {notification}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col items-center bg-slate-800 rounded-lg p-6">
                    <h1 className="text-4xl font-bold capitalize mb-2">{pokemon.name}</h1>
                    <span className="text-slate-400 text-lg">#{String(pokemon.id).padStart(3, '0')}</span>
                    <img
                        src={pokemon.sprites.other['official-artwork'].front_default}
                        alt={pokemon.name}
                        className="w-64 h-64 my-4"
                    />
                    <div className="flex gap-2 mb-4">
                        {pokemon.types.map(({ type }) => (
                            <PokemonTypePill key={type.name} type={type.name} />
                        ))}
                    </div>
                    <p className="text-center text-slate-300 italic">{flavorText}</p>
                    <div className="flex gap-4 mt-6">
                        <button onClick={handleAddToTeam} className="bg-poke-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">Add to Team</button>
                        <button onClick={handleAddToCompare} className="bg-poke-yellow hover:bg-yellow-500 text-slate-900 font-bold py-2 px-4 rounded transition-colors">Add to Compare</button>
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-8">
                     <div className="bg-slate-800 rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-poke-yellow">Base Stats</h2>
                        <StatChart stats={pokemon.stats} />
                    </div>
                    <div className="bg-slate-800 rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-poke-yellow">Type Effectiveness</h2>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Weaknesses (x2)</h3>
                            <div className="flex flex-wrap gap-2">{finalWeaknesses.map(t => <PokemonTypePill key={t} type={t} />)}</div>
                        </div>
                         <div className="mt-4">
                            <h3 className="font-semibold text-lg mb-2">Resistances (x0.5)</h3>
                            <div className="flex flex-wrap gap-2">{resistances.map(t => <PokemonTypePill key={t} type={t} />)}</div>
                        </div>
                         <div className="mt-4">
                            <h3 className="font-semibold text-lg mb-2">Immunities (x0)</h3>
                            <div className="flex flex-wrap gap-2">{immunities.map(t => <PokemonTypePill key={t} type={t} />)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-poke-yellow">Evolution Chain</h2>
                {evolutionChain ? <EvolutionDisplay chain={evolutionChain} /> : <LoadingSpinner />}
            </div>
        </div>
    );
};

export default PokemonDetail;
