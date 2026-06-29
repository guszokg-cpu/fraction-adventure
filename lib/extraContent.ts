export type ExtraContentBlock = {
  id: string;
  lessonSlug: string;
  stepIndex: number;
  imageUrl: string;
  caption: string;
  visible: boolean;
  createdAt: number;
};

const STORAGE_KEY = "fa_extra_content";

export function getExtraContent(): ExtraContentBlock[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveExtraContent(blocks: ExtraContentBlock[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
}

export function addExtraBlock(
  block: Omit<ExtraContentBlock, "id" | "createdAt">
): void {
  const blocks = getExtraContent();
  blocks.push({
    ...block,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  });
  saveExtraContent(blocks);
}

export function toggleBlockVisibility(id: string): void {
  const blocks = getExtraContent();
  const block = blocks.find((b) => b.id === id);
  if (block) block.visible = !block.visible;
  saveExtraContent(blocks);
}

export function deleteBlock(id: string): void {
  saveExtraContent(getExtraContent().filter((b) => b.id !== id));
}

export function getVisibleBlocksForStep(
  lessonSlug: string,
  stepIndex: number
): ExtraContentBlock[] {
  return getExtraContent()
    .filter(
      (b) =>
        b.lessonSlug === lessonSlug &&
        b.stepIndex === stepIndex &&
        b.visible
    )
    .sort((a, b) => a.createdAt - b.createdAt);
}

// ─── Hidden built-in steps ────────────────────────────────────────────────────

const HIDDEN_KEY = "fa_hidden_steps";

type HiddenMap = Record<string, number[]>;

function getHiddenMap(): HiddenMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveHiddenMap(map: HiddenMap): void {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(map));
}

export function isStepHidden(lessonSlug: string, stepIndex: number): boolean {
  const map = getHiddenMap();
  return (map[lessonSlug] ?? []).includes(stepIndex);
}

export function toggleStepHidden(lessonSlug: string, stepIndex: number): void {
  const map = getHiddenMap();
  const hidden = new Set(map[lessonSlug] ?? []);
  if (hidden.has(stepIndex)) hidden.delete(stepIndex);
  else hidden.add(stepIndex);
  map[lessonSlug] = Array.from(hidden);
  saveHiddenMap(map);
}

export function getHiddenStepsForLesson(lessonSlug: string): number[] {
  return getHiddenMap()[lessonSlug] ?? [];
}
