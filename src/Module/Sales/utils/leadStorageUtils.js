import { initialTotalLeads } from "../data/totalLeadsData";
import { initialLeadsData } from "../data/leadManagementData";
import { initialAssignedLeads } from "../data/assignedLeadsData";
import { initialScheduledLeads } from "../data/followUpData";
import { initialLostLeads } from "../data/lostLeadsData";
import { initialSalesData } from "../data/salesManagementData";

const STORAGE_KEYS = [
  "dss_leads",
  "dss_lead_management_sheet_v1",
  "dss_assigned_leads",
  "dss_followup_leads",
  "dss_scheduled_leads_sheet",
  "dss_lost_leads",
  "dss_sales_management_sheet_v1"
];

const INITIAL_DATA_MAP = {
  dss_leads: [],
  dss_lead_management_sheet_v1: [],
  dss_assigned_leads: [],
  dss_followup_leads: [],
  dss_scheduled_leads_sheet: [],
  dss_lost_leads: [],
  dss_sales_management_sheet_v1: []
};

const cleanDigits = (str) => (str ? String(str).replace(/\D/g, "") : "");
const cleanStr = (str) => (str ? String(str).trim().toLowerCase() : "");

/**
 * Dispatches a custom window event to notify all components of lead updates.
 */
export const notifyLeadChange = (updatedLead) => {
  try {
    const event = new CustomEvent("dss_leads_updated", { detail: { lead: updatedLead } });
    window.dispatchEvent(event);
  } catch (err) {
    console.error("Error dispatching lead update event:", err);
  }
};

const sanitizeLeadForStorage = (item, key) => {
  if (!item) return item;

  let cleaned = { ...item };

  // Remove "(Current User)" text from any field
  ["assignTo", "salesPerson", "assignedTo", "leadBy"].forEach((f) => {
    if (typeof cleaned[f] === "string") {
      cleaned[f] = cleaned[f].replace(" (Current User)", "").replace("(Current User)", "").trim();
    }
  });

  // For total leads list (dss_leads), if lead was NOT explicitly assigned, mark unassigned!
  if (key === "dss_leads") {
    const explicitAssignees = ["Sales TL", "Self", "Rahul Sharma", "Pooja Verma", "Vikram Malhotra", "Ankit Patel", "Sanjay Gupta", "Neha Verma"];
    const isExplicit =
      cleaned.isAssigned === true &&
      (cleaned.assignedDate || cleaned.assignedType || explicitAssignees.includes(cleaned.assignTo) || explicitAssignees.includes(cleaned.salesPerson));

    if (!isExplicit) {
      cleaned.isAssigned = false;
      cleaned.assignTo = "";
      cleaned.salesPerson = "";
      cleaned.assignedTo = "";
    }
  }

  return cleaned;
};

/**
 * Safely gets stored leads for a given key, seeding with initial dataset if missing.
 */
export const getStoredLeads = (key) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let sanitized = parsed.map((item) => sanitizeLeadForStorage(item, key));
        // Ensure Sales Management Sheet & Lead Management Sheet ONLY contain INTERESTED / initial seed leads
        if (key === "dss_sales_management_sheet_v1") {
          sanitized = sanitized.filter(
            (item) => item.status === "INTERESTED" || item.isInterested === true || String(item.clientId || "").startsWith("DSS260")
          );
        }
        if (key === "dss_lead_management_sheet_v1") {
          sanitized = sanitized.filter(
            (item) => item.status === "INTERESTED" || item.isInterested === true || String(item.id || "").startsWith("LM-00")
          );
        }
        if (key === "dss_followup_leads" || key === "dss_scheduled_leads_sheet") {
          sanitized = sanitized.filter((item) => {
            const hasHistory = Array.isArray(item.followupHistory) && item.followupHistory.length > 0;
            const isExplicitlyScheduled =
              item.isFollowupScheduled === true ||
              (item.nextFollowupDateRaw && item.nextFollowupDate && item.nextFollowupDate !== "--" && item.nextFollowupDate !== "Completed");
            const isInitialSeed = String(item.id || "").startsWith("LD-SCH-0");
            return hasHistory || isExplicitlyScheduled || isInitialSeed;
          });
        }
        // Filter out old static seed items if present
        sanitized = sanitized.filter((item) => {
          const idStr = String(item.id || item.leadId || item.clientId || "");
          const isSeedId = idStr.startsWith("LM-00") || idStr.startsWith("LD-SCH-0") || idStr.startsWith("DSS260") || idStr.startsWith("LD-10");
          return !isSeedId;
        });

        try {
          localStorage.setItem(key, JSON.stringify(sanitized));
        } catch (e) {}
        return sanitized;
      }
    }
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return [];
};

/**
 * Updates a lead in all localStorage datasets where it exists (or inserts it into primary datasets).
 * @param {Object} updatedLead - The updated lead object
 */
