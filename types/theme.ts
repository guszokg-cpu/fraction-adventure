export type ThemeId = "royal" | "ocean" | "forest" | "berry";

export type ThemePreset = {
  id: ThemeId;
  name: string;
  description: string;
  swatches: string[];
};
