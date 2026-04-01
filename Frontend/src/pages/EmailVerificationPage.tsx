"use client"

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { OTPInput } from "../components/ui/otp-input"
import { Mail, ArrowLeft, CheckCircle2, Loader2, Clock, Shield } from "lucide-react"
import { OTPService } from "../features/auth/services/otp.service"
import { toast } from "sonner"

type Step = "email" | "otp" | "success"

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(300) 
  const [canResend, setCanResend] = useState(false)
  const hasSentOTP = useRef(false) 

  
  useEffect(() => {
    const emailFromUrl = searchParams.get("email")
    
    
    
    
    
    if (emailFromUrl && 
        !hasSentOTP.current && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFromUrl)) {
      
      hasSentOTP.current = true 
      setEmail(emailFromUrl)
      
      
      const sendOTPAuto = async () => {
        setIsLoading(true)
        try {
          const response = await OTPService.sendOTP(emailFromUrl)
          if (response.success) {
            toast.success(response.message)
            setStep("otp")
            setTimeLeft(300)
            setCanResend(false)
          } else {
            setError(response.message || "Có lỗi xảy ra")
            hasSentOTP.current = false 
          }
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || "Không thể gửi OTP"
          setError(message)
          toast.error(message)
          hasSentOTP.current = false 
        } finally {
          setIsLoading(false)
        }
      }
      
      sendOTPAuto()
    }
  }, [searchParams]) 

  
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [step, timeLeft])

  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập email hợp lệ")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await OTPService.sendOTP(email)
      
      if (response.success) {
        toast.success(response.message)
        setStep("otp")
        setTimeLeft(300)
        setCanResend(false)
      } else {
        setError(response.message || "Có lỗi xảy ra")
      }
    } catch (err: any) {
      console.error("Send OTP error:", err)
      const message = err.response?.data?.message || err.message || "Không thể gửi OTP. Vui lòng thử lại."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Vui lòng nhập đủ 6 số")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await OTPService.verifyOTP(email, otp)
      
      if (response.success) {
        toast.success(response.message)
        setStep("success")
      } else {
        setError(response.message || "Mã OTP không đúng")
        setOtp("")
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err)
      const message = err.response?.data?.message || err.message || "Xác thực thất bại. Vui lòng thử lại."
      setError(message)
      toast.error(message)
      setOtp("")
    } finally {
      setIsLoading(false)
    }
  }

  
  useEffect(() => {
    if (otp.length === 6 && !isLoading) {
      handleVerifyOTP()
    }
  }, [otp])

  
  const handleResend = async () => {
    if (!canResend) return

    setError("")
    setIsLoading(true)
    setOtp("")

    try {
      const response = await OTPService.resendOTP(email)
      
      if (response.success) {
        toast.success("Mã OTP mới đã được gửi!")
        setTimeLeft(300)
        setCanResend(false)
      } else {
        setError(response.message || "Có lỗi xảy ra")
      }
    } catch (err: any) {
      console.error("Resend OTP error:", err)
      const message = err.response?.data?.message || err.message || "Không thể gửi lại OTP"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-white">
      {}
      <div className="hidden lg:flex relative flex-col justify-center items-center bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-10"></div>
        
        {}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-md">Xác Thực Email</h2>
          <p className="text-lg text-white/90 mb-10 leading-relaxed font-light">
            Bảo vệ tài khoản của bạn với xác thực 2 lớp. <br />
            Chỉ mất 30 giây để hoàn tất!
          </p>
          
          <div className="grid grid-cols-2 gap-6 text-sm font-medium text-white/80">
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>An toàn tuyệt đối</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span>Nhanh chóng</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 relative bg-white">
        <Link to="/login" className="absolute top-8 left-8 text-slate-500 hover:text-purple-600 transition-colors flex items-center gap-2 font-medium group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Quay lại
        </Link>

        <div className="w-full max-w-md space-y-8">
          {}
          {step === "email" && (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 mb-4">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Xác Thực Email</h1>
                <p className="text-slate-500 text-base">Nhập email để nhận mã xác thực OTP</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold" htmlFor="email">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" /> Đang gửi...
                    </>
                  ) : "Gửi Mã OTP"}
                </Button>
              </form>
            </>
          )}

          {}
          {step === "otp" && (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nhập Mã OTP</h1>
                <p className="text-slate-500 text-base">
                  Chúng tôi đã gửi mã 6 số đến<br />
                  <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                    error={!!error}
                  />
                  
                  {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span className="text-sm font-medium">Đang xác thực...</span>
                    </div>
                  )}
                </div>

                {}
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {timeLeft > 0 ? (
                      <>Mã hết hạn sau <span className="text-purple-600 font-bold">{formatTime(timeLeft)}</span></>
                    ) : (
                      <span className="text-red-600 font-bold">Mã đã hết hạn</span>
                    )}
                  </span>
                </div>

                {}
                <div className="text-center">
                  <button
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {canResend ? "Gửi lại mã OTP" : `Gửi lại sau ${formatTime(timeLeft)}`}
                  </button>
                </div>

                <button
                  onClick={() => setStep("email")}
                  className="w-full text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Sử dụng email khác?
                </button>
              </div>
            </>
          )}

          {}
          {step === "success" && (
            <>
              <div className="text-center space-y-6">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4 animate-in zoom-in duration-500">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Xác Thực Thành Công!</h1>
                  <p className="text-slate-500 text-base">
                    Email của bạn đã được xác thực.<br />
                    Bây giờ bạn có thể sử dụng đầy đủ tính năng!
                  </p>
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all hover:scale-[1.01]"
                  >
                    Đăng Nhập Ngay
                  </Button>
                  
                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 font-medium"
                  >
                    Về Trang Chủ
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
