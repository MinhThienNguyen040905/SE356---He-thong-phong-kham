"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../components/layout/header"
import { Footer } from "../../components/layout/footer"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, User, Phone, Mail, MapPin, Loader2, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../../features/auth/context/authContext"
import { setupPatientProfile } from "../../features/patient/services/patient.service"
import { toast } from "sonner"

export default function SetupPatientProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  
  const [fullName, setFullName] = useState("")
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER" | "">("")
  const [dateOfBirth, setDateOfBirth] = useState<Date>()
  const [cccd, setCccd] = useState("")
  
  
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [ward, setWard] = useState("")

  
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tiếp tục")
      navigate("/login")
      return
    }

    if (user?.patientId) {
      
      toast.info("Bạn đã có hồ sơ bệnh nhân")
      navigate("/patient/dashboard")
      return
    }
  }, [user, isAuthenticated, navigate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự"
    }

    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính"
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh"
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0) 
      const dob = new Date(dateOfBirth)
      dob.setHours(0, 0, 0, 0)
      
      
      if (dob > today) {
        newErrors.dateOfBirth = "Ngày sinh không được là ngày trong tương lai"
      } else {
        
        const age = today.getFullYear() - dob.getFullYear()
        if (age > 150) {
          newErrors.dateOfBirth = "Ngày sinh không hợp lệ (tuổi không được vượt quá 150)"
        } else if (age < 0) {
          newErrors.dateOfBirth = "Ngày sinh không hợp lệ"
        }
      }
    }

    if (!cccd.trim() || cccd.trim().length !== 12) {
      newErrors.cccd = "CCCD/CMND phải có đúng 12 số"
    } else if (!/^\d{12}$/.test(cccd.trim())) {
      newErrors.cccd = "CCCD/CMND chỉ được chứa số"
    }

    
    if (!phone.trim() && !email.trim() && !address.trim()) {
      newErrors.contact = "Vui lòng cung cấp ít nhất một phương thức liên hệ (số điện thoại, email hoặc địa chỉ)"
    }

    if (phone.trim() && !/^[0-9]{10,11}$/.test(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 số)"
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    try {
      setIsSubmitting(true)

      
      const profiles: Array<{
        type: "phone" | "email" | "address"
        value: string
        city?: string
        ward?: string
      }> = []

      if (phone.trim()) {
        profiles.push({ type: "phone", value: phone.trim() })
      }

      if (email.trim()) {
        profiles.push({ type: "email", value: email.trim() })
      }

      if (address.trim()) {
        profiles.push({
          type: "address",
          value: address.trim(),
          city: city.trim() || undefined,
          ward: ward.trim() || undefined,
        })
      }

      
      if (profiles.length === 0) {
        toast.error("Vui lòng cung cấp ít nhất một phương thức liên hệ (số điện thoại, email hoặc địa chỉ)")
        setIsSubmitting(false)
        return
      }
      
      if (dateOfBirth) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dob = new Date(dateOfBirth)
        dob.setHours(0, 0, 0, 0)
        
        if (dob > today) {
          toast.error("Ngày sinh không được là ngày trong tương lai")
          setIsSubmitting(false)
          return
        }
      }

      const patient = await setupPatientProfile({
        fullName: fullName.trim(),
        gender: gender as "MALE" | "FEMALE" | "OTHER",
        dateOfBirth: format(dateOfBirth!, "yyyy-MM-dd"),
        cccd: cccd.trim(),
        profiles,
      })
      
      try {
        const updatedUser = await refreshUser()
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        
        if (updatedUser?.patientId) {
          console.log(" Patient profile setup successful, patientId:", updatedUser.patientId)
          toast.success("Tạo hồ sơ bệnh nhân thành công!")
          
          window.location.href = "/patient/dashboard"
        } else {
          
          console.warn("️ PatientId not updated in user context, forcing reload")
          toast.success("Tạo hồ sơ bệnh nhân thành công! Đang tải lại trang...")
          setTimeout(() => {
            window.location.href = "/patient/dashboard"
          }, 500)
        }
      } catch (refreshError: any) {
        console.error("Error refreshing user:", refreshError)
        
        
        toast.success("Tạo hồ sơ bệnh nhân thành công! Vui lòng refresh trang nếu cần.")
        setTimeout(() => {
          navigate("/patient/dashboard")
        }, 1000)
      }
    } catch (error: any) {
      console.error("Error setting up patient profile:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      
      
      const errorData = error.response?.data
      let errorMessage = "Không thể tạo hồ sơ bệnh nhân. Vui lòng thử lại."
      
      if (errorData?.message) {
        errorMessage = errorData.message
        
        const errorMap: Record<string, string> = {
          "FULLNAME_INVALID": "Họ tên không hợp lệ (2-100 ký tự)",
          "GENDER_INVALID": "Giới tính không hợp lệ",
          "DOB_INVALID": "Ngày sinh không hợp lệ",
          "DOB_INVALID_RANGE": "Ngày sinh không hợp lệ (tuổi phải từ 0-150)",
          "DOB_CANNOT_BE_FUTURE": "Ngày sinh không được là ngày trong tương lai",
          "CCCD_INVALID": "CCCD phải có đúng 12 số",
          "PROFILES_REQUIRED": "Vui lòng cung cấp ít nhất một phương thức liên hệ",
          "PROFILE_TYPE_INVALID": "Loại thông tin liên hệ không hợp lệ",
          "PROFILE_VALUE_REQUIRED": "Giá trị thông tin liên hệ không được để trống",
          "CCCD_ALREADY_EXISTS": "CCCD này đã được đăng ký",
          "PATIENT_ALREADY_SETUP": "Hồ sơ bệnh nhân đã được thiết lập",
          "Date of birth cannot be in the future": "Ngày sinh không được là ngày trong tương lai",
          "Invalid date of birth format": "Định dạng ngày sinh không hợp lệ",
        }
        
        if (errorMap[errorData.message]) {
          errorMessage = errorMap[errorData.message]
        }
      }
      
      toast.error(errorMessage)
      setIsSubmitting(false)
    }
  }

  
  if (!isAuthenticated || user?.patientId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thiết lập hồ sơ bệnh nhân</h1>
            <p className="text-gray-600">Vui lòng điền thông tin để hoàn tất hồ sơ của bạn</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Thông tin cá nhân</CardTitle>
              <CardDescription>Điền đầy đủ thông tin để tạo hồ sơ bệnh nhân</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {}
                {errors.contact && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.contact}
                  </div>
                )}

                {}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và Tên <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value)
                        if (errors.fullName) setErrors({ ...errors, fullName: "" })
                      }}
                      className={cn("pl-10", errors.fullName && "border-red-500")}
                      required
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Giới tính <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={gender}
                      onValueChange={(value) => {
                        setGender(value as "MALE" | "FEMALE" | "OTHER")
                        if (errors.gender) setErrors({ ...errors, gender: "" })
                      }}
                    >
                      <SelectTrigger className={cn(errors.gender && "border-red-500")}>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Ngày sinh <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateOfBirth && "text-muted-foreground",
                            errors.dateOfBirth && "border-red-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : "Chọn ngày sinh"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          onSelect={(date) => {
                            if (date) {
                              
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              const selectedDate = new Date(date)
                              selectedDate.setHours(0, 0, 0, 0)
                              
                              if (selectedDate > today) {
                                setErrors({ ...errors, dateOfBirth: "Ngày sinh không được là ngày trong tương lai" })
                              } else {
                                setDateOfBirth(date)
                                if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: "" })
                              }
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            
                            today.setHours(0, 0, 0, 0)
                            const dateToCheck = new Date(date)
                            dateToCheck.setHours(0, 0, 0, 0)
                            
                            const minDate = new Date("1900-01-01")
                            minDate.setHours(0, 0, 0, 0)
                            
                            
                            
                            return dateToCheck > today || dateToCheck < minDate
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dateOfBirth && (
                      <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <Label htmlFor="cccd">
                    CCCD/CMND <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cccd"
                    placeholder="123456789012"
                    value={cccd}
                    onChange={(e) => {
                      setCccd(e.target.value.replace(/\D/g, ""))
                      if (errors.cccd) setErrors({ ...errors, cccd: "" })
                    }}
                    className={cn(errors.cccd && "border-red-500")}
                    maxLength={12}
                    required
                  />
                  {errors.cccd && (
                    <p className="text-sm text-red-500">{errors.cccd}</p>
                  )}
                </div>

                {}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng cung cấp ít nhất một phương thức liên hệ
                  </p>

                  {}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0912345678"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value.replace(/\D/g, ""))
                          if (errors.phone) setErrors({ ...errors, phone: "" })
                        }}
                        className={cn("pl-10", errors.phone && "border-red-500")}
                        maxLength={11}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  {}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nguyenvana@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (errors.email) setErrors({ ...errors, email: "" })
                        }}
                        className={cn("pl-10", errors.email && "border-red-500")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {}
                  <div className="space-y-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        placeholder="Số nhà, tên đường"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value)
                          if (errors.address) setErrors({ ...errors, address: "" })
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Thành phố/Tỉnh</Label>
                      <Input
                        id="city"
                        placeholder="Hà Nội"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">Phường/Xã</Label>
                      <Input
                        id="ward"
                        placeholder="Phường 1"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/patient/dashboard")}
                    disabled={isSubmitting}
                  >
                    Bỏ qua
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Tạo hồ sơ"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
