import axios from 'axios';

//const API_URL = 'http://localhost:8000';
const API_URL = 'https://mpp-exam-backend-yrwm.onrender.com';


const api = axios.create({
  baseURL: API_URL,
});

export const getCandidates = () => api.get('/candidates');
export const addCandidate = (candidate) => api.post('/candidates', candidate);
export const updateCandidate = (id, candidate) => api.put(`/candidates/${id}`, candidate);
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`); 