import api from "./axiosInstance";

/**
 * 1. Get Payment Summary Grouped By Projects (With server-side search, mode, date filters)
 * GET /api/v1/payments/summary
 */
export const getPaymentSummaryApi = async (params = {}) => {
  const response = await api.get("/payments/summary", { params });
  return response;
};

/**
 * 2. Get All Payments for a Specific Project (Passbook / History)
 * GET /api/v1/payments/project/:projectId
 */
export const getProjectPaymentsApi = async (projectId, params = {}) => {
  const response = await api.get(`/payments/project/${projectId}`, { params });
  return response;
};

/**
 * 3. Add New Payment Record
 * POST /api/v1/payments
 */
export const createPaymentApi = async (paymentData) => {
  const response = await api.post("/payments", paymentData);
  return response;
};

/**
 * 4. Update Existing Payment Record
 * PUT /api/v1/payments/:id
 */
export const updatePaymentApi = async (id, paymentData) => {
  const response = await api.put(`/payments/${id}`, paymentData);
  return response;
};

/**
 * 5. Delete Payment Record
 * DELETE /api/v1/payments/:id
 */
export const deletePaymentApi = async (id) => {
  const response = await api.delete(`/payments/${id}`);
  return response;
};
