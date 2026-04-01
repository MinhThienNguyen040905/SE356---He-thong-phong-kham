import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DoctorSidebar from "../../components/layout/sidebar/doctor"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Activity,
  Heart,
  Thermometer,
  Stethoscope
} from "lucide-react"
import api from "../../lib/api"
import { toast } from "sonner"

interface PatientData {
  id: number
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE"
  phoneNumber: string
  visitId: number
  symptomInitial?: string
  status?: string
}

interface VitalSign {
  key: string
  label: string
  value: string
  unit: string
}

const initialVitalSigns: VitalSign[] = [
  { key: "bloodPressure", label: "Huyết áp", value: "", unit: "mmHg" },
  { key: "heartRate", label: "Nhịp tim", value: "", unit: "bpm" },
  { key: "temperature", label: "Nhiệt độ", value: "", unit: "°C" },
  { key: "spo2", label: "SpO2", value: "", unit: "%" },
  { key: "respiratoryRate", label: "Nhịp thở", value: "", unit: "l/p" },
  { key: "weight", label: "Cân nặng", value: "", unit: "kg"},
  { key: "height", label: "Chiều cao", value: "", unit: "cm" },
]

export default function ConsultationPage() {
  const { visitId } = useParams()
  const navigate = useNavigate()
  
  const [patientData, setPatientData] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [diagnosis, setDiagnosis] = useState("")
  const [consultationNote, setConsultationNote] = useState("")
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>(initialVitalSigns)

  useEffect(() => {
    const fetchVisitData = async () => {
      if (!visitId) return

      try {
        setLoading(true)
        const response = await api.get(`/visits/${visitId}`)
        
        if (response.data.success && response.data.data) {
           const visit = response.data.data
           const patient = visit.patient || {}
           const appointment = visit.appointment || {}
           
           setPatientData({
             id: patient.id,
             
             fullName: appointment.patientName || patient.user?.fullName || patient.fullName || "Unknown",
             dateOfBirth: appointment.patientDob || patient.dateOfBirth || "",
             gender: appointment.patientGender || patient.gender || "MALE",
             phoneNumber: appointment.patientPhone || patient.phoneNumber || "",
             visitId: visit.id,
             symptomInitial: visit.reason || appointment.symptomInitial,
             status: visit.status
           })

           
           if (visit.vitalSigns) {
               setVitalSigns(prevVitals => prevVitals.map(v => ({
                 ...v,
                 value: visit.vitalSigns[v.key] ? String(visit.vitalSigns[v.key]) : ""
               })))
           }
           
           
           if (visit.diagnosis) {
               setDiagnosis(visit.diagnosis)
           }
        } else {
           toast.error("Không tìm thấy thông tin khám")
           navigate("/doctor/medicalList")
        }
      } catch (err) {
        console.error("Error fetching visit:", err)
        toast.error("Lỗi khi tải thông tin khám")
      } finally {
        setLoading(false)
      }
    }

    fetchVisitData()
  }, [visitId])

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleCompleteConsultation = async () => {
     if (!visitId) return

     
     if (!consultationNote.trim()) {
        toast.error("Vui lòng nhập kết quả kiểm tra/tư vấn")
        return
     }

     try {
       setSaving(true)

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

       const payload = {
         visitId: Number(visitId),
         note: consultationNote,
         vitalSignsUpdate: vitalsObj,
         diagnosis: diagnosis.trim() || undefined 
       }

       await api.put(`/visits/referral/complete`, payload)
       
       toast.success("Đã hoàn tất kiểm tra chuyên khoa")
       navigate("/doctor/medicalList")

     } catch (err: any) {
        console.error("Error completing consultation:", err)
        toast.error(err.response?.data?.message || "Lỗi khi lưu kết quả kiểm tra")
     } finally {
        setSaving(false)
     }
  }

  if (loading) {
     return (
        <DoctorSidebar>
          <div className="flex items-center justify-center h-screen">
             <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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
              <Button variant="ghost" onClick={() => navigate("/doctor/medicalList")}>
                 <ArrowLeft className="w-4 h-4 mr-2" />
                 Quay lại danh sách
              </Button>
          </div>

          {}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold">
                   {patientData.fullName.charAt(0)}
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">{patientData.fullName}</h1>
                   <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{patientData.gender === "MALE" ? "Nam" : "Nữ"}</span>
                      <span>•</span>
                      <span>{calculateAge(patientData.dateOfBirth)} tuổi</span>
                   </div>
                </div>
             </div>
             
             <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Trạng thái</div>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">
                   Đang kiểm tra chuyên khoa
                </Badge>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-6">
                
                {}
                <Card className="border-0 shadow-sm">
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                         <Activity className="w-5 h-5 text-indigo-600" />
                         Cập nhật Chỉ số sinh tồn
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {vitalSigns.map((item, index) => {
                           let Icon = Activity
                           if(item.key === 'bloodPressure') Icon = Heart
                           if(item.key === 'temperature') Icon = Thermometer
                           
                           return (
                             <div key={item.key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-600">
                                   <Icon className="w-4 h-4" />
                                   {item.label}
                                </div>
                                <div className="flex items-end gap-2">
                                  <Input 
                                    value={item.value}
                                    onChange={(e) => {
                                       const newData = [...vitalSigns]
                                       newData[index].value = e.target.value
                                       setVitalSigns(newData)
                                    }}
                                    className="bg-white h-10 font-bold border-slate-200" 
                                    placeholder="--"
                                  />
                                  <span className="text-xs text-slate-400 mb-2 font-medium">{item.unit}</span>
                                </div>
                             </div>
                           )
                        })}
                      </div>
                   </CardContent>
                </Card>

                {}
                <Card className="border-0 shadow-sm">
                   <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                         <Stethoscope className="w-5 h-5 text-indigo-600" />
                         Kết quả kiểm tra / Ghi chú
                      </CardTitle>
                   </CardHeader>
                   <CardContent>
                      <Textarea 
                         value={consultationNote}
                         onChange={(e) => setConsultationNote(e.target.value)}
                         placeholder="Nhập kết quả kiểm tra, ý kiến chuyên môn..."
                         rows={8}
                         className="resize-none border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 p-4 leading-relaxed"
                      />
                   </CardContent>
                </Card>

             </div>

             <div className="space-y-6">
                 <Card className="bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-200">
                    <CardContent className="p-6">
                       <h3 className="text-lg font-bold mb-2">Hoàn tất kiểm tra</h3>
                       <p className="text-indigo-100 text-sm mb-6">
                          Lưu kết quả và cập nhật chỉ số sinh tồn cho hồ sơ chính.
                       </p>
                       <Button 
                          onClick={handleCompleteConsultation}
                          disabled={saving}
                          className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-bold h-12"
                       >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                          Hoàn tất & Gửi
                       </Button>
                    </CardContent>
                 </Card>
             </div>
          </div>
       </div>
    </DoctorSidebar>
  )
}

