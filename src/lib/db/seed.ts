/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seed script — populates the database with demo data
 * Run: npx tsx src/lib/db/seed.ts
 *
 * Requires DATABASE_URL to be set in .env.local
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

// Load .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Fixed UUIDs for deterministic seeding
const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000010";
const TEACHER_USER_ID = "00000000-0000-0000-0000-000000000011";
const STUDENT_USER_ID_1 = "00000000-0000-0000-0000-000000000020";
const STUDENT_USER_ID_2 = "00000000-0000-0000-0000-000000000021";

const STUDENT_IDS = Array.from({ length: 20 }, (_, i) =>
  `00000000-0000-0000-0001-${String(i + 1).padStart(12, "0")}`
);
const TEACHER_IDS = Array.from({ length: 5 }, (_, i) =>
  `00000000-0000-0000-0002-${String(i + 1).padStart(12, "0")}`
);
const CLASS_IDS = Array.from({ length: 8 }, (_, i) =>
  `00000000-0000-0000-0003-${String(i + 1).padStart(12, "0")}`
);
const SESSION_IDS = Array.from({ length: 8 }, (_, i) =>
  `00000000-0000-0000-0004-${String(i + 1).padStart(12, "0")}`
);
const EXAM_IDS = Array.from({ length: 5 }, (_, i) =>
  `00000000-0000-0000-0005-${String(i + 1).padStart(12, "0")}`
);
const INVOICE_IDS = Array.from({ length: 20 }, (_, i) =>
  `00000000-0000-0000-0006-${String(i + 1).padStart(12, "0")}`
);
const HOMEWORK_IDS = Array.from({ length: 5 }, (_, i) =>
  `00000000-0000-0000-0007-${String(i + 1).padStart(12, "0")}`
);
const LESSON_PLAN_IDS = Array.from({ length: 6 }, (_, i) =>
  `00000000-0000-0000-0008-${String(i + 1).padStart(12, "0")}`
);
const TODO_IDS = Array.from({ length: 3 }, (_, i) =>
  `00000000-0000-0000-0009-${String(i + 1).padStart(12, "0")}`
);

