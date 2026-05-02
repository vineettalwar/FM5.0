import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useSearchStations, 
  getSearchStationsQueryKey,
  useGetGenres,
  getGetGenresQueryKey,
  useGetCountries,
  getGetCountriesQueryKey
} from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  
  const [genre, setGenre] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [order, setOrder] = useState<string>("clickcount");
  
  const searchParams = {
    query: debouncedQuery || undefined,
    genre: genre !== "all" ? genre : undefined,
    country: country !== "all" ? country : undefined,
    order: order as any,
    limit: 24
  };

  const { data: searchRes, isLoading: searchLoading } = useSearchStations(
    searchParams,
    { query: { queryKey: getSearchStationsQueryKey(searchParams) } }
  );

  const { data: genresRes } = useGetGenres({ limit: 100 }, { query: { queryKey: getGetGenresQueryKey({ limit: 100 }) } });
  const { data: countriesRes } = useGetCountries({ limit: 100 }, { query: { queryKey: getGetCountriesQueryKey({ limit: 100 }) } });

  const clearFilters = () => {
    setQuery("");
    setGenre("all");
    setCountry("all");
    setOrder("clickcount");
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Search & Filter</h1>
        <p className="text-muted-foreground">Find the perfect station by name, genre, or country.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl p-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stations, artists, or keywords..." 
            className="pl-10 h-12 text-lg bg-background border-border"
          />
          {query && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genresRes?.genres?.map(g => (
                <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countriesRes?.countries?.map(c => (
                <SelectItem key={c.iso_3166_1 || c.name} value={c.iso_3166_1 || c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={order} onValueChange={setOrder}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clickcount">Most Popular</SelectItem>
              <SelectItem value="votes">Highest Rated</SelectItem>
              <SelectItem value="bitrate">Audio Quality</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          {(query || genre !== "all" || country !== "all" || order !== "clickcount") && (
            <Button variant="ghost" className="text-muted-foreground" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{searchRes?.total ? searchRes.total.toLocaleString() : 0} stations found</span>
        </div>
        <StationGrid stations={searchRes?.stations} isLoading={searchLoading} />
      </div>
    </div>
  );
}
