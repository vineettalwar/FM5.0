import { MouseEvent } from "react";
import { Station } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Play, Pause, Heart } from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface StationCardProps {
  station: Station;
}

export function StationCard({ station }: StationCardProps) {
  const { currentStation, isPlaying, playStation, togglePlayPause } = usePlayer();
  const queryClient = useQueryClient();
  
  const { data: favoritesRes } = useGetFavorites({ query: { queryKey: getGetFavoritesQueryKey() } });
  const isFavorite = favoritesRes?.stations?.some(s => s.stationuuid === station.stationuuid) || false;
  
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isCurrent = currentStation?.stationuuid === station.stationuuid;

  const handlePlayClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playStation(station);
    }
  };

  const handleFavoriteClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavorite.mutate({ stationUuid: station.stationuuid }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() })
      });
    } else {
      addFavorite.mutate({ data: { stationUuid: station.stationuuid } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() })
      });
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer bg-card/80 border-white/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:border-white/10 aspect-[3/4] flex flex-col",
        isCurrent && "border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
      )}
      style={isCurrent ? { boxShadow: '0 0 0 2px hsl(var(--ambient)), 0 0 20px hsl(var(--ambient) / 0.3)' } : {}}
      onClick={handlePlayClick}
      data-testid={`station-card-${station.stationuuid}`}
    >
      {/* Full bleed artwork */}
      {station.favicon ? (
        <img 
          src={station.favicon} 
          alt={station.name} 
          className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      
      <div className={cn("absolute inset-0 bg-card flex items-center justify-center", station.favicon && "hidden")}>
        <span className="text-5xl font-bold text-muted-foreground/30 font-serif">{station.name?.charAt(0) || "F"}</span>
      </div>

      {/* Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* Play Button Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.5)] transform transition-transform group-hover:scale-110">
          {isCurrent && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
        </div>
      </div>

      {/* Heart Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-10 w-10 text-white opacity-60 hover:opacity-100 hover:bg-black/20 rounded-full z-10"
        onClick={handleFavoriteClick}
      >
        <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary opacity-100")} />
      </Button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end">
        <h3 className="font-bold text-base text-white truncate font-serif drop-shadow-md">{station.name}</h3>
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-white/70">
          {station.countrycode && (
            <span className="font-semibold bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-white">
              {station.countrycode}
            </span>
          )}
          {station.codec && (
            <span className="bg-white/10 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] uppercase text-white/80">
              {station.codec} {station.bitrate ? `· ${station.bitrate}k` : ''}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}