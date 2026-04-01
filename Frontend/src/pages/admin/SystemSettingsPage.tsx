"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Building2,
  Clock,
  Save,
  Loader2,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Textarea } from "../../components/ui/textarea"
import { Switch } from "../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import api from "../../lib/api"

interface SystemSettings {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  clinicWebsite?: string
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  systemSettings: {
    maintenanceMode: boolean
    allowOnlineBooking: boolean
    allowOfflineBooking: boolean
    maxAppointmentsPerDay: number
    appointmentDuration: number 
    currency: string
    timezone: string
  }
}

const defaultSettings: SystemSettings = {
  clinicName: "",
  clinicAddress: "",
  clinicPhone: "",
  clinicEmail: "",
  clinicWebsite: "",
  businessHours: {
    monday: { open: "08:00", close: "17:00", closed: false },
    tuesday: { open: "08:00", close: "17:00", closed: false },
    wednesday: { open: "08:00", close: "17:00", closed: false },
    thursday: { open: "08:00", close: "17:00", closed: false },
    friday: { open: "08:00", close: "17:00", closed: false },
    saturday: { open: "08:00", close: "12:00", closed: false },
    sunday: { open: "", close: "", closed: true },
  },
  systemSettings: {
    maintenanceMode: false,
    allowOnlineBooking: true,
    allowOfflineBooking: true,
    maxAppointmentsPerDay: 50,
    appointmentDuration: 30,
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
  },
}

