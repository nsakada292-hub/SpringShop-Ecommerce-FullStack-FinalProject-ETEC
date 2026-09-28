import { cn } from "../../utils/helpers";
import useScrollLock from "../../hooks/useScrollLock";
import CloseButton from "./CloseButton";

export default function Modal({ open, onClose, children, title, className }) {
  useScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <CloseButton onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
