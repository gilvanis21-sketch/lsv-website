/** Supprime les demandes dont la date de conservation est dépassée (à planifier : cron quotidien). */
import { lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appointmentRequests } from "../src/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const rows = await drizzle({ client: pool }).delete(appointmentRequests).where(lt(appointmentRequests.purgeAt, new Date())).returning({ id: appointmentRequests.id });
console.log(`[purge] ${rows.length} demande(s) supprimée(s)`);
await pool.end();
