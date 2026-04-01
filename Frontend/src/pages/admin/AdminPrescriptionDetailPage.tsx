import { useEffect, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  Pill, 
  User, 
  Calendar, 
  AlertCircle, 
  FileText,
  Download,
  Heart,
  Phone,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { PrescriptionService } from "../../features/appointment/services/prescription.service"
import type { Prescription } from "../../types/prescription.types"
import { formatCurrency, formatDate } from "../../utils/prescriptionHelpers"

export default function AdminPrescriptionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID đơn thuốc không hợp lệ")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await PrescriptionService.getPrescriptionById(Number(id))

        if (response.success && response.data) {
          const transformed = PrescriptionService.transformPrescriptionData(response.data)
          setPrescription(transformed)
        } else {
          setError(response.message || "Không thể tải đơn thuốc")
        }
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 404) {
          setError("Không tìm thấy đơn thuốc")
        } else if (status === 403) {
          setError("Bạn không có quyền xem đơn thuốc này")
        } else {
          setError(err?.response?.data?.message || "Không thể tải đơn thuốc")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleExportPDF = async () => {
    if (!prescription) return

    try {
      setIsExporting(true)
      const blob = await PrescriptionService.exportPrescriptionPDF(prescription.id)
      
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Don-thuoc-${prescription.prescriptionCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("Xuất PDF thành công")
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xuất PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string; icon: any }> = {
      DRAFT: { 
        label: "Nháp", 
        className: "bg-amber-50 text-amber-700 border-amber-200 font-semibold px-3 py-1",
        icon: Clock
      },
      LOCKED: { 
        label: "Đã khóa", 
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-3 py-1",
        icon: CheckCircle2
      },
      DISPENSED: { 
        label: "Đã cấp phát", 
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-3 py-1",
        icon: CheckCircle2
      },
      CANCELLED: { 
        label: "Đã hủy", 
        className: "bg-red-50 text-red-700 border-red-200 font-semibold px-3 py-1",
        icon: XCircle
      },
      PENDING: {
        label: "Chờ phát thuốc",
        className: "bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1",
        icon: Clock
      }
    }

    const info = map[status] || { 
      label: status, 
      className: "bg-slate-50 text-slate-700 border-slate-200 font-semibold px-3 py-1",
      icon: FileText
    }
    
    const Icon = info.icon
    return (
      <Badge variant="outline" className={info.className}>
        <Icon className="h-3.5 w-3.5 mr-1.5" />
        {info.label}
      </Badge>
    )
  }

  const renderMedicines = () => {
    if (!prescription) return null
    if (prescription.details.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500">
          <Pill className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Chưa có thuốc trong đơn</p>
        </div>
      )
    }

    return (
      <div className="divide-y">
        {prescription.details.map((detail, index) => (
          <div key={detail.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-900">{detail.medicineName}</span>
                  <span className="text-sm text-slate-500">× {detail.quantity} {detail.unit}</span>
                </div>
                
                <div className="ml-9 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                    <span className="text-slate-500">Liều:</span>
                    <span className="font-medium text-slate-700">
                      {detail.dosageMorning || 0}-{detail.dosageNoon || 0}-{detail.dosageAfternoon || 0}-{detail.dosageEvening || 0}
                    </span>
                    {detail.days && <span className="text-slate-500">• {detail.days} ngày</span>}
                  </div>
                  {detail.instruction && (
                    <span className="text-slate-600 italic">"{detail.instruction}"</span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-slate-500">{formatCurrency(detail.unitPrice)}/đơn vị</div>
                <div className="font-bold text-emerald-600">{formatCurrency(detail.quantity * detail.unitPrice)}</div>
              </div>
            </div>
          </div>
        ))}
        
        {}
        <div className="pt-4 flex justify-between items-center">
          <span className="font-bold text-slate-900">Tổng cộng</span>
          <span className="text-xl font-black text-emerald-600">{formatCurrency(prescription.totalAmount)}</span>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Card className="border shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <p className="text-lg font-semibold text-red-600 mb-1">Không thể tải đơn thuốc</p>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      )
    }

    if (!prescription) return null

    return (
      <div className="space-y-4">
        {}
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            {}
            <div className="flex items-start justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-cyan-500 flex items-center justify-center">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{prescription.prescriptionCode}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(prescription.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(prescription.status)}
                <Button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Download className="h-4 w-4 mr-1.5" />PDF</>
                  )}
                </Button>
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-4">
              {}
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700 uppercase">Bệnh nhân</span>
                </div>
                <div className="font-bold text-slate-900 mb-1">{prescription.patient.fullName}</div>
                <div className="text-sm text-slate-600 space-y-0.5">
                  {prescription.patient.phoneNumber && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      <span>{prescription.patient.phoneNumber}</span>
                    </div>
                  )}
                  {prescription.patient.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-emerald-500" />
                      <span className="truncate">{prescription.patient.email}</span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-100"
                  asChild
                >
                  <Link to={`/admin/patients/${prescription.patientId}`}>Xem hồ sơ →</Link>
                </Button>
              </div>

              {}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 uppercase">Bác sĩ kê đơn</span>
                </div>
                <div className="font-bold text-slate-900 mb-1">
                  {prescription.doctor.fullName.startsWith('BS.') 
                    ? prescription.doctor.fullName 
                    : `BS. ${prescription.doctor.fullName}`}
                </div>
                <div className="text-sm text-slate-600 space-y-0.5">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs h-5">
                    {prescription.doctor.specialty}
                  </Badge>
                  {prescription.doctor.phoneNumber && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Phone className="h-3 w-3 text-blue-500" />
                      <span>{prescription.doctor.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            {prescription.visit && (
              <div className="mt-4 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase">Chẩn đoán</span>
                </div>
                <p className="text-sm text-slate-700">{prescription.visit.diagnosis || "Chưa cập nhật"}</p>
                {prescription.visit.symptoms && (
                  <p className="text-sm text-slate-500 mt-1">
                    <span className="font-medium">Triệu chứng:</span> {prescription.visit.symptoms}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card className="border shadow-sm">
          <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Pill className="h-4 w-4 text-cyan-600" />
                Chi tiết thuốc ({prescription.details.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {renderMedicines()}
          </CardContent>
        </Card>

        {}
        {prescription.note && (
          <Card className="border shadow-sm">
            <CardHeader className="py-3 px-5 border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <FileText className="h-4 w-4 text-purple-600" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-sm text-slate-700">{prescription.note}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-6 max-w-5xl mx-auto">
        {}
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 text-slate-600 hover:text-cyan-600" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        {}
        {renderContent()}
      </div>
    </AdminSidebar>
  )
}

