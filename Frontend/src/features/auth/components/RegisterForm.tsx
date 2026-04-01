"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Lock, Mail, User, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react"

import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "../../../lib/firebase"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Họ và tên là bắt buộc")
    .min(2, "Họ và tên phải có ít nhất 2 ký tự"),

  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Định dạng email không hợp lệ"),

  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

  confirmPassword: yup
    .string()
    .required("Xác nhận mật khẩu là bắt buộc")
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp"),
})

type RegisterFormValues = yup.InferType<typeof registerSchema>

export default function Register() {
  const [error, setError] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setError("")
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password)
      navigate("/")
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại")
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsGoogleLoading(true)
    
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      
      console.log("Google sign-in successful")
      navigate("/")
    } catch (err: any) {
      setError(err.message || "Đăng nhập Google thất bại")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-white">
      {}
      <div className="hidden lg:flex relative flex-col justify-center items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/healthcare-bg.png')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 p-12 text-center text-white max-w-lg">
            <div className="mb-8 flex justify-center">
                 <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                 </div>
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-md">HealthCare Plus</h2>
            <p className="text-lg text-blue-100/90 mb-10 leading-relaxed font-light">
                Tham gia cộng đồng sức khỏe của chúng tôi. <br/>
                Đặt lịch nhanh chóng, quản lý hồ sơ tiện lợi.
            </p>
            
            <div className="grid grid-cols-2 gap-6 text-sm font-medium text-white/80">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> 
                    <span>Miễn phí đăng ký</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span>Đặt lịch dễ dàng</span>
                </div>
            </div>
        </div>
      </div>

      {}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative bg-white overflow-y-auto">
         <Link to="/" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Trang chủ
         </Link>

         <div className="w-full max-w-md space-y-8 py-8">
             <div className="text-center lg:text-left space-y-2">
                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo tài khoản</h1>
                 <p className="text-slate-500 text-base">Đăng ký để trải nghiệm dịch vụ chăm sóc sức khỏe 5 sao.</p>
             </div>

             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                 {error && (
                   <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
                     {error}
                   </div>
                 )}

                 <div className="space-y-4">
                     {}
                     <div className="space-y-2">
                         <Label className="text-slate-700 font-semibold" htmlFor="fullName">Họ và tên</Label>
                         <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                              <Input
                                id="fullName"
                                type="text"
                                placeholder="Nguyễn Văn A"
                                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                {...register("fullName")}
                              />
                         </div>
                         {errors.fullName && <p className="text-sm text-red-500 font-medium">{errors.fullName.message}</p>}
                     </div>

                     {}
                     <div className="space-y-2">
                         <Label className="text-slate-700 font-semibold" htmlFor="email">Email</Label>
                         <div className="relative group">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="your.email@example.com"
                                className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                {...register("email")}
                              />
                         </div>
                         {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                     </div>

                     {}
                     <div className="space-y-2">
                         <Label className="text-slate-700 font-semibold" htmlFor="password">Mật khẩu</Label>
                         <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Tối thiểu 6 ký tự"
                              className="pl-12 pr-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                              {...register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                         </div>
                         {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
                     </div>

                     {}
                     <div className="space-y-2">
                         <Label className="text-slate-700 font-semibold" htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                         <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Nhập lại mật khẩu"
                              className="pl-12 pr-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                              {...register("confirmPassword")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                         </div>
                         {errors.confirmPassword && <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>}
                     </div>
                 </div>

                 {}
                 <div className="flex items-start space-x-3">
                   <div className="relative flex items-start">
                     <div className="flex items-center h-5">
                       <input
                         type="checkbox"
                         id="terms"
                         className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                         required
                       />
                     </div>
                     <div className="ml-3 text-sm">
                       <Label htmlFor="terms" className="font-medium text-slate-700 cursor-pointer select-none leading-relaxed">
                         Tôi đồng ý với{" "}
                         <Link to="/terms" className="text-blue-600 hover:underline font-semibold">
                           Điều khoản sử dụng
                         </Link>{" "}
                         và{" "}
                         <Link to="/privacy" className="text-blue-600 hover:underline font-semibold">
                           Chính sách bảo mật
                         </Link>
                       </Label>
                     </div>
                   </div>
                 </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang xử lý...
                      </>
                    ) : "Đăng ký"}
                  </Button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-400 font-medium">
                        Hoặc đăng ký với
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {isGoogleLoading ? "Đang xử lý..." : "Đăng ký bằng Google"}
                  </Button>

                  <div className="text-center pt-2">
                    <p className="text-sm text-slate-500">
                      Đã có tài khoản?{" "}
                      <Link to="/login" className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition-colors">
                        Đăng nhập ngay
                      </Link>
                    </p>
                  </div>
             </form>

             <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Cần hỗ trợ? Liên hệ{" "}
                  <a href="tel:+15551234567" className="text-blue-600 hover:underline font-medium">
                    (555) 123-4567
                  </a>
                </p>
             </div>
         </div>
      </div>
    </div>
  )
}