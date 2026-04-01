"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../features/auth/context/authContext"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Loader2, DollarSign, Calendar, Download, Eye, FileText, Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { PayrollService, type Payroll } from "../features/finance/services/payroll.service"
import AdminSidebar from "../components/layout/sidebar/admin"
import DoctorSidebar from "../components/layout/sidebar/doctor"
import ReceptionistSidebar from "../components/layout/sidebar/recep"
import { TablePagination } from "../components/shared/TablePagination"

export default function MyPayrollsPage() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchMyPayrolls()
  }, [])

  const fetchMyPayrolls = async () => {
    try {
      setIsLoading(true)
      const response = await PayrollService.getMyPayrolls()
      setPayrolls(response || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch sử lương")
      setPayrolls([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async (payroll: Payroll) => {
    try {
      const blob = await PayrollService.exportPayrollPDF(payroll.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payroll-${payroll.month}-${payroll.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Xuất PDF thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xuất PDF")
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
      APPROVED: { label: "Đã phê duyệt", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-500/10 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  
  const totalSalary = payrolls.reduce((sum, p) => {
    return sum + (p.totalSalary || 0)
  }, 0)
  const totalPaid = payrolls.filter((p) => p.status === "PAID").reduce((sum, p) => {
    return sum + (p.totalSalary || 0)
  }, 0)
  const pendingSalary = payrolls.filter((p) => p.status !== "PAID").reduce((sum, p) => {
    return sum + (p.totalSalary || 0)
  }, 0)

  
  const totalPages = Math.ceil(payrolls.length / itemsPerPage)
  const paginatedPayrolls = payrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      {}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 ring-1 ring-white/50">
             <Wallet className="h-7 w-7 text-white" />
        </div>
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lịch sử lương của tôi</h1>
           <p className="text-slate-500 font-medium">Xem và quản lý lịch sử lương của bạn</p>
        </div>
      </div>

      <div className="space-y-6">
        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng lương</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {}
              
              {}
              <div className="text-3xl font-bold text-slate-900">{(totalSalary || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Đã thanh toán</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {}
              
              {}
              <div className="text-3xl font-bold text-slate-900">{(totalPaid || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Chờ thanh toán</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              {}
              
              {}
              <div className="text-3xl font-bold text-slate-900">{(pendingSalary || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-xl font-bold text-slate-800">Danh sách lương</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : payrolls.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-slate-50/30">
                <Wallet className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="font-medium">Chưa có lịch sử lương</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Tháng</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Lương cơ bản</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Hệ số</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Kinh nghiệm</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Hoa hồng</th>
                        <th className="text-right py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Tổng lương</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Trạng thái</th>
                        <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedPayrolls.map((payroll) => (
                        <tr
                          key={payroll.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-slate-700">{payroll.month}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-slate-600">
                            {(typeof payroll.baseSalary === 'number' ? payroll.baseSalary : parseFloat(payroll.baseSalary || '0') || 0).toLocaleString()} <span className="text-[10px] text-slate-400">VND</span>
                          </td>
                          <td className="py-4 px-6">
                             <Badge variant="secondary" className="bg-slate-100 text-slate-700">{payroll.coefficient}</Badge>
                          </td>
                          <td className="py-4 px-6 text-slate-600">{payroll.experience} năm</td>
                          <td className="py-4 px-6 text-slate-600">
                            {payroll.commission ? `${(typeof payroll.commission === 'number' ? payroll.commission : parseFloat(payroll.commission || '0') || 0).toLocaleString()}` : "-"}
                          </td>
                          <td className="py-4 px-6 text-right">
                             <span className="font-bold text-emerald-600 text-base">
                                {(payroll.totalSalary || 0).toLocaleString()}
                             </span>
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(payroll.status)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" asChild>
                                <Link to={`/my-payrolls/${payroll.id}`} title="Xem chi tiết">
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleExportPDF(payroll)}
                                title="Tải PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showingCount={paginatedPayrolls.length}
                  totalCount={payrolls.length}
                  resourceName="phiếu lương"
                  className="bg-slate-50/30"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "doctor" || role === "4") {
    return <DoctorSidebar>{content}</DoctorSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  }

  return null
}
