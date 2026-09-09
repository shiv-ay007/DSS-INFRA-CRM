import api from "./axiosInstance";

/**
 * 1. Create and save new Lead Project to database (leadsproject collection)
 */
export const createLeadProjectApi = async (formData) => {
  const response = await api.post("/lead-projects", formData);
  return response;
};

/**
 * 2. Get all Lead Projects with optional filters
 */
export const getAllLeadProjectsApi = async (params = {}) => {
  const response = await api.get("/lead-projects", { params });
  return response;
};

/**
 * 3. Get single Lead Project by ID
 */
export const getLeadProjectByIdApi = async (id) => {
  const response = await api.get(`/lead-projects/${id}`);
  return response;
};

/**
 * 4. Update Lead Project
 */
export const updateLeadProjectApi = async (id, updatedData) => {
  const response = await api.put(`/lead-projects/${id}`, updatedData);
  return response;
};

