/**
 * Migration: Add monthly_fee column to students table
 * Run: npx tsx src/lib/db/migrate-monthly-fee.ts
 */
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Adding monthly_fee column to students...");

  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_fee numeric(10,2) NOT NULL DEFAULT 0`;

  await sql`
    UPDATE students SET monthly_fee = CASE
      WHEN year = 'Α' THEN 140
      WHEN year = 'Β' THEN 160
      WHEN year = 'Γ' THEN 180
      ELSE 140
    END
    WHERE monthly_fee = 0
  `;

  const result = await sql`SELECT first_name, last_name, monthly_fee FROM students ORDER BY last_name`;
  console.log(`Updated ${result.length} students:`);
  for (const r of result) {
    console.log(`  ${r.first_name} ${r.last_name}: €${r.monthly_fee}`);
  }
  console.log("\nDone!");
}

migrate().catch(e => { console.error(e); process.exit(1); });
