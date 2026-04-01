"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Save,
  LayoutGrid,
  List,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import {
  ShiftTemplateService,
  type ShiftTemplate,
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_LABELS_SHORT,
} from "../../features/shift/services/shiftTemplate.service"
import { ShiftService, type Shift } from "../../features/shift/services/shift.service"
import api from "../../lib/api"


interface Doctor {
  id: number
  user: {
    id: number
    fullName: string
    email: string
  }
  specialty?: {
    id: number
    name: string
  }
}

export default function ShiftTemplatesPage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDayOfWeek, setFilterDayOfWeek] = useState<string>("all")
  const [filterDoctor, setFilterDoctor] = useState<string>("all")
  const [filterShift, setFilterShift] = useState<string>("all")
  const [filterActive, setFilterActive] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  const [formData, setFormData] = useState({
    doctorId: "",
    shiftId: "",
    dayOfWeek: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchTemplates(), fetchShifts(), fetchDoctors()])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const data = await ShiftTemplateService.getTemplates()
      console.log("FETCHED TEMPLATES:", data)
      setTemplates(data)
    } catch (error: any) {
      console.error("FETCH ERROR:", error)
      toast.error(error.message || "Không thể tải danh sách mẫu ca trực")
    }
  }

  const fetchShifts = async () => {
    try {
      const data = await ShiftService.getShifts()
      setShifts(data)
    } catch (error: any) {
      console.error("Error fetching shifts:", error)
    }
  }

  const fetchDoctors = async () => {
    try {
      setIsLoadingDoctors(true)
      const response = await api.get("/doctors")
      if (response.data.success) {
        setDoctors(response.data.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching doctors:", error)
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleCreate = () => {
    setFormData({ doctorId: "", shiftId: "", dayOfWeek: "", notes: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (template: ShiftTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      doctorId: template.doctorId.toString(),
      shiftId: template.shiftId.toString(),
      dayOfWeek: template.dayOfWeek.toString(),
      notes: template.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (template: ShiftTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (template: ShiftTemplate) => {
    try {
      await ShiftTemplateService.toggleTemplateStatus(template.id, !template.isActive)
      toast.success(
        template.isActive ? "Đã tắt mẫu ca trực" : "Đã kích hoạt mẫu ca trực"
      )
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái")
    }
  }

  const handleCreateSubmit = async () => {
    if (!formData.doctorId || !formData.shiftId || !formData.dayOfWeek) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.createTemplate({
        doctorId: parseInt(formData.doctorId),
        shiftId: parseInt(formData.shiftId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        notes: formData.notes || undefined,
      })

      toast.success("Tạo mẫu ca trực thành công!")
      setIsCreateDialogOpen(false)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể tạo mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedTemplate || !formData.dayOfWeek) {
      toast.error("Vui lòng chọn ngày trong tuần")
      return
    }

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.updateTemplate(selectedTemplate.id, {
        dayOfWeek: parseInt(formData.dayOfWeek),
        notes: formData.notes || undefined,
      })

      toast.success("Cập nhật mẫu ca trực thành công!")
      setIsEditDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể cập nhật mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedTemplate) return

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.deleteTemplate(selectedTemplate.id)

      toast.success("Xóa mẫu ca trực thành công!")
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể xóa mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  
  const filteredTemplates = templates.filter((template) => {
    
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      template.doctor?.user?.fullName?.toLowerCase().includes(searchLower) ||
      template.shift?.name?.toLowerCase().includes(searchLower) ||
      template.notes?.toLowerCase().includes(searchLower)

    
    const matchesDay =
      filterDayOfWeek === "all" || template.dayOfWeek === parseInt(filterDayOfWeek)

    
    const matchesDoctor =
      filterDoctor === "all" || template.doctorId === parseInt(filterDoctor)

    
    const matchesShift =
      filterShift === "all" || template.shiftId === parseInt(filterShift)

    
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && template.isActive) ||
      (filterActive === "inactive" && !template.isActive)

    return matchesSearch && matchesDay && matchesDoctor && matchesShift && matchesActive
  })

  
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterDayOfWeek, filterDoctor, filterShift, filterActive, viewMode])

  
  
  const templatesByDay = ShiftTemplateService.groupTemplatesByDay(filteredTemplates)

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":")
      return `${hours}:${minutes}`
    } catch {
      return time
    }
  }

  
  const totalTemplates = templates.length
  const activeTemplates = templates.filter((t) => t.isActive).length
  const uniqueDoctors = new Set(templates.map((t) => t.doctorId)).size

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Mẫu Ca Trực
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  Thiết lập lịch trực mẫu cho bác sĩ theo ngày trong tuần.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50"
                onClick={fetchData}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Làm mới
              </Button>
              <Button
                onClick={handleCreate}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-lg font-bold text-xs px-4 shadow-md shadow-indigo-100"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Thêm mẫu ca
              </Button>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-indigo-200 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng mẫu ca</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">{totalTemplates}</h3>
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Templates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-emerald-200 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đang hoạt động</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">{activeTemplates}</h3>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-blue-200 transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bác sĩ có mẫu</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">{uniqueDoctors}</h3>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Doctors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-2 border border-slate-100 shadow-sm mb-6">
            <div className="flex flex-col xl:flex-row gap-3">
              {}
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  placeholder="Tìm kiếm bác sĩ, ca trực, ghi chú..."
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterDayOfWeek} onValueChange={setFilterDayOfWeek}>
                  <SelectTrigger className="w-[140px] h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Thứ" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả ngày</SelectItem>
                    {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger className="w-[180px] h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Bác sĩ" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.user?.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterShift} onValueChange={setFilterShift}>
                  <SelectTrigger className="w-[140px] h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Ca trực" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả ca</SelectItem>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id.toString()}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger className="w-[150px] h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl text-sm font-medium">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Đã tắt</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-9 w-9 p-0 rounded-lg transition-all ${
                      viewMode === "grid" 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-9 w-9 p-0 rounded-lg transition-all ${
                      viewMode === "list" 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-20">
                <div className="text-center">
                  <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Chưa có mẫu ca trực nào
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Tạo mẫu ca trực để thiết lập lịch làm việc mặc định cho bác sĩ theo từng ngày trong tuần
                  </p>
                  <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mẫu ca đầu tiên
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(templatesByDay).map(([day, dayTemplates]) => (
                <Card
                  key={day}
                  className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    dayTemplates.length > 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            parseInt(day) === 7
                              ? "bg-gradient-to-br from-red-100 to-red-50 text-red-600"
                              : "bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600"
                          }`}
                        >
                          {DAY_OF_WEEK_LABELS_SHORT[parseInt(day)]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {DAY_OF_WEEK_LABELS[parseInt(day)]}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {dayTemplates.length} mẫu ca
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {dayTemplates.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có mẫu ca</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 ${
                              template.isActive 
                                ? "bg-white border-slate-100 hover:border-indigo-200" 
                                : "bg-slate-50/50 border-slate-100 opacity-75 grayscale-[0.5]"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-110 duration-300 ${
                                  template.isActive 
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "bg-slate-200 text-slate-500"
                                }`}>
                                  {template.doctor?.user?.fullName?.charAt(0) || "?"}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 truncate text-sm leading-tight">
                                    {template.doctor?.user?.fullName || "N/A"}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                    {template.doctor?.specialty?.name || "BS. Đa khoa"}
                                  </p>
                                </div>
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 text-slate-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
                                  <DropdownMenuItem onClick={() => handleEdit(template)} className="rounded-lg text-xs font-semibold py-2">
                                    <Edit className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleActive(template)} className="rounded-lg text-xs font-semibold py-2">
                                    {template.isActive ? (
                                      <>
                                        <ToggleLeft className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                        Tạm dừng mẫu
                                      </>
                                    ) : (
                                      <>
                                        <ToggleRight className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                        Kích hoạt mẫu
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(template)}
                                    className="rounded-lg text-xs font-semibold py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Xóa mẫu ca
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Badge
                                variant="secondary"
                                className={`w-fit justify-center py-1.5 px-3 border-0 font-bold font-mono text-[10px] rounded-lg transition-colors ${
                                  template.isActive 
                                    ? "bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100" 
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {template.shift?.name} ({formatTime(template.shift?.startTime || "")} - {formatTime(template.shift?.endTime || "")})
                              </Badge>
                              
                              <div className="flex items-center justify-between mt-1">
                                {template.isActive ? (
                                  <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide ring-1 ring-emerald-100/50">
                                    <span className="h-1 w-1 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                                    ĐANG HOẠT ĐỘNG
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                                    <span className="h-1 w-1 rounded-full bg-slate-400 mr-2" />
                                    ĐÃ TẮT
                                  </Badge>
                                )}
                                <span className="text-[10px] font-bold text-slate-300">#{template.id}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            
            <div className="space-y-4">
              <Card className="border-0 shadow-sm bg-white overflow-hidden border border-slate-100 rounded-2xl">
                <Table>
                  <TableHeader className="bg-slate-50/50 border-y border-slate-100">
                    <TableRow>
                      <TableHead className="pl-6 font-bold uppercase text-[11px] tracking-widest text-slate-500">Bác sĩ</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Chuyên khoa</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Ca trực</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Ngày trực</TableHead>
                      <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Trạng thái</TableHead>
                      <TableHead className="text-right pr-6 font-bold uppercase text-[11px] tracking-widest text-slate-500">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTemplates.map((template) => (
                      <TableRow key={template.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold ring-1 ring-indigo-100">
                              {template.doctor?.user?.fullName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">
                                {template.doctor?.user?.fullName || "N/A"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">#{template.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 text-sm font-medium">
                            {template.doctor?.specialty?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0 font-bold font-mono text-[10px]">
                            {template.shift?.name} ({formatTime(template.shift?.startTime || "")} - {formatTime(template.shift?.endTime || "")})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`font-bold text-[10px] border-0 ${
                              template.dayOfWeek === 7
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {DAY_OF_WEEK_LABELS[template.dayOfWeek]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {template.isActive ? (
                            <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                              <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                              HOẠT ĐỘNG
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                              <span className="h-1 w-1 rounded-full bg-slate-400 mr-1.5" />
                              ĐÃ TẮT
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`h-8 w-8 p-0 transition-colors ${
                                template.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                              }`}
                              onClick={() => handleToggleActive(template)}
                            >
                              {template.isActive ? <ToggleLeft className="h-3.5 w-3.5" /> : <ToggleRight className="h-3.5 w-3.5" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              onClick={() => handleDelete(template)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {}
                {filteredTemplates.length > 0 && (
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
            </div>
          )}

          {}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Thêm mẫu ca trực
                </DialogTitle>
                <DialogDescription>
                  Tạo mẫu ca trực mới cho bác sĩ theo ngày trong tuần
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>
                    Bác sĩ <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDoctors ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.user?.fullName}</span>
                              {doctor.specialty && (
                                <span className="text-slate-400">({doctor.specialty.name})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ca trực <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.shiftId}
                    onValueChange={(value) => setFormData({ ...formData, shiftId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ca trực" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ngày trong tuần <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về mẫu ca này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu mẫu ca
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
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-indigo-600" />
                  Chỉnh sửa mẫu ca trực
                </DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho mẫu ca của{" "}
                  <span className="font-medium">
                    {selectedTemplate?.doctor?.user?.fullName}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {selectedTemplate?.doctor?.user?.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{selectedTemplate?.doctor?.user?.fullName}</p>
                      <p className="text-sm text-slate-500">
                        {selectedTemplate?.shift?.name} ({formatTime(selectedTemplate?.shift?.startTime || "")} -{" "}
                        {formatTime(selectedTemplate?.shift?.endTime || "")})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ngày trong tuần <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về mẫu ca này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleUpdateSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
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
                <DialogTitle className="text-center">Xóa mẫu ca trực</DialogTitle>
                <DialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa mẫu ca của{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedTemplate?.doctor?.user?.fullName}
                  </span>{" "}
                  vào{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedTemplate && DAY_OF_WEEK_LABELS[selectedTemplate.dayOfWeek]}
                  </span>
                  ?
                  <br />
                  Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
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
