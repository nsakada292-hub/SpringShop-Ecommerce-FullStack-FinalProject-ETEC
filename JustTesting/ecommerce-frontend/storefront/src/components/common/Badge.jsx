import { cn } from "../../utils/helpers";

export default function Badge({ children, color = "lime", className }) {
  const colors = {
    lime: "bg-brand.limeGreen/10 text-brand.glowGreen border-brand.glowGreen/30",
    blue: "bg-brand.blue/10 text-brand.blue border-brand.blue/30",
    aqua: "bg-brand.aqua/10 text-brand.aqua border-brand.aqua/30",
    slate: "bg-slate-500/10 text-slate-500 border-slate-500/30 dark:text-slate-300",
    red: "bg-red-500/10 text-red-500 border-red-500/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}
