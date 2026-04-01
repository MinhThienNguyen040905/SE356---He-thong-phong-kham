"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import api from "../lib/api"

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required("Email bắt buộc nhập")
    .email("Định dạng email không hợp lệ"),
})

type ForgotPasswordFormValues = yup.InferType<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      const response = await api.post("/auth/forgot-password", {
        email: data.email,
      })

      if (response.data.success) {
        setIsSubmitted(true)
        toast.success("Email đặt lại mật khẩu đã được gửi!")
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra")
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể gửi email. Vui lòng thử lại sau."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
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
                  Hệ thống quản lý y tế thông minh. <br/>
                  Trải nghiệm đặt lịch và chăm sóc sức khỏe 5 sao.
              </p>
              
              <div className="grid grid-cols-2 gap-6 text-sm font-medium text-white/80">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" /> 
                      <span>Bảo mật tuyệt đối</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                      <CheckCircle2 className="w-5 h-5 text-blue-400" />
                      <span>Hỗ trợ 24/7</span>
                  </div>
              </div>
          </div>
        </div>

        {}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative bg-white">
           <Link to="/login" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium group">
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
           </Link>

           <div className="w-full max-w-md space-y-8 text-center">
               <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-in zoom-in">
                   <CheckCircle2 className="w-10 h-10 text-green-600" />
               </div>

               <div className="space-y-3">
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kiểm tra email của bạn</h1>
                   <p className="text-slate-500 text-base leading-relaxed">
                       Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. 
                       Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                   </p>
               </div>

               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                   <p className="text-sm text-blue-800">
                       <strong className="font-bold">Lưu ý:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 15 phút. 
                       Nếu không nhận được email, vui lòng kiểm tra thư mục spam.
                   </p>
               </div>

               <div className="flex flex-col gap-3 pt-4">
                   <Button asChild variant="outline" className="h-12 rounded-xl font-medium">
                       <Link to="/login">
                           <ArrowLeft className="mr-2 h-5 w-5" />
                           Quay lại đăng nhập
                       </Link>
                   </Button>
               </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-white">
      {}
      <div className="hidden lg:flex relative flex-col justify-center items-center bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
        
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
                Hệ thống quản lý y tế thông minh. <br/>
                Trải nghiệm đặt lịch và chăm sóc sức khỏe 5 sao.
            </p>
            
            <div className="grid grid-cols-2 gap-6 text-sm font-medium text-white/80">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" /> 
                    <span>Bảo mật tuyệt đối</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    <span>Hỗ trợ 24/7</span>
                </div>
            </div>
        </div>
      </div>

      {}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative bg-white">
         <Link to="/login" className="absolute top-8 left-8 text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Đăng nhập
         </Link>

         <div className="w-full max-w-md space-y-8">
             <div className="text-center lg:text-left space-y-2">
                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quên mật khẩu?</h1>
                 <p className="text-slate-500 text-base">Nhập email của bạn để nhận link đặt lại mật khẩu.</p>
             </div>

             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                 <div className="space-y-2">
                     <Label className="text-slate-700 font-semibold" htmlFor="email">Email</Label>
                     <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            {...register("email")}
                            disabled={isLoading}
                          />
                     </div>
                     {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
                 </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang gửi...
                      </>
                    ) : "Gửi link đặt lại mật khẩu"}
                  </Button>

                  <div className="text-center pt-2">
                    <Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 font-medium inline-flex items-center gap-1 transition-colors">
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
             </form>
         </div>
      </div>
    </div>
  )
}
