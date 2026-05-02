import { Station } from "@workspace/api-client-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAddFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PlayCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeaturedHeroProps {
  station?: Station;
  isLoading?: boolean;
}

export function FeaturedHero({ station, isLoading }: FeaturedHeroProps) {
  const { currentStation, isPlaying, togglePlayPause, playStation } = usePlayer();
  const queryClient = useQueryClient();
  const addFavorite = useAddFavorite();
  const { data: favoritesRes } = useGetFavorites({ query: { queryKey: getGetFavoritesQueryKey() } });
  
  if (isLoading) {
    return (
      <div className="w-full h-[400px] rounded-3xl animate-pulse bg-card border border-border/40" />
    );
  }
  if (!station) return null;

  const isFavorite = favoritesRes?.stations?.some(s => s.stationuuid === station.stationuuid);
  const isCurrent = currentStation?.stationuuid === station.stationuuid;

  return (
    <section className="relative w-full rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-start p-8 md:p-12 lg:p-16 group">
      {/* Background Image / Blur */}
      {station.favicon ? (
        <img src={station.favicon} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 z-0" crossOrigin="anonymous" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background z-0" />
      )}
      <div className="absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-start gap-6">
        <div className="flex items-center gap-3 flex-wrap">
          {station.tags?.split(',').slice(0, 3).map(tag => (
            <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-white">
              {tag.trim()}
            </span>
          ))}
        </div>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white font-serif leading-tight drop-shadow-lg">
          {station.name}
        </h1>
        <p className="text-xl text-white/80 max-w-xl">
          {station.country && `Broadcasting from ${station.country}.`}
        </p>
        
        <div className="flex items-center gap-4 mt-4">
          <Button 
            size="lg" 
            className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold shadow-xl transition-all hover:scale-105"
            onClick={() => isCurrent ? togglePlayPause() : playStation(station)}
          >
            {isCurrent && isPlaying ? "Pause" : "Play Now"} <PlayCircle className="ml-2 w-6 h-6" />
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-14 px-6 rounded-full border-2 border-white/20 bg-white/5 hover:bg-white/20 text-white backdrop-blur-sm"
            onClick={() => !isFavorite && addFavorite.mutate({ data: { stationUuid: station.stationuuid } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() })})}
          >
            <Heart className={cn("mr-2 h-5 w-5", isFavorite && "fill-primary text-primary")} /> {isFavorite ? "Favorited" : "Add to Favorites"}
          </Button>
        </div>
      </div>
    </section>
  );
}