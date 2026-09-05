import api from "./axiosInstance"

/**
 * Helper: Agar remarks file (Image/Audio/PDF) ho toh FormData banata hai
 */
const buildFormData = (data, file) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) || (typeof value === "object" && !(value instanceof File))) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  if (file instanceof File || file instanceof Blob) {
    formData.append("remarksFile", file);
  }

  return formData;
};

// ========================================================
// 1. CREATE LEAD API (Used in AddLead.jsx)
// ========================================================
export const createLeadApi = async (leadData, file = null) => {
  try {
    let payload = leadData;

    // Agar file pass ki gayi ho toh multipart/form-data banega
    const targetFile = file || leadData?.remarksFile || leadData?.file;
    if (targetFile instanceof File || targetFile instanceof Blob) {
      payload = buildFormData(leadData, targetFile);
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
export const updateLeadApi = async (id, leadData, file = null) => {
  try {
    let payload = leadData;
    const targetFile = file || leadData?.remarksFile;
    if (targetFile instanceof File || targetFile instanceof Blob) {
      payload = buildFormData(leadData, targetFile);
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
export const markInterestedFromTableApi = async (id, isInterested = true, intrestedStatus = "Intrested") => {
  try {
    const response = await api.patch(`/leads/${id}/interested`, {
      intrestedFromTableLead: isInterested,
      intrestedStatus: isInterested ? intrestedStatus : "Pending"
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