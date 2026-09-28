import { cn } from "../../utils/helpers";
import { Link } from "react-router-dom";

export default function BrandLogo({ className, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={cn(
        "font-bold text-transparent bg-clip-text bg-lagoon-gradient",
        className
      )}
    >
      LAGOON
    </Link>
  );
}
