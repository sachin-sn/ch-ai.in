// The theme registry. Each theme is a self-contained folder under
// code/themes/<id>/ (its own CSS + homepage component), so a theme can be
// lifted out into a separate template repo later without untangling it
// from the others. Adding a theme = adding one entry here plus its folder;
// nothing else in the app needs to change.

export type ThemeId = "magazine" | "pixel" | "material" | "monochrome";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  available: boolean; // false = registered but not built yet
};

export const themes: ThemeMeta[] = [
  { id: "magazine", label: "Magazine", available: true },
  { id: "pixel", label: "Pixel", available: true },
  { id: "material", label: "Material", available: true },
  { id: "monochrome", label: "Mono", available: true },
];

export const defaultTheme: ThemeId = "magazine";

export const availableThemeIds: ThemeId[] = themes
  .filter((t) => t.available)
  .map((t) => t.id);

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return !!value && themes.some((t) => t.id === value);
}
