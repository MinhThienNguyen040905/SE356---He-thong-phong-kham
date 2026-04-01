"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../features/auth/context/authContext"
import { ArrowLeft, Loader2, DollarSign, FileText, TrendingUp, Calendar } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { toast } from "sonner"
import { InvoiceService, type InvoiceStatistics } from "../../features/finance/services/invoice.service"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { useNavigate } from "react-router-dom"

export default function InvoiceStatisticsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [statistics, setStatistics] = useState<InvoiceStatistics | null>(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      const filters: any = {}
      if (fromDate) filters.fromDate = fromDate
      if (toDate) filters.toDate = toDate

      const response = await InvoiceService.getInvoiceStatistics(filters)
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải thống kê")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = () => {
    fetchStatistics()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND"
  }

  return (
    <AdminSidebar userName={user?.fullName || user?.email}>
      <div className="space-y-6">
        <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Thống kê doanh thu</h1>
          <p className="text-slate-600">Xem thống kê và báo cáo doanh thu hóa đơn</p>
        </div>

        {}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fromDate">Từ ngày</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="toDate">Đến ngày</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleFilter} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Áp dụng bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : statistics ? (
          <>
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Tổng doanh thu</CardTitle>
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">
                    {formatCurrency(parseFloat(statistics.totalRevenue.toString()))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Tổng hóa đơn</CardTitle>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{statistics.totalInvoices}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Đã thanh toán</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{statistics.paidInvoices}</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Chưa thanh toán</CardTitle>
                  <Calendar className="h-5 w-5 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{statistics.unpaidInvoices}</div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Thống kê chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hóa đơn đã thanh toán</span>
                    <span className="font-semibold text-slate-900">{statistics.paidInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hóa đơn chưa thanh toán</span>
                    <span className="font-semibold text-slate-900">{statistics.unpaidInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Hóa đơn thanh toán một phần</span>
                    <span className="font-semibold text-slate-900">{statistics.partiallyPaidInvoices}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Trung bình mỗi hóa đơn</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(parseFloat(statistics.averageInvoiceAmount.toString()))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {}
              {statistics.revenueByDate && statistics.revenueByDate.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Doanh thu theo ngày</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {statistics.revenueByDate.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium text-slate-900">
                              {new Date(item.date).toLocaleDateString("vi-VN")}
                            </div>
                            <div className="text-sm text-slate-500">{item.count} hóa đơn</div>
                          </div>
                          <div className="font-semibold text-emerald-600">
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {}
              {statistics.revenueByDoctor && statistics.revenueByDoctor.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Doanh thu theo bác sĩ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {statistics.revenueByDoctor.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium text-slate-900">{item.doctorName}</div>
                            <div className="text-sm text-slate-500">{item.count} hóa đơn</div>
                          </div>
                          <div className="font-semibold text-emerald-600">
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Không có dữ liệu thống kê</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminSidebar>
  )
}
