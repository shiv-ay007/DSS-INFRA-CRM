import api from "./axiosInstance";

export const branchService = {
  // 1. Get All Branches (supports pagination & filters)
  // Example params: { page: 1, limit: 10, search: 'Noida', city: 'Noida', state: 'UP' }
  getAllBranches: async (params = {}) => {
    const response = await api.get("/branches", { params });
    return response.data;
  },

  // 2. Get Single Branch by ID
  getBranchById: async (id) => {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  // 3. Get Branch Statistics (active, inactive, deleted, all)
  getStatistics: async (status = "all") => {
    const response = await api.get(`/branches/statistics?status=${status}`);
    return response.data;
  },

  // 4. Get Branches by State
  getBranchesByState: async (state) => {
    const response = await api.get(`/branches/state/${state}`);
    return response.data;
  },

  // 5. Get Branches by City
  getBranchesByCity: async (city) => {
    const response = await api.get(`/branches/city/${city}`);
    return response.data;
  },

  // 6. Get Branches by Pincode
  getBranchesByPincode: async (pincode) => {
    const response = await api.get(`/branches/pincode/${pincode}`);
    return response.data;
  },

  // 7. Create New Branch
  createBranch: async (branchData) => {
    const response = await api.post("/branches", branchData);
    return response.data;
  },

  // 8. Update Branch by ID
  updateBranch: async (id, branchData) => {
    const response = await api.put(`/branches/${id}`, branchData);
    return response.data;
  },

  // 9. Soft Delete Branch
  deleteBranch: async (id) => {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },

  // 10. Restore Soft Deleted Branch
  restoreBranch: async (id) => {
    const response = await api.patch(`/branches/${id}/restore`);
    return response.data;
  },

  // 11. Permanent Delete Branch
  permanentDeleteBranch: async (id) => {
    const response = await api.delete(`/branches/${id}/permanent`);
    return response.data;
  },

  // 12. Bulk Delete Branches (Array of IDs)
  bulkDeleteBranches: async (ids) => {
    const response = await api.delete("/branches/bulk/delete", {
      data: { ids }
    });
    return response.data;
  }
};