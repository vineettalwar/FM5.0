import React, { useEffect, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Heart, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function PlayerBar() {
  const { currentStation, isPlaying, isLoading, volume, setVolume, togglePlayPause, setIsExpanded } = usePlayer();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (currentStation) {
      setTimeout(() => setMounted(true), 50);
    } else {
      setMounted(false);
    }
  }, [currentStation]);

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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() })
      });
    } else {
      addFavorite.mutate({ data: { stationUuid: currentStation.stationuuid } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() })
      });
    }
  };

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-50 h-[72px] bg-black/70 backdrop-blur-2xl border-t border-white/5 transition-transform duration-500 ease-out pb-safe",
        "bottom-[56px] md:bottom-0", // sits above mobile nav
        mounted ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--ambient) / 0.6), transparent)' }} />
      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* Left Zone - Info (Clickable) */}
        <div 
          className="flex items-center gap-3 w-1/2 md:w-1/3 min-w-0 cursor-pointer group"
          onClick={() => setIsExpanded(true)}
        >
          <div 
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card flex items-center justify-center transition-all group-hover:scale-105"
            style={isPlaying ? { boxShadow: '0 0 0 2px hsl(var(--ambient))' } : undefined}
          >
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
              <span className="font-bold text-lg">{currentStation.name?.charAt(0) || "F"}</span>
            </div>
          </div>
          
          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              {isPlaying && (
                <span className="bg-red-500/20 text-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                </span>
              )}
              <h4 className="font-medium text-sm text-white truncate">{currentStation.name}</h4>
            </div>
            <p className="text-xs text-white/50 truncate mt-0.5 group-hover:text-white/70 transition-colors">
              {currentStation.tags ? currentStation.tags.split(',')[0] : 'Unknown Genre'}
            </p>
          </div>
        </div>

        {/* Center Zone - Play Button */}
        <div className="flex items-center justify-center">
          <Button
            size="icon"
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-transform hover:scale-105"
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

        {/* Right Zone - Actions */}
        <div className="hidden md:flex items-center gap-4 w-1/3 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full"
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")} />
          </Button>
          
          <div className="flex items-center gap-3 w-32">
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 shrink-0" onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="flex-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
              onValueChange={(val) => setVolume(val[0] / 100)}
            />
          </div>
        </div>

        {/* Mobile Right Zone - Heart only */}
        <div className="md:hidden flex items-center justify-end w-1/2 min-w-0 pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/50 hover:text-white rounded-full"
            onClick={handleFavoriteClick}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-primary text-primary")} />
          </Button>
        </div>
      </div>
    </div>
  );
}