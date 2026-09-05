import api from "./axiosInstance";

export const userService = {
  // 1. Get All Users (supports search, filters, pagination)
  // Example params: { page: 1, limit: 10, search: 'Rahul', role: 'admin', isActive: true }
  getAllUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // 2. Get Single User by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // 3. Get User by Email
  getUserByEmail: async (email) => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  // 4. Get Users by Branch ID
  getUsersByBranch: async (branchId) => {
    const response = await api.get(`/users/branch/${branchId}`);
    return response.data;
  },

  // 5. Get Users by Department ID
  getUsersByDepartment: async (departmentId) => {
    const response = await api.get(`/users/department/${departmentId}`);
    return response.data;
  },

  // 6. Create New User
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // 7. Update User by ID
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // 8. Toggle User Active / Inactive Status
  toggleStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  },

  // 9. Soft Delete User
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // 10. Restore Soft Deleted User
  restoreUser: async (id) => {
    const response = await api.patch(`/users/${id}/restore`);
    return response.data;
  },

  // 11. Permanent Delete User
  permanentDeleteUser: async (id) => {
    const response = await api.delete(`/users/${id}/permanent`);
    return response.data;
  },

  // 12. Bulk Delete Users (Array of IDs: ['id1', 'id2'])
  bulkDeleteUsers: async (ids) => {
    const response = await api.delete("/users/bulk/delete", {
      data: { ids }
    });
    return response.data;
  }
};