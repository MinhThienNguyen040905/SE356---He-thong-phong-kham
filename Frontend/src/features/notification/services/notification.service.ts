import api from "../../../lib/api"

export interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  relatedAppointmentId?: number | null
  isRead: boolean
  emailSent: boolean
  emailSentAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationListResponse {
  success: boolean
  data: Notification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UnreadCountResponse {
  success: boolean
  count: number
}


export const getNotifications = async (
  page: number = 1,
  limit: number = 10,
  isRead?: boolean
): Promise<NotificationListResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (isRead !== undefined) {
    params.append("isRead", isRead.toString())
  }

  const response = await api.get(`/notifications?${params.toString()}`)
  return response.data
}


export const getUnreadCount = async (): Promise<number> => {
  const response = await api.get<UnreadCountResponse>("/notifications/unread-count")
  return response.data.count
}


export const markAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`/notifications/${notificationId}/read`)
}


export const markAllAsRead = async (): Promise<number> => {
  const response = await api.put("/notifications/read-all")
  return response.data.count || 0
}


export const deleteNotification = async (notificationId: number): Promise<void> => {
  await api.delete(`/notifications/${notificationId}`)
}