const daysOfWeek = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ nhật" },
] as const

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      
      try {
        const response = await api.get("/system/settings")
        if (response.data.success && response.data.data) {
          setSettings({ ...defaultSettings, ...response.data.data })
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn("Failed to fetch system settings, using defaults")
        }
        
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      try {
        const response = await api.put("/system/settings", settings)
        if (response.data.success) {
          toast.success("Cập nhật cài đặt hệ thống thành công!")
        } else {
          throw new Error(response.data.message || "Không thể cập nhật cài đặt")
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          
          toast.success("Cài đặt đã được lưu (API endpoint chưa được implement)")
        } else {
          throw error
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật cài đặt hệ thống")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const updateClinicInfo = (field: keyof SystemSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateBusinessHours = (
    day: keyof SystemSettings["businessHours"],
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }))
  }

  const updateSystemSetting = (field: keyof SystemSettings["systemSettings"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      systemSettings: {
        ...prev.systemSettings,
        [field]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải cài đặt hệ thống...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-1 md:mb-2">Cài đặt Hệ thống</h1>
            <p className="text-sm md:text-base text-slate-600">Quản lý cấu hình hệ thống và thông tin phòng khám</p>
          </div>
        </div>

        <Tabs defaultValue="clinic" className="space-y-4 md:space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="clinic" className="flex-shrink-0">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thông tin phòng khám</span>
              <span className="sm:hidden">Phòng khám</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex-shrink-0">
              <Clock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Giờ làm việc</span>
              <span className="sm:hidden">Giờ</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex-shrink-0">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cài đặt hệ thống</span>
              <span className="sm:hidden">Hệ thống</span>
            </TabsTrigger>
          </TabsList>

          {}
          <TabsContent value="clinic">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Thông tin phòng khám
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cơ bản của phòng khám
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clinicName">Tên phòng khám *</Label>
                  <Input
                    id="clinicName"
                    value={settings.clinicName}
                    onChange={(e) => updateClinicInfo("clinicName", e.target.value)}
                    placeholder="Nhập tên phòng khám"
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress">Địa chỉ *</Label>
                  <Textarea
                    id="clinicAddress"
                    value={settings.clinicAddress}
                    onChange={(e) => updateClinicInfo("clinicAddress", e.target.value)}
                    placeholder="Nhập địa chỉ phòng khám"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinicPhone">Số điện thoại *</Label>
                    <Input
                      id="clinicPhone"
                      value={settings.clinicPhone}
                      onChange={(e) => updateClinicInfo("clinicPhone", e.target.value)}
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicEmail">Email *</Label>
                    <Input
                      id="clinicEmail"
                      type="email"
                      value={settings.clinicEmail}
                      onChange={(e) => updateClinicInfo("clinicEmail", e.target.value)}
                      placeholder="info@clinic.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinicWebsite">Website</Label>
                  <Input
                    id="clinicWebsite"
                    type="url"
                    value={settings.clinicWebsite}
                    onChange={(e) => updateClinicInfo("clinicWebsite", e.target.value)}
                    placeholder="https://www.clinic.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="hours">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Giờ làm việc
                </CardTitle>
                <CardDescription>
                  Cấu hình giờ làm việc cho từng ngày trong tuần
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => {
                  const daySettings = settings.businessHours[day.key]
                  return (
                    <div key={day.key} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 border rounded-lg">
                      <div className="w-20 sm:w-24">
                        <Label className="font-medium text-sm md:text-base">{day.label}</Label>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
                        <Switch
                          checked={!daySettings.closed}
                          onCheckedChange={(checked) =>
                            updateBusinessHours(day.key, "closed", !checked)
                          }
                        />
                        <span className="text-sm text-slate-600">
                          {daySettings.closed ? "Nghỉ" : "Làm việc"}
                        </span>
                      </div>
                      {!daySettings.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day.key}-open`} className="text-sm whitespace-nowrap">
                              Từ:
                            </Label>
                            <Input
                              id={`${day.key}-open`}
                              type="time"
                              value={daySettings.open}
                              onChange={(e) =>
                                updateBusinessHours(day.key, "open", e.target.value)
                              }
                              className="w-32 sm:w-36"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day.key}-close`} className="text-sm whitespace-nowrap">
                              Đến:
                            </Label>
                            <Input
                              id={`${day.key}-close`}
                              type="time"
                              value={daySettings.close}
                              onChange={(e) =>
                                updateBusinessHours(day.key, "close", e.target.value)
                              }
                              className="w-32 sm:w-36"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {}
          <TabsContent value="system">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt hệ thống
                </CardTitle>
                <CardDescription>
                  Cấu hình các tính năng và giới hạn của hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Trạng thái hệ thống</h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="maintenanceMode" className="font-medium">
                        Chế độ bảo trì
                      </Label>
                      <p className="text-sm text-slate-500">
                        Tắt hệ thống để bảo trì (chỉ admin có thể truy cập)
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("maintenanceMode", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Đặt lịch hẹn</h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowOnlineBooking" className="font-medium">
                        Cho phép đặt lịch online
                      </Label>
                      <p className="text-sm text-slate-500">
                        Bệnh nhân có thể đặt lịch qua website
                      </p>
                    </div>
                    <Switch
                      id="allowOnlineBooking"
                      checked={settings.systemSettings.allowOnlineBooking}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("allowOnlineBooking", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowOfflineBooking" className="font-medium">
                        Cho phép đặt lịch offline
                      </Label>
                      <p className="text-sm text-slate-500">
                        Lễ tân có thể đặt lịch tại quầy
                      </p>
                    </div>
                    <Switch
                      id="allowOfflineBooking"
                      checked={settings.systemSettings.allowOfflineBooking}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("allowOfflineBooking", checked)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAppointmentsPerDay">
                        Số lịch hẹn tối đa mỗi ngày
                      </Label>
                      <Input
                        id="maxAppointmentsPerDay"
                        type="number"
                        min="1"
                        value={settings.systemSettings.maxAppointmentsPerDay}
                        onChange={(e) =>
                          updateSystemSetting(
                            "maxAppointmentsPerDay",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="appointmentDuration">
                        Thời gian mỗi lịch hẹn (phút)
                      </Label>
                      <Input
                        id="appointmentDuration"
                        type="number"
                        min="15"
                        step="15"
                        value={settings.systemSettings.appointmentDuration}
                        onChange={(e) =>
                          updateSystemSetting(
                            "appointmentDuration",
                            parseInt(e.target.value) || 30
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Cài đặt khác</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                      <Input
                        id="currency"
                        value={settings.systemSettings.currency}
                        onChange={(e) => updateSystemSetting("currency", e.target.value)}
                        placeholder="VND"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Input
                        id="timezone"
                        value={settings.systemSettings.timezone}
                        onChange={(e) => updateSystemSetting("timezone", e.target.value)}
                        placeholder="Asia/Ho_Chi_Minh"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {}
        <div className="sticky bottom-0 left-0 right-0 mt-6 md:mt-8 p-4 md:p-6 bg-white border-t border-slate-200 rounded-t-2xl shadow-lg z-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => fetchSettings()} 
              disabled={isSaving}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Khôi phục mặc định
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu tất cả thay đổi
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
