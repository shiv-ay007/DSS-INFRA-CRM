import apiClient from "./axiosInstance";

// ================= DASHBOARD APIs =================
export const getDashboardStatsApi = async () => {
  try {
    return await apiClient.get("/dashboard/stats");
  } catch (error) {
    console.error("API getDashboardStatsApi error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Module 9 — Dashboards & Reports Summary API
 * @param {Object} params - { filterType, startDate, endDate }
 */
export const getDashboardSummaryApi = async (params = {}) => {
  try {
    const res = await apiClient.get("/dashboard/summary", { params });
    return res;
  } catch (error) {
    console.error("API getDashboardSummaryApi error:", error);
    return { success: false, message: error.message };
  }
};

