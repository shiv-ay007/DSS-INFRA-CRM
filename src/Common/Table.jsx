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
      if (currentTable) {
        // Destroy existing instance if it was somehow missed by cleanup
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
      if (tableInstance) {
        tableInstance.destroy();
      }
      // Double check cleanup for jQuery
      if (currentTable && $.fn.DataTable.isDataTable(currentTable)) {
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
    <div className="w-full rounded-md overflow-x-auto p-2 border border-gray-200 bg-white shadow custom-table-wrapper">
      <table
        ref={tableRef}
        className="min-w-max w-full text-sm text-left dataTable display stripe hover dataTable"
      >
        <thead>
          <tr className="bg-black text-white">
            <th className="px-3 py-2 font-semibold text-xs uppercase text-center">
              S. No.
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 font-semibold text-xs uppercase text-center"
                style={{ whiteSpace: "nowrap" }}
              >
                {columnConfig[col]?.label || col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className="border-b hover:bg-blue-50 transition-colors duration-200 "
            >
              <td className="px-3 py-2 text-center">{startItem + idx}</td>
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 text-center"
                  style={{ whiteSpace: "nowrap" }}
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

      {/* Custom Pagination */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-3 py-1 border rounded bg-gray-100">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border rounded bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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