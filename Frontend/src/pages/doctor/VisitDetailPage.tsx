"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  Heart,
  Loader2,
  Pill,
  Receipt,
  Activity,
  Droplet,
  Thermometer,
  Wind,
  Weight,
  Ruler,
} from "lucide-react"
import { toast } from "sonner"
import { getVisitById, type Visit } from "../../features/appointment/services/visit.service"
import AdminSidebar from "../../components/layout/sidebar/admin"
import DoctorSidebar from "../../components/layout/sidebar/doctor"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import PatientSidebar from "../../components/layout/sidebar/patient"


const cleanNoteText = (noteText: string) => {
  if (!noteText) return "Không có ghi chú";
  let cleanedText = noteText;
  cleanedText = cleanedText.replace(/CLINICAL OBSERVATIONS:.*?ADDITIONAL NOTES:/is, "");
  cleanedText = cleanedText.replace(/VITAL SIGNS:.*?(?=\n\n|$)/is, "");
  cleanedText = cleanedText.replace(/Huy[eếệ]t áp:\s*\d+\/\d+\s*mmHg\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Nh[iịĩ]p tim:\s*\d+\s*bpm\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Nhi[eệ]t đ[oộ]:\s*\d+(?:\.\d+)?\s*°C\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/SpO2:\s*\d+\s*%\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Nh[iịĩ]p th[ởờ]:\s*\d+\s*l\/p\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Chi[eề]u cao:\s*\d+(?:\.\d+)?\s*cm\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/C[aâ]n n[ặa]ng:\s*\d+(?:\.\d+)?\s*kg\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Examination completed on:.*$/im, "");
  cleanedText = cleanedText.replace(/•\s*/g, "");
  return cleanedText.trim() || "Không có ghi chú chi tiết";
};

