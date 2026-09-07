import api from "./axiosInstance"

/**
 * Helper: Agar remarks files (Image/Audio/PDF/Video) ho toh FormData banata hai
 */
const buildFormData = (data, files = []) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "remarkAttachments" || key === "attachments") {
        return; // Exclude client-side preview objects from payload
      }
      if (Array.isArray(value) || (typeof value === "object" && !(value instanceof File))) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  // Ensure remarks text is explicitly mapped
  if (!formData.has("remarks") && data.remark) {
    formData.append("remarks", data.remark);
  }

  // Append all files under remarksFiles
  const fileList = Array.isArray(files) ? files : files ? [files] : [];
  fileList.forEach((item) => {
    const rawFile = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
    if (rawFile instanceof File || rawFile instanceof Blob) {
      const fileName = item?.name || rawFile.name || `file-${Date.now()}`;
      formData.append("remarksFiles", rawFile, fileName);
    }
  });

  return formData;
};

// ========================================================
// 1. CREATE LEAD API (Used in AddLead.jsx)
// ========================================================
export const createLeadApi = async (leadData, files = null) => {
  try {
    let payload = leadData;

    // Check if files passed explicitly or present inside leadData
    const candidateFiles = files || leadData?.remarkAttachments || leadData?.attachments || leadData?.remarksFiles || leadData?.remarksFile || leadData?.file;
    const fileArray = Array.isArray(candidateFiles) ? candidateFiles : candidateFiles ? [candidateFiles] : [];

    let hasActualFiles = false;
    for (const item of fileArray) {
      const raw = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
      if (raw instanceof File || raw instanceof Blob) {
        hasActualFiles = true;
        break;
      }
    }

    if (hasActualFiles) {
      payload = buildFormData(leadData, fileArray);
    } else {
      // Ensure remarks text is present in JSON payload
      if (!payload.remarks && payload.remark) {
        payload.remarks = payload.remark;
      }
    }

    const response = await api.post("/leads", payload);
    return response;
  } catch (error) {
    console.error("createLeadApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to create lead"
    };
  }
};

// ========================================================
// 2. GET ALL LEADS API (Used in SalseTotalLeads.jsx)
// Supports search, status, pagination, etc.
// ========================================================
export const getAllLeadsApi = async (params = {}) => {
  try {
    const response = await api.get("/leads", { params });
    return response;
  } catch (error) {
    console.error("getAllLeadsApi Error:", error);
    return {
      success: false,
      data: { leads: [], pagination: { total: 0 } },
      message: error?.response?.data?.message || error.message
    };
  }
};

// ========================================================
// 3. GET LEAD BY ID API (Used in LeadDetails.jsx)
// ========================================================
export const getLeadByIdApi = async (id) => {
  try {
    const response = await api.get(`/leads/${id}`);
    return response;
  } catch (error) {
    console.error("getLeadByIdApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message
    };
  }
};

// ========================================================
// 4. UPDATE LEAD API (Edit modal ya updates ke liye)
// ========================================================
export const updateLeadApi = async (id, leadData, files = null) => {
  try {
    let payload = leadData;
    const candidateFiles = files || leadData?.remarkAttachments || leadData?.attachments || leadData?.remarksFiles || leadData?.remarksFile || leadData?.file;
    const fileArray = Array.isArray(candidateFiles) ? candidateFiles : candidateFiles ? [candidateFiles] : [];

    let hasActualFiles = false;
    for (const item of fileArray) {
      const raw = item instanceof File || item instanceof Blob ? item : item?.file || item?.blob;
      if (raw instanceof File || raw instanceof Blob) {
        hasActualFiles = true;
        break;
      }
    }

    if (hasActualFiles) {
      payload = buildFormData(leadData, fileArray);
    } else {
      if (!payload.remarks && payload.remark) {
        payload.remarks = payload.remark;
      }
    }

    const response = await api.put(`/leads/${id}`, payload);
    return response;
  } catch (error) {
    console.error("updateLeadApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message
    };
  }
};

// ========================================================
// 5. UPDATE LEAD STATUS (Timeline me log karne ke liye)
// ========================================================
export const updateLeadStatusApi = async (id, status, remarks = "") => {
  try {
    const response = await api.patch(`/leads/${id}/status`, {
      status,
      remarks
    });
    return response;
  } catch (error) {
    console.error("updateLeadStatusApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message
    };
  }
};

// ========================================================
// 6. TOGGLE / MARK INTERESTED FROM TABLE LEAD
// ========================================================
export const markInterestedFromTableApi = async (id, isInterested = true, payload = {}) => {
  try {
    const response = await api.patch(`/leads/${id}/interested`, {
      intrestedFromTableLead: isInterested,
      lossReason: payload.lossReason || payload.reason || "Not Interested",
      lossRemark: payload.lossRemark || payload.remark || ""
    });
    return response;
  } catch (error) {
    console.error("markInterestedFromTableApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message
    };
  }
};

// ========================================================
// 7. SOFT DELETE LEAD
// ========================================================
export const deleteLeadApi = async (id) => {
  try {
    const response = await api.delete(`/leads/${id}`);
    return response;
  } catch (error) {
    console.error("deleteLeadApi Error:", error);
    return {
      success: false,
      message: error?.response?.data?.message || error.message
    };
  }
};

export default {
  createLeadApi,
  getAllLeadsApi,
  getLeadByIdApi,
  updateLeadApi,
  updateLeadStatusApi,
  markInterestedFromTableApi,
  deleteLeadApi
};