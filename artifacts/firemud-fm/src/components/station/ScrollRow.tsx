import { useRef } from "react";

export function ScrollRow({ title, children }: { title?: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  return (
    <div className="relative group/row">
      {title && <h2 className="text-xl font-bold mb-4 font-serif">{title}</h2>}
      <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover/row:flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110">‹</button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-4 snap-x">
        {children}
      </div>
      <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover/row:flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 hover:scale-110">›</button>
    </div>
  );
}