export default function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVisit = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getVisitById(Number(id))
        setVisit(data)
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin lần khám"
        )
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVisit()
  }, [id, navigate])

  
  const getSidebarComponent = () => {
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()

    switch (role) {
      case "admin":
      case "1":
        return AdminSidebar
      case "doctor":
      case "2":
        return DoctorSidebar
      case "receptionist":
      case "4":
        return ReceptionistSidebar
      case "patient":
      case "3":
      default:
        return PatientSidebar
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      IN_PROGRESS: { label: "Đang khám", className: "bg-blue-50 text-blue-700 border-blue-200" },
      EXAMINING: { label: "Đang khám", className: "bg-blue-50 text-blue-700 border-blue-200" },
      COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-slate-50 text-slate-700 border-slate-200",
    }

    return (
      <Badge variant="outline" className={`${statusInfo.className} font-semibold px-3 py-1`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatDoctorName = (doctor: any) => {
    if (!doctor) return "N/A"
    const name = doctor.user?.fullName || doctor.fullName || "N/A"
    return name.startsWith("BS.") ? name : `BS. ${name}`
  }

  const SidebarComponent = getSidebarComponent()
  const userName = user?.fullName || user?.email || ""

  if (!SidebarComponent) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <SidebarComponent userName={userName}>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarComponent>
    )
  }

  if (!visit) {
    return (
      <SidebarComponent userName={userName}>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Không tìm thấy thông tin</h2>
          <p className="text-slate-500 mb-6">Lần khám này không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </SidebarComponent>
    )
  }

  return (
    <SidebarComponent userName={userName}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {}
        <Button 
          variant="ghost" 
          className="pl-0 text-slate-600 hover:text-blue-600 hover:bg-transparent transition-colors" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại danh sách
        </Button>

        {}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">Chi tiết lần khám</h1>
              {getStatusBadge(visit.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                <span>{new Date(visit.checkInTime || visit.visitDate || "").toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{new Date(visit.checkInTime || visit.visitDate || "").toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>


          {}
          <div className="flex flex-wrap gap-2">
            {visit.patientId && (
              <Button variant="outline" size="sm" asChild className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300">
                <Link to={
                  (String(user?.roleId || user?.role || "").toLowerCase() === "admin" || String(user?.roleId || user?.role || "") === "1")
                    ? `/admin/patients/${visit.patientId}`
                    : (String(user?.roleId || user?.role || "").toLowerCase() === "receptionist" || String(user?.roleId || user?.role || "") === "4")
                    ? `/recep/patients/${visit.patientId}`
                    : `/doctor/patients/${visit.patientId}` 
                }>
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ
                </Link>
              </Button>
            )}
            {visit.prescription?.id && (
               <Button variant="outline" size="sm" asChild className="bg-white hover:bg-blue-50 text-blue-700 border-blue-200">
                <Link to={
                  (String(user?.roleId || user?.role || "").toLowerCase() === "admin" || String(user?.roleId || user?.role || "") === "1")
                    ? `/admin/prescriptions/${visit.prescription.id}`
                    : (String(user?.roleId || user?.role || "").toLowerCase() === "doctor" || String(user?.roleId || user?.role || "") === "2")
                    ? `/doctor/prescriptions/${visit.prescription.id}`
                    : `/patient/prescriptions/${visit.prescription.id}`
                }>
                  <Pill className="h-4 w-4 mr-2" />
                  Đơn thuốc
                </Link>
              </Button>
            )}
            {visit.invoice?.id ? (
              <Button variant="outline" size="sm" asChild className="bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200">
                <Link to={`/invoices/${visit.invoice.id}`}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Hóa đơn
                </Link>
              </Button>
            ) : visit.id && (user?.role === "receptionist" || user?.roleId === 4) ? (
               <Button variant="outline" size="sm" asChild className="bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200">
                <Link to={`/recep/invoices/create?visitId=${visit.id}`}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Tạo hóa đơn
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {}
          <div className="lg:col-span-1 space-y-6">
            {}
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Thông tin bệnh nhân
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-medium mb-1">Họ và tên</div>
                  <div className="font-bold text-slate-900 text-lg">{visit.patient?.fullName || "N/A"}</div>
                </div>
                {visit.patient?.patientCode && (
                  <div>
                     <div className="text-xs text-slate-500 uppercase font-medium mb-1">Mã bệnh nhân</div>
                     <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">{visit.patient.patientCode}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
             <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-4">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-purple-600" />
                  Bác sĩ phụ trách
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-medium mb-1">Bác sĩ</div>
                  <div className="font-bold text-slate-900 text-lg">{formatDoctorName(visit.doctor)}</div>
                </div>
                 {visit.doctor?.specialty && (
                   <div>
                     <div className="text-xs text-slate-500 uppercase font-medium mb-1">Chuyên khoa</div>
                     <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">{visit.doctor.specialty.name}</Badge>
                   </div>
                 )}
              </CardContent>
            </Card>

            {}
             <Card className="border shadow-sm overflow-hidden">
              <CardContent className="p-4 space-y-3">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ngày tạo</div>
                      <div className="text-sm font-medium">{new Date(visit.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                     <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cập nhật</div>
                      <div className="text-sm font-medium">{new Date(visit.updatedAt || visit.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                 </div>
                 {visit.appointment?.shift && (
                    <div className="pt-2 border-t mt-2">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ca khám</div>
                      <div className="text-sm font-medium">{visit.appointment.shift.name} ({visit.appointment.shift.startTime} - {visit.appointment.shift.endTime})</div>
                    </div>
                 )}
              </CardContent>
            </Card>
          </div>

          {}
          <div className="lg:col-span-2 space-y-6">
            
            {}
            <Card className="border shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-5">
                <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  Thông tin lâm sàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                    Chẩn đoán
                  </h3>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-slate-800 font-medium">
                    {visit.diagnosis || "Chưa có chẩn đoán"}
                  </div>
                </div>

                <div>
                   <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                    Triệu chứng
                  </h3>
                  <p className="text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-200">
                    {visit.symptoms || "Không có ghi nhận triệu chứng"}
                  </p>
                </div>

                {visit.note && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                       <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                      Ghi chú
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm">
                      {cleanNoteText(visit.note)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            {visit.vitalSigns && Object.keys(visit.vitalSigns).length > 0 && (
               <Card className="border shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b py-3 px-5">
                  <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-600" />
                    Chỉ số sinh tồn
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">Huyết áp</div>
                         <div className="text-lg font-black text-slate-800">{visit.vitalSigns.bloodPressure || "--/--"}</div>
                         <div className="text-[10px] text-slate-400">mmHg</div>
                      </div>
                      
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">Nhịp tim</div>
                         <div className="text-lg font-black text-rose-600">{visit.vitalSigns.heartRate || "--"}</div>
                         <div className="text-[10px] text-slate-400">bpm</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">Nhiệt độ</div>
                         <div className="text-lg font-black text-orange-600">{visit.vitalSigns.temperature || "--"}</div>
                         <div className="text-[10px] text-slate-400">°C</div>
                      </div>

                       <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-xs text-slate-500 uppercase font-bold mb-1">Cân nặng</div>
                         <div className="text-lg font-black text-blue-600">{visit.vitalSigns.weight || "--"}</div>
                         <div className="text-[10px] text-slate-400">kg</div>
                      </div>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </SidebarComponent>
  )
}
