// src/services/api.js - All API calls to backend services

import axios from 'axios';

const AUTH_URL = 'https://notes-microservices-production.up.railway.app';
const USER_URL = 'https://abundant-delight-production-e677.up.railway.app';
const NOTES_URL = 'https://notes-microservices.onrender.com';

const AUTH_API  = `${AUTH_URL}/api/auth`;
const USER_API  = `${USER_URL}/api/user`;
const NOTES_API = `${NOTES_URL}/api/notes`;
// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const createAuthConfig = () => ({
  headers: {
    'Authorization': `Bearer ${getToken()}`
  }
});

// ============================================
// AUTH SERVICE
// ============================================
export const authAPI = {
  signup: (data) => axios.post(`${AUTH_API}/signup`, data),
  login: (data) => axios.post(`${AUTH_API}/login`, data),
  getMe: () => axios.get(`${AUTH_API}/me`, createAuthConfig()),
  verifyEmail: (token) => axios.get(`${AUTH_API}/verify-email?token=${token}`),
  forgotPassword: (data) => axios.post(`${AUTH_API}/forgot-password`, data),
  resetPassword: (data) => axios.post(`${AUTH_API}/reset-password`, data),
};

// ============================================
// USER SERVICE
// ============================================
export const userAPI = {
  getProfile: () => axios.get(`${USER_API}/profile`, createAuthConfig()),
  updateProfile: (data) => axios.put(`${USER_API}/profile`, data, createAuthConfig()),
  updatePreferences: (data) => axios.put(`${USER_API}/preferences`, data, createAuthConfig()),
  uploadAvatar: (formData) => axios.post(`${USER_API}/avatar`, formData, {
    ...createAuthConfig(),
    headers: {
      ...createAuthConfig().headers,
      'Content-Type': 'multipart/form-data'
    }
  }),
};

// ============================================
// NOTES SERVICE
// ============================================
export const notesAPI = {
  getNotes: (params) => axios.get(`${NOTES_API}`, { 
    ...createAuthConfig(), 
    params 
  }),
  getNote: (id) => axios.get(`${NOTES_API}/${id}`, createAuthConfig()),
  createNote: (data) => axios.post(`${NOTES_API}`, data, createAuthConfig()),
  updateNote: (id, data) => axios.put(`${NOTES_API}/${id}`, data, createAuthConfig()),
  deleteNote: (id) => axios.delete(`${NOTES_API}/${id}`, createAuthConfig()),
  pinNote: (id) => axios.patch(`${NOTES_API}/${id}/pin`, {}, createAuthConfig()),
  archiveNote: (id) => axios.patch(`${NOTES_API}/${id}/archive`, {}, createAuthConfig()),
  
  // Bin operations
  getBinNotes: () => axios.get(`${NOTES_API}/bin`, createAuthConfig()),
  restoreNote: (id) => axios.put(`${NOTES_API}/${id}/restore`, {}, createAuthConfig()),
  permanentDeleteNote: (id) => axios.delete(`${NOTES_API}/${id}/permanent`, createAuthConfig()),
};