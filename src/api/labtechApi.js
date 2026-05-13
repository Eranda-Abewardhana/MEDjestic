import axiosInstance from './axiosInstance';

// ── Dashboard Stats ──────────────────────────────────────────────
export const getLabStats = () =>
  axiosInstance.get('/lab/stats').then((r) => r.data);

// ── Lab Requests ─────────────────────────────────────────────────
export const getLabTests = (params = {}) =>
  axiosInstance.get('/lab', { params }).then((r) => r.data);

export const getLabTestById = (id) =>
  axiosInstance.get(`/lab/${id}`).then((r) => r.data);

export const updateLabTest = (id, data) =>
  axiosInstance.put(`/lab/${id}`, data).then((r) => r.data);

// ── Reports ─────────────────────────────────────────────────────
// Note: Backend uses updateLabTest for entering results and changing status
// We can use a specific upload/sharing logic if needed, but for now results are strings
