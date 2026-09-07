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

// Helper to load session cache on initial mount
const loadSessionCache = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return new Map(Object.entries(parsed));
    }
  } catch (e) {
    console.warn("Error loading lead session cache:", e);
  }
  return new Map();
};

// Helper to persist session cache
const saveSessionCache = (cacheMap) => {
  try {
    const obj = {};
    for (const [k, v] of cacheMap.entries()) {
      obj[k] = v;
    }
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(obj));
  } catch (e) {
    // Quota exceeded or disabled
  }
};

export const LeadProvider = ({ children }) => {
  // In-memory cache backed by sessionStorage for 0ms initial render even on F5 reload
  const cacheRef = useRef(loadSessionCache());

  /**
   * Retrieves data from cache if it exists (Unlimited cache - no auto-expiry).
   * Data remains instant until manually refreshed or updated.
   */
  const getCachedData = useCallback((key) => {
    if (!cacheRef.current.has(key)) return null;
    return cacheRef.current.get(key);
  }, []);

  /**
   * Saves data and pagination into memory and session cache.
   */
  const setCachedData = useCallback((key, data, pagination = null) => {
    cacheRef.current.set(key, {
      data,
      pagination,
      timestamp: Date.now()
    });
    saveSessionCache(cacheRef.current);
  }, []);

  /**
   * Invalidates cache by prefix or clears all cache.
   * e.g., invalidateCache("totalLeads") clears all totalLeads_* queries.
   */
  const invalidateCache = useCallback((prefix = "") => {
    if (!prefix) {
      cacheRef.current.clear();
      try {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
      } catch {}
      return;
    }
    for (const key of cacheRef.current.keys()) {
      if (key.startsWith(prefix)) {
        cacheRef.current.delete(key);
      }
    }
    saveSessionCache(cacheRef.current);
  }, []);

  /**
   * Invalidate all lead-related caches on any global lead mutation.
   */
  const invalidateAllLeadCaches = useCallback(() => {
    cacheRef.current.clear();
    try {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch {}
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
