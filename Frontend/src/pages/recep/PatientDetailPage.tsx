"use client"

import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { format } from "date-fns"
import ReceptionistSidebar from '../../components/layout/sidebar/recep'
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
  Receipt,
  ChevronRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Activity,
  History,
  FileSearch
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"
import {
  getPatientById,
  uploadPatientAvatar,
  getPatientMedicalHistory,
  getPatientPrescriptions,
  type Patient,
  type Visit,
  type Prescription,
} from "../../features/patient/services/patient.service"
import { InvoiceService, type Invoice, PaymentStatus } from "../../features/finance/services/invoice.service"


const cleanNoteText = (noteText: string) => {
  if (!noteText) return "Không có ghi chú";
  let cleanedText = noteText;
  cleanedText = cleanedText.replace(/CLINICAL OBSERVATIONS:.*?ADDITIONAL NOTES:/is, "");
  cleanedText = cleanedText.replace(/VITAL SIGNS:.*?(?=\n\n|$)/is, "");
  cleanedText = cleanedText.replace(/Huy[eếệ]t áp:\s*\d+\/\d+\s*mmHg\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Nh[iịĩ]p tim:\s*\d+\s*bpm\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Nhi[eệ]t đ[oộ]:\s*\d+(?:\.\d+)?\s*°C\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/SpO2:\s*\d+\s*%\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/C[aâ]n n[ặa]ng:\s*\d+(?:\.\d+)?\s*kg\s*•?\s*/gi, "");
  cleanedText = cleanedText.replace(/Examination completed on:.*$/im, "");
  cleanedText = cleanedText.replace(/•\s*/g, "");
  return cleanedText.trim() || "Không có ghi chú chi tiết";
};

