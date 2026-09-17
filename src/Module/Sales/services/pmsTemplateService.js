import api from "./axiosInstance";

export const pmsTemplateService = {
  // 1. Create a new PMS Template
  createTemplate: async (payload) => {
    return await api.post("/pms-templates", payload);
  },

  // 2. Get all PMS Templates with backend filtering, searching & pagination
  getAllTemplates: async (params = {}) => {
    return await api.get("/pms-templates", { params });
  },

  // 3. Get single PMS Template by ID with deep populated ObjectIds
  getTemplateById: async (id) => {
    return await api.get(`/pms-templates/${id}`);
  },

  // 4. Update an existing PMS Template
  updateTemplate: async (id, payload) => {
    return await api.put(`/pms-templates/${id}`, payload);
  },

  // 5. Delete PMS Template (soft delete)
  deleteTemplate: async (id) => {
    return await api.delete(`/pms-templates/${id}`);
  }
};

export default pmsTemplateService;
