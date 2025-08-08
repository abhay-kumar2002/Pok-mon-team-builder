
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getResource } from '../services/pokeapi';
import { Pokemon, PokemonType } from '../types';
import PokemonTypePill from '../components/PokemonTypePill';

const TeamMemberCard: React.FC<{ pokemon: Pokemon, onRemove: (id: number) => void }> = ({ pokemon, onRemove }) => {
    return (
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col items-center relative">
            <button onClick={() => onRemove(pokemon.id)} className="absolute top-2 right-2 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
            <Link to={`/pokemon/${pokemon.name}`} className="flex flex-col items-center">
                <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="w-24 h-24" />
                <h3 className="font-bold capitalize mt-2">{pokemon.name}</h3>
            </Link>
            <div className="flex gap-2 mt-2">
                {pokemon.types.map(({ type }) => <PokemonTypePill key={type.name} type={type.name} size="sm" />)}
            </div>
        </div>
    );
};

const TeamAnalysis: React.FC<{ team: Pokemon[] }> = ({ team }) => {
    const [typeDetails, setTypeDetails] = React.useState<PokemonType[]>([]);

    React.useEffect(() => {
        const fetchTypeDetails = async () => {
            if (team.length > 0) {
                const uniqueTypes = [...new Set(team.flatMap(p => p.types.map(t => t.type.url)))];
                const promises = uniqueTypes.map(url => getResource<PokemonType>(url));
                const results = await Promise.all(promises);
                setTypeDetails(results);
            } else {
                setTypeDetails([]);
            }
        };
        fetchTypeDetails();
    }, [team]);

    const coverage = useMemo(() => {
        const attackCoverage = new Map<string, string[]>();
        
        typeDetails.forEach(typeData => {
            const pokemonForType = team.find(p => p.types.some(t => t.type.name === typeData.name));
            if (!pokemonForType) return;

            typeData.damage_relations.double_damage_to.forEach(effectiveType => {
                if (!attackCoverage.has(effectiveType.name)) attackCoverage.set(effectiveType.name, []);
                attackCoverage.get(effectiveType.name)?.push(pokemonForType.name);
            });
        });
        return Array.from(attackCoverage.entries());

    }, [typeDetails, team]);

    const teamWeaknesses = useMemo(() => {
        const defenseCoverage = new Map<string, number>();
        
        team.forEach(pokemon => {
            const pokemonTypes = typeDetails.filter(td => pokemon.types.some(t => t.type.name === td.name));
            const weaknesses = new Map<string, number>();

            pokemonTypes.forEach(type => {
                type.damage_relations.double_damage_from.forEach(t => weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 2));
            });
            pokemonTypes.forEach(type => {
                type.damage_relations.half_damage_from.forEach(t => weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 0.5));
                type.damage_relations.no_damage_from.forEach(t => weaknesses.set(t.name, (weaknesses.get(t.name) || 1) * 0));
            });

            Array.from(weaknesses.entries()).forEach(([type, multiplier]) => {
                if (multiplier > 1) {
                    defenseCoverage.set(type, (defenseCoverage.get(type) || 0) + 1);
                }
            });
        });

        return Array.from(defenseCoverage.entries()).sort((a, b) => b[1] - a[1]);
    }, [team, typeDetails]);


    if (team.length === 0) return null;

    return (
        <div className="bg-slate-800 rounded-lg p-6 mt-8">
            <h2 className="text-2xl font-bold text-poke-yellow mb-4">Team Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-3">Offensive Coverage</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {coverage.map(([type, pokes]) => (
                            <div key={type} className="flex items-center gap-4">
                                <PokemonTypePill type={type} />
                                <span className="text-slate-400 capitalize"> super-effective by {pokes.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-3">Shared Weaknesses</h3>
                     <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {teamWeaknesses.map(([type, count]) => (
                            <div key={type} className="flex items-center gap-4">
                               <PokemonTypePill type={type} />
                               <span className="text-slate-400">{count} Pokémon are weak to this type.</span>
                           </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};


const TeamBuilder: React.FC = () => {
    const { team, removeFromTeam } = useApp();
    const emptySlots = 6 - team.length;

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-poke-blue">Team Builder</h1>
                <p className="text-slate-400 mt-2">Assemble your dream team!</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {team.map(pokemon => (
                    <TeamMemberCard key={pokemon.id} pokemon={pokemon} onRemove={removeFromTeam} />
                ))}
                {Array.from({ length: emptySlots }).map((_, index) => (
                    <div key={index} className="border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center h-48">
                        <span className="text-slate-500 text-lg">+</span>
                    </div>
                ))}
            </div>

            {team.length > 0 && <TeamAnalysis team={team} />}

            {team.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-slate-400 text-xl">Your team is empty.</p>
                    <Link to="/" className="mt-4 inline-block bg-poke-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                        Go to Pokédex to add members
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TeamBuilder;
