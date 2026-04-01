"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Loader2, User, Phone, Mail, Award, MapPin, Briefcase, Calendar, ArrowLeft, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import api from "../../lib/api"

interface DoctorFormData {
  fullName: string
  email: string
  password: string
  specialtyId: string
  position: string
  degree: string
  description: string
}

interface Specialty {
  id: number
  name: string
  description?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function DoctorAddPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [specialties, setSpecialties] = useState<Specialty[]>([
    
    { id: 1, name: "Nội khoa", description: "Chuyên khoa nội tổng quát" },
    { id: 2, name: "Ngoại khoa", description: "Chuyên khoa ngoại tổng quát" },
    { id: 3, name: "Sản phụ khoa", description: "Chuyên khoa sản phụ" },
    { id: 4, name: "Nhi khoa", description: "Chuyên khoa nhi" },
    { id: 5, name: "Tim mạch", description: "Chuyên khoa tim mạch" },
    { id: 6, name: "Da liễu", description: "Chuyên khoa da liễu" }
  ])
  const [loadingSpecialties, setLoadingSpecialties] = useState(false) 

  const [formData, setFormData] = useState<DoctorFormData>({
    fullName: "",
    email: "",
    password: "",
    specialtyId: "",
    position: "",
    degree: "",
    description: "",
  })

  
  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true)
      
      const response = await api.get('/doctors/specialties')
      
      if (response.data.success && response.data.data.length > 0) {
        setSpecialties(response.data.data)
      }
      
    } catch (err: any) {
      console.log('Using fallback specialties data:', err.message)
      
    } finally {
      setLoadingSpecialties(false)
    }
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSpecialtyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      specialtyId: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ và tên")
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email")
      setLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email không hợp lệ")
      setLoading(false)
      return
    }

    if (!formData.password.trim()) {
      setError("Vui lòng nhập mật khẩu")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      setLoading(false)
      return
    }

    if (!formData.specialtyId) {
      setError("Vui lòng chọn chuyên khoa")
      setLoading(false)
      return
    }

    if (!formData.position.trim()) {
      setError("Vui lòng nhập vị trí")
      setLoading(false)
      return
    }

    if (!formData.degree.trim()) {
      setError("Vui lòng nhập bằng cấp")
      setLoading(false)
      return
    }

    try {
      
      const userResponse = await api.post('/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        roleId: 4 
      })

      if (!userResponse.data.success) {
        throw new Error(userResponse.data.message || 'Không thể tạo tài khoản người dùng')
      }

      
      const userId = userResponse.data.user?.id

      console.log('User creation response:', {
        success: userResponse.data.success,
        user: userResponse.data.user,
        userId: userId
      })

      if (!userId) {
        console.error('Full user response:', userResponse.data)
        throw new Error(`Không thể lấy ID người dùng. Response: ${JSON.stringify(userResponse.data)}`)
      }

      
      const doctorResponse = await api.post('/doctors', {
        userId: userId,
        specialtyId: parseInt(formData.specialtyId),
        position: formData.position,
        degree: formData.degree,
        description: formData.description
      })

      if (doctorResponse.data.success) {
        toast.success("Thêm bác sĩ thành công!")
        navigate("/admin/doctors")
      } else {
        throw new Error(doctorResponse.data.message || 'Tạo bác sĩ thất bại')
      }
      
    } catch (err: any) {
      console.error("Error creating doctor:", err)
      console.error("Error response:", err.response?.data)
      
      let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại"
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      
      if (errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
        errorMessage = 'Email này đã được sử dụng. Vui lòng chọn email khác.'
      } else if (errorMessage.includes('EMAIL_AND_PASSWORD_REQUIRED')) {
        errorMessage = 'Email và mật khẩu là bắt buộc.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          {}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4 -ml-30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/doctors")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Thêm Bác Sĩ Mới</h1>
            <p className="text-gray-600 mt-2">Điền thông tin chi tiết của bác sĩ</p>
          </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-2xl">Thông Tin Bác Sĩ</CardTitle>
            <CardDescription>Tất cả các trường đều bắt buộc phải điền</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              {}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Họ và Tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="bacsi@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Mật khẩu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="specialtyId" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Chuyên khoa <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.specialtyId} onValueChange={handleSpecialtyChange} disabled={loadingSpecialties}>
                  <SelectTrigger id="specialtyId">
                    <SelectValue placeholder={loadingSpecialties ? "Đang tải..." : "Chọn chuyên khoa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Vị trí <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="Bác sĩ chính, Trưởng khoa..."
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Bằng cấp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="degree"
                    name="degree"
                    type="text"
                    placeholder="Tiến sĩ, Thạc sĩ, Bác sĩ..."
                    value={formData.degree}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Mô tả ngắn về bác sĩ, kinh nghiệm, thành tích..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading || loadingSpecialties}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? "Đang thêm..." : "Thêm Bác Sĩ"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </AdminSidebar>
  )
}