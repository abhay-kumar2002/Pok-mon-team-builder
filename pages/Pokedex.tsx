
import React, { useState, useEffect, useMemo } from 'react';
import { getPokemons, getPokemonDetails } from '../services/pokeapi';
import { useDebounce } from '../hooks/useDebounce';
import PokemonCard from '../components/PokemonCard';
import LoadingSpinner from '../components/LoadingSpinner';

const POKEMON_PER_PAGE = 24;

const Pokedex: React.FC = () => {
  const [allPokemons, setAllPokemons] = useState<{name: string}[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<{name: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchAllPokemons = async () => {
      try {
        setIsLoading(true);
        // Fetch a large list to enable client-side search
        const data = await getPokemons(1302, 0); // Total Pokémon as of Gen 9
        setAllPokemons(data.results);
        setFilteredPokemons(data.results);
      } catch (err) {
        setError('Could not fetch Pokémon data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllPokemons();
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = allPokemons.filter(p => 
        p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredPokemons(filtered);
    } else {
      setFilteredPokemons(allPokemons);
    }
    setCurrentPage(1); // Reset to first page on search
  }, [debouncedSearchTerm, allPokemons]);

  const paginatedPokemons = useMemo(() => {
    const startIndex = (currentPage - 1) * POKEMON_PER_PAGE;
    const endIndex = startIndex + POKEMON_PER_PAGE;
    return filteredPokemons.slice(startIndex, endIndex);
  }, [currentPage, filteredPokemons]);

  const totalPages = Math.ceil(filteredPokemons.length / POKEMON_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-500 text-xl">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-poke-yellow">Pokédex Explorer</h1>
        <p className="text-slate-400 mt-2">Search for your favorite Pokémon!</p>
      </div>

      <div className="flex justify-center">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 focus:ring-2 focus:ring-poke-red focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {paginatedPokemons.map((pokemon) => (
          <PokemonCard key={pokemon.name} name={pokemon.name} />
        ))}
      </div>
      
      {filteredPokemons.length === 0 && !isLoading && (
        <div className="text-center col-span-full py-12">
            <p className="text-slate-400 text-lg">No Pokémon found for "{debouncedSearchTerm}"</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-poke-red rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-lg font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-poke-red rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pokedex;
