import api from "./api";

export const reportService = {
  submit: (formData) =>
    api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),

  myReports: () => api.get("/reports/me").then((r) => r.data),

  getReports: (memberId, date) =>
    api.get("/reports", { params: { memberId, date } }).then((r) => r.data),
};
