import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "editor", "secretary"]);
export const requestStatusEnum = pgEnum("request_status", ["nouvelle", "en_attente", "confirmee", "refusee", "traitee"]);
export const requestTypeEnum = pgEnum("request_type", ["premiere_consultation", "suivi"]);
export const postStatusEnum = pgEnum("post_status", ["brouillon", "publie"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("secretary"),
  active: boolean("active").notNull().default(true),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  totpSecret: text("totp_secret"), // chiffré (AES-GCM)
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  totpLastStep: integer("totp_last_step").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** `id` = SHA-256 du jeton de session : un vol de base ne donne pas de session valide. */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointmentRequests = pgTable(
  "appointment_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ref: text("ref").notNull().unique(),
    lastName: text("last_name").notNull(),
    firstName: text("first_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    type: requestTypeEnum("type").notNull(),
    preferredDate: text("preferred_date"), // AAAA-MM-JJ
    preferredSlot: text("preferred_slot"), // matin | apres_midi | indifferent
    status: requestStatusEnum("status").notNull().default("nouvelle"),
    internalNotes: text("internal_notes"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    consentVersion: text("consent_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    purgeAt: timestamp("purge_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("requests_status_idx").on(t.status), index("requests_purge_idx").on(t.purgeAt)],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  imagePath: text("image_path"),
  imageAlt: text("image_alt"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  status: postStatusEnum("status").notNull().default("brouillon"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull().default(""),
  objectives: text("objectives").array().notNull().default([]),
  process: text("process").array().notNull().default([]),
  practical: text("practical").array().notNull().default([]),
  price: text("price"), // null = non communiqué : rien n'est affiché
  position: integer("position").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  actorId: uuid("actor_id"),
  actorLabel: text("actor_label"),
  action: text("action").notNull(),
  target: text("target"),
  detail: text("detail"),
  ipHash: text("ip_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
