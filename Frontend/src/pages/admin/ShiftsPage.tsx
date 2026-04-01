"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Calendar as CalendarIcon,
  Save,
  Users,
  Briefcase,
  ChevronRight,
  ChevronLeft
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { ShiftService, type Shift, type ShiftSchedule } from "../../features/shift/services/shift.service"
import { format, addDays, startOfToday } from "date-fns"
import { vi } from "date-fns/locale"

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftSchedule, setShiftSchedule] = useState<ShiftSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("list")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
  })

  
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("")

  const filteredSchedule = useMemo(() => {
    if (!scheduleSearchQuery.trim()) return shiftSchedule
    
    return shiftSchedule.map(day => ({
      ...day,
      shifts: day.shifts.map(shiftItem => ({
        ...shiftItem,
        doctors: shiftItem.doctors.filter(d => 
          d.fullName.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) ||
          d.doctorCode.toLowerCase().includes(scheduleSearchQuery.toLowerCase())
        )
      })).filter(shiftItem => shiftItem.doctors.length > 0)
    })).filter(day => day.shifts.length > 0)
  }, [shiftSchedule, scheduleSearchQuery])

  useEffect(() => {
    fetchShifts()
    fetchShiftSchedule()
  }, [])

  const fetchShifts = async () => {
    try {
      setIsLoading(true)
      const data = await ShiftService.getShifts()
      setShifts(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách ca trực")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShiftSchedule = async () => {
    try {
      setIsLoadingSchedule(true)
      const today = startOfToday()
      const nextWeek = addDays(today, 7)

      const data = await ShiftService.getShiftSchedule({
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(nextWeek, "yyyy-MM-dd"),
      })
      setShiftSchedule(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        
        console.warn("Failed to fetch shift schedule:", error)
      }
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: "", startTime: "", endTime: "", description: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift)
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift)
    setIsDeleteDialogOpen(true)
  }

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên ca trực")
      return
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc")
      return
    }

    try {
      setIsCreating(true)
      await ShiftService.createShift({
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim() || undefined,
      })

      toast.success("Tạo ca trực thành công!")
      setIsCreateDialogOpen(false)
      setFormData({ name: "", startTime: "", endTime: "", description: "" })
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo ca trực")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedShift || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên ca trực")
      return
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc")
      return
    }

    try {
      setIsUpdating(true)
      await ShiftService.updateShift(selectedShift.id, {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim() || undefined,
      })

      toast.success("Cập nhật ca trực thành công!")
      setIsEditDialogOpen(false)
      setSelectedShift(null)
      setFormData({ name: "", startTime: "", endTime: "", description: "" })
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật ca trực")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedShift) return

    try {
      setIsDeleting(true)
      await ShiftService.deleteShift(selectedShift.id)

      toast.success("Xóa ca trực thành công!")
      setIsDeleteDialogOpen(false)
      setSelectedShift(null)
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa ca trực")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredShifts = shifts.filter((shift) =>
    shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.startTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.endTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shift.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredShifts.length / itemsPerPage)
  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":")
      return `${hours}:${minutes}`
    } catch {
      return time
    }
  }

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          
          {}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-100/50">
            <div className="flex items-start gap-4">
              <div className="hidden lg:flex p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-violet-600 to-blue-600">
                  Quản lý Ca Trực
                </h1>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                  Thiết lập thời gian làm việc và xem lịch phân công
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium shadow-sm"
                onClick={() => {
                  setActiveTab("schedule")
                  fetchShiftSchedule()
                }}
              >
                <CalendarIcon className="h-4 w-4 mr-2 text-indigo-600" />
                Xem lịch trực
              </Button>
              <Button 
                onClick={handleCreate}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 border-0 font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm ca trực
              </Button>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-600"></div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Briefcase className="w-24 h-24 text-indigo-900" />
              </div>
              <CardContent className="p-6 pl-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Tổng ca trực</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{shifts.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Users className="w-24 h-24 text-blue-900" />
              </div>
              <CardContent className="p-6 pl-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">Nhân sự phân công</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {shiftSchedule.reduce((acc, curr) => 
                        acc + curr.shifts.reduce((sAcc, s) => sAcc + s.doctors.length, 0)
                      , 0)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500"></div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <Clock className="w-24 h-24 text-emerald-900" />
              </div>
              <CardContent className="p-6 pl-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Ca đang hoạt động</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                       --
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white/50 backdrop-blur border border-indigo-100 p-1 rounded-xl shadow-sm h-auto">
                <TabsTrigger 
                  value="list"
                  className="rounded-lg px-6 py-2.5 font-bold text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-indigo-500/30 text-slate-600 hover:text-indigo-600 transition-all"
                >
                  Danh sách ca trực
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule"
                  className="rounded-lg px-6 py-2.5 font-bold text-sm data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg shadow-indigo-500/30 text-slate-600 hover:text-indigo-600 transition-all"
                >
                  Lịch trực
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
              <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg font-semibold text-slate-900">Tất cả ca trực</CardTitle>
                    <CardDescription>Quản lý các khung giờ làm việc của hệ thống</CardDescription>
                  </div>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm theo tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : filteredShifts.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50">
                      <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900">Không tìm thấy ca trực</h3>
                      <p className="text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc tạo ca trực mới</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-indigo-50/30 border-y border-indigo-100/50">
                        <TableRow>
                          <TableHead className="w-[100px] pl-6 font-bold uppercase text-[11px] tracking-widest text-indigo-900/50">ID</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-indigo-900/50">Tên ca trực</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-indigo-900/50">Thời gian</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-indigo-900/50">Mô tả</TableHead>
                          <TableHead className="text-right pr-6 font-bold uppercase text-[11px] tracking-widest text-indigo-900/50">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedShifts.map((shift) => (
                          <TableRow key={shift.id} className="group hover:bg-indigo-50/30 transition-colors border-indigo-50">
                            <TableCell className="pl-6 font-mono text-xs text-slate-400 font-bold">#{shift.id}</TableCell>
                            <TableCell>
                              <div className="font-bold text-slate-900">{shift.name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 font-bold font-mono text-[10px]">
                                  {formatTime(shift.startTime)}
                                </Badge>
                                <span className="text-slate-300">→</span>
                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 font-bold font-mono text-[10px]">
                                  {formatTime(shift.endTime)}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-slate-600 text-sm font-medium line-clamp-1">
                                {shift.description || <span className="text-slate-300 italic text-xs">Không có mô tả</span>}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  onClick={() => handleEdit(shift)}
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  onClick={() => handleDelete(shift)}
                                  title="Xóa ca trực"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>

                {}
                {filteredShifts.length > 0 && (
                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                        Trang <span className="text-slate-900 font-bold">{currentPage}</span> / {totalPages}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "ghost"}
                              size="sm"
                              className={`h-8 w-8 p-0 rounded-lg font-bold text-xs transition-colors ${
                                currentPage === page 
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700" 
                                  : "text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200"
                              }`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        }
                        if (
                          (page === 2 && currentPage > 3) || 
                          (page === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return <span key={page} className="px-1 text-slate-400 font-bold text-[10px]">...</span>;
                        }
                        return null;
                      })}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="m-0 focus-visible:ring-0 focus-visible:outline-none">
              <div className="grid gap-6">
                <Card className="border-0 shadow-sm bg-white">
                  <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">Lịch trực trong tuần</CardTitle>
                      <CardDescription>Xem danh sách bác sĩ được phân công theo ca</CardDescription>
                    </div>
                    <div className="relative w-full md:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Tìm kiếm bác sĩ..." 
                        value={scheduleSearchQuery}
                        onChange={(e) => setScheduleSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSchedule ? (
                      <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      </div>
                    ) : filteredSchedule.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">Chưa có lịch trực</h3>
                        <p className="text-slate-500 mt-1">Hiện tại không có lịch trực nào được sắp xếp trong 7 ngày tới</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredSchedule.map((schedule) => (
                          <div key={schedule.date} className="group">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                                <span className="text-xs font-medium uppercase tracking-wider">
                                  {format(new Date(schedule.date), "EEE", { locale: vi })}
                                </span>
                                <span className="text-xl font-bold">
                                  {format(new Date(schedule.date), "dd")}
                                </span>
                              </div>
                              <div className="h-px flex-1 bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
                              <span className="text-sm font-medium text-slate-500 bg-white pl-2">
                                {format(new Date(schedule.date), "MMMM yyyy", { locale: vi })}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-[4.5rem]">
                              {schedule.shifts.map((shiftItem, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex flex-col p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all bg-white"
                                >
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                                    <h4 className="font-semibold text-slate-900">{shiftItem.shift.name}</h4>
                                    <Badge variant="outline" className="bg-slate-50 font-mono text-xs">
                                      {formatTime(shiftItem.shift.startTime)} - {formatTime(shiftItem.shift.endTime)}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex-1 space-y-2">
                                    {shiftItem.doctors.length > 0 ? (
                                      <div className="space-y-2">
                                        {shiftItem.doctors.map((doctor) => (
                                          <div key={doctor.id} className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                                              {doctor.fullName.charAt(0)}
                                            </div>
                                            <div>
                                              <p className="font-medium text-slate-900">{doctor.fullName}</p>
                                              <p className="text-xs text-slate-500">#{doctor.doctorCode}</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center py-4 text-slate-400 gap-2">
                                        <Users className="w-8 h-8 opacity-20" />
                                        <p className="text-sm italic">Chưa có bác sĩ</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                                    <span>{shiftItem.doctors.length} bác sĩ</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm ca trực mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chi tiết để tạo ca làm việc mới
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Tên ca trực <span className="text-red-500">*</span></Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Ca sáng, Ca chiều..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-start-time">Bắt đầu <span className="text-red-500">*</span></Label>
                    <Input
                      id="create-start-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="create-end-time">Kết thúc <span className="text-red-500">*</span></Label>
                    <Input
                      id="create-end-time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Mô tả</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ghi chú thêm về ca trực này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Hủy bỏ
                </Button>
                <Button onClick={handleCreateSubmit} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu ca trực
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Chỉnh sửa ca trực</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho ca trực {selectedShift?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên ca trực <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Ca sáng, Ca chiều..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-time">Bắt đầu <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-time">Kết thúc <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-end-time"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ghi chú thêm về ca trực này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Hủy bỏ
                </Button>
                <Button onClick={handleUpdateSubmit} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-center">Xóa ca trực</DialogTitle>
                <DialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa ca trực <span className="font-semibold text-slate-900">"{selectedShift?.name}"</span>? 
                  <br/>Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa vĩnh viễn"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </AdminSidebar>
  )
}
