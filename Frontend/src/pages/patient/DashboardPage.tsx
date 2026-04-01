"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Calendar, Clock, FileText, Pill, Plus, Heart, ChevronRight, Activity, Thermometer, User, Stethoscope, ChevronLeft } from "lucide-react"
import { useAuth } from "../../features/auth/context/authContext"
import { getMyAppointments, type Appointment } from "../../features/appointment/services/appointment.service"
import { getPatientById, getPatientMedicalHistory, type Visit } from "../../features/patient/services/patient.service"
import { toast } from "sonner"
import { Skeleton } from "../../components/ui/skeleton"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { AppointmentCard } from "../../features/appointment/components/AppointmentCard"
import { PremiumPagination } from "../../components/ui/premium-pagination"
import type { IAppointment } from "../../types/appointment"

export default function PatientDashboardPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [patientCode, setPatientCode] = useState<string>("")
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [latestVisit, setLatestVisit] = useState<Visit | null>(null)
  const [greeting, setGreeting] = useState("")
  const [historyPage, setHistoryPage] = useState(1)
  const HISTORY_ITEMS_PER_PAGE = 3

  const convertToIAppointment = (apt: Appointment): IAppointment => {
    return {
      id: apt.id.toString(),
      date: apt.date,
      time: apt.shift ? `${apt.shift.startTime.substring(0, 5)} - ${apt.shift.endTime.substring(0, 5)}` : "00:00",
      doctor: {
        id: apt.doctor?.id || 0,
        name: apt.doctor?.user?.fullName || "Bác sĩ",
        specialty: apt.doctor?.specialty?.name || "Đa khoa",
        image: apt.doctor?.user?.avatar || "/placeholder.svg",
      },
      status: (apt.displayStatus || apt.status) as any,
      rawStatus: apt.status,
      displayStatus: apt.displayStatus,
      type: apt.bookingType === "ONLINE" ? "Online" : "Offline",
      location: "Phòng khám Đa khoa",
      reason: apt.symptomInitial || "",
      patient: {
          id: user?.patientId || 0,
          name: user?.fullName || "Bệnh nhân",
          code: patientCode,
          email: user?.email || "",
      }
    }
  }

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Chào buổi sáng")
    else if (hour < 18) setGreeting("Chào buổi chiều")
    else setGreeting("Chào buổi tối")
  }, [])



  useEffect(() => {
    const fetchData = async () => {
      if (!user?.patientId) {
        setIsLoading(false)
        if (window.location.pathname !== "/patient/setup") {
          navigate("/patient/setup")
        }
        return
      }

      try {
        setIsLoading(true)

        
        try {
          const patient = await getPatientById(user.patientId)
          setPatientCode(patient.patientCode || "")
        } catch (error: any) {
          console.error("Error fetching patient profile:", error)
        }

        
        const appointments = await getMyAppointments()

        const now = new Date()
        const upcoming = appointments
          .filter((apt) => {
            const dateOk = new Date(apt.date) >= now
            const isWaitingFlow = ["WAITING", "CHECKED_IN", "IN_PROGRESS"].includes(apt.status)
            return dateOk && isWaitingFlow
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const past = appointments
          .filter((apt) => new Date(apt.date) < now || apt.status === "COMPLETED")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setRecentAppointments(past)
        setUpcomingAppointments(upcoming)
        
        setCurrentIndex(0)

        
        try {
          const historyData = await getPatientMedicalHistory(user.patientId, 1, 1)
          if (historyData.data && historyData.data.length > 0) {
            setLatestVisit(historyData.data[0])
          }
        } catch (error: any) {
          console.error("Error fetching latest visit:", error)
          
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Không thể tải dữ liệu dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user && user.patientId) {
      fetchData()
    }
  }, [user?.patientId, user, authLoading, navigate])

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai"
    } else {
      return format(d, "EEEE, dd/MM/yyyy", { locale: vi })
    }
  }

  const formatTime = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return ""
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`
  }

  const handleNextAppt = () => {
    setCurrentIndex((prev) => (prev + 1) % upcomingAppointments.length)
  }

  const handlePrevAppt = () => {
    setCurrentIndex((prev) => (prev - 1 + upcomingAppointments.length) % upcomingAppointments.length)
  }

  const currentAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[currentIndex] : null

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
      patientCode={patientCode}
    >
      <div className="space-y-8 animate-in fade-in duration-500">
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {greeting}, <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">{user?.fullName || "Bệnh nhân"}</span> !
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-light">
              Chúc bạn một ngày tràn đầy năng lượng và sức khỏe!
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95 rounded-xl h-12 px-6 text-md font-medium"
            onClick={() => navigate("/patient/book-appointment")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Đặt lịch khám mới
          </Button>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-100 p-1 h-full transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Calendar className="w-64 h-64 -mr-16 -mt-16 text-white" />
              </div>

              {}
              {upcomingAppointments.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePrevAppt(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleNextAppt(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {upcomingAppointments.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 h-full flex flex-col justify-between border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3 px-3 py-1">
                      {upcomingAppointments.length > 1 ? `Lịch hẹn sắp tới (${currentIndex + 1}/${upcomingAppointments.length})` : 'Lịch hẹn sắp tới'}
                    </Badge>
                    {isLoading ? (
                      <div className="space-y-3 mt-2">
                        <Skeleton className="h-8 w-48 bg-white/20" />
                        <Skeleton className="h-6 w-32 bg-white/10" />
                      </div>
                    ) : currentAppointment ? (
                      <div className="mt-2 animate-in fade-in duration-300" key={currentAppointment.id}>
                        <h3 className="text-3xl font-bold mb-2 tracking-tight">
                          {currentAppointment.doctor?.user?.fullName || "Khám tổng quát"}
                        </h3>
                        <p className="text-blue-50 text-lg flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" />
                          {currentAppointment.doctor?.user?.fullName || "BS. Unknown"} - {currentAppointment.doctor?.specialty?.name || "Khoa khám bệnh"}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <h3 className="text-2xl font-bold mb-2">Không có lịch hẹn</h3>
                        <p className="text-blue-50">Bạn chưa đặt lịch hẹn nào sắp tới.</p>
                      </div>
                    )}
                  </div>
                  {currentAppointment && (
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-md border border-white/20 text-center min-w-[80px]">
                      <div className="text-xs font-medium uppercase opacity-80">
                        {currentAppointment.date ? format(new Date(currentAppointment.date), "MMM", { locale: vi }) : ""}
                      </div>
                      <div className="text-3xl font-bold">
                        {currentAppointment.date ? format(new Date(currentAppointment.date), "dd") : "--"}
                      </div>
                    </div>
                  )}
                </div>

                {currentAppointment && (
                   <div className="mt-8 grid grid-cols-2 gap-4">
                     <div className="bg-black/10 rounded-lg p-3 flex items-center gap-3">
                       <div className="bg-white/20 p-2 rounded-full">
                         <Clock className="w-5 h-5" />
                       </div>
                       <div>
                          <div className="text-xs opacity-70">Thời gian</div>
                          <div className="font-semibold">{currentAppointment.shift ? formatTime(currentAppointment.shift.startTime, currentAppointment.shift.endTime) : "--:--"}</div>
                       </div>
                     </div>
                     <div className="bg-black/10 rounded-lg p-3 flex items-center gap-3">
                       <div className="bg-white/20 p-2 rounded-full">
                         <Calendar className="w-5 h-5" />
                       </div>
                       <div>
                          <div className="text-xs opacity-70">Ngày khám</div>
                          <div className="font-semibold">{formatDate(currentAppointment.date)}</div>
                       </div>
                     </div>
                   </div>
                )}
                
                {!currentAppointment && (
                  <div className="mt-6">
                     <Button 
                      variant="secondary" 
                      onClick={() => navigate("/patient/book-appointment")}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold border-0 shadow-lg"
                    >
                      Đặt lịch ngay
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Chỉ số sức khỏe</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Cập nhật: {latestVisit?.checkInTime ? format(new Date(latestVisit.checkInTime), "dd/MM/yyyy") : "N/A"}
                </p>
              </div>
              <div className="p-2 bg-rose-50 rounded-full">
                <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 flex-1">
              <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Huyết áp</p>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVisit?.vitalSigns?.bloodPressure || "--/--"} <span className="text-xs font-normal text-slate-400">mmHg</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mr-4">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Nhịp tim</p>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVisit?.vitalSigns?.heartRate || "--"} <span className="text-xs font-normal text-slate-400">BPM</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 mr-4">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Nhiệt độ</p>
                  <p className="text-lg font-bold text-slate-900">
                    {latestVisit?.vitalSigns?.temperature || "--"} <span className="text-xs font-normal text-slate-400">°C</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { title: "Đơn thuốc", desc: "Danh sách đơn thuốc", icon: Pill, color: "text-emerald-600", bg: "bg-emerald-50", link: "/patient/prescriptions" },
             { title: "Lịch sử khám", desc: "Hồ sơ bệnh án", icon: FileText, color: "text-blue-600", bg: "bg-blue-50", link: "/patient/medical-history" },
             { title: "Gói khám bệnh", desc: "Đăng ký gói khám", icon: Stethoscope, color: "text-orange-600", bg: "bg-orange-50", link: "/patient/packages" },
             { title: "Hồ sơ cá nhân", desc: "Thông tin cá nhân", icon: User, color: "text-purple-600", bg: "bg-purple-50", link: "/patient/profile" }
           ].map((item, idx) => (
             <button 
                key={idx}
                onClick={() => navigate(item.link)}
                className="flex items-center p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 group text-left"
              >
                <div className={`w-12 h-12 rounded-full ${item.bg} ${item.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
             </button>
           ))}
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {}
           <div className="lg:col-span-2">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100 p-6 h-full flex flex-col">
                 <div className="flex items-center justify-between mb-6 shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Lịch sử khám bệnh</h2>
                   </div>
                 </div>

                 {isLoading ? (
                   <div className="space-y-4 flex-1">
                     {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                   </div>
                 ) : recentAppointments.length > 0 ? (
                   <div className="flex flex-col flex-1">
                     <div className="space-y-4 flex-1">
                       {recentAppointments
                          .slice((historyPage - 1) * HISTORY_ITEMS_PER_PAGE, historyPage * HISTORY_ITEMS_PER_PAGE)
                          .map((apt, index) => (
                          <div 
                             key={apt.id} 
                             className="transition-all duration-200 hover:scale-[1.01] animate-in fade-in"
                             style={{ animationDelay: `${index * 30}ms` }}
                          >
                             <AppointmentCard
                                appointment={convertToIAppointment(apt)}
                                onViewDetails={() => navigate(`/appointments/${apt.id}`)}
                             />
                          </div>
                        ))}
                     </div>
                      
                      {}
                      <div className="mt-4 shrink-0">
                        <PremiumPagination 
                          currentPage={historyPage}
                          totalPages={Math.ceil(recentAppointments.length / HISTORY_ITEMS_PER_PAGE)}
                          totalItems={recentAppointments.length}
                          itemsPerPage={HISTORY_ITEMS_PER_PAGE}
                          onPageChange={setHistoryPage}
                        />
                      </div>
                   </div>
                 ) : (
                   <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-12 text-center flex-1 flex flex-col items-center justify-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                       <Calendar className="w-8 h-8 text-gray-400" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-1">Chưa có lịch sử khám</h3>
                     <p className="text-gray-500 mb-6 max-w-sm mx-auto">Bạn chưa có lịch sử khám bệnh nào. Hãy đặt lịch khám ngay hôm nay để theo dõi sức khỏe.</p>
                     <Button onClick={() => navigate("/patient/book-appointment")}>
                        Đặt lịch khám ngay
                     </Button>
                   </div>
                 )}
             </div>
           </div>

           {}
           <div className="space-y-6">
             {}
             <div className="rounded-2xl overflow-hidden shadow-lg relative group h-48">
               <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
               <img 
                 src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80" 
                 alt="Medical"
                 className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
               />
               <div className="relative p-6 h-full flex flex-col justify-end text-white z-10">
                 <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm self-start mb-auto">Mới</Badge>
                 <h3 className="font-bold text-xl mb-1">Gói Khám Tổng Quát</h3>
                 <p className="text-indigo-100 text-sm mb-3">Ưu đãi 20% cho lần đầu đặt lịch</p>
                 <Button size="sm" variant="secondary" className="self-start text-indigo-700 font-bold">Tìm hiểu thêm</Button>
               </div>
             </div>

             {}
             <div className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100 p-6">
               <div className="flex items-center justify-between mb-4">
                 <h3 className="font-bold text-gray-900 capitalize">{format(new Date(), "MMMM yyyy", { locale: vi })}</h3>
                 <div className="flex space-x-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-gray-500">Sắp tới</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-gray-500">Đã khám</span>
                    </div>
                 </div>
               </div>
               
               <div className="grid grid-cols-7 gap-1 text-center mb-2">
                 {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
                   <span key={d} className="text-xs font-semibold text-gray-400">{d}</span>
                 ))}
               </div>
               
               <div className="grid grid-cols-7 gap-1 text-center text-sm">
                 {(() => {
                   const today = new Date()
                   const start = new Date(today.getFullYear(), today.getMonth(), 1)
                   const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                   
                   
                   
                   let startDay = start.getDay()
                   let offset = startDay === 0 ? 6 : startDay - 1
                   
                   const days = []
                   
                   
                   for (let i = 0; i < offset; i++) {
                     days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
                   }
                   
                   
                   for (let d = 1; d <= end.getDate(); d++) {
                     const date = new Date(today.getFullYear(), today.getMonth(), d)
                     const isToday = d === today.getDate()
                     
                     
                     const upcomingAppt = upcomingAppointments.find(a => new Date(a.date).toDateString() === date.toDateString())
                     const pastAppt = recentAppointments.find(a => new Date(a.date).toDateString() === date.toDateString())
                     const relevantAppt = upcomingAppt || pastAppt
                     
                     const hasUpcoming = !!upcomingAppt
                     const hasPast = !!pastAppt
                     
                     let bgClass = "text-gray-700"
                     
                     if (isToday) {
                       bgClass = "bg-gray-900 text-white shadow-md"
                     } else if (hasUpcoming) {
                       bgClass = "bg-blue-100 text-blue-700 font-bold hover:bg-blue-200"
                     } else if (hasPast) {
                       bgClass = "bg-green-100 text-green-700 font-bold hover:bg-green-200"
                     } else {
                       bgClass = "hover:bg-gray-50"
                     }
                     
                     days.push(
                       <div 
                        key={d} 
                        onClick={() => relevantAppt && navigate(`/appointments/${relevantAppt.id}`)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-colors mx-auto ${bgClass} ${relevantAppt ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}
                        title={relevantAppt ? (relevantAppt.doctor?.user?.fullName || "Chi tiết lịch hẹn") : ""}
                       >
                         {d}
                         {(hasUpcoming || hasPast) && !isToday && (
                           <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${hasUpcoming ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                         )}
                       </div>
                     )
                   }
                   return days
                 })()}
               </div>

               {}
               <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">
                    Bạn có <span className="font-bold text-gray-900">{upcomingAppointments.length}</span> lịch hẹn sắp tới trong tháng này.
                  </p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </PatientSidebar>
  )
}
