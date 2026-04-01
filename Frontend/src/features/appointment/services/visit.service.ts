import api from "../../../lib/api"

export interface PrescriptionDetail {
  id: number
  medicineName: string
  medicineId: number
  quantity: number
  unit: string
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  days: number
  instruction?: string
  medicine?: {
    id: number
    name: string
    unit: string
    price: number
  }
}

export interface Prescription {
  id: number
  prescriptionCode: string
  visitId: number
  patientId: number
  doctorId: number
  status: string
  note?: string
  totalAmount: number
  createdAt: string
  details?: PrescriptionDetail[]
}

export interface Visit {
  id: number
  appointmentId: number
  patientId: number
  doctorId: number
  visitDate?: string
  checkInTime: string
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
  patient?: {
    id: number
    fullName: string
    patientCode: string
  }
  doctor?: {
    id: number
    fullName?: string
    user?: {
      fullName: string
      email: string
    }
    specialty?: {
      id: number
      name: string
    }
  }
  appointment?: {
    id: number
    date: string
    patientName?: string
    patientPhone?: string
    patientDob?: string
    patientGender?: string
    shift?: {
      id: number
      name: string
      startTime: string
      endTime: string
    }
  }
  prescription?: Prescription
  invoice?: {
    id: number
    paymentStatus: string
    totalAmount: number
  }
  displayStatus?: string
}


export const checkInAppointment = async (
  appointmentId: number
): Promise<Visit> => {
  const response = await api.post(`/visits/checkin/${appointmentId}`)
  return response.data.data || response.data
}


export const getVisits = async (params?: {
  date?: string
  doctorId?: number
  patientId?: number
  status?: string
  page?: number
  limit?: number
}): Promise<{ data: Visit[]; pagination?: any }> => {
  const queryParams = new URLSearchParams()
  if (params?.date) queryParams.append("date", params.date)
  if (params?.doctorId) queryParams.append("doctorId", params.doctorId.toString())
  if (params?.patientId) queryParams.append("patientId", params.patientId.toString())
  if (params?.status) queryParams.append("status", params.status)
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())

  const response = await api.get(`/visits?${queryParams.toString()}`)
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  }
}


export const getPatientVisits = async (
  patientId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Visit[]; pagination?: any }> => {
  const params = new URLSearchParams({
    patientId: patientId.toString(),
    page: page.toString(),
    limit: limit.toString(),
  })

  const response = await api.get(`/visits/patient/${patientId}?${params.toString()}`)
  return {
    data: response.data.data || [],
    pagination: response.data.pagination,
  }
}


export const getVisitById = async (visitId: number): Promise<Visit> => {
  const response = await api.get(`/visits/${visitId}`)
  return response.data.data || response.data
}


export const completeVisit = async (
  visitId: number,
  data: {
    diagnosis: string
    note?: string
    vitalSigns?: any
    examinationFee?: number
  }
): Promise<Visit> => {
  const response = await api.put(`/visits/${visitId}/complete`, data)
  return response.data.data || response.data
}
