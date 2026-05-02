import React from "react";
import { Navbar } from "./Navbar";
import { PlayerBar } from "./PlayerBar";
import { usePlayer } from "@/contexts/PlayerContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentStation } = usePlayer();
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      
      {/* 
        Add padding bottom if player is active so content isn't hidden behind it.
        Player bar height is 80px (h-20) 
      */}
      <main className={`flex-1 ${currentStation ? 'pb-24' : ''}`}>
        {children}
      </main>
      
      <PlayerBar />
    </div>
  );
}
