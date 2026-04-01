import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ReferralModal } from "../../components/modal/ReferralModal"
import DoctorSidebar from "../../components/layout/sidebar/doctor"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  ArrowLeft,
  User,
  Activity,
  Heart,
  Stethoscope,
  Save,
  History,
  FileText,
  FlaskConical,
  Loader2,
  CalendarDays,
  Clock,
  ShieldCheck,
  Thermometer,
  Wind,
  Scale,
  Ruler,
  ArrowRightLeft
} from "lucide-react"
import api from "../../lib/api"
import { toast } from "sonner"


interface PatientData {
  id: number
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE"
  phoneNumber: string
  appointmentId?: number
  visitId?: number
  symptomInitial?: string
  status?: string
  symptomImages?: string[]
}

interface VitalSign {
  key: string
  label: string
  value: string
  unit: string
}


const initialVitalSigns: VitalSign[] = [
  { key: "bloodPressure", label: "Huyết áp", value: "120/80", unit: "mmHg" },
  { key: "heartRate", label: "Nhịp tim", value: "72", unit: "bpm" },
  { key: "temperature", label: "Nhiệt độ", value: "36.5", unit: "°C" },
  { key: "spo2", label: "SpO2", value: "98", unit: "%" },
  { key: "respiratoryRate", label: "Nhịp thở", value: "20", unit: "l/p" },
  { key: "weight", label: "Cân nặng", value: "70", unit: "kg"},
  { key: "height", label: "Chiều cao", value: "170", unit: "cm" },
]

