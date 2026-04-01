import { useState, useEffect } from "react"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  User,
  FileText,
  Calendar,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"
import { AuditService, type AuditLog } from "../../features/admin/services/audit.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

type EntityTypeFilter = "all" | "user" | "patient" | "doctor" | "appointment" | "visit" | "prescription" | "invoice" | "medicine"

export default function AuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<EntityTypeFilter>("all")
  const [userIdFilter, setUserIdFilter] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const itemsPerPage = 20

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      setError("")
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      
      if (searchQuery) {
        params.action = searchQuery
      }
      
      if (entityTypeFilter !== "all") {
        params.entityType = entityTypeFilter
      }
      
      if (userIdFilter) {
        params.userId = parseInt(userIdFilter)
      }
      
      const response = await AuditService.getAuditLogs(params)
      setLogs(response.logs)
      setTotalPages(response.totalPages)
    } catch (err: any) {
      if (err.response?.status === 429) {
        const errorMessage = "Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại."
        setError(errorMessage)
        toast.error(errorMessage)
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải nhật ký kiểm toán'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage, entityTypeFilter])

  useEffect(() => {
    setCurrentPage(1)
    const timeoutId = setTimeout(() => {
      fetchAuditLogs()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, userIdFilter])

  const getActionBadge = (action: string) => {
    const config: Record<string, { label: string; className: string }> = {
      CREATE: { label: "Tạo mới", className: "bg-green-100 text-green-800 border-green-200" },
      UPDATE: { label: "Cập nhật", className: "bg-blue-100 text-blue-800 border-blue-200" },
      DELETE: { label: "Xóa", className: "bg-red-100 text-red-800 border-red-200" },
      LOGIN: { label: "Đăng nhập", className: "bg-purple-100 text-purple-800 border-purple-200" },
      LOGOUT: { label: "Đăng xuất", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    const actionConfig = config[action] || { label: action, className: "bg-gray-100 text-gray-800 border-gray-200" }
    
    return (
      <Badge variant="outline" className={actionConfig.className}>
        {actionConfig.label}
      </Badge>
    )
  }

  const getEntityTypeLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      user: "Người dùng",
      patient: "Bệnh nhân",
      doctor: "Bác sĩ",
      appointment: "Lịch hẹn",
      visit: "Lần khám",
      prescription: "Đơn thuốc",
      invoice: "Hóa đơn",
      medicine: "Thuốc",
    }
    return labels[entityType] || entityType
  }

  if (loading && logs.length === 0) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải nhật ký kiểm toán...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Nhật ký kiểm toán</h1>
          
          {}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo hành động..."
                className="pl-10 h-12 text-base bg-white border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={entityTypeFilter} onValueChange={(value) => setEntityTypeFilter(value as EntityTypeFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Loại thực thể" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="patient">Bệnh nhân</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
                <SelectItem value="appointment">Lịch hẹn</SelectItem>
                <SelectItem value="visit">Lần khám</SelectItem>
                <SelectItem value="prescription">Đơn thuốc</SelectItem>
                <SelectItem value="invoice">Hóa đơn</SelectItem>
                <SelectItem value="medicine">Thuốc</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="User ID"
              type="number"
              className="w-[120px] h-12"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
            />
          </div>
        </div>

        {}
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            Hiển thị {logs.length} bản ghi
          </span>
        </div>

        {}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      THỜI GIAN
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      NGƯỜI DÙNG
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      HÀNH ĐỘNG
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      THỰC THỂ
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      CHI TIẾT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {format(new Date(log.timestamp), "dd/MM/yyyy", { locale: vi })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(log.timestamp), "HH:mm:ss", { locale: vi })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{log.user.fullName}</div>
                              <div className="text-xs text-gray-500">{log.user.email}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">User ID: {log.userId}</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {getEntityTypeLabel(log.entityType)}
                          </Badge>
                          {log.entityName && (
                            <div className="text-xs text-gray-500 mt-1">{log.entityName}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-600">
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div className="text-xs">
                              <FileText className="h-3 w-3 inline mr-1" />
                              {Object.keys(log.changes).length} thay đổi
                            </div>
                          )}
                          {log.ipAddress && (
                            <div className="text-xs text-gray-400 mt-1">IP: {log.ipAddress}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className={currentPage === page ? "bg-blue-600 text-white" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {}
        {!loading && logs.length === 0 && (
          <Card className="border-0 shadow-sm mt-6">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Không có nhật ký kiểm toán nào</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminSidebar>
  )
}
