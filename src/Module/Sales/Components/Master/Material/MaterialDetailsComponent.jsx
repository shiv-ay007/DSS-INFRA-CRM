import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaBoxes,
  FaTruck,
  FaWarehouse,
  FaShieldAlt,
  FaMoneyBillWave,
  FaRulerCombined,
  FaLayerGroup,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaExternalLinkAlt,
  FaSpinner,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaTag,
  FaInfoCircle
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import materialService from "../../../services/materialService";

const MaterialDetailsComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await materialService.getMaterialById(id);
        if (res && res.data) {
          setData(res.data.data || res.data);
        } else {
          toast.error("Could not find material details");
        }
      } catch (err) {
        console.error("Error fetching material details:", err);
        toast.error("Failed to load material details from server");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200 p-8 shadow-xs font-sans">
        <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-600 text-sm font-medium">
          Loading material complete profile...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs font-sans">
        <FaTimesCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Material Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested material could not be found or may have been removed.
        </p>
        <button
          onClick={() => navigate("/sales/master/material")}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Return to Material Directory
        </button>
      </div>
    );
  }

  const name = data.name || data.materialName || "Untitled Material";
  const code = data.code || data.materialCode || "—";
  const status = data.status || "Active";
  const isActive = status === "Active" || status === "In Stock";
  const isLowStock = status === "Low Stock";

  const editRoute = `/sales/master/material/edit-material/${id}`;

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* ================= TOP HEADER BANNER (MATCHING SUPPLIER DETAILS) ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-xl px-4 py-3 shadow-md border border-teal-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/sales/master/material")}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
                title="Back to Directory"
              >
                <FaArrowLeft className="w-4 h-4" />
              </button>

              <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                <FaBoxes className="w-5 h-5 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                    {name}
                  </h1>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-white/15 text-emerald-200 border border-white/20">
                    {code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : isLowStock
                        ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? "bg-emerald-400"
                          : isLowStock
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                    />
                    {status}
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/90 mt-0.5">
                  {data.category || data.materialCategory || "Material"}
                  {data.subCategory ? ` • ${data.subCategory}` : ""}
                  {data.materialType ? ` • Type: ${data.materialType}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(editRoute)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <FaEdit className="w-3.5 h-3.5" />
                <span>Edit Material</span>
              </button>
              <button
                onClick={() => navigate("/sales/master/material")}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all text-xs cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID (3-COLUMN EXACT SUPPLIER STRUCTURE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Classification, Preferred Supplier & Storage */}
        <div className="space-y-4">
          {/* Card 1: General Classification */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaLayerGroup className="text-emerald-600" />
              <span>Classification & Spec</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <span className="font-bold text-slate-800 text-sm">
                  {data.category || data.materialCategory || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sub-Category</span>
                <span className="font-semibold text-slate-800">
                  {data.subCategory || data.materialSubCategory || "—"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Material Type</span>
                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {data.materialType || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Brand / Make</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {data.brand || data.brandMake || "Generic"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Specification / Grade</span>
                <span className="font-semibold text-slate-800">
                  {data.specificationGrade || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Standard / Specification Code</span>
                <span className="font-mono text-slate-800 font-medium">
                  {data.standardSpecCode || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Preferred Supplier */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaTruck className="text-indigo-600" />
              <span>Preferred Supplier Info</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Name</span>
                <span className="font-bold text-slate-900 text-sm">
                  {data.preferredSupplierId?.name || data.preferredSupplier || "—"}
                </span>
              </div>
              {data.preferredSupplierId?.code && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Code</span>
                  <span className="font-mono font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {data.preferredSupplierId.code}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Type</span>
                  <span className="font-semibold text-slate-700">
                    {data.supplierType || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supplier Part Code</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {data.supplierPartCode || "—"}
                  </span>
                </div>
              </div>
              {data.preferredSupplierId?.phone && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-semibold text-emerald-700">
                    {data.preferredSupplierId.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Storage & Handling */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaWarehouse className="text-amber-600" />
              <span>Storage & Quality Handling</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Requirement</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {data.storageRequirement || "Standard Warehouse"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Quality Inspection</span>
                  <span
                    className={`font-bold inline-block mt-0.5 ${
                      data.inspectionRequired ? "text-amber-700" : "text-slate-600"
                    }`}
                  >
                    {data.inspectionRequired ? "Yes (Mandatory)" : "Not Required"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Time</span>
                  <span className="font-bold text-slate-800 inline-block mt-0.5">
                    {data.leadTimeDays ? `${data.leadTimeDays} Days` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 2 COLUMNS: Units, Pricing, Description & Cloudinary Documents */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 4: Measurement Units & Inventory */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaRulerCombined className="text-blue-600" />
              <span>Measurement Units & Inventory Parameters</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Base UOM</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {data.baseUom || data.uom || "Unit"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchase UOM</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {data.purchaseUom || data.baseUom || data.uom || "—"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Conversion Factor</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {data.conversionFactor || 1}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reorder / MOQ</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {data.moq || data.reorderLevel || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Card 5: Pricing, Valuation & Taxation */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaMoneyBillWave className="text-emerald-600" />
              <span>Pricing & Taxation Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60">
                <span className="text-emerald-800 block text-[10px] uppercase font-bold">
                  Standard Base Rate
                </span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  ₹ {Number(data.standardPurchaseRate || data.unitRate || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">
                  Per {data.baseUom || data.uom || "Unit"}
                </span>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60">
                <span className="text-amber-800 block text-[10px] uppercase font-bold">
                  Applicable GST Rate
                </span>
                <span className="text-lg font-black text-amber-900 mt-1 block">
                  {data.taxGstRate !== undefined && data.taxGstRate !== "" ? `${data.taxGstRate}%` : "0%"}
                </span>
                <span className="text-[10px] text-amber-700 mt-0.5 block">
                  Standard Tax Slab
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">
                  HSN / SAC Code
                </span>
                <span className="text-sm font-mono font-bold text-slate-800 mt-1 block">
                  {data.hsnSacCode || "Not Assigned"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Harmonized Tariff
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Material Description & Remarks */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaInfoCircle className="text-slate-600" />
              <span>Material Details & Scope Description</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Technical Details / PMS Requirement Description
                </span>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {data.materialDetails || "No detailed technical description specified for this material master entry."}
                </div>
              </div>

              {data.remarks && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                    Internal Remarks & Notes
                  </span>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 text-slate-700 leading-relaxed">
                    {data.remarks}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 7: Attached Specification Sheets & Cloudinary Media */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaFileAlt className="text-purple-600" />
              <span>
                Attached Documents & Specification Sheets ({data.documents?.length || 0})
              </span>
            </h3>

            {data.documents && data.documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 text-emerald-600">
                        {doc.type === "pdf" ? (
                          <FaFilePdf className="w-5 h-5 text-red-500" />
                        ) : (
                          <FaFileImage className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                          {doc.name || `Document ${idx + 1}`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {doc.size || doc.type?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <FaExternalLinkAlt className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No specification sheets or media attached to this material.
              </div>
            )}
          </div>

          {/* Card 8: Audit Information */}
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
            <span>
              Database ID: <span className="font-mono text-slate-700 font-bold">{data._id || id}</span>
            </span>
            <span>
              Created: {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
            <span>
              Last Modified: {data.updatedAt ? new Date(data.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailsComponent;
