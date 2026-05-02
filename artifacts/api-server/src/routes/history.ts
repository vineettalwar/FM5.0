import { Router } from "express";
import { db } from "@workspace/db";
import { listeningHistoryTable, stationsCacheTable } from "@workspace/db";
import { eq, inArray, desc } from "drizzle-orm";
import { getStationByUuidCached, cacheRowToStation } from "../lib/station-cache.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /history
router.get("/history", async (req, res) => {
  try {
    const sessionId: string = (req as any).sessionId;
    const { limit = "20" } = req.query as Record<string, string>;
    const cap = Math.min(parseInt(limit) || 20, 50);

    const historyRows = await db
      .select()
      .from(listeningHistoryTable)
      .where(eq(listeningHistoryTable.session_id, sessionId))
      .orderBy(desc(listeningHistoryTable.listened_at))
      .limit(cap);

    if (!historyRows.length) {
      return res.json({ stations: [], total: 0, offset: 0, limit: cap });
    }

    // Dedupe by UUID preserving recency order
    const seen = new Set<string>();
    const uniqueUuids: string[] = [];
    for (const row of historyRows) {
      if (!seen.has(row.station_uuid)) {
        seen.add(row.station_uuid);
        uniqueUuids.push(row.station_uuid);
      }
    }

    const cached = await db
      .select()
      .from(stationsCacheTable)
      .where(inArray(stationsCacheTable.stationuuid, uniqueUuids));

    const cachedMap = new Map(cached.map((s) => [s.stationuuid, s]));

    for (const uuid of uniqueUuids) {
      if (!cachedMap.has(uuid)) {
        const station = await getStationByUuidCached(uuid);
        if (station) cachedMap.set(uuid, station);
      }
    }

    const stations = uniqueUuids
      .map((u) => cachedMap.get(u))
      .filter(Boolean)
      .map(cacheRowToStation);

    return res.json({ stations, total: stations.length, offset: 0, limit: cap });
  } catch (err) {
    logger.error(err, "getHistory error");
    return res.status(500).json({ error: "history_failed", message: "Failed to get history" });
  }
});

export default router;
