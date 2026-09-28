import { cn } from "../../utils/helpers";

const types = {
  error:
    "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-500/20",
  success: "bg-brand.limeGreen/10 text-brand.glowGreen border-brand.glowGreen/30",
  info: "bg-brand.blue/10 text-brand.blue border-brand.blue/30",
};

export default function Alert({ children, type = "error", className }) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border text-sm",
        types[type],
        className
      )}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
