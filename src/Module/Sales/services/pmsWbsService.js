import api from "./axiosInstance";

export const pmsWbsService = {
  // 1. Fetch All Master Data (Stages, Works, Tasks from MongoDB)
  getAllWbsData: async () => {
    return await api.get("/pms-wbs");
  },

  // 1.1 Paginated & Filtered Endpoints
  getStagesPaginated: async (params = {}) => {
    return await api.get("/pms-wbs/stages", { params });
  },
  getWorksPaginated: async (params = {}) => {
    return await api.get("/pms-wbs/works", { params });
  },
  getTasksPaginated: async (params = {}) => {
    return await api.get("/pms-wbs/tasks", { params });
  },

  // 2. Seed / Restore Default Master Data
  seedWbsData: async (overwrite = false) => {
    return await api.post("/pms-wbs/seed", { overwrite });
  },

  // 3. Stage Endpoints
  createStage: async (payload) => {
    return await api.post("/pms-wbs/stages", payload);
  },
  updateStage: async (id, payload) => {
    return await api.put(`/pms-wbs/stages/${id}`, payload);
  },

  // 4. Work Endpoints
  createWork: async (payload) => {
    return await api.post("/pms-wbs/works", payload);
  },
  updateWork: async (id, payload) => {
    return await api.put(`/pms-wbs/works/${id}`, payload);
  },

  // 5. Task Endpoints
  createTask: async (payload) => {
    return await api.post("/pms-wbs/tasks", payload);
  },
  updateTask: async (id, payload) => {
    return await api.put(`/pms-wbs/tasks/${id}`, payload);
  }
};

export default pmsWbsService;
