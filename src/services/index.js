// Export centralized Axios instance and headers helper
export { default as apiClient, getAuthHeaders, API_BASE_URL } from "./axiosInstance";

// Export modular page APIs
export * from "./auth.api";
export * from "./totalLeads.api";
export * from "./assignedLeads.api";
export * from "./followup.api";
export * from "./lostLeads.api";
export * from "./dashboard.api";
export * from "./upload.api";
