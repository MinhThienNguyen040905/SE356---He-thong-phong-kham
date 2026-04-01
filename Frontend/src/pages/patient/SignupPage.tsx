import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "../../components/layout/header"
import { Footer } from "../../components/layout/footer"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Lock, Mail, Heart, User, Loader2 } from "lucide-react"
import { useAuth } from "../../features/auth/context/authContext"
import { toast } from "sonner"

export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      setLoading(false)
      return
    }

    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(formData.password)) {
      setError("Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 số")
      setLoading(false)
      return
    }

    if (formData.fullName.trim().length < 2) {
      setError("Họ tên phải có ít nhất 2 ký tự")
      setLoading(false)
      return
    }

    try {
      
      await register(formData.email, formData.password, formData.fullName)
      
      toast.success("Đăng ký thành công! Vui lòng xác thực email để tiếp tục.")
      
      
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`) 

    } catch (err: any) {
      console.error("Lỗi đăng ký:", err)
      
      const errorMessage = err.response?.data?.message || err.message || "Không thể tạo tài khoản. Vui lòng thử lại."
      
      if (errorMessage.includes("EMAIL_INVALID")) {
        setError("Định dạng email không hợp lệ.")
      } else if (errorMessage.includes("PASSWORD_TOO_SHORT")) {
        setError("Mật khẩu phải có ít nhất 8 ký tự.")
      } else if (errorMessage.includes("PASSWORD_WEAK")) {
        setError("Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 số.")
      } else if (errorMessage.includes("FULLNAME_INVALID")) {
        setError("Họ tên phải từ 2-100 ký tự.")
      } else if (errorMessage.includes("Email already exists")) {
        setError("Email này đã được đăng ký.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản của bạn</h1>
            <p className="text-gray-600">Tham gia HealthCare Plus và truy cập dịch vụ y tế chất lượng</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Đăng ký bệnh nhân</CardTitle>
              <CardDescription>Vui lòng điền thông tin của bạn để tạo tài khoản bệnh nhân mới</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                {}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và Tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nguyenvana@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Tạo mật khẩu"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Tối thiểu 8 ký tự, có chữ thường, chữ hoa và số
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Xác nhận mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                    Tôi đồng ý với{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </Link>
                  </Label>
                </div>

                {}
                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo tài khoản...
                    </>
                  ) : (
                    "Tạo tài khoản"
                  )}
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Đăng nhập
                    </Link>
                  </p>
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