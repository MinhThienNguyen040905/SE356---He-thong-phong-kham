import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  ArrowLeft,
  Save,
  X,
  Loader2,
  Calendar,
  Briefcase,
  GraduationCap,
  FileText,
  Phone,
  User,
  MapPin,
  IdCard,
  Camera,
  Award,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"
import { EmployeeService, type Employee, type UpdateEmployeeData } from "../../features/doctor/services/employee.service"
import { format } from "date-fns"
import { TimeAgo } from "../../components/ui/time-ago"
import api from '../../lib/api'


export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [specialties, setSpecialties] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState<UpdateEmployeeData>({
    position: "",
    degree: "",
    specialtyId: null,
    description: "",
    joiningDate: "",
    phone: "",
    gender: "MALE",
    dateOfBirth: "",
    address: "",
    cccd: "",
    expertise: "",
    isActive: true,
  })

  const fetchEmployee = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await EmployeeService.getEmployeeById(parseInt(id))
      setEmployee(data)
      setFormData({
        position: data.position || "",
        degree: data.degree || "",
        specialtyId: data.specialtyId || null,
        description: data.description || "",
        joiningDate: data.joiningDate || "",
        phone: data.phone || "",
        gender: data.gender || "MALE",
        dateOfBirth: data.dateOfBirth || "",
        address: data.address || "",
        cccd: data.cccd || "",
        expertise: data.expertise || "",
        isActive: data.isActive,
      })
    } catch (error: any) {
      toast.error("Không thể tải thông tin nhân viên")
      navigate("/admin/employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployee()
  }, [id])

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await api.get('/specialties')
        setSpecialties(response.data.data)
      } catch (error) {
        console.error("Failed to fetch specialties")
      }
    }
    fetchSpecialties()
  }, [])

  const handleSave = async () => {
    if (!id) return
    try {
      setIsSaving(true)
      const updated = await EmployeeService.updateEmployee(parseInt(id), formData)
      setEmployee(updated)
      setIsEditing(false)
      toast.success("Cập nhật thông tin nhân viên thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB")
      return
    }

    try {
      setIsUploadingAvatar(true)
      const result = await EmployeeService.uploadAvatar(parseInt(id), file)
      setEmployee(prev => prev ? { ...prev, avatar: result.avatar } : null)
      toast.success("Cập nhật ảnh đại diện thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể upload ảnh")
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminSidebar>
    )
  }

  if (!employee) return null

  const roleName = typeof employee.user.role === 'string' 
    ? employee.user.role 
    : (employee.user.role as any)?.name

  const isDoctor = 
    roleName?.toLowerCase() === 'doctor' || 
    employee.employeeCode.startsWith('BS') ||
    employee.position?.toLowerCase().includes('bác sĩ')

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/admin/employees")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to list
          </Button>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="relative group mx-auto w-32 h-32 mb-4">
                {employee.avatar ? (
                  <img 
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${employee.avatar}`} 
                    alt={employee.user.fullName}
                    className="w-full h-full rounded-full object-cover border-4 border-blue-50 shadow-sm"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-bold border-4 border-blue-50">
                    {employee.user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Camera className="h-8 w-8 text-white" />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                )}
              </div>
              
              <h2 className="text-xl font-bold">{employee.user.fullName}</h2>
              <p className="text-gray-500 text-sm mb-4">{employee.user.email}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  {roleName?.toUpperCase() || "STAFF"}
                </Badge>
                {!isEditing ? (
                  <Badge variant={employee.isActive ? "default" : "destructive"}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </Badge>
                ) : (
                  <Select 
                    value={formData.isActive ? "true" : "false"} 
                    onValueChange={(val) => setFormData({ ...formData, isActive: val === "true" })}
                  >
                    <SelectTrigger className="h-6 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active Account</SelectItem>
                      <SelectItem value="false">Inactive Account</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin chuyên môn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    Chức vụ
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.position} 
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.position || "Chưa thiết lập"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    Học hàm / Học vị
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.degree} 
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.degree || "Chưa thiết lập"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Ngày gia nhập
                  </Label>
                  {isEditing ? (
                    <Input 
                      type="date"
                      value={formData.joiningDate} 
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  ) : (
                    <div className="flex flex-col">
                      <p className="text-gray-900 font-medium">
                        {employee.joiningDate ? format(new Date(employee.joiningDate), "dd/MM/yyyy") : "Chưa thiết lập"}
                      </p>
                      {employee.joiningDate && (
                        <TimeAgo date={employee.joiningDate} className="text-xs text-blue-600" />
                      )}
                    </div>
                  )}
                </div>

                {isDoctor && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      Chuyên khoa
                    </Label>
                    {isEditing ? (
                      <Select 
                        value={formData.specialtyId?.toString()} 
                        onValueChange={(val) => setFormData({ ...formData, specialtyId: parseInt(val) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chuyên khoa" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((s: any) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-900 font-medium">{employee.specialty?.name || "Chưa thiết lập"}</p>
                    )}
                  </div>
                )}

                {isDoctor && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      Thông tin chuyên gia
                    </Label>
                    {isEditing ? (
                      <Textarea 
                        placeholder="Nhập các chuyên môn sâu, ví dụ: Phẫu thuật tim mạch, Nội thần kinh..."
                        value={formData.expertise} 
                        onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium whitespace-pre-wrap">{employee.expertise || "Chưa cập nhật nội dung chuyên môn sâu"}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-transparent">.</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-mono">MÃ NHÂN VIÊN:</span>
                    <span className="font-bold text-blue-600">{employee.employeeCode}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Giới thiệu / Bio
                </Label>
                {isEditing ? (
                  <Textarea 
                    rows={4}
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{employee.description || "Chưa có thông tin giới thiệu."}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Personal & Identification Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.phone || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    Gender
                  </Label>
                  {isEditing ? (
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.gender || "Not set"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input 
                      type="date"
                      value={formData.dateOfBirth} 
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {employee.dateOfBirth ? format(new Date(employee.dateOfBirth), "dd/MM/yyyy") : "Not set"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-gray-400" />
                    CCCD / ID Card
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.cccd} 
                      onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.cccd || "Not set"}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Address
                  </Label>
                  {isEditing ? (
                    <Input 
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{employee.address || "Not set"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminSidebar>
  )
}
