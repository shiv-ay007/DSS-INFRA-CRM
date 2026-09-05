import api from "./axiosInstance";

export const departmentService = {
  // 1. Get All Departments (supports search & pagination)
  // Example params: { page: 1, limit: 10, search: 'Sales', city: 'Delhi' }
  getAllDepartments: async (params = {}) => {
    const response = await api.get("/departments", { params });
    return response.data;
  },

  // 2. Get Single Department by ID
  getDepartmentById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // 3. Get Departments by City
  getDepartmentsByCity: async (city) => {
    const response = await api.get(`/departments/city/${city}`);
    return response.data;
  },

  // 4. Create New Department
  createDepartment: async (deptData) => {
    const response = await api.post("/departments", deptData);
    return response.data;
  },

  // 5. Update Department by ID
  updateDepartment: async (id, deptData) => {
    const response = await api.put(`/departments/${id}`, deptData);
    return response.data;
  },

  // 6. Soft Delete Department
  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // 7. Restore Soft Deleted Department
  restoreDepartment: async (id) => {
    const response = await api.patch(`/departments/${id}/restore`);
    return response.data;
  },

  // 8. Permanent Delete Department
  permanentDeleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}/permanent`);
    return response.data;
  },

  // 9. Bulk Delete Departments (Array of IDs)
  bulkDeleteDepartments: async (ids) => {
    const response = await api.delete("/departments/bulk/delete", {
      data: { ids }
    });
    return response.data;
  }
};