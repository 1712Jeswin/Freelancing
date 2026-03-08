import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
// If DATABASE_URL is somehow not populated (e.g., forgotten .env setup), fallback to avoid immediate crash on build if it runs locally
const sql = neon(process.env.DATABASE_URL || "postgres://dummy:dummy@localhost/dummy");
export const db = drizzle(sql, { schema });
