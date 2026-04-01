"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Switch } from "../../../components/ui/switch"
import { Textarea } from "../../../components/ui/textarea"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Calendar } from "../../../components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog"
import { 
  CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  Stethoscope, 
  FileText, 
  Mail, 
  Loader2,
  Heart,
  Brain,
  Baby,
  Eye,
  Bone,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Minimize2,
  Maximize2,
  Phone,
  UserCheck,
  CalendarCheck,
  Activity,
  Upload,
  X,
  Image as ImageIcon,
  Users,
} from "lucide-react"
import { cn } from "../../../lib/utils"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { SpecialtyService, type Specialty } from "../services/specialty.service"
import { ShiftService, type DoctorWithShifts } from "../../shift/services/shift.service"
import { createAppointment, uploadSymptomImages } from "../services/appointment.service"
import { useAuth } from "../../auth/context/authContext"


const getSpecialtyIcon = (name: string) => {
  const lowerName = name.toLowerCase()
  if (lowerName.includes("tim") || lowerName.includes("mạch")) return Heart
  if (lowerName.includes("nội")) return Activity
  if (lowerName.includes("nhi") || lowerName.includes("trẻ")) return Baby
  if (lowerName.includes("mắt") || lowerName.includes("mũi") || lowerName.includes("tai")) return Eye
  if (lowerName.includes("xương") || lowerName.includes("ngoại")) return Bone
  if (lowerName.includes("thần")) return Brain
  if (lowerName.includes("sản") || lowerName.includes("phụ")) return Heart
  return Stethoscope
}


const getSpecialtyGradient = (index: number) => {
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-emerald-500 to-teal-400",
    "from-orange-500 to-amber-400",
    "from-rose-500 to-red-400",
    "from-indigo-500 to-violet-400",
  ]
  return gradients[index % gradients.length]
}

