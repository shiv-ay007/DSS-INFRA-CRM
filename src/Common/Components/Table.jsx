import React from "react";

const Table = ({
  data = [],
  columnConfig = {},
  onPageChange,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  isLoading = false,
  showSrNo = false,
}) => {
  if (isLoading) {
    return (
      <div className="text-center text-slate-500 text-sm py-8 font-medium">
        Loading table data...
      </div>
    );
  }

  const columns = Object.keys(columnConfig);
  const totalPages = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full bg-white overflow-hidden custom-table-wrapper">
      {/* 1. HORIZONTALLY SCROLLABLE TABLE CONTAINER */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
              {showSrNo && (
                <th className="py-2.5 px-2.5 text-center w-10 font-bold uppercase bg-black text-white border-r border-slate-800">
                  S. NO.
                </th>
              )}
              {columns.map((col) => {
                const config = columnConfig[col];
                const alignClass =
                  config?.align === "left"
                    ? "text-left"
                    : config?.align === "right"
                    ? "text-right"
                    : "text-center";

                return (
                  <th
                    key={col}
                    className={`py-2.5 px-2.5 font-bold uppercase whitespace-nowrap bg-black text-white border-r border-slate-800 text-xs ${alignClass} ${
                      config?.headerClass || ""
                    }`}
                  >
                    {config?.label || col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs bg-white">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={(showSrNo ? 1 : 0) + columns.length}
                  className="px-3 py-6 text-center text-slate-500 text-sm font-medium"
                >
                  No Records Found
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {showSrNo && (
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-700 text-xs whitespace-nowrap border-r border-slate-100">
                      {startItem > 0 ? startItem + idx : idx + 1}
                    </td>
                  )}
                  {columns.map((col) => {
                    const config = columnConfig[col];
                    const alignClass =
                      config?.align === "left"
                        ? "text-left"
                        : config?.align === "right"
                        ? "text-right"
                        : "text-center";

                    return (
                      <td
                        key={col}
                        className={`py-2 px-2.5 whitespace-nowrap border-r border-slate-100 ${alignClass} ${
                          config?.cellClass || ""
                        }`}
                      >
                        {(() => {
                          const getValueByPath = (obj, path) =>
                            path
                              .replace(/\[(\d+)\]/g, ".$1")
                              .split(".")
                              .reduce((acc, key) => acc?.[key], obj);

                          const value = getValueByPath(row, col);
                          return config?.render
                            ? config.render(value, row, idx)
                            : value ?? "--";
                        })()}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2. FIXED PAGINATION FOOTER */}
      {totalItems > 0 && onPageChange && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs sm:text-sm">
          <div className="text-slate-600 font-medium text-center sm:text-left">
            Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to{" "}
            <strong className="text-slate-900 font-bold">{endItem}</strong> of{" "}
            <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-mono font-bold text-xs sm:text-sm text-slate-800 shadow-2xs">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;