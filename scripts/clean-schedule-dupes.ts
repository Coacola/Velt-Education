import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { classSchedules } from "../src/lib/db/schema/classes";
import { sql } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function cleanDuplicates() {
  console.log("Cleaning duplicate class_schedules rows...");

  const before = await db.select().from(classSchedules);
  console.log(`Before: ${before.length} rows`);

  // Delete duplicates, keeping only the first entry per (classId, day, startTime)
  await db.execute(sql`
    DELETE FROM class_schedules
    WHERE id NOT IN (
      SELECT DISTINCT ON (class_id, day, start_time) id
      FROM class_schedules
      ORDER BY class_id, day, start_time, id
    )
  `);

  const after = await db.select().from(classSchedules);
  console.log(`After: ${after.length} rows`);
  for (const r of after) {
    console.log(`  ${r.day} ${r.startTime}-${r.endTime}`);
  }

  console.log(`Removed ${before.length - after.length} duplicate rows`);
  process.exit(0);
}

cleanDuplicates().catch(err => {
  console.error(err);
  process.exit(1);
});
