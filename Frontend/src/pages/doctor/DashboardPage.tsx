"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, Users, Clock, Eye, Loader2, Stethoscope } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Calendar } from "../../components/ui/calendar"
import DoctorSidebar from "../../components/layout/sidebar/doctor"
import UpcomingAppointmentsWidget from "../../features/appointment/components/UpcomingAppointmentsWidget"
import api from "../../lib/api"
import { toast } from "sonner"
import { useAuth } from "../../features/auth/context/authContext"


interface Appointment {
  id: string | number
  visitId?: string | number
  appointmentId?: string | number
  patientId?: string | number
  patient?: {
    fullName?: string
    phone?: string
    gender?: string
    birthDate?: string
  }
  shift?: {
    startTime: string
    endTime: string
  }
  date?: string
  status: string
  isVisit?: boolean
}

export default function DoctorDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [date])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const targetDate = date || new Date()
      const offset = targetDate.getTimezoneOffset()
      const localDate = new Date(targetDate.getTime() - (offset * 60 * 1000))
      const dateString = localDate.toISOString().split('T')[0]
      const today = dateString
      
      
      const [appointmentsRes, visitsRes] = await Promise.all([
        api.get(`/appointments?date=${dateString}`),
        api.get(`/visits?startDate=${dateString}&endDate=${dateString}`)
      ])
      
      if (appointmentsRes.data.success && visitsRes.data.success) {
        const appointments = appointmentsRes.data.data || []
        const visits = visitsRes.data.data || []
        
        
        console.log(" Doctor Dashboard - Visits:", visits.length, visits)
        console.log(" Doctor Dashboard - Appointments:", appointments.length, appointments)
        
        
        
        
        const allPatients = [
          ...visits.map((visit: any) => {
            const visitDate = visit.checkInTime
              ? new Date(visit.checkInTime).toISOString().split('T')[0]
              : today
            return {
              id: visit.id,
              visitId: visit.id,
              appointmentId: visit.appointmentId,
              patientId: visit.patientId,
              patient: {
                ...visit.patient,
                fullName: visit.appointment?.patientName || visit.patient?.fullName || visit.patient?.user?.fullName
              },
              shift: visit.appointment?.shift || { startTime: 'N/A', endTime: 'N/A' },
              date: visitDate,
              status: visit.status, 
              isVisit: true,
            }
          }),
          ...appointments
            .filter((apt: any) => apt.status === 'WAITING' || apt.status === 'CHECKED_IN')
            .filter((apt: any) => !visits.some((v: any) => v.appointmentId === apt.id))
            .map((apt: any) => ({
              ...apt,
              patient: {
                ...apt.patient,
                fullName: apt.patientName || apt.patient?.fullName || apt.patient?.user?.fullName
              },
              isVisit: false,
            }))
        ]
        
        console.log(" Doctor Dashboard - All Patients:", allPatients.length, allPatients)
        
        const todayAppointmentsCount = allPatients.length
        const todayPatientsCount = new Set(allPatients.map((p: any) => p.patientId)).size
        const completedVisits = visits.filter((v: any) => v.status === 'COMPLETED').length
        const pendingAppointments = allPatients.filter((p: any) => 
          p.status === 'WAITING' || p.status === 'CHECKED_IN' || p.status === 'EXAMINING'
        ).length
        
        setDashboardData({
          stats: {
            todayAppointments: todayAppointmentsCount,
            todayPatients: todayPatientsCount,
            patientChange: 0, 
            completedVisits,
            pendingAppointments,
          },
          appointments: allPatients.slice(0, 10), 
        })
      } else {
        
        setDashboardData({
          stats: {
            todayAppointments: 0,
            todayPatients: 0,
            patientChange: 0,
            completedVisits: 0,
            pendingAppointments: 0,
          },
          appointments: [],
        })
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      })
      
      if (import.meta.env.DEV) {
        toast.error(`Error: ${err.response?.data?.message || err.message}`)
      }
      
      setDashboardData({
        stats: {
          todayAppointments: 0,
          todayPatients: 0,
          patientChange: 0,
          completedVisits: 0,
          pendingAppointments: 0,
        },
        appointments: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Appointment["status"]) => {
    const config: Record<string, string> = {
      WAITING: "bg-amber-500/10 text-amber-700 border-amber-200",
      CHECKED_IN: "bg-blue-500/10 text-blue-700 border-blue-200",
      EXAMINING: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      EXAMINED: "bg-purple-500/10 text-purple-700 border-purple-200",
      COMPLETED: "bg-green-500/10 text-green-700 border-green-200",
      CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
      NO_SHOW: "bg-gray-500/10 text-gray-700 border-gray-200",
    }
    const labels: Record<string, string> = {
      WAITING: "Chờ checkin",
      CHECKED_IN: "Đã check-in",
      EXAMINING: "Đang khám",
      EXAMINED: "Đã khám",
      COMPLETED: "Đã khám",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Không đến",
    }

    return (
      <Badge variant="outline" className={config[status] || "bg-gray-500/10 text-gray-700 border-gray-200"}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatTime = (timeString: string) => {
    
    return timeString.substring(0, 5)
  }

  const stats = dashboardData?.stats || {
    todayAppointments: 0,
    todayPatients: 0,
    patientChange: 0,
    completedVisits: 0,
    pendingAppointments: 0,
  }

  const appointments = dashboardData?.appointments || []

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-4 lg:p-10 max-w-[1600px] mx-auto space-y-12">
          
          {}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-indigo-100/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 hidden md:block">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600">
                  Xin chào, {user?.fullName || 'Bác sĩ'}
                </h1>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-500" />
                  {date?.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => fetchDashboardData()} variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
                 <Clock className="w-4 h-4 mr-2" />
                 Cập nhật dữ liệu
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {}
            <div className="xl:col-span-2 space-y-8">

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl overflow-hidden relative group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <CalendarIcon className="w-24 h-24 text-blue-900" />
                  </div>
                  <CardContent className="p-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">Lịch hẹn hôm nay</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.todayAppointments}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white/60 backdrop-blur-xl overflow-hidden relative group hover:shadow-md transition-all duration-300">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600"></div>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                    <Users className="w-24 h-24 text-emerald-900" />
                  </div>
                  <CardContent className="p-6 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">Bệnh nhân hôm nay</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stats.todayPatients}</h3>
                        <div className={`text-xs font-bold mt-1 ${stats.patientChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {stats.patientChange >= 0 ? '+' : ''}{stats.patientChange.toFixed(1)}% so với hôm qua
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {}
              <div className="rounded-2xl border border-indigo-100/50 overflow-hidden shadow-sm bg-white/60 backdrop-blur-sm">
                 <UpcomingAppointmentsWidget limit={5} />
              </div>

              {}
              <Card className="border-0 shadow-sm overflow-hidden bg-white">
                <CardHeader className="bg-white border-b border-slate-100 px-6 py-5">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div>
                            <CardTitle className="text-lg font-bold text-slate-900">Danh sách lịch hẹn</CardTitle>
                            <p className="text-sm text-slate-500 font-medium">Chi tiết các ca khám trong ngày</p>
                         </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/doctor/patients')} className="text-indigo-600 hover:bg-indigo-50 font-medium">
                        Xem tất cả
                      </Button>
                   </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="text-left py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Bệnh nhân</th>
                          <th className="text-left py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Giờ khám</th>
                          <th className="text-left py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Trạng thái</th>
                          <th className="text-right py-4 px-6 text-[11px] uppercase tracking-wider font-bold text-slate-500">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 px-6 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <CalendarIcon className="w-12 h-12 text-slate-200 mb-3" />
                                <p className="text-slate-500 font-medium">Không có lịch hẹn sắp tới</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          appointments.map((appointment: Appointment) => (
                            <tr
                              key={appointment.id}
                              className="group hover:bg-indigo-50/30 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                                    {appointment.patient?.fullName?.charAt(0) || 'N'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                      {appointment.patient?.fullName || 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {appointment.patient?.gender === 'MALE' ? 'Nam' : appointment.patient?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                      {appointment.patient?.birthDate && ` • ${new Date().getFullYear() - new Date(appointment.patient.birthDate).getFullYear()} tuổi`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-100/50 px-2 py-1 rounded w-fit">
                                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                                  {appointment.shift ? formatTime(appointment.shift.startTime) : '--:--'}
                                </div>
                              </td>
                              <td className="py-4 px-6">{getStatusBadge(appointment.status)}</td>
                              <td className="py-4 px-6 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                  onClick={() => {
                                    if (appointment.isVisit) {
                                      if (appointment.status === 'EXAMINED') {
                                        navigate(`/doctor/prescribe/${appointment.appointmentId}`)
                                      } else if (appointment.status === 'EXAMINING') {
                                        navigate(`/doctor/patients/${appointment.visitId}`)
                                      } else if (appointment.status === 'COMPLETED') {
                                        navigate(`/doctor/visits/${appointment.visitId}`)
                                      }
                                    } else if (appointment.appointmentId) {
                                      navigate(`/doctor/patients/${appointment.appointmentId}`)
                                    } else {
                                      navigate(`/appointments/${appointment.id}`)
                                    }
                                  }}
                                >
                                  {appointment.status === 'EXAMINED' ? 'Kê đơn thuốc' :
                                   appointment.status === 'EXAMINING' ? 'Tiếp tục khám' :
                                   appointment.status === 'COMPLETED' ? 'Xem chi tiết' :
                                   'Bắt đầu khám'}
                                  <Eye className="h-4 w-4 ml-2" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    Lịch làm việc
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-xl border border-slate-100 shadow-sm p-4 w-full flex justify-center"
                  />
                  <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-xl border border-indigo-100/50">
                    <div className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Lịch trình ngày {date?.toLocaleDateString("vi-VN")}
                    </div>
                    <div className="flex items-center justify-between text-sm text-indigo-700/80 bg-white/50 p-2 rounded-lg backdrop-blur mx-auto">
                      <span className="font-medium">Tổng lịch hẹn:</span>
                      <span className="font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                        {stats.todayAppointments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/30">
                <h3 className="font-bold text-lg mb-2">Lời nhắc hôm nay</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                  Đừng quên kiểm tra lịch sử bệnh án của bệnh nhân trước khi bắt đầu khám. Ghi chú đầy đủ triệu chứng để chẩn đoán chính xác.
                </p>
                <div className="h-1 w-12 bg-white/30 rounded-full"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DoctorSidebar>
  )
}