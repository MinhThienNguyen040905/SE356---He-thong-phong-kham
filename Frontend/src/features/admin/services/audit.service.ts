import api from '../../../lib/api'

export interface AuditLog {
  id: number
  userId: number
  user?: {
    id: number
    fullName: string
    email: string
  }
  action: string
  entityType: string
  entityId: number
  entityName?: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface AuditLogListResponse {
  logs: AuditLog[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class AuditService {
  
  static async getAuditLogs(params?: {
    page?: number
    limit?: number
    userId?: number
    entityType?: string
    entityId?: number
    action?: string
    startDate?: string
    endDate?: string
  }): Promise<AuditLogListResponse> {
    try {
      const response = await api.get('/audit-logs', { params })
      if (response.data.success) {
        const data = response.data.data
        return {
          logs: Array.isArray(data?.logs) ? data.logs : [],
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 1,
        }
      }
      throw new Error(response.data.message || 'Failed to fetch audit logs')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getAuditLogsByUser(userId: number, params?: {
    page?: number
    limit?: number
  }): Promise<AuditLogListResponse> {
    try {
      const response = await api.get(`/audit-logs/user/${userId}`, { params })
      if (response.data.success) {
        const data = response.data.data
        return {
          logs: Array.isArray(data?.logs) ? data.logs : [],
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 1,
        }
      }
      throw new Error(response.data.message || 'Failed to fetch audit logs')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getAuditLogsByEntity(
    entityType: string,
    entityId: number,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<AuditLogListResponse> {
    try {
      const response = await api.get(`/audit-logs/entity/${entityType}/${entityId}`, { params })
      if (response.data.success) {
        const data = response.data.data
        return {
          logs: Array.isArray(data?.logs) ? data.logs : [],
          total: data?.total || 0,
          page: data?.page || 1,
          limit: data?.limit || 10,
          totalPages: data?.totalPages || 1,
        }
      }
      throw new Error(response.data.message || 'Failed to fetch audit logs')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
