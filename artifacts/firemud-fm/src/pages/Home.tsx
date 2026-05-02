import { 
  useGetTrendingStations, 
  getGetTrendingStationsQueryKey,
  useGetFeaturedStations,
  getGetFeaturedStationsQueryKey,
  useGetListeningHistory,
  getGetListeningHistoryQueryKey,
  useGetGenres,
  getGetGenresQueryKey
} from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { FeaturedHero } from "@/components/station/FeaturedHero";
import { GenreCard } from "@/components/station/GenreCard";
import { ScrollRow } from "@/components/station/ScrollRow";
import { StationCard } from "@/components/station/StationCard";
import { AnimatedPage } from "@/components/ui/AnimatedPage";

export default function Home() {
  const { data: trendingRes, isLoading: trendingLoading } = useGetTrendingStations(
    { limit: 12 }, 
    { query: { queryKey: getGetTrendingStationsQueryKey({ limit: 12 }) } }
  );

  const { data: featuredRes, isLoading: featuredLoading } = useGetFeaturedStations(
    { query: { queryKey: getGetFeaturedStationsQueryKey() } }
  );

  const { data: historyRes, isLoading: historyLoading } = useGetListeningHistory(
    { limit: 12 },
    { query: { queryKey: getGetListeningHistoryQueryKey({ limit: 12 }) } }
  );

  const { data: genresRes, isLoading: genresLoading } = useGetGenres(
    { limit: 12 },
    { query: { queryKey: getGetGenresQueryKey({ limit: 12 }) } }
  );

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 space-y-16">
        
        {/* Hero Section */}
        <FeaturedHero station={featuredRes?.stations?.[0]} isLoading={featuredLoading} />

        {/* Recent History */}
        {historyRes?.stations && historyRes.stations.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight font-serif">Jump Back In</h2>
              <Link href="/favorites" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center">
                View History <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <ScrollRow>
              {historyLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-[160px] md:w-[200px] aspect-[3/4] rounded-2xl bg-card animate-pulse" />
                ))
              ) : (
                historyRes.stations.map(station => (
                  <div key={station.stationuuid} className="shrink-0 w-[160px] md:w-[200px]">
                    <StationCard station={station} />
                  </div>
                ))
              )}
            </ScrollRow>
          </section>
        )}

        {/* Trending */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 font-serif">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Now Trending
            </h2>
            <Link href="/search?order=clicktrend" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center">
              See More <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <ScrollRow>
            {trendingLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[160px] md:w-[200px] aspect-[3/4] rounded-2xl bg-card animate-pulse" />
              ))
            ) : (
              trendingRes?.stations?.map(station => (
                <div key={station.stationuuid} className="shrink-0 w-[160px] md:w-[200px]">
                  <StationCard station={station} />
                </div>
              ))
            )}
          </ScrollRow>
        </section>

        {/* Browse Genres */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight font-serif">Browse Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {genresLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-28 md:h-32 rounded-2xl bg-card animate-pulse" />
              ))
            ) : (
              genresRes?.genres?.map(genre => (
                <GenreCard key={genre.name} name={genre.name} count={genre.stationcount} />
              ))
            )}
          </div>
        </section>

        {/* Editor's Picks */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight font-serif">Editor's Picks</h2>
          </div>
          <ScrollRow>
            {featuredLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shrink-0 w-[160px] md:w-[200px] aspect-[3/4] rounded-2xl bg-card animate-pulse" />
              ))
            ) : (
              featuredRes?.stations?.slice(1).map(station => (
                <div key={station.stationuuid} className="shrink-0 w-[160px] md:w-[200px]">
                  <StationCard station={station} />
                </div>
              ))
            )}
          </ScrollRow>
        </section>

      </div>
    </AnimatedPage>
  );
}