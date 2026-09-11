import api from "./axiosInstance";

export const contractorService = {
  // 1. Create Contractor
  createContractor: async (payload) => {
    const response = await api.post("/contractors", payload);
    return response;
  },

  // 2. Get All Contractors (supports query params: { search, status, contractorType, page, limit })
  getAllContractors: async (params = {}) => {
    const response = await api.get("/contractors", { params });
    return response;
  },

  // 3. Get Single Contractor by ID
  getContractorById: async (id) => {
    const response = await api.get(`/contractors/${id}`);
    return response;
  },

  // 4. Update Contractor
  updateContractor: async (id, payload) => {
    const response = await api.put(`/contractors/${id}`, payload);
    return response;
  },

  // 5. Delete Contractor
  deleteContractor: async (id) => {
    const response = await api.delete(`/contractors/${id}`);
    return response;
  }
};

export default contractorService;
