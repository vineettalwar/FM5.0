import app from "./app.js";
import { pool } from "@workspace/db";
import { logger } from "./lib/logger.js";
import { seedCuratedStations } from "./lib/seed-curated.js";
import { startSyncScheduler } from "./lib/sync-scheduler.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Seed curated stations (no-op if already seeded)
  seedCuratedStations().catch((e) => logger.warn(e, "Seed failed"));

  // Verify DB connection before starting background sync scheduler
  pool
    .query("SELECT 1")
    .then(() => {
      logger.info("DB connection confirmed — starting sync scheduler");
      startSyncScheduler();
    })
    .catch((dbErr) => {
      logger.error({ err: dbErr }, "DB connection check failed — sync scheduler not started");
    });
});
