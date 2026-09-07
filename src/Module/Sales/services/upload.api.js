import apiClient from "./axiosInstance";

// ================= UPLOAD APIs =================
export const uploadMediaFileApi = async (file, leadId = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (leadId) formData.append("leadId", leadId);

    return await apiClient.post("/uploads", formData);
  } catch (error) {
    console.error("API uploadMediaFileApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadMediaApi = async (leadId) => {
  try {
    return await apiClient.get(`/uploads/lead/${leadId}`);
  } catch (error) {
    console.error("API getLeadMediaApi error:", error);
    return { success: false, message: error.message };
  }
};
