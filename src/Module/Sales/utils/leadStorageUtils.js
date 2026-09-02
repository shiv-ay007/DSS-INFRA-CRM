const STORAGE_KEYS = [
  "dss_leads",
  "dss_lead_management_sheet_v1",
  "dss_assigned_leads",
  "dss_followup_leads",
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
      if (idKey && (updatedLead.isFollowupScheduled || (Array.isArray(updatedLead.followupHistory) && updatedLead.followupHistory.length > 0) || Number(updatedLead.followupRemarksCount) > 0)) {
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

