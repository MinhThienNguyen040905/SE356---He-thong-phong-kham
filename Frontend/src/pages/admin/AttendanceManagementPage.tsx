"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { TablePagination } from "../../components/shared/TablePagination"
import { cn } from "../../lib/utils"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
  RotateCcw,
  Edit,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"
import { AttendanceService, type Attendance, AttendanceStatus } from "../../features/shift/services/attendance.service"
import { format } from "date-fns"

export default function AttendanceManagementPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterUserId, setFilterUserId] = useState<string>("")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")

  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [editData, setEditData] = useState({
    checkInTime: "",
    checkOutTime: "",
    status: "" as "" | AttendanceStatus,
    note: "",
  })

  useEffect(() => {
    fetchAttendances()
  }, [filterStatus, filterUserId, filterDateFrom, filterDateTo]) 


  const fetchAttendances = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        limit: 1000, 
      }

      if (filterStatus !== "all") {
        params.status = filterStatus
      }
      if (filterUserId) {
        params.userId = parseInt(filterUserId)
      }
      if (filterDateFrom) {
        params.startDate = filterDateFrom
      }
      if (filterDateTo) {
        params.endDate = filterDateTo
      }

      const response = await AttendanceService.getAllAttendance(params)
      setAttendances(response.attendances || [])
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách chấm công")
      setAttendances([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setEditData({
      checkInTime: attendance.checkInTime ? format(new Date(attendance.checkInTime), "yyyy-MM-dd'T'HH:mm") : "",
      checkOutTime: attendance.checkOutTime ? format(new Date(attendance.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "",
      status: attendance.status,
      note: attendance.note || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedAttendance) return

    try {
      await AttendanceService.updateAttendance(selectedAttendance.id, {
        checkInTime: editData.checkInTime || undefined,
        checkOutTime: editData.checkOutTime || undefined,
        status: editData.status || undefined,
        note: editData.note || undefined,
      })
      toast.success("Cập nhật chấm công thành công!")
      setIsEditDialogOpen(false)
      setSelectedAttendance(null)
      await fetchAttendances()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật chấm công")
    }
  }

  const handleAutoMark = async () => {
    const date = window.prompt("Nhập ngày muốn chạy tự động (YYYY-MM-DD), để trống để mặc định ngày hôm qua:")
    try {
      setIsLoading(true)
      const response = await AttendanceService.runAutoAbsence(date || undefined)
      toast.success(`Đã đánh dấu vắng mặt cho ${response.count} nhân viên.`)
      await fetchAttendances()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    const config: Record<AttendanceStatus, { label: string; bg: string; text: string; dot: string; blink?: boolean }> = {
      PRESENT: { 
        label: "CÓ MẶT", 
        bg: "bg-emerald-100/50", 
        text: "text-emerald-700", 
        dot: "bg-emerald-500" 
      },
      ABSENT: { 
        label: "VẮNG MẶT", 
        bg: "bg-rose-100/50", 
        text: "text-rose-700", 
        dot: "bg-rose-500" 
      },
      LATE: { 
        label: "ĐI MUỘN", 
        bg: "bg-amber-100/50", 
        text: "text-amber-700", 
        dot: "bg-amber-500",
        blink: true
      },
      LEAVE: { 
        label: "NGHỈ PHÉP", 
        bg: "bg-blue-100/50", 
        text: "text-blue-700", 
        dot: "bg-blue-500" 
      },
      SICK_LEAVE: { 
        label: "NGHỈ ỐM", 
        bg: "bg-purple-100/50", 
        text: "text-purple-700", 
        dot: "bg-purple-500" 
      },
      EARLY_LEAVE: { 
        label: "VỀ SỚM", 
        bg: "bg-orange-100/50", 
        text: "text-orange-700", 
        dot: "bg-orange-500" 
      },
      HALF_DAY: { 
        label: "NỬA NGÀY", 
        bg: "bg-slate-100/50", 
        text: "text-slate-700", 
        dot: "bg-slate-500" 
      },
    }
    const info = config[status] || { label: status, bg: "bg-gray-100/50", text: "text-gray-700", dot: "bg-gray-500" }
    
    return (
      <Badge className={`${info.bg} ${info.text} border-transparent text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide ring-1 ring-white/20`}>
        <span className={`h-1 w-1 rounded-full ${info.dot} mr-1.5 ${info.blink ? 'animate-pulse' : ''}`} />
        {info.label}
      </Badge>
    )
  }

  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch =
      attendance.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendance.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })
  
  
  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage)
  const paginatedAttendances = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterUserId, filterDateFrom, filterDateTo]);

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Chấm công</h1>
              <p className="text-slate-500 text-sm font-medium">Theo dõi và cập nhật thời gian làm việc nhân sự</p>
            </div>
          </div>
          <Button 
            onClick={handleAutoMark} 
            variant="outline"
            className="border-rose-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold rounded-xl h-11"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Tự động đánh dấu vắng
          </Button>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Tổng bản ghi", 
              value: attendances.length, 
              icon: Calendar, 
              color: "text-indigo-600", 
              bg: "bg-indigo-50", 
              filter: "all",
              border: "hover:border-indigo-200"
            },
            { 
              label: "Có mặt", 
              value: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length, 
              icon: CheckCircle, 
              color: "text-emerald-600", 
              bg: "bg-emerald-50", 
              filter: "PRESENT",
              border: "hover:border-emerald-200"
            },
            { 
              label: "Vắng mặt", 
              value: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length, 
              icon: XCircle, 
              color: "text-rose-600", 
              bg: "bg-rose-50", 
              filter: "ABSENT",
              border: "hover:border-rose-200"
            },
            { 
              label: "Đi muộn", 
              value: attendances.filter(a => a.status === AttendanceStatus.LATE).length, 
              icon: Clock, 
              color: "text-amber-600", 
              bg: "bg-amber-50", 
              filter: "LATE",
              border: "hover:border-amber-200"
            }
          ].map((stat, index) => (
            <Card 
              key={index} 
              onClick={() => {
                setFilterStatus(stat.filter)
                setCurrentPage(1)
              }}
              className={cn(
                "border shadow-sm rounded-xl transition-all cursor-pointer group relative overflow-hidden",
                stat.border,
                filterStatus === stat.filter 
                  ? "ring-2 ring-indigo-500/20 border-indigo-500 bg-indigo-50/10" 
                  : "border-slate-100 bg-white hover:shadow-md"
              )}
            >
              <CardContent className="p-5 flex items-center gap-4 relative z-10">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-700 transition-colors">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              </CardContent>
              {}
              <div className={cn(
                "absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity blur-2xl", 
                stat.bg.replace('/50', '') 
              )} />
            </Card>
          ))}
        </div>

        {}
        {}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-2 border border-slate-100 shadow-sm mb-6">
          <div className="flex flex-col xl:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <Input
                placeholder="Tìm kiếm nhân viên (Tên hoặc Email)..."
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                <div className="px-3 flex items-center gap-2 border-r border-slate-200 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ lọc</span>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-9 border-none bg-transparent focus:ring-0 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PRESENT"> Có mặt</SelectItem>
                    <SelectItem value="ABSENT"> Vắng mặt</SelectItem>
                    <SelectItem value="LATE">⏰ Đi muộn</SelectItem>
                    <SelectItem value="LEAVE"> Nghỉ phép</SelectItem>
                    <SelectItem value="HALF_DAY"> Nửa ngày</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <Input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => {
                      setFilterDateFrom(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-8 border-none bg-transparent text-[10px] font-bold text-slate-600 focus:ring-0 w-[110px] uppercase"
                  />
                  <span className="text-slate-300">→</span>
                  <Input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => {
                      setFilterDateTo(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-8 border-none bg-transparent text-[10px] font-bold text-slate-600 focus:ring-0 w-[110px] uppercase"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 rounded-xl hover:bg-slate-50 text-slate-400"
                onClick={() => {
                  setFilterStatus("all")
                  setFilterUserId("")
                  setFilterDateFrom("")
                  setFilterDateTo("")
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {}
        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50">
                <div className="bg-white rounded-2xl p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm ring-1 ring-slate-100">
                    <Calendar className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Không có bản ghi</h3>
                <p className="text-slate-500 text-sm mt-1">Không tìm thấy dữ liệu chấm công cho điều kiện này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-y border-slate-100">
                    <tr>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Nhân viên</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Ngày làm việc</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Check-in</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Check-out</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Trạng thái</th>
                      <th className="py-4 px-6 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedAttendances.map((attendance) => (
                      <tr
                        key={attendance.id}
                        className="group hover:bg-indigo-50/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden shrink-0 ring-1 ring-slate-100 group-hover:ring-indigo-100 transition-all">
                              {attendance.user?.avatar ? (
                                <img 
                                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${attendance.user.avatar}`} 
                                  alt={attendance.user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold">{attendance.user?.fullName?.charAt(0) || "NV"}</span>
                              )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{attendance.user?.fullName || "N/A"}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight group-hover:text-indigo-400">{attendance.user?.role || "Nhân viên"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-600">
                               {format(new Date(attendance.date), "dd/MM/yyyy")}
                             </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {attendance.checkInTime ? (
                            <div className="flex flex-col">
                              <span className="text-sm font-mono font-bold text-slate-700">
                                {format(new Date(attendance.checkInTime), "HH:mm:ss")}
                              </span>
                              <span className="text-[9px] font-bold text-emerald-500 uppercase">On Time</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {attendance.checkOutTime ? (
                            <span className="text-sm font-mono font-bold text-slate-700">
                              {format(new Date(attendance.checkOutTime), "HH:mm:ss")}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-sm">—</span>
                          )}
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(attendance.status)}</td>
                        <td className="py-4 px-6 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-lg"
                            onClick={() => handleEdit(attendance)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {filteredAttendances.length > 0 && (
             <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showingCount={paginatedAttendances.length}
                totalCount={filteredAttendances.length}
                resourceName="bản ghi"
                className="border-t bg-white"
             />
          )}
        </Card>
      </div>

      {}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sửa chấm công</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chấm công cho nhân viên
            </DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="user">Nhân viên</Label>
                <Input
                  id="user"
                  value={selectedAttendance.user?.fullName || "N/A"}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="date">Ngày</Label>
                <Input
                  id="date"
                  value={format(new Date(selectedAttendance.date), "dd/MM/yyyy")}
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in</Label>
                  <Input
                    id="checkInTime"
                    type="datetime-local"
                    value={editData.checkInTime}
                    onChange={(e) => setEditData({ ...editData, checkInTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutTime">Check-out</Label>
                  <Input
                    id="checkOutTime"
                    type="datetime-local"
                    value={editData.checkOutTime}
                    onChange={(e) => setEditData({ ...editData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData({ ...editData, status: value as AttendanceStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Có mặt</SelectItem>
                    <SelectItem value="ABSENT">Vắng mặt</SelectItem>
                    <SelectItem value="LATE">Đi muộn</SelectItem>
                    <SelectItem value="LEAVE">Nghỉ phép</SelectItem>
                    <SelectItem value="HALF_DAY">Nửa ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Input
                  id="note"
                  value={editData.note}
                  onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                  placeholder="Ghi chú..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSidebar>
  )
}
