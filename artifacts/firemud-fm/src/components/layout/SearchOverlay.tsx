import { useEffect, useRef } from "react";
import { Search as SearchIcon, X, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStations, getSearchStationsQueryKey } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { usePlayer } from "@/contexts/PlayerContext";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
}

export function SearchOverlay({ open, onClose, query, setQuery }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { playStation } = usePlayer();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const { data: searchRes, isLoading } = useSearchStations(
    { query: debouncedQuery, limit: 20 },
    { query: { enabled: open && debouncedQuery.length > 1, queryKey: getSearchStationsQueryKey({ query: debouncedQuery, limit: 20 }) } }
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex flex-col items-center">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl px-4 pt-16 sm:pt-24 z-10 flex flex-col max-h-[100dvh]">
        <div className="relative flex items-center mb-8">
          <SearchIcon className="absolute left-6 h-6 w-6 text-white/50" />
          <Input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stations, genres..." 
            className="w-full h-16 pl-16 pr-16 text-xl sm:text-2xl bg-white/10 border-white/20 text-white rounded-full focus-visible:ring-primary shadow-2xl backdrop-blur-md"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="absolute right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 w-10"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none pb-safe px-2">
          {isLoading && debouncedQuery.length > 1 && (
            <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
          )}
          
          {searchRes?.stations && searchRes.stations.length > 0 && (
            <div className="flex flex-col gap-2 pb-24">
              {searchRes.stations.map(station => (
                <div 
                  key={station.stationuuid}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
                  onClick={() => { playStation(station); onClose(); }}
                >
                  <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {station.favicon ? (
                      <img src={station.favicon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white/40 text-lg">{station.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-base truncate">{station.name}</p>
                    <p className="text-white/60 text-sm truncate">{station.tags?.split(',')[0]} {station.country ? `· ${station.country}` : ''}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="text-white/40 group-hover:text-primary group-hover:bg-primary/10 rounded-full h-10 w-10 shrink-0">
                    <PlayCircle className="w-6 h-6" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {debouncedQuery.length > 1 && !isLoading && searchRes?.stations?.length === 0 && (
            <div className="text-center p-12 text-white/50">No stations found for "{debouncedQuery}"</div>
          )}
        </div>
      </div>
    </div>
  );
}