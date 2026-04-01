import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookingForm } from "../../features/appointment/components/BookingForm"
import { useAuth } from "../../features/auth/context/authContext"
import { toast } from "sonner"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { getPatientById } from "../../features/patient/services/patient.service"
import { Skeleton } from "../../components/ui/skeleton"
import { CalendarPlus, Clock, Shield, Sparkles } from "lucide-react"

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [patientCode, setPatientCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    
    if (isAuthenticated && user) {
      
      if (!user.patientId) {
        toast.info("Vui lòng thiết lập hồ sơ bệnh nhân trước khi đặt lịch")
        navigate("/patient/setup")
        return
      }

      
      const fetchPatientCode = async () => {
        try {
          if (user.patientId) {
            const patient = await getPatientById(user.patientId)
            setPatientCode(patient.patientCode || "")
          }
        } catch (error) {
          console.error("Error fetching patient profile:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchPatientCode()
    } else {
      setIsLoading(false)
    }
  }, [user, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <PatientSidebar 
        userName={user?.fullName || user?.email}
        patientCode={patientCode}
      >
        <div className="space-y-6">
          {}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200 p-8">
            <Skeleton className="h-10 w-80 mb-3" />
            <Skeleton className="h-5 w-64" />
          </div>
          
          {}
          <Skeleton className="h-24 w-full rounded-2xl" />
          
          {}
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </PatientSidebar>
    )
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
      patientCode={patientCode}
    >
      <div className="space-y-8">
        {}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-cyan-600 p-8 shadow-xl">
          {}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-cyan-400/20 blur-xl" />
            <div className="absolute top-1/2 right-1/4 h-16 w-16 rounded-full bg-white/5 blur-lg" />
            
            {}
            <svg className="absolute right-0 top-0 h-full w-1/3 opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          {}
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <CalendarPlus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      Đặt Lịch Hẹn Khám
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                      Chọn chuyên khoa, bác sĩ và thời gian phù hợp với bạn
                    </p>
                  </div>
                </div>
              </div>
              
              {}
              <div className="hidden md:flex items-center gap-1">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              </div>
            </div>
            
            {}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm">
                <Clock className="h-4 w-4" />
                <span>Đặt lịch nhanh trong 2 phút</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm">
                <Shield className="h-4 w-4" />
                <span>Bảo mật thông tin</span>
              </div>
            </div>
          </div>
        </div>
        
        {}
        <BookingForm />
      </div>
    </PatientSidebar>
  )
}
