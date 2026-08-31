const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:8000/api/v1" : "https://dss-infra-crm.onrender.com/api/v1");

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// ================= AUTH APIs =================
export const loginApi = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    return await response.json();
  } catch (error) {
    console.error("API loginApi error:", error);
    return { success: false, message: error.message };
  }
};

export const registerApi = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return await response.json();
  } catch (error) {
    console.error("API registerApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getCurrentUserApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getCurrentUserApi error:", error);
    return { success: false, message: error.message };
  }
};

export const logoutApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API logoutApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= LEAD APIs =================
export const createLeadApi = async (leadData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(leadData)
    });
    return await response.json();
  } catch (error) {
    console.error("API createLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getAllLeadsApi = async (params = {}) => {
  try {
    const finalParams = { limit: 1000, ...params };
    const queryParams = new URLSearchParams(finalParams).toString();
    const response = await fetch(`${API_BASE_URL}/leads?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getAllLeadsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadByIdApi = async (leadId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getLeadByIdApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateLeadStatusApi = async (leadId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await response.json();
  } catch (error) {
    console.error("API updateLeadStatusApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateLeadApi = async (leadId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return await response.json();
  } catch (error) {
    console.error("API updateLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

export const assignLeadApi = async (leadId, assignData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/assign`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(assignData)
    });
    return await response.json();
  } catch (error) {
    console.error("API assignLeadApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= FOLLOWUP APIs =================
export const addFollowupApi = async (followupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followups`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(followupData)
    });
    return await response.json();
  } catch (error) {
    console.error("API addFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadFollowupsApi = async (leadId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followups/lead/${leadId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getLeadFollowupsApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateFollowupApi = async (followupId, followupData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followups/${followupId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(followupData)
    });
    return await response.json();
  } catch (error) {
    console.error("API updateFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteFollowupApi = async (followupId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/followups/${followupId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API deleteFollowupApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= DASHBOARD APIs =================
export const getDashboardStatsApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getDashboardStatsApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= UPLOAD APIs =================
export const uploadMediaFileApi = async (file, leadId = "") => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (leadId) formData.append("leadId", leadId);

    const token = localStorage.getItem("accessToken");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: "POST",
      headers,
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error("API uploadMediaFileApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getLeadMediaApi = async (leadId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/lead/${leadId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getLeadMediaApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= USER APIs =================
export const getAllUsersApi = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getAllUsersApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getUserByIdApi = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("API getUserByIdApi error:", error);
    return { success: false, message: error.message };
  }
};
