import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Camera,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import { UserService, type User, type UpdateUserData } from "../../features/auth/services/user.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { TimeAgo } from "../../components/ui/time-ago"

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState<UpdateUserData>({
    fullName: "",
    email: "",
    phone: "",
    role: "patient",
  })

  useEffect(() => {
    if (id) {
      fetchUser()
    }
  }, [id])

  const fetchUser = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const userData = await UserService.getUserById(parseInt(id))
      setUser(userData)
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || "",
      })
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tải thông tin người dùng")
      }
      navigate("/admin/users")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    
    try {
      setIsSaving(true)
      const updatedUser = await UserService.updateUser(parseInt(id), formData)
      setUser(updatedUser)
      setIsEditing(false)
      toast.success("Cập nhật thông tin người dùng thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật thông tin")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "",
      })
    }
    setIsEditing(false)
  }

  const handleActivate = async () => {
    if (!user) return
    
    try {
      await UserService.activateUser(user.id)
      toast.success("Kích hoạt người dùng thành công!")
      fetchUser()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể kích hoạt người dùng")
      }
    }
  }

  const handleDeactivate = async () => {
    if (!user) return
    
    try {
      await UserService.deactivateUser(user.id)
      toast.success("Vô hiệu hóa người dùng thành công!")
      fetchUser()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể vô hiệu hóa người dùng")
      }
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
      const result = await UserService.uploadUserAvatar(parseInt(id), file)
      setUser((prev: User | null) => (prev ? { ...prev, avatar: result.avatar } : null))
      toast.success("Upload avatar thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể upload avatar")
      }
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ""
    }
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      admin: { label: "Admin", className: "bg-red-100 text-red-800 border-red-200" },
      doctor: { label: "Bác sĩ", className: "bg-blue-100 text-blue-800 border-blue-200" },
      receptionist: { label: "Lễ tân", className: "bg-green-100 text-green-800 border-green-200" },
      patient: { label: "Bệnh nhân", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    const roleName = (typeof role === 'string' ? role : (role as any)?.name || "patient").toLowerCase()
    const roleConfig = config[roleName] || config.patient
    
    return (
      <Badge variant="outline" className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  if (!user) {
    return (
      <AdminSidebar>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Không tìm thấy người dùng</p>
            <Button onClick={() => navigate("/admin/users")}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/users")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                      {user.avatar ? (
                          <img 
                            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${user.avatar}`} 
                            alt={user.fullName}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                      ) : (
                        user.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                      title="Upload avatar"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 text-white" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.fullName}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      ID: {user.id}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Vai trò</Label>
                    <div className="flex items-center h-10">
                      {getRoleBadge(user.role || "patient")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">Trạng thái tài khoản</span>
                  </div>
                  {getRoleBadge(user.isActive ? "active" : "inactive")}
                </div>
                <div className="flex gap-2">
                  {user.isActive ? (
                    <Button variant="outline" onClick={handleDeactivate}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Vô hiệu hóa
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleActivate}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Kích hoạt
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Ngày tạo:</span>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </span>
                    <TimeAgo date={user.createdAt} className="text-xs text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Cập nhật lần cuối:</span>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {format(new Date(user.updatedAt), "dd/MM/yyyy", { locale: vi })}
                    </span>
                    <TimeAgo date={user.updatedAt} className="text-xs text-gray-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            {user.employee && (
              <Card>
                <CardHeader>
                  <CardTitle>Liên kết</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={`/admin/employees/${user.employee.id}`}>
                    <Button variant="outline" className="w-full">
                      Xem hồ sơ nhân viên
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {user.patient && (
              <Card>
                <CardHeader>
                  <CardTitle>Liên kết</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to={`/recep/patients/${user.patient.id}`}>
                    <Button variant="outline" className="w-full">
                      Xem hồ sơ bệnh nhân
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
