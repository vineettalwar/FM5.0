import { 
  useGetFavorites, 
  getGetFavoritesQueryKey,
  useGetListeningHistory,
  getGetListeningHistoryQueryKey
} from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, History } from "lucide-react";
import { AnimatedPage } from "@/components/ui/AnimatedPage";

export default function Favorites() {
  const { data: favoritesRes, isLoading: favoritesLoading } = useGetFavorites(
    { query: { queryKey: getGetFavoritesQueryKey() } }
  );

  const { data: historyRes, isLoading: historyLoading } = useGetListeningHistory(
    { limit: 48 },
    { query: { queryKey: getGetListeningHistoryQueryKey({ limit: 48 }) } }
  );

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif">My Stations</h1>
          <p className="text-muted-foreground text-lg">Your saved favorites and listening history.</p>
        </div>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-xl h-14">
            <TabsTrigger value="favorites" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base h-full">
              <Heart className="h-5 w-5" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base h-full">
              <History className="h-5 w-5" /> History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="mt-8 animate-in fade-in duration-500">
            <StationGrid stations={favoritesRes?.stations} isLoading={favoritesLoading} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-8 animate-in fade-in duration-500">
            <StationGrid stations={historyRes?.stations} isLoading={historyLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}