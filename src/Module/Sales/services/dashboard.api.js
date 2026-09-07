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
