import { cn } from "../../utils/helpers";

const shapes = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
};

export default function Card({
  children,
  className,
  hover,
  padding = "md",
  border = true,
  shape = "md",
}) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800",
        shapes[shape],
        border && "border border-slate-100 dark:border-slate-700",
        paddings[padding],
        hover &&
          "hover:shadow-lg hover:shadow-brand.blue/10 transition",
        className
      )}
    >
      {children}
    </div>
  );
}
