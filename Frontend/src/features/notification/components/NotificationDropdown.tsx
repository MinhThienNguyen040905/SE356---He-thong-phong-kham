"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Button } from "../../../components/ui/button"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type Notification,
} from "../services/notification.service"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
  CheckCheck,
  Trash2,
  Calendar,
  AlertCircle,
  Info,
  X,
  Bell,
} from "lucide-react"
import { cn } from "../../../lib/utils"

interface NotificationDropdownProps {
  onAction?: () => void
  onClose?: () => void
}

export default function NotificationDropdown({
  onAction,
  onClose,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  
  const fetchNotifications = async (pageNum: number = 1) => {
    try {
      setIsLoading(true)
      const response = await getNotifications(pageNum, 10)
      if (response.success) {
        if (pageNum === 1) {
          setNotifications(response.data)
        } else {
          setNotifications((prev) => [...prev, ...response.data])
        }
        setHasMore(
          response.pagination.page < response.pagination.totalPages
        )
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải thông báo"
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(1)
  }, [])

  
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId)
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
      onAction?.()
      toast.success("Đã đánh dấu đã đọc")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể đánh dấu đã đọc"
      )
    }
  }

  
  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true)
      const count = await markAllAsRead()
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      )
      onAction?.()
      toast.success(`Đã đánh dấu ${count} thông báo đã đọc`)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể đánh dấu tất cả đã đọc"
      )
    } finally {
      setIsMarkingAll(false)
    }
  }

  
  const handleDelete = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      onAction?.()
      toast.success("Đã xóa thông báo")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể xóa thông báo"
      )
    }
  }

  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT_CREATED":
      case "APPOINTMENT_CANCELLED":
      case "DOCTOR_CHANGED":
        return <Calendar className="h-4 w-4" />
      case "SYSTEM":
        return <Info className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
      })
    } catch {
      return ""
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="flex flex-col h-[500px]">
      {}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-lg">Thông báo</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {}
      <ScrollArea className="flex-1">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Bell className="h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">Không có thông báo</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-gray-50 transition-colors",
                  !notification.isRead && "bg-blue-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-1 p-2 rounded-full",
                      !notification.isRead
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-semibold text-sm mb-1",
                            !notification.isRead && "text-gray-900"
                          )}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs h-7"
                        >
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-xs h-7 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {}
      {hasMore && !isLoading && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              const nextPage = page + 1
              setPage(nextPage)
              fetchNotifications(nextPage)
            }}
          >
            Xem thêm
          </Button>
        </div>
      )}
    </div>
  )
}