export default function FormMedical() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  
  const [observations, setObservations] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [privateRemarks, setPrivateRemarks] = useState("")
  
  
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>(initialVitalSigns)
  
  
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)

  
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const recordId = parseInt(id)
        
        
        
        try {
          const visitResponse = await api.get(`/visits/${recordId}`)
          if (visitResponse.data.success && visitResponse.data.data) {
            const visit = visitResponse.data.data
            const appointment = visit.appointment || {}
            const patient = visit.patient || {}
            const patientUser = patient.user || {}
            
            setPatientData({
              id: patient.id,
              fullName: patientUser.fullName || patient.fullName || "Unknown",
              dateOfBirth: patient.dateOfBirth || "",
              gender: patient.gender || "MALE",
              phoneNumber: patient.phoneNumber || "",
              appointmentId: appointment.id || visit.appointmentId,
              visitId: visit.id,
              symptomInitial: appointment.symptomInitial,
              status: visit.status,
              symptomImages: appointment.symptomImages
            })
            
            
            if (visit.diagnosis) setDiagnosis(visit.diagnosis)
            
            if (visit.vitalSigns) {
               setVitalSigns(prevVitals => prevVitals.map(v => ({
                 ...v,
                 value: visit.vitalSigns[v.key] ? String(visit.vitalSigns[v.key]) : ""
               })))
            }

            if (visit.note) {
               
               const obsMatch = visit.note.match(/CLINICAL OBSERVATIONS:\s*([\s\S]*?)(?=VITAL SIGNS:|ADDITIONAL NOTES:|$)/i);
               if (obsMatch && obsMatch[1].trim()) setObservations(obsMatch[1].trim());

               const notesMatch = visit.note.match(/ADDITIONAL NOTES:\s*([\s\S]*?)(?=Examination completed on:|$)/i);
               if (notesMatch && notesMatch[1].trim()) setPrivateRemarks(notesMatch[1].trim());
            }
            
            setError(null)
            return
          }
        } catch (visitErr: any) {
          
        }
        
        
        const response = await api.get(`/appointments/${recordId}`)
        const appointment = response.data.data || response.data

        if (appointment) {
          const patient = appointment.patient || appointment.Patient
          const patientUser = patient?.user || patient?.User || {}

          if (patient) {
            const visit = appointment.visit || appointment.Visit
            
            setPatientData({
              id: patient.id,
              fullName: patientUser.fullName || patient.fullName || "Unknown",
              dateOfBirth: patient.dateOfBirth || "",
              gender: patient.gender || "MALE",
              phoneNumber: patient.phoneNumber || "",
              appointmentId: appointment.id,
              visitId: visit?.id,
              symptomInitial: appointment.symptomInitial,
              status: visit?.status || appointment.status,
              symptomImages: appointment.symptomImages
            })

            
            if (visit) {
              if (visit.diagnosis) setDiagnosis(visit.diagnosis)
              if (visit.vitalSigns) {
                 setVitalSigns(prevVitals => prevVitals.map(v => ({
                   ...v,
                   value: visit.vitalSigns[v.key] ? String(visit.vitalSigns[v.key]) : ""
                 })))
              }
              if (visit.note) {
                 const obsMatch = visit.note.match(/CLINICAL OBSERVATIONS:\s*([\s\S]*?)(?=VITAL SIGNS:|ADDITIONAL NOTES:|$)/i);
                 if (obsMatch && obsMatch[1].trim()) setObservations(obsMatch[1].trim());

                 const notesMatch = visit.note.match(/ADDITIONAL NOTES:\s*([\s\S]*?)(?=Examination completed on:|$)/i);
                 if (notesMatch && notesMatch[1].trim()) setPrivateRemarks(notesMatch[1].trim());
              }
            }

            setError(null)
            return
          }
        }
        
        
        toast.error('Không tìm thấy lịch hẹn hoặc thông tin khám bệnh')
        setPatientData(null)
        setError('Không tìm thấy lịch hẹn hoặc thông tin khám bệnh')
        
      } catch (err: any) {
        console.error('Error fetching patient data:', err)
        const errorMessage = err.response?.data?.message || 'Không thể tải thông tin bệnh nhân'
        toast.error(errorMessage)
        setError(errorMessage)
        setPatientData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [id])

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

  const handleSaveExamination = async () => {
    if (!patientData) return
    
    
    if (!diagnosis || diagnosis.trim() === '') {
      toast.error('Vui lòng nhập chẩn đoán')
      setError('Vui lòng nhập chẩn đoán')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      
      const vitalsObj: any = {}
      vitalSigns.forEach(vs => {
        if (vs.value) {
          if (vs.key === 'bloodPressure') {
            vitalsObj[vs.key] = vs.value
          } else {
            vitalsObj[vs.key] = parseFloat(vs.value)
          }
        }
      })

      
      const visitData = {
        diagnosis: diagnosis.trim(),
        vitalSigns: vitalsObj,
        note: `
CLINICAL OBSERVATIONS:
${observations || "No observations recorded"}

VITAL SIGNS:
${vitalSigns.map(vital => `• ${vital.label}: ${vital.value} ${vital.unit}`).join('\n')}

ADDITIONAL NOTES:
${privateRemarks || "No additional notes"}

Examination completed on: ${new Date().toLocaleString()}
        `.trim()
      }
      
      console.log('Saving visit data:', visitData)

      
      let visitId = patientData.visitId

      
      if (!visitId && patientData.appointmentId) {
        try {
          const { checkInAppointment } = await import("@/features/appointment/services/visit.service")
          const visit = await checkInAppointment(patientData.appointmentId)
          visitId = visit.id
          console.log('Visit created successfully:', visitId)
        } catch (checkInError: any) {
          
          const errorMessage = checkInError.response?.data?.message || 'Không thể tạo visit'
          console.error('Check-in error:', errorMessage)
          toast.error(errorMessage)
          setError(errorMessage)
          return
        }
      }

      if (!visitId) {
        toast.error('Không tìm thấy visit ID')
        setError('Không tìm thấy visit ID')
        return
      }

      
      try {
        const response = await api.put(`/visits/${visitId}/complete`, visitData)

        if (response.data.success) {
          console.log('Visit completed successfully:', response.data)
          toast.success('Lưu khám thành công, chuyển sang kê đơn')
          
          navigate(`/doctor/patients/${id}/prescription`)
          return
        }
      } catch (apiError: any) {
        console.error('Error completing visit:', apiError)
        const errorMessage = apiError.response?.data?.message || 'Không thể lưu thông tin khám bệnh'
        toast.error(errorMessage)
        setError(errorMessage)
        return
      }
      
    } catch (err: any) {
      console.error('Error saving examination:', err)
      setError(err.response?.data?.message || 'Failed to save examination')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate("/doctor/medicalList")
  }

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading patient data...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (error && !patientData) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading patient data</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => navigate("/doctor/medicalList")}>
              Back to Medical List
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (!patientData) return null

  return (
    <DoctorSidebar>
      <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8 space-y-8">
        
        {}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-indigo-600 hover:bg-white pl-0 gap-2 transition-all"
            onClick={() => navigate("/doctor/medicalList")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold">Quay lại danh sách</span>
          </Button>

          <div className="flex gap-3">
             {patientData && patientData.status !== 'COMPLETED' && (
               <Button 
                  variant="outline" 
                  className="bg-white border-slate-200 text-slate-600 shadow-sm hover:text-indigo-600 hover:border-indigo-200"
                  onClick={() => setShowReferralModal(true)}
               >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Chuyển khoa
               </Button>
             )}
             <Button 
                variant="outline" 
                className="bg-white border-slate-200 text-slate-600 shadow-sm hover:text-indigo-600 hover:border-indigo-200"
                onClick={() => setShowHistoryModal(true)}
             >
                <History className="w-4 h-4 mr-2" />
                Lịch sử khám
             </Button>
          </div>
        </div>

        {patientData && (
          <ReferralModal 
            open={showReferralModal} 
            onOpenChange={setShowReferralModal}
            visitId={patientData.visitId || 0}
            onSuccess={() => {
               
            }}
          />
        )}

        {}
        <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <History className="w-5 h-5 text-indigo-600" />
                Lịch sử khám bệnh
              </DialogTitle>
              <DialogDescription>
                Lịch sử các lần khám trước của bệnh nhân {patientData.fullName}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {}
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-lg border border-slate-200 shadow-sm text-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Tháng {12-i}</span>
                      <span className="text-xl font-bold text-indigo-600">{15-i}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                       <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">Khám Nội Tổng Quát</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hoàn thành</Badge>
                       </div>
                       <p className="text-sm text-slate-600">
                         Chẩn đoán: {i === 0 ? "Viêm họng cấp" : i === 1 ? "Rối loạn tiêu hóa" : "Kiểm tra sức khỏe định kỳ"}
                       </p>
                       <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> Dr. Sarah Johnson</span>
                          <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Có đơn thuốc</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg shadow-indigo-100/50 border border-slate-100 p-6 lg:p-8 group transition-all hover:shadow-xl hover:shadow-indigo-200/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-full blur-3xl opacity-60 -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-indigo-300">
                {patientData.fullName.charAt(0)}
              </div>
              <div className={`absolute -bottom-2 -right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1 ${
                patientData.status === 'COMPLETED' ? 'bg-blue-600' :
                patientData.status === 'IN_PROGRESS' ? 'bg-orange-500' :
                'bg-emerald-500'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {patientData.status === 'COMPLETED' ? 'Đã khám' : 
                 patientData.status === 'IN_PROGRESS' ? 'Đang khám' : 
                 'Checked In'}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patientData.fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    <User className="w-4 h-4" />
                    ID: #{patientData.appointmentId}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {calculateAge(patientData.dateOfBirth)} tuổi
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {patientData.gender === "MALE" ? "Nam" : "Nữ"}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700">
                    0912 345 678
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-right border-l border-slate-100 pl-8 min-w-[200px]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ngày khám</span>
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                {new Date().toLocaleDateString('vi-VN')}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-1 rounded-lg">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        </div>

        {}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Chỉ số sinh tồn
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {vitalSigns.map((item, index) => {
              let Icon = Activity
              let colorClass = "from-slate-500 to-slate-600"
              let bgClass = "bg-slate-50"
              let borderClass = "border-slate-100"
              
              if(item.key === 'bloodPressure') { Icon = Heart; colorClass = "from-rose-500 to-red-600"; bgClass = "bg-rose-50/50"; borderClass = "border-rose-100" }
              if(item.key === 'heartRate') { Icon = Activity; colorClass = "from-pink-500 to-rose-500"; bgClass = "bg-pink-50/50"; borderClass = "border-pink-100" }
              if(item.key === 'temperature') { Icon = Thermometer; colorClass = "from-orange-500 to-amber-500"; bgClass = "bg-orange-50/50"; borderClass = "border-orange-100" }
              if(item.key === 'spo2') { Icon = Wind; colorClass = "from-sky-500 to-blue-500"; bgClass = "bg-sky-50/50"; borderClass = "border-sky-100" }
              if(item.key === 'respiratoryRate') { Icon = Wind; colorClass = "from-purple-500 to-fuchsia-500"; bgClass = "bg-purple-50/50"; borderClass = "border-purple-100" }
              if(item.key === 'weight') { Icon = Scale; colorClass = "from-emerald-500 to-green-500"; bgClass = "bg-emerald-50/50"; borderClass = "border-emerald-100" }
              if(item.key === 'height') { Icon = Ruler; colorClass = "from-indigo-500 to-violet-500"; bgClass = "bg-indigo-50/50"; borderClass = "border-indigo-100" }

              return (
                <div key={item.key} className={`relative overflow-hidden rounded-2xl p-4 border ${borderClass} ${bgClass} shadow-sm hover:shadow-md transition-all group`}>
                   <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                   </div>
                   <div className="relative">
                      <Input
                        value={item.value}
                        onChange={(e) => {
                           const newData = [...vitalSigns];
                           newData[index].value = e.target.value;
                           setVitalSigns(newData);
                        }}
                        className="text-2xl font-black bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-slate-900 placeholder:text-slate-300"
                        placeholder="--"
                      />
                      <span className="absolute bottom-1 right-0 text-xs font-bold text-slate-400">{item.unit}</span>
                   </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2 space-y-8">
            
            {}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
               <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500"></div>
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    Triệu chứng & Lý do khám
                 </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 mb-4">
                     <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Bệnh nhân khai báo</Label>
                     <p className="text-slate-700 font-medium leading-relaxed">
                        {patientData.symptomInitial || <span className="text-slate-400 italic">Không có thông tin khai báo</span>}
                     </p>
                  </div>

                  {patientData.symptomImages && patientData.symptomImages.length > 0 && (
                    <div className="mb-6">
                      <Label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                         Hình ảnh đính kèm từ Booking
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {patientData.symptomImages.map((img, idx) => {
                           
                           const getImageUrl = (path: string) => {
                             if (!path) return "/placeholder-image.jpg"; 
                             if (path.startsWith("http")) return path;
                             
                             
                             const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                             const baseUrl = apiUrl.replace(/\/api\/?$/, "");
                             
                             
                             let normalizedPath = path.replace(/\\/g, "/");
                             if (!normalizedPath.startsWith("/")) {
                               normalizedPath = `/${normalizedPath}`;
                             }
                             
                             return `${baseUrl}${normalizedPath}`;
                           };

                           const fullImageUrl = getImageUrl(img);

                           return (
                             <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => window.open(fullImageUrl, '_blank')}>
                                <img 
                                  src={fullImageUrl} 
                                  alt={`Symptom ${idx+1}`} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Error+Loading+Image';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                   <span className="bg-white/90 text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">Xem full</span>
                                </div>
                             </div>
                           );
                         })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                     <Label className="text-sm font-semibold text-slate-700">Ghi chú lâm sàng chi tiết</Label>
                     <Textarea
                        placeholder="Nhập chi tiết quan sát, khám lâm sàng và các ghi chú khác..."
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        rows={8}
                        className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all resize-none text-slate-700 leading-relaxed rounded-xl p-4"
                     />
                     <div className="flex justify-end">
                       <span className="text-xs font-medium text-slate-400">{observations.length} ký tự</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
               <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
               <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-800">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Heart className="w-5 h-5" />
                    </div>
                    Chẩn đoán & Kết luận
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Chẩn đoán sơ bộ <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input
                        placeholder="Nhập chẩn đoán bệnh..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="h-12 text-lg font-medium border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 pl-4 rounded-xl shadow-sm"
                      />
                    </div>
                 </div>

                 <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Lời dặn của bác sĩ / Ghi chú thêm</Label>
                    <Textarea
                       placeholder="Hướng dẫn điều trị, chế độ ăn uống, lịch tái khám..."
                       value={privateRemarks}
                       onChange={(e) => setPrivateRemarks(e.target.value)}
                       rows={5}
                       className="bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 transition-all resize-none text-slate-700 leading-relaxed rounded-xl p-4"
                    />
                 </div>
               </CardContent>
            </Card>

          </div>

          {}
          <div className="space-y-6 sticky top-6 h-fit">
             <Card className="border-0 shadow-lg shadow-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden rounded-2xl">
                <CardContent className="p-6 space-y-6">
                   <div>
                      <h3 className="text-xl font-bold mb-1">Hoàn tất khám</h3>
                      <p className="text-indigo-100 text-sm opacity-90">Lưu thông tin khám và chuyển sang kê đơn thuốc.</p>
                   </div>
                   
                   <div className="space-y-3">
                      <Button 
                         className="w-full h-12 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-base shadow-lg hover:shadow-xl transition-all border-0"
                         onClick={handleSaveExamination}
                         disabled={saving}
                      >
                         {saving ? (
                           <>
                             <Loader2 className="w-5 h-5 mr-2 animate-spin text-indigo-600" />
                             Đang xử lý...
                           </>
                         ) : (
                           <>
                             <Save className="w-5 h-5 mr-2" />
                             Lưu & Kê đơn
                           </>
                         )}
                      </Button>

                      <Button 
                         variant="ghost" 
                         className="w-full text-indigo-100 hover:text-white hover:bg-white/10"
                         onClick={handleCancel}
                      >
                         Hủy bỏ
                      </Button>
                   </div>
                </CardContent>
             </Card>

             {}
             <Card className="border-0 shadow-md bg-white rounded-2xl p-6 opacity-70 hover:opacity-100 transition-opacity">
                <h4 className="font-bold text-slate-700 mb-3">Lưu ý nhanh</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                   <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></span>
                      Kiểm tra dị ứng thuốc trước khi kê đơn.
                   </li>
                   <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></span>
                      Cập nhật đầy đủ chỉ số sinh tồn.
                   </li>
                </ul>
             </Card>
          </div>

        </div>
      </div>
    </DoctorSidebar>
  )
}
