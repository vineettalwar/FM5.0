import React from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Discover", icon: Radio },
    { href: "/search", label: "Search", icon: Search },
    { href: "/favorites", label: "My Stations", icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <Radio className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">FireMud FM</span>
        </Link>

        <nav className="flex items-center gap-6 flex-1">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
