import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { PlayerBar } from "./PlayerBar";
import { MobileNav } from "./MobileNav";
import { SearchOverlay } from "./SearchOverlay";
import { usePlayer } from "@/contexts/PlayerContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentStation } = usePlayer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans relative z-0">
      <div
        className="fixed inset-0 pointer-events-none z-[-1] transition-colors duration-1000"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 100%, hsl(var(--ambient) / 0.12) 0%, transparent 70%)' }}
      />
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      
      <main className={`flex-1 ${currentStation ? 'pb-[calc(72px+56px)] md:pb-[72px]' : 'pb-[56px] md:pb-0'}`}>
        {children}
      </main>
      
      <PlayerBar />
      <MobileNav onSearchClick={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} />
    </div>
  );
}