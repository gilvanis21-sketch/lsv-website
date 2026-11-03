/** DEV UNIQUEMENT : demandes FICTIVES (domaine réservé .example). Jamais de données réelles. */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appointmentRequests } from "../src/db/schema";
import { generateRef } from "../src/lib/refs";

if (process.env.NODE_ENV === "production") throw new Error("Interdit en production");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });
const demo = [
  ["Alpha", "Test", "nouvelle", "premiere_consultation"],
  ["Bêta", "Test", "en_attente", "suivi"],
  ["Gamma", "Test", "confirmee", "suivi"],
  ["Delta", "Test", "refusee", "premiere_consultation"],
  ["Epsilon", "Test", "traitee", "suivi"],
] as const;
for (const [last, first, status, type] of demo) {
  await db.insert(appointmentRequests).values({ ref: generateRef(), lastName: last, firstName: first, email: `${last.toLowerCase()}@test.example`, phone: "+33 0 00 00 00 00", type, status, consentAt: new Date(), consentVersion: "demo", purgeAt: new Date(Date.now() + 365 * 86400000) });
}
await pool.end();
console.log("[demo] 5 demandes fictives créées");
