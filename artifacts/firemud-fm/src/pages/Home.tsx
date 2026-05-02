import React from "react";
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
import { ChevronRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: trendingRes, isLoading: trendingLoading } = useGetTrendingStations(
    { limit: 8 }, 
    { query: { queryKey: getGetTrendingStationsQueryKey({ limit: 8 }) } }
  );

  const { data: featuredRes, isLoading: featuredLoading } = useGetFeaturedStations(
    { query: { queryKey: getGetFeaturedStationsQueryKey() } }
  );

  const { data: historyRes, isLoading: historyLoading } = useGetListeningHistory(
    { limit: 4 },
    { query: { queryKey: getGetListeningHistoryQueryKey({ limit: 4 }) } }
  );

  const { data: genresRes, isLoading: genresLoading } = useGetGenres(
    { limit: 12 },
    { query: { queryKey: getGetGenresQueryKey({ limit: 12 }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-card border border-border/50 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background pointer-events-none" />
        
        <div className="relative z-10 flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Discover the World's <span className="text-primary">Radio</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            Tune into thousands of internet radio stations. Premium audio quality, curated selections, and live broadcasts from every corner of the globe.
          </p>
          <div className="flex gap-4 pt-4">
            <Link href="/search" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Start Listening
            </Link>
          </div>
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-3xl shadow-[0_0_60px_rgba(var(--primary),0.2)]">
          <PlayCircle className="w-32 h-32 text-primary/50" />
        </div>
      </section>

      {/* Recent History */}
      {historyRes?.stations && historyRes.stations.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Jump Back In</h2>
            <Link href="/favorites" className="text-sm font-medium text-primary hover:underline flex items-center">
              View History <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <StationGrid stations={historyRes.stations} isLoading={historyLoading} />
        </section>
      )}

      {/* Trending */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Now Trending
          </h2>
          <Link href="/search?order=clicktrend" className="text-sm font-medium text-primary hover:underline flex items-center">
            See More <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <StationGrid stations={trendingRes?.stations} isLoading={trendingLoading} />
      </section>

      {/* Browse Genres */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Browse Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {genresLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-card border border-border/40 animate-pulse" />
            ))
          ) : (
            genresRes?.genres?.map(genre => (
              <Link 
                key={genre.name} 
                href={`/genre/${encodeURIComponent(genre.name)}`}
                className="group relative h-24 rounded-xl border border-border/40 bg-card/40 hover:bg-card hover:border-primary/50 transition-all p-4 flex flex-col justify-end overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PlayCircle className="w-12 h-12" />
                </div>
                <span className="font-semibold truncate z-10 group-hover:text-primary transition-colors">{genre.name}</span>
                <span className="text-xs text-muted-foreground z-10">{genre.stationcount.toLocaleString()} stations</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Featured Picks */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Editor's Picks</h2>
        </div>
        <StationGrid stations={featuredRes?.stations} isLoading={featuredLoading} />
      </section>

    </div>
  );
}
