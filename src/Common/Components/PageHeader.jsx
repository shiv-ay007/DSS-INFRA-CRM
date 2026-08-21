import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className={`bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs ${className}`}>
      
      {/* Left Area: Back Arrow + Title + Subtitle / Badge */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        
        {/* Back Button */}
        {isBackVisible && (
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}

        {/* Optional Icon Box */}
        {Icon && (
          <div className={`${iconBgColor} p-2 rounded-lg shrink-0 flex items-center justify-center`}>
            {typeof Icon === 'function' ? (
              <Icon className={`w-4 h-4 ${iconColor}`} />
            ) : (
              Icon
            )}
          </div>
        )}

        {/* Title, Badge & Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h1>

            {badge && (
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
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