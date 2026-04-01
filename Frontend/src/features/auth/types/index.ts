export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
  roleId: number;
  patientId?: number | null;
  doctorId?: number | null;
  avatarUrl?: string | null;
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<User>;
  loginWithToken: (token: string, refreshToken?: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User>;
};
