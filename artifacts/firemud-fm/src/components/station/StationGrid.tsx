import { Station } from "@workspace/api-client-react";
import { StationCard } from "./StationCard";

interface StationGridProps {
  stations?: Station[];
  isLoading?: boolean;
}

export function StationGrid({ stations, isLoading }: StationGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-2xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card/20 rounded-2xl border border-white/5">
        No stations found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {stations.map(station => (
        <StationCard key={station.stationuuid} station={station} />
      ))}
    </div>
  );
}