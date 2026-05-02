import { Router } from "express";
import { db } from "@workspace/db";
import { favoritesTable, stationsCacheTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { getStationByUuidCached, cacheRowToStation } from "../lib/station-cache.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /favorites
router.get("/favorites", async (req, res) => {
  try {
    const sessionId: string = (req as any).sessionId;
    const favRows = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.session_id, sessionId))
      .orderBy(favoritesTable.added_at);

    if (!favRows.length) {
      return res.json({ stations: [], total: 0, offset: 0, limit: 100 });
    }

    const uuids = favRows.map((f) => f.station_uuid);
    const cached = await db
      .select()
      .from(stationsCacheTable)
      .where(inArray(stationsCacheTable.stationuuid, uuids));

    const cachedMap = new Map(cached.map((s) => [s.stationuuid, s]));

    // Fetch any missing stations
    for (const uuid of uuids) {
      if (!cachedMap.has(uuid)) {
        const station = await getStationByUuidCached(uuid);
        if (station) cachedMap.set(uuid, station);
      }
    }

    const stations = uuids
      .map((u) => cachedMap.get(u))
      .filter(Boolean)
      .map(cacheRowToStation);

    return res.json({ stations, total: stations.length, offset: 0, limit: stations.length });
  } catch (err) {
    logger.error(err, "getFavorites error");
    return res.status(500).json({ error: "favorites_failed", message: "Failed to get favorites" });
  }
});

// POST /favorites
router.post("/favorites", async (req, res) => {
  try {
    const sessionId: string = (req as any).sessionId;
    const { stationUuid } = req.body as { stationUuid: string };

    if (!stationUuid) {
      return res.status(400).json({ error: "missing_uuid", message: "stationUuid is required" });
    }

    // Upsert-style: only add if not already favorited
    const existing = await db
      .select()
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, sessionId),
          eq(favoritesTable.station_uuid, stationUuid)
        )
      )
      .limit(1);

    if (!existing.length) {
      await db.insert(favoritesTable).values({
        session_id: sessionId,
        station_uuid: stationUuid,
      });
    }

    return res.json({ success: true, stationUuid });
  } catch (err) {
    logger.error(err, "addFavorite error");
    return res.status(500).json({ error: "add_favorite_failed", message: "Failed to add favorite" });
  }
});

// DELETE /favorites/:stationUuid
router.delete("/favorites/:stationUuid", async (req, res) => {
  try {
    const sessionId: string = (req as any).sessionId;
    const { stationUuid } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(
          eq(favoritesTable.session_id, sessionId),
          eq(favoritesTable.station_uuid, stationUuid)
        )
      );

    res.json({ success: true, stationUuid });
  } catch (err) {
    logger.error(err, "removeFavorite error");
    res.status(500).json({ error: "remove_favorite_failed", message: "Failed to remove favorite" });
  }
});

export default router;
