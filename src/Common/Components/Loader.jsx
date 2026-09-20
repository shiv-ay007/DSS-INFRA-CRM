import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Common Loader Component
 * By default, this renders inside containers/tables without freezing or spinning the entire screen.
 *
 * Props:
 * - text: Message displayed under the spinner (default: "Loading data...")
 * - size: Size of the spinner icon (default: 32)
 * - color: Tailwind text color class (default: "text-blue-600")
 * - fullScreen: If true, renders as a full page overlay (default: false)
 * - className: Additional CSS classes for custom padding/styling
 */
const Loader = ({
  text = "Loading data...",
  size = 32,
  color = "text-blue-600",
  fullScreen = false,
  className = "",
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs"
    : `flex flex-col items-center justify-center py-12 px-4 gap-3 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        <Loader2
          size={size}
          className={`animate-spin ${color} stroke-[2.5]`}
        />
      </div>
      {text && (
        <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
