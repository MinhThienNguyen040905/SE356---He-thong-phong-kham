"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Users, Clock, Activity, Phone, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Link } from "react-router-dom"
import { Calendar } from "../../components/ui/calendar"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import UpcomingAppointmentsWidget from "../../features/appointment/components/UpcomingAppointmentsWidget"
import { getAppointments } from "../../features/appointment/services/appointment.service"
import { format } from "date-fns"

export default function ReceptionistDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [todayAppointments, setTodayAppointments] = useState(0)
  const [todayPatients, setTodayPatients] = useState(0)
  const [patientChange, setPatientChange] = useState(0)
  const [selectedDateAppointments, setSelectedDateAppointments] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (date) {
      fetchAppointmentsForDate(date)
    }
  }, [date])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const today = format(new Date(), "yyyy-MM-dd")
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd")

      
      const todayAppts = await getAppointments({ date: today })
      const todayApptsCount = todayAppts.length
      const todayPatientsSet = new Set(todayAppts.map(apt => apt.patientId))
      const todayPatientsCount = todayPatientsSet.size

      
      const yesterdayAppts = await getAppointments({ date: yesterday })
      const yesterdayPatientsSet = new Set(yesterdayAppts.map(apt => apt.patientId))
      const yesterdayPatientsCount = yesterdayPatientsSet.size

      
      let change = 0
      if (yesterdayPatientsCount > 0) {
        change = ((todayPatientsCount - yesterdayPatientsCount) / yesterdayPatientsCount) * 100
      } else if (todayPatientsCount > 0) {
        change = 100 
      }

      setTodayAppointments(todayApptsCount)
      setTodayPatients(todayPatientsCount)
      setPatientChange(Math.round(change * 10) / 10) 
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error)
      setTodayAppointments(0)
      setTodayPatients(0)
      setPatientChange(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointmentsForDate = async (selectedDate: Date) => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const appointments = await getAppointments({ date: dateStr })
      setSelectedDateAppointments(appointments.length)
    } catch (error: any) {
      console.error("Error fetching appointments for date:", error)
      setSelectedDateAppointments(0)
    }
  }

  return (
    <ReceptionistSidebar>
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="container mx-auto px-6 py-8 max-w-[1600px]">
          
          {}
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Xin chào, Lễ tân</h1>
              <p className="text-slate-500 mt-1 text-lg">Tổng quan hoạt động phòng khám hôm nay</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hôm nay</div>
                  <div className="text-sm font-bold text-slate-900">
                    {format(new Date(), "EEEE, dd/MM/yyyy")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
            
            {}
            <div className="xl:col-span-3 space-y-6">
              
              {}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {}
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group rounded-2xl ring-1 ring-slate-200/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Lịch hẹn</div>
                      <div className="flex items-baseline gap-1">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                        ) : (
                          <>
                            <span className="text-xl font-extrabold text-slate-900">{todayAppointments}</span>
                            <span className="text-[10px] font-semibold text-slate-400">hôm nay</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {}
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group rounded-2xl ring-1 ring-slate-200/50">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Bệnh nhân</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          ) : (
                            <>
                              <span className="text-xl font-extrabold text-slate-900">{todayPatients}</span>
                              <span className="text-[10px] font-semibold text-slate-400">tiếp đón</span>
                            </>
                          )}
                        </div>
                        {!loading && (
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${patientChange >= 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                            {patientChange >= 0 ? '+' : ''}{patientChange}%
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {}
                <Link to="/recep/patients/create" className="block">
                  <Card className="border-0 shadow-sm bg-indigo-600 text-white group rounded-2xl hover:bg-indigo-700 transition-all duration-300 overflow-hidden relative h-full">
                    <div className="absolute right-0 top-0 w-12 h-12 bg-white/10 rounded-bl-full -mr-3 -mt-3 transition-transform group-hover:scale-150 duration-500" />
                    <CardContent className="p-4 flex items-center gap-4 relative z-10">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest leading-tight">Thao tác</div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          Đăng ký mới
                          <Activity className="w-3 h-3 opacity-60 group-hover:animate-pulse" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/50 overflow-hidden">
                <UpcomingAppointmentsWidget limit={8} />
              </div>

            </div>

            {}
            <div className="space-y-6">
              
              {}
              <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl ring-1 ring-slate-200/50">
                <CardHeader className="pb-0 border-b border-slate-50 px-5 pt-4 bg-white">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                    Lịch làm việc
                  </CardTitle>
                </CardHeader>
                <div className="p-3">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    className="w-full flex justify-center"
                    classNames={{
                      day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-700 rounded-xl shadow-md transform scale-105 transition-all font-bold",
                      day_today: "bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100",
                      head_cell: "text-slate-400 font-bold text-[0.65rem] uppercase tracking-wider pb-3",
                      cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-medium text-slate-600 aria-selected:opacity-100 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all duration-200",
                      caption: "flex justify-center pt-1 relative items-center mb-4 px-2 font-bold text-slate-800 text-sm capitalize",
                      table: "w-full border-collapse space-y-1",
                      nav_button: "border border-slate-100 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors p-1",
                    }}
                  />
                </div>
                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                   <span className="font-bold text-slate-500 uppercase tracking-wider">
                    {date ? format(date, "EEEE, dd/MM") : "--/--"}
                   </span>
                   <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-medium">Lịch:</span>
                      <span className="font-bold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-xs">
                        {selectedDateAppointments}
                      </span>
                   </div>
                </div>
              </Card>

              {}
              <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200/50 overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 px-5 pt-4">
                  <CardTitle className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Truy cập nhanh</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-1.5">
                   <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/80 h-11 px-3 rounded-xl font-medium transition-all group" asChild>
                      <Link to="/patient/book-appointment" className="flex items-center">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mr-2.5 group-hover:bg-blue-100 transition-colors">
                           <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="text-sm">Đặt lịch khám</span>
                      </Link>
                   </Button>
                   <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/80 h-11 px-3 rounded-xl font-medium transition-all group" asChild>
                      <Link to="/recep/appointments" className="flex items-center">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center mr-2.5 group-hover:bg-orange-100 transition-colors">
                           <Clock className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <span className="text-sm">Quản lý lịch hẹn</span>
                      </Link>
                   </Button>
                   <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/80 h-11 px-3 rounded-xl font-medium transition-all group" asChild>
                      <Link to="/recep/patients" className="flex items-center">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center mr-2.5 group-hover:bg-emerald-100 transition-colors">
                           <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-sm">DS Bệnh nhân</span>
                      </Link>
                   </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </ReceptionistSidebar>
  )
}