import React from "react";
import { FaCheck, FaLayerGroup } from "react-icons/fa";

export const PIPELINE_STAGES = [
  { id: 1, name: "Visit", fullName: "Site Visit" },
  { id: 2, name: "Brief", fullName: "Site Briefing" },
  { id: 3, name: "Tent. Form", fullName: "Tentative Quotation — Formation" },
  { id: 4, name: "Tent. Accept", fullName: "Tentative Quotation — Client Acceptance" },
  { id: 5, name: "Concept", fullName: "Concept Drawing — Formation & Finalisation" },
  { id: 6, name: "Bank", fullName: "Bank Quotation — Formation & Handover" },
  { id: 7, name: "Structure", fullName: "Structure Work — Formation" },
  { id: 8, name: "Elevation", fullName: "Front Elevation — Formation & Finalisation" },
  { id: 9, name: "Material", fullName: "Material Finalisation" },
  { id: 10, name: "Final Quot.", fullName: "Final Quotation — Formation & Client Acceptance" },
  { id: 11, name: "Contract", fullName: "Contract Formation & Acceptance" }
];

export const isStageApplicable = (stageId, scope) => {
  if (scope === "Consultancy Only") {
    return stageId <= 2;
  }
  if (scope === "Design Only") {
    return stageId <= 10;
  }
  return true;
};

const PresalesStepper = ({
  activeStageId = 1,
  onSelectStage,
  engagementScope = "Design + Construction",
  currentStageId = 1,
  stagesData = {}
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FaLayerGroup className="text-blue-600" />
          <span>11-Stage Design Pipeline Progress</span>
        </h3>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
          Viewing: Stage {activeStageId} ({PIPELINE_STAGES.find((s) => s.id === activeStageId)?.fullName || ""})
        </span>
      </div>

      {/* Stepper Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[760px] relative pt-2">
          {/* Background Connecting Line */}
          <div
            className="absolute top-6 h-0.5 bg-slate-200 -translate-y-1/2 z-0"
            style={{ left: "calc(100% / 22)", right: "calc(100% / 22)" }}
          ></div>

          <div className="grid grid-cols-11 gap-1 relative z-10">
            {PIPELINE_STAGES.map((stage) => {
              const applicable = isStageApplicable(stage.id, engagementScope);
              const isSelected = stage.id === activeStageId;
              const hasData = Boolean(stagesData && stagesData[stage.id] && Object.keys(stagesData[stage.id]).length > 0);
              const isCompleted = applicable && (stage.id < currentStageId || hasData);

              return (
                <div
                  key={stage.id}
                  onClick={() => applicable && onSelectStage?.(stage.id)}
                  title={
                    !applicable
                      ? `Stage ${stage.id} (${stage.name}) is N/A for scope '${engagementScope}'`
                      : `Click to view/edit Stage ${stage.id}: ${stage.fullName}`
                  }
                  className={`flex flex-col items-center select-none text-center transition-all ${
                    !applicable
                      ? "opacity-35 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105 active:scale-95"
                  }`}
                >
                  {/* Step Bubble Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      !applicable
                        ? "bg-slate-100 text-slate-400 border border-slate-300"
                        : isSelected
                        ? "ring-4 ring-blue-100 bg-blue-600 text-white shadow-sm scale-110"
                        : isCompleted
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white border-2 border-slate-300 text-slate-500 hover:border-blue-400"
                    }`}
                  >
                    {!applicable ? (
                      "✕"
                    ) : isCompleted ? (
                      <FaCheck className="text-[10px]" />
                    ) : (
                      stage.id
                    )}
                  </div>

                  {/* Step Short Name */}
                  <span
                    className={`text-[11px] mt-1.5 font-bold leading-tight truncate max-w-[65px] ${
                      !applicable
                        ? "text-slate-400 line-through"
                        : isSelected
                        ? "text-blue-700 font-extrabold"
                        : "text-slate-600"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresalesStepper;
