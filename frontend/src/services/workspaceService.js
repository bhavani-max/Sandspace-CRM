import api from "./api";

export const workspaceService = {
  create: (data) => api.post("/workspaces", data).then((r) => r.data),
  addMembers: (id, userIds) =>
    api.post(`/workspaces/${id}/members`, { userIds }).then((r) => r.data),
  myWorkspaces: () => api.get("/workspaces/me").then((r) => r.data),
  getById: (id) => api.get(`/workspaces/${id}`).then((r) => r.data),
  getMembers: (id) => api.get(`/workspaces/${id}/members`).then((r) => r.data),
  updateNotes: (id, notes) =>
    api.patch(`/workspaces/${id}/notes`, { notes }).then((r) => r.data),
  uploadDoc: (id, formData) =>
    api.post(`/workspaces/${id}/docs`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
  getDocs: (id) => api.get(`/workspaces/${id}/docs`).then((r) => r.data),
  getChatHistory: (workspaceId) =>
    api.get("/messages", { params: { workspaceId } }).then((r) => r.data),
};
