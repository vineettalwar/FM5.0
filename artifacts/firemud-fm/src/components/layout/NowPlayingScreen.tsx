import { useRef, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Heart, Volume2, VolumeX, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useSearchStations, getSearchStationsQueryKey, useAddFavorite, useRemoveFavorite, useGetFavorites, getGetFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollRow } from "@/components/station/ScrollRow";

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;

export function NowPlayingScreen() {
  const { currentStation, isPlaying, isLoading, isExpanded, setIsExpanded, togglePlayPause, volume, setVolume, playStation } = usePlayer();
  const queryClient = useQueryClient();

  const [dragY, setDragY] = useState(0);
  const dragStartY = useRef<number | null>(null);
  const dragStartTime = useRef<number | null>(null);
  const isDragging = useRef(false);

  const { data: favoritesRes } = useGetFavorites({ query: { queryKey: getGetFavoritesQueryKey() } });
  const isFavorite = currentStation ? (favoritesRes?.stations?.some(s => s.stationuuid === currentStation.stationuuid) || false) : false;

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const tag = currentStation?.tags?.split(',')[0]?.trim();
  const { data: relatedRes } = useSearchStations(
    { genre: tag, limit: 8 },
    { query: { enabled: !!tag && isExpanded, queryKey: getSearchStationsQueryKey({ genre: tag, limit: 8 }) } }
  );

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

  // Drag handlers scoped to the drag handle strip only
  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    dragStartTime.current = Date.now();
    isDragging.current = true;
    setDragY(0);
  };

  const onHandlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || dragStartY.current === null) return;
    const delta = e.clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  };

  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || dragStartY.current === null || dragStartTime.current === null) return;
    const delta = e.clientY - dragStartY.current;
    const elapsed = Math.max(1, Date.now() - dragStartTime.current);
    const velocity = delta / elapsed;
    isDragging.current = false;
    dragStartY.current = null;
    dragStartTime.current = null;
    if (delta > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      setDragY(0);
      setIsExpanded(false);
    } else {
      setDragY(0);
    }
  };

  if (!currentStation) return null;

  const transitionStyle = dragY > 0
    ? { transform: `translateY(${dragY}px)`, transition: 'none' }
    : {
        transform: isExpanded ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 500ms cubic-bezier(0.32, 0.72, 0, 1)'
      };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/90 backdrop-blur-3xl overflow-hidden"
      style={transitionStyle}
    >
      {/* Blurred background */}
      {currentStation.favicon && (
        <img
          src={currentStation.favicon}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-30 pointer-events-none"
          crossOrigin="anonymous"
        />
      )}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Top Bar — drag handle handles swipe-down */}
      <div className="relative z-10 flex flex-col items-center pt-4 pb-2 px-4 shrink-0">
        {/* Drag handle strip — only this area initiates swipe-down */}
        <div
          className="w-full flex justify-center pb-4 cursor-grab active:cursor-grabbing touch-pan-y"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>
        <div className="w-full flex justify-between items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(false)}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
          <span className="text-white/60 font-medium text-xs tracking-widest uppercase">Now Playing</span>
          <div className="w-10" />
        </div>
      </div>

      {/* Scrollable Main Content — native scroll works here, no touch-none */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 min-h-0 overflow-y-auto scrollbar-none pb-24">

        {/* Artwork */}
        <div className="relative mb-10 shrink-0 w-64 h-64 sm:w-80 sm:h-80">
          <div
            className="absolute inset-0 rounded-3xl opacity-50 scale-105"
            style={{ background: `radial-gradient(circle, hsl(var(--ambient)) 0%, transparent 70%)`, filter: 'blur(30px)' }}
          />
          <div className="w-full h-full bg-card rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 flex items-center justify-center">
            {currentStation.favicon ? (
              <img src={currentStation.favicon} alt={currentStation.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-bold text-muted-foreground">{currentStation.name?.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Info & Live Waveform */}
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-2 mb-8">
          <div className="flex items-center justify-center gap-3 w-full">
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-4 shrink-0">
                {[0, 1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-t-sm"
                    style={{
                      height: '100%',
                      animation: `live-bar 1s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif truncate w-full px-4">{currentStation.name}</h2>
          </div>
          <p className="text-white/60 text-sm sm:text-base">
            {currentStation.tags ? currentStation.tags.split(',')[0] : 'Unknown Genre'}
            {currentStation.country ? ` · ${currentStation.country}` : ''}
          </p>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md flex flex-col gap-8 mb-8 shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="h-12 w-12 rounded-full text-white/60 hover:text-white hover:bg-white/10"
            >
              <Heart className={cn("h-6 w-6", isFavorite && "fill-primary text-primary")} />
            </Button>

            <Button
              size="icon"
              className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-transform hover:scale-105"
              onClick={togglePlayPause}
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1.5" />
              )}
            </Button>

            <div className="w-12 h-12" />
          </div>

          {/* Volume */}
          <div className="flex items-center gap-4 w-full px-6">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60"
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
            >
              {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="flex-1 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              onValueChange={(val) => setVolume(val[0] / 100)}
            />
          </div>
        </div>

        {/* You May Also Like */}
        {relatedRes?.stations && relatedRes.stations.length > 0 && (
          <div className="w-full max-w-3xl mt-auto pt-8 border-t border-white/10 shrink-0">
            <h3 className="text-white/80 font-bold mb-4 px-2">You May Also Like</h3>
            <ScrollRow>
              {relatedRes.stations.filter(s => s.stationuuid !== currentStation.stationuuid).map(station => (
                <div
                  key={station.stationuuid}
                  className="shrink-0 w-[200px] flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => playStation(station)}
                >
                  <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {station.favicon ? (
                      <img src={station.favicon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-white/50">{station.name.charAt(0)}</span>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-sm truncate">{station.name}</p>
                    <p className="text-white/50 text-xs truncate">{station.tags?.split(',')[0] || ''}</p>
                  </div>
                </div>
              ))}
            </ScrollRow>
          </div>
        )}
      </div>
    </div>
  );
}
