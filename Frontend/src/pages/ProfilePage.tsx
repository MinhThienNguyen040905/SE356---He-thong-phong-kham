"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/context/authContext"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { User, Mail, Lock, Camera, Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import api from "../lib/api"
import { useNavigate } from "react-router-dom"

import AdminSidebar from "../components/layout/sidebar/admin"
import DoctorSidebar from "../components/layout/sidebar/doctor"
import ReceptionistSidebar from "../components/layout/sidebar/recep"
import PatientSidebar from "../components/layout/sidebar/patient"

const profileSchema = yup.object({
  fullName: yup.string().required("Họ tên bắt buộc nhập"),
  phone: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .nullable()
    .optional(),
  address: yup.string().nullable().optional(),
})

const changePasswordSchema = yup.object({
  currentPassword: yup.string().required("Mật khẩu hiện tại bắt buộc nhập"),
  newPassword: yup
    .string()
    .required("Mật khẩu mới bắt buộc nhập")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Mật khẩu phải chứa chữ hoa, chữ thường và số"
    ),
  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu bắt buộc nhập")
    .oneOf([yup.ref("newPassword")], "Mật khẩu xác nhận không khớp"),
})

type ProfileFormValues = {
  fullName: string
  phone?: string | null | undefined
  address?: string | null | undefined
}
type ChangePasswordFormValues = yup.InferType<typeof changePasswordSchema>

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPassword, setIsLoadingPassword] = useState(false)
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: yupResolver(profileSchema) as any,
    defaultValues: {
      fullName: "",
      phone: undefined,
      address: undefined,
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormValues>({
    resolver: yupResolver(changePasswordSchema),
  })

  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile")
        if (response.data.success) {
          const profileData = response.data.data || response.data.user
          setProfile(profileData)
          resetProfile({
            fullName: profileData.fullName || "",
            phone: profileData.phone || "",
            address: profileData.address || "",
          })
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin profile"
        )
      }
    }

    fetchProfile()
  }, [isAuthenticated, navigate, resetProfile])

  const onSubmitProfile = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      const response = await api.put("/profile", data)
      if (response.data.success) {
        toast.success("Cập nhật profile thành công!")
        setProfile({ ...profile, ...data })
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật profile"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitPassword = async (data: ChangePasswordFormValues) => {
    setIsLoadingPassword(true)
    try {
      const response = await api.put("/profile/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công!")
        resetPassword()
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể đổi mật khẩu"
      toast.error(errorMessage)
    } finally {
      setIsLoadingPassword(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh")
      return
    }

    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB")
      return
    }

    setIsLoadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await api.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.success("Upload avatar thành công!")
        
        setProfile({
          ...profile,
          avatar: response.data.data?.avatar || response.data.avatar,
        })
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể upload avatar"
      toast.error(errorMessage)
    } finally {
      setIsLoadingAvatar(false)
      
      e.target.value = ""
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()
  
  
  const renderContent = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Thông tin cá nhân</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Thông tin</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>

            {}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin profile của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage
                        src={
                          profile?.avatar ||
                          `http://localhost:5000/uploads/avatars/${profile?.avatar}`
                        }
                        alt={profile?.fullName || user.fullName}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(profile?.fullName || user.fullName || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isLoadingAvatar}
                          asChild
                        >
                          <span>
                            <Camera className="mr-2 h-4 w-4" />
                            {isLoadingAvatar
                              ? "Đang upload..."
                              : "Thay đổi avatar"}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>
                  <form
                    onSubmit={handleSubmitProfile(onSubmitProfile)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || user.email || ""}
                          disabled
                          className="pl-10 bg-gray-50"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Email không thể thay đổi
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Nhập họ và tên"
                          className="pl-10"
                          {...registerProfile("fullName")}
                          disabled={isLoading}
                        />
                      </div>
                      {profileErrors.fullName && (
                        <p className="text-sm text-red-500">
                          {profileErrors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Nhập số điện thoại"
                        {...registerProfile("phone")}
                        disabled={isLoading}
                      />
                      {profileErrors.phone && (
                        <p className="text-sm text-red-500">
                          {profileErrors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Nhập địa chỉ"
                        {...registerProfile("address")}
                        disabled={isLoading}
                      />
                      {profileErrors.address && (
                        <p className="text-sm text-red-500">
                          {profileErrors.address.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Thay đổi mật khẩu của bạn. Mật khẩu mới phải có ít nhất 8
                    ký tự, bao gồm chữ hoa, chữ thường và số.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmitPassword(onSubmitPassword)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">
                        Mật khẩu hiện tại
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu hiện tại"
                          className="pl-10 pr-10"
                          {...registerPassword("currentPassword")}
                          disabled={isLoadingPassword}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {passwordErrors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu mới"
                          className="pl-10 pr-10"
                          {...registerPassword("newPassword")}
                          disabled={isLoadingPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-500">
                          {passwordErrors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Xác nhận mật khẩu mới
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu mới"
                          className="pl-10 pr-10"
                          {...registerPassword("confirmPassword")}
                          disabled={isLoadingPassword}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {passwordErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoadingPassword}>
                      {isLoadingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
  )

  
  switch (role) {
    case "admin":
    case "1":
      return (
        <AdminSidebar>
          {renderContent()}
        </AdminSidebar>
      )
    case "doctor":
    case "2":
      return (
        <DoctorSidebar>
          {renderContent()}
        </DoctorSidebar>
      )
    case "receptionist":
    case "4":
      return (
        <ReceptionistSidebar>
          {renderContent()}
        </ReceptionistSidebar>
      )
    case "patient":
    case "3":
    default:
      return (
        <PatientSidebar>
          {renderContent()}
        </PatientSidebar>
      )
  }
}
