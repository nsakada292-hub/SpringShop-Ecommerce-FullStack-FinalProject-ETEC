import { cn } from "../../utils/helpers";

export default function PageContainer({ children, className, size = "lg" }) {
  const sizes = {
    md: "max-w-md mx-auto px-4",
    lg: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  };

  return <div className={cn(sizes[size], className)}>{children}</div>;
}
