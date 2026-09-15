import React, { useMemo } from "react";
import Select, { components } from "react-select";
import { FaCheck, FaTimes } from "react-icons/fa";

/**
 * Custom Option Component with Checkbox
 */
const CheckboxOption = (props) => {
  const { isSelected, label } = props;
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2.5 py-0.5 cursor-pointer select-none">
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
            isSelected
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
              : "border-slate-300 bg-white hover:border-indigo-400"
          }`}
        >
          {isSelected && <FaCheck className="w-2.5 h-2.5" />}
        </div>
        <span className={`text-xs ${isSelected ? "font-bold text-indigo-900" : "font-medium text-slate-700"}`}>
          {label}
        </span>
      </div>
    </components.Option>
  );
};

/**
 * Custom MultiValue Chip/Badge (Modern Pill)
 */
const CustomMultiValue = (props) => {
  const { data, removeProps } = props;
  const colorTheme = props.selectProps?.themeColor || "indigo";

  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    amber: "bg-amber-50 border-amber-200 text-amber-900"
  }[colorTheme] || "bg-indigo-50 border-indigo-200 text-indigo-800";

  return (
    <div
      className={`inline-flex items-center justify-between gap-1.5 max-w-full pl-2.5 pr-1 py-0.5 m-0.5 rounded-full border text-[11px] font-bold tracking-tight shadow-2xs ${colorClasses}`}
      style={{ maxWidth: "calc(100% - 4px)" }}
    >
      <span className="truncate min-w-0 flex-1" title={data.label}>
        {data.label}
      </span>
      <button
        type="button"
        {...removeProps}
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-black/5 hover:bg-red-500 hover:text-white text-slate-500 transition-colors cursor-pointer"
        title={`Remove ${data.label}`}
        onClick={(e) => {
          e.stopPropagation();
          removeProps?.onClick?.(e);
        }}
      >
        <FaTimes className="w-2 h-2" />
      </button>
    </div>
  );
};

/**
 * Custom MenuList with "Select All" & "Clear All" bar
 */
const CustomMenuList = (props) => {
  const { selectProps } = props;
  const { onSelectAll, onClearAll, allSelected, totalCount, selectedCount } = selectProps;

  return (
    <components.MenuList {...props}>
      {(onSelectAll || onClearAll) && totalCount > 0 && (
        <div className="sticky top-0 z-10 px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-500">
            {selectedCount} of {totalCount} selected
          </span>
          <div className="flex items-center gap-2">
            {onSelectAll && (
              <button
                type="button"
                onClick={allSelected ? onClearAll : onSelectAll}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
              >
                {allSelected ? "Clear All" : "Select All"}
              </button>
            )}
          </div>
        </div>
      )}
      {props.children}
    </components.MenuList>
  );
};

/**
 * Reusable ReactSelectMulti
 *
 * @param {Array} options - Array of strings or { value, label } objects
 * @param {Array} value - Array of string values (e.g. ["S1", "S2"])
 * @param {Function} onChange - Callback returning array of string values
 * @param {string} placeholder - Placeholder text
 * @param {string} themeColor - "indigo" | "emerald" | "blue" | "amber"
 * @param {boolean} allowSelectAll - Whether to show Select All / Clear All bar
 */
export const ReactSelectMulti = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Search and select...",
  themeColor = "indigo",
  allowSelectAll = true,
  isDisabled = false,
  className = ""
}) => {
  // Normalize options to [{ value, label }]
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return { value: opt.value ?? opt.id, label: opt.label ?? opt.name ?? String(opt.value) };
      }
      return { value: String(opt), label: String(opt) };
    });
  }, [options]);

  // Normalize current selected value
  const selectedOptions = useMemo(() => {
    const valSet = new Set(Array.isArray(value) ? value : []);
    return normalizedOptions.filter((opt) => valSet.has(opt.value));
  }, [normalizedOptions, value]);

  const handleChange = (selected) => {
    const newValues = (selected || []).map((s) => s.value);
    onChange?.(newValues);
  };

  const handleSelectAll = () => {
    onChange?.(normalizedOptions.map((opt) => opt.value));
  };

  const handleClearAll = () => {
    onChange?.([]);
  };

  const allSelected = normalizedOptions.length > 0 && selectedOptions.length === normalizedOptions.length;

  return (
    <div className={`w-full ${className}`}>
      <Select
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        isSearchable
        isClearable={false}
        isDisabled={isDisabled}
        options={normalizedOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
        themeColor={themeColor}
        totalCount={normalizedOptions.length}
        selectedCount={selectedOptions.length}
        allSelected={allSelected}
        onSelectAll={allowSelectAll ? handleSelectAll : undefined}
        onClearAll={allowSelectAll ? handleClearAll : undefined}
        components={{
          Option: CheckboxOption,
          MultiValue: CustomMultiValue,
          MenuList: CustomMenuList,
          IndicatorSeparator: () => null
        }}
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999
          }),
          control: (base, state) => ({
            ...base,
            backgroundColor: isDisabled ? "#f8fafc" : "#ffffff",
            borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
            borderRadius: "0.625rem",
            minHeight: "44px",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(99, 102, 241, 0.12)" : "none",
            "&:hover": {
              borderColor: "#818cf8"
            },
            cursor: "pointer",
            padding: "2px 4px",
            transition: "all 0.15s ease"
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "transparent",
            maxWidth: "100%",
            margin: "1px 0"
          }),
          valueContainer: (base) => ({
            ...base,
            padding: "3px 4px",
            gap: "2px",
            flexWrap: "wrap",
            overflow: "hidden"
          }),
          menu: (base) => ({
            ...base,
            borderRadius: "0.875rem",
            boxShadow: "0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            marginTop: "6px"
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#eef2ff"
              : state.isFocused
              ? "#f8fafc"
              : "#ffffff",
            color: state.isSelected ? "#312e81" : "#1e293b",
            padding: "9px 14px",
            "&:active": {
              backgroundColor: "#e0e7ff"
            }
          }),
          placeholder: (base) => ({
            ...base,
            fontSize: "0.875rem",
            color: "#94a3b8"
          }),
          input: (base) => ({
            ...base,
            fontSize: "0.875rem"
          })
        }}
      />
    </div>
  );
};

export default ReactSelectMulti;
