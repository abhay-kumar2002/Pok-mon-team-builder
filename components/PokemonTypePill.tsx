
import React from 'react';
import { TYPE_COLORS } from '../constants';

interface PokemonTypePillProps {
  type: string;
  size?: 'sm' | 'md';
}

const PokemonTypePill: React.FC<PokemonTypePillProps> = ({ type, size = 'md' }) => {
  const colorClass = TYPE_COLORS[type] || 'bg-gray-400';
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`capitalize font-semibold rounded-full text-white ${colorClass} ${sizeClass}`}
    >
      {type}
    </span>
  );
};

export default PokemonTypePill;
