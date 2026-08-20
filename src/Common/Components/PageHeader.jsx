import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Common PageHeader Component
 * Call this in any page by passing props according to page requirement.
 * 
 * Props:
 * @param {string|ReactNode} title - Page title (e.g. "!! Capture New Lead !!")
 * @param {string|ReactNode} [description] - Optional subtext
 * @param {string|ReactNode} [badge] - Optional badge tag (e.g. "FORM LM-01")
 * @param {string} [badgeColor] - Custom tailwind classes for badge
 * @param {boolean} [showBackButton=false] - Show back arrow button
 * @param {string} [backPath] - Route path for back button (default: navigate(-1))
 * @param {function} [onBack] - Custom back handler
 * @param {ReactComponent|ReactNode} [icon] - Optional icon component or SVG
 * @param {string} [iconBgColor="bg-blue-50"] - Icon wrapper background class
 * @param {string} [iconColor="text-blue-600"] - Icon color class
 * @param {ReactNode} [rightActions] - Buttons/Controls for top-right area
 * @param {string} [className] - Extra container classes
 * @param {ReactNode} [children] - Extra child element under description
 */
const PageHeader = ({ 
  title, 
  description,
  badge,
  badgeColor = "bg-blue-50 text-blue-700 border-blue-200",
  showBackButton = false,
  backPath,
  onBack,
  icon: Icon,
  iconBgColor = "bg-blue-50",
  iconColor = "text-blue-600",
  rightActions = null,
  className = "",
  children 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const isBackVisible = showBackButton || Boolean(backPath || onBack);

  return (
    <div className={`bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${className}`}>
      
      {/* Left Area: Back Arrow + Title + Subtitle / Badge */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        
        {/* Back Button */}
        {isBackVisible && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}

        {/* Optional Icon Box */}
        {Icon && (
          <div className={`${iconBgColor} p-2.5 rounded-lg shrink-0 flex items-center justify-center`}>
            {typeof Icon === 'function' ? (
              <Icon className={`w-5 h-5 ${iconColor}`} />
            ) : (
              Icon
            )}
          </div>
        )}

        {/* Title, Badge & Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-wide">
              {title}
            </h1>

            {badge && (
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              {description}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Right Actions Area */}
      {rightActions && (
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {rightActions}
        </div>
      )}

    </div>
  );
};

export default PageHeader;