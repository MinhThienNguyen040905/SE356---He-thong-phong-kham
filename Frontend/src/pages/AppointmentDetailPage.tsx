"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../features/auth/context/authContext"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Calendar } from "../components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  X,
  Loader2,
  Edit,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import {
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  markNoShow,
  type Appointment,
} from "../features/appointment/services/appointment.service"
import api from "../lib/api"
import AdminSidebar from "../components/layout/sidebar/admin"
import DoctorSidebar from "../components/layout/sidebar/doctor"
import ReceptionistSidebar from "../components/layout/sidebar/recep"
import PatientSidebar from "../components/layout/sidebar/patient"

interface Doctor {
  id: number
  fullName: string
  specialty?: {
    id: number
    name: string
  }
}

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

export default function AppointmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)

  
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleDoctorId, setRescheduleDoctorId] = useState<number | null>(null)
  const [rescheduleShiftId, setRescheduleShiftId] = useState<number | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<Date>()

  
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])

  
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getAppointmentById(Number(id))
        setAppointment(data)
        setRescheduleDoctorId(data.doctorId)
        setRescheduleShiftId(data.shiftId)
        if (data.date) {
          setRescheduleDate(new Date(data.date))
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin lịch hẹn"
        )
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointment()
  }, [id, navigate])

  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [doctorsRes, shiftsRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/shifts"),
        ])
        if (doctorsRes.data.success) {
          setDoctors(doctorsRes.data.data || [])
        }
        if (shiftsRes.data.success) {
          setShifts(shiftsRes.data.data || [])
        }
      } catch (error) {
        
      }
    }
    if (isRescheduleOpen) {
      fetchOptions()
    }
  }, [isRescheduleOpen])

  const handleReschedule = async () => {
    if (!appointment || !rescheduleDate) return

    setIsUpdating(true)
    try {
      const updateData: any = {}
      if (rescheduleDoctorId && rescheduleDoctorId !== appointment.doctorId) {
        updateData.doctorId = rescheduleDoctorId
      }
      if (rescheduleShiftId && rescheduleShiftId !== appointment.shiftId) {
        updateData.shiftId = rescheduleShiftId
      }
      if (rescheduleDate) {
        updateData.date = format(rescheduleDate, "yyyy-MM-dd")
      }

      await updateAppointment(appointment.id, updateData)
      toast.success("Đổi lịch hẹn thành công!")
      setIsRescheduleOpen(false)
      
      const updated = await getAppointmentById(appointment.id)
      setAppointment(updated)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể đổi lịch hẹn"
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!appointment) return

    setIsCancelling(true)
    try {
      await cancelAppointment(appointment.id)
      toast.success("Hủy lịch hẹn thành công!")
      setIsCancelOpen(false)
      navigate(-1)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể hủy lịch hẹn"
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const handleMarkNoShow = async () => {
    if (!appointment) return

    setIsMarkingNoShow(true)
    try {
      await markNoShow(appointment.id)
      toast.success("Đã đánh dấu không đến!")
      
      const updated = await getAppointmentById(appointment.id)
      setAppointment(updated)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể đánh dấu không đến"
      )
    } finally {
      setIsMarkingNoShow(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      WAITING: { label: "Chờ checkin", className: "bg-blue-50 text-blue-700 border-blue-200" },
      IN_PROGRESS: { label: "Đang khám", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
      NO_SHOW: { label: "Không đến", className: "bg-gray-50 text-gray-700 border-gray-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (isLoading) {
    const loadingContent = (
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    
    if (role === "admin" || role === "1") {
      return <AdminSidebar>{loadingContent}</AdminSidebar>
    } else if (role === "doctor" || role === "4") {
      return <DoctorSidebar>{loadingContent}</DoctorSidebar>
    } else if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar>{loadingContent}</ReceptionistSidebar>
    } else if (role === "patient" || role === "3") {
      return <PatientSidebar>{loadingContent}</PatientSidebar>
    }
    return null
  }

  if (!appointment) {
    const errorContent = (
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy lịch hẹn</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    )
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    
    if (role === "admin" || role === "1") {
      return <AdminSidebar>{errorContent}</AdminSidebar>
    } else if (role === "doctor" || role === "4") {
      return <DoctorSidebar>{errorContent}</DoctorSidebar>
    } else if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar>{errorContent}</ReceptionistSidebar>
    } else if (role === "patient" || role === "3") {
      return <PatientSidebar>{errorContent}</PatientSidebar>
    }
    return null
  }

  
  const canCancel =
    appointment.status === "WAITING" &&
    (user?.roleId === 3 || user?.roleId === 2) 
  const canReschedule =
    appointment.status === "WAITING" &&
    (user?.roleId === 3 || user?.roleId === 2 || user?.roleId === 1) 
  const canMarkNoShow =
    appointment.status === "WAITING" &&
    (user?.roleId === 1 || user?.roleId === 2) 

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      <div className="space-y-6">
        {}
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {}
        <Card className="border-0 shadow-xl shadow-slate-900/5 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {getStatusBadge(appointment.status)}
                </div>
                <h1 className="text-4xl font-bold mb-2">Chi tiết lịch hẹn</h1>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{appointment.patientName || appointment.patient?.fullName || "N/A"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    <span>{appointment.doctor?.user?.fullName || "N/A"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {new Date(appointment.date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canReschedule && (
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setIsRescheduleOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Đổi lịch
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setIsCancelOpen(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy lịch
                  </Button>
                )}
                {canMarkNoShow && (
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                    onClick={handleMarkNoShow}
                    disabled={isMarkingNoShow}
                  >
                    {isMarkingNoShow ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Đánh dấu không đến
                  </Button>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-4 divide-x bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bệnh nhân</p>
                  <p className="text-lg font-bold text-slate-900">
                    {appointment.patientName || appointment.patient?.fullName || "N/A"}
                  </p>
                  {appointment.patient?.patientCode && (
                    <p className="text-xs text-slate-500 mt-1">
                      {appointment.patient.patientCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bác sĩ</p>
                  <p className="text-lg font-bold text-slate-900">
                    {appointment.doctor?.user?.fullName || "N/A"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ca trực</p>
                  <p className="text-lg font-bold text-slate-900">
                    {appointment.shift?.name || "N/A"}
                  </p>
                  {appointment.shift && (
                    <p className="text-xs text-slate-500 mt-1">
                      {appointment.shift.startTime} - {appointment.shift.endTime}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Loại đặt lịch</p>
                  <p className="text-lg font-bold text-slate-900">
                    {appointment.bookingType === "ONLINE" ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.patientName || appointment.patient?.fullName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Số điện thoại</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.patientPhone || appointment.patient?.phone || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                  <p className="text-sm font-medium text-slate-900">
                    {appointment.patientDob 
                      ? new Date(appointment.patientDob).toLocaleDateString("vi-VN") 
                      : (appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString("vi-VN") : "N/A")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Giới tính</p>
                  <p className="text-sm font-medium text-slate-900">
                    {appointment.patientGender === "MALE" ? "Nam" : appointment.patientGender === "FEMALE" ? "Nữ" : 
                     (appointment.patient?.gender === "MALE" ? "Nam" : appointment.patient?.gender === "FEMALE" ? "Nữ" : "Khác")}
                  </p>
                </div>
              </div>
              {appointment.patient?.patientCode && 
               !(appointment.patientName && appointment.patient?.fullName && appointment.patientName.toLowerCase().trim() !== appointment.patient.fullName.toLowerCase().trim()) && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mã bệnh nhân</p>
                  <p className="text-sm font-medium text-slate-900">
                    {appointment.patient.patientCode}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-600" />
                Thông tin bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.doctor?.user?.fullName || "N/A"}
                </p>
              </div>
              {appointment.doctor?.user?.email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm text-slate-900">
                    {appointment.doctor.user.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              Thông tin lịch hẹn
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày khám</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(appointment.date).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ca trực</p>
                <p className="text-sm font-medium text-slate-900">
                  {appointment.shift?.name || "N/A"}
                </p>
                {appointment.shift && (
                  <p className="text-xs text-slate-500 mt-1">
                    {appointment.shift.startTime} - {appointment.shift.endTime}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Loại đặt lịch</p>
                <Badge variant="outline">
                  {appointment.bookingType === "ONLINE" ? "Online" : "Offline"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-slate-900">
                  {new Date(appointment.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            {appointment.symptomInitial && (
              <div className="pt-4 border-t">
                <p className="text-xs text-slate-500 mb-1">Triệu chứng ban đầu</p>
                <p className="text-sm text-slate-700 bg-gray-50 p-3 rounded-md">
                  {appointment.symptomInitial}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi lịch hẹn</DialogTitle>
            <DialogDescription>
              Thay đổi bác sĩ, ca trực hoặc ngày khám
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bác sĩ</Label>
              <Select
                value={rescheduleDoctorId?.toString() || ""}
                onValueChange={(value) => {
                  setRescheduleDoctorId(Number(value))
                  setRescheduleShiftId(null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      {doctor.fullName}
                      {doctor.specialty && ` - ${doctor.specialty.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ca trực</Label>
              <Select
                value={rescheduleShiftId?.toString() || ""}
                onValueChange={(value) => setRescheduleShiftId(Number(value))}
                disabled={!rescheduleDoctorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ca trực" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id.toString()}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ngày khám</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate
                      ? format(rescheduleDate, "PPP")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRescheduleOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={isUpdating || !rescheduleDate}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy lịch hẹn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy lịch hẹn này? Lịch hẹn chỉ có thể hủy
              trước giờ khám ít nhất 2 tiếng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelOpen(false)}
            >
              Không
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
      </div>
    )

  
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "doctor" || role === "4") {
    return <DoctorSidebar>{content}</DoctorSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  } else if (role === "patient" || role === "3") {
    return <PatientSidebar>{content}</PatientSidebar>
  }

  return null
}
