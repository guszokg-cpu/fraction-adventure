import { MOCK_CLASSROOMS } from "@/data/mockClassrooms";
import type { MockClassroom, MockStudent } from "@/data/mockClassrooms";

export type { MockClassroom, MockStudent };

const KEY = "fa_classrooms";

export function loadClassrooms(): MockClassroom[] {
  if (typeof window === "undefined") return MOCK_CLASSROOMS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as MockClassroom[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  try { localStorage.setItem(KEY, JSON.stringify(MOCK_CLASSROOMS)); } catch {}
  return MOCK_CLASSROOMS;
}

export function saveClassrooms(list: MockClassroom[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function findClassroomFromStore(pin: string): MockClassroom | undefined {
  return loadClassrooms().find(
    (c) => c.teacherPin.toUpperCase() === pin.trim().toUpperCase()
  );
}

export function findStudentFromStore(
  pin: string,
  studentId: string
): { student: MockStudent; classroom: MockClassroom } | undefined {
  const classroom = findClassroomFromStore(pin);
  if (!classroom) return undefined;
  const student = classroom.students.find(
    (s) => s.id.toUpperCase() === studentId.trim().toUpperCase()
  );
  return student ? { student, classroom } : undefined;
}
