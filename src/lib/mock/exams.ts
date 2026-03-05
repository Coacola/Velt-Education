import type { Exam } from "../types/exam";

export const mockExams: Exam[] = [
  {
    id: "exam_001", title: "Τεστ Τριγωνομετρίας", classId: "cls_001", className: "Μαθηματικά Α' Λυκείου",
    subject: "Mathematics", teacherId: "tch_001", date: "2025-02-14", maxScore: 20,
    classAverage: 15.6,
    grades: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", score: 18, absent: false },
      { studentId: "stu_004", studentName: "Σοφία Νικολάου", score: 19, absent: false },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", score: 15, absent: false },
      { studentId: "stu_010", studentName: "Χριστίνα Λοΐζου", score: 20, absent: false },
      { studentId: "stu_016", studentName: "Κατερίνα Ηλία", score: 11, absent: false }
    ]
  },
  {
    id: "exam_002", title: "Διαγώνισμα Παραγώγων", classId: "cls_002", className: "Μαθηματικά Β' Λυκείου",
    subject: "Mathematics", teacherId: "tch_001", date: "2025-02-18", maxScore: 20,
    classAverage: 13.2,
    grades: [
      { studentId: "stu_002", studentName: "Μαρία Ιωάννου", score: 8, absent: false },
      { studentId: "stu_005", studentName: "Δημήτρης Αντωνίου", score: 16, absent: false },
      { studentId: "stu_008", studentName: "Άννα Κωνσταντίνου", score: 14, absent: false },
      { studentId: "stu_011", studentName: "Παύλος Σωκράτους", score: 7, absent: false },
      { studentId: "stu_017", studentName: "Μιχάλης Χαραλάμπους", score: 19, absent: false },
      { studentId: "stu_020", studentName: "Ζωή Κυπριανού", score: 15, absent: false }
    ]
  },
  {
    id: "exam_003", title: "Τεστ Νόμων Νεύτωνα", classId: "cls_003", className: "Φυσική Α' Λυκείου",
    subject: "Physics", teacherId: "tch_001", date: "2025-02-21", maxScore: 20,
    classAverage: 15.0,
    grades: [
      { studentId: "stu_001", studentName: "Αλέξανδρος Παπαδόπουλος", score: 17, absent: false },
      { studentId: "stu_007", studentName: "Νικόλας Στυλιανού", score: 15, absent: false },
      { studentId: "stu_013", studentName: "Σταύρος Αλεξίου", score: 14, absent: false },
      { studentId: "stu_019", studentName: "Βασίλης Μαρκίδης", score: 14, absent: false }
    ]
  },
  {
    id: "exam_004", title: "Διαγώνισμα Οργανικής Χημείας", classId: "cls_004", className: "Χημεία-Βιολογία Γ'",
    subject: "Chemistry", teacherId: "tch_003", date: "2025-02-19", maxScore: 20,
    classAverage: 14.3,
    grades: [
      { studentId: "stu_003", studentName: "Κωνσταντίνος Χριστοδούλου", score: 14, absent: false },
      { studentId: "stu_006", studentName: "Ελένη Παπαγεωργίου", score: 11, absent: false },
      { studentId: "stu_009", studentName: "Γιώργος Μιχαήλ", score: 17, absent: false },
      { studentId: "stu_012", studentName: "Ιωάννα Θεοδώρου", score: 18, absent: false },
      { studentId: "stu_015", studentName: "Αντρέας Ορφανίδης", score: 13, absent: false },
      { studentId: "stu_018", studentName: "Ρένα Πολυκάρπου", score: 12, absent: false }
    ]
  },
  {
    id: "exam_005", title: "Writing Test - C1 Level", classId: "cls_005", className: "Αγγλικά Β2-C1",
    subject: "English", teacherId: "tch_002", date: "2025-02-20", maxScore: 20,
    classAverage: 14.8,
    grades: [
      { studentId: "stu_002", studentName: "Μαρία Ιωάννου", score: 12, absent: false },
      { studentId: "stu_005", studentName: "Δημήτρης Αντωνίου", score: 16, absent: false },
      { studentId: "stu_006", studentName: "Ελένη Παπαγεωργίου", score: 13, absent: false },
      { studentId: "stu_011", studentName: "Παύλος Σωκράτους", score: 11, absent: false },
      { studentId: "stu_014", studentName: "Έλενα Βασιλείου", score: 17, absent: false },
      { studentId: "stu_018", studentName: "Ρένα Πολυκάρπου", score: 14, absent: false }
    ]
  }
];
