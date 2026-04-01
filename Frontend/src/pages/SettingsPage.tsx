import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/context/authContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { toast } from "sonner"
import { UserService, type NotificationSettings } from "../features/auth/services/user.service"
import { Loader2, Bell, Mail, MessageSquare, Calendar, Pill, Receipt } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    inAppEnabled: true,
    appointmentReminders: true,
    prescriptionReminders: true,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await UserService.getNotificationSettings()
      setSettings(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        
        console.warn("Failed to fetch notification settings, using defaults")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await UserService.updateNotificationSettings(settings)
      toast.success("Cập nhật cài đặt thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật cài đặt")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải cài đặt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt</h1>
        <p className="text-gray-500">Quản lý cài đặt thông báo của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Cài đặt thông báo
          </CardTitle>
          <CardDescription>
            Chọn các loại thông báo bạn muốn nhận
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Thông báo chung</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="emailNotifications" className="font-medium">
                    Thông báo qua email
                  </Label>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo qua email
                  </p>
                </div>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, emailEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="smsNotifications" className="font-medium">
                    Thông báo qua SMS
                  </Label>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo qua tin nhắn SMS
                  </p>
                </div>
              </div>
              <Switch
                id="smsNotifications"
                checked={settings.smsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, smsEnabled: checked })
                }
              />
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Thông báo cụ thể</h3>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="appointmentReminders" className="font-medium">
                    Nhắc nhở lịch hẹn
                  </Label>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo nhắc nhở về lịch hẹn
                  </p>
                </div>
              </div>
              <Switch
                id="appointmentReminders"
                checked={settings.appointmentReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, appointmentReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="prescriptionReady" className="font-medium">
                    Đơn thuốc sẵn sàng
                  </Label>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo khi đơn thuốc đã sẵn sàng
                  </p>
                </div>
              </div>
              <Switch
                id="prescriptionReady"
                checked={settings.prescriptionReminders}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, prescriptionReminders: checked })
                }
              />
            </div>

            {/* Invoice Paid Notification - Currently not supported
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-gray-400" />
                <div>
                  <Label htmlFor="invoicePaid" className="font-medium">
                    Hóa đơn đã thanh toán
                  </Label>
                  <p className="text-sm text-gray-500">
                    Nhận thông báo khi hóa đơn đã được thanh toán
                  </p>
                </div>
              </div>
              <Switch
                id="invoicePaid"
                disabled
              />
            </div>
            */}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu cài đặt"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
