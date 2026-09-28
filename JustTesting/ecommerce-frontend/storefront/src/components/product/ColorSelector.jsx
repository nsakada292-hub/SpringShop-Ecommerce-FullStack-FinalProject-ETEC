import { cn } from "../../utils/helpers";

// Common named colors the backend stores as strings ("Navy Blue",
// "White", ...) mapped to swatches. Falls back to using the value as a
// CSS color for hex names.
const NAMED_COLORS = {
  black: "#111111",
  white: "#f8f8f8",
  navy: "#1a2a4a",
  "navy blue": "#1a2a4a",
  blue: "#1e6bd6",
  "sky blue": "#7cc4ff",
  "light blue": "#a5d8ff",
  grey: "#8c929b",
  gray: "#8c929b",
  "dark grey": "#4b5563",
  "light grey": "#d1d5db",
  brown: "#7a4a26",
  "dark brown": "#5a3420",
  beige: "#d9c6a9",
  tan: "#d2b48c",
  cream: "#f3e9dc",
  green: "#3f9e6c",
  "dark green": "#2a6b4f",
  olive: "#708238",
  lime: "#a3d977",
  red: "#d63a3a",
  burgundy: "#7a2140",
  maroon: "#7a2140",
  pink: "#e8a2b8",
  "hot pink": "#e44f8a",
  yellow: "#f2d13d",
  gold: "#d4af37",
  "mustard yellow": "#d4a017",
  orange: "#ee8434",
  purple: "#7b5bc7",
  teal: "#2c9e97",
  "light pink": "#f6c9dd",
  "light purple": "#d7c8f2",
  "light green": "#b9e6cd",
  "light yellow": "#f7e8a8",
  rose: "#e08e9c",
  lavender: "#c9b6e4",
  camel: "#b58a5a",
  "multi color": "linear-gradient(90deg, #e44f8a, #f2d13d, #3f9e6c, #1e6bd6)",
  multicolor: "linear-gradient(90deg, #e44f8a, #f2d13d, #3f9e6c, #1e6bd6)",
};

function swatchFor(color) {
  if (!color) return "#cbd5e1";
  const lower = String(color).toLowerCase().trim();
  if (lower in NAMED_COLORS) return NAMED_COLORS[lower];
  if (/^[#a-f0-9]+$/i.test(lower)) return `#${lower}`;
  if (/^#/.test(color)) return color;
  return "#cbd5e1";
}

export default function ColorSelector({ colors = [], value, onChange, required }) {
  if (!colors || colors.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Color {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const colorValue = color.value || color.hex || color;
          const colorName = color.name || colorValue;
          return (
            <button
              key={colorValue}
              onClick={() => onChange(colorValue)}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition flex items-center justify-center",
                value === colorValue
                  ? "border-brand.blue scale-110"
                  : "border-slate-200 dark:border-slate-600"
              )}
              title={colorName}
              style={{ background: swatchFor(colorValue) }}
              aria-label={colorName}
            >
              {value === colorValue && (
                <svg className="h-4 w-4 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