export const updateLeadInStorage = (updatedLead) => {
  if (!updatedLead) return;

  const targetId = updatedLead.id ? String(updatedLead.id) : "";
  const targetPhone = cleanDigits(updatedLead.phoneNumber || updatedLead.contact || updatedLead.whatsappNumber);
  const targetName = cleanStr(updatedLead.clientName || updatedLead.concernPersonName);

  const isMarkedInterested =
    updatedLead.isInterested === true ||
    updatedLead.status === "INTERESTED" ||
    updatedLead.clientStatus === "INTERESTED";

  const isMarkedLost =
    updatedLead.status === "NOT INTERESTED" ||
    updatedLead.isInterested === false ||
    updatedLead.clientStatus === "NOT INTERESTED" ||
    !!updatedLead.lostReason;

  const hasFollowupScheduled =
    updatedLead.isFollowupScheduled === true ||
    (Array.isArray(updatedLead.followupHistory) && updatedLead.followupHistory.length > 0) ||
    (updatedLead.nextFollowupDateRaw && updatedLead.nextFollowupDate && updatedLead.nextFollowupDate !== "--" && updatedLead.nextFollowupDate !== "Completed");

  STORAGE_KEYS.forEach((key) => {
    try {
      let list = getStoredLeads(key);
      if (!Array.isArray(list)) list = [];

      let updatedIndex = -1;

      // 1. Try matching by ID
      if (targetId) {
        updatedIndex = list.findIndex((item) => String(item.id) === targetId);
      }

      // 2. Try matching by phone number if not found
      if (updatedIndex === -1 && targetPhone.length >= 7) {
        updatedIndex = list.findIndex((item) => {
          const itemPhone = cleanDigits(item.phoneNumber || item.contact || item.whatsappNumber);
          return itemPhone && (itemPhone === targetPhone || itemPhone.endsWith(targetPhone) || targetPhone.endsWith(itemPhone));
        });
      }

      // 3. Try matching by client name if not found
      if (updatedIndex === -1 && targetName.length >= 3) {
        updatedIndex = list.findIndex((item) => {
          const itemName = cleanStr(item.clientName || item.concernPersonName);
          return itemName && itemName === targetName;
        });
      }

      if (key === "dss_sales_management_sheet_v1" || key === "dss_lead_management_sheet_v1") {
        if (isMarkedLost) {
          if (updatedIndex !== -1) {
            list.splice(updatedIndex, 1);
          }
        } else if (isMarkedInterested) {
          if (updatedIndex !== -1) {
            list[updatedIndex] = { ...list[updatedIndex], ...updatedLead };
          } else {
            list.unshift(updatedLead);
          }
        } else if (updatedIndex !== -1) {
          list[updatedIndex] = { ...list[updatedIndex], ...updatedLead };
        }
      } else if (key === "dss_followup_leads" || key === "dss_scheduled_leads_sheet") {
        if (isMarkedLost) {
          if (updatedIndex !== -1) {
            list.splice(updatedIndex, 1);
          }
        } else if (hasFollowupScheduled) {
          if (updatedIndex !== -1) {
            list[updatedIndex] = { ...list[updatedIndex], ...updatedLead };
          } else {
            list.unshift(updatedLead);
          }
        } else if (updatedIndex !== -1) {
          list.splice(updatedIndex, 1);
        }
      } else if (key === "dss_lost_leads") {
        if (isMarkedInterested) {
          if (updatedIndex !== -1) {
            list.splice(updatedIndex, 1);
          }
        } else if (isMarkedLost) {
          if (updatedIndex !== -1) {
            list[updatedIndex] = { ...list[updatedIndex], ...updatedLead };
          } else {
            list.unshift(updatedLead);
          }
        } else if (updatedIndex !== -1) {
          list[updatedIndex] = { ...list[updatedIndex], ...updatedLead };
        }
      } else {
        if (updatedIndex !== -1) {
          list[updatedIndex] = {
            ...list[updatedIndex],
            ...updatedLead,
            id: list[updatedIndex].id || updatedLead.id
          };
        } else {
          list.unshift(updatedLead);
        }
      }

      const sanitizedList = list.map((item) => sanitizeLeadForStorage(item, key));
      localStorage.setItem(key, JSON.stringify(sanitizedList));
    } catch (err) {
      console.error(`Error updating lead in localStorage key ${key}:`, err);
    }
  });

  notifyLeadChange(updatedLead);
};

/**
 * Subscribes a callback to lead update events (both custom window events and browser storage events).
 * @param {Function} callback - Function called when leads change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLeadUpdates = (callback) => {
  const handleCustomEvent = (e) => callback(e.detail);
  const handleStorageEvent = (e) => {
    if (STORAGE_KEYS.includes(e.key)) {
      callback();
    }
  };

  window.addEventListener("dss_leads_updated", handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener("dss_leads_updated", handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
};
