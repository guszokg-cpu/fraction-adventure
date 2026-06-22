export type FractionShapeKind = "circle" | "bar" | "grid";

export type FractionTone = "accent" | "emerald" | "violet" | "sky" | "pink";

export type LessonTip = {
  id: string;
  icon: string;
  text: string;
};

export type LessonExample = {
  id: string;
  numerator: number;
  denominator: number;
  label: string;
  tone: FractionTone;
};

export type LessonMissionItem = {
  id: string;
  icon: string;
  title: string;
  current: number;
  target: number;
};

export type LessonMeta = {
  order: number;
  total: number;
  progress: number;
  stars: number;
  maxStars: number;
  prevHref: string;
  nextHref: string;
  nextLabel: string;
};

export type FractionQuizQuestion = {
  id: string;
  prompt: string;
  numerator: number;
  denominator: number;
  shape: FractionShapeKind;
  tone: FractionTone;
  choices: string[];
  answer: string;
  explanation: string;
};
