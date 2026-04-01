"use client"

import { useState, useEffect } from "react"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import api from "../../lib/api"
import { 
  Calendar, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  Stethoscope,
  Ban
} from "lucide-react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card"


interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  replacedBy?: number | null
  cancelReason?: string | null
  doctor: {
    id: number
    user: {
      fullName: string
      email: string
      avatar?: string
    }
    specialty: {
      name: string
    }
  }
  shift: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
}


interface PreviewData {
  doctorShiftId: number
  affectedAppointments: number
  hasReplacementDoctor: boolean
  replacementDoctorId?: number
  canAutoReschedule: boolean
  warning?: string
}

export default function DoctorShiftPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [doctorShifts, setDoctorShifts] = useState<DoctorShift[]>([])
  const [loading, setLoading] = useState(true)
  
  
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedShiftToCancel, setSelectedShiftToCancel] = useState<DoctorShift | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
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

  
  const fetchDoctorShifts = async () => {
    try {
      setLoading(true)
      
      const response = await api.get('/doctor-shifts')
      if (response.data.success) {
        setDoctorShifts(response.data.data || [])
        console.log(`Đã tải ${response.data.data?.length || 0} ca trực`)
      } else {
        console.error('Không thể tải danh sách ca trực')
        setDoctorShifts([])
      }
    } catch (err: any) {
      console.error('Error fetching doctor shifts:', err)
      setDoctorShifts([])
      toast.error('Không thể tải danh sách ca trực')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctorShifts()
  }, [currentWeek])

  
  const getShiftsForDate = (date: string) => {
    return doctorShifts.filter(shift => shift.workDate === date)
  }

  
  const handleCancelShift = async (shift: DoctorShift) => {
    setSelectedShiftToCancel(shift)
    setShowCancelModal(true)
    
    
    await loadPreviewData(shift)
  }

  
  const loadPreviewData = async (shift: DoctorShift) => {
    setPreviewLoading(true)
    try {
      const response = await api.get(`/doctor-shifts/${shift.id}/reschedule-preview`)
      
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
      const response = await api.post(`/doctor-shifts/${selectedShiftToCancel.id}/cancel-and-reschedule`, {
        cancelReason: cancelReason.trim()
      })

      if (response.data.success) {
        toast.success('Ca trực đã được hủy và xử lý thành công')
        
        
        if (response.data.data) {
          const { totalAppointments, rescheduledCount, failedCount } = response.data.data
          if (totalAppointments > 0) {
            toast.info(`Đã xử lý ${totalAppointments} lịch hẹn. Chuyển thành công: ${rescheduledCount}, Thất bại: ${failedCount}`)
          }
        }
        
        
        setShowCancelModal(false)
        setCancelReason("")
        setSelectedShiftToCancel(null)
        setPreviewData(null)
        
        
        fetchDoctorShifts()
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

  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  
  const goToToday = () => {
    setCurrentWeek(new Date())
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const weekDates = getWeekDates()

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách ca trực...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Quản Lý Ca Trực
          </h1>
          <p className="text-slate-600">Quản lý lịch trực của bác sĩ và xử lý hủy ca</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {}
          <div className="lg:col-span-3">
            {}
            <div className="flex items-center gap-3 mb-4">
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
              <div className="ml-auto">
                <Button 
                  variant="outline"
                  onClick={() => fetchDoctorShifts()}
                >
                  Làm mới
                </Button>
              </div>
            </div>

            {}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              {}
              <div className="grid grid-cols-8 border-b bg-gradient-to-r from-slate-50 to-blue-50/50">
                <div className="p-4 border-r text-xs text-slate-500 uppercase font-semibold">
                  Bác sĩ
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase()
                  const dayNumber = date.getDate()
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-blue-50/50 transition-colors ${
                        isToday ? "bg-blue-100/50" : ""
                      }`}
                      onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
                    >
                      <div className="text-xs text-slate-500 uppercase mb-1 font-medium">
                        {dayName}
                      </div>
                      <div
                        className={`text-lg font-bold mx-auto ${
                          isToday
                            ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
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
                {weekDates.map((date, dayIndex) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const shiftsForDay = getShiftsForDate(dateStr)
                  
                  return (
                    <div key={dayIndex} className="grid grid-cols-8 border-b min-h-[120px] hover:bg-slate-50/30 transition-colors">
                      <div className="p-4 bg-slate-50/50 border-r">
                        <div className="text-sm font-medium text-slate-700">
                          {date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' })}
                        </div>
                      </div>

                      {}
                      <div className="col-span-7 p-3">
                        {shiftsForDay.length > 0 ? (
                          <div className="space-y-2">
                            {shiftsForDay.map(shift => (
                              <HoverCard openDelay={100} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className={`p-3 rounded-lg border-l-4 relative group shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                      shift.status === 'ACTIVE' ? 'bg-green-50 border-green-500 hover:bg-green-100/50' :
                                      shift.status === 'CANCELLED' ? 'bg-red-50 border-red-500 hover:bg-red-100/50' :
                                      'bg-yellow-50 border-yellow-500 hover:bg-yellow-100/50'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold overflow-hidden shrink-0 border border-blue-200">
                                            {shift.doctor.user.avatar ? (
                                              <img 
                                                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${shift.doctor.user.avatar}`} 
                                                alt={shift.doctor.user.fullName}
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              shift.doctor.user.fullName.charAt(0).toUpperCase()
                                            )}
                                          </div>
                                          <span className="font-semibold text-sm text-slate-900 line-clamp-1">{shift.doctor.user.fullName}</span>
                                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap hidden sm:inline-flex">
                                            {shift.doctor.specialty.name}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                          <Clock className="w-3 h-3 flex-shrink-0" />
                                          <span className="font-medium whitespace-nowrap">{shift.shift.name}: {shift.shift.startTime} - {shift.shift.endTime}</span>
                                        </div>
                                        {shift.cancelReason && (
                                          <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded">
                                            <strong>Lý do hủy:</strong> {shift.cancelReason}
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 pl-2">
                                        <Badge 
                                          variant="outline" 
                                          className={`text-xs font-medium whitespace-nowrap ${
                                            shift.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-300' :
                                            shift.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300' :
                                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                                          }`}
                                        >
                                          {shift.status === 'ACTIVE' ? 'Đang hoạt động' :
                                           shift.status === 'CANCELLED' ? 'Đã hủy' : 'Đã thay thế'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent align="start" className="w-56 p-2 bg-white/95 backdrop-blur-sm shadow-xl border-slate-100">
                                   <div className="flex flex-col gap-1">
                                      {shift.status === 'ACTIVE' ? (
                                        <Button 
                                          variant="ghost" 
                                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium" 
                                          onClick={() => handleCancelShift(shift)}
                                        >
                                          <Ban className="w-4 h-4 mr-2" />
                                          Hủy ca trực
                                        </Button>
                                      ) : (
                                        <div className="text-center text-xs text-slate-400 py-2 italic">
                                          Không có thao tác khả dụng
                                        </div>
                                      )}
                                   </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Không có ca trực</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            {}
            <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Thống kê hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tổng ca trực</span>
                  <span className="font-bold text-slate-900 text-lg">
                    {getShiftsForDate(selectedDate).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Đang hoạt động</span>
                  <span className="font-bold text-green-600 text-lg">
                    {getShiftsForDate(selectedDate).filter(s => s.status === 'ACTIVE').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Đã hủy</span>
                  <span className="font-bold text-red-600 text-lg">
                    {getShiftsForDate(selectedDate).filter(s => s.status === 'CANCELLED').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Đã thay thế</span>
                  <span className="font-bold text-yellow-600 text-lg">
                    {getShiftsForDate(selectedDate).filter(s => s.status === 'REPLACED').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Thống kê tuần</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Tổng ca trực</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {doctorShifts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Đang hoạt động</span>
                  <span className="font-bold text-green-600 text-lg">
                    {doctorShifts.filter(s => s.status === 'ACTIVE').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Đã hủy</span>
                  <span className="font-bold text-red-600 text-lg">
                    {doctorShifts.filter(s => s.status === 'CANCELLED').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <X className="w-6 h-6 text-red-600" />
                Hủy Ca Trực
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedShiftToCancel && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-base mb-2 text-slate-900">
                    {selectedShiftToCancel.doctor.user.fullName}
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{selectedShiftToCancel.shift.name}: {selectedShiftToCancel.shift.startTime} - {selectedShiftToCancel.shift.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày: {new Date(selectedShiftToCancel.workDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      <span>Chuyên khoa: {selectedShiftToCancel.doctor.specialty.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {}
              {previewLoading && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700 font-medium">Đang tải thông tin preview...</span>
                  </div>
                </div>
              )}

              {previewData && !previewLoading && (
                <div className={`p-4 rounded-lg border ${previewData.warning ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                    {previewData.warning ? <AlertTriangle className="w-5 h-5 text-yellow-600" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
                    Thông tin tác động:
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Số lịch hẹn bị ảnh hưởng: <span className="font-semibold">{previewData.affectedAppointments}</span>
                    </div>
                    {previewData.hasReplacementDoctor ? (
                      <div className="text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Có bác sĩ thay thế (ID: {previewData.replacementDoctorId})
                      </div>
                    ) : (
                      <div className="text-yellow-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Không có bác sĩ thay thế cùng chuyên khoa
                      </div>
                    )}
                    {previewData.canAutoReschedule ? (
                      <div className="text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Có thể tự động chuyển lịch hẹn
                      </div>
                    ) : (
                      <div className="text-yellow-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Không thể tự động chuyển lịch hẹn
                      </div>
                    )}
                  </div>
                  {previewData.warning && (
                    <div className="mt-3 p-3 bg-yellow-100 rounded text-sm text-yellow-800">
                      <strong>Cảnh báo:</strong> {previewData.warning}
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="cancel-reason" className="text-sm font-medium">
                  Lý do hủy ca trực <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Vui lòng nhập lý do hủy ca trực..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  Hệ thống sẽ tự động tìm bác sĩ thay thế và chuyển lịch hẹn, đồng thời gửi email thông báo cho bệnh nhân.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeCancelModal}
                disabled={cancelLoading}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                onClick={submitCancelShift}
                disabled={cancelLoading || !cancelReason.trim() || previewLoading}
                className="flex-1"
              >
                {cancelLoading ? "Đang xử lý..." : "Xác nhận hủy ca"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}