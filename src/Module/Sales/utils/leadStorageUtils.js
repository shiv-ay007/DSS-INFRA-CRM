const STORAGE_KEYS = [
  "dss_leads",
  "dss_lead_management_sheet_v1",
  "dss_scheduled_leads_sheet",
  "dss_lost_leads",
  "dss_sales_management_sheet_v1"
];

const scheduledLeadsCache = new Map();

/**
 * Dispatches a custom window event to notify all components of lead updates.
 */
export const notifyLeadChange = (updatedLead) => {
  try {
    if (updatedLead) {
      const idKey = String(updatedLead._id || updatedLead.id || updatedLead.leadId);
      const isLost =
        updatedLead.isLoss === true ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(updatedLead.leadStatus || "").toUpperCase()) ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(updatedLead.status || "").toUpperCase());

      if (idKey && isLost) {
        scheduledLeadsCache.delete(idKey);
      } else if (idKey && (updatedLead.isFollowupScheduled || (Array.isArray(updatedLead.followupHistory) && updatedLead.followupHistory.length > 0) || Number(updatedLead.followupRemarksCount) > 0)) {
        scheduledLeadsCache.set(idKey, updatedLead);
      }
    }
    const event = new CustomEvent("dss_leads_updated", { detail: { lead: updatedLead } });
    window.dispatchEvent(event);
  } catch (err) {
    console.error("Error dispatching lead update event:", err);
  }
};

export const getScheduledLeadsFromCache = () => {
  return Array.from(scheduledLeadsCache.values());
};

/**
 * Returns empty array as lead data is now fetched directly from the backend API.
 */
export const getStoredLeads = () => {
  return [];
};

/**
 * Dispatches live in-memory update event for components without persisting to localStorage.
 * @param {Object} updatedLead - The updated lead object
 */
export const updateLeadInStorage = (updatedLead) => {
  if (!updatedLead) return;
  notifyLeadChange(updatedLead);
};

/**
 * Subscribes a callback to lead update events.
 * @param {Function} callback - Function called when leads change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLeadUpdates = (callback) => {
  const handleCustomEvent = (e) => callback(e.detail);

  window.addEventListener("dss_leads_updated", handleCustomEvent);

  return () => {
    window.removeEventListener("dss_leads_updated", handleCustomEvent);
  };
};

const SALES_TRANSFERRED_KEY = "dss_sales_transferred_lead_ids_v1";

export const getTransferredSalesLeadIds = () => {
  try {
    const raw = localStorage.getItem(SALES_TRANSFERRED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading transferred lead IDs:", e);
  }
  return [];
};

export const markLeadAsTransferredToSales = (leadId) => {
  if (!leadId) return;
  try {
    const ids = new Set(getTransferredSalesLeadIds().map(String));
    ids.add(String(leadId));
    localStorage.setItem(SALES_TRANSFERRED_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("Error saving transferred lead ID:", e);
  }
};

export const removeLeadFromSalesTransfer = (leadId) => {
  if (!leadId) return;
  try {
    const ids = new Set(getTransferredSalesLeadIds().map(String));
    ids.delete(String(leadId));
    localStorage.setItem(SALES_TRANSFERRED_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("Error removing transferred lead ID:", e);
  }
};

export const isLeadTransferredToSales = (lead) => {
  if (!lead) return false;
  if (lead.inSalesManagement === false) return false;
  if (lead.inSalesManagement === true || lead.isSalesTransferred === true) return true;
  const idStr = String(lead._id || lead.id || lead.leadId || "");
  if (!idStr) return false;
  const ids = getTransferredSalesLeadIds();
  return ids.includes(idStr);
};

