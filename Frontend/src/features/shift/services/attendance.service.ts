import api from '../../../lib/api'

export const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE",
  LEAVE: "LEAVE",
  SICK_LEAVE: "SICK_LEAVE",
  EARLY_LEAVE: "EARLY_LEAVE",
  HALF_DAY: "HALF_DAY",
} as const

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus]

export interface Attendance {
  id: number
  userId: number
  user?: {
    id: number
    fullName: string
    email: string
    role?: string
    avatar?: string
  }
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  note?: string
  createdAt?: string
  updatedAt?: string
}

export interface LeaveRequest {
  startDate: string
  endDate: string
  reason: string
  type: string
}

export interface AttendanceListResponse {
  attendances: Attendance[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateAttendanceData {
  checkInTime?: string
  checkOutTime?: string
  status?: AttendanceStatus
  note?: string
}

export class AttendanceService {
  
  static async checkIn(): Promise<{ success: boolean; message?: string; data: Attendance }> {
    try {
      const response = await api.post('/attendance/check-in')
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to check in')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async checkOut(): Promise<{ success: boolean; message?: string; data: Attendance }> {
    try {
      const response = await api.post('/attendance/check-out')
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to check out')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getMyAttendance(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<AttendanceListResponse> {
    try {
      const response = await api.get('/attendance/my', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch attendance')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getAllAttendance(params?: {
    page?: number
    limit?: number
    userId?: number
    startDate?: string
    endDate?: string
    status?: AttendanceStatus
  }): Promise<AttendanceListResponse> {
    try {
      const response = await api.get('/attendance', { params })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch attendance')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async requestLeave(data: LeaveRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post('/attendance/leave-request', data)
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to request leave')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async updateAttendance(id: number, data: UpdateAttendanceData): Promise<{ success: boolean; message?: string; data: Attendance }> {
    try {
      const response = await api.put(`/attendance/${id}`, data)
      if (response.data.success) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update attendance')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async runAutoAbsence(date?: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const response = await api.post('/attendance/auto-absence', {}, { params: { date } })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể chạy tự động điểm danh vắng mặt')
    }
  }
}
