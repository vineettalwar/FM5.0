import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── stations_cache ──────────────────────────────────────────────────────────
// Mirrors Radio Browser API station payload. url_resolved is the live playback URL.
export const stationsCacheTable = pgTable("stations_cache", {
  stationuuid: text("stationuuid").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  url_resolved: text("url_resolved"),
  homepage: text("homepage"),
  favicon: text("favicon"),
  tags: text("tags").array(), // array of genre tags
  country: text("country"),
  countrycode: text("countrycode"),
  state: text("state"),
  language: text("language"),
  languagecodes: text("languagecodes"),
  codec: text("codec"),
  bitrate: integer("bitrate"),
  hls: integer("hls"),
  lastcheckok: boolean("lastcheckok"),
  votes: integer("votes"),
  clickcount: integer("clickcount"),
  clicktrend: integer("clicktrend"),
  geo_lat: text("geo_lat"),
  geo_long: text("geo_long"),
  cached_at: timestamp("cached_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

export const insertStationCacheSchema = createInsertSchema(
  stationsCacheTable,
).omit({ cached_at: true });
export type InsertStationCache = z.infer<typeof insertStationCacheSchema>;
export type StationCache = typeof stationsCacheTable.$inferSelect;

// ─── genres_cache ─────────────────────────────────────────────────────────────
export const genresCacheTable = pgTable("genres_cache", {
  name: text("name").primaryKey(),
  station_count: integer("station_count").notNull(),
  cached_at: timestamp("cached_at").defaultNow().notNull(),
});

export type GenreCache = typeof genresCacheTable.$inferSelect;

// ─── countries_cache ──────────────────────────────────────────────────────────
export const countriesCacheTable = pgTable("countries_cache", {
  name: text("name").primaryKey(),
  iso_3166_1: text("iso_3166_1"),
  station_count: integer("station_count").notNull(),
  cached_at: timestamp("cached_at").defaultNow().notNull(),
});

export type CountryCache = typeof countriesCacheTable.$inferSelect;

// ─── favorites ────────────────────────────────────────────────────────────────
// Session-scoped, no auth required
export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  station_uuid: text("station_uuid").notNull(),
  added_at: timestamp("added_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favoritesTable).omit({
  id: true,
  added_at: true,
});
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favoritesTable.$inferSelect;

// ─── listening_history ────────────────────────────────────────────────────────
export const listeningHistoryTable = pgTable("listening_history", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  station_uuid: text("station_uuid").notNull(),
  listened_at: timestamp("listened_at").defaultNow().notNull(),
});

export const insertHistorySchema = createInsertSchema(
  listeningHistoryTable,
).omit({ id: true, listened_at: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type ListeningHistory = typeof listeningHistoryTable.$inferSelect;

// ─── curated_stations ─────────────────────────────────────────────────────────
export const curatedSectionEnum = pgEnum("curated_section", [
  "featured",
  "trending",
  "editors_pick",
]);

export const curatedStationsTable = pgTable("curated_stations", {
  id: serial("id").primaryKey(),
  station_uuid: text("station_uuid").notNull(),
  position: integer("position").notNull().default(0),
  section: curatedSectionEnum("section").notNull().default("featured"),
  added_at: timestamp("added_at").defaultNow().notNull(),
});

export const insertCuratedSchema = createInsertSchema(
  curatedStationsTable,
).omit({ id: true, added_at: true });
export type InsertCurated = z.infer<typeof insertCuratedSchema>;
export type CuratedStation = typeof curatedStationsTable.$inferSelect;

// ─── broken_reports ───────────────────────────────────────────────────────────
export const brokenReasonEnum = pgEnum("broken_reason", [
  "stream_dead",
  "wrong_content",
  "poor_quality",
  "other",
]);

export const brokenReportsTable = pgTable("broken_reports", {
  id: serial("id").primaryKey(),
  station_uuid: text("station_uuid").notNull(),
  session_id: text("session_id").notNull(),
  reason: brokenReasonEnum("reason").notNull().default("other"),
  reported_at: timestamp("reported_at").defaultNow().notNull(),
});

export const insertBrokenReportSchema = createInsertSchema(
  brokenReportsTable,
).omit({ id: true, reported_at: true });
export type InsertBrokenReport = z.infer<typeof insertBrokenReportSchema>;
export type BrokenReport = typeof brokenReportsTable.$inferSelect;

// ─── ai_recommendations ───────────────────────────────────────────────────────
export const aiRecommendationsTable = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  station_uuid: text("station_uuid").notNull(),
  score: real("score").notNull(),
  reason: text("reason"),
  generated_at: timestamp("generated_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

export const insertAiRecommendationSchema = createInsertSchema(
  aiRecommendationsTable,
).omit({ id: true, generated_at: true });
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type AiRecommendation = typeof aiRecommendationsTable.$inferSelect;
