import axios from "axios";

const API = axios.create({
  baseURL: "https://nms-backend-kr6f.onrender.com"
});

export const getAllDoctors = () => API.get("/doctors");
export const getDoctorById = (id) => API.get(`/doctors/${id}`);
export const addDoctor = (data) => API.post("/doctors", data);

export const addPatient = (data) => API.post("/patients", data);
export const getPatient = (id) => API.get(`/patients/${id}`);
export const getPatientsByDoctor = (doctorId) =>
  API.get(`/patients/by_doctor/${doctorId}`);

export const addReport = (data) => API.post("/reports", data);
export const getReport = (id) => API.get(`/reports/${id}`);
export const getReportsByPatient = (first, last) =>
  API.get(`/reports/by_patient/${first}/${last}`);

export const createAccount = (data) => API.post("/accounts", data);
export const loginAccount = (data) => API.post("/accounts/login", data);

export const addRiskScore = (patientId, data) =>
  API.post(`/patients/${patientId}/riskScores`, data);

export const getLatestRiskScore = (patientId) =>
  API.get(`/patients/${patientId}/riskScores/latest`);

export const getNews = () => API.get("/news");