async function seed() {
  console.log("🌱 Seeding database...\n");

  // 1. TENANT
  console.log("  Creating tenant...");
  await db.insert(schema.tenants).values({
    id: TENANT_ID,
    name: "Velt Demo Academy",
    slug: "velt-demo",
    timezone: "Europe/Athens",
    currency: "EUR",
  }).onConflictDoNothing();

  // 2. ADMIN USER
  console.log("  Creating admin user...");
  const passwordHash = await bcrypt.hash("admin123", 12);
  await db.insert(schema.users).values({
    id: ADMIN_USER_ID,
    tenantId: TENANT_ID,
    email: "admin@velt.education",
    passwordHash,
    role: "admin",
    firstName: "Admin",
    lastName: "Velt",
  }).onConflictDoNothing();

  // 2b. TEACHER USER
  console.log("  Creating teacher user...");
  const teacherPasswordHash = await bcrypt.hash("teacher123", 12);
  await db.insert(schema.users).values({
    id: TEACHER_USER_ID,
    tenantId: TENANT_ID,
    email: "teacher@velt.education",
    passwordHash: teacherPasswordHash,
    role: "teacher",
    firstName: "Δρ. Ανδρέας",
    lastName: "Κατσαρός",
  }).onConflictDoNothing();

  // 2c. STUDENT USERS
  console.log("  Creating student users...");
  const studentPasswordHash = await bcrypt.hash("student123", 12);
  await db.insert(schema.users).values({
    id: STUDENT_USER_ID_1,
    tenantId: TENANT_ID,
    email: "student@velt.education",
    passwordHash: studentPasswordHash,
    role: "student",
    firstName: "Αλέξανδρος",
    lastName: "Παπαδόπουλος",
  }).onConflictDoNothing();
  await db.insert(schema.users).values({
    id: STUDENT_USER_ID_2,
    tenantId: TENANT_ID,
    email: "student2@velt.education",
    passwordHash: studentPasswordHash,
    role: "student",
    firstName: "Μαρία",
    lastName: "Ιωάννου",
  }).onConflictDoNothing();

  // 3. STUDENTS
  console.log("  Creating 20 students...");
  const studentData = [
    { firstName: "Αλέξανδρος", lastName: "Παπαδόπουλος", email: "alex.papa@gmail.com", phone: "+357 99 123456", parentName: "Νίκος Παπαδόπουλος", parentPhone: "+357 99 654321", year: "Α", school: "Λύκειο Λευκωσίας" },
    { firstName: "Μαρία", lastName: "Ιωάννου", email: "maria.io@hotmail.com", phone: "+357 99 234567", parentName: "Ελένη Ιωάννου", parentPhone: "+357 99 765432", year: "Β", school: "Λύκειο Στροβόλου" },
    { firstName: "Κωνσταντίνος", lastName: "Χριστοδούλου", email: "kostas.ch@gmail.com", phone: "+357 99 345678", parentName: "Σταύρος Χριστοδούλου", parentPhone: "+357 99 876543", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Σοφία", lastName: "Νικολάου", email: "sofia.nik@gmail.com", phone: "+357 99 456789", parentName: "Ανδρέας Νικολάου", parentPhone: "+357 99 987654", year: "Α", school: "Λύκειο Λευκωσίας" },
    { firstName: "Δημήτρης", lastName: "Αντωνίου", email: "dmitris.ant@gmail.com", phone: "+357 99 567890", parentName: "Γιώργος Αντωνίου", parentPhone: "+357 99 098765", year: "Β", school: "Γυμνάσιο Πόλης" },
    { firstName: "Ελένη", lastName: "Παπαγεωργίου", email: "eleni.pap@gmail.com", phone: "+357 99 678901", parentName: "Μαρία Παπαγεωργίου", parentPhone: "+357 99 109876", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Νικόλας", lastName: "Στυλιανού", email: "nikolas.st@gmail.com", phone: "+357 99 789012", parentName: "Πέτρος Στυλιανού", parentPhone: "+357 99 210987", year: "Α", school: "Λύκειο Λευκωσίας" },
    { firstName: "Άννα", lastName: "Κωνσταντίνου", email: "anna.kon@gmail.com", phone: "+357 99 890123", parentName: "Σπύρος Κωνσταντίνου", parentPhone: "+357 99 321098", year: "Β", school: "Λύκειο Στροβόλου" },
    { firstName: "Γιώργος", lastName: "Μιχαήλ", email: "giorgos.mi@gmail.com", phone: "+357 99 901234", parentName: "Τάσος Μιχαήλ", parentPhone: "+357 99 432109", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Χριστίνα", lastName: "Λοΐζου", email: "christina.lo@gmail.com", phone: "+357 99 012345", parentName: "Ανδρέας Λοΐζου", parentPhone: "+357 99 543210", year: "Α", school: "Γυμνάσιο Λευκωσίας" },
    { firstName: "Παύλος", lastName: "Σωκράτους", email: "pavlos.so@gmail.com", phone: "+357 99 111222", parentName: "Κώστας Σωκράτους", parentPhone: "+357 99 222111", year: "Β", school: "Λύκειο Στροβόλου" },
    { firstName: "Ιωάννα", lastName: "Θεοδώρου", email: "ioanna.th@gmail.com", phone: "+357 99 333444", parentName: "Νίκος Θεοδώρου", parentPhone: "+357 99 444333", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Σταύρος", lastName: "Αλεξίου", email: "stavros.al@gmail.com", phone: "+357 99 555666", parentName: "Μάριος Αλεξίου", parentPhone: "+357 99 666555", year: "Α", school: "Λύκειο Λευκωσίας" },
    { firstName: "Έλενα", lastName: "Βασιλείου", email: "elena.vas@gmail.com", phone: "+357 99 777888", parentName: "Πέτρος Βασιλείου", parentPhone: "+357 99 888777", year: "Β", school: "Γυμνάσιο Πόλης" },
    { firstName: "Αντρέας", lastName: "Ορφανίδης", email: "andreas.or@gmail.com", phone: "+357 99 999000", parentName: "Χριστάκης Ορφανίδης", parentPhone: "+357 99 000999", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Κατερίνα", lastName: "Ηλία", email: "katerina.il@gmail.com", phone: "+357 99 112233", parentName: "Παύλος Ηλία", parentPhone: "+357 99 332211", year: "Α", school: "Λύκειο Λευκωσίας" },
    { firstName: "Μιχάλης", lastName: "Χαραλάμπους", email: "michalis.ch@gmail.com", phone: "+357 99 445566", parentName: "Γιώργης Χαραλάμπους", parentPhone: "+357 99 665544", year: "Β", school: "Λύκειο Στροβόλου" },
    { firstName: "Ρένα", lastName: "Πολυκάρπου", email: "rena.pol@gmail.com", phone: "+357 99 778899", parentName: "Φοίβος Πολυκάρπου", parentPhone: "+357 99 998877", year: "Γ", school: "Λύκειο Λεμεσού" },
    { firstName: "Βασίλης", lastName: "Μαρκίδης", email: "vasilis.ma@gmail.com", phone: "+357 99 223344", parentName: "Αντώνης Μαρκίδης", parentPhone: "+357 99 443322", year: "Α", school: "Γυμνάσιο Λευκωσίας" },
    { firstName: "Ζωή", lastName: "Κυπριανού", email: "zoe.kyp@gmail.com", phone: "+357 99 556677", parentName: "Θανάσης Κυπριανού", parentPhone: "+357 99 776655", year: "Β", school: "Λύκειο Στροβόλου" },
  ];

  // Monthly fees by year: Α=140, Β=160, Γ=180
  const feeByYear: Record<string, string> = { "Α": "140", "Β": "160", "Γ": "180" };
  for (let i = 0; i < studentData.length; i++) {
    await db.insert(schema.students).values({
      id: STUDENT_IDS[i],
      tenantId: TENANT_ID,
      ...studentData[i],
      monthlyFee: feeByYear[studentData[i].year] || "140",
      enrolledSince: i === 6 || i === 15 ? "2024-09-15" : i === 12 ? "2024-10-01" : "2024-09-01",
    }).onConflictDoNothing();
  }

  // 4. TEACHERS
  console.log("  Creating 5 teachers...");
  const teacherData = [
    { firstName: "Δρ. Ανδρέας", lastName: "Κατσαρός", email: "a.katsaros@veltedu.cy", phone: "+357 99 100200", subjects: ["Mathematics", "Physics"], qualifications: ["BSc Mathematics", "MSc Applied Mathematics", "PGCE"], bio: "Πτυχιούχος Μαθηματικών του Πανεπιστημίου Κύπρου με 12 χρόνια εμπειρία.", joinedDate: "2020-09-01", hourlyRate: "35" },
    { firstName: "Μαρία", lastName: "Σταύρου", email: "m.stavrou@veltedu.cy", phone: "+357 99 300400", subjects: ["English", "Greek Literature"], qualifications: ["BA English Literature", "CELTA", "DELTA"], bio: "Κάτοχος πτυχίου Αγγλικής Φιλολογίας από το Πανεπιστήμιο Αθηνών.", joinedDate: "2021-09-01", hourlyRate: "30" },
    { firstName: "Σπύρος", lastName: "Λεωνίδου", email: "s.leonidou@veltedu.cy", phone: "+357 99 500600", subjects: ["Chemistry", "Biology"], qualifications: ["BSc Biochemistry", "MSc Molecular Biology"], bio: "Βιοχημικός με μεταπτυχιακό από το Πανεπιστήμιο Κύπρου.", joinedDate: "2022-01-15", hourlyRate: "32" },
    { firstName: "Ελπίδα", lastName: "Γεωργίου", email: "e.georgiou@veltedu.cy", phone: "+357 99 700800", subjects: ["History", "Economics"], qualifications: ["BA History", "MA European History"], bio: "Ιστορικός με εξειδίκευση στην Ιστορία της Κύπρου.", joinedDate: "2022-09-01", hourlyRate: "28" },
    { firstName: "Χρίστος", lastName: "Ευσταθίου", email: "c.efstathiou@veltedu.cy", phone: "+357 99 900100", subjects: ["Informatics", "Mathematics"], qualifications: ["BSc Computer Science", "MSc Software Engineering"], bio: "Μηχανικός Λογισμικού με εμπειρία στην τεχνολογία.", joinedDate: "2023-01-01", hourlyRate: "30" },
  ];

  for (let i = 0; i < teacherData.length; i++) {
    await db.insert(schema.teachers).values({
      id: TEACHER_IDS[i],
      tenantId: TENANT_ID,
      userId: i === 0 ? TEACHER_USER_ID : undefined, // Link first teacher to teacher user account
      ...teacherData[i],
    }).onConflictDoNothing();
  }
  // Ensure first teacher is linked to teacher user (in case row existed from a prior seed)
  await db.update(schema.teachers)
    .set({ userId: TEACHER_USER_ID })
    .where(eq(schema.teachers.id, TEACHER_IDS[0]));

  // Link first two students to their user accounts
  await db.update(schema.students)
    .set({ userId: STUDENT_USER_ID_1 })
    .where(eq(schema.students.id, STUDENT_IDS[0]));
  await db.update(schema.students)
    .set({ userId: STUDENT_USER_ID_2 })
    .where(eq(schema.students.id, STUDENT_IDS[1]));

  // 5. CLASSES
  console.log("  Creating 8 classes...");
  const classData = [
    { name: "Μαθηματικά Α' Λυκείου", subject: "Mathematics", teacherIdx: 0, year: "Α", capacity: 8, color: "#6c6cff", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Μαθηματικά Β' Λυκείου", subject: "Mathematics", teacherIdx: 0, year: "Β", capacity: 8, color: "#a78bfa", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Φυσική Α' Λυκείου", subject: "Physics", teacherIdx: 0, year: "Α", capacity: 6, color: "#34d399", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Χημεία-Βιολογία Γ' Λυκείου", subject: "Chemistry", teacherIdx: 2, year: "Γ", capacity: 8, color: "#f59e0b", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Αγγλικά Β2-C1", subject: "English", teacherIdx: 1, year: "Β", capacity: 10, color: "#06b6d4", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Βιολογία Γ' Λυκείου", subject: "Biology", teacherIdx: 2, year: "Γ", capacity: 8, color: "#ec4899", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Ιστορία - Οικονομικά Γ'", subject: "History", teacherIdx: 3, year: "Γ", capacity: 8, color: "#f97316", startDate: "2025-09-08", endDate: "2026-06-15" },
    { name: "Πληροφορική & Προγραμματισμός", subject: "Informatics", teacherIdx: 4, year: "Β", capacity: 6, color: "#10b981", startDate: "2025-09-08", endDate: "2026-06-15" },
  ];

  for (let i = 0; i < classData.length; i++) {
    const { teacherIdx, ...rest } = classData[i];
    await db.insert(schema.classes).values({
      id: CLASS_IDS[i],
      tenantId: TENANT_ID,
      teacherId: TEACHER_IDS[teacherIdx],
      ...rest,
    }).onConflictDoNothing();
  }

  // 6. CLASS SCHEDULES
  console.log("  Creating class schedules...");
  const schedules = [
    { classIdx: 0, day: "Monday", startTime: "16:00", endTime: "17:30" },
    { classIdx: 0, day: "Wednesday", startTime: "16:00", endTime: "17:30" },
    { classIdx: 1, day: "Tuesday", startTime: "17:00", endTime: "18:30" },
    { classIdx: 1, day: "Thursday", startTime: "17:00", endTime: "18:30" },
    { classIdx: 2, day: "Friday", startTime: "15:00", endTime: "16:30" },
    { classIdx: 3, day: "Monday", startTime: "17:30", endTime: "19:00" },
    { classIdx: 3, day: "Wednesday", startTime: "17:30", endTime: "19:00" },
    { classIdx: 4, day: "Tuesday", startTime: "15:00", endTime: "16:30" },
    { classIdx: 4, day: "Saturday", startTime: "10:00", endTime: "11:30" },
    { classIdx: 5, day: "Thursday", startTime: "15:30", endTime: "17:00" },
    { classIdx: 6, day: "Wednesday", startTime: "15:00", endTime: "16:30" },
    { classIdx: 7, day: "Friday", startTime: "17:00", endTime: "18:30" },
  ];

  for (const s of schedules) {
    await db.insert(schema.classSchedules).values({
      classId: CLASS_IDS[s.classIdx],
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
    }).onConflictDoNothing();
  }

  // 7. STUDENT-CLASS ENROLLMENTS
  console.log("  Enrolling students in classes...");
  // Map: classIdx -> studentIdx[]
  const enrollments: Record<number, number[]> = {
    0: [0, 3, 6, 9, 15],       // cls_001: stu 1,4,7,10,16
    1: [1, 4, 7, 10, 16, 19],  // cls_002: stu 2,5,8,11,17,20
    2: [0, 6, 12, 18],          // cls_003: stu 1,7,13,19
    3: [2, 5, 8, 11, 14, 17],  // cls_004: stu 3,6,9,12,15,18
    4: [1, 4, 5, 10, 13, 17],  // cls_005: stu 2,5,6,11,14,18
    5: [2, 5, 7, 11, 16],      // cls_006: stu 3,6,8,12,17
    6: [3, 8, 14, 19],          // cls_007: stu 4,9,15,20
    7: [4, 9, 13, 18],          // cls_008: stu 5,10,14,19
  };

  for (const [classIdx, studentIdxs] of Object.entries(enrollments)) {
    for (const studentIdx of studentIdxs) {
      await db.insert(schema.studentClasses).values({
        studentId: STUDENT_IDS[studentIdx],
        classId: CLASS_IDS[Number(classIdx)],
      }).onConflictDoNothing();
    }
  }

  // 8. ATTENDANCE SESSIONS & RECORDS
  console.log("  Creating attendance sessions and records...");
  const sessionsData = [
    { classIdx: 0, date: "2026-02-23", startTime: "16:00", endTime: "17:30", status: "completed" as const, topic: "Τριγωνομετρία - Βασικές ταυτότητες", records: [[0,"present"],[3,"present"],[6,"late"],[9,"present"],[15,"absent"]] },
    { classIdx: 1, date: "2026-02-24", startTime: "17:00", endTime: "18:30", status: "completed" as const, topic: "Παράγωγοι - Κανόνες παραγώγισης", records: [[1,"absent"],[4,"present"],[7,"present"],[10,"absent"],[16,"present"],[19,"present"]] },
    { classIdx: 3, date: "2026-02-23", startTime: "17:30", endTime: "19:00", status: "completed" as const, topic: "Οργανική Χημεία - Υδρογονάνθρακες", records: [[2,"present"],[5,"absent"],[8,"present"],[11,"present"],[14,"present"],[17,"late"]] },
    { classIdx: 4, date: "2026-02-24", startTime: "15:00", endTime: "16:30", status: "completed" as const, topic: "Essay Writing - Argumentative Essays", records: [[1,"present"],[4,"present"],[5,"absent"],[10,"absent"],[13,"present"],[17,"present"]] },
    { classIdx: 0, date: "2026-02-25", startTime: "16:00", endTime: "17:30", status: "completed" as const, topic: "Τριγωνομετρία - Επίλυση τριγώνων", records: [[0,"present"],[3,"present"],[6,"present"],[9,"present"],[15,"present"]] },
    { classIdx: 2, date: "2026-02-27", startTime: "15:00", endTime: "16:30", status: "completed" as const, topic: "Δυναμική - Νόμοι Νεύτωνα", records: [[0,"present"],[6,"present"],[12,"late"],[18,"present"]] },
    { classIdx: 0, date: "2026-03-09", startTime: "16:00", endTime: "17:30", status: "scheduled" as const, topic: "Εκθετικές - Λογαριθμικές συναρτήσεις", records: [[0,"present"],[3,"present"],[6,"present"],[9,"present"],[15,"present"]] },
    { classIdx: 5, date: "2026-02-26", startTime: "15:30", endTime: "17:00", status: "completed" as const, topic: "Γενετική - DNA και Αναπαραγωγή", records: [[2,"present"],[5,"absent"],[7,"present"],[11,"present"],[16,"present"]] },
  ];

  for (let i = 0; i < sessionsData.length; i++) {
    const { classIdx, records, ...sessionData } = sessionsData[i];
    await db.insert(schema.attendanceSessions).values({
      id: SESSION_IDS[i],
      tenantId: TENANT_ID,
      classId: CLASS_IDS[classIdx],
      ...sessionData,
      createdBy: ADMIN_USER_ID,
    }).onConflictDoNothing();

    for (const [studentIdx, status] of records) {
      await db.insert(schema.attendanceRecords).values({
        sessionId: SESSION_IDS[i],
        studentId: STUDENT_IDS[studentIdx as number],
        status: status as "present" | "absent" | "late" | "excused",
        note: status === "late" && studentIdx === 6 ? "5 λεπτά αργά" : null,
      }).onConflictDoNothing();
    }
  }

  // 9. EXAMS & GRADES
  console.log("  Creating exams and grades...");
  const examsData = [
    { title: "Τεστ Τριγωνομετρίας", classIdx: 0, subject: "Mathematics", date: "2026-02-13", maxScore: "20", grades: [[0,18],[3,19],[6,15],[9,20],[15,11]] },
    { title: "Διαγώνισμα Παραγώγων", classIdx: 1, subject: "Mathematics", date: "2026-02-17", maxScore: "20", grades: [[1,8],[4,16],[7,14],[10,7],[16,19],[19,15]] },
    { title: "Τεστ Νόμων Νεύτωνα", classIdx: 2, subject: "Physics", date: "2026-02-20", maxScore: "20", grades: [[0,17],[6,15],[12,14],[18,14]] },
    { title: "Διαγώνισμα Οργανικής Χημείας", classIdx: 3, subject: "Chemistry", date: "2026-02-18", maxScore: "20", grades: [[2,14],[5,11],[8,17],[11,18],[14,13],[17,12]] },
    { title: "Writing Test - C1 Level", classIdx: 4, subject: "English", date: "2026-02-19", maxScore: "20", grades: [[1,12],[4,16],[5,13],[10,11],[13,17],[17,14]] },
  ];

  for (let i = 0; i < examsData.length; i++) {
    const { classIdx, grades, ...examData } = examsData[i];
    await db.insert(schema.exams).values({
      id: EXAM_IDS[i],
      tenantId: TENANT_ID,
      classId: CLASS_IDS[classIdx],
      ...examData,
    }).onConflictDoNothing();

    for (const [studentIdx, score] of grades) {
      await db.insert(schema.examGrades).values({
        examId: EXAM_IDS[i],
        studentId: STUDENT_IDS[studentIdx],
        score: String(score),
        absent: false,
      }).onConflictDoNothing();
    }
  }

  // 10. INVOICES & ITEMS & PAYMENTS
  console.log("  Creating invoices and payments...");
  type InvoiceData = {
    studentIdx: number;
    totalAmount: string;
    paidAmount: number;
    status: "paid" | "partial" | "overdue" | "pending";
    dueDate: string;
    issuedDate: string;
    paidDate?: string;
    method?: "cash" | "bank_transfer" | "card";
    items: [string, number][];
  };

  const invoicesData: InvoiceData[] = [
    { studentIdx: 0, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-15", method: "bank_transfer", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Φυσική", 140]] },
    { studentIdx: 1, totalAmount: "280", paidAmount: 0, status: "overdue", dueDate: "2026-01-31", issuedDate: "2026-01-01", items: [["Ιανουάριος - Μαθηματικά", 140], ["Ιανουάριος - Αγγλικά", 140]] },
    { studentIdx: 2, totalAmount: "280", paidAmount: 140, status: "partial", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-20", method: "cash", items: [["Φεβρουάριος - Χημεία", 140], ["Φεβρουάριος - Βιολογία", 140]] },
    { studentIdx: 3, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-10", method: "card", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Ιστορία", 140]] },
    { studentIdx: 4, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-05", method: "bank_transfer", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Πληροφορική", 140]] },
    { studentIdx: 5, totalAmount: "280", paidAmount: 0, status: "overdue", dueDate: "2026-01-31", issuedDate: "2026-01-01", items: [["Ιανουάριος - Αγγλικά", 140], ["Ιανουάριος - Βιολογία", 140]] },
    { studentIdx: 6, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-18", method: "cash", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Φυσική", 140]] },
    { studentIdx: 7, totalAmount: "280", paidAmount: 190, status: "partial", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-22", method: "cash", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Χημεία", 140]] },
    { studentIdx: 8, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-03", method: "bank_transfer", items: [["Φεβρουάριος - Χημεία", 140], ["Φεβρουάριος - Ιστορία", 140]] },
    { studentIdx: 9, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-01", method: "card", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Πληροφορική", 140]] },
    { studentIdx: 10, totalAmount: "280", paidAmount: 0, status: "overdue", dueDate: "2026-01-31", issuedDate: "2026-01-01", items: [["Ιανουάριος - Μαθηματικά", 140], ["Ιανουάριος - Αγγλικά", 140]] },
    { studentIdx: 11, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-14", method: "bank_transfer", items: [["Φεβρουάριος - Χημεία", 140], ["Φεβρουάριος - Βιολογία", 140]] },
    { studentIdx: 12, totalAmount: "140", paidAmount: 70, status: "partial", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-25", method: "cash", items: [["Φεβρουάριος - Φυσική", 140]] },
    { studentIdx: 13, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-08", method: "card", items: [["Φεβρουάριος - Αγγλικά", 140], ["Φεβρουάριος - Πληροφορική", 140]] },
    { studentIdx: 14, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-12", method: "bank_transfer", items: [["Φεβρουάριος - Χημεία", 140], ["Φεβρουάριος - Ιστορία", 140]] },
    { studentIdx: 15, totalAmount: "140", paidAmount: 0, status: "overdue", dueDate: "2026-01-31", issuedDate: "2026-01-01", items: [["Ιανουάριος - Μαθηματικά", 140]] },
    { studentIdx: 16, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-06", method: "bank_transfer", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Βιολογία", 140]] },
    { studentIdx: 17, totalAmount: "280", paidAmount: 170, status: "partial", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-19", method: "cash", items: [["Φεβρουάριος - Αγγλικά", 140], ["Φεβρουάριος - Βιολογία", 140]] },
    { studentIdx: 18, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-07", method: "card", items: [["Φεβρουάριος - Φυσική", 140], ["Φεβρουάριος - Πληροφορική", 140]] },
    { studentIdx: 19, totalAmount: "280", paidAmount: 280, status: "paid", dueDate: "2026-02-28", issuedDate: "2026-02-01", paidDate: "2026-02-11", method: "bank_transfer", items: [["Φεβρουάριος - Μαθηματικά", 140], ["Φεβρουάριος - Ιστορία", 140]] },
  ];

  for (let i = 0; i < invoicesData.length; i++) {
    const inv = invoicesData[i];
    const invoiceNumber = `INV-2026-${String(i + 1).padStart(4, "0")}`;

    await db.insert(schema.invoices).values({
      id: INVOICE_IDS[i],
      tenantId: TENANT_ID,
      studentId: STUDENT_IDS[inv.studentIdx],
      invoiceNumber,
      issuedDate: inv.issuedDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      status: inv.status,
    }).onConflictDoNothing();

    // Insert line items
    for (const [desc, amount] of inv.items) {
      await db.insert(schema.invoiceItems).values({
        invoiceId: INVOICE_IDS[i],
        description: desc,
        quantity: 1,
        unitPrice: String(amount),
        total: String(amount),
      }).onConflictDoNothing();
    }

    // Insert payment if paid
    if (inv.paidAmount > 0 && inv.paidDate && inv.method) {
      await db.insert(schema.payments).values({
        tenantId: TENANT_ID,
        invoiceId: INVOICE_IDS[i],
        studentId: STUDENT_IDS[inv.studentIdx],
        amount: String(inv.paidAmount),
        method: inv.method,
        paymentDate: inv.paidDate,
        recordedBy: ADMIN_USER_ID,
      }).onConflictDoNothing();
    }
  }

  // 11. PUBLISH SOME EXAMS (set publishedAt on 3 of 5, leave 2 as drafts)
  console.log("  Setting exam publish status...");
  // Publish exams 0, 2, 4 — leave 1 and 3 as drafts
  for (const idx of [0, 2, 4]) {
    await db.update(schema.exams)
      .set({ publishedAt: new Date("2026-02-25T12:00:00Z") })
      .where(eq(schema.exams.id, EXAM_IDS[idx]));
  }

  // 12. HOMEWORK ASSIGNMENTS — delete old rows first for clean re-seed
  console.log("  Creating homework assignments...");
  for (const hwId of HOMEWORK_IDS) {
    await db.delete(schema.homeworkSubmissions).where(eq(schema.homeworkSubmissions.homeworkId, hwId));
    await db.delete(schema.homework).where(eq(schema.homework.id, hwId));
  }
  const homeworkData = [
    { classIdx: 0, title: "Ασκήσεις Τριγωνομετρίας §3.1-3.4", description: "Λύστε τις ασκήσεις 1-15 από το βιβλίο. Δώστε προσοχή στις βασικές ταυτότητες.", dueDate: "2026-03-14", attachments: [{ name: "Φυλλάδιο Τριγωνομετρίας.pdf", url: "/uploads/homework/trig-worksheet.pdf", size: 245760 }], requiresSubmission: true },
    { classIdx: 0, title: "Εκθετικές Συναρτήσεις - Θεωρία", description: "Διαβάστε το κεφάλαιο 4 και γράψτε σημειώσεις για τις ιδιότητες.", dueDate: "2026-03-17", attachments: [], requiresSubmission: false },
    { classIdx: 2, title: "Πρόβλημα Δυναμικής - Νεύτωνα", description: "Επίλυση 5 σύνθετων προβλημάτων δυναμικής (φυλλάδιο).", dueDate: "2026-03-12", attachments: [{ name: "Προβλήματα Δυναμικής.pdf", url: "/uploads/homework/dynamics-problems.pdf", size: 189440 }, { name: "Τυπολόγιο Φυσικής.pdf", url: "/uploads/homework/physics-formulas.pdf", size: 102400 }], requiresSubmission: true },
    { classIdx: 1, title: "Ολοκληρώματα - Βασικές Ασκήσεις", description: "Ασκήσεις 1-10 από το κεφάλαιο ολοκληρωμάτων.", dueDate: "2026-03-15", attachments: [{ name: "Integrals Practice.pdf", url: "/uploads/homework/integrals-practice.pdf", size: 153600 }], requiresSubmission: false },
    { classIdx: 4, title: "Essay: Climate Change Impact", description: "Write a 500-word argumentative essay on climate change measures. Use at least 3 sources.", dueDate: "2026-03-18", attachments: [], requiresSubmission: true },
  ];

  for (let i = 0; i < homeworkData.length; i++) {
    const { classIdx, attachments, requiresSubmission, ...rest } = homeworkData[i];
    await db.insert(schema.homework).values({
      id: HOMEWORK_IDS[i],
      tenantId: TENANT_ID,
      classId: CLASS_IDS[classIdx],
      ...rest,
      attachments,
      requiresSubmission,
      assignedBy: ADMIN_USER_ID,
    }).onConflictDoNothing();
  }

  // Create homework submissions for enrolled students
  console.log("  Creating homework submissions...");
  const hwEnrollments: Record<number, number[]> = {
    0: [0, 3, 6, 9, 15],       // class 0 students
    1: [0, 3, 6, 9, 15],       // class 0 students (second hw)
    2: [0, 6, 12, 18],          // class 2 students
    3: [1, 4, 7, 10, 16, 19],  // class 1 students
    4: [1, 4, 5, 10, 13, 17],  // class 4 students
  };

  for (const [hwIdx, studentIdxs] of Object.entries(hwEnrollments)) {
    for (const sIdx of studentIdxs) {
      // Make some completed: student 0 completed hw 0 and 2, student 1 completed hw 3
      const isCompleted =
        (Number(hwIdx) === 0 && sIdx === 0) ||
        (Number(hwIdx) === 2 && sIdx === 0) ||
        (Number(hwIdx) === 3 && sIdx === 1);

      // If completed and homework requires submission, include a submission file
      const hwItem = homeworkData[Number(hwIdx)];
      const hasSubmissionFile = isCompleted && hwItem.requiresSubmission;
      await db.insert(schema.homeworkSubmissions).values({
        homeworkId: HOMEWORK_IDS[Number(hwIdx)],
        studentId: STUDENT_IDS[sIdx],
        status: isCompleted ? "completed" : "pending",
        submittedAt: isCompleted ? new Date("2026-03-08T14:00:00Z") : null,
        submissionFile: hasSubmissionFile ? { name: "Λύσεις_Μαθητή.pdf", url: "/uploads/homework/student-submission-sample.pdf", size: 312320 } : null,
      }).onConflictDoNothing();
    }
  }

  // 13. LESSON PLANS
  console.log("  Creating lesson plans...");
  const lessonPlanData = [
    { classIdx: 0, title: "Τριγωνομετρία - Βασικές ταυτότητες", description: "Εισαγωγή στις τριγωνομετρικές ταυτότητες και εφαρμογές.", objectives: ["Κατανόηση βασικών τριγωνομετρικών ταυτοτήτων", "Εφαρμογή σε ασκήσεις", "Γεωμετρική ερμηνεία"], materials: [{ title: "Βιβλίο Μαθηματικών §3.1", type: "document" }, { title: "Geogebra Trig Demo", url: "https://geogebra.org/trig", type: "link" }], lessonDate: "2026-02-23", orderIndex: 1 },
    { classIdx: 0, title: "Τριγωνομετρία - Επίλυση τριγώνων", description: "Νόμος ημιτόνων & συνημιτόνων.", objectives: ["Νόμος ημιτόνων", "Νόμος συνημιτόνων", "Επίλυση πλάγιων τριγώνων"], materials: [{ title: "Φυλλάδιο Ασκήσεων", type: "document" }], lessonDate: "2026-02-25", orderIndex: 2 },
    { classIdx: 0, title: "Εκθετικές - Λογαριθμικές συναρτήσεις", description: "Ορισμός και ιδιότητες εκθετικής συνάρτησης.", objectives: ["Ορισμός εκθετικής συνάρτησης", "Γραφική παράσταση", "Εφαρμογές στα φυσικά φαινόμενα"], materials: [{ title: "Desmos Graphing Tool", url: "https://desmos.com", type: "link" }, { title: "Video: Exponentials Explained", url: "https://youtube.com/example", type: "video" }], lessonDate: "2026-03-09", orderIndex: 3 },
    { classIdx: 2, title: "Δυναμική - Νόμοι Νεύτωνα", description: "Εφαρμογή νόμων Νεύτωνα σε προβλήματα κίνησης.", objectives: ["1ος Νόμος Νεύτωνα", "2ος Νόμος Νεύτωνα", "3ος Νόμος Νεύτωνα", "Ελεύθερα διαγράμματα σωμάτων"], materials: [{ title: "PhET Simulations - Forces", url: "https://phet.colorado.edu", type: "link" }, { title: "Σημειώσεις Δυναμικής", type: "document" }], lessonDate: "2026-02-27", orderIndex: 1 },
    { classIdx: 4, title: "Essay Writing - Argumentative Essays", description: "Structure and techniques for persuasive writing.", objectives: ["Thesis statement construction", "Supporting evidence", "Counter-argument handling", "Conclusion techniques"], materials: [{ title: "Essay Guide PDF", type: "document" }, { title: "Purdue OWL", url: "https://owl.purdue.edu", type: "link" }], lessonDate: "2026-02-24", orderIndex: 1 },
    { classIdx: 1, title: "Παράγωγοι - Κανόνες παραγώγισης", description: "Βασικοί κανόνες παραγώγισης και εφαρμογές.", objectives: ["Κανόνας αλυσίδας", "Παράγωγος γινομένου", "Παράγωγος πηλίκου"], materials: [{ title: "Wolfram Alpha", url: "https://wolframalpha.com", type: "link" }], lessonDate: "2026-02-24", orderIndex: 1 },
  ];

  for (let i = 0; i < lessonPlanData.length; i++) {
    const { classIdx, ...rest } = lessonPlanData[i];
    await db.insert(schema.lessonPlans).values({
      id: LESSON_PLAN_IDS[i],
      tenantId: TENANT_ID,
      classId: CLASS_IDS[classIdx],
      ...rest,
      createdBy: ADMIN_USER_ID,
    }).onConflictDoNothing();
  }

  // 14. PERSONAL TODOS for student 1
  console.log("  Creating student todos...");
  const todoData = [
    { title: "Διάβασε κεφάλαιο 5 Μαθηματικών", description: "Προετοιμασία για το επόμενο μάθημα τριγωνομετρίας.", isCompleted: false, dueDate: "2026-03-12" },
    { title: "Ολοκλήρωσε φυλλάδιο Φυσικής", description: null, isCompleted: true, dueDate: "2026-03-05" },
    { title: "Ρώτα καθηγητή για εξετάσεις", description: "Ρώτα τον κ. Κατσαρό για τις εξετάσεις Μαρτίου.", isCompleted: false, dueDate: null },
  ];

  for (let i = 0; i < todoData.length; i++) {
    await db.insert(schema.studentTodos).values({
      id: TODO_IDS[i],
      tenantId: TENANT_ID,
      studentId: STUDENT_IDS[0], // First student (Αλέξανδρος)
      ...todoData[i],
    }).onConflictDoNothing();
  }

  // 15. ACTIVITY LOG
  console.log("  Creating activity log...");
  const activityData = [
    { eventType: "payment_received", entityType: "payment", entityId: INVOICE_IDS[3], title: "Πληρωμή καταχωρήθηκε", description: "Σοφία Νικολάου - €280 για Φεβρουάριο", severity: "success" as const, timestamp: "2026-02-28T10:30:00Z" },
    { eventType: "payment_overdue", entityType: "student", entityId: STUDENT_IDS[10], title: "Ληξιπρόθεσμη πληρωμή", description: "Παύλος Σωκράτους - €280 (Ιανουάριος)", severity: "error" as const, timestamp: "2026-02-27T09:00:00Z" },
    { eventType: "session_completed", entityType: "session", entityId: SESSION_IDS[7], title: "Μάθημα ολοκληρώθηκε", description: "Βιολογία Γ' Λυκείου - 4/5 παρόντες", severity: "info" as const, timestamp: "2026-02-27T17:05:00Z" },
    { eventType: "exam_graded", entityType: "exam", entityId: EXAM_IDS[4], title: "Βαθμολογία καταχωρήθηκε", description: "Writing Test - Αγγλικά Β2-C1, μέσος: 14.8/20", severity: "success" as const, timestamp: "2026-02-26T14:20:00Z" },
    { eventType: "student_at_risk", entityType: "student", entityId: STUDENT_IDS[1], title: "Μαθητής σε κίνδυνο", description: "Μαρία Ιωάννου - Χαμηλή παρουσία (62%)", severity: "warning" as const, timestamp: "2026-02-26T11:00:00Z" },
    { eventType: "payment_received", entityType: "payment", entityId: INVOICE_IDS[16], title: "Πληρωμή καταχωρήθηκε", description: "Μιχάλης Χαραλάμπους - €280 για Φεβρουάριο", severity: "success" as const, timestamp: "2026-02-25T16:45:00Z" },
    { eventType: "session_completed", entityType: "session", entityId: SESSION_IDS[3], title: "Μάθημα ολοκληρώθηκε", description: "Αγγλικά Β2-C1 - 4/6 παρόντες", severity: "info" as const, timestamp: "2026-02-25T16:35:00Z" },
    { eventType: "exam_graded", entityType: "exam", entityId: EXAM_IDS[1], title: "Βαθμολογία καταχωρήθηκε", description: "Διαγώνισμα Παραγώγων - Β' Λυκείου, μέσος: 13.2/20", severity: "success" as const, timestamp: "2026-02-24T18:00:00Z" },
    { eventType: "payment_overdue", entityType: "student", entityId: STUDENT_IDS[15], title: "Ληξιπρόθεσμη πληρωμή", description: "Κατερίνα Ηλία - €140 (Ιανουάριος)", severity: "error" as const, timestamp: "2026-02-24T09:00:00Z" },
    { eventType: "payment_partial", entityType: "payment", entityId: INVOICE_IDS[7], title: "Μερική πληρωμή", description: "Άννα Κωνσταντίνου - €190 / €280", severity: "warning" as const, timestamp: "2026-02-23T14:30:00Z" },
    { eventType: "session_completed", entityType: "session", entityId: SESSION_IDS[2], title: "Μάθημα ολοκληρώθηκε", description: "Χημεία-Βιολογία Γ' - 5/6 παρόντες", severity: "info" as const, timestamp: "2026-02-24T19:05:00Z" },
    { eventType: "payment_received", entityType: "payment", entityId: INVOICE_IDS[13], title: "Πληρωμή καταχωρήθηκε", description: "Έλενα Βασιλείου - €280 για Φεβρουάριο", severity: "success" as const, timestamp: "2026-02-22T11:15:00Z" },
    { eventType: "student_at_risk", entityType: "student", entityId: STUDENT_IDS[10], title: "Μαθητής σε κίνδυνο", description: "Παύλος Σωκράτους - Χαμηλή παρουσία & βαθμοί", severity: "warning" as const, timestamp: "2026-02-21T10:00:00Z" },
    { eventType: "exam_graded", entityType: "exam", entityId: EXAM_IDS[2], title: "Βαθμολογία καταχωρήθηκε", description: "Τεστ Νόμων Νεύτωνα - Φυσική Α', μέσος: 15.0/20", severity: "success" as const, timestamp: "2026-02-21T17:30:00Z" },
    { eventType: "session_completed", entityType: "session", entityId: SESSION_IDS[5], title: "Μάθημα ολοκληρώθηκε", description: "Φυσική Α' Λυκείου - 4/4 παρόντες", severity: "success" as const, timestamp: "2026-02-21T16:35:00Z" },
  ];

  for (const act of activityData) {
    const { timestamp, ...rest } = act;
    await db.insert(schema.activityLog).values({
      tenantId: TENANT_ID,
      actorId: ADMIN_USER_ID,
      createdAt: new Date(timestamp),
      ...rest,
    }).onConflictDoNothing();
  }

  console.log("\n✅ Seed complete!");
  console.log("   Admin login:    admin@velt.education / admin123");
  console.log("   Teacher login:  teacher@velt.education / teacher123");
  console.log("   Student login:  student@velt.education / student123");
  console.log("   Student 2:      student2@velt.education / student123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
