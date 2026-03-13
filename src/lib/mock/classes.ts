import type { Class } from "../types/class";

export const mockClasses: Class[] = [
  {
    id: "cls_001", name: "Μαθηματικά Α' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", year: "Α",
    studentIds: ["stu_001", "stu_004", "stu_007", "stu_010", "stu_016"],
    capacity: 8, color: "#6c6cff",
    schedule: [
      { day: "Monday", startTime: "16:00", endTime: "17:30" },
      { day: "Wednesday", startTime: "16:00", endTime: "17:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_002", name: "Μαθηματικά Β' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", year: "Β",
    studentIds: ["stu_002", "stu_005", "stu_008", "stu_011", "stu_017", "stu_020"],
    capacity: 8, color: "#a78bfa",
    schedule: [
      { day: "Tuesday", startTime: "17:00", endTime: "18:30" },
      { day: "Thursday", startTime: "17:00", endTime: "18:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_003", name: "Φυσική Α' Λυκείου", subject: "Physics",
    teacherId: "tch_001", year: "Α",
    studentIds: ["stu_001", "stu_007", "stu_013", "stu_019"],
    capacity: 6, color: "#34d399",
    schedule: [
      { day: "Friday", startTime: "15:00", endTime: "16:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_004", name: "Χημεία-Βιολογία Γ' Λυκείου", subject: "Chemistry",
    teacherId: "tch_003", year: "Γ",
    studentIds: ["stu_003", "stu_006", "stu_009", "stu_012", "stu_015", "stu_018"],
    capacity: 8, color: "#f59e0b",
    schedule: [
      { day: "Monday", startTime: "17:30", endTime: "19:00" },
      { day: "Wednesday", startTime: "17:30", endTime: "19:00" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_005", name: "Αγγλικά Β2-C1", subject: "English",
    teacherId: "tch_002", year: "Β",
    studentIds: ["stu_002", "stu_005", "stu_006", "stu_011", "stu_014", "stu_018"],
    capacity: 10, color: "#06b6d4",
    schedule: [
      { day: "Tuesday", startTime: "15:00", endTime: "16:30" },
      { day: "Saturday", startTime: "10:00", endTime: "11:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_006", name: "Βιολογία Γ' Λυκείου", subject: "Biology",
    teacherId: "tch_003", year: "Γ",
    studentIds: ["stu_003", "stu_006", "stu_008", "stu_012", "stu_017"],
    capacity: 8, color: "#ec4899",
    schedule: [
      { day: "Thursday", startTime: "15:30", endTime: "17:00" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_007", name: "Ιστορία - Οικονομικά Γ'", subject: "History",
    teacherId: "tch_004", year: "Γ",
    studentIds: ["stu_004", "stu_009", "stu_015", "stu_020"],
    capacity: 8, color: "#f97316",
    schedule: [
      { day: "Wednesday", startTime: "15:00", endTime: "16:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  },
  {
    id: "cls_008", name: "Πληροφορική & Προγραμματισμός", subject: "Informatics",
    teacherId: "tch_005", year: "Β",
    studentIds: ["stu_005", "stu_010", "stu_014", "stu_019"],
    capacity: 6, color: "#10b981",
    schedule: [
      { day: "Friday", startTime: "17:00", endTime: "18:30" }
    ],
    startDate: "2025-09-08", endDate: "2026-06-15"
  }
];
