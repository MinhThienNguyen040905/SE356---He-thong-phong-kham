import api from '../../../lib/api'

export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  todayAppointments: number
  todayPatients: number
  todayRevenue: number
  pendingAppointments: number
  completedAppointments: number
}

export interface DashboardOverview {
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
    targetMonth?: number
    performance?: number
    change: number
  }
  appointments: {
    today: number
    thisWeek: number
    thisMonth: number
    change: number
  }
  patients: {
    today: number
    thisWeek: number
    thisMonth: number
    change: number
  }
  medicationStock?: number
  medicationChange?: number
}

export interface AppointmentCalendar {
  date: string
  appointments: Array<{
    id: number
    patientName: string
    time: string
    status: string
    doctorName?: string
  }>
}

export interface RecentActivity {
  id: number
  type: 'appointment' | 'visit' | 'prescription' | 'invoice' | 'payment'
  description: string
  timestamp: string
  user?: {
    id: number
    fullName: string
    avatar?: string
  }
}

export interface QuickStats {
  lowStockMedicines: number
  expiringMedicines: number
  unpaidInvoices: number
  pendingAppointments: number
  todayVisits: number
}

export interface SystemAlert {
  id: number
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: string
  actionUrl?: string
}

export interface DashboardData {
  stats: DashboardStats
  overview: DashboardOverview
  recentActivities: RecentActivity[]
  quickStats: QuickStats
  alerts: SystemAlert[]
  charts?: {
    dailyRevenue: Array<{
      name: string
      date: string
      revenue: number
    }>
    todayStatusDistribution?: Array<{
      status: string
      count: number
    }>
    monthlyStatusDistribution?: Array<{
      status: string
      count: number
    }>
  }
}

export class DashboardService {
  
  static async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard stats')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getOverview(): Promise<DashboardOverview> {
    try {
      const response = await api.get('/dashboard/overview')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard overview')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getAppointmentsByDate(date: string): Promise<AppointmentCalendar> {
    try {
      const response = await api.get(`/dashboard/appointments/${date}`)
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch appointments')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get('/dashboard/recent-activities', {
        params: { limit }
      })
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch recent activities')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      
      return []
    }
  }

  
  static async getQuickStats(): Promise<QuickStats> {
    try {
      const response = await api.get('/dashboard/quick-stats')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch quick stats')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }

  
  static async getAlerts(): Promise<SystemAlert[]> {
    try {
      const response = await api.get('/dashboard/alerts')
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch alerts')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      
      return []
    }
  }

  
  static async getDashboardData(days: number = 7, month?: number, year?: number): Promise<DashboardData> {
    try {
      const response = await api.get('/dashboard', { 
        params: { days, month, year } 
      })
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch dashboard data')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
