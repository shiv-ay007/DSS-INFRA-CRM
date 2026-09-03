import React, { createContext, useContext, useRef, useCallback } from "react";
import { subscribeToLeadUpdates } from "../Module/Sales/utils/leadStorageUtils";

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  // In-memory cache store: Map of cacheKey -> { data, pagination, timestamp }
  const cacheRef = useRef(new Map());

  /**
   * Retrieves data from cache if it exists (Unlimited cache - no auto-expiry).
   * Data remains instant until manually refreshed or updated.
   */
  const getCachedData = useCallback((key) => {
    if (!cacheRef.current.has(key)) return null;
    return cacheRef.current.get(key);
  }, []);

  /**
   * Saves data and pagination into cache.
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
   * e.g., invalidateCache("totalLeads") clears all totalLeads_* queries.
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
   * Invalidate all lead-related caches on any global lead mutation.
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
    // Graceful fallback if used outside provider
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
