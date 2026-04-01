"use client"

import { useState, useEffect } from "react"

import AdminSidebar from "../../components/layout/sidebar/admin"
import ScheduleEventModal from "./ModalChooseDay"
import api from "../../lib/api"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"

import {
  ChevronLeft,
  ChevronRight,
  XCircle,
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  CalendarDays,
  Filter,
} from "lucide-react"


interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface Doctor {
  id: number
  doctorCode: string
  user: {
    id: number
    fullName: string
    email: string
    avatar?: string
  }
  specialty: {
    id: number
    name: string
  }
}

interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  doctor: Doctor
  shift: Shift
}





export default function DoctorSchedulePage() {


  
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedShiftToCancel, setSelectedShiftToCancel] = useState<DoctorShift | null>(null)
  const [selectedShiftToRestore, setSelectedShiftToRestore] = useState<DoctorShift | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [previewData, setPreviewData] = useState<any>(null)

  
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [doctorShifts, setDoctorShifts] = useState<DoctorShift[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const [filters, setFilters] = useState({
    consultations: true,
    onLeave: true,
  })
  
  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...')
      const response = await api.get('/doctors')
      if (response.data.success) {
        setDoctors(response.data.data)
        console.log('Doctors loaded:', response.data.data.length)
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err)
      if (err.response?.status === 429) {
        toast.error('Quá nhiều request, vui lòng thử lại sau')
      }
    }
  }

  const fetchShifts = async () => {
    try {
      console.log('Fetching shifts...')
      const response = await api.get('/shifts')
      if (response.data.success) {
        setShifts(response.data.data)
        console.log('Shifts loaded:', response.data.data.length)
      } else {
        
        setShifts([
          { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" },
          { id: 2, name: "AFTERNOON", startTime: "13:00", endTime: "17:00" },
          { id: 3, name: "EVENING", startTime: "18:00", endTime: "22:00" }
        ])
      }
    } catch (err) {
      console.error('Error fetching shifts:', err)
      
      setShifts([
        { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" },
        { id: 2, name: "AFTERNOON", startTime: "13:00", endTime: "17:00" },
        { id: 3, name: "EVENING", startTime: "18:00", endTime: "22:00" }
      ])
    }
  }

  const fetchDoctorShifts = async () => {
    try {
      console.log('Fetching doctor shifts...')
      const response = await api.get('/doctor-shifts')
      
      if (response.data.success) {
        setDoctorShifts(response.data.data)
        console.log('Doctor shifts loaded:', response.data.data.length)
        return
      }
    } catch (err: any) {
      console.error('Error fetching doctor shifts:', err)
      setDoctorShifts([])
      toast.error('Không thể tải danh sách ca trực')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchDoctors(),
          fetchShifts(),
          fetchDoctorShifts() 
        ])
      } catch (err) {
        setError('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, []) 

  
  const getWeekDates = () => {
    const start = new Date(currentWeek)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    const dates = []
    for (let i = 0; i < 7; i++) { 
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500"
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  const getAvatarInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  

  const toggleFilter = (key: "consultations" | "onLeave") => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = () => {
    const all = filters.consultations && filters.onLeave
    setFilters({ consultations: !all, onLeave: !all })
  }

  const formatShiftTime = (shift: Shift) => {
    return `${shift.startTime} - ${shift.endTime}`
  }

  const getShiftIcon = (shiftName: string) => {
    switch (shiftName.toUpperCase()) {
      case 'MORNING': return ''
      case 'AFTERNOON': return '️'
      case 'EVENING': return ''
      default: return '⏰'
    }
  }

  
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDatePicker(true)
  }

  const handleCancelShiftClick = async (doctorShift: DoctorShift) => {
    try {
      setPreviewLoading(true)
      setSelectedShiftToCancel(doctorShift)
      setCancelReason("")
      setPreviewData(null)
      
      const previewResponse = await api.get(`/doctor-shifts/${doctorShift.id}/reschedule-preview`)
      
      if (previewResponse.data.success) {
        setPreviewData(previewResponse.data.data)
        setCancelDialogOpen(true)
      } else {
        throw new Error(previewResponse.data.message || 'Không thể lấy thông tin preview')
      }
    } catch (err: any) {
      console.error('Error getting preview:', err)
      toast.error(err.response?.data?.message || 'Không thể lấy thông tin preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleCancelConfirm = async () => {
    if (!selectedShiftToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy ca')
      return
    }

    try {
      setCancelLoading(true)
      const payload: any = {
        cancelReason: cancelReason.trim()
      }
      if (previewData?.replacementDoctorId) {
        payload.replacementDoctorId = previewData.replacementDoctorId
      }
      
      const response = await api.post(`/doctor-shifts/${selectedShiftToCancel.id}/cancel-and-reschedule`, payload)

      if (response.data.success) {
        const result = response.data.data
        
        
        setDoctorShifts(prev => prev.map(ds => 
          ds.id === selectedShiftToCancel.id ? { ...ds, status: 'CANCELLED' as const } : ds
        ))
        
        
        let successMsg = `Đã hủy ca trực thành công!`
        if (result.totalAppointments > 0) {
          successMsg += ` ${result.rescheduledCount || 0}/${result.totalAppointments} lịch hẹn đã được xử lý.`
        }
        toast.success(successMsg)
        
        setCancelDialogOpen(false)
        setSelectedShiftToCancel(null)
        setCancelReason("")
        setPreviewData(null)
      } else {
        throw new Error(response.data.message || 'Không thể hủy ca trực')
      }
    } catch (err: any) {
      console.error('Cancel shift error:', err)
      const errorMsg = err.response?.data?.message || 'Không thể hủy ca trực'
      toast.error(errorMsg)
    } finally {
      setCancelLoading(false)
    }
  }

  const handleRestoreShiftClick = (doctorShift: DoctorShift) => {
    setSelectedShiftToRestore(doctorShift)
    setRestoreDialogOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (!selectedShiftToRestore) return

    try {
      setRestoreLoading(true)
      const response = await api.post(`/doctor-shifts/${selectedShiftToRestore.id}/restore`)

      if (response.data.success) {
        
        setDoctorShifts(prev => prev.map(ds => 
          ds.id === selectedShiftToRestore.id ? { ...ds, status: 'ACTIVE' as const } : ds
        ))
        
        toast.success('Đã khôi phục ca trực thành công!')
        setRestoreDialogOpen(false)
        setSelectedShiftToRestore(null)
      } else {
        throw new Error(response.data.message || 'Không thể khôi phục ca trực')
      }
    } catch (err: any) {
      console.error('Restore shift error:', err)
      const errorMsg = err.response?.data?.message || 'Không thể khôi phục ca trực'
      toast.error(errorMsg)
    } finally {
      setRestoreLoading(false)
    }
  }

  const handleScheduleSuccess = (scheduleData?: {
    doctorId: number
    shiftId: number
    workDate: string
  }) => {
    
    if (scheduleData && selectedDoctor) {
      const selectedShift = shifts.find(s => s.id === scheduleData.shiftId)
      const newDoctorShift = {
        id: Date.now(), 
        doctorId: scheduleData.doctorId,
        shiftId: scheduleData.shiftId,
        workDate: scheduleData.workDate,
        status: 'ACTIVE' as const,
        doctor: selectedDoctor,
        shift: selectedShift || { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" }
      }
      
      
      setDoctorShifts(prev => [...prev, newDoctorShift])
    }
    
    
    setShowDatePicker(false)
    setSelectedDoctor(null)
    setSelectedDate("")
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  
  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch trực...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  const weekDates = getWeekDates()
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6] 

  return (
    <AdminSidebar>
      <div className="relative min-h-screen p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-100/50">
          <div className="flex items-start gap-4">
            <div className="hidden lg:flex p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600">
                Lịch Trực Bác Sĩ
              </h1>
              <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                Quản lý phân công ca trực, lịch khám và nghỉ phép của nhân sự
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                onClick={() => setShowAddEvent(!showAddEvent)}
                className={`${
                  showAddEvent 
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20"
                } rounded-xl px-6 h-11 font-bold transition-all hover:scale-105 active:scale-95`}
              >
                {showAddEvent ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Hủy chế độ chỉnh sửa
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Thêm / Điều chỉnh Lịch
                  </>
                )}
              </Button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8">

          {}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday} className="bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
                  Hôm nay
                </Button>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                    <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')} className="h-8 w-8 p-0 rounded-md hover:bg-slate-100">
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')} className="h-8 w-8 p-0 rounded-md hover:bg-slate-100">
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </Button>
                </div>
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {weekStart.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' })} <span className="text-slate-400 mx-1">—</span> {weekEnd.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="w-[100px]" /> {}
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl overflow-hidden rounded-[24px] ring-1 ring-slate-200/50">
              {}
              <div className="grid grid-cols-8 border-b border-indigo-50 bg-indigo-50/30">
                <div className="p-4 border-r border-indigo-50 text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center justify-center">
                  Ca trực
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' })
                  const dayNumber = date.getDate()
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-r border-indigo-50 last:border-r-0 ${
                        isToday ? "bg-white" : ""
                      }`}
                    >
                      <div className={`text-[10px] font-black uppercase mb-1 ${isToday ? "text-blue-600" : "text-slate-400"}`}>
                        {dayName}
                      </div>
                      <div
                        className={`text-xl font-black mx-auto transition-all ${
                          isToday
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-500/30 scale-110"
                            : "text-slate-700"
                        }`}
                      >
                        {dayNumber}
                      </div>
                    </div>
                  )
                })}
              </div>

              {}
              <CardContent className="p-0">
                {shifts.map((shift) => (
                  <div key={shift.id} className="grid grid-cols-8 border-b border-slate-100 min-h-[180px] hover:bg-slate-50/30 transition-colors">
                    <div className="p-4 border-r border-slate-100 text-center flex flex-col justify-center items-center bg-slate-50/50">
                      <div className="text-3xl mb-2 drop-shadow-sm filter grayscale-[0.2] hover:grayscale-0 transition-all cursor-default" title={shift.name}>
                        {getShiftIcon(shift.name)}
                      </div>
                      <div className="font-bold text-slate-700 text-sm mb-1">{shift.name}</div>
                      <Badge variant="secondary" className="bg-slate-200 text-slate-600 hover:bg-slate-300 border-0 text-[10px] px-1.5 h-5">
                          {formatShiftTime(shift)}
                      </Badge>
                    </div>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const shiftsForDay = doctorShifts.filter(ds => 
                        ds.shiftId === shift.id && 
                        ds.workDate === dateStr
                      )
                      
                      const activeShifts = shiftsForDay.filter(ds => ds.status === 'ACTIVE')
                      const cancelledShifts = shiftsForDay.filter(ds => ds.status === 'CANCELLED')
                      
                      return (
                        <div key={dayIndex} className="p-2 border-r border-slate-100 relative group/cell">
                          {}
                          {filters.consultations && activeShifts.map(doctorShift => {
                            const doctorName = doctorShift.doctor?.user?.fullName || 'N/A';
                            return (
                            <div
                              key={doctorShift.id}
                              className="p-2 mb-2 rounded-xl text-xs bg-white border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-blue-200 hover:border-blue-300 transition-all relative group/card flex flex-col items-center text-center gap-1.5 min-h-[80px] justify-center"
                            >
                              {}
                              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${doctorShift.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />

                              {}
                              <div className={`w-8 h-8 min-w-[32px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${getAvatarColor(doctorName)}`}>
                                   {getAvatarInitials(doctorName)}
                              </div>
                              
                              {}
                              <span className="font-bold text-slate-800 text-[11px] leading-tight w-full break-words" title={doctorName}>
                                  {doctorName}
                              </span>
                             
                              {}
                              <div className="text-slate-500 text-[9px] w-full truncate px-1 bg-slate-50 rounded-md py-0.5">
                                {doctorShift.doctor?.specialty?.name || 'Đa khoa'}
                              </div>

                              {}
                              {showAddEvent && (
                                <button
                                  onClick={() => handleCancelShiftClick(doctorShift)}
                                  disabled={previewLoading || cancelLoading}
                                  className={`absolute -top-1 -right-1 w-5 h-5 ${
                                    previewLoading || cancelLoading 
                                      ? 'bg-slate-400 cursor-not-allowed' 
                                      : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                  } text-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform hover:scale-110 z-10`}
                                  title="Hủy ca trực"
                                >
                                  {previewLoading || cancelLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          )})}
                          
                          {}
                          {filters.onLeave && cancelledShifts.map(doctorShift => (
                            <div
                              key={doctorShift.id}
                              className="p-2 mb-2 rounded-lg text-xs bg-slate-50 border border-slate-200 opacity-70 hover:opacity-100 transition-opacity relative group/card"
                            >
                              <div className="font-bold text-slate-500 line-through mb-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                Đã hủy
                              </div>
                              <div className="text-slate-500 line-through text-[10px]">
                                {doctorShift.doctor?.user?.fullName}
                              </div>
                              
                              {showAddEvent && (
                                <button
                                  onClick={() => handleRestoreShiftClick(doctorShift)}
                                  disabled={restoreLoading}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform hover:scale-110 z-10"
                                  title="Khôi phục"
                                >
                                  {restoreLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {}
                          {showAddEvent && activeShifts.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 pointer-events-none">
                                <div className="text-slate-300 text-xs font-bold">+ Trống</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            {!showAddEvent ? (
              <>
                {}
                <Card className="border-0 shadow-lg shadow-slate-200/20 bg-white/60 backdrop-blur-xl rounded-[24px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">THÁNG {currentWeek.getMonth() + 1}, {currentWeek.getFullYear()}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold mb-2">
                      {["CN","T2","T3","T4","T5","T6","T7"].map(d => (
                        <div key={d} className="text-slate-400">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                        const isToday = d === new Date().getDate() && 
                                       currentWeek.getMonth() === new Date().getMonth()
                        return (
                          <div
                            key={d}
                            className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer text-xs font-bold transition-all ${
                              isToday 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110" 
                              : "text-slate-600 hover:bg-white hover:shadow-md"
                            }`}
                          >
                            {d}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {}
                <Card className="border-0 shadow-lg shadow-slate-200/20 bg-white/60 backdrop-blur-xl rounded-[24px]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5" />
                        Bộ Lọc
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={toggleAll} className="h-6 text-[10px] uppercase font-bold text-slate-400 hover:text-blue-600">
                      {filters.consultations && filters.onLeave ? "Bỏ chọn" : "Chọn tất cả"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100 cursor-pointer hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${filters.consultations ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                         <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Ca trực</span>
                      </div>
                      <input type="checkbox" className="accent-blue-600 w-4 h-4 cursor-pointer" checked={filters.consultations} onChange={() => toggleFilter("consultations")} />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-slate-100 cursor-pointer hover:bg-white hover:shadow-md transition-all group">
                       <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${filters.onLeave ? 'bg-red-500' : 'bg-slate-300'}`} />
                         <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Nghỉ phép / Đã hủy</span>
                      </div>
                      <input type="checkbox" className="accent-blue-600 w-4 h-4 cursor-pointer" checked={filters.onLeave} onChange={() => toggleFilter("onLeave")} />
                    </label>
                    
                    <div className="pt-2 grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/50 p-2 rounded-xl text-center border border-emerald-100">
                            <div className="text-xl font-black text-emerald-600">{doctorShifts.filter(ds => ds.status === 'ACTIVE').length}</div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase">Hoạt động</div>
                        </div>
                         <div className="bg-red-50/50 p-2 rounded-xl text-center border border-red-100">
                            <div className="text-xl font-black text-red-600">{doctorShifts.filter(ds => ds.status === 'CANCELLED').length}</div>
                            <div className="text-[10px] font-bold text-red-400 uppercase">Đã hủy</div>
                        </div>
                    </div>
                  </CardContent>
                </Card>

                {}
                <Card className="border-0 shadow-lg shadow-slate-200/20 bg-white/60 backdrop-blur-xl rounded-[24px]">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-black text-slate-800 uppercase tracking-widest">Sắp diễn ra</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {doctorShifts
                        .filter(ds => ds.status === 'ACTIVE')
                        .sort((a, b) => new Date(a.workDate).getTime() - new Date(b.workDate).getTime()) 
                        .slice(0, 3)
                        .map(ds => (
                      <div key={ds.id} className="flex gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ${getAvatarColor(ds.doctor.user.fullName)}`}>
                             {getAvatarInitials(ds.doctor.user.fullName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                             <div className="font-bold text-slate-700 text-sm truncate">{ds.shift.name}</div>
                             <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{ds.workDate.slice(5)}</span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium truncate">{ds.doctor.user.fullName}</div>
                        </div>
                      </div>
                    ))}
                    {doctorShifts.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-sm">Chưa có lịch trực nào</div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              
              <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white backdrop-blur-xl rounded-[24px]">
                <CardHeader><CardTitle className="text-lg font-black text-slate-800">Chọn Bác Sĩ</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {doctors.map(d => (
                    <div
                      key={d.id}
                      onClick={() => handleDoctorSelect(d)}
                      className="flex gap-3 p-3 border border-slate-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all group active:scale-95"
                    >
                      <div className={`w-10 h-10 ${getAvatarColor(d.user.fullName)} rounded-2xl shadow-lg shadow-slate-200 group-hover:shadow-blue-200 flex items-center justify-center text-white text-sm font-black overflow-hidden transform group-hover:rotate-3 transition-all`}>
                        {d.user?.avatar ? (
                          <img 
                            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${d.user.avatar}`} 
                            alt={d.user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getAvatarInitials(d.user.fullName)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{d.user.fullName}</div>
                        <div className="text-xs text-slate-500 font-medium">{d.specialty.name}</div>
                        <Badge variant="secondary" className="mt-1 text-[10px] bg-slate-100 text-slate-500 border-0 group-hover:bg-blue-100 group-hover:text-blue-600">{d.doctorCode}</Badge>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <p className="text-slate-500 text-sm text-center py-8">Không có bác sĩ nào</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy ca trực</DialogTitle>
            <DialogDescription>
              Hủy ca trực cho bác sĩ {selectedShiftToCancel?.doctor?.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                previewData.hasReplacementDoctor 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {previewData.hasReplacementDoctor ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">
                      Sẽ ảnh hưởng đến {previewData.affectedAppointments} lịch hẹn
                    </p>
                    {previewData.hasReplacementDoctor ? (
                      <p className="text-sm text-green-700">
                         Đã tìm thấy bác sĩ thay thế cùng chuyên khoa. 
                        Tất cả lịch hẹn sẽ được tự động chuyển sang bác sĩ thay thế.
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700">
                        ️ CẢNH BÁO: Không tìm thấy bác sĩ thay thế cùng chuyên khoa! 
                        {previewData.affectedAppointments} lịch hẹn sẽ không thể tự động chuyển.
                      </p>
                    )}
                    {previewData.warning && (
                      <p className="text-sm text-amber-700 mt-2">️ {previewData.warning}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Lý do hủy ca *</Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy ca trực..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false)
                setCancelReason("")
                setPreviewData(null)
              }}
              disabled={cancelLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelLoading || !cancelReason.trim()}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Xác nhận hủy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận khôi phục ca trực</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khôi phục ca trực cho bác sĩ{" "}
              <strong>{selectedShiftToRestore?.doctor?.user?.fullName}</strong>?
              <br />
              Ca trực: {selectedShiftToRestore?.shift?.name} -{" "}
              {new Date(selectedShiftToRestore?.workDate || "").toLocaleDateString("vi-VN")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false)
                setSelectedShiftToRestore(null)
              }}
              disabled={restoreLoading}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRestoreConfirm}
              disabled={restoreLoading}
            >
              {restoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Khôi phục
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <ScheduleEventModal
        open={showDatePicker}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        shifts={shifts}
        onDateChange={setSelectedDate}
        onClose={() => {
          setShowDatePicker(false)
          setSelectedDoctor(null)
        }}
        onSuccess={handleScheduleSuccess}
        getAvatarColor={(name: string) => getAvatarColor(name)}
      />
    </AdminSidebar>
  )
}
