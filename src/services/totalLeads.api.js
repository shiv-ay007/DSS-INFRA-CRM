import apiClient from "./axiosInstance";

// ================= TOTAL LEADS / LEAD MANAGEMENT APIs =================
export const getAllLeadsApi = async (params = {}) => {
  try {
    const finalParams = { page: 1, limit: 10, ...params };
    return await apiClient.get("/leads", { params: finalParams });
  } catch (error) {
    console.error("API getAllLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const createLeadApi = async (leadData) => {
  try {
    return await apiClient.post("/leads", leadData);
  } catch (error) {
    console.error("API createLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadByIdApi = async (leadId) => {
  try {
    return await apiClient.get(`/leads/${leadId}`);
  } catch (error) {
    console.error("API getLeadByIdApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateLeadApi = async (leadId, updateData) => {
  try {
    return await apiClient.put(`/leads/${leadId}`, updateData);
  } catch (error) {
    console.error("API updateLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateLeadStatusApi = async (leadId, status) => {
  try {
    return await apiClient.patch(`/leads/${leadId}/status`, { status });
  } catch (error) {
    console.error("API updateLeadStatusApi error:", error);
    return { success: false, message: error.message };
  }
};

export const assignLeadApi = async (leadId, assignData) => {
  try {
    return await apiClient.patch(`/leads/${leadId}/assign`, assignData);
  } catch (error) {
    console.error("API assignLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteLeadApi = async (leadId) => {
  try {
    return await apiClient.delete(`/leads/${leadId}`);
  } catch (error) {
    console.error("API deleteLeadApi error:", error);
    return { success: false, message: error.message };
  }
};
