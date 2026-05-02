import { useParams } from "wouter";
import { useGetStationsByGenre, getGetStationsByGenreQueryKey } from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { AnimatedPage } from "@/components/ui/AnimatedPage";
import { GENRE_COLORS } from "@/components/station/GenreCard";

export default function GenreDetail() {
  const params = useParams();
  const genre = decodeURIComponent(params.genre || "");
  
  const color = GENRE_COLORS[genre.toLowerCase()] || '#475569';
  
  const { data: stationsRes, isLoading } = useGetStationsByGenre(
    genre,
    { limit: 48 },
    { query: { enabled: !!genre, queryKey: getGetStationsByGenreQueryKey(genre, { limit: 48 }) } }
  );

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-16 flex flex-col justify-end min-h-[300px]" style={{ backgroundColor: color }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative z-10 space-y-4">
            <div className="text-sm font-bold text-white/70 uppercase tracking-widest">Genre</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight capitalize text-white font-serif drop-shadow-md">{genre}</h1>
            <p className="text-white/80 text-lg md:text-xl font-medium">
              {stationsRes?.total?.toLocaleString() || '...'} stations playing {genre} music.
            </p>
          </div>
        </div>

        <StationGrid stations={stationsRes?.stations} isLoading={isLoading} />
      </div>
    </AnimatedPage>
  );
}