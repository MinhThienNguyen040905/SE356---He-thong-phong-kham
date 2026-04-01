"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"

import { CalendarIcon, Clock, User, Loader2, ChevronRight } from "lucide-react"
import { getUpcomingAppointments, type Appointment } from "../services/appointment.service"

interface UpcomingAppointmentsWidgetProps {
  limit?: number
  showViewAll?: boolean
}

export default function UpcomingAppointmentsWidget({
  limit = 5,
  showViewAll = true,
}: UpcomingAppointmentsWidgetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        const data = await getUpcomingAppointments(limit)
        
        
        const sortedData = [...data].sort((a, b) => {
          const dateA = a.date || "9999-99-99"
          const dateB = b.date || "9999-99-99"
          if (dateA !== dateB) return dateA.localeCompare(dateB)
          
          
          const slotA = a.slotNumber ?? 99999
          const slotB = b.slotNumber ?? 99999
          if (slotA !== slotB) return slotA - slotB
          
          const timeA = a.shift?.startTime || "23:59:59"
          const timeB = b.shift?.startTime || "23:59:59"
          return timeA.localeCompare(timeB)
        })
        setAppointments(sortedData)
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch upcoming appointments:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [limit])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      WAITING: { label: "Chờ checkin", className: "bg-blue-100/50 text-blue-700" },
      CHECKED_IN: { label: "Đã đến", className: "bg-emerald-100/50 text-emerald-700" },
      IN_PROGRESS: { label: "Đang khám", className: "bg-purple-100/50 text-purple-700" },
      COMPLETED: { label: "Đã khám", className: "bg-slate-100/50 text-slate-600" },
    }

    const { label, className } = statusMap[status] || {
      label: status,
      className: "bg-gray-100/50 text-gray-600",
    }

    return (
      <Badge variant="secondary" className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md ${className}`}>
        {label}
      </Badge>
    )
  }

  return (
    <Card className="border-0 shadow-none bg-white h-full flex flex-col">
      <CardHeader className="px-5 pt-5 pb-2">
        <div className="flex items-center justify-between mb-1">
          <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
            Lịch hẹn sắp tới
          </CardTitle>
          {showViewAll && (
            <Link 
              to="/appointments" 
              className="group flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
            >
              Xem tất cả
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="bg-slate-50 p-3 rounded-full mb-3">
               <CalendarIcon className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Không có lịch hẹn</p>
          </div>
        ) : (
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                to={`/appointments/${appointment.id}`}
                className="block group"
              >
                <div className="bg-white border rounded-xl p-3 hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300 relative">
                  {}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                        {appointment.slotNumber && (
                           <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-200 px-1.5 py-0.5 h-auto rounded-md shadow-none hover:bg-slate-50">
                             STT: {appointment.slotNumber}
                           </Badge>
                        )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>

                  {}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                      {appointment.patientName || appointment.patient?.fullName || "Bệnh nhân vãng lai"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                       MÃ: {appointment.patient?.patientCode || "N/A"}
                    </p>
                  </div>

                  {}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50/80 rounded-lg p-2 flex items-center gap-2 group-hover:bg-blue-50/30 transition-colors">
                      <Clock className="h-3 w-3 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700">
                        {appointment.shift?.startTime?.substring(0, 5) || "--:--"}
                        <span className="mx-1.5 font-normal text-slate-300">|</span>
                        {appointment.date ? new Date(appointment.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}) : ""}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50/80 rounded-lg p-2 flex items-center gap-2 group-hover:bg-emerald-50/30 transition-colors">
                      <User className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {appointment.doctor?.user?.fullName?.split(' ').pop() || "BS Trực"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
