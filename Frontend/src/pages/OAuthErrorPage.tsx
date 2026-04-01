"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { AlertCircle, RefreshCw, Home, LogIn } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"

export default function OAuthErrorPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorType, setErrorType] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")
    const errorReason = searchParams.get("error_reason")

    
    const errorMessages: Record<string, { title: string; description: string }> = {
      access_denied: {
        title: "Đăng nhập bị từ chối",
        description: "Bạn đã hủy quá trình đăng nhập bằng Google. Vui lòng thử lại nếu bạn muốn tiếp tục.",
      },
      invalid_request: {
        title: "Yêu cầu không hợp lệ",
        description: "Yêu cầu đăng nhập không hợp lệ. Vui lòng thử lại sau vài phút.",
      },
      unauthorized_client: {
        title: "Ứng dụng chưa được cấp phép",
        description: "Ứng dụng này chưa được cấp phép để sử dụng Google đăng nhập. Vui lòng liên hệ quản trị viên.",
      },
      unsupported_response_type: {
        title: "Lỗi cấu hình",
        description: "Có lỗi trong cấu hình đăng nhập. Vui lòng liên hệ quản trị viên.",
      },
      server_error: {
        title: "Lỗi máy chủ",
        description: "Đã xảy ra lỗi từ phía máy chủ Google. Vui lòng thử lại sau vài phút.",
      },
      temporarily_unavailable: {
        title: "Dịch vụ tạm thời không khả dụng",
        description: "Dịch vụ đăng nhập Google đang tạm thời không khả dụng. Vui lòng thử lại sau.",
      },
      email_not_provided: {
        title: "Email không được cung cấp",
        description: "Google không cung cấp địa chỉ email của bạn. Vui lòng đảm bảo tài khoản Google của bạn có email và thử lại.",
      },
      account_exists: {
        title: "Tài khoản đã tồn tại",
        description: "Email này đã được sử dụng với phương thức đăng nhập khác. Vui lòng đăng nhập bằng email và mật khẩu.",
      },
      default: {
        title: "Đăng nhập thất bại",
        description: errorDescription || errorReason || "Đã xảy ra lỗi không xác định trong quá trình đăng nhập. Vui lòng thử lại.",
      },
    }

    const errorInfo = errorMessages[error || ""] || errorMessages.default
    setErrorType(error || "unknown")
    setErrorMessage(errorInfo.description)
  }, [searchParams])

  const handleRetry = () => {
    
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/oauth/google`
  }

  const handleGoHome = () => {
    navigate("/")
  }

  const handleGoToLogin = () => {
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Đăng nhập không thành công
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi đăng nhập</AlertTitle>
            <AlertDescription>
              Mã lỗi: <code className="text-xs bg-red-50 px-1 py-0.5 rounded">{errorType}</code>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại với Google
            </Button>

            <Button
              onClick={handleGoToLogin}
              className="w-full"
              variant="outline"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập bằng email
            </Button>

            <Button
              onClick={handleGoHome}
              className="w-full"
              variant="ghost"
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500 text-center">
              Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ{" "}
              <a href="mailto:support@healthcare.com" className="text-blue-600 hover:underline">
                hỗ trợ kỹ thuật
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
