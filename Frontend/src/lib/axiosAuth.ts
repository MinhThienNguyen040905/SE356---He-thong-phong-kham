
import api from "./api";
import { retryWithBackoff } from "../utils/retry";
import { deduplicateRequest, generateRequestKey } from "../utils/requestDeduplication";


let accessToken: string | null = null;
const ACCESS_TOKEN_KEY = 'accessToken';


const REFRESH_TOKEN_KEY = 'refreshToken';

export const setAccessToken = (token: string) => {
  accessToken = token;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  
  
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    accessToken = storedToken;
    return storedToken;
  }
  
  return null;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};


api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


let isRefreshing = false;
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 5000; 
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) =>
    error ? p.reject(error) : p.resolve(token!)
  );
  failedQueue = [];
};


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/logout'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      
      const now = Date.now();
      if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
        
        return Promise.reject(new Error("Vui lòng đợi một chút trước khi thử lại."));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      lastRefreshTime = now;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        
        const requestKey = generateRequestKey("POST", "/auth/refresh-token", { refreshToken });
        
        const res = await deduplicateRequest(requestKey, () =>
          retryWithBackoff(
            async () => {
              
              const response = await api.post("/auth/refresh-token", { refreshToken });

              if (response.data.success) {
                return response.data;
              } else {
                throw new Error(response.data.message || "Token refresh failed");
              }
            },
            {
              maxRetries: 3,
              initialDelay: 2000, 
              retryableStatuses: [429, 500, 502, 503, 504],
            }
          )
        );

        const newToken = res.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err: any) {
        
        if (err.response?.status === 429) {
          const retryAfter = err.response?.headers?.['retry-after'] || 
                            err.response?.headers?.['Retry-After'] ||
                            err.response?.data?.retryAfter ||
                            30;
          
          lastRefreshTime = Date.now() + (retryAfter * 1000);
          
          processQueue(err, null);
          return Promise.reject({
            ...err,
            message: `Too many token refresh attempts. Please wait ${retryAfter} seconds.`,
            retryAfter,
          });
        }
        
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || 
                           currentPath === '/register' || 
                           currentPath === '/forgot-password' || 
                           currentPath === '/reset-password';
        processQueue(err, null);
        clearAccessToken();
        clearRefreshToken();
        
        
        if (!isAuthPage) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
