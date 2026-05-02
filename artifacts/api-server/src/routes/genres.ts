import { Router } from "express";
import { getGenresCached } from "../lib/station-cache.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /genres
router.get("/genres", async (req, res) => {
  try {
    const { limit = "50" } = req.query as Record<string, string>;
    const genres = await getGenresCached(Math.min(parseInt(limit) || 50, 200));
    res.json({
      genres: genres.map((g) => ({
        name: g.name,
        stationcount: g.station_count,
      })),
    });
  } catch (err) {
    logger.error(err, "getGenres error");
    res.status(500).json({ error: "genres_failed", message: "Failed to get genres" });
  }
});

export default router;
