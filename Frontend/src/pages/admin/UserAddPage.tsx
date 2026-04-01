import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  ArrowLeft,
  Save,
  X,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  Shield
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"
import { UserService, type CreateUserData } from "../../features/auth/services/user.service"

export default function UserAddPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSaving, setIsSaving] = useState(false)
  
  
  const queryParams = new URLSearchParams(location.search)
  const initialRole = queryParams.get('role') as any || "patient"

  const [formData, setFormData] = useState<CreateUserData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: initialRole,
  })

  
  useEffect(() => {
    const role = queryParams.get('role') as any
    if (role && ['admin', 'doctor', 'receptionist', 'patient'].includes(role)) {
       setFormData(prev => ({ ...prev, role: role }))
    }
  }, [location.search])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự")
      return
    }

    try {
      setIsSaving(true)
      await UserService.createUser(formData)
      toast.success("Thêm người dùng mới thành công!")
      navigate("/admin/users")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || error.message || "Không thể thêm người dùng")
      }
    } finally {
      setIsSaving(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Thêm người dùng mới</h1>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-400" />
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      Số điện thoại
                    </Label>
                    <Input
                      id="phone"
                      placeholder="0123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      Vai trò <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
                        <SelectItem value="doctor">Bác sĩ</SelectItem>
                        <SelectItem value="receptionist">Lễ tân</SelectItem>
                        <SelectItem value="patient">Bệnh nhân</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t font-vietnam-pro">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/admin/users")}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu người dùng
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AdminSidebar>
  )
}
