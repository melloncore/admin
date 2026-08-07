/** Convert "#RRGGBB" into "R G B" so it can feed Tailwind's rgb(var(..) / a) pattern. */
function hexToChannels(hex: string): string {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean, 16);
  if (Number.isNaN(bigint)) return "43 58 108"; // fallback: brand-600
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

export function applyBrandColors(colors: {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--color-primary", hexToChannels(colors.primaryColor));
  root.style.setProperty("--color-secondary", hexToChannels(colors.secondaryColor));
  root.style.setProperty("--color-tertiary", hexToChannels(colors.tertiaryColor));
}
