import axios from 'axios';
import { logRequest, logResponse, logError } from '../utils/logger';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, 
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('accessToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      logRequest(config.method || 'GET', config.url || '', config.data);
    }
    return config;
  },
  (error) => {
    
    if (import.meta.env.DEV) {
      logError('Request Error', error);
    }
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    
    if (import.meta.env.DEV) {
      logResponse(
        response.config.method || 'GET',
        response.config.url || '',
        response.status,
        response.data
      );
    }
    return response;
  },
  (error) => {
    
    if (error.code === 'ECONNABORTED') {
      if (import.meta.env.DEV) {
        logError('Request timeout', error, { url: error.config?.url });
      }
      error.message = 'Request timeout. Vui lòng thử lại.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      if (import.meta.env.DEV) {
        logError('Network Error', error, {
          message: error.message,
          code: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
      }
      error.message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server đang chạy.';
    } else if (error.response) {
      
      
      if (import.meta.env.DEV && error.response.status !== 429) {
        logError(
          `API Error: ${error.response.status}`,
          error,
          { url: error.config?.url, data: error.response.data }
        );
      }
    } else {
      if (import.meta.env.DEV) {
        logError('Unknown Error', error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
