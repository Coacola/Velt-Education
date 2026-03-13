# Teacher Panel — Full Functionality & Admin Sync Plan

## Phase 1: UI Enhancements — Interactable Cards & List/Grid Views

### 1A. Teacher Dashboard — Interactable Cards
**File**: `src/components/teacher/TeacherDashboard.tsx`
- Wrap each KPI card with `<Link>`: "My Classes" → `/teacher/classes`, "My Students" → `/teacher/students`, "Today's Classes" stays visual, "Avg Attendance" → `/teacher/attendance`
- Add `hover` prop + `cursor-pointer` to KPI GlassCards
- Make Today's Schedule cards clickable → link to `/teacher/attendance` (pre-filtered)
- Make My Classes overview cards clickable → link to `/teacher/classes`

### 1B. Teacher Classes — Add List View Toggle
**File**: `src/components/teacher/TeacherClassesClient.tsx`
- Add `viewMode` state (`"grid" | "list"`) + LayoutGrid/List toggle buttons in PageHeader actions
- Grid: existing card layout
- List: `GlassTable` with columns — Name, Subject, Year, Schedule summary, Students/Capacity

### 1C. Teacher Students — List View + Clickable → Student Detail
**Files to modify**: `src/components/teacher/TeacherStudentsClient.tsx`
**Files to create**: `src/app/teacher/students/[id]/page.tsx`, `src/app/teacher/students/[id]/loading.tsx`
**File to modify**: `src/components/students/StudentProfileClient.tsx` — accept `basePath` prop

- Add grid/list toggle to TeacherStudentsClient
- Grid: wrap each card in `<Link href="/teacher/students/{id}">`
- List: `GlassTable` with columns — Name, School, Year, Classes, Attendance%, Phone; `onRowClick` → navigate
- New student detail route: reuses `StudentProfileClient` with `basePath="/teacher"` so back-link works
- `StudentProfileClient`: replace hardcoded `/admin/students` with `${basePath}/students`, hide Edit button when not admin

### 1D. Teacher Payments — Add List View Toggle
**File**: `src/components/teacher/TeacherPaymentsClient.tsx`
- Add `viewMode` state (`"cards" | "list"`) toggle
- Cards: existing layout
- List: `GlassTable` with columns — Student, Status badge, Total, Paid, Remaining, Due Date

---

## Phase 2: Teacher-Scoped Backend Actions

### 2A. Authorization Helper
**File**: `src/lib/actions/teacher-utils.ts` (NEW)
- `getTeacherFromSession()` — auth() + getTeacherByUserId() → returns `{ teacher, tenantId, userId }` or redirects
- `verifyTeacherOwnsClass(teacherId, classId)` — checks DB that class.teacherId matches
- `verifyTeacherOwnsSession(teacherId, sessionId)` — joins session → class → checks teacherId
- `verifyTeacherOwnsExam(teacherId, examId)` — joins exam → class → checks teacherId

### 2B. Teacher Attendance Actions
**File**: `src/lib/actions/teacher-attendance.ts` (NEW)
- `createSessionAsTeacher(data)` — verify ownership → insert session → logActivity → revalidate both panels
- `saveAttendanceAsTeacher(input)` — verify ownership → bulk save records → mark completed → logActivity → revalidate both
- `updateSessionStatusAsTeacher(sessionId, status)` — verify → update → revalidate both

### 2C. Teacher Exam Actions
**File**: `src/lib/actions/teacher-exams.ts` (NEW)
- `createExamAsTeacher(data)` — verify class ownership → insert → logActivity → revalidate both
- `saveGradesAsTeacher(input)` — verify exam ownership → bulk save grades → logActivity → revalidate both
- `deleteExamAsTeacher(id)` — verify ownership → delete → revalidate both

### 2D. Dual-Panel Revalidation
Every teacher action calls `revalidatePath("/teacher/...")` AND `revalidatePath("/admin/...")` so both dashboards stay in sync.

---

## Phase 3: Teacher Functional Pages (Attendance & Exams CRUD)

### 3A. Teacher Attendance — Create Sessions + Take Attendance
**File**: `src/components/teacher/TeacherAttendanceClient.tsx` (REWRITE)
- Add "New Session" button in PageHeader → opens create modal
- Modal: class dropdown (teacher's classes only), date, startTime, endTime, topic
- Each session card becomes clickable → links to `/teacher/attendance/[id]`

**File**: `src/app/teacher/attendance/[id]/page.tsx` (NEW)
- Server: auth + verify session belongs to teacher's class
- Renders `TeacherSessionDetailClient`

**File**: `src/app/teacher/attendance/[id]/loading.tsx` (NEW)

**File**: `src/components/teacher/TeacherSessionDetailClient.tsx` (NEW)
- Mirrors admin's `SessionDetailClient` pattern:
  - Header: class name, date, time, topic, status badge
  - "Mark Attendance" table: per-student status buttons (present/absent/late/excused)
  - Save button → `saveAttendanceAsTeacher()`
  - Back link → `/teacher/attendance`

### 3B. Teacher Exams — Create Exams + Grade Students
**File**: `src/components/teacher/TeacherExamsClient.tsx` (REWRITE)
- Add "New Exam" button → create modal (class, title, date, maxScore)
- Exam cards become clickable → opens grading modal
- Grading modal: table with student name, score input, absent checkbox, save button
- Save → `saveGradesAsTeacher()`
- Delete exam → `deleteExamAsTeacher()`

### 3C. Teacher Payments — Read-Only (unchanged)
Teachers view payment info but cannot record payments. No backend changes needed.

---

## Phase 4: Admin Panel Sync & Polish

### 4A. Activity Log Shows Teacher Actions
Teacher actions call `logActivity()` with `actorId: userId`. Admin dashboard activity feed already reads all activities for the tenant, so teacher actions appear automatically.

### 4B. Admin Already Sees All Data
Admin pages use `getSessions(tenantId)` / `getExams(tenantId)` which return ALL tenant data — teacher-created data is included. The `revalidatePath("/admin/...")` calls in teacher actions ensure admin pages refresh.

### 4C. Build & Test
- `next build` — verify zero errors
- Test full flow: teacher creates attendance session → admin sees it
- Test: teacher creates exam + grades → admin sees it
- Test: teacher views student detail → data is correctly scoped

---

## Files Summary

### NEW (8 files)
1. `src/lib/actions/teacher-utils.ts`
2. `src/lib/actions/teacher-attendance.ts`
3. `src/lib/actions/teacher-exams.ts`
4. `src/app/teacher/attendance/[id]/page.tsx`
5. `src/app/teacher/attendance/[id]/loading.tsx`
6. `src/app/teacher/students/[id]/page.tsx`
7. `src/app/teacher/students/[id]/loading.tsx`
8. `src/components/teacher/TeacherSessionDetailClient.tsx`

### MODIFIED (7 files)
1. `src/components/teacher/TeacherDashboard.tsx` — clickable cards
2. `src/components/teacher/TeacherClassesClient.tsx` — list view
3. `src/components/teacher/TeacherStudentsClient.tsx` — list view + links
4. `src/components/teacher/TeacherAttendanceClient.tsx` — create + link to detail
5. `src/components/teacher/TeacherExamsClient.tsx` — create + grading modal
6. `src/components/teacher/TeacherPaymentsClient.tsx` — list view
7. `src/components/students/StudentProfileClient.tsx` — basePath prop
