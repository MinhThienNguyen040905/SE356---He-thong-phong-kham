"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import { ArrowLeft, Download, User, FileText, Activity, Check, Loader2, Edit, DollarSign } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { InvoiceService, type Invoice, PaymentStatus, PaymentMethod } from "../../features/finance/services/invoice.service"
import AdminSidebar from "../../components/layout/sidebar/admin"
import DoctorSidebar from "../../components/layout/sidebar/doctor"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import PatientSidebar from "../../components/layout/sidebar/patient"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { formatVND } from "../../utils/currency"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isLoadingPayment, setIsLoadingPayment] = useState(false)
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)

  
  const [editDiscount, setEditDiscount] = useState("")
  const [editNote, setEditNote] = useState("")

  
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentNote, setPaymentNote] = useState("")

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const response = await InvoiceService.getInvoiceById(Number(id))
        if (response.success && response.data) {
          setInvoice(response.data)
          setEditDiscount(response.data.discount.toString())
          setEditNote(response.data.note || "")
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin hóa đơn")
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoice()
  }, [id, navigate])

  const handleExportPDF = async () => {
    if (!id) return
    try {
      setIsExporting(true)
      const blob = await InvoiceService.exportInvoicePDF(Number(id))
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `HoaDon-${invoice?.invoiceCode || id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất PDF thành công")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xuất PDF")
    } finally {
      setIsExporting(false)
    }
  }

  const handleUpdateInvoice = async () => {
    if (!id || !invoice) return
    try {
      setIsLoadingUpdate(true)
      const response = await InvoiceService.updateInvoice(Number(id), {
        discount: parseFloat(editDiscount) || 0,
        note: editNote || undefined,
      })
      if (response.success && response.data) {
        setInvoice(response.data)
        setIsEditDialogOpen(false)
        toast.success("Cập nhật hóa đơn thành công")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật hóa đơn")
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const handleAddPayment = async () => {
    if (!id || !invoice) return
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ")
      return
    }
    try {
      setIsLoadingPayment(true)
      const response = await InvoiceService.addPayment(Number(id), {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        reference: paymentReference || undefined,
        note: paymentNote || undefined,
      })
      if (response.success && response.data) {
        setInvoice(response.data)
        setIsPaymentDialogOpen(false)
        setPaymentAmount("")
        setPaymentReference("")
        setPaymentNote("")
        toast.success("Thêm thanh toán thành công")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể thêm thanh toán")
    } finally {
      setIsLoadingPayment(false)
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
      UNPAID: { label: "Chưa thanh toán", className: "bg-red-50 text-red-700 border-red-200" },
      PARTIALLY_PAID: { label: "Thanh toán một phần", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    }
    const statusInfo = statusMap[status] || { label: status, className: "bg-gray-50 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      CASH: "Tiền mặt",
      BANK_TRANSFER: "Chuyển khoản",
      QR_CODE: "QR Code",
    }
    return labels[method] || method
  }

  if (isLoading) {
    const loadingContent = (
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    
    if (role === "admin" || role === "1") {
      return <AdminSidebar>{loadingContent}</AdminSidebar>
    } else if (role === "doctor" || role === "4") {
      return <DoctorSidebar>{loadingContent}</DoctorSidebar>
    } else if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar>{loadingContent}</ReceptionistSidebar>
    } else if (role === "patient" || role === "3") {
      return <PatientSidebar>{loadingContent}</PatientSidebar>
    }
    return null
  }

  if (!invoice) {
    const errorContent = (
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin hóa đơn</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    )
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    
    if (role === "admin" || role === "1") {
      return <AdminSidebar>{errorContent}</AdminSidebar>
    } else if (role === "doctor" || role === "4") {
      return <DoctorSidebar>{errorContent}</DoctorSidebar>
    } else if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar>{errorContent}</ReceptionistSidebar>
    } else if (role === "patient" || role === "3") {
      return <PatientSidebar>{errorContent}</PatientSidebar>
    }
    return null
  }

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  
  const canEdit = user?.roleId === 1 || user?.roleId === 2 
  const remainingAmount = invoice.totalAmount - invoice.paidAmount
  const medicineItems = invoice.items?.filter(item => item.itemType === "MEDICINE") || []
  const examinationItems = invoice.items?.filter(item => item.itemType === "EXAMINATION") || []

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      <div className="space-y-6">
        {}
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {}
        <Card className="border-0 shadow-xl shadow-slate-900/5 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {getStatusBadge(invoice.paymentStatus)}
                </div>
                <h1 className="text-4xl font-bold mb-2">Chi tiết hóa đơn</h1>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{invoice.invoiceCode}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{invoice.visit?.appointment?.patientName || invoice.patient?.fullName || "N/A"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>
                      {new Date(invoice.createdAt).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setIsEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Xuất PDF
                </Button>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-4 divide-x bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Mã hóa đơn</p>
                  <p className="text-lg font-bold text-slate-900">
                    {invoice.invoiceCode}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Bệnh nhân</p>
                  <p className="text-lg font-bold text-slate-900">
                    {invoice.visit?.appointment?.patientName || invoice.patient?.fullName || "N/A"}
                  </p>
                  {invoice.patient?.patientCode && (
                    <p className="text-xs text-slate-500 mt-1">
                      {invoice.patient.patientCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tổng tiền</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatVND(invoice.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Đã thanh toán</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatVND(invoice.paidAmount)}
                  </p>
                  {remainingAmount > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Còn lại: {formatVND(remainingAmount)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Thông tin bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                <p className="text-sm font-medium text-slate-900">
                  {invoice.visit?.appointment?.patientName || invoice.patient?.fullName || "N/A"}
                </p>
              </div>
              {invoice.patient?.patientCode && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Mã bệnh nhân</p>
                  <p className="text-sm font-medium text-slate-900">
                    {invoice.patient.patientCode}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Thông tin bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                <p className="text-sm font-medium text-slate-900">
                  {invoice.doctor?.fullName || "N/A"}
                </p>
              </div>
              {invoice.visit?.diagnosis && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Chẩn đoán</p>
                  <p className="text-sm text-slate-900">
                    {invoice.visit.diagnosis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Chi tiết thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
                {}
                {examinationItems.length > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Phí khám bệnh</span>
                    <span className="font-semibold text-slate-900">
                      {formatVND(invoice.examinationFee)}
                    </span>
                  </div>
                )}

                {}
                {medicineItems.length > 0 && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="font-medium text-slate-900 mb-3">Danh sách thuốc:</div>
                    {medicineItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">
                            {item.medicineName || item.description || "Thuốc"}
                          </div>
                          <div className="text-sm text-slate-500">
                            SL: {item.quantity} • Don gia: {formatVND(item.unitPrice)}
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">
                          {formatVND(item.subtotal)}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 pt-3 border-t">
                      <span className="text-slate-600">Tổng tiền thuốc</span>
                      <span className="font-semibold text-slate-900">
                        {formatVND(invoice.medicineTotalAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {}
                {invoice.discount > 0 && (
                  <div className="flex justify-between py-2 text-red-600">
                    <span>Giảm giá</span>
                    <span className="font-semibold">-{formatVND(invoice.discount)}</span>
                  </div>
                )}

                {}
                {invoice.paymentStatus !== PaymentStatus.UNPAID && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tổng cộng</span>
                      <span className="font-semibold text-slate-900">
                        {formatVND(invoice.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Đã thanh toán</span>
                      <span className="font-semibold text-emerald-600">
                        {formatVND(invoice.paidAmount)}
                      </span>
                    </div>
                    {remainingAmount > 0 && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-700 font-medium">Còn lại</span>
                        <span className="font-bold text-amber-600">
                          {formatVND(remainingAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {invoice.paymentStatus === PaymentStatus.UNPAID && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatVND(invoice.totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {}
              {canEdit && invoice.paymentStatus !== PaymentStatus.PAID && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    size="lg"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Thêm thanh toán
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>

        {}
        {invoice.payments && invoice.payments.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-600" />
                Lịch sử thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center py-3 border-b last:border-0">
                    <div>
                      <div className="font-medium text-slate-900">
                        {new Intl.NumberFormat("vi-VN").format(parseFloat(payment.amount.toString()))} VND
                      </div>
                      <div className="text-sm text-slate-500">
                        {getPaymentMethodLabel(payment.paymentMethod)} -{" "}
                        {new Date(payment.paymentDate).toLocaleString("vi-VN")}
                      </div>
                      {payment.reference && (
                        <div className="text-xs text-slate-400 mt-1">Mã tham chiếu: {payment.reference}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {invoice.note && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Ghi chú
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-slate-700">{invoice.note}</p>
            </CardContent>
          </Card>
        )}

        {}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
            {}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white mb-1">Chỉnh sửa hóa đơn</DialogTitle>
                  <DialogDescription className="text-blue-100 text-sm">
                    Cập nhật giảm giá và ghi chú cho hóa đơn #{invoice?.invoiceCode}
                  </DialogDescription>
                </div>
              </div>
            </div>

            {}
            <div className="p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
              {}
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Giảm giá (VND)
                </Label>
                <div className="relative">
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    placeholder="0"
                    className="h-12 pl-4 pr-16 text-lg font-semibold border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl bg-white shadow-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VND</span>
                </div>
                <p className="text-xs text-slate-500 pl-1">Nhập số tiền giảm giá áp dụng cho hóa đơn</p>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Ghi chú
                </Label>
                <Textarea
                  id="note"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Nhập ghi chú cho hóa đơn..."
                  rows={4}
                  className="resize-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>

            {}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditDialogOpen(false)}
                className="h-10 px-5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={handleUpdateInvoice} 
                disabled={isLoadingUpdate}
                className="h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoadingUpdate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
            {}
            <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold text-white mb-1">Thêm thanh toán</DialogTitle>
                  <DialogDescription className="text-emerald-100 text-sm">
                    Hóa đơn #{invoice?.invoiceCode}
                  </DialogDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-200 uppercase tracking-wider font-medium">Còn lại</p>
                  <p className="text-2xl font-bold text-white">{remainingAmount.toLocaleString("vi-VN")} <span className="text-sm font-normal text-emerald-200">VND</span></p>
                </div>
              </div>
            </div>

            {}
            <div className="p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
              {}
              <div className="space-y-2">
                <Label htmlFor="paymentAmount" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  Số tiền thanh toán <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="paymentAmount"
                    type="number"
                    min="0.01"
                    max={remainingAmount}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Nhập số tiền"
                    className="h-12 pl-4 pr-16 text-lg font-semibold border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl bg-white shadow-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">VND</span>
                </div>
                {}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(remainingAmount.toString())}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                  >
                    Thanh toán hết
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentAmount((remainingAmount / 2).toFixed(0))}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                  >
                    50%
                  </button>
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Phương thức thanh toán <span className="text-rose-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl bg-white shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value={PaymentMethod.CASH} className="py-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span className="font-medium">Tiền mặt</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethod.BANK_TRANSFER} className="py-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Chuyển khoản ngân hàng</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethod.QR_CODE} className="py-3 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="font-medium">QR Code</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="paymentReference" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-500" />
                  Mã tham chiếu
                </Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Mã giao dịch, số hóa đơn..."
                  className="h-11 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl bg-white shadow-sm"
                />
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="paymentNote" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-500" />
                  Ghi chú
                </Label>
                <Textarea
                  id="paymentNote"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Thêm ghi chú cho giao dịch..."
                  rows={3}
                  className="resize-none border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>

            {}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={() => setIsPaymentDialogOpen(false)}
                className="h-10 px-5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={handleAddPayment} 
                disabled={isLoadingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="h-10 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoadingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    )

  
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "doctor" || role === "4") {
    return <DoctorSidebar>{content}</DoctorSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  } else if (role === "patient" || role === "3") {
    return <PatientSidebar>{content}</PatientSidebar>
  }

  return null
}
