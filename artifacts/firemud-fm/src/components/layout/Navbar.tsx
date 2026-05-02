import { Link, useLocation } from "wouter";
import { Search, Heart, Radio, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Discover" },
    { href: "/genre/pop", label: "Genres" },
    { href: "/favorites", label: "My Stations" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between md:justify-start">
        <Link href="/" className="mr-8 flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:scale-105 transition-transform">
            <Radio className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight font-serif hidden md:block">FireMud</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 flex-1">
          {links.map((link) => {
            const isActive = link.href === '/' ? location === '/' : location.startsWith(link.href.split('/')[1] ? `/${link.href.split('/')[1]}` : link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-white relative py-2",
                  isActive ? "text-white" : "text-white/50"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {onSearchOpen && (
            <Button variant="ghost" size="icon" onClick={onSearchOpen} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full flex">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button asChild variant="outline" className="hidden md:flex rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-white font-medium ml-2">
            <Link href="/search">Browse All</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}