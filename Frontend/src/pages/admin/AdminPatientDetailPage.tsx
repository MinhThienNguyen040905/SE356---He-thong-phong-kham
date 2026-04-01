import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Heart,
  Droplet,
  Weight,
  Ruler,
  Edit,
  Pill,
  AlertCircle,
  User,
  Award as IdCard,
  Camera,
  Loader2,
  Ban,
  UserCheck,
  Receipt,
  FileText as InvoiceIcon,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { toast } from "sonner"
import {
  getPatientById,
  uploadPatientAvatar,
  getPatientMedicalHistory,
  getPatientPrescriptions,
  updatePatient,
  type Patient,
  type Visit,
  type Prescription,
} from "../../features/patient/services/patient.service"
import { InvoiceService, type Invoice } from "../../features/finance/services/invoice.service"

export default function AdminPatientDetailPage() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<Visit[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  
  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getPatientById(Number(id))
        setPatient(data)
        
        
        try {
          const result = await getPatientMedicalHistory(Number(id), 1, 5)
          setMedicalHistory(result.data)
        } catch (err) {
          console.error('Failed to load medical history:', err)
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin bệnh nhân"
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatient()
  }, [id])

  
  const fetchMedicalHistory = async () => {
    if (!id) return
    try {
      setIsLoadingHistory(true)
      const result = await getPatientMedicalHistory(Number(id))
      setMedicalHistory(result.data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử khám bệnh"
      )
    } finally {
      setIsLoadingHistory(false)
    }
  }

  
  const fetchPrescriptions = async () => {
    if (!id) return
    try {
      setIsLoadingPrescriptions(true)
      const result = await getPatientPrescriptions(Number(id))
      setPrescriptions(result.data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải đơn thuốc"
      )
    } finally {
      setIsLoadingPrescriptions(false)
    }
  }

  
  const fetchInvoices = async () => {
    if (!id) return
    try {
      setIsLoadingInvoices(true)
      const result = await InvoiceService.getInvoicesByPatient(Number(id))
      if (result.success && result.data) {
        setInvoices(result.data)
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải hóa đơn"
      )
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB")
      return
    }

    setIsUploadingAvatar(true)
    try {
      const result = await uploadPatientAvatar(Number(id), file)
      setPatient((prev) => (prev ? { ...prev, avatar: result.avatar } : null))
      toast.success("Upload avatar thành công!")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể upload avatar"
      )
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const handleToggleStatusConfirm = async () => {
    if (!patient || !id) return
    try {
      setIsTogglingStatus(true)
      const newStatus = !patient.isActive
      await updatePatient(Number(id), { isActive: newStatus })
      setPatient((prev) => (prev ? { ...prev, isActive: newStatus } : null))
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công!`)
      setStatusDialogOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái")
    } finally {
      setIsTogglingStatus(false)
    }
  }

  
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH": return "Tiền mặt"
      case "BANK_TRANSFER": return "Chuyển khoản"
      case "QR_CODE": return "QR Code"
      default: return method
    }
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    )
  }

  if (!patient) {
    return (
      <AdminSidebar>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin bệnh nhân</p>
          <Button asChild className="mt-4">
            <Link to="/admin/patients">Quay lại danh sách</Link>
          </Button>
        </div>
      </AdminSidebar>
    )
  }

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0
  const phoneProfile = patient.profiles?.find((p: any) => p.type === "phone")
  const emailProfile = patient.profiles?.find((p: any) => p.type === "email")
  const addressProfile = patient.profiles?.find((p: any) => p.type === "address")

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-6">
            
            {}
            <div>
              <Button variant="ghost" className="pl-0 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors" asChild>
                <Link to="/admin/patients">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách bệnh nhân
                </Link>
              </Button>
            </div>

            {}
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
              {}
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-cyan-50/30 border-b-2 border-emerald-100/50">
                {}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-emerald-300/20 rounded-full blur-[80px] animate-pulse" />
                  <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-teal-300/15 rounded-full blur-[70px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="relative p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                        <Avatar className="relative h-24 w-24 border-4 border-white shadow-2xl shadow-emerald-500/20 transition-all duration-300 group-hover:scale-105">
                          <AvatarImage
                            src={
                              patient.avatar
                                ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${patient.avatar}`
                                : undefined
                            }
                            alt={patient.fullName}
                          />
                          <AvatarFallback className="bg-emerald-500 text-white text-2xl font-black">
                            {getInitials(patient.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-white hover:bg-emerald-50 rounded-full p-2.5 cursor-pointer transition-all shadow-lg hover:scale-110 border-2 border-emerald-100"
                        >
                          <Camera className="h-4 w-4 text-emerald-600" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>
                      
                      <div>
                        <h1 className="text-3xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {patient.fullName}
                        </h1>
                        <div className="flex items-center gap-3 text-slate-500 font-bold mt-2 text-sm">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1.5">
                                <IdCard className="h-3.5 w-3.5" />
                                {patient.patientCode}
                            </span>
                            <span className="hidden sm:inline text-slate-300">|</span>
                            <span className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                                <Phone className="h-3.5 w-3.5" />
                                {patient.phone}
                            </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button 
                        variant={patient.isActive ? "destructive" : "default"}
                        onClick={() => setStatusDialogOpen(true)}
                        className={patient.isActive ? "bg-white text-red-600 hover:bg-red-50 border-2 border-red-100 shadow-sm" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"}
                      >
                       {patient.isActive ? (
                         <>
                           <Ban className="h-4 w-4 mr-2" />
                           Vô hiệu hóa
                         </>
                       ) : (
                         <>
                           <UserCheck className="h-4 w-4 mr-2" />
                           Kích hoạt
                         </>
                       )}
                     </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 divide-x border-b bg-white/80">
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Nhóm máu</p>
                      <p className="text-lg font-black text-slate-900">{patient.bloodType || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Ruler className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Chiều cao</p>
                      <p className="text-lg font-black text-slate-900">{patient.height ? `${patient.height} cm` : "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Weight className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Cân nặng</p>
                      <p className="text-lg font-black text-slate-900">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Lần khám cuối</p>
                      <p className="text-sm font-black text-slate-900">
                        {medicalHistory.length > 0 && medicalHistory[0].visitDate
                          ? new Date(medicalHistory[0].visitDate).toLocaleDateString("vi-VN")
                          : "Chưa có"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

        {}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger
              value="medical-history"
              onClick={fetchMedicalHistory}
            >
              Lịch sử khám
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              onClick={fetchPrescriptions}
            >
              Đơn thuốc
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              onClick={fetchInvoices}
            >
              Hóa đơn
            </TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Thông tin cá nhân
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Địa chỉ</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-900">
                        {patient.address || addressProfile?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày đăng ký</p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>


              {}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    Sinh hiệu gần nhất
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Huyết áp</p>
                    <p className="text-sm font-medium text-slate-900">
                      {medicalHistory[0]?.vitalSigns?.bloodPressure || "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhịp tim</p>
                    <p className="text-sm font-medium text-slate-900">
                      {medicalHistory[0]?.vitalSigns?.heartRate ? `${medicalHistory[0].vitalSigns.heartRate} bpm` : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhiệt độ</p>
                    <p className="text-sm font-medium text-slate-900">
                      {medicalHistory[0]?.vitalSigns?.temperature ? `${medicalHistory[0].vitalSigns.temperature}°C` : "N/A"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhịp thở</p>
                    <p className="text-sm font-medium text-slate-900">
                      {medicalHistory[0]?.vitalSigns?.respiratoryRate ? `${medicalHistory[0].vitalSigns.respiratoryRate} lần/phút` : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Dị ứng
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies && patient.allergies.length > 0 ? (
                      patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {allergy}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Chưa có thông tin dị ứng</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Bệnh mạn tính
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                      patient.chronicDiseases.map((disease, index) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {disease}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Chưa có thông tin bệnh mạn tính</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {}
          <TabsContent value="medical-history">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                <CardTitle>Lịch sử khám bệnh</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : medicalHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có lịch sử khám bệnh</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {medicalHistory.map((visit) => (
                      <div key={visit.id} className="p-6 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-blue-50/20 transition-all duration-300 group">
                        <div className="flex items-start gap-5">
                          {}
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                          </div>

                          {}
                          <div className="flex-1 space-y-3">
                            {}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                  {visit.diagnosis || "Chưa có chẩn đoán"}
                                </h3>
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                                    <span className="font-medium">
                                      {visit.visitDate || visit.checkInTime
                                        ? new Date(visit.visitDate || visit.checkInTime).toLocaleString("vi-VN", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "N/A"}
                                    </span>
                                  </div>
                                  {visit.doctor && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <div className="flex items-center gap-1.5 text-slate-600">
                                        <User className="h-3.5 w-3.5 text-blue-500" />
                                        <span>
                                          {(() => {
                                            const name = visit.doctor.user?.fullName || visit.doctor.fullName || "N/A"
                                            return name.startsWith("BS.") ? name : `BS. ${name}`
                                          })()}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  {visit.doctor?.specialty && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                        {visit.doctor.specialty.name}
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  visit.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-3 py-1"
                                    : visit.status === "EXAMINING"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1"
                                    : "bg-slate-50 text-slate-700 border-slate-200 font-semibold px-3 py-1"
                                }
                              >
                                {visit.status === "COMPLETED" ? "Hoàn thành" : 
                                 visit.status === "EXAMINING" ? "Đang khám" : visit.status}
                              </Badge>
                            </div>

                            {}
                            {visit.symptoms && (
                              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold text-amber-800">Triệu chứng:</span>{" "}
                                  <span className="text-slate-600">{visit.symptoms}</span>
                                </p>
                              </div>
                            )}

                            {}
                            {visit.vitalSigns && Object.keys(visit.vitalSigns).length > 0 && (
                              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                                  <Heart className="h-4 w-4" />
                                  Sinh hiệu
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {visit.vitalSigns.bloodPressure && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-emerald-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Huyết áp</p>
                                      <p className="text-sm font-bold text-emerald-800">{visit.vitalSigns.bloodPressure}</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.heartRate && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-red-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Nhịp tim</p>
                                      <p className="text-sm font-bold text-red-700">{visit.vitalSigns.heartRate} bpm</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.temperature && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-orange-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Nhiệt độ</p>
                                      <p className="text-sm font-bold text-orange-700">{visit.vitalSigns.temperature}°C</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.respiratoryRate && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-blue-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Nhịp thở</p>
                                      <p className="text-sm font-bold text-blue-700">{visit.vitalSigns.respiratoryRate} l/ph</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.weight && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-purple-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Cân nặng</p>
                                      <p className="text-sm font-bold text-purple-700">{visit.vitalSigns.weight} kg</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.height && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-indigo-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Chiều cao</p>
                                      <p className="text-sm font-bold text-indigo-700">{visit.vitalSigns.height} cm</p>
                                    </div>
                                  )}
                                  {visit.vitalSigns.spo2 && (
                                    <div className="bg-white/60 rounded-lg p-2.5 border border-cyan-200/50">
                                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">SpO2</p>
                                      <p className="text-sm font-bold text-cyan-700">{visit.vitalSigns.spo2}%</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {}
                            {visit.note && (
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold text-blue-800">Ghi chú:</span>{" "}
                                  <span className="text-slate-600">{visit.note}</span>
                                </p>
                              </div>
                            )}

                            {}
                            <div className="pt-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 font-semibold shadow-sm hover:shadow transition-all"
                              >
                                <Link to={`/visits/${visit.id}`}>
                                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                                  Xem chi tiết
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="prescriptions">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-cyan-600" />
                  Đơn thuốc
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingPrescriptions ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có đơn thuốc</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-6 hover:bg-gradient-to-r hover:from-cyan-50/30 hover:to-blue-50/20 transition-all duration-300 group"
                      >
                        <div className="flex items-start gap-5">
                          {}
                          <div className="relative">
                            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                              <Pill className="h-6 w-6 text-white" />
                            </div>
                          </div>

                          {}
                          <div className="flex-1 space-y-3">
                            {}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                  {prescription.prescriptionCode}
                                </h3>
                                <div className="flex items-center gap-3 text-sm">
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Calendar className="h-3.5 w-3.5 text-cyan-500" />
                                    <span className="font-medium">
                                      {new Date(prescription.createdAt).toLocaleString("vi-VN", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {prescription.doctor && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <div className="flex items-center gap-1.5 text-slate-600">
                                        <User className="h-3.5 w-3.5 text-purple-500" />
                                        <span>
                                          {(() => {
                                            const name = prescription.doctor.user?.fullName || prescription.doctor.fullName || "N/A"
                                            return name.startsWith("BS.") ? name : `BS. ${name}`
                                          })()}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  prescription.status === "DISPENSED" || prescription.status === "LOCKED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-3 py-1"
                                    : prescription.status === "CANCELLED"
                                    ? "bg-red-50 text-red-700 border-red-200 font-semibold px-3 py-1"
                                    : prescription.status === "DRAFT"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold px-3 py-1"
                                    : "bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1"
                                }
                              >
                                {prescription.status === "DISPENSED"
                                  ? "Đã phát thuốc"
                                  : prescription.status === "LOCKED"
                                  ? "Đã khóa"
                                  : prescription.status === "CANCELLED"
                                  ? "Đã hủy"
                                  : prescription.status === "PENDING"
                                  ? "Chờ phát thuốc"
                                  : prescription.status === "DRAFT"
                                  ? "Nháp"
                                  : prescription.status}
                              </Badge>
                            </div>

                            {}
                            {prescription.medicines && prescription.medicines.length > 0 && (
                              <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-3">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold text-cyan-800">Số loại thuốc:</span>{" "}
                                  <span className="text-slate-900 font-bold">{prescription.medicines.length}</span>
                                </p>
                              </div>
                            )}

                            {}
                            {prescription.note && (
                              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold text-blue-800">Ghi chú:</span>{" "}
                                  <span className="text-slate-600">{prescription.note}</span>
                                </p>
                              </div>
                            )}

                            {}
                            <div className="pt-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="bg-white hover:bg-cyan-50 border-cyan-200 text-cyan-700 hover:text-cyan-800 font-semibold shadow-sm hover:shadow transition-all"
                              >
                                <Link to={`/admin/prescriptions/${prescription.id}`}>
                                  <Pill className="h-3.5 w-3.5 mr-1.5" />
                                  Xem chi tiết
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="invoices">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  Hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingInvoices ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <InvoiceIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có hóa đơn</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-6 hover:bg-emerald-50/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {invoice.invoiceCode}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  invoice.paymentStatus === "PAID"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : invoice.paymentStatus === "PARTIALLY_PAID"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                }
                              >
                                {invoice.paymentStatus === "PAID"
                                  ? "Đã thanh toán"
                                  : invoice.paymentStatus === "PARTIALLY_PAID"
                                  ? "Thanh toán một phần"
                                  : "Chưa thanh toán"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600">
                              <p>
                                <span className="text-slate-500">Tổng tiền:</span>{" "}
                                <span className="font-medium text-slate-900">
                                  {new Intl.NumberFormat("vi-VN").format(invoice.totalAmount) + " VND"}
                                </span>
                              </p>
                              <p>
                                <span className="text-slate-500">Đã trả:</span>{" "}
                                <span className="font-medium text-emerald-700">
                                  {new Intl.NumberFormat("vi-VN").format(invoice.paidAmount) + " VND"}
                                </span>
                              </p>
                              <p>
                                <span className="text-slate-500">Ngày tạo:</span>{" "}
                                {new Date(invoice.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                              {invoice.items && invoice.items.length > 0 && (
                                <p>
                                  <span className="text-slate-500">Dịch vụ:</span>{" "}
                                  {invoice.items.length} mục
                                </p>
                              )}
                              {invoice.payments && invoice.payments.length > 0 && (
                                <p className="col-span-2">
                                  <span className="text-slate-500">Thanh toán qua:</span>{" "}
                                  {getPaymentMethodLabel(invoice.payments[0].paymentMethod)}
                                  {invoice.payments.length > 1 && ` (+${invoice.payments.length - 1} lần khác)`}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/invoices/${invoice.id}`}>
                              Xem chi tiết
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {patient.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {patient.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản của bệnh nhân{" "}
                <strong>{patient.fullName}</strong>?
                {patient.isActive && (
                  <span className="block mt-2 text-amber-600">
                    Bệnh nhân sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={patient.isActive ? "destructive" : "default"}
                onClick={handleToggleStatusConfirm}
                disabled={isTogglingStatus}
                className={!patient.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {patient.isActive ? (
                      <><Ban className="h-4 w-4 mr-2" />Vô hiệu hóa</>
                    ) : (
                      <><UserCheck className="h-4 w-4 mr-2" />Kích hoạt</>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
