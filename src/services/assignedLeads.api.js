import apiClient from "./axiosInstance";

// ================= ASSIGNED LEADS APIs =================
export const getAllAssignedLeadsApi = async (params = {}) => {
  try {
    const finalParams = { limit: 1000, ...params };
    return await apiClient.get("/assigned-leads", { params: finalParams });
  } catch (error) {
    console.error("API getAllAssignedLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const createAssignedLeadApi = async (assignedData) => {
  try {
    return await apiClient.post("/assigned-leads", assignedData);
  } catch (error) {
    console.error("API createAssignedLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateAssignedLeadApi = async (id, updateData) => {
  try {
    return await apiClient.put(`/assigned-leads/${id}`, updateData);
  } catch (error) {
    console.error("API updateAssignedLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteAssignedLeadApi = async (id) => {
  try {
    return await apiClient.delete(`/assigned-leads/${id}`);
  } catch (error) {
    console.error("API deleteAssignedLeadApi error:", error);
    return { success: false, message: error.message };
  }
};
