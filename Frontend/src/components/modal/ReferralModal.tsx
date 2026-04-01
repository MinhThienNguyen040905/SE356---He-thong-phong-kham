import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "../../lib/api"

interface ReferralModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visitId: number
  onSuccess?: () => void
}

const SPECIALTIES = [
  { value: "CARDIOLOGY", label: "Tim mạch" },
  { value: "NEUROLOGY", label: "Thần kinh" },
  { value: "ORTHOPEDICS", label: "Chấn thương chỉnh hình" },
  { value: "PEDIATRICS", label: "Nhi khoa" },
  { value: "DERMATOLOGY", label: "Da liễu" },
  { value: "OPHTHALMOLOGY", label: "Mắt" },
  { value: "ENT", label: "Tai mũi họng" },
  { value: "GASTROENTEROLOGY", label: "Tiêu hóa" },
  { value: "UROLOGY", label: "Tiết niệu" },
  { value: "GYNECOLOGY", label: "Phụ khoa" },
  { value: "PSYCHIATRY", label: "Tâm thần" },
  { value: "ONCOLOGY", label: "Ung bướu" },
  { value: "ENDOCRINOLOGY", label: "Nội tiết" },
  { value: "PULMONOLOGY", label: "Hô hấp" },
  { value: "RHEUMATOLOGY", label: "Khớp" },
  { value: "GENERAL", label: "Nội tổng quát" },
]

export function ReferralModal({ open, onOpenChange, visitId, onSuccess }: ReferralModalProps) {
  const [specialty, setSpecialty] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!specialty) {
      toast.error("Vui lòng chọn chuyên khoa")
      return
    }

    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do chuyển khoa")
      return
    }

    try {
      setLoading(true)
      
      const response = await api.post(`/visits/${visitId}/refer`, {
        specialty,
        reason: reason.trim(),
      })

      if (response.data.success) {
        toast.success("Chuyển khoa thành công")
        setSpecialty("")
        setReason("")
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      console.error("Error referring patient:", error)
      const errorMessage = error.response?.data?.message || "Không thể chuyển khoa"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSpecialty("")
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            Chuyển khoa khám
          </DialogTitle>
          <DialogDescription>
            Chuyển bệnh nhân sang chuyên khoa khác để tiếp tục điều trị
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="specialty" className="text-sm font-semibold text-slate-700">
              Chuyên khoa <span className="text-red-500">*</span>
            </Label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger id="specialty" className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100">
                <SelectValue placeholder="Chọn chuyên khoa..." />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((spec) => (
                  <SelectItem key={spec.value} value={spec.value}>
                    {spec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold text-slate-700">
              Lý do chuyển khoa <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do chuyển khoa, triệu chứng cần chuyên khoa khác xử lý..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              className="bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all resize-none text-slate-700 leading-relaxed rounded-xl p-4"
            />
            <div className="flex justify-end">
              <span className="text-xs font-medium text-slate-400">{reason.length} ký tự</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Xác nhận chuyển khoa
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
