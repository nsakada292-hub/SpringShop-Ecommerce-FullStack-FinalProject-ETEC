import { cn } from "../../utils/helpers";

export default function Loader({ className }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="h-8 w-8 rounded-full border-4 border-brand.blue/20 border-t-brand.blue animate-spin" />
    </div>
  );
}
