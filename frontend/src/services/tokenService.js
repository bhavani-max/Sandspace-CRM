import api from "./api";

export const tokenService = {
  raise: (data) => api.post("/tokens", data).then((r) => r.data),
  getTeamTokens: (teamId) =>
    api.get("/tokens", { params: { teamId } }).then((r) => r.data),
  myTokens: () => api.get("/tokens/me").then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/tokens/${id}/status`, { status }).then((r) => r.data),
  addComment: (id, content) =>
    api.post(`/tokens/${id}/comments`, { content }).then((r) => r.data),
  getComments: (id) => api.get(`/tokens/${id}/comments`).then((r) => r.data),
};
