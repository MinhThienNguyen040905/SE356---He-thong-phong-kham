"use client"

import { useState, useEffect, useMemo } from "react"
import DoctorSidebar from '../../components/layout/sidebar/doctor'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import api from "../../lib/api"
import { useAuth } from "../../features/auth/context/authContext"
import { useNavigate } from "react-router-dom"
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  X,
  Search,
  RefreshCw
} from "lucide-react"
import { ShiftService, type Shift as ShiftTemplate } from "../../features/shift/services/shift.service"


interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  shift: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
}


interface Appointment {
  id: number
  date: string
  appointmentTime: string
  status: "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  notes?: string
  patient: {
    id: number
    user: {
      fullName: string
      phone?: string
    }
  }
  shift?: {
    startTime: string
    endTime: string
  }
  patientName?: string
  patientPhone?: string
  patientDob?: string
  patientGender?: string
}


interface PersonalSchedule {
  id: string
  date: string
  time: string
  type: "shift" | "appointment"
  title: string
  description: string
  status: "active" | "completed" | "cancelled"
  patientName?: string
  shiftId?: number
}


export default function DoctorShiftPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localNow = new Date(now.getTime() - (offset * 60 * 1000))
  const [selectedDate, setSelectedDate] = useState(localNow.toISOString().split('T')[0])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [doctorShifts, setDoctorShifts] = useState<DoctorShift[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [personalSchedule, setPersonalSchedule] = useState<PersonalSchedule[]>([])
  const [shifts, setShifts] = useState<ShiftTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  
  const filteredPersonalSchedule = useMemo(() => {
    if (!searchQuery.trim()) return personalSchedule
    const query = searchQuery.toLowerCase()
    return personalSchedule.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.patientName && item.patientName.toLowerCase().includes(query))
    )
  }, [personalSchedule, searchQuery])
  
  
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedShiftToCancel, setSelectedShiftToCancel] = useState<PersonalSchedule | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  
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

  
  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      
      
      if (!user?.doctorId) {
        toast.error("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.")
        navigate("/login")
        return
      }
      
      const currentDoctorId = user.doctorId
      
      
      let fetchedShifts: DoctorShift[] = []
      try {
        const shiftsResponse = await api.get(`/doctors/${currentDoctorId}/shifts`)
        console.log(" Doctor Shifts Response:", shiftsResponse.data)
        if (shiftsResponse.data.success) {
          fetchedShifts = shiftsResponse.data.data || []
          console.log(" Doctor Shifts Data:", fetchedShifts)
          setDoctorShifts(fetchedShifts)
        } else {
          console.warn("️ Doctor shifts response not successful:", shiftsResponse.data)
          setDoctorShifts([])
        }
      } catch (err: any) {
        console.error('Failed to fetch doctor shifts:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        })
        setDoctorShifts([])
        toast.error(err.response?.data?.message || 'Không thể tải danh sách ca trực')
      }

      
      let fetchedAppointments: Appointment[] = []
      try {
        const appointmentsResponse = await api.get(`/appointments?doctorId=${currentDoctorId}`)
        console.log(" Doctor Appointments Response:", appointmentsResponse.data)
        if (appointmentsResponse.data.success) {
          fetchedAppointments = appointmentsResponse.data.data || []
          console.log(" Doctor Appointments Data:", fetchedAppointments)
          setAppointments(fetchedAppointments)
        } else {
          setAppointments([])
        }
      } catch (err: any) {
        console.error('Failed to fetch appointments:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        })
        setAppointments([])
        toast.error(err.response?.data?.message || 'Không thể tải danh sách lịch hẹn')
      }

      
      try {
        const templates = await ShiftService.getShifts()
        
        templates.sort((a, b) => a.startTime.localeCompare(b.startTime))
        setShifts(templates)
      } catch (err) {
        console.error('Failed to fetch shift templates:', err)
      }

      
      createPersonalSchedule(fetchedShifts, fetchedAppointments)
      
    } catch (err: any) {
      console.error('Error fetching doctor data:', err)
      toast.error('Không thể tải dữ liệu')
      setDoctorShifts([])
      setAppointments([])
      setPersonalSchedule([])
    } finally {
      setLoading(false)
    }
  }

  
  const createPersonalSchedule = (shifts: DoctorShift[] = doctorShifts, apts: Appointment[] = appointments) => {
    const schedule: PersonalSchedule[] = []

    console.log(" Creating schedule from:", {
      doctorShifts: shifts.length,
      appointments: apts.length,
    })

    
    shifts.forEach(shift => {
      if (!shift.shift) {
        console.warn("️ Shift missing shift data:", shift)
        return
      }
      
      
      const workDate = shift.workDate ? shift.workDate.split('T')[0] : shift.workDate
      
      schedule.push({
        id: `shift-${shift.id}`,
        date: workDate,
        time: `${shift.shift.startTime} - ${shift.shift.endTime}`,
        type: "shift",
        title: `Ca trực ${shift.shift.name}`,
        description: `Ca ${shift.shift.name.toLowerCase()}`,
        status: shift.status === "ACTIVE" ? "active" : 
               shift.status === "CANCELLED" ? "cancelled" : "active",
        shiftId: shift.shift.id
      })
      
      console.log(` Added shift to schedule:`, {
        id: shift.id,
        date: workDate,
        time: `${shift.shift.startTime} - ${shift.shift.endTime}`,
        shiftName: shift.shift.name
      })
    })
    
    console.log(" Schedule after adding shifts:", schedule.length)

    
    apts.forEach(apt => {
      const appointmentDate = apt.date ? apt.date.split('T')[0] : ""
      const appointmentTime = apt.shift?.startTime || apt.appointmentTime || ""
      const patientName = apt.patientName || apt.patient?.user?.fullName || "Bệnh nhân"
      
      schedule.push({
        id: `appointment-${apt.id}`,
        date: appointmentDate,
        time: appointmentTime,
        type: "appointment",
        title: "Khám bệnh",
        description: `Khám cho ${patientName}`,
        status: apt.status === "COMPLETED" ? "completed" :
               apt.status === "CANCELLED" ? "cancelled" : "active",
        patientName: apt.patientName || apt.patient?.user?.fullName || "Bệnh nhân"
      })
    })

    console.log(" Final schedule:", schedule.length, schedule)
    setPersonalSchedule(schedule)
  }


  useEffect(() => {
    if (!authLoading) {
      fetchDoctorData()
    }
  }, [currentWeek, user, authLoading])

  
  useEffect(() => {
    console.log(" personalSchedule updated:", personalSchedule.length, personalSchedule)
  }, [personalSchedule])

  
  const getScheduleForDate = (date: string) => {
    const filtered = filteredPersonalSchedule.filter(item => {
      
      const itemDate = item.date ? item.date.split('T')[0] : ''
      const targetDate = date ? date.split('T')[0] : ''
      return itemDate === targetDate
    })
    return filtered
  }

  
  const getScheduleForShift = (date: string, shiftTemplate: ShiftTemplate) => {
    const scheduleForDay = getScheduleForDate(date)
    
    return scheduleForDay.filter(item => {
      
      if (item.type === 'shift' && item.shiftId) {
        return item.shiftId === shiftTemplate.id
      }
      
      
      
      const shiftStart = parseInt(shiftTemplate.startTime.split(':')[0])
      const shiftEnd = parseInt(shiftTemplate.endTime.split(':')[0])

      
      let itemStart = 0
      let itemEnd = 0
      
      if (item.time.includes(' - ')) {
        const [start, end] = item.time.split(' - ')
        itemStart = parseInt(start.split(':')[0])
        itemEnd = parseInt(end.split(':')[0])
      } else {
        itemStart = parseInt(item.time.split(':')[0])
        itemEnd = itemStart + 1
      }

      
      
      return (itemStart < shiftEnd) && (itemEnd > shiftStart)
    })
  }

  const getTypeColor = (type: string, status: string) => {
    if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200"
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200"
    
    switch (type) {
      case "shift":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "appointment":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  
  const handleCancelShift = async (shift: PersonalSchedule) => {
    if (shift.type !== 'shift') {
      toast.error('Chỉ có thể hủy ca trực')
      return
    }
    
    setSelectedShiftToCancel(shift)
    setShowCancelModal(true)
    
    
    await loadPreviewData(shift)
  }

  
  const loadPreviewData = async (shift: PersonalSchedule) => {
    setPreviewLoading(true)
    try {
      const shiftId = shift.id.replace('shift-', '')
      const response = await api.get(`/doctor-shifts/${shiftId}/reschedule-preview`)
      
      if (response.data.success) {
        setPreviewData(response.data.data)
      }
    } catch (err: any) {
      console.error('Error loading preview:', err)
      setPreviewData(null)
      toast.error('Không thể tải thông tin xem trước')
    } finally {
      setPreviewLoading(false)
    }
  }

  
  const submitCancelShift = async () => {
    if (!selectedShiftToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy ca')
      return
    }

    setCancelLoading(true)
    try {
      
      const shiftId = selectedShiftToCancel.id.replace('shift-', '')
      
      
      const response = await api.post(`/doctor-shifts/${shiftId}/cancel-and-reschedule`, {
        cancelReason: cancelReason.trim()
      })

      if (response.data.success) {
        toast.success('Yêu cầu hủy ca trực đã được gửi và xử lý thành công')
        
        
        if (response.data.data) {
          const { totalAppointments, rescheduledCount, failedCount } = response.data.data
          if (totalAppointments > 0) {
            toast.info(`Đã xử lý ${totalAppointments} lịch hẹn. Chuyển thành công: ${rescheduledCount}, Thất bại: ${failedCount}`)
          }
        }
        
        
        setPersonalSchedule(prev => 
          prev.map(item => 
            item.id === selectedShiftToCancel.id 
              ? { ...item, status: 'cancelled' }
              : item
          )
        )
        
        
        setShowCancelModal(false)
        setCancelReason("")
        setSelectedShiftToCancel(null)
        
        
        fetchDoctorData()
      } else {
        toast.error(response.data.message || 'Không thể hủy ca trực')
      }
    } catch (err: any) {
      console.error('Error cancelling shift:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi hủy ca trực')
    } finally {
      setCancelLoading(false)
    }
  }

  
  const closeCancelModal = () => {
    setShowCancelModal(false)
    setCancelReason("")
    setSelectedShiftToCancel(null)
    setPreviewData(null)
  }

  const weekDates = getWeekDates()
  const todaySchedule = getScheduleForDate(selectedDate)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch trực...</p>
        </div>
      </div>
    )
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        {}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Lịch Trực Của Tôi
          </h1>
          <p className="text-slate-600">Xem lịch trực và lịch hẹn của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {}
          <div className="lg:col-span-3">
            {}
            {}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
                <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {weekDates[0].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Tìm kiếm lịch trình..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 bg-white"
                  />
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => fetchDoctorData()}
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {}
            <Card>
              {}
              <div className="grid grid-cols-8 border-b bg-white">
                <div className="p-4 border-r text-xs text-gray-500 uppercase">
                  Time
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase()
                  const dayNumber = date.getDate()
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    >
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {dayName}
                      </div>
                      <div
                        className={`text-lg font-semibold mx-auto ${
                          isToday
                            ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            : ""
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
                {shifts.map((shift, shiftIndex) => (
                  <div key={shift.id} className="grid grid-cols-8 border-b min-h-[160px]">
                    <div className="p-4 bg-gray-50 border-r text-center">
                      <div className="text-xl mb-1">
                        {shift.name.toLowerCase().includes('sáng') ? '' : 
                         shift.name.toLowerCase().includes('chiều') ? '️' : 
                         shift.name.toLowerCase().includes('tối') ? '' : '⏰'}
                      </div>
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-xs text-gray-500">
                        {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                      </div>
                    </div>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const scheduleForSlot = getScheduleForShift(dateStr, shift)
                      
                      return (
                        <div key={dayIndex} className="p-2 border-r">
                          {scheduleForSlot.map(item => (
                            <div
                              key={item.id}
                              className={`p-2 mb-2 rounded-lg text-xs border-l-4 relative group ${
                                item.type === 'shift' ? 'bg-blue-50 border-blue-500' : 'bg-purple-50 border-purple-500'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {item.type === 'shift' ? 
                                  <Clock className="w-3 h-3" /> : 
                                  <User className="w-3 h-3" />
                                }
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <div className="text-gray-600">{item.time}</div>
                              <div className="text-gray-500">{item.description}</div>
                              <Badge 
                                variant="outline" 
                                className={`mt-1 text-xs ${getTypeColor(item.type, item.status)}`}
                              >
                                {item.status === 'active' ? 'Đang hoạt động' :
                                 item.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </Badge>
                            </div>
                          ))}
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
            {}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Hôm nay ({new Date().toLocaleDateString('vi-VN')})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng lịch trình</span>
                  <span className="font-semibold text-gray-900">{todaySchedule.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ca trực</span>
                  <span className="font-semibold text-blue-600">
                    {todaySchedule.filter(s => s.type === 'shift').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lịch hẹn</span>
                  <span className="font-semibold text-purple-600">
                    {todaySchedule.filter(s => s.type === 'appointment').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch trình tiếp theo</CardTitle>
              </CardHeader>
              <CardContent>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.slice(0, 2).map((item) => (
                      <div key={item.id} className={`p-3 rounded-lg border ${
                        item.type === 'shift' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'shift' ? 
                            <Clock className="w-4 h-4" /> : 
                            <User className="w-4 h-4" />
                          }
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <div className="text-sm text-gray-600">{item.time}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Không có lịch trình hôm nay</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thống kê tuần</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ca trực tuần này</span>
                  <span className="font-semibold text-blue-600">
                    {personalSchedule.filter(s => s.type === 'shift').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lịch hẹn tuần này</span>
                  <span className="font-semibold text-purple-600">
                    {personalSchedule.filter(s => s.type === 'appointment').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đã hoàn thành</span>
                  <span className="font-semibold text-green-600">
                    {personalSchedule.filter(s => s.status === 'completed').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              Hủy Ca Trực
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedShiftToCancel && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm mb-1">
                  {selectedShiftToCancel.title}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedShiftToCancel.time} - {new Date(selectedShiftToCancel.date).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedShiftToCancel.description}
                </div>
              </div>
            )}

            {}
            {previewLoading && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700">Đang tải thông tin preview...</span>
                </div>
              </div>
            )}

            {previewData && !previewLoading && (
              <div className={`p-3 rounded-lg ${previewData.warning ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <div className="text-sm font-medium mb-2">
                   Thông tin tác động:
                </div>
                <div className="space-y-1 text-sm">
                  <div>• Số lịch hẹn bị ảnh hưởng: <span className="font-medium">{previewData.affectedAppointments}</span></div>
                  {previewData.hasReplacementDoctor ? (
                    <div className="text-green-700">•  Có bác sĩ thay thế (ID: {previewData.replacementDoctorId})</div>
                  ) : (
                    <div className="text-yellow-700">• ️ Không có bác sĩ thay thế cùng chuyên khoa</div>
                  )}
                  {previewData.canAutoReschedule ? (
                    <div className="text-green-700">•  Có thể tự động chuyển lịch hẹn</div>
                  ) : (
                    <div className="text-yellow-700">• ️ Không thể tự động chuyển lịch hẹn</div>
                  )}
                </div>
                {previewData.warning && (
                  <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                    {previewData.warning}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">
                Lý do yêu cầu hủy ca trực <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Vui lòng nhập lý do yêu cầu hủy ca trực..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Ca trực sẽ được hủy và hệ thống sẽ tự động xử lý các lịch hẹn liên quan.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={closeCancelModal}
              disabled={cancelLoading}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={submitCancelShift}
              disabled={cancelLoading || !cancelReason.trim() || previewLoading}
            >
              {cancelLoading ? "Đang xử lý..." : "Xác nhận hủy ca"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DoctorSidebar>
  )
}