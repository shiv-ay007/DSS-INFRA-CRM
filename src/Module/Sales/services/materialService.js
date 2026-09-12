import api from "./axiosInstance";

export const materialService = {
  // 1. Create Material (supports JSON or FormData with Multer/Cloudinary)
  createMaterial: async (payload) => {
    const response = await api.post("/materials", payload);
    return response;
  },

  // 2. Get All Materials (supports query params: { search, category, subCategory, status, materialType, page, limit })
  getAllMaterials: async (params = {}) => {
    const response = await api.get("/materials", { params });
    return response;
  },

  // 3. Get Single Material by ID
  getMaterialById: async (id) => {
    const response = await api.get(`/materials/${id}`);
    return response;
  },

  // 4. Update Material
  updateMaterial: async (id, payload) => {
    const response = await api.put(`/materials/${id}`, payload);
    return response;
  },

  // 5. Delete Material
  deleteMaterial: async (id) => {
    const response = await api.delete(`/materials/${id}`);
    return response;
  }
};

export default materialService;
