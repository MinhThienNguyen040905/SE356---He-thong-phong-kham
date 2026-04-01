"use client"

import { useState } from "react"
import { 
  Calendar, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  CalendarDays,
  FileText,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { 
  ScheduleGenerationService, 
  type GenerationPreview, 
  type GenerationResult 
} from "../../features/shift/services/scheduleGeneration.service"

export default function ScheduleGenerationPage() {
  const [activeTab, setActiveTab] = useState<"next" | "manual">("next")
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<GenerationPreview | null>(null)
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null)
  
  
  const currentDate = new Date()
  const [manualYear, setManualYear] = useState<string>(currentDate.getFullYear().toString())
  const [manualMonth, setManualMonth] = useState<string>((currentDate.getMonth() + 1).toString())

  const handlePreview = async () => {
    setIsLoading(true)
    setPreviewData(null)
    setLastResult(null)
    try {
      const data = await ScheduleGenerationService.previewNextMonth()
      setPreviewData(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải bản xem trước")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateNext = async () => {
    if (!previewData && !window.confirm("Bạn chưa xem trước. Bạn có chắc chắn muốn tạo lịch?")) {
      return
    }

    setIsLoading(true)
    try {
      const result = await ScheduleGenerationService.generateNextMonth()
      setLastResult(result)
      toast.success(result.message || "Tạo lịch thành công!")
      setPreviewData(null) 
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo lịch")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateManual = async () => {
    if (!manualYear || !manualMonth) {
      toast.error("Vui lòng chọn tháng và năm")
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn tạo lịch cho tháng ${manualMonth}/${manualYear}?`)) {
      return
    }

    setIsLoading(true)
    setLastResult(null)
    try {
      const result = await ScheduleGenerationService.generateForMonth(
        parseInt(manualYear), 
        parseInt(manualMonth)
      )
      setLastResult(result)
      toast.success(result.message || "Tạo lịch thành công!")
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo lịch")
    } finally {
      setIsLoading(false)
    }
  }

  
  const years = Array.from({ length: 4 }, (_, i) => currentDate.getFullYear() - 1 + i)
  
  return (
    <AdminSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8">
          
          {}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Sinh Lịch Tự Động
              </h1>
              <p className="text-slate-500 mt-1">
                Tạo lịch làm việc cho bác sĩ dựa trên các mẫu ca trực đã thiết lập
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {}
            <div className="lg:col-span-2 space-y-6">
              
              {}
              <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab("next")}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "next" 
                      ? "bg-white text-blue-700 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Tháng Tiếp Theo
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === "manual" 
                      ? "bg-white text-blue-700 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Tùy Chọn Tháng
                </button>
              </div>

              {}
              {activeTab === "next" && (
                <Card className="border-0 shadow-xl shadow-slate-200/50 overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                   <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Tạo lịch tháng sau
                    </CardTitle>
                    <CardDescription>
                      Hệ thống sẽ tự động tính toán tháng tiếp theo và áp dụng các mẫu hoạt động.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!previewData ? (
                      <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          Chưa có dữ liệu xem trước
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                          Nhấn nút bên dưới để phân tích mẫu và xem trước kết quả sinh lịch.
                        </p>
                        <Button 
                          onClick={handlePreview} 
                          disabled={isLoading}
                          className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Tải bản xem trước
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                          <div>
                            <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Kỳ Lịch</p>
                            <h2 className="text-2xl font-bold text-blue-900">
                              Tháng {previewData.period.month}/{previewData.period.year}
                            </h2>
                            <p className="text-sm text-blue-700 mt-1">
                              {new Date(previewData.period.startDate).toLocaleDateString("vi-VN")} - {new Date(previewData.period.endDate).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-300 px-3 py-1 text-sm">
                              Dự kiến
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Mẫu hoạt động</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{previewData.totalTemplates}</p>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-xs text-slate-500 font-medium">Tổng ca làm</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{previewData.totalShifts}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                            <p className="text-xs text-emerald-600 font-medium">Mới tạo thêm</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">+{previewData.newShifts}</p>
                          </div>
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 shadow-sm">
                            <p className="text-xs text-amber-600 font-medium">Đã tồn tại</p>
                            <p className="text-2xl font-bold text-amber-700 mt-1">{previewData.existingShifts}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                           <Button 
                            onClick={handleGenerateNext} 
                            disabled={isLoading || previewData.newShifts === 0}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-200 w-full md:w-auto"
                            size="lg"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                            )}
                            Xác nhận tạo lịch
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={handlePreview}
                            className="text-slate-500 hover:text-slate-900"
                          >
                            Làm mới
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {}
              {activeTab === "manual" && (
                <Card className="border-0 shadow-xl shadow-slate-200/50">
                  <CardHeader>
                    <CardTitle className="text-xl">Tùy chọn tháng</CardTitle>
                    <CardDescription>
                      Chọn tháng và năm cụ thể để sinh lịch. Lưu ý: Tính năng này không có bản xem trước.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tháng</label>
                        <Select value={manualMonth} onValueChange={setManualMonth}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tháng" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                              <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Năm</label>
                        <Select value={manualYear} onValueChange={setManualYear}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn năm" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Lưu ý quan trọng</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Việc tạo lịch sẽ bỏ qua các ca làm việc đã tồn tại (trùng bác sĩ, ca và ngày). Các ca làm việc mới sẽ được thêm vào.
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={handleGenerateManual}
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white hover:bg-slate-800"
                      size="lg"
                    >
                       {isLoading ? (
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                        )}
                      Tạo lịch cho Tháng {manualMonth}/{manualYear}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {}
              {lastResult && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                   <Alert className="bg-emerald-50 border-emerald-200 py-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <ShieldCheck className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <AlertTitle className="text-xl text-emerald-800 font-bold mb-2">Thành công!</AlertTitle>
                        <AlertDescription className="text-emerald-700">
                          <p className="text-base mb-2">{lastResult.message}</p>
                          <div className="flex gap-4 mt-3">
                             <div className="px-3 py-1 bg-white rounded border border-emerald-100 text-sm">
                               Đã tạo: <strong>{lastResult.generated}</strong> ca
                             </div>
                             <div className="px-3 py-1 bg-white rounded border border-emerald-100 text-sm">
                               Đã bỏ qua: <strong>{lastResult.skipped}</strong> ca
                             </div>
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                </div>
              )}

            </div>

            {}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-indigo-900 text-white overflow-hidden relative">
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-3xl" />
                 <div className="absolute top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full opacity-20 blur-2xl" />
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <FileText className="w-5 h-5" />
                     Hướng dẫn
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4 text-indigo-100 text-sm">
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                     <p>Thiết lập <strong>Mẫu Ca Trực</strong> cho từng bác sĩ ở trang Shift Templates.</p>
                   </div>
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                     <p>Sử dụng trang này để áp dụng mẫu cho cả tháng.</p>
                   </div>
                   <div className="flex gap-3">
                     <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                     <p>Hệ thống tự động bỏ qua nếu ca trực đã tồn tại, tránh trùng lặp.</p>
                   </div>
                   
                   <div className="pt-4 border-t border-indigo-800 mt-4">
                     <a href="/admin/shift-templates" className="flex items-center text-white font-medium hover:text-indigo-200 transition-colors">
                       Quản lý mẫu ca <ArrowRight className="w-4 h-4 ml-2" />
                     </a>
                   </div>
                 </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base">Mẹo</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-500">
                  Bạn nên tạo lịch vào ngày 25 hàng tháng để chuẩn bị cho tháng sau. Đảm bảo tất cả bác sĩ đã được gán mẫu ca trực đầy đủ.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
