import { useState } from "react";
import { 
  useSearchStations, 
  getSearchStationsQueryKey,
  useGetGenres,
  getGetGenresQueryKey,
  useGetCountries,
  getGetCountriesQueryKey,
  SearchStationsOrder
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
import { AnimatedPage } from "@/components/ui/AnimatedPage";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  
  const [genre, setGenre] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [order, setOrder] = useState<SearchStationsOrder>(SearchStationsOrder.clickcount);
  
  const searchParams = {
    query: debouncedQuery || undefined,
    genre: genre !== "all" ? genre : undefined,
    country: country !== "all" ? country : undefined,
    order,
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
    setOrder(SearchStationsOrder.clickcount);
  };

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-serif">Search & Filter</h1>
          <p className="text-muted-foreground text-lg">Find the perfect station by name, genre, or country.</p>
        </div>

        <div className="bg-card/40 border border-white/5 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stations, artists, or keywords..." 
              className="pl-12 h-14 text-lg bg-black/40 border-white/10 rounded-xl focus-visible:ring-primary"
            />
            {query && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-white rounded-full"
                onClick={() => setQuery("")}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 w-full md:w-auto text-sm font-medium text-white/60 uppercase tracking-wider">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-black/20 border-white/5 rounded-xl">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Genres</SelectItem>
                {genresRes?.genres?.map(g => (
                  <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-black/20 border-white/5 rounded-xl">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Countries</SelectItem>
                {countriesRes?.countries?.map(c => (
                  <SelectItem key={c.iso_3166_1 || c.name} value={c.iso_3166_1 || c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={order} onValueChange={(v) => {
              if ((Object.values(SearchStationsOrder) as string[]).includes(v)) {
                setOrder(v as SearchStationsOrder);
              }
            }}>
              <SelectTrigger className="w-full md:w-[200px] h-12 bg-black/20 border-white/5 rounded-xl">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <SelectItem value={SearchStationsOrder.clickcount}>Most Popular</SelectItem>
                <SelectItem value={SearchStationsOrder.votes}>Highest Rated</SelectItem>
                <SelectItem value={SearchStationsOrder.bitrate}>Audio Quality</SelectItem>
                <SelectItem value={SearchStationsOrder.name}>Name</SelectItem>
              </SelectContent>
            </Select>

            {(query || genre !== "all" || country !== "all" || order !== SearchStationsOrder.clickcount) && (
              <Button variant="ghost" className="text-white/60 hover:text-white" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm font-medium text-white/60">
            <span>{searchRes?.total ? searchRes.total.toLocaleString() : 0} stations found</span>
          </div>
          <StationGrid stations={searchRes?.stations} isLoading={searchLoading} />
        </div>
      </div>
    </AnimatedPage>
  );
}