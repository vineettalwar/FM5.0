import { useParams } from "wouter";
import { useGetStationsByCountry, getGetStationsByCountryQueryKey } from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";
import { AnimatedPage } from "@/components/ui/AnimatedPage";

export default function CountryDetail() {
  const params = useParams();
  const countrycode = decodeURIComponent(params.countrycode || "");
  
  const { data: stationsRes, isLoading } = useGetStationsByCountry(
    countrycode,
    { limit: 48 },
    { query: { enabled: !!countrycode, queryKey: getGetStationsByCountryQueryKey(countrycode, { limit: 48 }) } }
  );

  return (
    <AnimatedPage>
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="relative rounded-3xl overflow-hidden bg-card/40 border border-white/5 p-8 md:p-16 flex flex-col justify-end min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black/40 to-black/80" />
          <div className="relative z-10 space-y-4">
            <div className="text-sm font-bold text-primary uppercase tracking-widest">Country</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase text-white font-serif">
              {countrycode}
            </h1>
            <p className="text-white/80 text-lg md:text-xl font-medium">
              {stationsRes?.total?.toLocaleString() || '...'} stations broadcasting from {countrycode.toUpperCase()}.
            </p>
          </div>
        </div>

        <StationGrid stations={stationsRes?.stations} isLoading={isLoading} />
      </div>
    </AnimatedPage>
  );
}