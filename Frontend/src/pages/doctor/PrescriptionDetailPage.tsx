import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import DoctorSidebar from '../../components/layout/sidebar/doctor'
import ReceptionistSidebar from '../../components/layout/sidebar/recep'
import AdminSidebar from '../../components/layout/sidebar/admin'
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  User,
  Calendar,
  FileText,
  Pill,
  DollarSign,
  Edit,
  Download,
  Printer,
  AlertCircle,
  CheckCircle,
  Loader2,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Clock,
  XCircle
} from "lucide-react"


import type { Prescription } from '../../types/prescription.types'
import { PrescriptionService } from '../../features/appointment/services/prescription.service'
import { 
  formatDate, 
  formatCurrency, 
  calculateAge, 
  printPrescription
} from '../../utils/prescriptionHelpers'

export default function PrescriptionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isDispensing, setIsDispensing] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [dispenseDialogOpen, setDispenseDialogOpen] = useState(false)

  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Nháp</Badge>
      case 'LOCKED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Đã khóa</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'LOCKED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  
  useEffect(() => {
    const fetchPrescriptionDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!id) {
          setError('ID đơn thuốc không hợp lệ')
          return
        }
        
        console.log('Fetching prescription with ID:', id)
        
        try {
          
          const response = await PrescriptionService.getPrescriptionById(parseInt(id))
          
          if (response.success && response.data) {
            
            const transformedPrescription = PrescriptionService.transformPrescriptionData(response.data)
            setPrescription(transformedPrescription)
            console.log('Prescription loaded successfully from API:', transformedPrescription)
            return
          }
        } catch (apiError: any) {
          console.error('Error fetching prescription:', apiError)
          
          if (apiError.response?.status === 404) {
            toast.error('Không tìm thấy đơn thuốc')
            navigate('/doctor/prescriptions')
            return
          }
          
          const errorMessage = apiError.response?.data?.message || 'Không thể tải đơn thuốc'
          toast.error(errorMessage)
          setPrescription(null)
          setError(errorMessage)
        }
        
      } catch (err: any) {
        console.error('Error fetching prescription:', err)
        
        if (err.response?.status === 404) {
          setError('Không tìm thấy đơn thuốc')
        } else if (err.response?.status === 403) {
          setError('Bạn không có quyền xem đơn thuốc này')
        } else if (err.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
        } else {
          setError(err.response?.data?.message || 'Không thể tải thông tin đơn thuốc')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPrescriptionDetail()
    }
  }, [id])

  
  const handleExportPDF = async () => {
    if (!prescription) return

    try {
      setExportingPDF(true)
      setError(null)
      setSuccessMessage(null)
      
      console.log('Exporting PDF for prescription:', prescription.id)
      
      
      const blob = await PrescriptionService.exportPrescriptionPDF(prescription.id)
      
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Prescription_${prescription.prescriptionCode}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      setSuccessMessage('Đã tải xuống PDF thành công!')
      toast.success('Đã tải xuống PDF thành công!')
      
      
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      if (error.response?.status === 404) {
        setError('Không tìm thấy đơn thuốc để xuất PDF')
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền xuất PDF cho đơn thuốc này')
      } else {
        setError(error.response?.data?.message || 'Không thể tạo PDF. Vui lòng thử lại.')
      }
    } finally {
      setExportingPDF(false)
    }
  }

  
  const handleCancelConfirm = async () => {
    if (!prescription) return

    try {
      setError(null)
      setSuccessMessage(null)
      
      const response = await PrescriptionService.cancelPrescription(prescription.id)
      
      if (response.success) {
        
        setPrescription(prev => prev ? { ...prev, status: 'CANCELLED' } : null)
        setSuccessMessage('Đã hủy đơn thuốc thành công!')
        toast.success('Đã hủy đơn thuốc thành công!')
        setCancelDialogOpen(false)
        
        
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } else {
        const errorMsg = response.message || 'Không thể hủy đơn thuốc'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('Error cancelling prescription:', error)
      if (error.response?.status === 400) {
        setError('Không thể hủy đơn thuốc đã được thanh toán')
        toast.error('Không thể hủy đơn thuốc đã được thanh toán')
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy đơn thuốc')
        toast.error('Không tìm thấy đơn thuốc')
      } else if (error.response?.status === 403) {
        setError('Bạn không có quyền hủy đơn thuốc này')
        toast.error('Bạn không có quyền hủy đơn thuốc này')
      } else {
        const errorMsg = error.response?.data?.message || 'Không thể hủy đơn thuốc. Vui lòng thử lại.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    }
  }

  
  const handleEditPrescription = () => {
    if (!prescription) return
    
    
    navigate(`/doctor/prescriptions/${prescription.id}/edit`)
  }

  
  const handleDispenseConfirm = async () => {
    if (!prescription) return

    try {
      setIsDispensing(true)
      setError(null)
      setSuccessMessage(null)

      const response = await PrescriptionService.dispensePrescription(prescription.id)

      if (response.success) {
        
        if (response.data) {
          const transformedPrescription = PrescriptionService.transformPrescriptionData(response.data)
          setPrescription(transformedPrescription)
        } else {
          setPrescription((prev) =>
            prev ? { ...prev, status: "DISPENSED" as Prescription["status"] } : null
          )
        }
        setSuccessMessage("Đã phát thuốc thành công!")
        toast.success("Đã phát thuốc thành công!")
        setDispenseDialogOpen(false)

        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      } else {
        const errorMsg = response.message || "Không thể phát thuốc"
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error("Error dispensing prescription:", error)
      if (error.response?.status === 400) {
        const errorMsg = "Không thể phát thuốc cho đơn thuốc đã được phát hoặc đã hủy"
        setError(errorMsg)
        toast.error(errorMsg)
      } else if (error.response?.status === 404) {
        const errorMsg = "Không tìm thấy đơn thuốc"
        setError(errorMsg)
        toast.error(errorMsg)
      } else if (error.response?.status === 403) {
        const errorMsg = "Bạn không có quyền phát thuốc"
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = error.response?.data?.message || "Không thể phát thuốc. Vui lòng thử lại."
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsDispensing(false)
    }
  }

  
  const getSidebarComponent = () => {
    if (!user) return DoctorSidebar
    const role = String(user.roleId || user.role || "").toLowerCase()
    switch (role) {
      case "admin":
      case "1":
        return AdminSidebar
      case "doctor":
      case "2":
        return DoctorSidebar
      case "receptionist":
      case "4":
        return ReceptionistSidebar
      default:
        return DoctorSidebar
    }
  }

  const canEdit = prescription?.status === "DRAFT" && (user?.roleId === 2) 
  
  const canCancel = prescription?.status === "DRAFT" && (user?.roleId === 4) 
  const canDispense =
    prescription?.status === "LOCKED" &&
    (user?.roleId === 1 || user?.roleId === 2) 

  
  const handlePrint = () => {
    if (!prescription) return
    printPrescription(prescription, setError)
  }

  const SidebarComponent = getSidebarComponent()
  const userName = user?.fullName || user?.email || ""

  if (!SidebarComponent) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
      </div>
    )
  }

  if (loading) {
    return (
      <SidebarComponent userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Đang tải chi tiết đơn thuốc...</p>
          </div>
        </div>
      </SidebarComponent>
    )
  }

  if (error || !prescription) {
    return (
      <SidebarComponent userName={userName}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-medium text-slate-900 mb-2">Lỗi tải dữ liệu</p>
            <p className="text-slate-600 mb-4">{error || 'Không tìm thấy đơn thuốc'}</p>
            <Button onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        </div>
      </SidebarComponent>
    )
  }

  return (
    <SidebarComponent userName={userName}>
      <div className="space-y-6">
        
        {}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/doctor/prescriptions")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chi Tiết Đơn Thuốc</h1>
              <p className="text-slate-600 mt-1">Mã đơn: {prescription.prescriptionCode}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusIcon(prescription.status)}
            {getStatusBadge(prescription.status)}
          </div>
        </div>

        {}
        {successMessage && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Thành công</p>
              <p className="text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        {}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Thông Tin Đơn Thuốc
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={exportingPDF}
                >
                  {exportingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Tải PDF
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In đơn
                </Button>
                {canEdit && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleEditPrescription}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                {canCancel && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Hủy đơn
                  </Button>
                )}
                {canDispense && (
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setDispenseDialogOpen(true)}
                    disabled={isDispensing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Phát thuốc
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Ngày tạo</p>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {formatDate(prescription.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Tổng tiền</p>
                  <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(prescription.totalAmount)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Trạng thái</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(prescription.status)}
                    {getStatusBadge(prescription.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Lần cập nhật cuối</p>
                  <p className="text-slate-900">{formatDate(prescription.updatedAt)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">ID Phiếu khám</p>
                  <p className="text-slate-900">#{prescription.visitId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Số loại thuốc</p>
                  <p className="text-slate-900 font-semibold">{prescription.details.length} loại</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Thông Tin Bệnh Nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Họ và tên</p>
                  <p className="text-lg font-semibold text-slate-900">{prescription.patient.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tuổi</p>
                    <p className="text-slate-900">{calculateAge(prescription.patient.dateOfBirth)} tuổi</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Giới tính</p>
                    <p className="text-slate-900">
                      {prescription.patient.gender === 'MALE' ? 'Nam' : 
                       prescription.patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">CCCD</p>
                  <p className="text-slate-900">{prescription.patient.cccd || 'Chưa cập nhật'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Số điện thoại</p>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    {prescription.patient.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    {prescription.patient.email || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Địa chỉ</p>
                  <p className="text-slate-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{prescription.patient.address || 'Chưa cập nhật'}</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Thông Tin Bác Sĩ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Họ và tên</p>
                  <p className="text-lg font-semibold text-slate-900">{prescription.doctor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chuyên khoa</p>
                  <p className="text-slate-900">{prescription.doctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">Học vị</p>
                  <p className="text-slate-900">{prescription.doctor.degree || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chức vụ</p>
                  <p className="text-slate-900">{prescription.doctor.position || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Thông Tin Khám Bệnh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Chẩn đoán</p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-slate-900 font-medium">{prescription.visit?.diagnosis || 'Chưa có chẩn đoán'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Triệu chứng</p>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-slate-900">{prescription.visit?.symptoms || 'Chưa ghi nhận triệu chứng'}</p>
                  </div>
                </div>
              </div>
              
              {prescription.visit?.vitalSigns && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-3">Chỉ số sinh hiệu</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Huyết áp</p>
                      <p className="text-lg font-bold text-slate-900">{prescription.visit?.vitalSigns?.bloodPressure}</p>
                      <p className="text-xs text-slate-500">mmHg</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Nhịp tim</p>
                      <p className="text-lg font-bold text-slate-900">{prescription.visit?.vitalSigns?.heartRate}</p>
                      <p className="text-xs text-slate-500">bpm</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Nhiệt độ</p>
                      <p className="text-lg font-bold text-slate-900">{prescription.visit?.vitalSigns?.temperature}</p>
                      <p className="text-xs text-slate-500">°C</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">Cân nặng</p>
                      <p className="text-lg font-bold text-slate-900">{prescription.visit?.vitalSigns?.weight}</p>
                      <p className="text-xs text-slate-500">kg</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              Chi Tiết Thuốc ({prescription.details.length} loại)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-slate-700">STT</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Tên thuốc</th>
                    <th className="text-left p-3 font-semibold text-slate-700">SL</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Đơn vị</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Đơn giá</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Sáng</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Trưa</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Chiều</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Tối</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.details.map((detail, index) => (
                    <tr key={detail.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-center font-medium text-slate-600">
                        {index + 1}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-slate-900">{detail.medicineName}</p>
                          {detail.instruction && (
                            <p className="text-sm text-slate-600 mt-1">{detail.instruction}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold text-blue-600">
                        {detail.quantity}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {detail.unit}
                      </td>
                      <td className="p-3 text-right text-slate-900">
                        {formatCurrency(detail.unitPrice)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${detail.dosageMorning > 0 ? 'bg-yellow-100 text-yellow-800' : 'text-gray-400'}`}>
                          {detail.dosageMorning || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${detail.dosageNoon > 0 ? 'bg-orange-100 text-orange-800' : 'text-gray-400'}`}>
                          {detail.dosageNoon || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${detail.dosageAfternoon > 0 ? 'bg-blue-100 text-blue-800' : 'text-gray-400'}`}>
                          {detail.dosageAfternoon || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-sm ${detail.dosageEvening > 0 ? 'bg-purple-100 text-purple-800' : 'text-gray-400'}`}>
                          {detail.dosageEvening || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {formatCurrency(detail.quantity * detail.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={9} className="p-3 text-right font-bold text-slate-900">
                      Tổng cộng:
                    </td>
                    <td className="p-3 text-right font-bold text-green-600 text-lg">
                      {formatCurrency(prescription.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {}
        {prescription.note && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Ghi Chú Của Bác Sĩ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-slate-900 leading-relaxed">{prescription.note}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        <div className="flex gap-4 justify-end pb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/doctor/prescriptions")}
          >
            Quay lại danh sách
          </Button>
          
          {prescription.status === 'DRAFT' && (
            <>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setCancelDialogOpen(true)}
              >
                Hủy đơn thuốc
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleEditPrescription}
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa đơn thuốc
              </Button>
            </>
          )}
        </div>

        {}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận hủy đơn thuốc</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy đơn thuốc <strong>{prescription.prescriptionCode}</strong>? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelConfirm}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {}
        <Dialog open={dispenseDialogOpen} onOpenChange={setDispenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận phát thuốc</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn phát thuốc cho đơn thuốc <strong>{prescription.prescriptionCode}</strong>?
                <br />
                <span className="font-semibold text-green-600">
                  Tổng tiền: {formatCurrency(prescription.totalAmount)}
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDispenseDialogOpen(false)}
                disabled={isDispensing}
              >
                Hủy
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleDispenseConfirm}
                disabled={isDispensing}
              >
                {isDispensing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Xác nhận phát thuốc
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarComponent>
  )
}