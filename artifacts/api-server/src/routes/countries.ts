import { Router } from "express";
import { getCountriesCached } from "../lib/station-cache.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /countries
router.get("/countries", async (req, res) => {
  try {
    const { limit = "100" } = req.query as Record<string, string>;
    const countries = await getCountriesCached(Math.min(parseInt(limit) || 100, 300));
    res.json({
      countries: countries.map((c) => ({
        name: c.name,
        iso_3166_1: c.iso_3166_1 ?? "",
        stationcount: c.station_count,
      })),
    });
  } catch (err) {
    logger.error(err, "getCountries error");
    res.status(500).json({ error: "countries_failed", message: "Failed to get countries" });
  }
});

export default router;
