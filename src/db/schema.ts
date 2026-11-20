import { doublePrecision, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const sounds = pgTable(
  "sounds",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    nameAr: text("name_ar").notNull(),
    category: text("category").notNull(),
    kind: text("kind").notNull(), // sfx | music | ambience | voice
    tags: jsonb("tags").$type<string[]>().notNull(),
    repo: text("repo").notNull(),
    pack: text("pack").notNull(),
    creator: text("creator"),
    license: text("license").notNull(),
    attribution: text("attribution"),
    sourceUrl: text("source_url"),
    videoSlug: text("video_slug"),
    videoTitle: text("video_title"),
    videoUrl: text("video_url"),
    posterUrl: text("poster_url"),
    segStart: doublePrecision("seg_start"),
    segEnd: doublePrecision("seg_end"),
    file: text("file").notNull(),
    duration: doublePrecision("duration").notNull(),
    size: integer("size").notNull(),
    peaks: jsonb("peaks").$type<number[]>().notNull(),
    peakDb: doublePrecision("peak_db").notNull(),
    rmsDb: doublePrecision("rms_db").notNull(),
    brightness: integer("brightness").notNull(),
    flatness: integer("flatness").notNull(),
    attackMs: integer("attack_ms").notNull(),
    search: text("search").notNull(),
  },
  (t) => [
    index("sounds_category_idx").on(t.category),
    index("sounds_repo_idx").on(t.repo),
    index("sounds_duration_idx").on(t.duration),
  ],
);

export type SoundRow = typeof sounds.$inferSelect;
