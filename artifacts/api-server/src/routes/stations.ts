import { Router } from "express";
import { db } from "@workspace/db";
import {
  curatedStationsTable,
  favoritesTable,
  listeningHistoryTable,
  stationsCacheTable,
} from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  searchStationsCached,
  getTrendingStationsCached,
  getStationByUuidCached,
  cacheRowToStation,
} from "../lib/station-cache.js";
import { radioBrowser } from "../lib/radio-browser.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /stations/search
router.get("/stations/search", async (req, res) => {
  try {
    const {
      query,
      genre,
      country,
      limit = "24",
      offset = "0",
      order = "votes",
    } = req.query as Record<string, string>;

    const rows = await searchStationsCached({
      name: query || undefined,
      tag: genre || undefined,
      countrycode: country || undefined,
      limit: Math.min(parseInt(limit) || 24, 100),
      offset: parseInt(offset) || 0,
      order: order || "votes",
      reverse: ["votes", "clickcount", "clicktrend"].includes(order),
    });

    res.json({
      stations: rows.map(cacheRowToStation),
      total: rows.length,
      offset: parseInt(offset) || 0,
      limit: parseInt(limit) || 24,
    });
  } catch (err) {
    logger.error(err, "searchStations error");
    res.status(500).json({ error: "search_failed", message: "Failed to search stations" });
  }
});

// GET /stations/trending
router.get("/stations/trending", async (req, res) => {
  try {
    const { limit = "20" } = req.query as Record<string, string>;
    const rows = await getTrendingStationsCached(Math.min(parseInt(limit) || 20, 50));
    res.json({
      stations: rows.map(cacheRowToStation),
      total: rows.length,
      offset: 0,
      limit: parseInt(limit) || 20,
    });
  } catch (err) {
    logger.error(err, "getTrending error");
    res.status(500).json({ error: "trending_failed", message: "Failed to get trending stations" });
  }
});

// GET /stations/featured
router.get("/stations/featured", async (req, res) => {
  try {
    const curated = await db
      .select()
      .from(curatedStationsTable)
      .where(eq(curatedStationsTable.section, "featured"))
      .orderBy(curatedStationsTable.position);

    if (!curated.length) {
      // Fallback: return trending if no curated content
      const rows = await getTrendingStationsCached(12);
      return res.json({
        stations: rows.map(cacheRowToStation),
        total: rows.length,
        offset: 0,
        limit: 12,
      });
    }

    const uuids = curated.map((c) => c.station_uuid);
    // Fetch from cache or API
    const cached = await db
      .select()
      .from(stationsCacheTable)
      .where(inArray(stationsCacheTable.stationuuid, uuids));

    const cachedMap = new Map(cached.map((s) => [s.stationuuid, s]));
    const missing = uuids.filter((u) => !cachedMap.has(u));

    if (missing.length) {
      // Fetch missing stations from Radio Browser
      for (const uuid of missing) {
        const station = await getStationByUuidCached(uuid);
        if (station) cachedMap.set(uuid, station);
      }
    }

    const ordered = uuids
      .map((u) => cachedMap.get(u))
      .filter(Boolean) as typeof cached;

    return res.json({
      stations: ordered.map(cacheRowToStation),
      total: ordered.length,
      offset: 0,
      limit: ordered.length,
    });
  } catch (err) {
    logger.error(err, "getFeatured error");
    return res.status(500).json({ error: "featured_failed", message: "Failed to get featured stations" });
  }
});

// GET /stations/by-genre/:genre
router.get("/stations/by-genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = "24", offset = "0" } = req.query as Record<string, string>;
    const rows = await searchStationsCached({
      tag: genre,
      limit: Math.min(parseInt(limit) || 24, 100),
      offset: parseInt(offset) || 0,
      order: "votes",
      reverse: true,
    });
    res.json({
      stations: rows.map(cacheRowToStation),
      total: rows.length,
      offset: parseInt(offset) || 0,
      limit: parseInt(limit) || 24,
    });
  } catch (err) {
    logger.error(err, "getByGenre error");
    res.status(500).json({ error: "genre_failed", message: "Failed to get stations by genre" });
  }
});

// GET /stations/by-country/:countrycode
router.get("/stations/by-country/:countrycode", async (req, res) => {
  try {
    const { countrycode } = req.params;
    const { limit = "24", offset = "0" } = req.query as Record<string, string>;
    const rows = await searchStationsCached({
      countrycode: countrycode.toUpperCase(),
      limit: Math.min(parseInt(limit) || 24, 100),
      offset: parseInt(offset) || 0,
      order: "votes",
      reverse: true,
    });
    res.json({
      stations: rows.map(cacheRowToStation),
      total: rows.length,
      offset: parseInt(offset) || 0,
      limit: parseInt(limit) || 24,
    });
  } catch (err) {
    logger.error(err, "getByCountry error");
    res.status(500).json({ error: "country_failed", message: "Failed to get stations by country" });
  }
});

// POST /stations/:uuid/click — must come BEFORE /:uuid GET
router.post("/stations/:uuid/click", async (req, res) => {
  try {
    const { uuid } = req.params;
    const sessionId: string = (req as any).sessionId;

    // Forward click to Radio Browser (best effort)
    radioBrowser.reportClick(uuid).catch(() => {});

    // Log locally
    if (sessionId) {
      await db.insert(listeningHistoryTable).values({
        session_id: sessionId,
        station_uuid: uuid,
      });
    }

    res.json({ ok: true, message: "Click reported" });
  } catch (err) {
    logger.error(err, "reportClick error");
    res.json({ ok: false, message: "Click report failed" });
  }
});

// GET /stations/:uuid
router.get("/stations/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const station = await getStationByUuidCached(uuid);
    if (!station) {
      return res.status(404).json({ error: "not_found", message: "Station not found" });
    }
    return res.json(cacheRowToStation(station));
  } catch (err) {
    logger.error(err, "getStation error");
    return res.status(500).json({ error: "station_failed", message: "Failed to get station" });
  }
});

export default router;
