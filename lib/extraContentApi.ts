export type ExtraContentBlock = {
  id: string;
  lessonSlug: string;
  stepIndex: number;
  imageUrl: string;
  caption: string;
  visible: boolean;
  createdAt: number;
};

export type StoreData = {
  blocks: ExtraContentBlock[];
  hiddenSteps: Record<string, number[]>;
};

const EMPTY: StoreData = { blocks: [], hiddenSteps: {} };

// ─── Simple in-memory cache (shared across components in same page) ───────────
let _cache: { data: StoreData; ts: number } | null = null;
const CACHE_TTL = 1500;

export function invalidateCache() {
  _cache = null;
}

export async function fetchStore(): Promise<StoreData> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;
  try {
    const res = await fetch("/api/extra-content", { cache: "no-store" });
    if (!res.ok) return _cache?.data ?? EMPTY;
    const data: StoreData = await res.json();
    _cache = { data, ts: Date.now() };
    return data;
  } catch {
    return _cache?.data ?? EMPTY;
  }
}

async function saveStore(data: StoreData): Promise<void> {
  _cache = { data, ts: Date.now() };
  await fetch("/api/extra-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  _cache = null;
}

// ─── Query helpers ─────────────────────────────────────────────────────────────

export async function getVisibleBlocksForStep(
  lessonSlug: string,
  stepIndex: number
): Promise<ExtraContentBlock[]> {
  const store = await fetchStore();
  return store.blocks
    .filter((b) => b.lessonSlug === lessonSlug && b.stepIndex === stepIndex && b.visible)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function isStepHiddenApi(
  lessonSlug: string,
  stepIndex: number
): Promise<boolean> {
  const store = await fetchStore();
  return (store.hiddenSteps[lessonSlug] ?? []).includes(stepIndex);
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export async function addBlock(
  block: Omit<ExtraContentBlock, "id" | "createdAt">
): Promise<void> {
  const store = await fetchStore();
  store.blocks.push({
    ...block,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  });
  await saveStore(store);
}

export async function toggleBlockVisibilityApi(id: string): Promise<void> {
  const store = await fetchStore();
  const block = store.blocks.find((b) => b.id === id);
  if (block) block.visible = !block.visible;
  await saveStore(store);
}

export async function deleteBlockApi(id: string): Promise<void> {
  const store = await fetchStore();
  store.blocks = store.blocks.filter((b) => b.id !== id);
  await saveStore(store);
}

export async function toggleStepHiddenApi(
  lessonSlug: string,
  stepIndex: number
): Promise<void> {
  const store = await fetchStore();
  const hidden = new Set(store.hiddenSteps[lessonSlug] ?? []);
  if (hidden.has(stepIndex)) hidden.delete(stepIndex);
  else hidden.add(stepIndex);
  store.hiddenSteps[lessonSlug] = Array.from(hidden);
  await saveStore(store);
}
