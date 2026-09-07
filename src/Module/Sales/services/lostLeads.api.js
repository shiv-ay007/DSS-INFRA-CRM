import apiClient from "./axiosInstance";

// ================= LOST LEADS APIs =================
export const getLossLeadsApi = async (params = {}) => {
  try {
    const finalParams = { limit: 100, ...params };
    return await apiClient.get("/leads/loss", { params: finalParams });
  } catch (error) {
    console.error("API getLossLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getAllLossLeadsApi = async (params = {}) => {
  try {
    const finalParams = { limit: 100, ...params };
    return await apiClient.get("/loss-leads", { params: finalParams });
  } catch (error) {
    console.error("API getAllLossLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const createLossLeadApi = async (lossData) => {
  try {
    return await apiClient.post("/loss-leads", lossData);
  } catch (error) {
    console.error("API createLossLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const markLeadAsLossApi = async (leadId, lossData = {}) => {
  try {
    return await apiClient.post(`/leads/${leadId}/loss`, lossData);
  } catch (error) {
    console.error("API markLeadAsLossApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLossLeadByIdApi = async (id) => {
  try {
    return await apiClient.get(`/loss-leads/${id}`);
  } catch (error) {
    console.error("API getLossLeadByIdApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateLossLeadApi = async (id, updateData) => {
  try {
    return await apiClient.put(`/loss-leads/${id}`, updateData);
  } catch (error) {
    console.error("API updateLossLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteLossLeadApi = async (id) => {
  try {
    return await apiClient.delete(`/loss-leads/${id}`);
  } catch (error) {
    console.error("API deleteLossLeadApi error:", error);
    return { success: false, message: error.message };
  }
};
