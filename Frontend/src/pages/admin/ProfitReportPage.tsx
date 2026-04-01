import { useState, useEffect } from "react";
import AdminSidebar from "../../components/layout/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";


interface ProfitOverTime {
  period: string;
  revenue: number;
  expense: number;
  profit: number;
}

interface ProfitSummary {
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  profitMargin: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

interface ProfitReportData {
  summary: ProfitSummary;
  overTime: ProfitOverTime[];
}

export default function ProfitReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ProfitReportData | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  
  const fetchProfitReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/profit?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching profit report:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo lợi nhuận");
      }
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchProfitReport();
  }, []);

  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
    }).format(value) + " VND";
  };

  
  const chartData = reportData?.overTime || [];

  
  const summaryData = reportData?.summary || {
    totalRevenue: 0,
    totalExpense: 0,
    totalProfit: 0,
    profitMargin: 0,
    revenueChange: 0,
    expenseChange: 0,
    profitChange: 0,
  };

  const handleSearch = () => {
    fetchProfitReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/profit/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `profit-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
      }
    }
  };

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          {}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo lợi nhuận</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê lợi nhuận theo thời gian
            </p>
          </div>

          {}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Năm
                  </label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tháng (tùy chọn)
                  </label>
                  <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tất cả các tháng</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-end justify-between col-span-1 md:col-span-2">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Đang tải..." : "Tìm kiếm"}
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={!reportData || loading}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(summaryData.totalRevenue)}
                    </p>
                    {summaryData.revenueChange !== 0 && (
                      <p className={`text-xs mt-1 ${summaryData.revenueChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {summaryData.revenueChange > 0 ? '+' : ''}{(summaryData.revenueChange || 0).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng chi phí</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summaryData.totalExpense)}
                    </p>
                    {summaryData.expenseChange !== 0 && (
                      <p className={`text-xs mt-1 ${summaryData.expenseChange > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {summaryData.expenseChange > 0 ? '+' : ''}{(summaryData.expenseChange || 0).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng lợi nhuận</p>
                    <p className={`text-2xl font-bold ${summaryData.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(summaryData.totalProfit)}
                    </p>
                    {summaryData.profitChange !== 0 && (
                      <p className={`text-xs mt-1 ${summaryData.profitChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {summaryData.profitChange > 0 ? '+' : ''}{(summaryData.profitChange || 0).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tỷ suất lợi nhuận</p>
                    <p className={`text-2xl font-bold ${summaryData.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(summaryData.profitMargin || 0).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">(Profit / Revenue)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {}
          {reportData && chartData.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Lợi nhuận theo thời gian
                  </CardTitle>
                  <CardDescription>
                    Biểu đồ thể hiện doanh thu, chi phí và lợi nhuận theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Doanh thu"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Chi phí"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Lợi nhuận"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {}
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle>So sánh Doanh thu và Chi phí</CardTitle>
                  <CardDescription>
                    Biểu đồ cột so sánh doanh thu và chi phí theo thời gian
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Thời gian: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10b981" name="Doanh thu" />
                      <Bar dataKey="expense" fill="#ef4444" name="Chi phí" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {}
          {!loading && !reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có dữ liệu báo cáo. Vui lòng chọn năm và tháng để xem báo cáo.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {}
          {loading && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
