/**
 * Initialisation : compte administrateur (depuis SEED_ADMIN_*) et services provisoires.
 * Idempotent. Aucune donnée personnelle réelle : voir scripts/seed-demo.ts (dev uniquement).
 */
import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as s from "../src/db/schema";
import { SERVICES } from "../src/lib/content";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
const pw = process.env.SEED_ADMIN_PASSWORD;
if (email && pw) {
  if (pw.length < 12) throw new Error("SEED_ADMIN_PASSWORD : 12 caractères minimum");
  await db.insert(s.users).values({ email, name: "Administrateur", passwordHash: await hash(pw), role: "admin" }).onConflictDoNothing();
}

for (const [i, v] of SERVICES.entries()) {
  await db.insert(s.services).values({ slug: v.slug, title: v.title, summary: v.summary, description: v.description, objectives: v.objectives, process: v.process, practical: v.practical, price: v.price ?? null, position: i }).onConflictDoNothing();
}
await pool.end();
console.log("[db] seed terminé");
