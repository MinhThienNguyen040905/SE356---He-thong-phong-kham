import api from "../../../lib/api"

export interface Appointment {
  id: number
  patientId: number
  doctorId: number
  shiftId: number
  date: string
  status: string
  bookingType: "ONLINE" | "OFFLINE"
  bookedBy: "PATIENT" | "RECEPTIONIST"
  symptomInitial?: string
  createdAt: string
  updatedAt: string
  displayStatus?: string
  slotNumber?: number
  queueNumber?: number
  patient?: {
    id: number
    fullName: string
    patientCode: string
    gender?: string
    dateOfBirth?: string
    phone?: string
  }
  doctor?: {
    id: number
    user?: {
      id: number
      fullName: string
      email: string
      avatar?: string
    }
    specialty?: {
      id: number
      name: string
    }
  }
  shift?: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
  patientName?: string
  patientPhone?: string
  patientDob?: string
  patientGender?: string
}

export interface CreateAppointmentData {
  doctorId: number
  shiftId: number
  date: string
  symptomInitial?: string
  patientId?: number 
  patientName?: string
  patientPhone?: string
  patientDob?: string
  patientGender?: "MALE" | "FEMALE" | "OTHER"
}


export const createAppointment = async (
  data: CreateAppointmentData
): Promise<Appointment> => {
  const response = await api.post("/appointments", data)
  return response.data.data
}


export const createOfflineAppointment = async (
  data: CreateAppointmentData & { patientId: number }
): Promise<Appointment> => {
  const response = await api.post("/appointments/offline", data)
  return response.data.data
}


export const getAppointments = async (params?: {
  date?: string
  doctorId?: number
  shiftId?: number
  status?: string
  page?: number
  limit?: number
}): Promise<Appointment[]> => {
  const queryParams = new URLSearchParams()
  if (params?.date) queryParams.append("date", params.date)
  if (params?.doctorId) queryParams.append("doctorId", params.doctorId.toString())
  if (params?.shiftId) queryParams.append("shiftId", params.shiftId.toString())
  if (params?.status) queryParams.append("status", params.status)
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.limit) queryParams.append("limit", params.limit.toString())

  const response = await api.get(`/appointments?${queryParams.toString()}`)
  return response.data.data || []
}


export const getMyAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get("/appointments/my")
  return response.data.data || []
}


export const getUpcomingAppointments = async (
  limit: number = 10
): Promise<Appointment[]> => {
  const response = await api.get(`/appointments/upcoming?limit=${limit}`)
  return response.data.data || []
}


export const getAppointmentById = async (
  appointmentId: number
): Promise<Appointment> => {
  const response = await api.get(`/appointments/${appointmentId}`)
  return response.data.data || response.data
}


export const updateAppointment = async (
  appointmentId: number,
  data: { doctorId?: number; shiftId?: number; date?: string }
): Promise<Appointment> => {
  const response = await api.put(`/appointments/${appointmentId}`, data)
  return response.data.data || response.data
}


export const cancelAppointment = async (
  appointmentId: number
): Promise<void> => {
  await api.put(`/appointments/${appointmentId}/cancel`)
}


export const markNoShow = async (appointmentId: number): Promise<void> => {
  await api.put(`/appointments/${appointmentId}/no-show`)
}


export const uploadSymptomImages = async (
  appointmentId: number,
  files: File[]
): Promise<{ imageUrls: string[] }> => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append("images", file)
  })

  const response = await api.post(
    `/appointments/${appointmentId}/symptoms/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data
}


