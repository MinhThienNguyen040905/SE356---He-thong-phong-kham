export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  avatar?: string | null;
  patientId?: number | null;
  doctorId?: number | null;
  
  patient?: {
    id: number;
    patientCode: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    cccd: string;
    avatar?: string | null;
    profiles?: Array<{
      type: string;
      value: string;
      city?: string;
      ward?: string;
    }>;
  };
  
  doctor?: {
    id: number;
    doctorCode?: string;
    employeeCode?: string;
    specialtyId: number;
    yearsOfExperience: number;
    bio?: string;
    
    description?: string;
    position?: string;
    degree?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    cccd?: string;
    expertise?: string;
    joiningDate?: string;
    specialty?: {
      id: number;
      name: string;
      code: string;
    };
  };
}

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  cccd?: string;
  address?: string;
  
  profiles?: Array<{
    type: string;
    value: string;
    city?: string;
    ward?: string;
  }>;
  
  bio?: string;
  yearsOfExperience?: number;
  position?: string;
  degree?: string;
  expertise?: string;
}
