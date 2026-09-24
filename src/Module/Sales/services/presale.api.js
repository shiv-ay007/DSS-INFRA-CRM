import api from "./axiosInstance";

/**
 * 1. Fetch Presale details by LeadProject ID (or initialize default)
 */
export const getPresaleByProjectIdApi = async (projectId) => {
  return await api.get(`/presales/${projectId}`);
};

/**
 * 2. Save Stage Data with Sequential Stage Gating & Scope validation
 */
export const savePresaleStageApi = async (payload) => {
  return await api.put("/presales/save-stage", payload);
};

/**
 * 3. Add Presale Remark with Cloudinary media upload (Voice notes, images, files)
 */
export const addPresaleRemarkApi = async (projectId, formData) => {
  return await api.post(`/presales/${projectId}/remark`, formData);
};
