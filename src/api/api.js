import axios from "axios"

// I create a single axios instance so I don’t have to repeat the base URL in every request
const API = axios.create({
  baseURL: "https://nms-backend-kr6f.onrender.com",
})

// ---------------- DOCTORS ----------------

// I fetch every doctor in the system
export const getAllDoctors = () => API.get("/doctors")

// I fetch one doctor using their id
export const getDoctorById = (id) => API.get(`/doctors/${id}`)

// I send a new doctor object to the backend to create a doctor
export const addDoctor = (data) => API.post("/doctors", data)

// I update an existing doctor by id
export const updateDoctor = (doctorId, data) =>
  API.put(`/doctors/${doctorId}`, data)

// I delete a doctor using their id
export const deleteDoctor = (doctorId) =>
  API.delete(`/doctors/${doctorId}`)

// I look up a doctor using their email (backend expects this in the POST body)
export const getDoctorByEmail = (email) =>
  API.post("/doctors/by_email", { email })

// ---------------- PATIENTS ----------------

// I create a new patient record
export const addPatient = (data) => API.post("/patients", data)

// I fetch one patient by id
export const getPatient = (id) => API.get(`/patients/${id}`)

// I get all patients that belong to a specific doctor
export const getPatientsByDoctor = (doctorId) =>
  API.get(`/patients/by_doctor/${doctorId}`)

// I update a patient record
export const updatePatient = (patientId, data) =>
  API.put(`/patients/${patientId}`, data)

// I delete a patient record
export const deletePatient = (patientId) =>
  API.delete(`/patients/${patientId}`)

// ---------------- REPORTS ----------------

// I create a new report
export const addReport = (data) => API.post("/reports", data)

// I fetch a report by id
export const getReport = (id) => API.get(`/reports/${id}`)

// I fetch reports using the patient’s first and last name
export const getReportsByPatient = (first, last) =>
  API.get(`/reports/by_patient/${first}/${last}`)

// ---------------- ACCOUNTS ----------------

// I create a new account
export const createAccount = (data) => API.post("/accounts", data)

// I log a user in
export const loginAccount = (data) => API.post("/accounts/login", data)

// ---------------- RISK SCORES ----------------

// I create a new risk score for a patient
export const addRiskScore = (patientId, data) =>
  API.post(`/patients/${patientId}/riskScores`, data)

// I get the most recent risk score for a patient
export const getLatestRiskScore = (patientId) =>
  API.get(`/patients/${patientId}/riskScores/latest`)

// I get all historical risk scores for the trend chart
export const getRiskScoresByPatient = (patientId) =>
  API.get(`/patients/${patientId}/risk-scores`)

// I fetch all risk scores using the camelCase route (if the backend supports it)
export const getAllRiskScores = (patientId) =>
  API.get(`/patients/${patientId}/riskScores`)

// ---------------- NEWS ----------------

// I fetch the latest news articles
export const getNews = () => API.get("/news")

// ---------------- EXPORTS ----------------

// I export all patients for a doctor using their email (CSV file)
export const exportDoctorPatientsCSVByEmail = (email) =>
  API.post("/export/doctor/patients", { email }, { responseType: "blob" })

// I export all patients for a doctor using their id (CSV file)
export const exportDoctorPatientsCSV = (doctorId) =>
  API.get(`/export/doctor/${doctorId}/patients`, { responseType: "blob" })

// ---------------- SUPPORT (Admin) ----------------

// I fetch all support tickets
export const getAllSupportTickets = () => API.get("/supportTickets")

// I create a new support ticket
export const createSupportTicket = (data) => API.post("/supportTickets", data)

// I delete a support ticket
export const deleteSupportTicket = (ticketId) =>
  API.delete(`/supportTickets/${ticketId}`)

// ---------------- REVIEWS (Admin) ----------------

// I fetch all reviews
export const getAllReviews = () => API.get("/reviews")

// I delete a review
export const deleteReview = (reviewId) =>
  API.delete(`/reviews/${reviewId}`)
