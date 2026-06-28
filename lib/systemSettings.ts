const KEY = "fa_system_settings";
const DEFAULTS = { adminPassword: "admin1234", schoolName: "", gradeRange: "ป.4–ป.6" };

type SystemSettings = typeof DEFAULTS;

export function getSystemSettings(): SystemSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function saveSystemSettings(patch: Partial<SystemSettings>): void {
  const current = getSystemSettings();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
}

export function getAdminPassword(): string {
  return getSystemSettings().adminPassword;
}
