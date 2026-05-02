import { db } from "@workspace/db";
import {
  stationsCacheTable,
  genresCacheTable,
  countriesCacheTable,
  type StationCache,
  type GenreCache,
  type CountryCache,
} from "@workspace/db";
import { eq, lt, inArray, sql } from "drizzle-orm";
import { radioBrowser, type RBStation, type SearchParams } from "./radio-browser.js";

const STATION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const GENRE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const COUNTRY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Convert Radio Browser station to our cache schema format
function rbStationToCache(s: RBStation): typeof stationsCacheTable.$inferInsert {
  return {
    stationuuid: s.stationuuid,
    name: s.name,
    url: s.url,
    url_resolved: s.url_resolved || s.url,
    homepage: s.homepage || null,
    favicon: s.favicon || null,
    tags: s.tags ? s.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    country: s.country || null,
    countrycode: s.countrycode || null,
    state: s.state || null,
    language: s.language || null,
    languagecodes: s.languagecodes || null,
    codec: s.codec || null,
    bitrate: s.bitrate || null,
    hls: s.hls ?? null,
    lastcheckok: Boolean(s.lastcheckok),
    votes: s.votes ?? null,
    clickcount: s.clickcount ?? null,
    clicktrend: s.clicktrend ?? null,
    geo_lat: s.geo_lat != null ? String(s.geo_lat) : null,
    geo_long: s.geo_long != null ? String(s.geo_long) : null,
    expires_at: new Date(Date.now() + STATION_TTL_MS),
  };
}

// Convert cache row to API response shape
export function cacheRowToStation(row: StationCache) {
  return {
    stationuuid: row.stationuuid,
    name: row.name,
    url_resolved: row.url_resolved ?? row.url ?? "",
    url: row.url ?? "",
    homepage: row.homepage ?? "",
    favicon: row.favicon ?? "",
    tags: row.tags ? row.tags.join(",") : "",
    country: row.country ?? "",
    countrycode: row.countrycode ?? "",
    state: row.state ?? "",
    language: row.language ?? "",
    codec: row.codec ?? "",
    bitrate: row.bitrate ?? 0,
    hls: row.hls ?? 0,
    lastcheckok: row.lastcheckok ?? false,
    votes: row.votes ?? 0,
    clickcount: row.clickcount ?? 0,
    clicktrend: row.clicktrend ?? 0,
    geo_lat: row.geo_lat ?? "",
    geo_long: row.geo_long ?? "",
  };
}

async function upsertStations(stations: RBStation[]): Promise<StationCache[]> {
  if (!stations.length) return [];
  const rows = stations.map(rbStationToCache);
  return db
    .insert(stationsCacheTable)
    .values(rows)
    .onConflictDoUpdate({
      target: stationsCacheTable.stationuuid,
      set: {
        name: sql`excluded.name`,
        url: sql`excluded.url`,
        url_resolved: sql`excluded.url_resolved`,
        homepage: sql`excluded.homepage`,
        favicon: sql`excluded.favicon`,
        tags: sql`excluded.tags`,
        country: sql`excluded.country`,
        countrycode: sql`excluded.countrycode`,
        state: sql`excluded.state`,
        language: sql`excluded.language`,
        languagecodes: sql`excluded.languagecodes`,
        codec: sql`excluded.codec`,
        bitrate: sql`excluded.bitrate`,
        hls: sql`excluded.hls`,
        lastcheckok: sql`excluded.lastcheckok`,
        votes: sql`excluded.votes`,
        clickcount: sql`excluded.clickcount`,
        clicktrend: sql`excluded.clicktrend`,
        geo_lat: sql`excluded.geo_lat`,
        geo_long: sql`excluded.geo_long`,
        cached_at: sql`now()`,
        expires_at: sql`excluded.expires_at`,
      },
    })
    .returning();
}

export async function searchStationsCached(params: SearchParams): Promise<StationCache[]> {
  const rbResults = await radioBrowser.searchStations(params);
  if (!rbResults.length) return [];
  return upsertStations(rbResults);
}

export async function getStationByUuidCached(uuid: string): Promise<StationCache | null> {
  // Check fresh cache first
  const cached = await db
    .select()
    .from(stationsCacheTable)
    .where(eq(stationsCacheTable.stationuuid, uuid))
    .limit(1);
  if (cached.length && cached[0].expires_at > new Date()) {
    return cached[0];
  }
  // Fetch from Radio Browser API
  const station = await radioBrowser.getStationByUuid(uuid);
  if (!station) return null;
  const rows = await upsertStations([station]);
  return rows[0] ?? null;
}

export async function getTrendingStationsCached(limit = 20): Promise<StationCache[]> {
  const rbResults = await radioBrowser.getTopStations(limit);
  if (!rbResults.length) return [];
  return upsertStations(rbResults);
}

export async function getGenresCached(limit = 200): Promise<GenreCache[]> {
  // Check if we have fresh data
  const existing = await db
    .select()
    .from(genresCacheTable)
    .limit(1);
  
  if (existing.length) {
    const ageMs = Date.now() - existing[0].cached_at.getTime();
    if (ageMs < GENRE_TTL_MS) {
      return db
        .select()
        .from(genresCacheTable)
        .orderBy(sql`${genresCacheTable.station_count} DESC`)
        .limit(limit);
    }
  }

  // Refresh from API
  const tags = await radioBrowser.getTags(limit);
  if (tags.length) {
    await db.delete(genresCacheTable);
    await db.insert(genresCacheTable).values(
      tags.map((t) => ({ name: t.name, station_count: t.stationcount }))
    );
  }
  return db
    .select()
    .from(genresCacheTable)
    .orderBy(sql`${genresCacheTable.station_count} DESC`)
    .limit(limit);
}

export async function getCountriesCached(limit = 300): Promise<CountryCache[]> {
  const existing = await db
    .select()
    .from(countriesCacheTable)
    .limit(1);
  
  if (existing.length) {
    const ageMs = Date.now() - existing[0].cached_at.getTime();
    if (ageMs < COUNTRY_TTL_MS) {
      return db
        .select()
        .from(countriesCacheTable)
        .orderBy(sql`${countriesCacheTable.station_count} DESC`)
        .limit(limit);
    }
  }

  const countries = await radioBrowser.getCountries(limit);
  if (countries.length) {
    await db.delete(countriesCacheTable);
    await db.insert(countriesCacheTable).values(
      countries.map((c) => ({
        name: c.name,
        iso_3166_1: c.iso_3166_1 || null,
        station_count: c.stationcount,
      }))
    );
  }
  return db
    .select()
    .from(countriesCacheTable)
    .orderBy(sql`${countriesCacheTable.station_count} DESC`)
    .limit(limit);
}
