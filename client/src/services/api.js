import axios from 'axios';

// Single axios instance every page/service imports, so base URL and
// credentials behavior stay consistent. Request/response interceptors
// (attaching auth, handling expired sessions) are added in Phase 3.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export default api;
