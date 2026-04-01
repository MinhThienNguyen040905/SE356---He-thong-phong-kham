"use client"

import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { Input } from "../../components/ui/input"
import {
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
  Receipt,
  Clock,
} from "lucide-react";
import { toast } from "sonner"
import { InvoiceService, type Invoice, PaymentStatus } from "../../features/finance/services/invoice.service"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { useAuth } from "../../features/auth/context/authContext"

const ITEMS_PER_PAGE = 10

interface PremiumPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function PremiumPagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  className
}: PremiumPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 ${className || "mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm"}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-gray-900">{startItem}-{endItem}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{totalItems} hóa đơn</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">•••</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`
                  h-9 w-9 p-0 rounded-xl font-medium text-sm transition-all duration-200
                  ${currentPage === page 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700' 
                    : 'hover:bg-blue-50 hover:text-blue-600 text-gray-600'
                  }
                `}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const navigate = useNavigate()

  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "ALL">("ALL")

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.patientId) {
        toast.error("Không tìm thấy thông tin bệnh nhân")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await InvoiceService.getInvoicesByPatient(user.patientId)
        
        if (response.success && response.data) {
          setInvoices(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error: any) {
        console.error("Error fetching invoices:", error)
        toast.error(error.response?.data?.message || "Không thể tải danh sách hóa đơn")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [user?.patientId])

  
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === "ALL" || invoice.paymentStatus === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [invoices, searchQuery, filterStatus])

  
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredInvoices.slice(startIndex, endIndex)
  }, [filteredInvoices, currentPage])

  const getStatusBadge = (paymentStatus: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
      [PaymentStatus.UNPAID]: { 
        label: "Chờ thanh toán", 
        className: "bg-amber-100 text-amber-700"
      },
      [PaymentStatus.PARTIALLY_PAID]: { 
        label: "Thanh toán một phần", 
        className: "bg-orange-100 text-orange-700"
      },
      [PaymentStatus.PAID]: { 
        label: "Đã thanh toán", 
        className: "bg-emerald-100 text-emerald-700"
      },
    }

    const statusInfo = statusMap[paymentStatus] || {
      label: paymentStatus,
      className: "bg-slate-100 text-slate-700",
    }

    return (
      <Badge className={`${statusInfo.className} text-xs font-medium px-2 py-0.5 border-0`}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND"
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6 pb-20">
        {}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Receipt className="w-8 h-8 text-white" />
                  </div>
                  Quản Lý Hóa Đơn
                </h1>
                <p className="text-blue-100 text-lg max-w-xl">
                  Xem và quản lý lịch sử thanh toán, theo dõi trạng thái hóa đơn khám chữa bệnh.
                </p>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-white">
                  <span className="block text-2xl font-bold">{invoices.length}</span>
                  <span className="text-xs text-blue-100 uppercase font-medium tracking-wide">Tổng hóa đơn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        {isLoading ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : invoices.length > 0 ? (
          <>
            <Card className="overflow-hidden border-gray-100 shadow-sm">
              <div className="p-4 border-b bg-gray-50/40">
                <div className="flex flex-col md:flex-row gap-3">
                  {}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm theo mã hóa đơn..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="pl-10 h-10 bg-white"
                    />
                  </div>

                  {}
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "ALL" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus("ALL")
                        setCurrentPage(1)
                      }}
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      Tất cả
                    </Button>
                    <Button
                      variant={filterStatus === PaymentStatus.PAID ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus(PaymentStatus.PAID)
                        setCurrentPage(1)
                      }}
                      className={filterStatus === PaymentStatus.PAID ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      Đã thanh toán
                    </Button>
                    <Button
                      variant={filterStatus === PaymentStatus.UNPAID ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilterStatus(PaymentStatus.UNPAID)
                        setCurrentPage(1)
                      }}
                      className={filterStatus === PaymentStatus.UNPAID ? "bg-amber-600 hover:bg-amber-700" : ""}
                    >
                      Chờ thanh toán
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                <div className="divide-y">
                  {paginatedInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      {}
                      <div 
                        className="p-3.5 rounded-xl text-white flex-shrink-0"
                        style={{
                          backgroundColor: invoice.paymentStatus === PaymentStatus.PAID 
                            ? '#10b981' 
                            : invoice.paymentStatus === PaymentStatus.PARTIALLY_PAID
                            ? '#f97316'
                            : '#f59e0b'
                        }}
                      >
                        <Receipt className="h-5 w-5" />
                      </div>

                      {}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">
                            #{invoice.invoiceCode}
                          </h3>
                          {getStatusBadge(invoice.paymentStatus)}
                        </div>
                        <p className="text-xl font-bold text-blue-600 mb-1.5">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {invoice.visit?.visitDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Ngày khám: {new Date(invoice.visit.visitDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Tạo lúc: {new Date(invoice.createdAt).toLocaleString("vi-VN", {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>

                      {}
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>

              {}
              <div className="border-t border-gray-100 bg-gray-50/50">
                <PremiumPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredInvoices.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  className="w-full"
                />
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
                  <Receipt className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Chưa có hóa đơn</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Các hóa đơn thanh toán sẽ được hiển thị ở đây sau khi bạn khám bệnh.
                </p>
                <Button onClick={() => navigate("/patient/appointments")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Xem lịch hẹn
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientSidebar>
  )
}
