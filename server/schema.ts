/**
 * This file is used to define the schema for the database.
 * 
 * After making changes to this file, run `npm run db:generate` to generate the migration file.
 * Then, by just using the app, the migration is lazily ensured at runtime.
 */
import { integer, sqliteTable, text } from "@deco/workers-runtime/drizzle";

// Database schema - currently not used by LISTAR_DEPUTADOS tool
// but kept for future functionality that might require persistence
