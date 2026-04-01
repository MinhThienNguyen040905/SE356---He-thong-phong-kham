import api from "../../../lib/api"

export interface PatientProfile {
  type: "phone" | "email" | "address"
  value: string
  city?: string
  ward?: string
}

export interface Patient {
  id: number
  userId: number
  patientCode: string
  fullName: string
  gender: string
  dateOfBirth: string
  phone?: string
  email?: string
  address?: string
  bloodType?: string
  height?: number
  weight?: number
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  avatar?: string
  isActive: boolean
  profiles?: PatientProfile[]
  chronicDiseases?: string[]
  allergies?: string[]
  createdAt: string
  updatedAt: string
}

export interface Visit {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  checkInTime: string
  visitDate?: string 
  checkOutTime?: string
  symptoms?: string
  diagnosis?: string
  note?: string
  status: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    respiratoryRate?: number
    weight?: number
    height?: number
    spo2?: number
  }
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: {
    id: number
    fullName?: string
    user?: {
      fullName: string
      email: string
    }
    specialty?: {
      name: string
    }
  }
}

export interface Prescription {
  id: number
  visitId: number
  patientId: number
  doctorId: number
  prescriptionCode: string
  status: string
  note?: string
  createdAt: string
  updatedAt: string
  patient?: Patient
  doctor?: {
    id: number
    fullName?: string
    user?: {
      id: number
      fullName: string
      email?: string
      avatar?: string
    }
    specialty?: {
      id: number
      name: string
    }
  }
  medicines?: Array<{
    id: number
    medicineId: number
    quantity: number
    dosage: string
    frequency: string
    duration: string
    medicine?: {
      id: number
      name: string
    }
  }>
  
  details?: Array<{
    id: number
    medicineName: string
    quantity: number
    unit: string
    dosageMorning: number
    dosageNoon: number
    dosageAfternoon: number
    dosageEvening: number
    instruction?: string
    days?: number
    unitPrice: number
  }>
}


export const setupPatientProfile = async (data: {
  fullName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth: string
  cccd: string
  profiles: Array<{
    type: "phone" | "email" | "address"
    value: string
    city?: string
    ward?: string
  }>
}): Promise<Patient> => {
  const response = await api.post("/patients/setup", data)
  
  if (response.data.data) {
    return response.data.data
  }
  return response.data
}


export const createPatient = async (data: {
  fullName: string
  gender: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth: string
  cccd: string
  profiles: Array<{
    type: "phone" | "email" | "address"
    value: string
    city?: string
    ward?: string
  }>
}): Promise<Patient> => {
  const response = await api.post("/patients", data)
  if (response.data.data) {
    return response.data.data
  }
  return response.data
}


export const getPatientById = async (patientId: number): Promise<Patient> => {
  const response = await api.get(`/patients/${patientId}`)
  
  if (response.data.patient) {
    return response.data.patient
  }
  
  return response.data.data || response.data
}


export const updatePatient = async (
  patientId: number,
  data: Partial<Patient>
): Promise<Patient> => {
  const response = await api.put(`/patients/${patientId}`, data)
  
  if (response.data.patient) {
    return response.data.patient
  }
  
  return response.data.data || response.data
}


export const uploadPatientAvatar = async (
  patientId: number,
  file: File
): Promise<{ avatar: string }> => {
  const formData = new FormData()
  formData.append("avatar", file)

  const response = await api.post(`/patients/${patientId}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data.data || response.data
}


export const getPatientMedicalHistory = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Visit[]; pagination: any }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(
    `/patients/${patientId}/medical-history?${params.toString()}`
  )
  
  
  
  const responseData = response.data.data || {}
  const visits = Array.isArray(responseData.visits) ? responseData.visits : []
  
  return {
    data: visits,
    pagination: response.data.pagination || {},
  }
}


export const getPatientPrescriptions = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Prescription[]; pagination: any }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(
    `/patients/${patientId}/prescriptions?${params.toString()}`
  )
  return {
    data: response.data.data || [],
    pagination: response.data.pagination || {},
  }
}


export const getPatients = async (params?: {
  page?: number
  limit?: number
  search?: string
  keyword?: string
  profileKeyword?: string
  gender?: string
  isActive?: boolean | string
  dateOfBirthFrom?: string
  dateOfBirthTo?: string
}): Promise<{ patients: Patient[]; pagination: any }> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())
  if (params?.search) queryParams.append("search", params.search)
  if (params?.keyword) queryParams.append("keyword", params.keyword)
  if (params?.profileKeyword) queryParams.append("profileKeyword", params.profileKeyword)
  if (params?.gender) queryParams.append("gender", params.gender)
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString())
  if (params?.dateOfBirthFrom) queryParams.append("dateOfBirthFrom", params.dateOfBirthFrom)
  if (params?.dateOfBirthTo) queryParams.append("dateOfBirthTo", params.dateOfBirthTo)

  const response = await api.get(`/patients?${queryParams.toString()}`)
  
  
  if (response.data.patients) {
    return {
      patients: response.data.patients,
      pagination: response.data.pagination || {},
    }
  }
  
  
  return {
    patients: response.data.data || [],
    pagination: response.data.pagination || {},
  }
}
