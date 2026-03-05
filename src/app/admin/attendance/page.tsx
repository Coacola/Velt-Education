import { mockSessions, mockClasses } from "@/lib/mock";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";

export default function AttendancePage() {
  return <AttendanceClient sessions={mockSessions} classes={mockClasses} />;
}
