import api from "../../../lib/api";
import { setAccessToken, clearAccessToken, getRefreshToken, setRefreshToken, clearRefreshToken } from "../../../lib/axiosAuth";
import type { User } from "../types/index";


let lastLoginAttempt = 0;
const MIN_LOGIN_INTERVAL = 2000; 

export const loginApi = async (
  email: string,
  password: string,
  remember?: boolean
): Promise<User> => {
  
  const now = Date.now();
  if (now - lastLoginAttempt < MIN_LOGIN_INTERVAL) {
    const waitSeconds = Math.ceil((MIN_LOGIN_INTERVAL - (now - lastLoginAttempt)) / 1000);
    throw new Error(`Vui lòng đợi ${waitSeconds} giây trước khi thử đăng nhập lại.`);
  }
  lastLoginAttempt = now;
  
  try {
    
    clearAccessToken();
    clearRefreshToken();
    
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const res = await api.post("/auth/login", { email, password, remember });

    if (res.data.success) {
      setAccessToken(res.data.tokens.accessToken);
      setRefreshToken(res.data.tokens.refreshToken);
      return res.data.user;
    } else {
      throw new Error(res.data.message || "Login failed");
    }
  } catch (error: any) {
    
    if (error.response?.status === 429) {
      
      lastLoginAttempt = Date.now() + 60000;
      const retryAfter = error.response?.headers?.['retry-after'] || 
                        error.response?.headers?.['Retry-After'] ||
                        error.response?.data?.retryAfter;
      const waitTime = retryAfter ? `${retryAfter} giây` : "60 giây";
      throw new Error(`Quá nhiều yêu cầu đăng nhập. Vui lòng đợi ${waitTime} và thử lại.`);
    }
    throw error;
  }
};

export const registerApi = async (
  email: string,
  password: string,
  fullName: string
): Promise<User> => {
  const res = await api.post("/auth/register", { 
    email, 
    password, 
    fullName 
  });

  if (res.data.success) {
    return res.data.user;
  } else {
    throw new Error(res.data.message || "Registration failed");
  }
};


let lastRefreshAttempt = 0;
const MIN_REFRESH_INTERVAL = 5000; 

export const refreshApi = async (): Promise<User> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  
  const now = Date.now();
  if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL) {
    const waitSeconds = Math.ceil((MIN_REFRESH_INTERVAL - (now - lastRefreshAttempt)) / 1000);
    throw new Error(`Vui lòng đợi ${waitSeconds} giây trước khi thử lại.`);
  }
  lastRefreshAttempt = now;

  try {
    
    const { deduplicateRequest, generateRequestKey } = await import("@/utils/requestDeduplication");
    const requestKey = generateRequestKey("POST", "/auth/refresh-token", { refreshToken });
    
    const res = await deduplicateRequest(requestKey, () => 
      api.post("/auth/refresh-token", { refreshToken })
    );
    
    if (res.data.success) {
      setAccessToken(res.data.accessToken);
      
      
      if (res.data.user) {
        const user = {
          id: res.data.user.id,
          email: res.data.user.email || '',
          fullName: res.data.user.fullName || '',
          role: res.data.user.roleId?.toString() || '',
          roleId: res.data.user.roleId || 3,
          patientId: res.data.user.patientId || null,
          doctorId: res.data.user.doctorId || null,
        };
        return user;
      }
      
      
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        const profileRes = await api.get("/profile");
        if (profileRes.data.success) {
          const userData = profileRes.data.data || profileRes.data.user;
          const user = {
            id: userData.id,
            email: userData.email || '',
            fullName: userData.fullName || '',
            role: userData.roleId?.toString() || '',
            roleId: userData.roleId || 3,
            patientId: userData.patientId || null,
            doctorId: userData.doctorId || null,
          };
          return user;
        }
        throw new Error("Failed to get user information");
      } catch (profileError: any) {
        
        if (profileError.response?.status === 429) {
          throw new Error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
        }
        throw new Error("Failed to get user information");
      }
    } else {
      throw new Error(res.data.message || "Token refresh failed");
    }
  } catch (error: any) {
    
    if (error.response?.status === 429) {
      
      lastRefreshAttempt = Date.now() + 30000; 
      throw new Error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
    }
    throw error;
  }
};

export const logoutApi = async () => {
  clearAccessToken();
  clearRefreshToken();
};

export const forgotPasswordApi = async (email: string): Promise<void> => {
  const res = await api.post("/auth/forgot-password", { email });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to send reset email");
  }
};

export const resetPasswordApi = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const res = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to reset password");
  }
};
