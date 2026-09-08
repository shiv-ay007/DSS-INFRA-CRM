import React, { createContext, useContext, useRef, useCallback } from "react";

const LeadContext = createContext(null);
const SESSION_CACHE_KEY = "dss_lead_session_cache_v4";
const SALES_TRANSFERRED_KEY = "dss_sales_transferred_lead_ids_v1";

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

/**
 * Subscribes a callback to lead update events.
 */
export const subscribeToLeadUpdates = (callback) => {
  const handleCustomEvent = (e) => callback(e.detail);
  window.addEventListener("dss_leads_updated", handleCustomEvent);
  return () => {
    window.removeEventListener("dss_leads_updated", handleCustomEvent);
  };
};

/**
 * Safe in-memory notify helper
 */
export const updateLeadInStorage = (updatedLead) => {
  if (!updatedLead) return;
  notifyLeadChange(updatedLead);
};

export const getStoredLeads = () => [];

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

// Clear any legacy sessionStorage cache if present
try {
  sessionStorage.removeItem("dss_lead_session_cache_v4");
  sessionStorage.removeItem("dss_lead_session_cache_v2");
  sessionStorage.removeItem(SESSION_CACHE_KEY);
} catch (e) {}

export const LeadProvider = ({ children }) => {
  // Pure in-memory cache only (No sessionStorage)
  const cacheRef = useRef(new Map());

  /**
   * Retrieves data from in-memory cache if it exists.
   */
  const getCachedData = useCallback((key) => {
    if (!cacheRef.current.has(key)) return null;
    return cacheRef.current.get(key);
  }, []);

  /**
   * Saves data and pagination into in-memory cache only.
   */
  const setCachedData = useCallback((key, data, pagination = null) => {
    cacheRef.current.set(key, {
      data,
      pagination,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Invalidates cache by prefix or clears all cache.
   */
  const invalidateCache = useCallback((prefix = "") => {
    if (!prefix) {
      cacheRef.current.clear();
      return;
    }
    for (const key of cacheRef.current.keys()) {
      if (key.startsWith(prefix)) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  /**
   * Invalidate all lead-related in-memory caches.
   */
  const invalidateAllLeadCaches = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Subscribe to live lead mutations across components
  React.useEffect(() => {
    const unsubscribe = subscribeToLeadUpdates(() => {
      invalidateAllLeadCaches();
    });
    return () => unsubscribe();
  }, [invalidateAllLeadCaches]);

  return (
    <LeadContext.Provider
      value={{
        getCachedData,
        setCachedData,
        invalidateCache,
        invalidateAllLeadCaches
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = () => {
  const context = useContext(LeadContext);
  if (!context) {
    return {
      getCachedData: () => null,
      setCachedData: () => {},
      invalidateCache: () => {},
      invalidateAllLeadCaches: () => {}
    };
  }
  return context;
};

export default LeadContext;
