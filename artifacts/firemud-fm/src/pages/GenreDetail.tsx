import React from "react";
import { useParams } from "wouter";
import { useGetStationsByGenre, getGetStationsByGenreQueryKey } from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";

export default function GenreDetail() {
  const params = useParams();
  const genre = decodeURIComponent(params.genre || "");
  
  const { data: stationsRes, isLoading } = useGetStationsByGenre(
    genre,
    { limit: 48 },
    { query: { enabled: !!genre, queryKey: getGetStationsByGenreQueryKey(genre, { limit: 48 }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2 border-b border-border/50 pb-8">
        <div className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Genre</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight capitalize">{genre}</h1>
        <p className="text-muted-foreground text-lg">
          {stationsRes?.total?.toLocaleString()} stations playing {genre} music.
        </p>
      </div>

      <StationGrid stations={stationsRes?.stations} isLoading={isLoading} />
    </div>
  );
}
