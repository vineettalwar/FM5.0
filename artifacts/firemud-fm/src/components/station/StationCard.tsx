import { MouseEvent } from "react";
import { Station } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Play, SquareSquare, Heart } from "lucide-react";
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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
        }
      });
    } else {
      addFavorite.mutate({ data: { stationUuid: station.stationuuid } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
        }
      });
    }
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-border/40 bg-card/40 transition-all hover:bg-card hover:border-primary/50 cursor-pointer flex flex-col",
        isCurrent && "border-primary/50 bg-card shadow-[0_0_15px_rgba(255,100,50,0.1)]"
      )}
      onClick={handlePlayClick}
      data-testid={`station-card-${station.stationuuid}`}
    >
      <div className="p-4 flex items-start gap-4">
        {/* Favicon */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted/50 flex items-center justify-center">
          {station.favicon ? (
            <img 
              src={station.favicon} 
              alt={station.name} 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={cn("text-muted-foreground", station.favicon && "hidden absolute inset-0 flex items-center justify-center bg-muted/50")}>
            <span className="text-2xl font-bold">{station.name?.charAt(0) || "F"}</span>
          </div>
          
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            isCurrent && "opacity-100"
          )}>
            {isCurrent && isPlaying ? (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <SquareSquare className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground pl-1">
                <Play className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate pr-8">{station.name}</h3>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            {station.countrycode && (
              <span className="flex items-center gap-1 font-medium bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
                {station.countrycode.toUpperCase()}
              </span>
            )}
            {station.codec && (
              <span className="bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
                {station.codec} {station.bitrate ? `· ${station.bitrate}k` : ''}
              </span>
            )}
          </div>
          
          {station.tags && (
            <p className="text-xs text-muted-foreground truncate mt-1.5">
              {station.tags.split(',').slice(0, 3).join(', ')}
            </p>
          )}
        </div>
        
        {/* Favorite */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary z-10"
          onClick={handleFavoriteClick}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
        </Button>
      </div>
    </Card>
  );
}
