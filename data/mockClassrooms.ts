export type MockStudent = {
  id: string;
  name: string;
  grade: string;
};

export type MockClassroom = {
  teacherPin: string;
  teacherName: string;
  className: string;
  students: MockStudent[];
};

// ── Demo data ──────────────────────────────────────────────────────────────
// ครูสร้างรหัสห้องและ Student ID ผ่านหน้า /teacher/classroom
// ตอนต่อ Supabase ให้เปลี่ยนฟังก์ชันด้านล่างเรียก DB แทน
export const MOCK_CLASSROOMS: MockClassroom[] = [
  {
    teacherPin: "TEACH01",
    teacherName: "ครูสมศรี ใจดี",
    className: "ป.5/1",
    students: [
      { id: "S001", name: "น้องเฟรชชี่", grade: "ป.5" },
      { id: "S002", name: "น้องฟ้า",     grade: "ป.5" },
      { id: "S003", name: "น้องปาล์ม",  grade: "ป.5" },
      { id: "S004", name: "น้องแมว",    grade: "ป.5" },
      { id: "S005", name: "น้องบอล",    grade: "ป.5" },
    ],
  },
  {
    teacherPin: "TEACH02",
    teacherName: "ครูวิไล รักเรียน",
    className: "ป.4/2",
    students: [
      { id: "A001", name: "น้องใบเตย", grade: "ป.4" },
      { id: "A002", name: "น้องโอ๊ต",  grade: "ป.4" },
    ],
  },
];

export function findClassroom(pin: string): MockClassroom | undefined {
  return MOCK_CLASSROOMS.find(
    (c) => c.teacherPin.toUpperCase() === pin.trim().toUpperCase()
  );
}

export function findStudent(pin: string, studentId: string): { student: MockStudent; classroom: MockClassroom } | undefined {
  const classroom = findClassroom(pin);
  if (!classroom) return undefined;
  const student = classroom.students.find(
    (s) => s.id.toUpperCase() === studentId.trim().toUpperCase()
  );
  return student ? { student, classroom } : undefined;
}
