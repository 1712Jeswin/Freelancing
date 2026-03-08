import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { env } from '@/config/env';

// If DATABASE_URL is somehow not populated (e.g., forgotten .env setup), fallback to avoid immediate crash on build if it runs locally
const sql = neon(env.DATABASE_URL || "postgres://dummy:dummy@localhost/dummy");
export const db = drizzle(sql, { schema });
