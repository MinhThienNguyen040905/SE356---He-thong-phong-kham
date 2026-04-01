"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { useAuth } from "../../features/auth/context/authContext"
import { Bell, Monitor, Loader2, Save } from "lucide-react"
import { UserService } from "../../features/auth/services/user.service"

export default function PatientSettingsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  
  const [settings, setSettings] = useState({
    
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    appointmentReminders: true,
    prescriptionReminders: true,

    
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "DD/MM/YYYY",
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const data = await UserService.getNotificationSettings()
        setSettings(prev => ({
          ...prev,
          emailEnabled: data.emailEnabled,
          smsEnabled: data.smsEnabled,
          pushEnabled: data.pushEnabled,
          inAppEnabled: data.inAppEnabled,
          appointmentReminders: data.appointmentReminders,
          prescriptionReminders: data.prescriptionReminders,
        }))
      } catch (error) {
        console.error("Failed to fetch settings:", error)
        
        
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      
      await UserService.updateNotificationSettings({
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        pushEnabled: settings.pushEnabled,
        inAppEnabled: settings.inAppEnabled,
        appointmentReminders: settings.appointmentReminders,
        prescriptionReminders: settings.prescriptionReminders,
      })

      
      

      toast.success("Cập nhật cài đặt thành công!")
    } catch (error: any) {
      console.error("Error updating settings:", error)
      toast.error(error.message || "Không thể cập nhật cài đặt")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PatientSidebar
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
        {}
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các tùy chọn và cài đặt hệ thống của bạn
          </p>
        </div>

        {loading ? (
           <div className="flex justify-center p-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>
                  Quản lý cách bạn nhận thông báo từ hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailEnabled" className="text-base">Thông báo qua Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo về lịch hẹn và kết quả khám qua email
                    </p>
                  </div>
                  <Switch
                    id="emailEnabled"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("emailEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsEnabled" className="text-base">Thông báo qua SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận tin nhắn SMS về lịch hẹn sắp tới
                    </p>
                  </div>
                  <Switch
                    id="smsEnabled"
                    checked={settings.smsEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("smsEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushEnabled" className="text-base">Thông báo đẩy</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo đẩy trên trình duyệt
                    </p>
                  </div>
                  <Switch
                    id="pushEnabled"
                    checked={settings.pushEnabled}
                    onCheckedChange={(checked) => handleSwitchChange("pushEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointmentReminders" className="text-base">Nhắc nhở lịch hẹn</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận nhắc nhở trước 24 giờ và 1 giờ trước lịch hẹn
                    </p>
                  </div>
                  <Switch
                    id="appointmentReminders"
                    checked={settings.appointmentReminders}
                    onCheckedChange={(checked) => handleSwitchChange("appointmentReminders", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="prescriptionReminders" className="text-base">Nhắc nhở uống thuốc</Label>
                    <p className="text-sm text-muted-foreground">
                      Nhận thông báo nhắc nhở uống thuốc theo đơn
                    </p>
                  </div>
                  <Switch
                    id="prescriptionReminders"
                    checked={settings.prescriptionReminders}
                    onCheckedChange={(checked) => handleSwitchChange("prescriptionReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Hiển thị
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh cách hiển thị thông tin trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSelectChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleSelectChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Bangkok">Bangkok (GMT+7)</SelectItem>
                      <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Định dạng ngày tháng</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleSelectChange("dateFormat", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn định dạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </PatientSidebar>
  )
}
