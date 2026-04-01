import { useState, useEffect } from "react"
import { getMyAppointments, cancelAppointment as cancelAppointmentService, type Appointment } from "../features/appointment/services/appointment.service"
import { toast } from "sonner"
import type { IAppointment } from "../types/appointment"

interface AppointmentStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState<{
    upcoming: IAppointment[]
    past: IAppointment[]
  }>({
    upcoming: [],
    past: []
  })
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  })
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  
  const convertToIAppointment = (apt: Appointment): IAppointment => {
    
    const statusMap: Record<string, { label: IAppointment["status"]; raw: string }> = {
      WAITING: { label: "Pending", raw: "WAITING" },
      CHECKED_IN: { label: "Checked-in", raw: "CHECKED_IN" },
      IN_PROGRESS: { label: "In Progress", raw: "IN_PROGRESS" },
      COMPLETED: { label: "Completed", raw: "COMPLETED" },
      CANCELLED: { label: "Cancelled", raw: "CANCELLED" },
      NO_SHOW: { label: "Cancelled", raw: "NO_SHOW" },
    }

    const mapped = statusMap[apt.status] || { label: "Pending", raw: apt.status }

    return {
      id: String(apt.id),
      date: apt.date,
      time: apt.shift?.startTime || "",
      doctor: {
        id: apt.doctorId,
        name: apt.doctor?.user?.fullName || "Unknown Doctor",
        specialty: apt.doctor?.specialty?.name || "General",
        image: apt.doctor?.user?.avatar || "/placeholder.svg"
      },
      patient: {
        id: apt.patient?.id || 0,
        name: apt.patientName || apt.patient?.fullName || "Bệnh nhân",
        code: (apt.patientName && apt.patient?.fullName && apt.patientName.toLowerCase().trim() !== apt.patient.fullName.toLowerCase().trim()) 
              ? "" 
              : (apt.patient?.patientCode || "N/A"),
        
        gender: (apt.patientGender === 'MALE' || (!apt.patientGender && (apt.patient as any)?.gender === 'MALE')) ? 'Nam' 
              : (apt.patientGender === 'FEMALE' || (!apt.patientGender && (apt.patient as any)?.gender === 'FEMALE')) ? 'Nữ' 
              : 'Khác',
        dob: apt.patientDob 
             ? new Date(apt.patientDob).toLocaleDateString("vi-VN") 
             : ((apt.patient as any)?.dateOfBirth ? new Date((apt.patient as any).dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"),
        phone: apt.patientPhone || (apt.patient as any)?.phoneNumber || (apt.patient as any)?.phone || "Chưa cập nhật",
        email: (apt.patient as any)?.email || (apt.patient as any)?.user?.email || "Chưa cập nhật",
        address: (apt.patientName && apt.patient?.fullName && apt.patientName.toLowerCase().trim() !== apt.patient.fullName.toLowerCase().trim())
                 ? ""
                 : ((apt.patient as any)?.address || "Chưa cập nhật")
      },
      type: apt.bookingType === "ONLINE" ? "Online" : "Offline",
      location: "Clinic",
      reason: apt.symptomInitial || "General checkup",
      status: mapped.label,
      displayStatus: apt.status === "COMPLETED" ? "Đã khám" : (apt as any).displayStatus,
      rawStatus: mapped.raw,
      notes: undefined,
      diagnosis: undefined,
      prescription: undefined,
      nextSteps: undefined
    }
  }

  
  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const data = await getMyAppointments()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming: IAppointment[] = []
      const past: IAppointment[] = []

      data.forEach((apt) => {
        const converted = convertToIAppointment(apt)
        const appointmentDate = new Date(apt.date)
        appointmentDate.setHours(0, 0, 0, 0)

        const isUpcomingStatus = ["Pending", "Checked-in", "In Progress"].includes(converted.status)

        if (appointmentDate >= today && isUpcomingStatus) {
          upcoming.push(converted)
        } else {
          past.push(converted)
        }
      })

      
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      
      past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setAppointments({ upcoming, past })

      
      const cancelled = data.filter(apt => apt.status === "CANCELLED" || apt.status === "NO_SHOW").length
      const completed = data.filter(apt => apt.status === "COMPLETED").length
      setStats({
        total: data.length,
        upcoming: upcoming.length,
        completed,
        cancelled
      })
    } catch (error: any) {
      console.error("Error fetching appointments:", error)
      toast.error("Không thể tải danh sách lịch hẹn")
    } finally {
      setIsLoading(false)
    }
  }

  
  const viewDetails = (apt: IAppointment) => {
    setSelectedAppointment(apt)
    setIsDetailOpen(true)
  }

  
  const cancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      await cancelAppointmentService(Number(appointmentId))
      toast.success("Đã hủy lịch hẹn thành công")
      await fetchAppointments() 
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast.error(error.response?.data?.message || "Không thể hủy lịch hẹn")
    }
  }

  
  useEffect(() => {
    fetchAppointments()
  }, [])

  return {
    appointments,
    stats,
    selectedAppointment,
    isDetailOpen,
    setIsDetailOpen,
    viewDetails,
    cancelAppointment,
    isLoading,
    refetch: fetchAppointments
  }
}
