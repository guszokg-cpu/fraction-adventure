export type LessonStatus = "completed" | "current" | "locked";

export type Lesson = {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  gradeRange: string;
  stars: number;
  progress: number;
  status: LessonStatus;
  icon: string;
  color: "sky" | "violet" | "green" | "amber" | "pink" | "slate";
};
