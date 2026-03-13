import { db } from "@/lib/db";
import { classrooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface Classroom {
  id: string;
  name: string;
}

export async function getClassrooms(tenantId: string): Promise<Classroom[]> {
  const rows = await db
    .select({ id: classrooms.id, name: classrooms.name })
    .from(classrooms)
    .where(eq(classrooms.tenantId, tenantId))
    .orderBy(classrooms.name);

  return rows;
}
