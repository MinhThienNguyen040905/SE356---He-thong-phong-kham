"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Pill, User, Calendar, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { useAuth } from "../../features/auth/context/authContext"
import { PrescriptionService } from "../../features/appointment/services/prescription.service"
import type { Prescription } from "../../types/prescription.types"
import { formatCurrency, formatDate } from "../../utils/prescriptionHelpers"

export default function PatientPrescriptionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("ID đơn thuốc không hợp lệ")
        setLoading(false)
        return
      }

      if (!user?.patientId) {
        setError("Không tìm thấy thông tin bệnh nhân")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await PrescriptionService.getPrescriptionById(Number(id))

        if (response.success && response.data) {
          const transformed = PrescriptionService.transformPrescriptionData(response.data)

          
          if (transformed.patientId !== user.patientId) {
            setError("Bạn không có quyền xem đơn thuốc này")
            return
          }

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
  }, [id, user?.patientId])

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
      LOCKED: { label: "Đã khóa", className: "bg-blue-100 text-blue-700" },
      DISPENSED: { label: "Đã cấp phát", className: "bg-green-100 text-green-700" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
    }

    const info = map[status] || { label: status, className: "bg-gray-100 text-gray-700" }
    return <Badge className={info.className}>{info.label}</Badge>
  }

  const renderMedicines = () => {
    if (!prescription) return null
    if (prescription.details.length === 0) {
      return <p className="text-sm text-muted-foreground">Chưa có thuốc trong đơn</p>
    }

    return (
      <div className="space-y-3">
        {prescription.details.map((detail) => (
          <div
            key={detail.id}
            className="border rounded-lg p-3 flex justify-between items-start gap-3"
          >
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                {detail.medicineName}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                SL: {detail.quantity} {detail.unit} • Sáng {detail.dosageMorning || 0} • Trưa {detail.dosageNoon || 0} • Chiều {detail.dosageAfternoon || 0} • Tối {detail.dosageEvening || 0}
              </div>
              {detail.instruction && (
                <div className="text-sm text-gray-700 mt-1">HD: {detail.instruction}</div>
              )}
            </div>
            <div className="text-right text-sm font-semibold text-gray-900">
              {formatCurrency(detail.quantity * detail.unitPrice)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-6 flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Không thể tải đơn thuốc</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!prescription) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Đơn thuốc #{prescription.prescriptionCode}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ngày kê: {formatDate(prescription.createdAt)}
              </p>
            </div>
            {getStatusBadge(prescription.status)}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Bác sĩ</div>
                  <div className="font-semibold">{prescription.doctor.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {prescription.doctor.specialty}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-primary mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Tổng tiền</div>
                  <div className="font-semibold">{formatCurrency(prescription.totalAmount)}</div>
                </div>
              </div>
            </div>

            {prescription.visit && (
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Thông tin khám</div>
                <div className="font-semibold mt-1">
                  Chẩn đoán: {prescription.visit.diagnosis || "Chưa cập nhật"}
                </div>
                {prescription.visit.symptoms && (
                  <div className="text-sm text-gray-700 mt-1">
                    Triệu chứng: {prescription.visit.symptoms}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Chi tiết thuốc</CardTitle>
          </CardHeader>
          <CardContent>{renderMedicines()}</CardContent>
        </Card>

        {prescription.note && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Ghi chú</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-800 leading-relaxed">{prescription.note}</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <PatientSidebar userName={user?.fullName || user?.email}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Chi tiết đơn thuốc</h1>
            <p className="text-muted-foreground text-sm">
              Xem đơn thuốc và hướng dẫn sử dụng thuốc của bạn
            </p>
          </div>
        </div>

        {renderContent()}
      </div>
    </PatientSidebar>
  )
}
