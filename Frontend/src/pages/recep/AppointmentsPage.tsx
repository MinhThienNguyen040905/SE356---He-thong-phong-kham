"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Search,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Loader2,
  Eye,
  XCircle,
  Plus,
  SlidersHorizontal,
  X,
  CheckCircle2,
  MoreVertical,
  CalendarDays,
  User,
  Activity
} from "lucide-react"
import { toast } from "sonner"
import {
  getAppointments,
  markNoShow,
  cancelAppointment,
  type Appointment,
} from "../../features/appointment/services/appointment.service"
import { checkInAppointment } from "../../features/appointment/services/visit.service"

import { Label } from "../../components/ui/label"
import { format } from "date-fns"

export default function ReceptionistAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState<number | null>(null)
  const [isMarkingNoShow, setIsMarkingNoShow] = useState<number | null>(null)

  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    status: "all" as "all" | "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    bookingType: "all" as "all" | "ONLINE" | "OFFLINE",
    bookedBy: "all" as "all" | "PATIENT" | "RECEPTIONIST",
    doctorId: "",
    patientId: "",
    shiftId: "",
    dateFrom: "",
    dateTo: "",
    createdFrom: "",
    createdTo: "",
  })

  
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  
  
  const [isNoShowDialogOpen, setIsNoShowDialogOpen] = useState(false)
  const [appointmentToMarkNoShow, setAppointmentToMarkNoShow] =
    useState<Appointment | null>(null)

  
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterDate) params.date = filterDate
      if (filterStatus !== "all") params.status = filterStatus

      const data = await getAppointments(params)
      setAppointments(data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách lịch hẹn"
      )
    } finally {
      setIsLoading(false)
    }
  }, [filterDate, filterStatus])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleCheckIn = async () => {
    if (!selectedAppointment) return

    setIsCheckingIn(selectedAppointment.id)
    try {
      await checkInAppointment(selectedAppointment.id)
      toast.success("Check-in thành công!")
      setIsCheckInDialogOpen(false)
      setSelectedAppointment(null)
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể check-in")
    } finally {
      setIsCheckingIn(null)
    }
  }

  const openCheckInDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCheckInDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      WAITING: { label: "Chờ checkin", className: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
      IN_PROGRESS: { label: "Đang khám", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Activity },
      COMPLETED: { label: "Đã khám", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
      CANCELLED: { label: "Đã hủy", className: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
      NO_SHOW: { label: "Không đến", className: "bg-slate-50 text-slate-700 border-slate-200", icon: User },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-slate-50 text-slate-700 border-slate-200",
      icon: Clock
    }

    const Icon = statusInfo.icon
    return (
      <Badge variant="outline" className={`py-1 px-2.5 flex items-center gap-1.5 font-bold rounded-lg ${statusInfo.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    )
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      // Note: Advanced search filters (date range, bookingType) are temporarily limited
      // Falling back to basic getAppointments
      const filters: any = { page: 1, limit: 100 }
      if (advancedFilters.status && advancedFilters.status !== "all") filters.status = advancedFilters.status
      if (advancedFilters.doctorId) filters.doctorId = parseInt(advancedFilters.doctorId)
      if (advancedFilters.dateFrom) filters.date = advancedFilters.dateFrom

      const data = await getAppointments(filters)
      setAppointments(data || [])
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${data?.length || 0} lịch hẹn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm lịch hẹn")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      fetchAppointments()
      return
    }

    try {
      setIsSearching(true)
      // Use standard fetch and let client-side filtering handle the keyword
      await fetchAppointments()
      toast.success(`Đã cập nhật dữ liệu`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm lịch hẹn")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      status: "all",
      bookingType: "all",
      bookedBy: "all",
      doctorId: "",
      patientId: "",
      shiftId: "",
      dateFrom: "",
      dateTo: "",
      createdFrom: "",
      createdTo: "",
    })
    fetchAppointments()
  }

  const filteredAppointments = appointments.filter((apt) => {
    const patientName = apt.patientName || apt.patient?.fullName || ""
    const patientCode = apt.patient?.patientCode || ""
    const doctorName = apt.doctor?.user?.fullName || ""

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const canCheckIn = (appointment: Appointment) => appointment.status === "WAITING"
  const canMarkNoShow = (appointment: Appointment) => appointment.status === "WAITING" || appointment.status === "IN_PROGRESS"
  const canCancel = (appointment: Appointment) => appointment.status === "WAITING"

  const handleCancelAppointment = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) return
    try {
      await cancelAppointment(id)
      toast.success("Đã hủy lịch hẹn thành công")
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể hủy lịch hẹn")
    }
  }

  const handleMarkNoShow = async () => {
    if (!appointmentToMarkNoShow) return
    setIsMarkingNoShow(appointmentToMarkNoShow.id)
    try {
      await markNoShow(appointmentToMarkNoShow.id)
      toast.success("Đã đánh dấu không đến!")
      setIsNoShowDialogOpen(false)
      setAppointmentToMarkNoShow(null)
      fetchAppointments()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đánh dấu không đến")
    } finally {
      setIsMarkingNoShow(null)
    }
  }

  const openNoShowDialog = (appointment: Appointment) => {
    setAppointmentToMarkNoShow(appointment)
    setIsNoShowDialogOpen(true)
  }

  if (!user) return null
  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="container mx-auto px-6 py-8 max-w-[1600px]">
        {}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Quản lý lịch hẹn</h1>
            </div>
            <p className="text-slate-500 text-lg ml-15 font-medium opacity-80">Theo dõi và điều phối lịch khám bệnh nhân trong ngày</p>
          </div>
          
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl h-12 px-6 font-bold transition-all" asChild>
            <Link to="/recep/appointments/offline">
              <Plus className="h-5 w-5 mr-2" />
              Đặt lịch trực tiếp
            </Link>
          </Button>
        </div>

        {}
        <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 mb-8 overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-5 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  className="pl-12 h-12 bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl text-base transition-all"
                  placeholder="Tìm tên BN, mã BN, tên bác sĩ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                />
              </div>

              <div className="lg:col-span-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 font-medium">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="WAITING">Chờ checkin</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
                    <SelectItem value="COMPLETED">Đã khám</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    <SelectItem value="NO_SHOW">Không đến</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Input
                  type="date"
                  className="h-12 rounded-xl bg-slate-50 border-0 ring-1 ring-slate-200 font-medium"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="lg:col-span-2 flex gap-2">
                <Button
                  variant="outline"
                  className="h-12 w-12 rounded-xl border-slate-200 text-slate-600 hover:text-indigo-600 p-0"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  title="Tìm kiếm nâng cao"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
                <Button
                  className="h-12 flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-100"
                  onClick={handleQuickSearch}
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                  <span className="ml-2 hidden xl:inline">Tìm kiếm</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white px-8 py-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-800">Danh sách lịch hẹn</CardTitle>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Ngày: {format(new Date(filterDate), "dd/MM/yyyy")}</p>
            </div>
            {!isLoading && <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-indigo-100 font-bold">{filteredAppointments.length} lịch</Badge>}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="font-medium">Đang tải lịch hẹn...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                   <CalendarIcon className="h-10 w-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Không có lịch hẹn nào</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">Không tìm thấy lịch hẹn cho ngày và bộ lọc đã chọn.</p>
                </div>
                <Button variant="outline" onClick={() => { setFilterDate(format(new Date(), "yyyy-MM-dd")); setFilterStatus("all"); }} className="mt-2 rounded-xl">Quay về hôm nay</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bệnh nhân</th>
                      <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bác sĩ phụ trách</th>
                      <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Khung giờ</th>
                      <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
                              {(appointment.patientName || appointment.patient?.fullName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">
                                {appointment.patientName || appointment.patient?.fullName || "N/A"}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {appointment.patient?.patientCode || "#---"}</div>
                              {appointment.patientName && appointment.patientName !== appointment.patient?.fullName && (
                                <div className="text-[10px] text-slate-500 italic">
                                  Đặt bởi: {appointment.patient?.fullName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                           <div className="text-slate-600 font-bold text-sm">BS. {appointment.doctor?.user?.fullName || "N/A"}</div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Chuyên khoa: {appointment.doctor?.specialty?.name || "BS Đa khoa"}</div>
                        </td>
                        <td className="py-5 px-6">
                           {appointment.shift ? (
                             <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 gap-1.5 py-1 px-3 rounded-lg font-bold">
                               <Clock className="w-3.5 h-3.5 text-slate-400" />
                               {appointment.shift.startTime} - {appointment.shift.endTime}
                             </Badge>
                           ) : (
                             <span className="text-xs text-slate-400 font-bold italic">Chưa phân ca</span>
                           )}
                        </td>
                        <td className="py-5 px-6">
                           {getStatusBadge(appointment.status)}
                        </td>
                        <td className="py-5 px-8">
                          <div className="flex items-center justify-center gap-2">
                             {canCheckIn(appointment) && (
                               <Button
                                 size="sm"
                                 className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm"
                                 onClick={() => openCheckInDialog(appointment)}
                                 disabled={isCheckingIn === appointment.id}
                               >
                                 {isCheckingIn === appointment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="w-4 h-4 mr-1.5" />}
                                 Checkin
                               </Button>
                             )}
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200" asChild>
                               <Link to={`/appointments/${appointment.id}`}>
                                 <Eye className="h-4 w-4 text-indigo-600" />
                               </Link>
                             </Button>
                             {(canMarkNoShow(appointment) || canCancel(appointment)) && (
                               <div className="group/dropdown relative">
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:border-slate-200 border border-transparent">
                                     <MoreVertical className="w-4 h-4 text-slate-400" />
                                  </Button>
                                  <div className="hidden group-hover/dropdown:block absolute right-0 top-full mt-1 bg-white ring-1 ring-slate-200 shadow-xl rounded-xl p-1.5 z-50 min-w-[160px]">
                                     {canMarkNoShow(appointment) && (
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         className="w-full justify-start text-xs font-bold text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-lg h-9"
                                         onClick={() => openNoShowDialog(appointment)}
                                       >
                                         <XCircle className="w-4 h-4 mr-2" />
                                         Báo vắng mặt
                                       </Button>
                                     )}
                                     {canCancel(appointment) && (
                                       <Button
                                         variant="ghost"
                                         size="sm"
                                         className="w-full justify-start text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg h-9"
                                         onClick={() => handleCancelAppointment(appointment.id)}
                                       >
                                         <XCircle className="w-4 h-4 mr-2" />
                                         Hủy lịch khám
                                       </Button>
                                     )}
                                  </div>
                               </div>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
           <div className="bg-indigo-600 p-8 text-white">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <UserCheck className="w-8 h-8" />
             </div>
             <DialogTitle className="text-2xl font-extrabold uppercase tracking-tight">Xác nhận Check-in</DialogTitle>
             <DialogDescription className="text-indigo-100 font-medium">Làm thủ tục tiếp đón cho bệnh nhân này?</DialogDescription>
           </div>
           <div className="p-8 space-y-4">
             {selectedAppointment && (
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bệnh nhân</span>
                     <span className="text-sm font-extrabold text-slate-900">
                       {selectedAppointment.patientName || selectedAppointment.patient?.fullName}
                       {selectedAppointment.patientName && selectedAppointment.patientName !== selectedAppointment.patient?.fullName && (
                         <span className="block text-[10px] font-normal text-slate-500 mt-0.5">Đặt bởi: {selectedAppointment.patient?.fullName}</span>
                       )}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bác sĩ</span>
                     <span className="text-sm font-bold text-indigo-600">{selectedAppointment.doctor?.user?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khung giờ</span>
                     <span className="text-xs font-bold text-slate-600">{selectedAppointment.shift?.startTime} - {selectedAppointment.shift?.endTime}</span>
                  </div>
               </div>
             )}
             <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-100" onClick={() => setIsCheckInDialogOpen(false)}>Hủy bỏ</Button>
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl h-12 font-bold" onClick={handleCheckIn} disabled={isCheckingIn !== null}>
                   {isCheckingIn !== null ? <Loader2 className="animate-spin h-5 w-5" /> : "Vào khám ngay"}
                </Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isNoShowDialogOpen} onOpenChange={setIsNoShowDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
           <div className="bg-amber-500 p-8 text-white">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <XCircle className="w-8 h-8" />
             </div>
             <DialogTitle className="text-2xl font-extrabold uppercase tracking-tight">Xác nhận vắng mặt</DialogTitle>
             <DialogDescription className="text-amber-50 font-medium opacity-90">Bệnh nhân đã không đến sau thời gian chờ?</DialogDescription>
           </div>
           <div className="p-8 space-y-4">
              <p className="text-slate-600 text-sm">Hành động này sẽ đánh dấu lịch hẹn là <strong>Vắng mặt (No-Show)</strong> và không thể hoàn tác.</p>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-100" onClick={() => setIsNoShowDialogOpen(false)}>Bỏ qua</Button>
                <Button className="flex-1 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-100 rounded-xl h-12 font-bold" onClick={handleMarkNoShow} disabled={isMarkingNoShow !== null}>
                   {isMarkingNoShow !== null ? <Loader2 className="animate-spin h-5 w-5" /> : "Xác nhận vắng"}
                </Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
          <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-indigo-600 px-8 py-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight uppercase tracking-widest">Bộ lọc lịch hẹn</DialogTitle>
                <DialogDescription className="text-indigo-100 opacity-90 font-medium">
                  Tìm kiếm lịch hẹn theo tiêu chí chi tiết để quản lý dễ dàng hơn.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Từ khóa bệnh nhân</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="Tên, mã sổ, SĐT..."
                    value={advancedFilters.keyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái khám</Label>
                  <Select
                    value={advancedFilters.status}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, status: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="WAITING">Chờ checkin</SelectItem>
                      <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
                      <SelectItem value="COMPLETED">Đã khám</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      <SelectItem value="NO_SHOW">Không đến</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking Type</Label>
                  <Select
                    value={advancedFilters.bookingType}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, bookingType: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11 font-medium">
                      <SelectValue placeholder="Chọn loại đặt lịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="ONLINE">Trực tuyến (Online)</SelectItem>
                      <SelectItem value="OFFLINE">Tại quầy (Offline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mã bác sĩ khám</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 uppercase"
                    placeholder="VD: DOC-45"
                    value={advancedFilters.doctorId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, doctorId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Từ ngày</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 font-medium"
                    type="date"
                    value={advancedFilters.dateFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đến ngày</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 font-medium"
                    type="date"
                    value={advancedFilters.dateTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="bg-slate-50/80 px-8 py-5 flex items-center justify-between border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={clearAdvancedSearch}
                className="rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="h-4 w-4 mr-2" />
                Thiết lập lại
              </Button>
              <Button 
                onClick={handleAdvancedSearch} 
                disabled={isSearching}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 font-bold shadow-lg shadow-indigo-100"
              >
                {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Xác nhận tìm kiếm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )

  if (role === "admin" || role === "1") return <AdminSidebar>{content}</AdminSidebar>
  if (role === "receptionist" || role === "2") return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  return null
}
