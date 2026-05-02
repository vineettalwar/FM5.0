export const GENRE_COLORS: Record<string, string> = {
  pop: '#e11d48', rock: '#dc2626', jazz: '#7c3aed', classical: '#1d4ed8',
  electronic: '#0891b2', house: '#0d9488', techno: '#4338ca', hiphop: '#b45309',
  rnb: '#be185d', country: '#92400e', folk: '#065f46', metal: '#1f2937',
  blues: '#1e3a5f', reggae: '#15803d', latin: '#b91c1c', soul: '#7e22ce',
  ambient: '#0e7490', indie: '#9333ea', alternative: '#be123c', punk: '#b91c1c',
  news: '#374151', talk: '#374151', sports: '#047857', christian: '#1d4ed8',
  children: '#d97706', comedy: '#ca8a04', world: '#0f766e', dance: '#7c3aed',
  trap: '#1e293b', lofi: '#475569',
};

import { Link } from "wouter";
import { Music } from "lucide-react";

interface GenreCardProps {
  name: string;
  count: number;
}

export function GenreCard({ name, count }: GenreCardProps) {
  const color = GENRE_COLORS[name.toLowerCase()] || '#475569';
  
  return (
    <Link 
      href={`/genre/${encodeURIComponent(name)}`}
      className="group relative h-28 md:h-32 rounded-2xl p-4 md:p-5 flex flex-col justify-end overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:brightness-110"
      style={{ backgroundColor: color }}
    >
      <div className="absolute top-0 right-0 p-3 opacity-15 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-25 group-hover:-rotate-12">
        <Music className="w-16 h-16 text-white" strokeWidth={1.5} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="relative z-10">
        <h3 className="text-white font-bold text-lg md:text-xl truncate drop-shadow-sm font-serif">{name}</h3>
        <p className="text-white/80 text-xs font-medium">{count.toLocaleString()} stations</p>
      </div>
    </Link>
  );
}