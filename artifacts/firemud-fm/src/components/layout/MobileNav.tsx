import { Link, useLocation } from "wouter";
import { Search, Heart, Radio, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  onSearchClick: () => void;
}

export function MobileNav({ onSearchClick }: MobileNavProps) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Radio },
    { action: 'search', label: "Search", icon: Search },
    { href: "/genre/pop", label: "Genres", icon: Compass },
    { href: "/favorites", label: "Favorites", icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-[56px] bg-black/80 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around md:hidden pb-safe">
      {links.map((link, i) => {
        const isActive = link.href ? (location === link.href || (link.href !== '/' && location.startsWith('/genre') && link.label === 'Genres')) : false;
        
        if (link.action === 'search') {
          return (
            <button 
              key={i} 
              onClick={onSearchClick}
              className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-white transition-colors"
            >
              <link.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-medium leading-none">{link.label}</span>
            </button>
          );
        }

        return (
          <Link 
            key={i} 
            href={link.href!}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-white"
            )}
          >
            <link.icon className="h-5 w-5 mb-1" />
            <span className="text-[10px] font-medium leading-none">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}