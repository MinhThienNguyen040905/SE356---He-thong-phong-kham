import api from '../../../lib/api'

export interface ShiftTemplate {
  id: number
  doctorId: number
  shiftId: number
  dayOfWeek: number 
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
  doctor?: {
    id: number
    user: {
      id: number
      fullName: string
      email: string
      phone?: string
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
}

export interface CreateShiftTemplateData {
  doctorId: number
  shiftId: number
  dayOfWeek: number
  notes?: string
}

export interface UpdateShiftTemplateData {
  dayOfWeek?: number
  isActive?: boolean
  notes?: string
}

export interface ShiftTemplateFilters {
  doctorId?: number
  shiftId?: number
  dayOfWeek?: number
  isActive?: boolean
}


export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
  7: 'Chủ nhật',
}

export const DAY_OF_WEEK_LABELS_SHORT: Record<number, string> = {
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
  7: 'CN',
}

export class ShiftTemplateService {
  
  static async getTemplates(filters?: ShiftTemplateFilters): Promise<ShiftTemplate[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.doctorId) params.append('doctorId', filters.doctorId.toString())
      if (filters?.shiftId) params.append('shiftId', filters.shiftId.toString())
      if (filters?.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek.toString())
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

      const queryString = params.toString()
      const url = queryString ? `/shift-templates?${queryString}` : '/shift-templates'
      
      const response = await api.get(url)
      if (response.data.success) {
        return response.data.data || []
      }
      console.error('API returned success: false', response.data)
      throw new Error(response.data.message || 'Lỗi không xác định từ server')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      console.error('Error fetching shift templates:', error)
      throw error 
    }
  }

  
  static async getTemplateById(id: number): Promise<ShiftTemplate> {
    try {
      const response = await api.get(`/shift-templates/${id}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch template')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async createTemplate(data: CreateShiftTemplateData): Promise<ShiftTemplate> {
    try {
      const response = await api.post('/shift-templates', data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to create template')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async updateTemplate(id: number, data: UpdateShiftTemplateData): Promise<ShiftTemplate> {
    try {
      const response = await api.put(`/shift-templates/${id}`, data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to update template')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async deleteTemplate(id: number): Promise<void> {
    try {
      const response = await api.delete(`/shift-templates/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete template')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async toggleTemplateStatus(id: number, isActive: boolean): Promise<ShiftTemplate> {
    return this.updateTemplate(id, { isActive })
  }

  
  static groupTemplatesByDay(templates: ShiftTemplate[]): Record<number, ShiftTemplate[]> {
    const grouped: Record<number, ShiftTemplate[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
    }
    
    templates.forEach(template => {
      if (grouped[template.dayOfWeek]) {
        grouped[template.dayOfWeek].push(template)
      }
    })
    
    return grouped
  }

  
  static groupTemplatesByDoctor(templates: ShiftTemplate[]): Record<number, ShiftTemplate[]> {
    const grouped: Record<number, ShiftTemplate[]> = {}
    
    templates.forEach(template => {
      if (!grouped[template.doctorId]) {
        grouped[template.doctorId] = []
      }
      grouped[template.doctorId].push(template)
    })
    
    return grouped
  }
}
