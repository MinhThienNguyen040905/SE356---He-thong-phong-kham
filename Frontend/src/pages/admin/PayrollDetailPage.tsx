"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Download, CheckCircle, DollarSign, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { PayrollService, type Payroll } from "../../features/finance/services/payroll.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

export default function PayrollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPayroll()
    }
  }, [id])

  const fetchPayroll = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await PayrollService.getPayrollById(Number(id))
      setPayroll(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tải thông tin bảng lương")
      }
      navigate("/admin/salary")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!id) return
    try {
      setIsExporting(true)
      const blob = await PayrollService.exportPayrollPDF(Number(id))
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BangLuong-${payroll?.employee?.employeeCode || id}-${payroll?.month || ''}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất PDF thành công")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xuất PDF")
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setIsApproving(true)
      const updated = await PayrollService.approvePayroll(Number(id))
      setPayroll(updated)
      setIsApproveDialogOpen(false)
      toast.success("Phê duyệt bảng lương thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể phê duyệt bảng lương")
      }
    } finally {
      setIsApproving(false)
    }
  }

  const handlePay = async () => {
    if (!id) return
    try {
      setIsPaying(true)
      const updated = await PayrollService.payPayroll(Number(id))
      setPayroll(updated)
      setIsPayDialogOpen(false)
      toast.success("Đánh dấu đã thanh toán thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể đánh dấu đã thanh toán")
      }
    } finally {
      setIsPaying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      APPROVED: { label: "Đã phê duyệt", className: "bg-blue-50 text-blue-700 border-blue-200" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    )
  }

  if (!payroll) {
    return (
      <AdminSidebar>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin bảng lương</p>
          <Button onClick={() => navigate("/admin/salary")} className="mt-4">
            Quay lại
          </Button>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="space-y-8 pb-10">
        {}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" className="-ml-4 text-slate-600 hover:text-slate-900" onClick={() => navigate("/admin/salary")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách lương
          </Button>
          
          <div className="flex flex-wrap gap-2">
            {payroll.status === 'DRAFT' && (
              <Button
                onClick={() => setIsApproveDialogOpen(true)}
                disabled={isApproving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang phê duyệt...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phê duyệt lương
                  </>
                )}
              </Button>
            )}
            {payroll.status === 'APPROVED' && (
              <Button
                onClick={() => setIsPayDialogOpen(true)}
                disabled={isPaying}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Xác nhận thanh toán
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="border-slate-300">
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Xuất PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Phiếu Lương Tháng {payroll.month}</h1>
                {getStatusBadge(payroll.status)}
              </div>
              <p className="text-slate-500">Mã phiếu: <span className="font-mono text-slate-700 font-medium">#{payroll.id.toString().padStart(6, '0')}</span></p>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl overflow-hidden shrink-0">
                  {payroll.employee?.avatar ? (
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${payroll.employee.avatar}`} 
                      alt={payroll.employee.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    payroll.employee?.fullName?.charAt(0) || "NV"
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-900">{payroll.employee?.fullName}</p>
                  <p className="text-slate-500 text-sm">{payroll.employee?.employeeCode} • {payroll.employee?.role === 'doctor' ? 'Bác sĩ' : 'Nhân viên'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Thực nhận</span>
              <span className="text-4xl font-bold text-emerald-600 tracking-tight">
                {payroll.netSalary?.toLocaleString("vi-VN")} <span className="text-xl text-emerald-500 font-medium">VNĐ</span>
              </span>
              <span className="text-xs text-slate-400 mt-1">
                Đã trừ các khoản phạt & khấu trừ
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-50 border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-slate-500">Tổng thu nhập (Gross)</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{payroll.grossSalary?.toLocaleString("vi-VN")} VNĐ</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-red-500">Khấu trừ & Phạt</p>
              <p className="text-2xl font-bold text-red-700 mt-2">-{payroll.penaltyAmount?.toLocaleString("vi-VN")} VNĐ</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 shadow-sm ring-1 ring-blue-50">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-blue-500">Thưởng & Hoa hồng</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {(payroll.commission || 0).toLocaleString("vi-VN")} VNĐ
              </p>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Chi tiết thu nhập
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">Lương theo hệ số</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Lương cơ sở: {payroll.baseSalary?.toLocaleString("vi-VN")} x Hệ số: {payroll.coefficient}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-900">
                        {payroll.roleSalary?.toLocaleString("vi-VN")} VNĐ
                      </td>
                    </tr>
                    
                    {}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">Thưởng thâm niên</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {payroll.experience} năm kinh nghiệm (đã tính trong hệ số)
                        </p>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-900">
                        Included
                      </td>
                    </tr>

                    {}
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">Thưởng & Hoa hồng</p>
                        {payroll.employee?.role === 'doctor' ? (
                          <p className="text-slate-500 text-xs mt-1">
                            Hoa hồng khám bệnh (Tỉ lệ: {(payroll.commissionRate || 0) * 100}%)
                          </p>
                        ) : (
                          <p className="text-slate-500 text-xs mt-1">
                            Các khoản thưởng hiệu quả công việc
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-emerald-600">
                        {payroll.commission && payroll.commission > 0 
                          ? `+${payroll.commission.toLocaleString("vi-VN")} VNĐ`
                          : "0 VNĐ"
                        }
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className="py-3 px-6 font-semibold text-slate-700">Tổng thu nhập</td>
                      <td className="py-3 px-6 text-right font-bold text-slate-900">
                        {payroll.grossSalary?.toLocaleString("vi-VN")} VNĐ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {}
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500 text-xs font-bold">!</div>
                   Khấu trừ & Phạt
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                       <td className="py-4 px-6">
                         <p className="font-medium text-slate-900">Phạt nghỉ quá quy định</p>
                         <div className="text-slate-500 text-xs mt-1 space-y-1">
                           <p>Số ngày nghỉ trong tháng: {payroll.daysOff} ngày</p>
                           <p>Giới hạn năm: {payroll.allowedDaysOff} ngày</p>
                           <p className="text-red-500 font-medium">Số ngày phạt: {payroll.penaltyDaysOff} ngày</p>
                         </div>
                       </td>
                       <td className="py-4 px-6 text-right font-medium text-red-600">
                         -{payroll.penaltyAmount?.toLocaleString("vi-VN")} VNĐ
                       </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td className="py-3 px-6 font-semibold text-slate-700">Tổng khấu trừ</td>
                      <td className="py-3 px-6 text-right font-bold text-red-600">
                        -{payroll.penaltyAmount?.toLocaleString("vi-VN")} VNĐ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200">
               <CardHeader className="pb-3">
                 <CardTitle className="text-base font-semibold text-slate-800">Thông tin xử lý</CardTitle>
               </CardHeader>
               <CardContent className="space-y-5">
                  <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                    {}
                    <div className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></div>
                      <p className="text-sm font-medium text-slate-900">Đã tạo bảng lương</p>
                      <p className="text-xs text-slate-500">{format(new Date(payroll.createdAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
                    </div>

                    {}
                     <div className="relative">
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${payroll.approvedAt ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                      <p className={`text-sm font-medium ${payroll.approvedAt ? 'text-slate-900' : 'text-slate-400'}`}>Phê duyệt</p>
                      {payroll.approvedAt ? (
                         <p className="text-xs text-slate-500">{format(new Date(payroll.approvedAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Đang chờ...</p>
                      )}
                    </div>

                    {}
                     <div className="relative">
                      <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${payroll.paidAt ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                      <p className={`text-sm font-medium ${payroll.paidAt ? 'text-slate-900' : 'text-slate-400'}`}>Thanh toán</p>
                      {payroll.paidAt ? (
                         <p className="text-xs text-slate-500">{format(new Date(payroll.paidAt), "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Đang chờ...</p>
                      )}
                    </div>
                  </div>
               </CardContent>
            </Card>
             <Card className="bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                <CardContent className="p-4 text-center">
                   <p className="text-xs text-slate-500 text-center">
                     Mọi thắc mắc về lương thưởng vui lòng liên hệ phòng nhân sự hoặc quản trị viên hệ thống.
                   </p>
                </CardContent>
             </Card>
          </div>
        </div>

        {}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận phê duyệt</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn phê duyệt bảng lương này? Sau khi phê duyệt, nhân viên sẽ nhận được thông báo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleApprove} disabled={isApproving}>
                {isApproving ? "Đang xử lý..." : "Phê duyệt ngay"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận thanh toán</DialogTitle>
              <DialogDescription>
                Xác nhận đã chuyển khoản thanh toán lương cho nhân viên này? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>Hủy</Button>
              <Button onClick={handlePay} disabled={isPaying} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isPaying ? "Đang xử lý..." : "Xác nhận đã trả"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
