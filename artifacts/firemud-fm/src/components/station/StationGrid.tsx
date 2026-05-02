import { Station } from "@workspace/api-client-react";
import { StationCard } from "./StationCard";

interface StationGridProps {
  stations?: Station[];
  isLoading?: boolean;
}

export function StationGrid({ stations, isLoading }: StationGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[98px] rounded-xl bg-card border border-border/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card/20 rounded-xl border border-border/40">
        No stations found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stations.map(station => (
        <StationCard key={station.stationuuid} station={station} />
      ))}
    </div>
  );
}
