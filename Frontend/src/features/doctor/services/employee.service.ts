import api from '../../../lib/api'
import type { User } from '../../auth/services/user.service'

export interface Employee {
  id: number
  employeeCode: string
  userId: number
  specialtyId?: number | null
  position?: string
  degree?: string
  description?: string
  joiningDate?: string
  phone?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth?: string
  address?: string
  cccd?: string
  avatar?: string
  expertise?: string
  isActive: boolean
  user: User
  specialty?: {
    id: number
    name: string
  }
}

export interface UpdateEmployeeData {
  position?: string
  degree?: string
  specialtyId?: number | null
  description?: string
  joiningDate?: string
  phone?: string
  gender?: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth?: string
  address?: string
  cccd?: string
  avatar?: string
  expertise?: string
  isActive?: boolean
}

export class EmployeeService {
  static async getEmployees(params?: {
    search?: string
    roleId?: number
    specialtyId?: number
    page?: number
    limit?: number
  }): Promise<{ employees: Employee[], pagination: any }> {
    const response = await api.get('/employees', { params })
    return {
      employees: response.data.data,
      pagination: response.data.pagination
    }
  }

  static async getEmployeeById(id: number): Promise<Employee> {
    const response = await api.get(`/employees/${id}`)
    return response.data.data
  }

  static async updateEmployee(id: number, data: UpdateEmployeeData): Promise<Employee> {
    const response = await api.put(`/employees/${id}`, data)
    return response.data.data
  }

  static async deleteEmployee(id: number): Promise<void> {
    await api.delete(`/employees/${id}`)
  }

  static async uploadAvatar(id: number, file: File): Promise<{ avatar: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await api.put(`/employees/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }
}
