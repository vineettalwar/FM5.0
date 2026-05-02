CREATE TYPE "public"."broken_reason" AS ENUM('stream_dead', 'wrong_content', 'poor_quality', 'other');--> statement-breakpoint
CREATE TYPE "public"."curated_section" AS ENUM('featured', 'trending', 'editors_pick');--> statement-breakpoint
CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"station_uuid" text NOT NULL,
	"score" real NOT NULL,
	"reason" text,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "broken_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_uuid" text NOT NULL,
	"session_id" text NOT NULL,
	"reason" "broken_reason" DEFAULT 'other' NOT NULL,
	"reported_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries_cache" (
	"name" text PRIMARY KEY NOT NULL,
	"iso_3166_1" text,
	"station_count" integer NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curated_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"station_uuid" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"section" "curated_section" DEFAULT 'featured' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"station_uuid" text NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genres_cache" (
	"name" text PRIMARY KEY NOT NULL,
	"station_count" integer NOT NULL,
	"cached_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"station_uuid" text NOT NULL,
	"listened_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations_cache" (
	"stationuuid" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text,
	"url_resolved" text,
	"homepage" text,
	"favicon" text,
	"tags" text[],
	"country" text,
	"countrycode" text,
	"state" text,
	"language" text,
	"languagecodes" text,
	"codec" text,
	"bitrate" integer,
	"hls" integer,
	"lastcheckok" boolean,
	"votes" integer,
	"clickcount" integer,
	"clicktrend" integer,
	"geo_lat" text,
	"geo_long" text,
	"cached_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
