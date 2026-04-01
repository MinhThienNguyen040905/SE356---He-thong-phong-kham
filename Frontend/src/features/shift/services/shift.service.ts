import api from '../../../lib/api'

export interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface ShiftSchedule {
  date: string
  shifts: Array<{
    shift: Shift
    doctors: Array<{
      id: number
      fullName: string
      doctorCode: string
    }>
  }>
}

export interface CreateShiftData {
  name: string
  startTime: string
  endTime: string
  description?: string
}

export interface UpdateShiftData {
  name?: string
  startTime?: string
  endTime?: string
  description?: string
}

export interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  doctor?: {
    id: number
    doctorCode: string
    user: {
      id: number
      fullName: string
      email: string
    }
    specialty: {
      id: number
      name: string
    }
  }
  shift?: Shift
}

export interface DoctorOnDuty {
  id: number
  doctorCode: string
  fullName: string
  specialty: string
  avatar?: string
  shift: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
  workDate: string
}

export interface AvailableShift {
  shift: Shift
  doctors: Array<{
    id: number
    fullName: string
    doctorCode: string
    specialty: string
  }>
  date: string
}

export interface DoctorWithShifts {
  doctor: {
    id: number
    userId: number
    specialtyId: number
    licenseNumber: string
    yearsOfExperience: number
    biography: string
    user: {
      id: number
      fullName: string
      email: string
      phone: string
      avatar?: string
    }
    specialty: {
      id: number
      name: string
      description: string
    }
  }
  shifts: Array<{
    doctorShiftId: number
    shift: {
      id: number
      name: string
      startTime: string
      endTime: string
    }
    workDate: string
    status: string
    maxSlots?: number
    currentBookings?: number
    isFull?: boolean
  }>
  shiftCount: number
}

export class ShiftService {
  
  static async getShifts(): Promise<Shift[]> {
    try {
      const response = await api.get('/shifts')
      if (response.data.success) {
        return response.data.data || []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      
      return []
    }
  }

  
  static async getShiftSchedule(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ShiftSchedule[]> {
    try {
      const response = await api.get('/shifts/schedule', { params })
      if (response.data.success) {
        
        const rawSchedule = response.data.data.schedule || []
        const groupedMap = new Map<string, ShiftSchedule>()

        rawSchedule.forEach((item: any) => {
          if (!groupedMap.has(item.date)) {
            groupedMap.set(item.date, { date: item.date, shifts: [] })
          }

          groupedMap.get(item.date)!.shifts.push({
            shift: item.shift,
            doctors: item.doctors.map((d: any) => ({
              id: d.doctorId,
              fullName: d.doctorName,
              doctorCode: d.doctorCode || 'N/A',
            })),
          })
        })

        return Array.from(groupedMap.values()).sort((a, b) =>
          a.date.localeCompare(b.date)
        )
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      return []
    }
  }

  
  static async getShiftById(id: number): Promise<Shift> {
    try {
      const response = await api.get(`/shifts/${id}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch shift')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async createShift(data: CreateShiftData): Promise<Shift> {
    try {
      const response = await api.post('/shifts', data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to create shift')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async updateShift(id: number, data: UpdateShiftData): Promise<Shift> {
    try {
      const response = await api.put(`/shifts/${id}`, data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to update shift')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async deleteShift(id: number): Promise<void> {
    try {
      const response = await api.delete(`/shifts/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete shift')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getDoctorsOnDuty(): Promise<DoctorOnDuty[]> {
    try {
      const response = await api.get('/doctor-shifts/on-duty')
      if (response.data.success) {
        return response.data.data || []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      return []
    }
  }

  
  static async getAvailableShifts(params?: {
    startDate?: string
    endDate?: string
  }): Promise<AvailableShift[]> {
    try {
      const response = await api.get('/doctor-shifts/available', { params })
      if (response.data.success) {
        return response.data.data || []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      return []
    }
  }

  
  static async cancelShift(id: number, cancelReason: string): Promise<any> {
    try {
      const response = await api.post(`/doctor-shifts/${id}/cancel-and-reschedule`, {
        cancelReason
      })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to cancel shift')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async restoreShift(id: number): Promise<any> {
    try {
      const response = await api.post(`/doctor-shifts/${id}/restore`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to restore shift')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getReschedulePreview(id: number): Promise<any> {
    try {
      const response = await api.get(`/doctor-shifts/${id}/reschedule-preview`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to get preview')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getDoctorsByDate(
    workDate: string,
    specialtyId?: number
  ): Promise<DoctorWithShifts[]> {
    try {
      const params = new URLSearchParams()
      params.append('workDate', workDate)
      if (specialtyId) {
        params.append('specialtyId', specialtyId.toString())
      }

      console.log(' Calling getDoctorsByDate with:', { workDate, specialtyId })

      const response = await api.get(
        `/doctor-shifts/doctors-by-date?${params.toString()}`
      )
      
      console.log(' getDoctorsByDate response:', response.data)
      
      if (response.data.success) {
        console.log(` Found ${response.data.data?.length || 0} doctors`)
        return response.data.data || []
      }
      console.warn('️ API returned success=false')
      return []
    } catch (error: any) {
      console.error(' Error in getDoctorsByDate:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      return []
    }
  }
}
