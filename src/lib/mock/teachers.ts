import type { Teacher } from "../types/teacher";

export const mockTeachers: Teacher[] = [
  {
    id: "tch_001", firstName: "Δρ. Ανδρέας", lastName: "Κατσαρός", fullName: "Δρ. Ανδρέας Κατσαρός",
    email: "a.katsaros@veltedu.cy", phone: "+357 99 100200",
    subjects: ["Mathematics", "Physics"],
    classIds: ["cls_001", "cls_002", "cls_003"],
    bio: "Πτυχιούχος Μαθηματικών του Πανεπιστημίου Κύπρου με 12 χρόνια εμπειρία στη διδασκαλία. Εξειδικεύεται στην προετοιμασία για παγκύπριες εξετάσεις.",
    qualifications: ["BSc Mathematics", "MSc Applied Mathematics", "PGCE"],
    joinedDate: "2020-09-01",
    hourlyRate: 35
  },
  {
    id: "tch_002", firstName: "Μαρία", lastName: "Σταύρου", fullName: "Μαρία Σταύρου",
    email: "m.stavrou@veltedu.cy", phone: "+357 99 300400",
    subjects: ["English", "Greek Literature"],
    classIds: ["cls_005", "cls_007"],
    bio: "Κάτοχος πτυχίου Αγγλικής Φιλολογίας από το Πανεπιστήμιο Αθηνών. Εγγεγραμμένη εκπαιδευτικός με πάνω από 8 χρόνια εμπειρία.",
    qualifications: ["BA English Literature", "CELTA", "DELTA"],
    joinedDate: "2021-09-01",
    hourlyRate: 30
  },
  {
    id: "tch_003", firstName: "Σπύρος", lastName: "Λεωνίδου", fullName: "Σπύρος Λεωνίδου",
    email: "s.leonidou@veltedu.cy", phone: "+357 99 500600",
    subjects: ["Chemistry", "Biology"],
    classIds: ["cls_004", "cls_006"],
    bio: "Βιοχημικός με μεταπτυχιακό από το Πανεπιστήμιο Κύπρου. Διδάσκει με έμφαση στο πείραμα και την πρακτική εφαρμογή.",
    qualifications: ["BSc Biochemistry", "MSc Molecular Biology"],
    joinedDate: "2022-01-15",
    hourlyRate: 32
  },
  {
    id: "tch_004", firstName: "Ελπίδα", lastName: "Γεωργίου", fullName: "Ελπίδα Γεωργίου",
    email: "e.georgiou@veltedu.cy", phone: "+357 99 700800",
    subjects: ["History", "Economics"],
    classIds: ["cls_007"],
    bio: "Ιστορικός με εξειδίκευση στην Ιστορία της Κύπρου και τα Οικονομικά. Αποφοίτησε από το Πάντειο Πανεπιστήμιο.",
    qualifications: ["BA History", "MA European History"],
    joinedDate: "2022-09-01",
    hourlyRate: 28
  },
  {
    id: "tch_005", firstName: "Χρίστος", lastName: "Ευσταθίου", fullName: "Χρίστος Ευσταθίου",
    email: "c.efstathiou@veltedu.cy", phone: "+357 99 900100",
    subjects: ["Informatics", "Mathematics"],
    classIds: ["cls_008"],
    bio: "Μηχανικός Λογισμικού με εμπειρία στον κλάδο της τεχνολογίας. Διδάσκει Πληροφορική με σύγχρονες μεθόδους.",
    qualifications: ["BSc Computer Science", "MSc Software Engineering"],
    joinedDate: "2023-01-01",
    hourlyRate: 30
  }
];
