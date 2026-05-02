import React from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Heart, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const { currentStation, isPlaying, isLoading, volume, setVolume, togglePlayPause } = usePlayer();
  const queryClient = useQueryClient();
  
  const { data: favoritesRes } = useGetFavorites({ query: { queryKey: getGetFavoritesQueryKey() } });
  const isFavorite = currentStation ? (favoritesRes?.stations?.some(s => s.stationuuid === currentStation.stationuuid) || false) : false;
  
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  if (!currentStation) {
    return null;
  }

  const handleFavoriteClick = () => {
    if (!currentStation) return;
    
    if (isFavorite) {
      removeFavorite.mutate({ stationUuid: currentStation.stationuuid }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
        }
      });
    } else {
      addFavorite.mutate({ data: { stationUuid: currentStation.stationuuid } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
        }
      });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-safe">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* Now Playing Info */}
        <div className="flex items-center gap-3 w-1/3 min-w-0">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted flex items-center justify-center">
            {currentStation.favicon ? (
              <img 
                src={currentStation.favicon} 
                alt={currentStation.name} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn("text-muted-foreground", currentStation.favicon && "hidden")}>
              <span className="font-bold">{currentStation.name?.charAt(0) || "F"}</span>
            </div>
          </div>
          
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider">LIVE</span>
              <h4 className="font-semibold text-sm truncate">{currentStation.name}</h4>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {currentStation.tags ? currentStation.tags.split(',')[0] : 'Unknown Genre'} 
              {currentStation.countrycode ? ` · ${currentStation.countrycode.toUpperCase()}` : ''}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")} />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={togglePlayPause}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-1/3 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
            {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider
            defaultValue={[volume * 100]}
            max={100}
            step={1}
            className="w-24"
            onValueChange={(val) => setVolume(val[0] / 100)}
          />
        </div>

      </div>
    </div>
  );
}
