/**
 * Seeds curated/featured stations into the database.
 * These are well-known, globally popular stations identified by their
 * stable Radio Browser UUIDs — metadata always comes live from the API.
 *
 * Run once at startup if the table is empty.
 */
import { db } from "@workspace/db";
import { curatedStationsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger.js";

// Hand-picked globally popular stations (Radio Browser UUIDs)
const FEATURED_STATIONS = [
  { uuid: "96202f73-0601-11e8-ae97-52543be04c81", position: 1 },  // BBC World Service
  { uuid: "9617a958-0601-11e8-ae97-52543be04c81", position: 2 },  // BBC Radio 1
  { uuid: "db93a00f-9191-46ab-9e87-ec9b373b3eee", position: 3 },  // Arrow Classic Rock (NL)
  { uuid: "9618da58-0601-11e8-ae97-52543be04c81", position: 4 },  // BBC Radio 2
  { uuid: "9617a958-0601-11e8-ae97-52543be04c81", position: 5 },  // BBC Radio 1 (alt)
  { uuid: "78552b26-0601-11e8-ae97-52543be04c81", position: 6 },  // NPR News
  { uuid: "f8671280-58e9-11e9-8e59-52543be04c81", position: 7 },  // Radio Paradise
  { uuid: "96202f73-0601-11e8-ae97-52543be04c81", position: 8 },  // filler
];

export async function seedCuratedStations() {
  try {
    const existing = await db
      .select()
      .from(curatedStationsTable)
      .limit(1);

    if (existing.length > 0) return; // already seeded

    const rows = FEATURED_STATIONS.map((s) => ({
      station_uuid: s.uuid,
      position: s.position,
      section: "featured" as const,
    }));

    // Remove duplicates by uuid
    const seen = new Set<string>();
    const unique = rows.filter((r) => {
      if (seen.has(r.station_uuid)) return false;
      seen.add(r.station_uuid);
      return true;
    });

    await db.insert(curatedStationsTable).values(unique);
    logger.info(`Seeded ${unique.length} curated stations`);
  } catch (err) {
    logger.warn(err, "Failed to seed curated stations (non-fatal)");
  }
}
