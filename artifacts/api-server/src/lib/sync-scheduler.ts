import cron from "node-cron";
import { db } from "@workspace/db";
import { stationsCacheTable } from "@workspace/db";
import { lt, sql } from "drizzle-orm";
import { getGenresCached, getCountriesCached, STATION_TTL_MS } from "./station-cache.js";
import { radioBrowser } from "./radio-browser.js";
import { logger } from "./logger.js";

function parseHourInterval(raw: number, name: string, fallback: number): number {
  if (!Number.isFinite(raw) || raw < 1 || raw > 168) {
    logger.warn(`${name}=${raw} is out of range [1–168] — using default ${fallback}h`);
    return fallback;
  }
  return Math.floor(raw);
}

const STATION_TTL_HOURS = parseHourInterval(
  Number(process.env["SYNC_STATION_TTL_HOURS"] ?? 6),
  "SYNC_STATION_TTL_HOURS",
  6,
);
const GENRES_INTERVAL_HOURS = parseHourInterval(
  Number(process.env["SYNC_GENRES_INTERVAL_HOURS"] ?? 24),
  "SYNC_GENRES_INTERVAL_HOURS",
  24,
);

const BATCH_SIZE = 50;

function buildHourlyCron(hours: number): string {
  if (hours >= 24) return "0 0 * * *"; // daily at midnight (also covers >24h via stale-check gating)
  return `0 */${hours} * * *`;
}

async function syncGenresAndCountries(): Promise<void> {
  logger.info("Sync: starting genres and countries refresh");
  try {
    // Pass forceRefresh=true so the scheduler always hits the API regardless of TTL
    const genres = await getGenresCached(200, true);
    const countries = await getCountriesCached(300, true);
    logger.info(
      { genres: genres.length, countries: countries.length },
      "Sync: genres and countries refreshed",
    );
  } catch (err) {
    logger.error({ err }, "Sync: error refreshing genres and countries");
  }
}

async function syncStaleStations(): Promise<void> {
  logger.info("Sync: starting stale station cache refresh");
  try {
    const now = new Date();

    // Find stale station UUIDs (expired entries)
    const staleRows = await db
      .select({ stationuuid: stationsCacheTable.stationuuid })
      .from(stationsCacheTable)
      .where(lt(stationsCacheTable.expires_at, now));

    if (!staleRows.length) {
      logger.info("Sync complete: 0 stations refreshed (none stale)");
      return;
    }

    const staleUuids = staleRows.map((r) => r.stationuuid);
    let refreshed = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the Radio Browser API
    for (let i = 0; i < staleUuids.length; i += BATCH_SIZE) {
      const batch = staleUuids.slice(i, i + BATCH_SIZE);
      try {
        const stations = await radioBrowser.getStationsByUuids(batch);
        if (stations.length) {
          const newExpiresAt = new Date(Date.now() + STATION_TTL_MS);
          await db
            .insert(stationsCacheTable)
            .values(
              stations.map((s) => ({
                stationuuid: s.stationuuid,
                name: s.name,
                url: s.url,
                url_resolved: s.url_resolved || s.url,
                homepage: s.homepage || null,
                favicon: s.favicon || null,
                tags: s.tags
                  ? s.tags
                      .split(",")
                      .map((t: string) => t.trim())
                      .filter(Boolean)
                  : [],
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
                expires_at: newExpiresAt,
              })),
            )
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
            });
          refreshed += stations.length;

          // Stations not returned by Radio Browser may be gone — leave them stale
          const returnedUuids = new Set(stations.map((s) => s.stationuuid));
          const notFound = batch.filter((u) => !returnedUuids.has(u));
          if (notFound.length) {
            failed += notFound.length;
            logger.warn(
              { count: notFound.length },
              "Sync: stations not found in Radio Browser, leaving stale",
            );
          }
        } else {
          failed += batch.length;
        }
      } catch (batchErr) {
        failed += batch.length;
        logger.error({ err: batchErr, batchSize: batch.length }, "Sync: batch refresh failed");
      }
    }

    logger.info({ refreshed, failed }, `Sync complete: ${refreshed} stations refreshed`);
  } catch (err) {
    logger.error({ err }, "Sync: error during stale station refresh");
  }
}

export function startSyncScheduler(): void {
  const genresCron = buildHourlyCron(GENRES_INTERVAL_HOURS);
  const stationsCron = buildHourlyCron(STATION_TTL_HOURS);

  logger.info(
    {
      genresCron,
      stationsCron,
      STATION_TTL_HOURS,
      GENRES_INTERVAL_HOURS,
    },
    "Sync scheduler started",
  );

  cron.schedule(genresCron, () => {
    syncGenresAndCountries().catch((err) =>
      logger.error({ err }, "Sync: unhandled error in genres/countries job"),
    );
  });

  cron.schedule(stationsCron, () => {
    syncStaleStations().catch((err) =>
      logger.error({ err }, "Sync: unhandled error in stations job"),
    );
  });

  // Run an initial genres/countries sync shortly after startup (non-blocking)
  setTimeout(() => {
    syncGenresAndCountries().catch((err) =>
      logger.error({ err }, "Sync: startup genres/countries sync failed"),
    );
  }, 5000);
}
