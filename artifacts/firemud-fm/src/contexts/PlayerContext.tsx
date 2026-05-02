import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { Station } from "@workspace/api-client-react";
import { useReportStationClick } from "@workspace/api-client-react";

interface PlayerContextType {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  playStation: (station: Station) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const reportClick = useReportStationClick();

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    
    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      // fallback or error toast here
    };

    audioRef.current.addEventListener("playing", handlePlaying);
    audioRef.current.addEventListener("waiting", handleWaiting);
    audioRef.current.addEventListener("pause", handlePause);
    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("error", handleError);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.removeEventListener("playing", handlePlaying);
        audioRef.current.removeEventListener("waiting", handleWaiting);
        audioRef.current.removeEventListener("pause", handlePause);
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("error", handleError);
      }
    };
  }, []);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const playStation = async (station: Station) => {
    if (!audioRef.current || !station.url_resolved) return;
    
    // Report click
    reportClick.mutate({ uuid: station.stationuuid });
    
    if (currentStation?.stationuuid === station.stationuuid) {
      // Toggle play pause if it's the same station
      togglePlayPause();
      return;
    }
    
    setCurrentStation(station);
    setIsLoading(true);
    audioRef.current.src = station.url_resolved;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback failed:", e);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentStation) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.error("Playback error:", e));
      setIsPlaying(true);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentStation,
        isPlaying,
        volume,
        isLoading,
        playStation,
        togglePlayPause,
        setVolume
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
