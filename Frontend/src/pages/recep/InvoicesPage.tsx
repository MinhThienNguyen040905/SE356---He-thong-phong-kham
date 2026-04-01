"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../features/auth/context/authContext"
import { Search, Eye, Loader2, SlidersHorizontal, X, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { InvoiceService, type Invoice, PaymentStatus } from "../../features/finance/services/invoice.service"

import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { format } from "date-fns"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    invoiceCode: "",
    paymentStatus: "all" as "all" | "UNPAID" | "PARTIALLY_PAID" | "PAID",
    patientId: "",
    doctorId: "",
    totalMin: "",
    totalMax: "",
    createdFrom: "",
    createdTo: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, pagination.page])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (statusFilter !== "all") {
        filters.paymentStatus = statusFilter as PaymentStatus
      }
      const response = await InvoiceService.getInvoices(filters)
      if (response.success && response.data) {
        setInvoices(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách hóa đơn")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      const filters: any = {
        page: 1,
        limit: pagination.limit,
      }

      if (advancedFilters.keyword) filters.keyword = advancedFilters.keyword
      if (advancedFilters.invoiceCode) filters.invoiceCode = advancedFilters.invoiceCode
      if (advancedFilters.paymentStatus && advancedFilters.paymentStatus !== "all") {
        filters.paymentStatus = advancedFilters.paymentStatus
      }
      if (advancedFilters.patientId) filters.patientId = parseInt(advancedFilters.patientId)
      if (advancedFilters.doctorId) filters.doctorId = parseInt(advancedFilters.doctorId)
      if (advancedFilters.totalMin) filters.totalMin = parseFloat(advancedFilters.totalMin)
      if (advancedFilters.totalMax) filters.totalMax = parseFloat(advancedFilters.totalMax)
      if (advancedFilters.createdFrom) filters.createdFrom = advancedFilters.createdFrom
      if (advancedFilters.createdTo) filters.createdTo = advancedFilters.createdTo

      const response = await InvoiceService.getInvoices(filters)
      setInvoices(response.data || [])
      setPagination(response.pagination || pagination)
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${response.data?.length || 0} hóa đơn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm hóa đơn")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInvoices()
      return
    }

    try {
      setIsSearching(true)
      const response = await InvoiceService.getInvoices({
        keyword: searchQuery,
        paymentStatus: statusFilter !== "all" ? (statusFilter as PaymentStatus) : undefined,
        page: 1,
        limit: pagination.limit,
      })
      setInvoices(response.data || [])
      setPagination(response.pagination || pagination)
      toast.success(`Tìm thấy ${response.data?.length || 0} hóa đơn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm hóa đơn")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      invoiceCode: "",
      paymentStatus: "all",
      patientId: "",
      doctorId: "",
      totalMin: "",
      totalMax: "",
      createdFrom: "",
      createdTo: "",
    })
    fetchInvoices()
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { label: string; className: string; icon: any }> = {
      PAID: { 
        label: "Đã thanh toán", 
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20",
        icon: CheckCircle2
      },
      PARTIALLY_PAID: { 
        label: "Thanh toán một phần", 
        className: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20",
        icon: Clock
      },
      UNPAID: { 
        label: "Chờ thanh toán", 
        className: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20",
        icon: AlertCircle
      },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-50 text-gray-700 border-gray-200", icon: AlertCircle }
    const Icon = statusInfo.icon
    return (
      <Badge variant="outline" className={`py-1 px-2.5 flex items-center gap-1.5 font-bold rounded-lg ${statusInfo.className} whitespace-nowrap`}>
        <Icon className="w-3.5 h-3.5" />
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user) return null
  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="container mx-auto px-6 py-8 max-w-[1600px]">
        {}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Quản lý hóa đơn</h1>
            </div>
            <p className="text-slate-500 text-lg ml-15 font-medium opacity-80">Danh sách và theo dõi hóa đơn thanh toán bệnh nhân</p>
          </div>
          
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
            <Button
              variant={statusFilter === "all" ? "default" : "ghost"}
              className={`rounded-xl px-5 transition-all duration-200 ${statusFilter === 'all' ? 'bg-indigo-600 shadow-md shadow-indigo-100' : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
              onClick={() => { setStatusFilter("all"); setPagination({ ...pagination, page: 1 }) }}
            >
              Tất cả
            </Button>
            <Button
              variant={statusFilter === PaymentStatus.PAID ? "default" : "ghost"}
              className={`rounded-xl px-5 transition-all duration-200 ${statusFilter === PaymentStatus.PAID ? 'bg-emerald-600 shadow-md shadow-emerald-100' : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'}`}
              onClick={() => { setStatusFilter(PaymentStatus.PAID); setPagination({ ...pagination, page: 1 }) }}
            >
              Đã thanh toán
            </Button>
            <Button
              variant={statusFilter === PaymentStatus.UNPAID ? "default" : "ghost"}
              className={`rounded-xl px-5 transition-all duration-200 ${statusFilter === PaymentStatus.UNPAID ? 'bg-rose-600 shadow-md shadow-rose-100' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'}`}
              onClick={() => { setStatusFilter(PaymentStatus.UNPAID); setPagination({ ...pagination, page: 1 }) }}
            >
              Chờ thanh toán
            </Button>
          </div>
        </div>

        {}
        <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 mb-8 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <Input
                  className="pl-12 h-12 bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl text-base shadow-inner transition-all"
                  placeholder="Tìm theo tên bệnh nhân, mã hóa đơn, mã bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-12 border-slate-200 rounded-xl px-6 font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Nâng cao
                </Button>
                <Button
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 font-bold shadow-lg shadow-indigo-100 group transition-all"
                  onClick={handleQuickSearch}
                  disabled={isSearching}
                >
                  {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                  <span className="ml-2">Tìm kiếm</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white px-8 py-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-extrabold text-slate-800">Danh sách hóa đơn</CardTitle>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Tổng cộng: {pagination.total} bản ghi</p>
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
                <p className="text-slate-500 font-medium">Đang tải dữ liệu hóa đơn...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                   <FileText className="h-10 w-10 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Không tìm thấy hóa đơn</h3>
                  <p className="text-slate-400 max-w-xs mx-auto">Vui lòng thử lại với các tiêu chí tìm kiếm khác hoặc kiểm tra lại bộ lọc.</p>
                </div>
                <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} className="mt-2 rounded-xl">Làm mới bộ lọc</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mã hóa đơn</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bệnh nhân</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bác sĩ</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Tổng tiền</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                        <td className="py-3 px-4">
                          <span className="font-extrabold text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all whitespace-nowrap">
                            {invoice.invoiceCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                              {invoice.patient?.fullName?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight whitespace-nowrap">{invoice.visit?.appointment?.patientName || invoice.patient?.fullName || "N/A"}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {invoice.patient?.patientCode || "#---"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="text-slate-600 font-bold text-sm whitespace-nowrap">BS. {invoice.doctor?.fullName || "N/A"}</div>
                        </td>
                        <td className="py-3 px-4">
                           <div className="text-slate-500 font-medium text-sm">{format(new Date(invoice.createdAt), "dd/MM/yyyy")}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-extrabold text-slate-900">{parseFloat(invoice.totalAmount.toString()).toLocaleString("vi-VN")} <span className="text-[10px] text-slate-400 ml-0.5 uppercase tracking-tighter">VND</span></div>
                          {invoice.paidAmount > 0 && invoice.paymentStatus !== 'PAID' && (
                             <div className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5">Đã thu: {parseFloat(invoice.paidAmount.toString()).toLocaleString("vi-VN")} VND</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                           {getStatusBadge(invoice.paymentStatus)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all" asChild>
                            <Link to={`/invoices/${invoice.id}`}>
                              <Eye className="h-5 w-5 text-indigo-600" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 bg-slate-50/30 border-t border-slate-100 gap-4">
                <div className="text-sm font-bold text-slate-500">
                  Trang <span className="text-indigo-600">{pagination.page}</span> trên <span className="text-slate-900">{pagination.totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 px-6 font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-40"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 px-6 font-bold text-slate-600 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-40"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
          <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-indigo-600 px-8 py-6 text-white text-center sm:text-left">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight">Bộ lọc nâng cao</DialogTitle>
                <DialogDescription className="text-indigo-100 opacity-90 font-medium">
                  Tinh chỉnh tìm kiếm hóa đơn theo các tiêu chí chi tiết
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Từ khóa</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="Tên bệnh nhân, mã khám..."
                    value={advancedFilters.keyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mã hóa đơn</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="VD: INV-123"
                    value={advancedFilters.invoiceCode}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, invoiceCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Trạng thái thanh toán</Label>
                  <Select
                    value={advancedFilters.paymentStatus}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, paymentStatus: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">Thanh toán một phần</SelectItem>
                      <SelectItem value="UNPAID">Chờ thanh toán</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Mã bệnh nhân</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="Nhập ID bệnh nhân"
                    value={advancedFilters.patientId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, patientId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Từ ngày</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    type="date"
                    value={advancedFilters.createdFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Đến ngày</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    type="date"
                    value={advancedFilters.createdTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="bg-slate-50/80 px-8 py-5 flex items-center justify-between border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={clearAdvancedSearch}
                className="rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
              <Button 
                onClick={handleAdvancedSearch} 
                disabled={isSearching}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 font-bold shadow-lg shadow-indigo-100"
              >
                {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Áp dụng bộ lọc
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  }

  return null
}
