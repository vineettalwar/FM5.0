import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { Station } from "@workspace/api-client-react";
import { useReportStationClick } from "@workspace/api-client-react";

interface PlayerContextType {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  isExpanded: boolean;
  ambientColor: string;
  playStation: (station: Station) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setIsExpanded: (v: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientColor, setAmbientColor] = useState("22 95% 53%");
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

  useEffect(() => {
    if (!currentStation?.favicon) {
      setAmbientColor("22 95% 53%");
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentStation.favicon;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          // Simple RGB to HSL approximation for primary colors
          const max = Math.max(r, g, b) / 255;
          const min = Math.min(r, g, b) / 255;
          let h = 0, s = 0, l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r / 255: h = (g / 255 - b / 255) / d + (g < b ? 6 : 0); break;
              case g / 255: h = (b / 255 - r / 255) / d + 2; break;
              case b / 255: h = (r / 255 - g / 255) / d + 4; break;
            }
            h /= 6;
          }
          setAmbientColor(`${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`);
        }
      } catch (e) {
        setAmbientColor("22 95% 53%");
      }
    };
    img.onerror = () => setAmbientColor("22 95% 53%");
  }, [currentStation]);

  useEffect(() => {
    document.documentElement.style.setProperty('--ambient', ambientColor);
  }, [ambientColor]);

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const playStation = async (station: Station) => {
    if (!audioRef.current || !station.url_resolved) return;
    
    reportClick.mutate({ uuid: station.stationuuid });
    
    if (currentStation?.stationuuid === station.stationuuid) {
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
        isExpanded,
        ambientColor,
        playStation,
        togglePlayPause,
        setVolume,
        setIsExpanded
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