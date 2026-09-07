import apiClient from "./axiosInstance";

// ================= AUTH APIs =================
export const loginApi = async (credentials) => {
  try {
    return await apiClient.post("/auth/login", credentials);
  } catch (error) {
    console.error("API loginApi error:", error);
    return { success: false, message: error.message };
  }
};

export const registerApi = async (userData) => {
  try {
    return await apiClient.post("/auth/register", userData);
  } catch (error) {
    console.error("API registerApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getCurrentUserApi = async () => {
  try {
    return await apiClient.get("/auth/me");
  } catch (error) {
    console.error("API getCurrentUserApi error:", error);
    return { success: false, message: error.message };
  }
};

export const logoutApi = async () => {
  try {
    return await apiClient.post("/auth/logout");
  } catch (error) {
    console.error("API logoutApi error:", error);
    return { success: false, message: error.message };
  }
};

export const refreshTokenApi = async () => {
  try {
    return await apiClient.post("/auth/refresh-token");
  } catch (error) {
    console.error("API refreshTokenApi error:", error);
    return { success: false, message: error.message };
  }
};

// ================= USER APIs =================
export const getAllUsersApi = async () => {
  try {
    return await apiClient.get("/users");
  } catch (error) {
    console.error("API getAllUsersApi error:", error);
    return { success: false, message: error.message };
  }
};

export const getUserByIdApi = async (userId) => {
  try {
    return await apiClient.get(`/users/${userId}`);
  } catch (error) {
    console.error("API getUserByIdApi error:", error);
    return { success: false, message: error.message };
  }
};

export const updateUserRoleApi = async (userId, role) => {
  try {
    return await apiClient.patch(`/users/${userId}/role`, { role });
  } catch (error) {
    console.error("API updateUserRoleApi error:", error);
    return { success: false, message: error.message };
  }
};

export const deleteUserApi = async (userId) => {
  try {
    return await apiClient.delete(`/users/${userId}`);
  } catch (error) {
    console.error("API deleteUserApi error:", error);
    return { success: false, message: error.message };
  }
};
