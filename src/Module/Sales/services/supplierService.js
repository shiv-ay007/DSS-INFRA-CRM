import api from "./axiosInstance";

export const supplierService = {
  // 1. Create Supplier
  createSupplier: async (payload) => {
    const response = await api.post("/suppliers", payload);
    return response;
  },

  // 2. Get All Suppliers (supports query params: { search, status, supplierType, page, limit })
  getAllSuppliers: async (params = {}) => {
    const response = await api.get("/suppliers", { params });
    return response;
  },

  // 3. Get Single Supplier by ID
  getSupplierById: async (id) => {
    const response = await api.get(`/suppliers/${id}`);
    return response;
  },

  // 4. Update Supplier
  updateSupplier: async (id, payload) => {
    const response = await api.put(`/suppliers/${id}`, payload);
    return response;
  },

  // 5. Delete Supplier
  deleteSupplier: async (id) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response;
  }
};

export default supplierService;
