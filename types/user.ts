export type UserRole = "student" | "teacher" | "admin";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  gradeLabel: string;
  level: number;
  xp: number;
  maxXp: number;
  stars: number;
  coins: number;
};
