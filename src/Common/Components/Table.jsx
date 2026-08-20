// src/components/Table.jsx
import React, { useEffect, useRef } from "react";
// import $ from "jquery";
// import "datatables.net-dt";
// import "datatables.net-dt/css/dataTables.dataTables.min.css";
// import Loader from "./Loader";

const Table = ({
  data = [],
  columnConfig = {},
  onPageChange,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  isLoading = false,
}) => {
  const tableRef = useRef();

  useEffect(() => {
    let tableInstance = null;

    const currentTable = tableRef.current;
    const timer = setTimeout(() => {
      if (currentTable && typeof $ !== "undefined" && $.fn?.DataTable) {
        if ($.fn.DataTable.isDataTable(currentTable)) {
          $(currentTable).DataTable().destroy();
        }

        tableInstance = $(tableRef.current).DataTable({
          responsive: {
            details: {
              type: "column",
              target: "tr",
            },
          },
          columnDefs: [{ className: "control", orderable: false, targets: 0 }],
          scrollX: true,
          scrollY: true,
          autoWidth: true,
          destroy: true, // Allow re-initialization
          ordering: true,
          searching: false,
          paging: false,
          info: false,
          language: {
            emptyTable: "No Records Found",
          },
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (tableInstance && typeof tableInstance.destroy === "function") {
        tableInstance.destroy();
      }
      if (currentTable && typeof $ !== "undefined" && $.fn?.DataTable && $.fn.DataTable.isDataTable(currentTable)) {
        $(currentTable).DataTable().destroy();
      }
    };
    // }, [data]);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  // if (!data.length) {
  //   return (
  //     <div className="text-center text-gray-500 text-sm py-6">
  //       No data available
  //     </div>
  //   );
  // }

  const columns = Object.keys(columnConfig);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="w-full rounded-none border border-slate-300 bg-white shadow-2xs overflow-hidden custom-table-wrapper">
      {/* 1. HORIZONTALLY SCROLLABLE TABLE CONTAINER ONLY */}
      <div className="w-full overflow-x-auto">
        <table
          ref={tableRef}
          className="min-w-max w-full text-xs sm:text-sm text-left border-collapse"
        >
          <thead>
            <tr className="bg-black text-white select-none">
              <th className="px-4 py-3 font-bold text-xs uppercase text-center w-12 border-r border-slate-800 bg-black text-white">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[10px]">▲</span>
                  <span>S. NO.</span>
                </div>
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 font-bold text-xs uppercase text-center whitespace-nowrap border-r border-slate-800 bg-black text-white"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{columnConfig[col]?.label || col}</span>
                    <span className="text-[10px] opacity-70">↕</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 bg-white">
            {data.map((row, idx) => (
              <tr
                key={row.id || idx}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-center text-slate-700 text-xs font-sans whitespace-nowrap border-r border-slate-100">
                  {startItem + idx}
                </td>
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-3 text-center whitespace-nowrap border-r border-slate-100"
                  >
                    {(() => {
                      const getValueByPath = (obj, path) =>
                        path
                          .replace(/\[(\d+)\]/g, ".$1")
                          .split(".")
                          .reduce((acc, key) => acc?.[key], obj);

                      const value = getValueByPath(row, col);
                      return columnConfig[col]?.render
                        ? columnConfig[col].render(value, row)
                        : value || "--";
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. FIXED PAGINATION FOOTER (STAYS FIXED AT BOTTOM, NOT SCROLLING) */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs sm:text-sm">
          <div className="text-slate-600 font-medium text-center sm:text-left">
            Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to <strong className="text-slate-900 font-bold">{endItem}</strong> of <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
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