"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {type AuthContextType, type User } from "../types/index";
import { loginApi, logoutApi, refreshApi, registerApi } from "../services/auth.service";
import { setAccessToken, clearAccessToken, setRefreshToken, clearRefreshToken } from "../../../lib/axiosAuth";
import api from "../../../lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  
  useEffect(() => {
  }, [user]);

  
  useEffect(() => {
    let isMounted = true;
    let restoreAttempted = false;
    
    const restore = async () => {
      
      if (restoreAttempted) return;
      
      
      if (isLoggingIn) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || 
                         currentPath === '/register' || 
                         currentPath === '/forgot-password' || 
                         currentPath === '/reset-password' ||
                         currentPath === '/auth/oauth/callback';
      
      if (isAuthPage) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      restoreAttempted = true;
      
      
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      
      if (isLoggingIn) {
        restoreAttempted = false;
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      
      const finalPath = window.location.pathname;
      const stillOnAuthPage = finalPath === '/login' || 
                               finalPath === '/register' || 
                               finalPath === '/forgot-password' || 
                               finalPath === '/reset-password' ||
                               finalPath === '/auth/oauth/callback';
      if (stillOnAuthPage) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        
        
        if (refreshToken && !isLoggingIn && !stillOnAuthPage) {
          try {
            const user = await refreshApi();
            if (isMounted && !isLoggingIn) {
              setUser(user);
              
              setLoading(false);
            }
          } catch (error: any) {
            
            if (error.response?.status === 429) {
              console.warn('Rate limited during token restore. Skipping restore to avoid further rate limits.');
              
              if (isMounted) {
                setUser(null);
                
                setLoading(false);
              }
              return;
            }
            
            
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('accessToken');
              setLoading(false);
            }
          }
        } else {
          
          if (accessToken) {
            if (user) {
              
              setLoading(false);
            } else {
              
              try {
                const response = await api.get("/profile");
                if (response.data.success) {
                  const userData = response.data.data || response.data.user;
                  const restoredUser: User = {
                    id: userData.id,
                    email: userData.email || '',
                    fullName: userData.fullName || '',
                    role: userData.roleId?.toString() || '',
                    roleId: userData.roleId || 3,
                    patientId: userData.patientId || null,
                    doctorId: userData.doctorId || null,
                    avatarUrl: userData.avatar,
                  };
                  if (isMounted) {
                    setUser(restoredUser);
                    setLoading(false);
                  }
                } else {
                  throw new Error("Failed to get user information");
                }
              } catch (error: any) {
                
                if (isMounted) {
                  setUser(null);
                  localStorage.removeItem('accessToken');
                  setLoading(false);
                }
              }
            }
          } else {
            
            if (isMounted) {
              setUser(null);
              setLoading(false);
            }
          }
        }
      } catch (error) {
        
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          setLoading(false);
        }
      } finally {
        
        
        if (isMounted && !restoreAttempted) {
          setLoading(false);
        }
      }
    };
    
    
    const currentPathCheck = window.location.pathname;
    const isAuthPageCheck = currentPathCheck === '/login' || 
                       currentPathCheck === '/register' || 
                       currentPathCheck === '/forgot-password' || 
                       currentPathCheck === '/reset-password' ||
                       currentPathCheck === '/auth/oauth/callback';
    
    if (isAuthPageCheck) {
      
      if (isMounted) {
        setUser(null);
        setLoading(false);
      }
      return;
    }
    
    
    if (!isLoggingIn && !isAuthPageCheck) {
      
      const restoreTimeout = setTimeout(() => {
        if (isMounted && !isLoggingIn) {
          
          const checkPath = window.location.pathname;
          const stillNotAuthPage = checkPath !== '/login' && 
                                    checkPath !== '/register' && 
                                    checkPath !== '/forgot-password' && 
                                    checkPath !== '/reset-password' &&
                                    checkPath !== '/auth/oauth/callback';
          
          if (stillNotAuthPage) {
            restore();
          } else {
            if (isMounted) {
              setLoading(false);
            }
          }
        }
      }, 300);
      
      return () => {
        isMounted = false;
        clearTimeout(restoreTimeout);
      };
    } else {
      
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [isLoggingIn]);

  const login = async (email: string, password: string, remember?: boolean) => {
    
    if (isLoggingIn) {
      throw new Error("Đang xử lý đăng nhập. Vui lòng đợi...");
    }
    
    setIsLoggingIn(true);
    try {
      
      
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await loginApi(email, password, remember);
      setUser(user);
      
      return user;
    } catch (error: any) {
      
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 
                          error.response?.headers?.['Retry-After'] ||
                          error.response?.data?.retryAfter;
        const waitTime = retryAfter ? `${retryAfter} giây` : "30-60 giây";
        throw new Error(`Quá nhiều yêu cầu đăng nhập. Vui lòng đợi ${waitTime} và thử lại.`);
      }
      throw error;
    } finally {
      
      setTimeout(() => {
        setIsLoggingIn(false);
      }, 1000);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const user = await registerApi(email, password, fullName);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const loginWithToken = async (token: string, refreshToken?: string) => {
    try {
      setIsLoggingIn(true);
      
      setAccessToken(token);
      
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      
      const response = await api.get("/profile");
      if (response.data.success) {
        const userData = response.data.data || response.data.user;
        
        
        const extractedPatientId = userData.patientId || (userData.roleId === 3 ? userData.profileDetails?.id : null) || null;
        const extractedDoctorId = userData.doctorId || (userData.roleId === 4 ? userData.profileDetails?.id : null) || null;
        
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          fullName: userData.fullName || '',
          role: userData.roleId?.toString() || '',
          roleId: userData.roleId || 3,
          patientId: extractedPatientId,
          doctorId: extractedDoctorId,
          avatarUrl: userData.avatar,
        };
        setUser(user);
      } else {
        throw new Error("Failed to get user information");
      }
    } catch (error: any) {
      
      clearAccessToken();
      if (refreshToken) {
        clearRefreshToken();
      }
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get("/profile");
      if (response.data.success) {
        const userData = response.data.data || response.data.user;
        
        
        const extractedPatientId = userData.patientId || (userData.roleId === 3 ? userData.profileDetails?.id : null) || null;
        const extractedDoctorId = userData.doctorId || (userData.roleId === 4 ? userData.profileDetails?.id : null) || null;
        
        const updatedUser: User = {
          id: userData.id,
          email: userData.email || '',
          fullName: userData.fullName || '',
          role: userData.roleId?.toString() || '',
          roleId: userData.roleId || 3,
          patientId: extractedPatientId,
          doctorId: extractedDoctorId,
          avatarUrl: userData.avatar,
        };
        
        console.log(" Refreshed user:", {
          userId: updatedUser.id,
          roleId: updatedUser.roleId,
          patientId: updatedUser.patientId,
          doctorId: updatedUser.doctorId,
        });
        setUser(updatedUser);
        return updatedUser;
      } else {
        throw new Error("Failed to get user information");
      }
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithToken,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    
    
    console.warn("useAuth called outside AuthProvider, returning default values");
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: async () => {
        throw new Error("Not authenticated");
      },
      logout: async () => {},
      register: async () => {
        throw new Error("Not authenticated");
      },
      loginWithToken: async () => {},
      refreshUser: async () => {
        throw new Error("Not authenticated");
      },
    } as AuthContextType;
  }
  return ctx;
};
