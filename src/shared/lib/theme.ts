export const THEME_COOKIE_NAME = "warehouse_theme";

export const THEME_VALUES = ["light", "dark"] as const;
export type Theme = (typeof THEME_VALUES)[number];

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}
