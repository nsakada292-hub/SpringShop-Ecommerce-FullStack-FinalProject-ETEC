import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <p className="text-6xl font-bold text-transparent bg-clip-text bg-lagoon-gradient mb-4">
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Page not found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
