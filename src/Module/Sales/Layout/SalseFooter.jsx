import React from "react";
// Exact matching filename: CodeCrafterlogo.webp
import codeCrafterLogo from "../../../assets/CodeCrafterlogo.webp";

const SalseFooter = () => {
  return (
    <footer className="w-full bg-white py-3.5 px-4 sm:px-6 border-t border-slate-100 flex items-center justify-center text-center select-none">
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600">
        
        {/* Purple Circle (c) Icon */}
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-purple-600 text-purple-600 text-[10px] font-bold shrink-0">
          ©
        </span>

        {/* Copyright Text */}
        <span className="text-slate-700 font-medium">
          2025–2026 DSS. All rights reserved.
        </span>

        {/* Designed & Developed by */}
        <span className="text-slate-500">
          Designed & Developed by
        </span>

        {/* CodeCrafter Image Logo */}
        <div className="inline-flex items-center ml-1">
          <img
            src={codeCrafterLogo}
            alt="CodeCrafter"
            className="h-5 sm:h-6 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </div>

      </div>
    </footer>
  );
};

export default SalseFooter;