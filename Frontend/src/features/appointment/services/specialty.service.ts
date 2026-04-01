import api from '../../../lib/api'

export interface Specialty {
  id: number
  name: string
  description?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Doctor {
  id: number
  doctorCode: string
  userId: number
  specialtyId: number
  position?: string
  degree?: string
  description?: string
  isActive?: boolean
  user?: {
    id: number
    fullName: string
    email: string
    avatar?: string
    isActive?: boolean
  }
}

export interface SpecialtyListResponse {
  specialties: Specialty[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class SpecialtyService {
  
  static async getSpecialties(params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
  }): Promise<SpecialtyListResponse> {
    try {
      const response = await api.get('/specialties', { params })
      if (response.data.success) {
        const data = response.data.data
        
        
        if (data && typeof data === 'object' && 'specialties' in data) {
          return {
            specialties: data.specialties,
            total: data.total || data.specialties.length,
            page: data.page || 1,
            limit: data.limit || 10,
            totalPages: data.totalPages || 1
          }
        }
        
        
        if (Array.isArray(data)) {
          return {
            specialties: data,
            total: data.length,
            page: 1,
            limit: data.length,
            totalPages: 1
          }
        }
      }
      return {
        specialties: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    } catch (error: any) {
      console.error("error getSpecialties", error)
      return {
        specialties: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  }

  
  static async getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]> {
    try {
      const response = await api.get(`/specialties/${specialtyId}/doctors`)
      
      if (response.data.success) {
        const data = response.data.data
        
        
        if (data && typeof data === 'object' && 'doctors' in data) {
          return Array.isArray(data.doctors) ? data.doctors : []
        }
        
        if (Array.isArray(data)) {
          return data
        }
        return []
      }
      return []
    } catch (error: any) {
      console.error(" Error in getDoctorsBySpecialty:", error)
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      
      return []
    }
  }
}
