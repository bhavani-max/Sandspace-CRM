import api from "./api";

export const userService = {
  getAllUsers: () => api.get("/users").then((r) => r.data),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),

  getAllTeams: () => api.get("/teams").then((r) => r.data),
  createTeam: (name, leaderId) => api.post("/teams", { name, leaderId }).then((r) => r.data),
  getTeamMembers: (teamId) => api.get(`/teams/${teamId}/members`).then((r) => r.data),
  addMemberToTeam: (teamId, userId) =>
    api.post(`/teams/${teamId}/members`, { userId }).then((r) => r.data),
};
