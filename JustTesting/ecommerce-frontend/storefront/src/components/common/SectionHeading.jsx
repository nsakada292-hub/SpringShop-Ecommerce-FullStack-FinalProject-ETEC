import { cn } from "../../utils/helpers";

export default function SectionHeading({
  children,
  className,
  as: Tag = "h2",
  size = "lg",
  muted = false,
}) {
  const sizes = {
    md: "text-lg font-semibold",
    lg: "text-2xl md:text-3xl font-bold",
  };

  return (
    <Tag
      className={cn(
        sizes[size],
        muted
          ? "text-sm font-semibold text-slate-900 dark:text-white mb-3"
          : "text-slate-900 dark:text-white",
        className
      )}
    >
      {children}
    </Tag>
  );
}
