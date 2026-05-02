import React from "react";
import { useParams } from "wouter";
import { useGetStationsByCountry, getGetStationsByCountryQueryKey } from "@workspace/api-client-react";
import { StationGrid } from "@/components/station/StationGrid";

export default function CountryDetail() {
  const params = useParams();
  const countrycode = decodeURIComponent(params.countrycode || "");
  
  const { data: stationsRes, isLoading } = useGetStationsByCountry(
    countrycode,
    { limit: 48 },
    { query: { enabled: !!countrycode, queryKey: getGetStationsByCountryQueryKey(countrycode, { limit: 48 }) } }
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2 border-b border-border/50 pb-8">
        <div className="text-sm font-medium text-primary uppercase tracking-wider mb-2">Country</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase flex items-center gap-4">
          <span>{countrycode}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          {stationsRes?.total?.toLocaleString()} stations broadcasting from {countrycode.toUpperCase()}.
        </p>
      </div>

      <StationGrid stations={stationsRes?.stations} isLoading={isLoading} />
    </div>
  );
}
