import React, { createContext, useContext, useRef, useCallback } from "react";
import { subscribeToLeadUpdates } from "../Module/Sales/utils/leadStorageUtils";

const LeadContext = createContext(null);
const SESSION_CACHE_KEY = "dss_lead_session_cache_v1";

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
