const SESSION_KEY = "fa_student_session";

export type StudentSession = {
  teacherPin: string;
  studentId: string;
  studentName: string;
  grade: string;
  className: string;
  teacherName: string;
};

export function getStudentSession(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function setStudentSession(session: StudentSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStudentSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
