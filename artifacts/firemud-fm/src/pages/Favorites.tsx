import React from "react";
import { 
  useGetFavorites, 
  getGetFavoritesQueryKey,
  useGetListeningHistory,
  getGetListeningHistoryQueryKey
} from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, History } from "lucide-react";

export default function Favorites() {
  const { data: favoritesRes, isLoading: favoritesLoading } = useGetFavorites(
    { query: { queryKey: getGetFavoritesQueryKey() } }
  );

  const { data: historyRes, isLoading: historyLoading } = useGetListeningHistory(
    { limit: 24 },
    { query: { queryKey: getGetListeningHistoryQueryKey({ limit: 24 }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Stations</h1>
        <p className="text-muted-foreground">Your saved favorites and listening history.</p>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="w-full max-w-[400px] grid w-full grid-cols-2">
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> Favorites
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="mt-8">
          <StationGrid stations={favoritesRes?.stations} isLoading={favoritesLoading} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-8">
          <StationGrid stations={historyRes?.stations} isLoading={historyLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