export default function RecepPatientDetail() {
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
  
  const [historyStartDate, setHistoryStartDate] = useState<string>("")
  const [historyEndDate, setHistoryEndDate] = useState<string>("")
  const [prescriptionStartDate, setPrescriptionStartDate] = useState<string>("")
  const [prescriptionEndDate, setPrescriptionEndDate] = useState<string>("")

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getPatientById(Number(id))
        setPatient(data)
        
        await fetchMedicalHistory()
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin bệnh nhân")
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
      toast.error(error.response?.data?.message || "Không thể tải lịch sử khám bệnh")
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
      toast.error(error.response?.data?.message || "Không thể tải đơn thuốc")
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
      toast.error(error.response?.data?.message || "Không thể tải hóa đơn")
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
      
      const newAvatarUrl = `${result.avatar}?t=${new Date().getTime()}`
      setPatient((prev) => (prev ? { ...prev, avatar: newAvatarUrl } : null))
      toast.success("Upload avatar thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể upload avatar")
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <ReceptionistSidebar>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang truy xuất hồ sơ bệnh nhân...</p>
        </div>
      </ReceptionistSidebar>
    )
  }

  if (!patient) {
    return (
      <ReceptionistSidebar>
        <div className="flex flex-col items-center justify-center h-[80vh] text-center gap-4">
          <ShieldAlert className="w-16 h-16 text-rose-500 opacity-20" />
          <h2 className="text-2xl font-extrabold text-slate-800">Hồ sơ không tồn tại</h2>
          <p className="text-slate-500 max-w-sm">Chúng tôi không thể tìm thấy thông tin bệnh nhân này trong hệ thống.</p>
          <Button asChild className="mt-4 bg-indigo-600 rounded-xl">
            <Link to="/recep/patients"><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách</Link>
          </Button>
        </div>
      </ReceptionistSidebar>
    )
  }

  const phoneProfile = patient.profiles?.find((p: any) => p.type === "phone")
  const emailProfile = patient.profiles?.find((p: any) => p.type === "email")
  const addressProfile = patient.profiles?.find((p: any) => p.type === "address")

  return (
    <ReceptionistSidebar>
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="container mx-auto px-6 py-8 max-w-[1600px]">
          
          {}
          <div className="mb-6">
            <Button variant="ghost" className="rounded-xl px-0 hover:bg-transparent group" asChild>
              <Link to="/recep/patients" className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center group-hover:bg-indigo-50 group-hover:ring-indigo-200">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span>Danh sách bệnh nhân</span>
              </Link>
            </Button>
          </div>

          {}
          <Card className="border-0 shadow-lg bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden mb-8">
            <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-700 overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                  <div className="absolute right-20 -bottom-20 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
               </div>
            </div>
            
            <div className="px-8 pb-8 -mt-16 relative z-10">
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                    <div className="relative group">
                      <Avatar className="h-40 w-40 border-[6px] border-white shadow-xl rounded-2xl overflow-hidden bg-slate-100">
                        <AvatarImage
                          src={patient.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${patient.avatar}` : undefined}
                          alt={patient.fullName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 text-5xl font-black">
                          {getInitials(patient.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                         {isUploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                          <input
                             id="avatar-upload"
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={handleAvatarUpload}
                          />
                       </label>
                    </div>
                    
                    <div className="text-center sm:text-left mb-2">
                       <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 flex flex-col sm:flex-row items-center gap-3">
                          {patient.fullName}
                          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 text-sm px-3 py-1">
                             {patient.patientCode}
                          </Badge>
                       </h1>
                       <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-500 font-bold text-sm">
                          <div className="flex items-center gap-1.5">
                             <Calendar className="w-4 h-4 text-indigo-400" />
                             {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}
                             <span className="text-slate-300 mx-1">•</span>
                             {calculateAge(patient.dateOfBirth)} tuổi
                          </div>
                          <div className="flex items-center gap-1.5">
                             {patient.gender === 'MALE' ? <User className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4 text-rose-500" />}
                             {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4 lg:mb-2">
                     <Button className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 shadow-sm font-bold rounded-xl" onClick={() => window.print()}>
                        <FileText className="w-4 h-4 mr-2" /> Xuất hồ sơ
                     </Button>
                     <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-bold rounded-xl">
                        <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                     </Button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-slate-100 divide-x divide-slate-100">
               {[
                 { label: "Nhóm máu", value: patient.bloodType || "N/A", icon: Droplet, color: "rose" },
                 { label: "Chiều cao", value: patient.height ? `${patient.height} cm` : "N/A", icon: Ruler, color: "blue" },
                 { label: "Cân nặng", value: patient.weight ? `${patient.weight} kg` : "N/A", icon: Weight, color: "emerald" },
                 { label: "BMI", value: "N/A", icon: Activity, color: "amber" }
               ].map((item, idx) => (
                 <div key={idx} className="p-6 transition-colors hover:bg-slate-50/50 group">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${item.color}-50 group-hover:scale-110 transition-transform`}>
                          <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</div>
                          <div className="text-xl font-extrabold text-slate-900">{item.value}</div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </Card>

          {}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white p-1 rounded-2xl ring-1 ring-slate-200 shadow-sm inline-flex w-auto overflow-x-auto max-w-full no-scrollbar">
              <TabsTrigger value="overview" className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Tổng quan</TabsTrigger>
              <TabsTrigger value="medical-history" onClick={fetchMedicalHistory} className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Lịch sử khám</TabsTrigger>
              <TabsTrigger value="prescriptions" onClick={fetchPrescriptions} className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Đơn thuốc</TabsTrigger>
              <TabsTrigger value="invoices" onClick={fetchInvoices} className="rounded-xl font-bold px-6 py-2.5 data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Hóa đơn</TabsTrigger>
            </TabsList>

            {}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 {}
                 <div className="lg:col-span-4 space-y-8">
                    <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                       <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                             <User className="w-4 h-4 text-indigo-500" />
                             Thông tin cá nhân
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-8 space-y-6">
                          <div className="group">
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Số điện thoại</div>
                             <div className="flex items-center gap-3 text-slate-700 font-bold">
                                <Phone className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                {phoneProfile?.value || "Chưa cập nhật"}
                             </div>
                          </div>
                          <div className="group">
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email liên hệ</div>
                             <div className="flex items-center gap-3 text-slate-700 font-bold break-all">
                                <Mail className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                {emailProfile?.value || "Chưa cập nhật"}
                             </div>
                          </div>
                          <div className="group">
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Địa chỉ thường trú</div>
                             <div className="flex items-start gap-3 text-slate-700 font-bold">
                                <MapPin className="w-4 h-4 text-slate-300 mt-0.5 group-hover:text-indigo-600 transition-colors" />
                                {addressProfile?.value || "Chưa cập nhật"}
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </div>

                 {}
                 <div className="lg:col-span-8 space-y-8">
                    <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                       <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                          <CardTitle className="text-lg font-black text-slate-800">Cơ sở dữ liệu bệnh án</CardTitle>
                          <Activity className="w-5 h-5 text-indigo-500" />
                       </CardHeader>
                       <CardContent className="p-0">
                          <div className="grid grid-cols-1 md:grid-cols-2">
                             <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                   <AlertCircle className="w-4 h-4 text-rose-500" /> Tiền sử dị ứng
                                </h3>
                                <div className="space-y-2">
                                   <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl font-bold flex items-center gap-2">
                                      <ShieldAlert className="w-4 h-4" />
                                      Chưa phát hiện dị ứng thuốc/thực phẩm
                                   </div>
                                </div>
                             </div>
                             <div className="p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-500" /> Lần thăm khám cuối
                                </h3>
                                {medicalHistory.length > 0 ? (
                                   <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                      <div className="text-blue-900 font-extrabold mb-1">{medicalHistory[0].diagnosis || "Kham định kỳ"}</div>
                                      <div className="text-xs text-blue-500 font-bold flex items-center gap-1.5">
                                         <Calendar className="w-3.5 h-3.5" />
                                         {new Date(medicalHistory[0].visitDate || medicalHistory[0].checkInTime).toLocaleDateString("vi-VN")}
                                      </div>
                                   </div>
                                ) : (
                                   <div className="text-slate-400 font-medium italic">Chưa có dữ liệu khám chữa bệnh</div>
                                )}
                             </div>
                          </div>
                       </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                       <CardHeader className="px-8 py-6">
                          <CardTitle className="text-lg font-black text-slate-800">Ghi chú y tế đặc thù</CardTitle>
                       </CardHeader>
                       <CardContent className="px-8 pb-8">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 font-medium leading-relaxed">
                             "Bệnh nhân có tiền sử cao huyết áp nhẹ, cần theo dõi chỉ số Vital Signs mỗi khi thăm khám. Lưu ý khi chỉ định các dòng thuốc kích thích thần kinh."
                          </div>
                       </CardContent>
                    </Card>
                 </div>
              </div>
            </TabsContent>

             {}
             <TabsContent value="medical-history">
                <Card className="border-0 shadow-lg bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                   <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                         <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            <History className="w-6 h-6 text-blue-600" />
                            Lịch sử khám bệnh
                         </CardTitle>
                         <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Dữ liệu ghi chép từ các phiên khám</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                         <Input 
                            type="date" 
                            value={historyStartDate} 
                            onChange={(e) => setHistoryStartDate(e.target.value)} 
                            className="h-9 border-0 focus-visible:ring-0 text-xs font-bold w-auto" 
                         />
                         <span className="text-slate-300 font-bold px-2">—</span>
                         <Input 
                            type="date" 
                            value={historyEndDate} 
                            onChange={(e) => setHistoryEndDate(e.target.value)} 
                            className="h-9 border-0 focus-visible:ring-0 text-xs font-bold w-auto" 
                         />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      {isLoadingHistory ? (
                         <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                      ) : medicalHistory.length === 0 ? (
                         <div className="py-24 text-center grayscale opacity-50">
                            <FileSearch className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                            <p className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">Chưa có lịch sử khám bệnh</p>
                         </div>
                      ) : (
                         <div className="divide-y divide-slate-50">
                            {medicalHistory.map((visit) => (
                               <div key={visit.id} className="p-8 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-6 relative group">
                                  <div className="flex-shrink-0 flex flex-col items-center">
                                     <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <History className="w-7 h-7" />
                                     </div>
                                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-1 rounded-lg">
                                        {format(new Date(visit.visitDate || visit.checkInTime), "dd/MM/yy")}
                                     </div>
                                  </div>
                                  <div className="flex-1 space-y-5">
                                     <div className="flex items-start justify-between">
                                        <div>
                                           <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors uppercase leading-tight">
                                              {visit.diagnosis || "Kiểm tra sức khỏe"}
                                           </h3>
                                           <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/50">
                                                 <User className="w-3.5 h-3.5 text-blue-500" /> 
                                                 BS. {visit.doctor?.user?.fullName || visit.doctor?.fullName || "Chuyên khoa"}
                                              </div>
                                              <div className="text-slate-300">|</div>
                                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/50">
                                                 <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                                                 {format(new Date(visit.visitDate || visit.checkInTime), "HH:mm")}
                                              </div>
                                           </div>
                                        </div>
                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold rounded-lg px-3 py-1 shadow-sm">
                                           Đã hoàn thành
                                        </Badge>
                                     </div>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl ring-1 ring-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                        <div className="space-y-2">
                                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                              <Activity className="w-3.5 h-3.5" /> Triệu chứng ban đầu
                                           </div>
                                           <p className="text-sm text-slate-800 font-bold leading-relaxed border-l-2 border-orange-200 pl-3">
                                              {visit.symptoms || "Không có ghi chép triệu chứng cụ thể"}
                                           </p>
                                        </div>
                                        <div className="space-y-2">
                                           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                              <FileText className="w-3.5 h-3.5" /> Ghi chú & Dặn dò
                                           </div>
                                           <p className="text-sm text-slate-600 font-medium leading-relaxed border-l-2 border-blue-200 pl-3">
                                              {cleanNoteText(visit.note || "")}
                                           </p>
                                        </div>
                                     </div>
                                     
                                     <div className="flex justify-end pt-2">
                                        <Button variant="ghost" className="rounded-xl h-10 font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all" asChild>
                                           <Link to={`/visits/${visit.id}`}>
                                              Xem báo cáo chi tiết <ChevronRight className="w-4 h-4 ml-1" />
                                           </Link>
                                        </Button>
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
               <Card className="border-0 shadow-lg bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-row items-center justify-between">
                     <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Receipt className="w-6 h-6 text-emerald-600" />
                        Danh sách hóa đơn
                     </CardTitle>
                     {!isLoadingInvoices && <Badge className="bg-white border-slate-200 text-slate-600 font-bold">{invoices.length} bản ghi</Badge>}
                  </CardHeader>
                  <CardContent className="p-0">
                     {isLoadingInvoices ? (
                        <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
                     ) : invoices.length === 0 ? (
                        <div className="py-24 text-center opacity-40">
                           <Receipt className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                           <p className="font-bold uppercase tracking-widest text-xs">Không tìm thấy hóa đơn</p>
                        </div>
                     ) : (
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mã hóa đơn</th>
                                    <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thời gian</th>
                                    <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Tổng tiền (VND)</th>
                                    <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                                    <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-emerald-50/20 transition-all duration-200">
                                       <td className="py-5 px-8 font-black text-slate-900 uppercase text-sm group-hover:text-emerald-700 transition-colors">{inv.invoiceCode}</td>
                                       <td className="py-5 px-6 italic text-slate-500 text-xs font-bold">{format(new Date(inv.createdAt), "dd/MM/yyyy HH:mm")}</td>
                                       <td className="py-5 px-6 text-right font-black text-slate-900 group-hover:scale-105 transition-transform origin-right">
                                          {parseFloat(inv.totalAmount.toString()).toLocaleString("vi-VN")} VND
                                       </td>
                                       <td className="py-5 px-6 text-center">
                                          {inv.paymentStatus === 'PAID' ? 
                                             <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold rounded-lg px-2.5 py-1">Hoàn tất</Badge> :
                                             <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-bold rounded-lg px-2.5 py-1">Chưa trả</Badge>
                                          }
                                       </td>
                                       <td className="py-5 px-8 text-right">
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md transition-all group/btn" asChild>
                                             <Link to={`/invoices/${inv.id}`}><ExternalLink className="w-4 h-4 text-slate-400 group-hover/btn:text-emerald-600 transition-all" /></Link>
                                          </Button>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}
                  </CardContent>
               </Card>
            </TabsContent>

            {}
            <TabsContent value="prescriptions">
              <Card className="border-0 shadow-lg bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                    <CardTitle className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                       <Pill className="w-6 h-6 text-indigo-600" />
                       Danh sách đơn thuốc
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Lịch sử kê đơn và chỉ định thuốc</p>
                  </div>
                  {!isLoadingPrescriptions && <Badge className="bg-white border-slate-200 text-slate-600 font-bold">{prescriptions.length} đơn thuốc</Badge>}
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingPrescriptions ? (
                     <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
                  ) : prescriptions.length === 0 ? (
                     <div className="py-24 text-center opacity-40">
                        <Pill className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="font-bold uppercase tracking-widest text-xs">Chưa có đơn thuốc nào</p>
                     </div>
                  ) : (
                     <div className="divide-y divide-slate-50">
                        {prescriptions.map((pres) => (
                           <div key={pres.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                       <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <div className="font-black text-slate-900 text-lg uppercase tracking-tight">{pres.prescriptionCode}</div>
                                       <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mt-0.5">
                                          <span>{format(new Date(pres.createdAt), "dd/MM/yyyy HH:mm")}</span>
                                          <span className="text-slate-300">|</span>
                                          <span>BS. {pres.doctor?.user?.fullName || pres.doctor?.fullName || "N/A"}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <Badge className={`
                                    ${pres.status === 'COMPLETED' || pres.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                      pres.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                      pres.status === 'LOCKED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                      'bg-blue-50 text-blue-700 border-blue-100'} 
                                    font-bold rounded-lg px-3 py-1 h-fit shadow-sm`}>
                                    {pres.status === 'COMPLETED' || pres.status === 'DISPENSED' ? 'Đã hoàn thành' : 
                                     pres.status === 'CANCELLED' ? 'Đã hủy' : 
                                     pres.status === 'LOCKED' ? 'Đã khóa (Chờ thanh toán)' : 
                                     'Bản nháp'}
                                 </Badge>
                              </div>
                              
                              <div className="bg-slate-50/80 rounded-2xl p-6 ring-1 ring-slate-200/50">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Pill className="w-3.5 h-3.5" /> Chi tiết thuốc
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(pres.details || pres.medicines)?.map((item: any) => (
                                       <div key={item.id} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-extrabold text-xs">
                                             {item.quantity}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="font-bold text-slate-800 text-sm leading-tight truncate" title={item.medicineName || item.medicine?.name}>
                                                {item.medicineName || item.medicine?.name}
                                             </div>
                                             <div className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-tight truncate">
                                                {item.medicineName ? (
                                                   
                                                   <>
                                                      {Number(item.dosageMorning) > 0 && `Sáng ${Number(item.dosageMorning)} `}
                                                      {Number(item.dosageNoon) > 0 && `Trưa ${Number(item.dosageNoon)} `}
                                                      {Number(item.dosageAfternoon) > 0 && `Chiều ${Number(item.dosageAfternoon)} `}
                                                      {Number(item.dosageEvening) > 0 && `Tối ${Number(item.dosageEvening)}`}
                                                      {!item.dosageMorning && !item.dosageNoon && !item.dosageAfternoon && !item.dosageEvening && item.instruction}
                                                   </>
                                                ) : (
                                                   
                                                   `${item.dosage || ''} • ${item.frequency || ''}`
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                                 {pres.note && (
                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                       <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
                                          <FileText className="w-3 h-3" /> Ghi chú
                                       </div>
                                       <p className="text-sm text-slate-700 font-medium italic">{pres.note}</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lab-results" className="text-center py-24 text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50 bg-white rounded-3xl ring-1 ring-slate-200 shadow-sm">
               Kết quả xét nghiệm hiện chưa có bản ghi mới
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ReceptionistSidebar>
  )
}