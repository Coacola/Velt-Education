import type { ActivityEvent } from "../types/activity";

export const mockActivity: ActivityEvent[] = [
  { id: "act_001", type: "payment_received", title: "Πληρωμή καταχωρήθηκε", description: "Σοφία Νικολάου - €280 για Φεβρουάριο", timestamp: "2025-02-28T10:30:00Z", entityId: "inv_004", entityType: "payment", severity: "success" },
  { id: "act_002", type: "payment_overdue", title: "Ληξιπρόθεσμη πληρωμή", description: "Παύλος Σωκράτους - €280 (Ιανουάριος)", timestamp: "2025-02-27T09:00:00Z", entityId: "stu_011", entityType: "student", severity: "error" },
  { id: "act_003", type: "session_completed", title: "Μάθημα ολοκληρώθηκε", description: "Βιολογία Γ' Λυκείου - 4/5 παρόντες", timestamp: "2025-02-27T17:05:00Z", entityId: "ses_008", entityType: "session", severity: "info" },
  { id: "act_004", type: "exam_graded", title: "Βαθμολογία καταχωρήθηκε", description: "Writing Test - Αγγλικά Β2-C1, μέσος: 14.8/20", timestamp: "2025-02-26T14:20:00Z", entityId: "exam_005", entityType: "exam", severity: "success" },
  { id: "act_005", type: "student_at_risk", title: "Μαθητής σε κίνδυνο", description: "Μαρία Ιωάννου - Χαμηλή παρουσία (62%)", timestamp: "2025-02-26T11:00:00Z", entityId: "stu_002", entityType: "student", severity: "warning" },
  { id: "act_006", type: "payment_received", title: "Πληρωμή καταχωρήθηκε", description: "Μιχάλης Χαραλάμπους - €280 για Φεβρουάριο", timestamp: "2025-02-25T16:45:00Z", entityId: "inv_017", entityType: "payment", severity: "success" },
  { id: "act_007", type: "session_completed", title: "Μάθημα ολοκληρώθηκε", description: "Αγγλικά Β2-C1 - 4/6 παρόντες", timestamp: "2025-02-25T16:35:00Z", entityId: "ses_004", entityType: "session", severity: "info" },
  { id: "act_008", type: "exam_graded", title: "Βαθμολογία καταχωρήθηκε", description: "Διαγώνισμα Παραγώγων - Β' Λυκείου, μέσος: 13.2/20", timestamp: "2025-02-24T18:00:00Z", entityId: "exam_002", entityType: "exam", severity: "success" },
  { id: "act_009", type: "payment_overdue", title: "Ληξιπρόθεσμη πληρωμή", description: "Κατερίνα Ηλία - €140 (Ιανουάριος)", timestamp: "2025-02-24T09:00:00Z", entityId: "stu_016", entityType: "student", severity: "error" },
  { id: "act_010", type: "payment_partial", title: "Μερική πληρωμή", description: "Άννα Κωνσταντίνου - €190 / €280", timestamp: "2025-02-23T14:30:00Z", entityId: "inv_008", entityType: "payment", severity: "warning" },
  { id: "act_011", type: "session_completed", title: "Μάθημα ολοκληρώθηκε", description: "Χημεία-Βιολογία Γ' - 5/6 παρόντες", timestamp: "2025-02-24T19:05:00Z", entityId: "ses_003", entityType: "session", severity: "info" },
  { id: "act_012", type: "payment_received", title: "Πληρωμή καταχωρήθηκε", description: "Έλενα Βασιλείου - €280 για Φεβρουάριο", timestamp: "2025-02-22T11:15:00Z", entityId: "inv_014", entityType: "payment", severity: "success" },
  { id: "act_013", type: "student_at_risk", title: "Μαθητής σε κίνδυνο", description: "Παύλος Σωκράτους - Χαμηλή παρουσία & βαθμοί", timestamp: "2025-02-21T10:00:00Z", entityId: "stu_011", entityType: "student", severity: "warning" },
  { id: "act_014", type: "exam_graded", title: "Βαθμολογία καταχωρήθηκε", description: "Τεστ Νόμων Νεύτωνα - Φυσική Α', μέσος: 15.0/20", timestamp: "2025-02-21T17:30:00Z", entityId: "exam_003", entityType: "exam", severity: "success" },
  { id: "act_015", type: "session_completed", title: "Μάθημα ολοκληρώθηκε", description: "Φυσική Α' Λυκείου - 4/4 παρόντες", timestamp: "2025-02-21T16:35:00Z", entityId: "ses_006", entityType: "session", severity: "success" }
];
