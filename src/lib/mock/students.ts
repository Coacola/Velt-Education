import type { Student } from "../types/student";

export const mockStudents: Student[] = [
  {
    id: "stu_001", firstName: "Αλέξανδρος", lastName: "Παπαδόπουλος", fullName: "Αλέξανδρος Παπαδόπουλος",
    email: "alex.papa@gmail.com", phone: "+357 99 123456", parentName: "Νίκος Παπαδόπουλος", parentPhone: "+357 99 654321",
    year: "Α", school: "Λύκειο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_001", "cls_003"],
    subjects: ["Mathematics", "Physics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.94, avgGrade: 17.5, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_002", firstName: "Μαρία", lastName: "Ιωάννου", fullName: "Μαρία Ιωάννου",
    email: "maria.io@hotmail.com", phone: "+357 99 234567", parentName: "Ελένη Ιωάννου", parentPhone: "+357 99 765432",
    year: "Β", school: "Λύκειο Στροβόλου", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_005"],
    subjects: ["Mathematics", "English"], paymentStatus: "overdue", outstandingBalance: 280,
    attendanceRate: 0.62, avgGrade: 9.5, atRisk: true, riskReason: ["Low attendance", "Low grades", "Overdue payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_003", firstName: "Κωνσταντίνος", lastName: "Χριστοδούλου", fullName: "Κωνσταντίνος Χριστοδούλου",
    email: "kostas.ch@gmail.com", phone: "+357 99 345678", parentName: "Σταύρος Χριστοδούλου", parentPhone: "+357 99 876543",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_006"],
    subjects: ["Chemistry", "Biology"], paymentStatus: "partial", outstandingBalance: 140,
    attendanceRate: 0.88, avgGrade: 14.2, atRisk: false, riskReason: ["Partial payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_004", firstName: "Σοφία", lastName: "Νικολάου", fullName: "Σοφία Νικολάου",
    email: "sofia.nik@gmail.com", phone: "+357 99 456789", parentName: "Ανδρέας Νικολάου", parentPhone: "+357 99 987654",
    year: "Α", school: "Λύκειο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_001", "cls_007"],
    subjects: ["Mathematics", "History"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.97, avgGrade: 18.8, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_005", firstName: "Δημήτρης", lastName: "Αντωνίου", fullName: "Δημήτρης Αντωνίου",
    email: "dmitris.ant@gmail.com", phone: "+357 99 567890", parentName: "Γιώργος Αντωνίου", parentPhone: "+357 99 098765",
    year: "Β", school: "Γυμνάσιο Πόλης", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_008"],
    subjects: ["Mathematics", "Informatics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.91, avgGrade: 16.0, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_006", firstName: "Ελένη", lastName: "Παπαγεωργίου", fullName: "Ελένη Παπαγεωργίου",
    email: "eleni.pap@gmail.com", phone: "+357 99 678901", parentName: "Μαρία Παπαγεωργίου", parentPhone: "+357 99 109876",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_005"],
    subjects: ["English", "Biology"], paymentStatus: "overdue", outstandingBalance: 420,
    attendanceRate: 0.65, avgGrade: 11.3, atRisk: true, riskReason: ["Low attendance", "Overdue payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_007", firstName: "Νικόλας", lastName: "Στυλιανού", fullName: "Νικόλας Στυλιανού",
    email: "nikolas.st@gmail.com", phone: "+357 99 789012", parentName: "Πέτρος Στυλιανού", parentPhone: "+357 99 210987",
    year: "Α", school: "Λύκειο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_001", "cls_003"],
    subjects: ["Mathematics", "Physics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.89, avgGrade: 15.4, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-15"
  },
  {
    id: "stu_008", firstName: "Άννα", lastName: "Κωνσταντίνου", fullName: "Άννα Κωνσταντίνου",
    email: "anna.kon@gmail.com", phone: "+357 99 890123", parentName: "Σπύρος Κωνσταντίνου", parentPhone: "+357 99 321098",
    year: "Β", school: "Λύκειο Στροβόλου", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_006"],
    subjects: ["Mathematics", "Chemistry"], paymentStatus: "partial", outstandingBalance: 90,
    attendanceRate: 0.82, avgGrade: 13.7, atRisk: false, riskReason: ["Partial payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_009", firstName: "Γιώργος", lastName: "Μιχαήλ", fullName: "Γιώργος Μιχαήλ",
    email: "giorgos.mi@gmail.com", phone: "+357 99 901234", parentName: "Τάσος Μιχαήλ", parentPhone: "+357 99 432109",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_007"],
    subjects: ["History", "Economics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.93, avgGrade: 16.8, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_010", firstName: "Χριστίνα", lastName: "Λοΐζου", fullName: "Χριστίνα Λοΐζου",
    email: "christina.lo@gmail.com", phone: "+357 99 012345", parentName: "Ανδρέας Λοΐζου", parentPhone: "+357 99 543210",
    year: "Α", school: "Γυμνάσιο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_001", "cls_008"],
    subjects: ["Mathematics", "Informatics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.96, avgGrade: 19.1, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_011", firstName: "Παύλος", lastName: "Σωκράτους", fullName: "Παύλος Σωκράτους",
    email: "pavlos.so@gmail.com", phone: "+357 99 111222", parentName: "Κώστας Σωκράτους", parentPhone: "+357 99 222111",
    year: "Β", school: "Λύκειο Στροβόλου", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_005"],
    subjects: ["Mathematics", "English"], paymentStatus: "overdue", outstandingBalance: 350,
    attendanceRate: 0.58, avgGrade: 8.2, atRisk: true, riskReason: ["Low attendance", "Low grades", "Overdue payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_012", firstName: "Ιωάννα", lastName: "Θεοδώρου", fullName: "Ιωάννα Θεοδώρου",
    email: "ioanna.th@gmail.com", phone: "+357 99 333444", parentName: "Νίκος Θεοδώρου", parentPhone: "+357 99 444333",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_006"],
    subjects: ["Biology", "Chemistry"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.90, avgGrade: 17.0, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_013", firstName: "Σταύρος", lastName: "Αλεξίου", fullName: "Σταύρος Αλεξίου",
    email: "stavros.al@gmail.com", phone: "+357 99 555666", parentName: "Μάριος Αλεξίου", parentPhone: "+357 99 666555",
    year: "Α", school: "Λύκειο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_003"],
    subjects: ["Physics"], paymentStatus: "partial", outstandingBalance: 70,
    attendanceRate: 0.85, avgGrade: 14.9, atRisk: false, riskReason: ["Partial payment"],
    enrolledSince: "2024-10-01"
  },
  {
    id: "stu_014", firstName: "Έλενα", lastName: "Βασιλείου", fullName: "Έλενα Βασιλείου",
    email: "elena.vas@gmail.com", phone: "+357 99 777888", parentName: "Πέτρος Βασιλείου", parentPhone: "+357 99 888777",
    year: "Β", school: "Γυμνάσιο Πόλης", monthlyFee: 160, enrolledClassIds: ["cls_005", "cls_008"],
    subjects: ["English", "Informatics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.92, avgGrade: 15.6, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_015", firstName: "Αντρέας", lastName: "Ορφανίδης", fullName: "Αντρέας Ορφανίδης",
    email: "andreas.or@gmail.com", phone: "+357 99 999000", parentName: "Χριστάκης Ορφανίδης", parentPhone: "+357 99 000999",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_007"],
    subjects: ["History", "Greek Literature"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.87, avgGrade: 16.3, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_016", firstName: "Κατερίνα", lastName: "Ηλία", fullName: "Κατερίνα Ηλία",
    email: "katerina.il@gmail.com", phone: "+357 99 112233", parentName: "Παύλος Ηλία", parentPhone: "+357 99 332211",
    year: "Α", school: "Λύκειο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_001"],
    subjects: ["Mathematics"], paymentStatus: "overdue", outstandingBalance: 140,
    attendanceRate: 0.72, avgGrade: 12.1, atRisk: true, riskReason: ["Overdue payment"],
    enrolledSince: "2024-09-15"
  },
  {
    id: "stu_017", firstName: "Μιχάλης", lastName: "Χαραλάμπους", fullName: "Μιχάλης Χαραλάμπους",
    email: "michalis.ch@gmail.com", phone: "+357 99 445566", parentName: "Γιώργης Χαραλάμπους", parentPhone: "+357 99 665544",
    year: "Β", school: "Λύκειο Στροβόλου", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_006"],
    subjects: ["Mathematics", "Chemistry"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.95, avgGrade: 18.2, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_018", firstName: "Ρένα", lastName: "Πολυκάρπου", fullName: "Ρένα Πολυκάρπου",
    email: "rena.pol@gmail.com", phone: "+357 99 778899", parentName: "Φοίβος Πολυκάρπου", parentPhone: "+357 99 998877",
    year: "Γ", school: "Λύκειο Λεμεσού", monthlyFee: 180, enrolledClassIds: ["cls_004", "cls_005"],
    subjects: ["English", "Biology"], paymentStatus: "partial", outstandingBalance: 110,
    attendanceRate: 0.83, avgGrade: 14.5, atRisk: false, riskReason: ["Partial payment"],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_019", firstName: "Βασίλης", lastName: "Μαρκίδης", fullName: "Βασίλης Μαρκίδης",
    email: "vasilis.ma@gmail.com", phone: "+357 99 223344", parentName: "Αντώνης Μαρκίδης", parentPhone: "+357 99 443322",
    year: "Α", school: "Γυμνάσιο Λευκωσίας", monthlyFee: 140, enrolledClassIds: ["cls_003", "cls_008"],
    subjects: ["Physics", "Informatics"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.91, avgGrade: 15.8, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  },
  {
    id: "stu_020", firstName: "Ζωή", lastName: "Κυπριανού", fullName: "Ζωή Κυπριανού",
    email: "zoe.kyp@gmail.com", phone: "+357 99 556677", parentName: "Θανάσης Κυπριανού", parentPhone: "+357 99 776655",
    year: "Β", school: "Λύκειο Στροβόλου", monthlyFee: 160, enrolledClassIds: ["cls_002", "cls_007"],
    subjects: ["Mathematics", "History"], paymentStatus: "paid", outstandingBalance: 0,
    attendanceRate: 0.88, avgGrade: 16.5, atRisk: false, riskReason: [],
    enrolledSince: "2024-09-01"
  }
];
