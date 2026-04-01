"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, TrendingUp, Calendar, Loader2, BarChart3, PieChart, Download } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { PayrollService, type Payroll } from "../../features/finance/services/payroll.service"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { format } from "date-fns"

export interface PayrollStatistics {
  status: string
  count: number
  totalGross: number
  totalNet: number
  totalCommission: number
  totalPenalty: number
}

export default function PayrollStatisticsPage() {
  const [statistics, setStatistics] = useState<PayrollStatistics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>()
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    fetchStatistics()
  }, [selectedMonth, selectedYear])

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        year: selectedYear,
      }
      if (selectedMonth) {
        params.month = selectedMonth
      }

      const response = await PayrollService.getPayrollStatistics(params)
      setStatistics(Array.isArray(response) ? response : [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải thống kê lương")
      setStatistics([])
    } finally {
      setIsLoading(false)
    }
  }

  
  const totalPayrolls = statistics.reduce((sum, stat) => sum + stat.count, 0)
  const totalGross = statistics.reduce((sum, stat) => sum + (parseFloat(stat.totalGross?.toString() || "0")), 0)
  const totalNet = statistics.reduce((sum, stat) => sum + (parseFloat(stat.totalNet?.toString() || "0")), 0)
  const totalCommission = statistics.reduce((sum, stat) => sum + (parseFloat(stat.totalCommission?.toString() || "0")), 0)
  const totalPenalty = statistics.reduce((sum, stat) => sum + (parseFloat(stat.totalPenalty?.toString() || "0")), 0)

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-yellow-500",
      APPROVED: "bg-blue-500",
      PAID: "bg-emerald-500",
    }
    return colors[status] || "bg-gray-500"
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Thống kê lương</h1>
            <p className="text-slate-600">Phân tích và thống kê bảng lương</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/admin/salary">
              <Calendar className="h-4 w-4 mr-2" />
              Quay lại bảng lương
            </a>
          </Button>
        </div>

        {}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="year">Năm</Label>
                <Input
                  id="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="month">Tháng (tùy chọn)</Label>
                <Input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="Tất cả"
                  value={selectedMonth || ""}
                  onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="mt-2"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchStatistics} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Cập nhật
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng phiếu lương</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalPayrolls}</div>
              <p className="text-xs text-slate-500 mt-1">Tổng số phiếu lương</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng lương gộp</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalGross.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng lương ròng</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalNet.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng hoa hồng</CardTitle>
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalCommission.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <PieChart className="h-6 w-6 text-blue-600" />
              Thống kê theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : statistics.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có dữ liệu thống kê</p>
                <p className="text-sm text-gray-400 mt-1">Vui lòng chọn năm/tháng khác hoặc tính lương</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Số lượng</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Lương gộp</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Lương ròng</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Hoa hồng</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Phạt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.map((stat, index) => (
                      <tr
                        key={stat.status}
                        className={`border-b hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-4 px-6">{getStatusBadge(stat.status)}</td>
                        <td className="py-4 px-6 font-semibold">{stat.count}</td>
                        <td className="py-4 px-6 text-right font-medium text-emerald-600">
                          {parseFloat(stat.totalGross?.toString() || "0").toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-purple-600">
                          {parseFloat(stat.totalNet?.toString() || "0").toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6 text-right text-amber-600">
                          {parseFloat(stat.totalCommission?.toString() || "0").toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6 text-right text-red-600">
                          {parseFloat(stat.totalPenalty?.toString() || "0").toLocaleString()} VND
                        </td>
                      </tr>
                    ))}
                    {}
                    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                      <td className="py-4 px-6">Tổng cộng</td>
                      <td className="py-4 px-6">{totalPayrolls}</td>
                      <td className="py-4 px-6 text-right text-emerald-700">
                        {totalGross.toLocaleString()} VND
                      </td>
                      <td className="py-4 px-6 text-right text-purple-700">
                        {totalNet.toLocaleString()} VND
                      </td>
                      <td className="py-4 px-6 text-right text-amber-700">
                        {totalCommission.toLocaleString()} VND
                      </td>
                      <td className="py-4 px-6 text-right text-red-700">
                        {totalPenalty.toLocaleString()} VND
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {}
        {statistics.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Phân bổ theo trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.map((stat) => {
                    const percentage = totalPayrolls > 0 ? (stat.count / totalPayrolls) * 100 : 0
                    return (
                      <div key={stat.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{getStatusBadge(stat.status)}</span>
                          <span className="text-sm text-slate-600">{stat.count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className={`${getStatusColor(stat.status)} h-3 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Phân bổ lương theo trạng thái
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statistics.map((stat) => {
                    const netSalary = parseFloat(stat.totalNet?.toString() || "0")
                    const percentage = totalNet > 0 ? (netSalary / totalNet) * 100 : 0
                    return (
                      <div key={stat.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{getStatusBadge(stat.status)}</span>
                          <span className="text-sm text-slate-600 font-semibold">
                            {netSalary.toLocaleString()} VND ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className={`${getStatusColor(stat.status)} h-3 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminSidebar>
  )
}
