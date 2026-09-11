import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTruck,
  FaHardHat,
  FaBuilding,
  FaCreditCard,
  FaTools,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaIdCard
} from "react-icons/fa";
import { HiSparkles, HiShieldCheck } from "react-icons/hi2";
import { supplierService } from "../../../services/supplierService";
import { contractorService } from "../../../services/contractorService";

const SupplierContractorDetailsComponent = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();

  const isSupplier = type?.toLowerCase() === "supplier";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        let res;
        if (isSupplier) {
          res = await supplierService.getSupplierById(id);
        } else {
          res = await contractorService.getContractorById(id);
        }

        if (res && res.success && res.data) {
          setData(res.data.supplier || res.data.contractor || res.data);
        } else {
          toast.error(`Could not find ${isSupplier ? "supplier" : "contractor"} details`);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        toast.error("Failed to load details from server");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isSupplier]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
        <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-600 text-sm font-medium">
          Loading {isSupplier ? "supplier" : "contractor"} complete profile...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs">
        <FaTimesCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Record Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested {isSupplier ? "supplier" : "contractor"} could not be found or may have been deleted.
        </p>
        <button
          onClick={() => navigate("/sales/master/suplire-and-contractor")}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const editRoute = isSupplier
    ? `/sales/master/suplire-and-contractor/edit-supplier/${id}`
    : `/sales/master/suplire-and-contractor/edit-contractor/${id}`;

  const isActive = data.status === "Active";
  const isBlocked = data.status === "Blocked";

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* ================= TOP HEADER BANNER ================= */}
      <div
        className={`sticky top-0 z-40 text-white rounded-xl px-4 py-3 shadow-md border overflow-hidden ${
          isSupplier
            ? "bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-teal-700/50"
            : "bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border-indigo-700/50"
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Back to Directory"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <div
              className={`p-2.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 ${
                isSupplier
                  ? "bg-gradient-to-br from-emerald-400 to-teal-600"
                  : "bg-gradient-to-br from-blue-400 to-indigo-600"
              }`}
            >
              {isSupplier ? <FaTruck className="w-5 h-5 text-white" /> : <FaHardHat className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white leading-tight">
                  {data.name}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-white/15 text-emerald-200 border border-white/20">
                  {data.code}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : isBlocked
                      ? "bg-red-500/20 text-red-300 border border-red-400/30"
                      : "bg-slate-500/20 text-slate-300 border border-slate-400/30"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-emerald-400" : isBlocked ? "bg-red-400" : "bg-slate-400"
                    }`}
                  />
                  {data.status || "Active"}
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 mt-0.5">
                {isSupplier ? `Supplier Type: ${data.supplierType || "Standard"}` : `Contractor Type: ${data.contractorType || "General"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(editRoute)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <FaEdit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all text-xs cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Contact + Address */}
        <div className="space-y-4">
          {/* Card 1: Contact Information */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaPhoneAlt className="text-emerald-600" />
              <span>Primary Contact Details</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Person</span>
                <span className="font-bold text-slate-800 text-sm">{data.contactPerson || "—"}</span>
                {data.designation && (
                  <span className="text-slate-500 text-[11px] block mt-0.5 font-medium">
                    {data.designation}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Phone</span>
                {data.phone ? (
                  <a
                    href={`tel:${data.phone}`}
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 mt-0.5"
                  >
                    <FaPhoneAlt className="w-3 h-3 text-emerald-600" />
                    <span>{data.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>

              {data.whatsappNo && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp Number</span>
                  <a
                    href={`https://wa.me/${data.whatsappNo.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 mt-0.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{data.whatsappNo}</span>
                  </a>
                </div>
              )}

              {data.alternatePhone && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Alternate Phone</span>
                  <a
                    href={`tel:${data.alternatePhone}`}
                    className="font-semibold text-slate-700 hover:text-slate-900 mt-0.5 block"
                  >
                    {data.alternatePhone}
                  </a>
                </div>
              )}

              {data.email && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                  <a
                    href={`mailto:${data.email}`}
                    className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 mt-0.5 truncate"
                  >
                    <FaEnvelope className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{data.email}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Address & Location */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FaMapMarkerAlt className="text-rose-600" />
              <span>Registered Location</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Address</span>
                <p className="font-semibold text-slate-800 mt-0.5 leading-relaxed">
                  {data.address || "—"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">City</span>
                  <span className="font-semibold text-slate-800">{data.city || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">State</span>
                  <span className="font-semibold text-slate-800">{data.state || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pincode</span>
                  <span className="font-mono font-semibold text-slate-800">{data.pincode || "—"}</span>
                </div>
                {isSupplier && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Lead Time</span>
                    <span className="font-semibold text-slate-800">
                      {data.deliveryLeadTime ? `${data.deliveryLeadTime} Days` : "—"}
                    </span>
                  </div>
                )}
                {!isSupplier && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Availability</span>
                    <span className="font-semibold text-slate-800">{data.availability || "Available"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE & RIGHT COLUMN: Tax, Banking, Execution, Materials */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card 3: Tax & Commercial Information */}
          {isSupplier ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <FaIdCard className="text-indigo-600" />
                <span>Tax & Commercial Profile</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                    {data.gstin || "Not Registered"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                    {data.pan || "—"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">MSME / Udyam No.</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                    {data.msmeNo || "—"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Credit Limit</span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 block">
                    {data.creditLimit ? `₹ ${Number(data.creditLimit).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="sm:col-span-2 lg:col-span-4 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/70">
                  <span className="text-amber-800 block text-[10px] uppercase font-bold">Agreed Payment Terms</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                    {data.paymentTerms || "Immediate Cash / RTGS Advance"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <FaTools className="text-amber-600" />
                <span>Execution & Work Scope</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Work Will Done By</span>
                  <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                    {data.workWillDoneBy || "LABOUR"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rate / Commercial Terms</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                    {data.commercialTerms || "As per Quotation"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Bank Account Details (Mainly for Supplier) */}
          {isSupplier && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <FaCreditCard className="text-emerald-600" />
                <span>Bank Account Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{data.bankName || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Number</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                    {data.accountNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Holder</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {data.accountHolderName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">IFSC Code</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                    {data.ifsc || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 5: Materials / Work Categories Tag List */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              {isSupplier ? <FaTruck className="text-emerald-600" /> : <FaHardHat className="text-blue-600" />}
              <span>
                {isSupplier ? "Materials & Products Supplied" : "Work Categories & Tasks"}
              </span>
            </h3>

            {isSupplier ? (
              <div className="space-y-3">
                {data.materialsSupplied && data.materialsSupplied.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.materialsSupplied.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold px-3 py-1 rounded-lg"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No specific materials listed.</p>
                )}

                {data.supplierCategories && data.supplierCategories.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">
                      Supplier Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.supplierCategories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium px-2.5 py-0.5 rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {data.workCategories && data.workCategories.length > 0 ? (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">
                      Work Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {data.workCategories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-lg"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No work categories specified.</p>
                )}

                {data.supportedTasks && data.supportedTasks.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">
                      Supported Tasks
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.supportedTasks.map((task, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium px-2 py-0.5 rounded"
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.toolsVehicles && data.toolsVehicles.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1.5">
                      Tools & Vehicles Available
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {data.toolsVehicles.map((tool, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold px-2 py-0.5 rounded"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 6: Remarks & Notes */}
          {data.remarks && (
            <div className="bg-amber-50/40 rounded-xl shadow-xs border border-amber-200/80 p-4">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                Internal Remarks & Notes
              </h3>
              <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                {data.remarks}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierContractorDetailsComponent;
