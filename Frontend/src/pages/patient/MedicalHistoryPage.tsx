"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { 
  FileText, 
  Printer, 
  Edit, 
  Pill, 
  Heart, 
  Droplet, 
  Activity,
  ArrowUpDown,
  ArrowRight,
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Thermometer,
  Wind,
  Scale
} from "lucide-react"
import { toast } from "sonner"
import { getPatientById, getPatientMedicalHistory, type Patient, type Visit } from "../../features/patient/services/patient.service"
import { getVisitById, type Visit as VisitDetail } from "../../features/appointment/services/visit.service"
import { PrescriptionService } from "../../features/appointment/services/prescription.service"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { useAuth } from "../../features/auth/context/authContext"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { AppointmentCard } from "../../features/appointment/components/AppointmentCard"
import { PremiumPagination } from "../../components/ui/premium-pagination"
import type { IAppointment } from "../../types/appointment"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

interface CurrentPrescriptionItem {
  id: number
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  doctorName?: string
}

const getAvatarUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace("/api", "");
  return `${baseUrl}${url}`;
};

export default function MedicalHistoryPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [currentPrescriptions, setCurrentPrescriptions] = useState<CurrentPrescriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [selectedVisit, setSelectedVisit] = useState<VisitDetail | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [visitPage, setVisitPage] = useState(1)
  const VISITS_PER_PAGE = 5

  const convertVisitToAppointment = (visit: Visit): IAppointment => {
    return {
      id: visit.id.toString(),
      date: visit.checkInTime || visit.visitDate || new Date().toISOString(),
      time: visit.checkInTime ? format(new Date(visit.checkInTime), "HH:mm") : "00:00",
      doctor: {
        id: visit.doctor?.id || 0,
        name: visit.doctor?.user?.fullName || visit.doctor?.fullName || "Bác sĩ",
        specialty: visit.doctor?.specialty?.name || "Đa khoa",
        image: "/placeholder.svg",
      },
      status: (visit.status === "COMPLETED" || visit.status === "EXAMINED" ? "Completed" : "Pending") as any,
      displayStatus: visit.status === "COMPLETED" ? "Đã khám" : visit.status,
      type: "Offline",
      location: "Phòng khám",
      reason: visit.symptoms || "",
      patient: {
          id: patient?.id || 0,
          name: patient?.fullName || "Bệnh nhân",
          code: patient?.patientCode || "",
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      
      if (authLoading) {
        return
      }

      
      if (!user) {
        setIsLoading(false)
        toast.error("Vui lòng đăng nhập để xem hồ sơ sức khỏe")
        navigate("/login")
        return
      }

      if (!user.patientId) {
        setIsLoading(false)
        
        if (window.location.pathname !== "/patient/setup") {
          toast.error("Không tìm thấy thông tin bệnh nhân. Vui lòng thiết lập hồ sơ bệnh nhân.")
          navigate("/patient/setup")
        }
        return
      }

      try {
        setIsLoading(true)
        
        
        console.log("Fetching patient data for patientId:", user.patientId)
        const patientData = await getPatientById(user.patientId)
        console.log("Patient data received:", patientData)
        setPatient(patientData)

        
        const historyData = await getPatientMedicalHistory(user.patientId, 1, 100)
        setVisits(historyData.data || [])

        
        const prescriptionsResponse = await PrescriptionService.getPrescriptionsByPatient(user.patientId)
        if (prescriptionsResponse.success && prescriptionsResponse.data) {
          const allPrescriptions = Array.isArray(prescriptionsResponse.data) 
            ? prescriptionsResponse.data 
            : []
          
          
          const active = allPrescriptions.filter((p: any) => 
            p.status !== "CANCELLED"
          )
          
          
          const transformed: CurrentPrescriptionItem[] = active.flatMap((prescription: any) => 
            (prescription.details || []).map((detail: any) => {
              
              const dosages = []
              if (detail.dosageMorning > 0) dosages.push(`${detail.dosageMorning} sáng`)
              if (detail.dosageNoon > 0) dosages.push(`${detail.dosageNoon} trưa`)
              if (detail.dosageAfternoon > 0) dosages.push(`${detail.dosageAfternoon} chiều`)
              if (detail.dosageEvening > 0) dosages.push(`${detail.dosageEvening} tối`)
              
              return {
                id: detail.id,
                medicineName: detail.medicineName || detail.medicine?.name || "Unknown",
                dosage: dosages.join(", ") || detail.instruction || "",
                frequency: detail.instruction || "",
                duration: `${detail.days || 1} ngày (${detail.quantity} ${detail.unit || "viên"})`,
                doctorName: prescription.doctor?.user?.fullName || prescription.doctor?.fullName || "Bác sĩ"
              }
            })
          )
          
          setCurrentPrescriptions(transformed.slice(0, 5)) 
        }
      } catch (error: any) {
        console.error("Error fetching medical history:", error)
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải hồ sơ sức khỏe"
        toast.error(errorMessage)
        
        
        if (error?.response?.status === 404) {
          toast.error("Không tìm thấy thông tin bệnh nhân")
        } else if (error?.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          navigate("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.patientId, authLoading, user, navigate])

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) return 0
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const safeFormatDate = (dateStr?: string, formatStr: string = "dd/MM/yyyy") => {
    if (!dateStr) return "Chưa cập nhật"
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return "Ngày không hợp lệ"
    return format(date, formatStr, { locale: vi })
  }

  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Thiếu cân", color: "text-blue-600" }
    if (bmi < 25) return { label: "Bình thường", color: "text-green-600" }
    if (bmi < 30) return { label: "Thừa cân", color: "text-yellow-600" }
    return { label: "Béo phì", color: "text-red-600" }
  }

  const filteredVisits = visits.filter((visit) => {
    if (yearFilter === "current") {
      const date = visit.checkInTime || visit.visitDate
      if (!date) return false
      const visitYear = new Date(date).getFullYear()
      return visitYear === new Date().getFullYear()
    }
    return true
  })

  const handleViewDetail = async (visitId: number) => {
    try {
      setIsLoadingDetail(true)
      setIsDetailOpen(true)
      const visitDetail = await getVisitById(visitId)
      setSelectedVisit(visitDetail)
    } catch (error: any) {
      console.error("Error fetching visit detail:", error)
      toast.error("Không thể tải chi tiết lần khám")
      setIsDetailOpen(false)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const formatDosage = (detail: any) => {
    const dosages = []
    if (detail.dosageMorning > 0) dosages.push(`Sáng: ${detail.dosageMorning}`)
    if (detail.dosageNoon > 0) dosages.push(`Trưa: ${detail.dosageNoon}`)
    if (detail.dosageAfternoon > 0) dosages.push(`Chiều: ${detail.dosageAfternoon}`)
    if (detail.dosageEvening > 0) dosages.push(`Tối: ${detail.dosageEvening}`)
    return dosages.length > 0 ? dosages.join(", ") : detail.instruction || "Theo chỉ dẫn"
  }

  const renderDoctorNote = (note: string) => {
    if (!note.includes("CLINICAL OBSERVATIONS:")) {
       return <div className="font-medium text-gray-900 whitespace-pre-line">{note}</div>
    }

    
    const sections = [
      { key: "CLINICAL OBSERVATIONS", label: "Quan sát lâm sàng", icon: <User className="w-3.5 h-3.5" />, color: "text-blue-500" },
      { key: "VITAL SIGNS", label: "Chỉ số sinh tồn (Ghi nhanh)", icon: <Activity className="w-3.5 h-3.5" />, color: "text-teal-600" },
      { key: "ADDITIONAL NOTES", label: "Ghi chú thêm", icon: <FileText className="w-3.5 h-3.5" />, color: "text-gray-500" },
      { key: "Examination completed on", label: "hidden", icon: <Clock className="w-3.5 h-3.5" />, color: "hidden" }
    ];

    const getVitalIcon = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes("blood") || l.includes("huyết")) return <Droplet className="w-4 h-4 text-red-500" />;
        if (l.includes("heart") || l.includes("tim")) return <Heart className="w-4 h-4 text-pink-500" />;
        if (l.includes("temp") || l.includes("nhiệt")) return <Thermometer className="w-4 h-4 text-orange-500" />;
        if (l.includes("weight") || l.includes("cân") || l.includes("height") || l.includes("cao")) return <Scale className="w-4 h-4 text-blue-500" />;
        if (l.includes("spo2")) return <Activity className="w-4 h-4 text-teal-500" />;
        if (l.includes("resp") || l.includes("thở")) return <Wind className="w-4 h-4 text-purple-500" />;
        return <Activity className="w-4 h-4 text-gray-400" />;
    }

    return (
      <div className="space-y-4 mt-3">
        {sections.map((section, idx) => {
          if (section.label === "hidden") return null;

          const startIdx = note.indexOf(section.key + ":");
          if (startIdx === -1) return null;
          
          let content = "";
          
          let endIdx = -1;
          const potentialEndIndices = sections
            .slice(idx + 1)
            .map(s => note.indexOf(s.key + ":"))
            .filter(i => i !== -1)
            .sort((a, b) => a - b);
            
          if (potentialEndIndices.length > 0) {
            endIdx = potentialEndIndices[0];
          }
          
          if (endIdx === -1) {
             content = note.substring(startIdx + section.key.length + 1).trim();
          } else {
             content = note.substring(startIdx + section.key.length + 1, endIdx).trim();
          }

          if (!content) return null;

          
          if (section.key === "VITAL SIGNS") {
            const vitals = content.split("•").filter(i => i.trim());
            return (
              <div key={section.key} className="bg-white/50 p-4 rounded-xl border border-gray-100/50">
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 ${section.color}`}>
                   {section.icon}
                   {section.label}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {vitals.map((vital, vIdx) => {
                      const [label, value] = vital.split(":").map(s => s.trim());
                      return (
                        <div key={vIdx} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 transition-colors hover:border-blue-200 group">
                           <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                {getVitalIcon(label)}
                           </div>
                           <div className="min-w-0">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate mb-0.5" title={label}>{label}</div>
                                <div className="text-sm font-bold text-gray-900 truncate" title={value}>{value}</div>
                           </div>
                        </div>
                      )
                   })}
                </div>
              </div>
            )
          }

          return (
             <div key={section.key} className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${section.color}`}>
                   {section.icon}
                   {section.label}
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">
                   {content.includes("•") ? (
                      <div className="space-y-2">
                        {content.split("•").filter(i => i.trim()).map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-white p-2 rounded-lg border border-gray-100/50">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0 opacity-80" />
                             <span>{item.trim()}</span>
                          </div>
                        ))}
                      </div>
                   ) : (
                      content
                   )}
                </div>
             </div>
          )
        })}
      </div>
    )
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
          {}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 shadow-xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                      Hồ Sơ Sức Khỏe
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                      Quản lý thông tin sức khỏe cá nhân, chỉ số sinh tồn và lịch sử khám chữa bệnh toàn diện.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={() => window.print()}
                      className="bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      In hồ sơ
                    </Button>
                    <Button 
                      onClick={() => navigate("/patient/update-health-info")}
                      className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-md"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Cập nhật thông tin
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-white">
                    <span className="block text-2xl font-bold">{visits.length}</span>
                    <span className="text-xs text-blue-100 uppercase font-medium tracking-wide">Lần khám</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-start gap-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : patient ? (
                <div className="flex items-start gap-6">
                  {}
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {patient.fullName.charAt(0).toUpperCase()}
                    </div>
                    {patient.avatar && (
                      <img 
                        src={getAvatarUrl(patient.avatar)} 
                        alt={patient.fullName}
                        className="absolute inset-0 h-32 w-32 rounded-full object-cover"
                      />
                    )}
                  </div>

                  {}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{patient.fullName}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Ngày sinh:</span>{" "}
                        {safeFormatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} tuổi)
                      </div>
                      <div>
                        <span className="font-medium">Giới tính:</span>{" "}
                        {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : patient.gender || "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {patient.address || "Chưa cập nhật"}
                      </div>
                    </div>

                    {}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Nhóm máu</span>
                            <Droplet className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.bloodType || "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Chiều cao</span>
                            <ArrowUpDown className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.height ? `${patient.height} cm` : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Cân nặng</span>
                            <Activity className="h-5 w-5 text-orange-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.weight ? `${patient.weight} kg` : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">BMI</span>
                            <Activity className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.height && patient.weight
                              ? (() => {
                                  const bmi = parseFloat(calculateBMI(patient.height, patient.weight)!)
                                  const status = getBMIStatus(bmi)
                                  return (
                                    <span className={status.color}>
                                      {bmi} <span className="text-sm font-normal">({status.label})</span>
                                    </span>
                                  )
                                })()
                              : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không thể tải thông tin bệnh nhân</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Chỉ số sinh tồn</h3>
                <span className="text-sm text-gray-500">
                  Cập nhật: {visits.length > 0 ? safeFormatDate(visits[0].checkInTime || visits[0].visitDate) : safeFormatDate(new Date().toISOString())}
                </span>
              </div>
              
              {visits.length > 0 && visits[0].vitalSigns ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Nhịp tim</span>
                        <Heart className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {visits[0].vitalSigns.heartRate || "--"} <span className="text-sm font-normal">bpm</span>
                      </div>
                      <div className={`text-sm ${
                        !visits[0].vitalSigns.heartRate ? "text-gray-400" :
                        visits[0].vitalSigns.heartRate >= 60 && visits[0].vitalSigns.heartRate <= 100 ? "text-green-600" : "text-red-600"
                      }`}>
                        {!visits[0].vitalSigns.heartRate ? "" :
                         visits[0].vitalSigns.heartRate >= 60 && visits[0].vitalSigns.heartRate <= 100 ? "Bình thường" : "Bất thường"}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Huyết áp</span>
                        <Droplet className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {visits[0].vitalSigns.bloodPressure || "--/--"} <span className="text-sm font-normal">mmHg</span>
                      </div>
                      <div className="text-sm text-yellow-600">
                        {visits[0].vitalSigns.bloodPressure ? "Theo dõi" : ""}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">SpO2</span>
                        <Activity className="h-5 w-5 text-teal-500" />
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {visits[0].vitalSigns.spo2 || "--"} <span className="text-sm font-normal">%</span>
                      </div>
                      <div className={`text-sm ${
                        !visits[0].vitalSigns.spo2 ? "text-gray-400" :
                        visits[0].vitalSigns.spo2 >= 95 ? "text-green-600" : "text-red-600"
                      }`}>
                        {!visits[0].vitalSigns.spo2 ? "" :
                         visits[0].vitalSigns.spo2 >= 95 ? "Tốt" : "Thấp"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Chưa có dữ liệu chỉ số sinh tồn từ các lần khám gần đây</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Đơn thuốc đang dùng</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/patient/prescriptions")}
                >
                  Xem lịch sử đơn thuốc
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : currentPrescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TÊN THUỐC</TableHead>
                        <TableHead>LIỀU DÙNG</TableHead>
                        <TableHead>THỜI GIAN</TableHead>
                        <TableHead>BÁC SĨ KÊ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPrescriptions.map((prescription, index) => (
                        <TableRow key={prescription.id || index}>
                          <TableCell className="font-medium">
                            {prescription.medicineName}
                          </TableCell>
                          <TableCell>
                            {prescription.dosage || prescription.frequency}
                          </TableCell>
                          <TableCell>{prescription.duration}</TableCell>
                          <TableCell>
                            {prescription.doctorName || "Unknown"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Bạn chưa có đơn thuốc đang dùng</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Lịch sử khám bệnh</h3>
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[140px] border-gray-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Năm nay</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                 </div>
              ) : filteredVisits.length > 0 ? (
                <div className="flex flex-col">
                  <div className="space-y-4">
                    {filteredVisits
                      .slice((visitPage - 1) * VISITS_PER_PAGE, visitPage * VISITS_PER_PAGE)
                      .map((visit, index) => (
                      <div 
                         key={visit.id} 
                         className="transition-all duration-200 hover:scale-[1.01] animate-in fade-in"
                         style={{ animationDelay: `${index * 30}ms` }}
                      >
                         <AppointmentCard
                            appointment={convertVisitToAppointment(visit)}
                            onViewDetails={() => handleViewDetail(visit.id)}
                         />
                      </div>
                    ))}
                  </div>
                  
                  {}
                  <div className="mt-6">
                    <PremiumPagination 
                      currentPage={visitPage}
                      totalPages={Math.ceil(filteredVisits.length / VISITS_PER_PAGE)}
                      totalItems={filteredVisits.length}
                      itemsPerPage={VISITS_PER_PAGE}
                      onPageChange={setVisitPage}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">Chưa có lịch sử khám bệnh</p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Tiền sử & Dị ứng</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">BỆNH LÝ MÃN TÍNH</h4>
                  <div className="text-gray-600">
                    {patient?.chronicDiseases && patient.chronicDiseases.length > 0 
                      ? patient.chronicDiseases.map((disease: string, index: number) => (
                          <div key={index}>{disease}</div>
                        ))
                      : "Chưa có thông tin"}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">DỊ ỨNG</h4>
                  <div className="text-gray-600">
                    {patient?.allergies && patient.allergies.length > 0 
                      ? patient.allergies.map((allergy: string, index: number) => (
                          <div key={index}>{allergy}</div>
                        ))
                      : "Chưa có thông tin"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Chi tiết lần khám
              </DialogTitle>
            </DialogHeader>
            
            {isLoadingDetail ? (
              <div className="space-y-4 p-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : selectedVisit ? (
              <div className="space-y-6">
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-500">Bác sĩ:</span>
                      <span className="font-semibold">
                        {selectedVisit.doctor?.user?.fullName || selectedVisit.doctor?.fullName || "Chưa có thông tin"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-500">Chuyên khoa:</span>
                      <span className="font-semibold">
                        {selectedVisit.doctor?.specialty?.name || "Đang cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-500">Ngày khám:</span>
                      <span className="font-semibold">
                        {safeFormatDate(selectedVisit.checkInTime || selectedVisit.visitDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm text-gray-500">Ca khám:</span>
                      <span className="font-semibold">
                        {selectedVisit.appointment?.shift?.startTime && selectedVisit.appointment?.shift?.endTime
                          ? `${selectedVisit.appointment.shift.name} (${selectedVisit.appointment.shift.startTime.substring(0, 5)} - ${selectedVisit.appointment.shift.endTime.substring(0, 5)})`
                          : selectedVisit.appointment?.shift?.name || "Không có thông tin"}
                      </span>
                    </div>
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    Kết quả khám
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Chẩn đoán</div>
                      <div className="font-medium text-gray-900">
                        {selectedVisit.diagnosis || "Chưa có chẩn đoán"}
                      </div>
                    </div>
                    {selectedVisit.symptoms && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Triệu chứng</div>
                        <div className="font-medium text-gray-900">{selectedVisit.symptoms}</div>
                      </div>
                    )}
                    {selectedVisit.note && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 mb-2 font-medium">Ghi chú của bác sĩ</div>
                        {renderDoctorNote(selectedVisit.note)}
                      </div>
                    )}
                  </div>
                </div>

                {}
                {selectedVisit.vitalSigns && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Chỉ số sinh tồn
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedVisit.vitalSigns.bloodPressure && (
                        <div className="p-4 bg-red-50 rounded-lg text-center">
                          <Droplet className="h-6 w-6 mx-auto mb-2 text-red-500" />
                          <div className="text-xs text-gray-500">Huyết áp</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.bloodPressure}</div>
                          <div className="text-xs text-gray-400">mmHg</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.heartRate && (
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <Heart className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                          <div className="text-xs text-gray-500">Nhịp tim</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.heartRate}</div>
                          <div className="text-xs text-gray-400">bpm</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.temperature && (
                        <div className="p-4 bg-orange-50 rounded-lg text-center">
                          <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                          <div className="text-xs text-gray-500">Nhiệt độ</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.temperature}</div>
                          <div className="text-xs text-gray-400">°C</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.spo2 && (
                        <div className="p-4 bg-teal-50 rounded-lg text-center">
                          <Activity className="h-6 w-6 mx-auto mb-2 text-teal-500" />
                          <div className="text-xs text-gray-500">SpO2</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.spo2}</div>
                          <div className="text-xs text-gray-400">%</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.respiratoryRate && (
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <Wind className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                          <div className="text-xs text-gray-500">Nhịp thở</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.respiratoryRate}</div>
                          <div className="text-xs text-gray-400">lần/phút</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.weight && (
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
                          <div className="text-xs text-gray-500">Cân nặng</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.weight}</div>
                          <div className="text-xs text-gray-400">kg</div>
                        </div>
                      )}
                      {selectedVisit.vitalSigns.height && (
                        <div className="p-4 bg-indigo-50 rounded-lg text-center">
                          <ArrowUpDown className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                          <div className="text-xs text-gray-500">Chiều cao</div>
                          <div className="font-bold text-lg">{selectedVisit.vitalSigns.height}</div>
                          <div className="text-xs text-gray-400">cm</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {}
                {selectedVisit.prescription && selectedVisit.prescription.details && selectedVisit.prescription.details.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-primary" />
                      Đơn thuốc ({selectedVisit.prescription.prescriptionCode})
                    </h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên thuốc</TableHead>
                            <TableHead>Liều dùng</TableHead>
                            <TableHead>Số ngày</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Hướng dẫn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedVisit.prescription.details.map((detail, index) => (
                            <TableRow key={detail.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="font-medium">
                                {detail.medicineName || detail.medicine?.name || "Không xác định"}
                              </TableCell>
                              <TableCell>{formatDosage(detail)}</TableCell>
                              <TableCell>{detail.days || 1} ngày</TableCell>
                              <TableCell>{detail.quantity} {detail.unit || detail.medicine?.unit || "viên"}</TableCell>
                              <TableCell>{detail.instruction || "Theo chỉ dẫn bác sĩ"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {selectedVisit.prescription.note && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-sm text-yellow-700 font-medium mb-1">Lưu ý từ bác sĩ:</div>
                        <div className="text-yellow-900">{selectedVisit.prescription.note}</div>
                      </div>
                    )}
                  </div>
                )}

                {}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Trạng thái:</span>
                    <Badge className={
                      selectedVisit.status === "COMPLETED" || selectedVisit.status === "EXAMINED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }>
                      {selectedVisit.displayStatus || (selectedVisit.status === "COMPLETED" || selectedVisit.status === "EXAMINED" ? "Đã khám" : selectedVisit.status)}
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Đóng
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </DialogContent>
        </Dialog>
    </PatientSidebar>
  )
}
