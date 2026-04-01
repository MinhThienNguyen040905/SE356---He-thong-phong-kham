import api from '../../../lib/api'

export interface Permission {
  id: number
  name: string
  module: string
  action: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Module {
  id: string
  name: string
  permissions: Permission[]
}

export interface RolePermission {
  roleId: number
  roleName: string
  permissions: Permission[]
}

export interface CreatePermissionData {
  name: string
  module: string
  action: string
  description?: string
}

export interface AssignPermissionData {
  permissionIds: number[]
}

export class PermissionService {
  
  static async getPermissions(): Promise<Permission[]> {
    try {
      const response = await api.get('/permissions')
      if (response.data.success) {
        const data = response.data.data
        return Array.isArray(data) ? data : []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getModules(): Promise<Module[]> {
    try {
      const response = await api.get('/permissions/modules')
      if (response.data.success) {
        const data = response.data.data
        if (Array.isArray(data)) {
          return data.map((m: any) => ({
            ...m,
            permissions: Array.isArray(m.permissions) ? m.permissions : []
          }))
        }
        return []
      }
      return []
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getRolePermissions(roleId: number): Promise<RolePermission> {
    try {
      const response = await api.get(`/permissions/role/${roleId}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch role permissions')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async assignPermissionsToRole(
    roleId: number,
    data: AssignPermissionData
  ): Promise<void> {
    try {
      const response = await api.post(`/permissions/role/${roleId}/assign`, data)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to assign permissions')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async createPermission(data: CreatePermissionData): Promise<Permission> {
    try {
      const response = await api.post('/permissions', data)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to create permission')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async deletePermission(id: number): Promise<void> {
    try {
      const response = await api.delete(`/permissions/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete permission')
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
