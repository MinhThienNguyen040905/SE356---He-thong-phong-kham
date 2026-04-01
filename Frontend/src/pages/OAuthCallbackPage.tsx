"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../features/auth/context/authContext"
import { setAccessToken, setRefreshToken } from "../lib/axiosAuth"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "../lib/api"

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken, user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      
      if (hasProcessed || user) {
        return
      }

      try {
        
        const token = searchParams.get("token")
        const refreshToken = searchParams.get("refreshToken")
        const error = searchParams.get("error")

        if (error) {
          toast.error("Đăng nhập với Google thất bại")
          navigate("/login")
          return
        }

        if (token) {
          
          setHasProcessed(true)

          
          
          await loginWithToken(token, refreshToken || undefined)

          
          window.history.replaceState({}, '', window.location.pathname)

          toast.success("Đăng nhập với Google thành công")
          
          
          setTimeout(() => {
            
            try {
              const tokenPayload = JSON.parse(atob(token.split('.')[1]))
              const roleId = tokenPayload.roleId
              
              
              
              if (roleId === 1) {
                
                navigate("/admin/dashboard", { replace: true })
              } else if (roleId === 4) {
                
                navigate("/doctor/dashboard", { replace: true })
              } else if (roleId === 3) {
                
                navigate("/patient/dashboard", { replace: true })
              } else if (roleId === 2) {
                
                navigate("/receptionist/dashboard", { replace: true })
              } else {
                
                navigate("/", { replace: true })
              }
            } catch (error) {
              
              console.error("Error parsing token:", error)
              navigate("/", { replace: true })
            }
          }, 100) 
          return
        }

        
        toast.error("Không nhận được token từ Google")
        navigate("/login")
      } catch (error: any) {
        console.error("OAuth callback error:", error)
        const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xử lý đăng nhập Google"
        toast.error(errorMessage)
        navigate("/login")
      } finally {
        setIsProcessing(false)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, loginWithToken, hasProcessed, user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  )
}
