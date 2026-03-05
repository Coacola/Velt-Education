import type { AttendanceSession } from "../types/attendance";

export const mockSessions: AttendanceSession[] = [
  {
    id: "ses_001", classId: "cls_001", className: "Μαθηματικά Α' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", teacherName: "Δρ. Ανδρέας Κατσαρός",
    date: "2025-02-24", startTime: "16:00", endTime: "17:30", status: "completed",
    topic: "Τριγωνομετρία - Βασικές ταυτότητες",
    records: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", status: "present" },
      { studentId: "stu_004", studentName: "Σοφία Νικολάου", status: "present" },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", status: "late", note: "5 λεπτά αργά" },
      { studentId: "stu_010", studentName: "Χριστίνα Λοΐζου", status: "present" },
      { studentId: "stu_016", studentName: "Κατερίνα Ηλία", status: "absent" }
    ]
  },
  {
    id: "ses_002", classId: "cls_002", className: "Μαθηματικά Β' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", teacherName: "Δρ. Ανδρέας Κατσαρός",
    date: "2025-02-25", startTime: "17:00", endTime: "18:30", status: "completed",
    topic: "Παράγωγοι - Κανόνες παραγώγισης",
    records: [
      { studentId: "stu_002", studentName: "Μαρία Ιωάννου", status: "absent" },
      { studentId: "stu_005", studentName: "Δημήτρης Αντωνίου", status: "present" },
      { studentId: "stu_008", studentName: "Άννα Κωνσταντίνου", status: "present" },
      { studentId: "stu_011", studentName: "Παύλος Σωκράτους", status: "absent" },
      { studentId: "stu_017", studentName: "Μιχάλης Χαραλάμπους", status: "present" },
      { studentId: "stu_020", studentName: "Ζωή Κυπριανού", status: "present" }
    ]
  },
  {
    id: "ses_003", classId: "cls_004", className: "Χημεία-Βιολογία Γ' Λυκείου", subject: "Chemistry",
    teacherId: "tch_003", teacherName: "Σπύρος Λεωνίδου",
    date: "2025-02-24", startTime: "17:30", endTime: "19:00", status: "completed",
    topic: "Οργανική Χημεία - Υδρογονάνθρακες",
    records: [
      { studentId: "stu_003", studentName: "Κωνσταντίνος Χριστοδούλου", status: "present" },
      { studentId: "stu_006", studentName: "Ελένη Παπαγεωργίου", status: "absent" },
      { studentId: "stu_009", studentName: "Γιώργος Μιχαήλ", status: "present" },
      { studentId: "stu_012", studentName: "Ιωάννα Θεοδώρου", status: "present" },
      { studentId: "stu_015", studentName: "Αντρέας Ορφανίδης", status: "present" },
      { studentId: "stu_018", studentName: "Ρένα Πολυκάρπου", status: "late" }
    ]
  },
  {
    id: "ses_004", classId: "cls_005", className: "Αγγλικά Β2-C1", subject: "English",
    teacherId: "tch_002", teacherName: "Μαρία Σταύρου",
    date: "2025-02-25", startTime: "15:00", endTime: "16:30", status: "completed",
    topic: "Essay Writing - Argumentative Essays",
    records: [
      { studentId: "stu_002", studentName: "Μαρία Ιωάννου", status: "present" },
      { studentId: "stu_005", studentName: "Δημήτρης Αντωνίου", status: "present" },
      { studentId: "stu_006", studentName: "Ελένη Παπαγεωργίου", status: "absent" },
      { studentId: "stu_011", studentName: "Παύλος Σωκράτους", status: "absent" },
      { studentId: "stu_014", studentName: "Έλενα Βασιλείου", status: "present" },
      { studentId: "stu_018", studentName: "Ρένα Πολυκάρπου", status: "present" }
    ]
  },
  {
    id: "ses_005", classId: "cls_001", className: "Μαθηματικά Α' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", teacherName: "Δρ. Ανδρέας Κατσαρός",
    date: "2025-02-26", startTime: "16:00", endTime: "17:30", status: "completed",
    topic: "Τριγωνομετρία - Επίλυση τριγώνων",
    records: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", status: "present" },
      { studentId: "stu_004", studentName: "Σοφία Νικολάου", status: "present" },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", status: "present" },
      { studentId: "stu_010", studentName: "Χριστίνα Λοΐζου", status: "present" },
      { studentId: "stu_016", studentName: "Κατερίνα Ηλία", status: "present" }
    ]
  },
  {
    id: "ses_006", classId: "cls_003", className: "Φυσική Α' Λυκείου", subject: "Physics",
    teacherId: "tch_001", teacherName: "Δρ. Ανδρέας Κατσαρός",
    date: "2025-02-28", startTime: "15:00", endTime: "16:30", status: "completed",
    topic: "Δυναμική - Νόμοι Νεύτωνα",
    records: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", status: "present" },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", status: "present" },
      { studentId: "stu_013", studentName: "Σταύρος Αλεξίου", status: "late" },
      { studentId: "stu_019", studentName: "Βασίλης Μαρκίδης", status: "present" }
    ]
  },
  {
    id: "ses_007", classId: "cls_001", className: "Μαθηματικά Α' Λυκείου", subject: "Mathematics",
    teacherId: "tch_001", teacherName: "Δρ. Ανδρέας Κατσαρός",
    date: "2025-03-03", startTime: "16:00", endTime: "17:30", status: "scheduled",
    topic: "Εκθετικές - Λογαριθμικές συναρτήσεις",
    records: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", status: "present" },
      { studentId: "stu_004", studentName: "Σοφία Νικολάου", status: "present" },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", status: "present" },
      { studentId: "stu_010", studentName: "Χριστίνα Λοΐζου", status: "present" },
      { studentId: "stu_016", studentName: "Κατερίνα Ηλία", status: "present" }
    ]
  },
  {
    id: "ses_008", classId: "cls_006", className: "Βιολογία Γ' Λυκείου", subject: "Biology",
    teacherId: "tch_003", teacherName: "Σπύρος Λεωνίδου",
    date: "2025-02-27", startTime: "15:30", endTime: "17:00", status: "completed",
    topic: "Γενετική - DNA και Αναπαραγωγή",
    records: [
      { studentId: "stu_003", studentName: "Κωνσταντίνος Χριστοδούλου", status: "present" },
      { studentId: "stu_006", studentName: "Ελένη Παπαγεωργίου", status: "absent" },
      { studentId: "stu_008", studentName: "Άννα Κωνσταντίνου", status: "present" },
      { studentId: "stu_012", studentName: "Ιωάννα Θεοδώρου", status: "present" },
      { studentId: "stu_017", studentName: "Μιχάλης Χαραλάμπους", status: "present" }
    ]
  }
];
