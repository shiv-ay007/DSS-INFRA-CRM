import apiClient from "./axiosInstance";

// ================= FOLLOW-UP APIs =================
export const getFollowupLeadsApi = async (params = {}) => {
  try {
    const finalParams = { page: 1, limit: 10, ...params };
    return await apiClient.get("/leads/followup-leads", { params: finalParams });
  } catch (error) {
    console.error("API getFollowupLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getAllFollowupsApi = async (params = {}) => {
  try {
    const finalParams = { limit: 100, ...params };
    return await apiClient.get("/followups", { params: finalParams });
  } catch (error) {
    console.error("API getAllFollowupsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const addFollowupApi = async (followupData) => {
  try {
    return await apiClient.post("/followups", followupData);
  } catch (error) {
    console.error("API addFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

export const addLeadFollowupApi = async (leadId, followupData, attachments = {}) => {
  try {
    const hasFiles =
      (attachments?.current && attachments.current.some(item => (item instanceof File || item instanceof Blob || item?.file || item?.blob))) ||
      (attachments?.next && attachments.next.some(item => (item instanceof File || item instanceof Blob || item?.file || item?.blob))) ||
      (attachments?.remarks && attachments.remarks.some(item => (item instanceof File || item instanceof Blob || item?.file || item?.blob)));

    if (hasFiles) {
      const formData = new FormData();
      formData.append("data", JSON.stringify(followupData));

      (attachments?.current || []).forEach((item) => {
        const raw = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
        if (raw instanceof File || raw instanceof Blob) {
          const fileName = item?.name || raw.name || `audio-${Date.now()}.wav`;
          formData.append("currentFiles", raw, fileName);
        }
      });

      (attachments?.next || []).forEach((item) => {
        const raw = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
        if (raw instanceof File || raw instanceof Blob) {
          const fileName = item?.name || raw.name || `audio-${Date.now()}.wav`;
          formData.append("nextFiles", raw, fileName);
        }
      });

      (attachments?.remarks || []).forEach((item) => {
        const raw = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
        if (raw instanceof File || raw instanceof Blob) {
          const fileName = item?.name || raw.name || `audio-${Date.now()}.wav`;
          formData.append("remarkFiles", raw, fileName);
        }
      });

      return await apiClient.post(`/leads/${leadId}/followups`, formData);
    }

    return await apiClient.post(`/leads/${leadId}/followups`, followupData);
  } catch (error) {
    console.error("API addLeadFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadFollowupsApi = async (leadId) => {
  try {
    return await apiClient.get(`/followups/lead/${leadId}`);
  } catch (error) {
    console.error("API getLeadFollowupsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateFollowupApi = async (followupId, followupData) => {
  try {
    return await apiClient.put(`/followups/${followupId}`, followupData);
  } catch (error) {
    console.error("API updateFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteFollowupApi = async (followupId) => {
  try {
    return await apiClient.delete(`/followups/${followupId}`);
  } catch (error) {
    console.error("API deleteFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};
