import api from "./api";

export const taskService = {
  // Assignments
  createAssignment: (formData) =>
    api.post("/assignments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  getAssignments: (teamId) =>
    api.get("/assignments", { params: { teamId } }).then((r) => r.data),

  assignTask: (assignmentId, memberIds) =>
    api.post(`/assignments/${assignmentId}/assign`, { memberIds }).then((r) => r.data),

  // Tasks
  getMyTasks: () => api.get("/tasks/me").then((r) => r.data),
  updateTaskStatus: (taskId, status) =>
    api.patch(`/tasks/${taskId}/status`, { status }).then((r) => r.data),

  // Progress
  getProgress: (teamId) =>
    api.get("/progress", { params: { teamId } }).then((r) => r.data),
};