export function BookingForm() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctorsWithShifts, setDoctorsWithShifts] = useState<DoctorWithShifts[]>([])
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false)
  const [isLoadingDoctorsByDate, setIsLoadingDoctorsByDate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDoctorShifts, setSelectedDoctorShifts] = useState<any[]>([])

  
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedShift, setSelectedShift] = useState<number | null>(null)
  const [date, setDate] = useState<Date>()
  const [step, setStep] = useState(1)
  
  
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientDob, setPatientDob] = useState("")
  const [patientGender, setPatientGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE")
  const [isBookingForRelative, setIsBookingForRelative] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [symptoms, setSymptoms] = useState("")
  const [symptomImages, setSymptomImages] = useState<File[]>([])
  const [symptomImagePreviews, setSymptomImagePreviews] = useState<string[]>([])
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState<any>(null)
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setIsLoadingSpecialties(true)
        const response = await SpecialtyService.getSpecialties({ active: true })
        setSpecialties(response.specialties)
      } catch (error: any) {
        console.error("Error fetching specialties:", error)
        toast.error("Không thể tải danh sách chuyên khoa")
      } finally {
        setIsLoadingSpecialties(false)
      }
    }
    fetchSpecialties()
  }, [])

  
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (isAuthenticated && user && user.patientId) {
        try {
          const { getPatientById } = await import("@/features/patient/services/patient.service")
          const patientData = await getPatientById(user.patientId)
          setUserProfile(patientData)
        } catch (error) {
          console.error("Error fetching patient profile:", error)
        }
      }
    }
    fetchPatientProfile()
  }, [isAuthenticated, user])

  
  useEffect(() => {
    if (isBookingForRelative) {
      
      setPatientName("")
      setPatientPhone("")
      setPatientDob("")
      setPatientGender("MALE")
      
    } else {
      
      setPatientName(user?.fullName || "")
      if (userProfile) {
        setPatientPhone(userProfile.phone || "")
        setPatientDob(userProfile.dateOfBirth ? String(userProfile.dateOfBirth).split('T')[0] : "")
        setPatientGender(userProfile.gender || "MALE")
      }
    }
  }, [isBookingForRelative, userProfile, user])

  
  useEffect(() => {
    const fetchDoctorsByDate = async () => {
      if (!date || !selectedSpecialty) {
        setDoctorsWithShifts([])
        return
      }

      try {
        setIsLoadingDoctorsByDate(true)
        const formattedDate = format(date, "yyyy-MM-dd")
        const data = await ShiftService.getDoctorsByDate(
          formattedDate,
          selectedSpecialty
        )
        setDoctorsWithShifts(data)

        
        setSelectedDoctor(null)
        setSelectedShift(null)
        setSelectedDoctorShifts([])
      } catch (error: any) {
        console.error("Error fetching doctors by date:", error)
        toast.error("Không thể tải danh sách bác sĩ cho ngày này")
        setDoctorsWithShifts([])
      } finally {
        setIsLoadingDoctorsByDate(false)
      }
    }

    fetchDoctorsByDate()
  }, [date, selectedSpecialty])

  

  const handleDoctorClick = (doctorId: number) => {
    if (selectedDoctor === doctorId) {
      setSelectedDoctor(null)
      setSelectedShift(null)
      setSelectedDoctorShifts([])
    } else {
      setSelectedDoctor(doctorId)
      setSelectedShift(null)

      
      const doctorData = doctorsWithShifts.find((d) => d.doctor.id === doctorId)
      if (doctorData) {
        setSelectedDoctorShifts(doctorData.shifts)
        setStep(4) 
      }
    }
  }

  
  const handleSymptomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Limit to 5 images
      const remainingSlots = 5 - symptomImages.length
      if (remainingSlots <= 0) {
        toast.error("Bạn chỉ có thể tải lên tối đa 5 hình ảnh")
        return
      }

      const newFiles = files.filter(file => file.type.startsWith('image/')).slice(0, remainingSlots)
      
      if (newFiles.length < files.length) {
        if (files.some(f => !f.type.startsWith('image/'))) {
          toast.warning("Chỉ chấp nhận các tệp hình ảnh")
        }
        if (files.length > remainingSlots) {
          toast.warning(`Chỉ có thể thêm tối đa ${remainingSlots} hình ảnh nữa`)
        }
      }

      setSymptomImages(prev => [...prev, ...newFiles])
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setSymptomImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    
    if (isAuthenticated && user) {
      if (!user.patientId) {
        toast.error("Vui lòng thiết lập hồ sơ bệnh nhân trước khi đặt lịch")
        navigate("/patient/setup")
        return
      }
    }

    
    if (!selectedDoctor || !selectedShift || !date || !patientName || !patientPhone || !patientEmail || !patientDob) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    
    setShowConfirmDialog(true)
  }

  
  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true)
      setShowConfirmDialog(false) 
      
      const result = await createAppointment({
        doctorId: selectedDoctor!,
        shiftId: selectedShift!,
        date: format(date!, "yyyy-MM-dd"),
        symptomInitial: symptoms || undefined,
        patientName,
        patientPhone,
        patientDob,
        patientGender,
      })
      
      
      if (symptomImages.length > 0) {
        try {
          await uploadSymptomImages(result.id, symptomImages)
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError)
          toast.warning("Đặt lịch thành công nhưng không thể tải lên hình ảnh.")
        }
      }
      

      
      setCreatedAppointment(result)
      toast.success("Đặt lịch hẹn thành công!")
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      toast.error(error.response?.data?.message || "Không thể đặt lịch hẹn. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }


  
  const steps = [
    { number: 1, title: "Chuyên khoa", icon: Stethoscope },
    { number: 2, title: "Ngày khám", icon: CalendarIcon },
    { number: 3, title: "Bác sĩ", icon: User },
    { number: 4, title: "Ca khám", icon: Clock },
    { number: 5, title: "Xác nhận", icon: CheckCircle2 },
  ]

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        {}
        <div className="relative">
          {}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-emerald-500/5 to-cyan-500/5 rounded-3xl blur-3xl" />
          
          <Card className="relative border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
            {}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-primary" />
            
            <CardContent className="pt-16 pb-12 text-center">
              {}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="h-12 w-12 text-white animate-[bounce_1s_ease-in-out]" />
                  </div>
                  {}
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse" />
                  <Sparkles className="absolute -bottom-1 -left-3 h-5 w-5 text-emerald-400 animate-pulse delay-150" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Đặt lịch hẹn thành công!
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Lịch hẹn của bạn đã được xác nhận
              </p>
              
              {}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto border border-slate-200/50">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bác sĩ</p>
                      <p className="font-semibold text-foreground">
                        {doctorsWithShifts.find((d) => d.doctor.id === selectedDoctor)?.doctor.user?.fullName || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ngày khám</p>
                      <p className="font-semibold text-foreground">{date && format(date, "EEEE, dd/MM/yyyy", { locale: vi })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ca khám</p>
                      <p className="font-semibold text-foreground">
                        {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.name || "N/A"}
                        {selectedShift && selectedDoctorShifts.find(s => s.shift.id === selectedShift) && (
                          <span className="text-sm font-normal ml-2 text-muted-foreground">
                            ({selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.startTime} - {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.endTime})
                          </span>
                        )}
                      </p>
                      {createdAppointment?.slotNumber && (
                        <div className="mt-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-lg inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">
                            Giờ khám dự kiến: {
                              (() => {
                                const startTime = selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.startTime;
                                if (startTime) {
                                  const [h, m] = startTime.split(':').map(Number);
                                  const d = new Date();
                                  d.setHours(h);
                                  d.setMinutes(m + (createdAppointment.slotNumber - 1) * 10);
                                  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                }
                                return "N/A";
                              })()
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {}
                  {patientEmail && (
                    <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                        <p className="font-semibold text-foreground">{patientEmail}</p>
                      </div>
                    </div>
                  )}
                  
                  {symptoms && (
                    <div className="flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm border-t-2 border-dashed border-slate-200 mt-4 pt-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Triệu chứng</p>
                        <p className="text-sm text-foreground">{symptoms}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Xác nhận đã được gửi đến: <span className="font-medium">{patientEmail}</span>
              </p>
              
              <div className="flex gap-4 justify-center">
                <Link to="/patient/dashboard">
                  <Button variant="outline" size="lg" className="gap-2 shadow-md hover:shadow-lg transition-all">
                    <ArrowLeft className="h-4 w-4" />
                    Về trang chủ
                  </Button>
                </Link>
                <Link to="/patient/appointments">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg hover:shadow-xl transition-all">
                    Xem lịch hẹn
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-8">
      {}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-cyan-500/5 to-emerald-500/5 rounded-2xl blur-2xl" />
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const isCompleted = index < step - 1 || (index === step - 1 && (
                (index === 0 && selectedSpecialty !== null) ||
                (index === 1 && date !== undefined) ||
                (index === 2 && selectedDoctor !== null) ||
                (index === 3 && selectedShift !== null) ||
                (index === 4 && patientName !== "" && patientPhone !== "")
              ))
              const isCurrent = index + 1 === step
              const StepIcon = stepItem.icon
              
              return (
                <div key={stepItem.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                        isCompleted 
                          ? "bg-gradient-to-br from-emerald-500 to-cyan-500 text-white" 
                          : isCurrent 
                            ? "bg-gradient-to-br from-primary to-cyan-500 text-white ring-4 ring-primary/20"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 font-medium transition-colors",
                      isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {stepItem.title}
                    </span>
                  </div>
                  
                  {}
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3">
                      <div className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        isCompleted ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-200"
                      )} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {}
      <div className="grid lg:grid-cols-3 gap-6">
        {}
        <Card className={cn(
          "lg:col-span-1 border-0 shadow-xl transition-all duration-300 overflow-hidden",
          selectedSpecialty ? "bg-gradient-to-br from-white to-primary/5" : "bg-white",
          step < 1 && "opacity-60"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all",
                selectedSpecialty 
                  ? "bg-gradient-to-br from-primary to-cyan-500 text-white" 
                  : "bg-slate-100 text-slate-500"
              )}>
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Chọn Chuyên Khoa</CardTitle>
                <CardDescription>Chọn chuyên khoa bạn muốn khám</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSpecialties ? (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Đang tải chuyên khoa...</p>
              </div>
            ) : specialties.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Không có chuyên khoa nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {specialties.map((specialty, index) => {
                  const SpecialtyIcon = getSpecialtyIcon(specialty.name)
                  const isSelected = selectedSpecialty === specialty.id
                  
                  return (
                    <button
                      key={specialty.id}
                      type="button"
                      onClick={() => {
                        setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)
                        setSelectedDoctor(null)
                        setDate(undefined)
                        setSelectedShift(null)
                        setDoctorsWithShifts([])
                        if (selectedSpecialty !== specialty.id) setStep(2)
                      }}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300",
                        isSelected 
                          ? "border-primary bg-gradient-to-br from-primary/10 to-cyan-500/10 shadow-lg scale-[1.02]" 
                          : "border-slate-200 hover:border-primary/50 hover:shadow-md hover:scale-[1.01] bg-white"
                      )}
                    >
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        isSelected 
                          ? `bg-gradient-to-br ${getSpecialtyGradient(index)} text-white shadow-lg` 
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                      )}>
                        <SpecialtyIcon className="h-6 w-6" />
                      </div>
                      <span className={cn(
                        "text-xs font-medium text-center transition-colors line-clamp-2",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {specialty.name}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-md">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card className={cn(
          "lg:col-span-1 border-0 shadow-xl transition-all duration-300 overflow-hidden",
          date ? "bg-gradient-to-br from-white to-purple-500/5" : "bg-white",
          step < 2 && "opacity-60 pointer-events-none"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all",
                date 
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" 
                  : "bg-slate-100 text-slate-500"
              )}>
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Chọn Ngày Khám</CardTitle>
                <CardDescription>
                  {date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : "Chọn ngày bạn muốn đặt lịch"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedSpecialty ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Vui lòng chọn chuyên khoa trước</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate)
                    setSelectedDoctor(null)
                    setSelectedShift(null)
                    if (newDate) setStep(3)
                  }}
                  disabled={(calendarDate) =>
                    calendarDate < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    calendarDate < new Date("1900-01-01")
                  }
                  className="rounded-xl border-0 shadow-inner bg-slate-50/50 p-3"
                  classNames={{
                    day_selected: "bg-gradient-to-br from-primary to-cyan-500 text-white hover:from-primary hover:to-cyan-500",
                    day_today: "bg-amber-100 text-amber-900 font-bold",
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card className={cn(
          "lg:col-span-1 border-0 shadow-xl transition-all duration-300 overflow-hidden",
          selectedDoctor ? "bg-gradient-to-br from-white to-emerald-500/5" : "bg-white",
          step < 3 && "opacity-60 pointer-events-none"
        )}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all",
                selectedDoctor 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white" 
                  : "bg-slate-100 text-slate-500"
              )}>
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Chọn Bác Sĩ</CardTitle>
                <CardDescription>
                  {date ? `Bác sĩ làm việc ngày ${format(date, "dd/MM")}` : "Chọn ngày để xem bác sĩ"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            {!date ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Vui lòng chọn ngày khám trước</p>
              </div>
            ) : isLoadingDoctorsByDate ? (
              <div className="text-center py-8">
                <div className="relative inline-block">
                  <div className="h-10 w-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Đang tìm bác sĩ...</p>
              </div>
            ) : doctorsWithShifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Không có bác sĩ nào làm việc</p>
                <p className="text-xs mt-1">Vui lòng chọn ngày khác</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctorsWithShifts.map(({ doctor, shiftCount }) => {
                  const isSelected = selectedDoctor === doctor.id
                  
                  return (
                    <div key={doctor.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleDoctorClick(doctor.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 text-left",
                          isSelected 
                            ? "border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 shadow-lg" 
                            : "border-slate-200 hover:border-emerald-500/50 hover:shadow-md bg-white"
                        )}
                      >
                        <div className={cn(
                          "h-14 w-14 rounded-full flex items-center justify-center shadow-md transition-all",
                          isSelected 
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500" 
                            : "bg-gradient-to-br from-blue-100 to-cyan-100"
                        )}>
                          <User className={cn(
                            "h-7 w-7",
                            isSelected ? "text-white" : "text-blue-600"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {doctor.user?.fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty?.name}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-emerald-500" />
                            <span className="text-xs text-emerald-600 font-medium">
                              {shiftCount} ca làm việc
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                        )}
                      </button>
                      
                      {}
                      {isSelected && selectedDoctorShifts.length > 0 && (
                        <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                            Chọn ca khám
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {selectedDoctorShifts.map((shiftData) => {
                              const isShiftSelected = selectedShift === shiftData.shift.id
                              const isFull = shiftData.isFull || (shiftData.currentBookings || 0) >= (shiftData.maxSlots || 10)
                              
                              return (
                                <button
                                  key={shiftData.doctorShiftId}
                                  type="button"
                                  disabled={isFull}
                                  onClick={() => {
                                    if (!isFull) {
                                      setSelectedShift(shiftData.shift.id)
                                      setStep(5)
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 w-full",
                                    isShiftSelected
                                      ? "border-primary bg-gradient-to-r from-primary to-cyan-500 text-white shadow-lg"
                                      : isFull
                                        ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                        : "border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm"
                                  )}
                                >
                                  <Clock className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    isShiftSelected ? "text-white" : "text-primary"
                                  )} />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">{shiftData.shift.name}</div>
                                    <div className={cn(
                                      "text-xs mb-1.5",
                                      isShiftSelected ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                      {shiftData.shift.startTime} - {shiftData.shift.endTime}
                                    </div>
                                    
                                    {}
                                    <div className="flex items-center gap-2">
                                      <div className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1",
                                        isShiftSelected 
                                            ? "bg-white/20 text-white" 
                                            : isFull
                                                ? "bg-red-100 text-red-600"
                                                : "bg-slate-100 text-slate-600"
                                      )}>
                                        <Users className="h-3 w-3" />
                                        {shiftData.currentBookings || 0}/{shiftData.maxSlots || 10}
                                      </div>
                                      {isFull && (
                                        <span className="text-[10px] font-bold text-red-500 uppercase bg-red-50 px-1 rounded border border-red-100">
                                          Hết chỗ
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {isShiftSelected && (
                                    <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <Card className={cn(
        "border-0 shadow-xl transition-all duration-300 overflow-hidden",
        step >= 5 ? "bg-gradient-to-br from-white to-amber-500/5" : "bg-white",
        step < 5 && "opacity-60 pointer-events-none"
      )}>
        {}
        {step >= 5 && (
          <div className="h-1 bg-gradient-to-r from-primary via-cyan-500 to-emerald-500" />
        )}
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-md transition-all",
              step >= 5 && (patientName && patientPhone)
                ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
                : "bg-slate-100 text-slate-500"
            )}>
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Thông Tin Bệnh Nhân</CardTitle>
              <CardDescription>Điền thông tin liên hệ của bạn</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
             <Switch 
               id="relative-mode" 
               checked={isBookingForRelative}
               onCheckedChange={setIsBookingForRelative}
             />
             <div className="flex flex-col">
               <Label htmlFor="relative-mode" className="text-base font-medium cursor-pointer">Đặt cho người thân</Label>
               <span className="text-xs text-muted-foreground">Chọn tùy chọn này nếu bạn đặt lịch hộ người khác</span>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Họ và Tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nhập họ và tên đầy đủ"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={!selectedShift}
                required
                className="h-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Số Điện Thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                disabled={!selectedShift}
                required
                className="h-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            
             {}
             <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Giới Tính <span className="text-destructive">*</span>
              </Label>
              <select
                id="gender"
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                disabled={!selectedShift}
                required
                className="flex h-12 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            {}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Địa Chỉ Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                disabled={!selectedShift}
                required
                className="h-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            
            {}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Ngày Sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={patientDob}
                onChange={(e) => setPatientDob(e.target.value)}
                disabled={!selectedShift}
                required
                max={new Date().toISOString().split("T")[0]}
                className="h-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20"
              />
            </div>
            
            {}
            <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
              {}
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Mô Tả Triệu Chứng <span className="text-xs text-muted-foreground">(Không bắt buộc)</span>
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Mô tả ngắn gọn triệu chứng hoặc lý do khám bệnh..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={!selectedShift}
                  className="min-h-[200px] bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20 resize-none"
                />
              </div>

              {}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Hình Ảnh Triệu Chứng <span className="text-xs text-muted-foreground">(Không bắt buộc)</span>
                </Label>
                
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      id="symptom-images"
                      accept="image/*"
                      className="hidden"
                      multiple
                      onChange={handleSymptomImageChange}
                      disabled={!selectedShift}
                    />
                    <label
                      htmlFor="symptom-images"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all cursor-pointer group",
                        !selectedShift 
                          ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60" 
                          : "bg-slate-50/50 border-slate-300 hover:bg-slate-100/50 hover:border-primary/50"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={cn(
                          "h-8 w-8 mb-2 transition-colors",
                          !selectedShift ? "text-slate-300" : "text-slate-400 group-hover:text-primary"
                        )} />
                        <p className="text-sm text-slate-500 font-medium">Click để tải ảnh lên</p>
                        <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG (Tối đa 5 ảnh)</p>
                      </div>
                    </label>
                  </div>

                  {symptomImagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {symptomImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                          <div 
                            className="absolute inset-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in"
                            onClick={() => setZoomedImage(preview)}
                          >
                            <img
                              src={preview}
                              alt={`Triệu chứng ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSymptomImages(prev => prev.filter((_, i) => i !== index))
                              setSymptomImagePreviews(prev => prev.filter((_, i) => i !== index))
                            }}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-8 flex flex-wrap gap-4 items-center justify-between border-t border-slate-100 pt-6">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                setSelectedSpecialty(null)
                setSelectedDoctor(null)
                setDate(undefined)
                setSelectedShift(null)
                setDoctorsWithShifts([])
                setSelectedDoctorShifts([])
                setPatientName("")
                setPatientPhone("")
                setPatientEmail("")
                setSymptoms("")
                setSymptomImages([])
                setSymptomImagePreviews([])
                setStep(1)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Đặt lại
            </Button>
            
            <Button
              type="submit"
              size="lg"
              className="px-8 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
              disabled={!selectedDoctor || !date || !selectedShift || !patientName || !patientPhone || !patientEmail || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CalendarCheck className="h-5 w-5" />
                  Xác Nhận Đặt Lịch
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {}
      {(selectedSpecialty || date || selectedDoctor) && (
        <div className="fixed top-24 right-6 z-40 hidden 2xl:block">
          <div 
            className={cn(
              "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 animate-in slide-in-from-right-4 duration-300 transition-all",
              isSummaryCollapsed ? "w-12 p-2" : "w-64 p-4"
            )}
          >
            {}
            <button
              type="button"
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              className={cn(
                "flex items-center gap-2 transition-all",
                isSummaryCollapsed 
                  ? "justify-center w-full" 
                  : "w-full font-semibold text-sm text-foreground mb-3"
              )}
            >
              {isSummaryCollapsed ? (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/10 flex items-center justify-center hover:from-primary/20 hover:to-cyan-500/20 transition-colors">
                  <Maximize2 className="h-4 w-4 text-primary" />
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="flex-1 text-left">Tóm tắt đặt lịch</span>
                  <Minimize2 className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </>
              )}
            </button>
            
            {}
            {!isSummaryCollapsed && (
              <div className="space-y-2 text-sm animate-in fade-in duration-200">
                {selectedSpecialty && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{specialties.find(s => s.id === selectedSpecialty)?.name}</span>
                  </div>
                )}
                {date && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4 text-purple-500 shrink-0" />
                    <span>{format(date, "dd/MM/yyyy")}</span>
                  </div>
                )}
                {selectedDoctor && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{doctorsWithShifts.find(d => d.doctor.id === selectedDoctor)?.doctor.user?.fullName}</span>
                  </div>
                )}
                {selectedShift && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>{selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </form>

      {}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-primary font-bold flex items-center gap-2">
              <CalendarCheck className="h-6 w-6" />
              Xác Nhận Đặt Lịch
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Vui lòng kiểm tra lại thông tin trước khi xác nhận đặt lịch hẹn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 my-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chuyên khoa:</span>
              <span className="font-semibold text-foreground text-right">
                {specialties.find(s => s.id === selectedSpecialty)?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bác sĩ:</span>
              <span className="font-semibold text-foreground text-right">
                {doctorsWithShifts.find(d => d.doctor.id === selectedDoctor)?.doctor.user?.fullName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thời gian:</span>
              <div className="text-right">
                <span className="font-semibold text-foreground block">
                  {date && format(date, "dd/MM/yyyy", { locale: vi })}
                </span>
                <span className="text-muted-foreground text-xs">
                  {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.name} ({selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.startTime} - {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.endTime})
                </span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm">
               <span className="text-muted-foreground">Bệnh nhân:</span>
               <div className="text-right">
                <span className="font-semibold text-foreground block">{patientName}</span>
                <span className="text-muted-foreground text-xs block">{patientPhone}</span>
                <span className="text-muted-foreground text-xs block mt-1">
                  {patientDob && format(new Date(patientDob), "dd/MM/yyyy")}
                </span>
                <span className="text-muted-foreground text-xs block mt-1">
                  Giới tính: {patientGender === "MALE" ? "Nam" : patientGender === "FEMALE" ? "Nữ" : "Khác"}
                </span>
               </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault() 
                handleConfirmBooking()
              }}
              className="bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận đặt lịch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-[70] p-2 rounded-full hover:bg-white/10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            <img
              src={zoomedImage}
              alt="Zoomed preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  )
}