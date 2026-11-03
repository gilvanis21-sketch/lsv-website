import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const g = globalThis as unknown as { __pool?: Pool };

// Le Pool ne se connecte qu'à la première requête : l'import reste sans effet au build.
g.__pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

export const db = drizzle({ client: g.__pool, schema });
export * from "./schema";
