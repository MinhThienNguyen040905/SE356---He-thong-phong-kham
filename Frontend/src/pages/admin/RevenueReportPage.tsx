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
import { Badge } from "../../components/ui/badge";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  PieChart as PieChartIcon, 
  Download, 
  FileSpreadsheet,
  SlidersHorizontal, 
  Loader2, 
  Search, 
  Activity 
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";


interface RevenueOverTime {
  period: string;
  revenue: number;
}

interface RevenueBySummary {
  totalRevenue: number;
  collectedRevenue: number;
  uncollectedRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
}

interface RevenueByStatus {
  paymentStatus: string;
  count: number;
  totalAmount: number;
  paidAmount: number;
}

interface RevenueReportData {
  summary: RevenueBySummary;
  byStatus: RevenueByStatus[];
  overTime: RevenueOverTime[];
}


export default function RevenueReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);

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

  
  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/revenue?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching revenue report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchRevenueReport();
  }, []);

  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
    }).format(value) + " VND";
  };

  
  const chartData = reportData?.overTime || [];

  
  const summaryData = reportData?.summary || {
    totalRevenue: 0,
    collectedRevenue: 0,
    uncollectedRevenue: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
  };


  const handleSearch = () => {
    fetchRevenueReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/revenue/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo PDF thành công");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/revenue/excel?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue-report-${year}${month ? `-${month}` : ""}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo Excel thành công");
    } catch (error: any) {
      console.error("Error exporting Excel:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo Excel");
    }
  };

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-wider text-[10px] px-3">
                  Tài chính & Doanh thu
                </Badge>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Phân tích Doanh thu
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Theo dõi và đánh giá hiệu quả kinh doanh của bệnh viện
              </p>
            </div>
            
             <div className="flex items-center gap-3">
               <Button
                onClick={handleExportPDF}
                disabled={!reportData || loading}
                className="h-11 px-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4 text-rose-500" />
                Xuất PDF
              </Button>
               <Button
                onClick={handleExportExcel}
                disabled={!reportData || loading}
                className="h-11 px-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4 pt-7 px-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-black text-slate-800">Cấu hình báo cáo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Chọn Năm
                  </label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="font-bold py-3 rounded-xl focus:bg-indigo-50/50 outline-none">
                          Năm {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Chọn Tháng (Tùy chọn)
                  </label>
                  <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700">
                      <SelectValue placeholder="Toàn bộ năm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
                      <SelectItem value="0" className="font-bold py-3 rounded-xl focus:bg-indigo-50/50">Toàn bộ các tháng</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl focus:bg-indigo-50/50">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-5 flex items-end">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                       <Search className="h-5 w-5" />
                    )}
                    {loading ? "Đang truy xuất..." : "Cập nhật dữ liệu"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { 
                  label: "Tổng doanh thu", 
                  value: summaryData.totalRevenue, 
                  icon: DollarSign, 
                  color: "emerald",
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                  isCurrency: true
                },
                { 
                  label: "Đã thực thu", 
                  value: summaryData.collectedRevenue, 
                  icon: TrendingUp, 
                  color: "blue",
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                  isCurrency: true
                },
                { 
                  label: "Còn nợ (Unpaid)", 
                  value: summaryData.uncollectedRevenue, 
                  icon: TrendingDown, 
                  color: "red",
                  bg: "bg-red-50",
                  text: "text-red-600",
                  isCurrency: true
                },
                { 
                  label: "Hóa đơn phát sinh", 
                  value: summaryData.totalInvoices, 
                  icon: FileText, 
                  color: "indigo",
                  bg: "bg-indigo-50",
                  text: "text-indigo-600"
                },
                { 
                  label: "Trung bình hóa đơn", 
                  value: summaryData.averageInvoiceValue, 
                  icon: PieChartIcon, 
                  color: "amber",
                  bg: "bg-amber-50",
                  text: "text-amber-600",
                  isCurrency: true
                }
              ].map((item, idx) => (
                <Card key={idx} className="group border-0 shadow-lg shadow-slate-200/40 bg-white rounded-3xl overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                  <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 ${item.bg.replace('50', '500')}`} />
                  <CardContent className="p-7 relative z-10">
                    <div className={`${item.bg} ${item.text} w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">
                        {item.isCurrency ? formatCurrency(item.value) : item.value.toLocaleString()}
                      </h4>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {}
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {}
              <Card className="lg:col-span-3 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                <CardHeader className="pb-0 pt-8 px-8 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-800">Động thái Doanh thu</CardTitle>
                    <CardDescription className="font-bold text-slate-400">
                      {month ? `Biến động theo ngày của tháng ${month}/${year}` : `Diễn biến doanh thu của năm ${year}`}
                    </CardDescription>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="p-8 h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                          tickFormatter={(val) => month ? val.split('-').pop() : `Th ${val.split('-').pop()}`}
                          dy={15}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`}
                        />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '20px', 
                            border: 'none', 
                            boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)',
                            padding: '16px'
                          }}
                          itemStyle={{ color: '#0f172a', fontWeight: '900', fontSize: '14px' }}
                          labelStyle={{ color: '#64748b', fontWeight: '800', marginBottom: '8px', fontSize: '12px' }}
                          formatter={(value) => [formatCurrency(value as number), "Doanh thu"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                          name="Doanh thu"
                        />
                      </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {}
          {!loading && !reportData && (
            <Card className="border-0 shadow-lg bg-white rounded-[32px] p-20 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                  <Activity className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Sẵn sàng phân tích?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Chọn các thông số lọc bên trên và nhấn cập nhật dữ liệu để hệ thống truy xuất các báo cáo tài chính chuyên sâu.
                </p>
                <div className="pt-4">
                   <Button onClick={handleSearch} className="h-12 px-8 bg-primary hover:bg-primary/90 rounded-2xl font-black tracking-wide">
                      Bắt đầu ngay
                   </Button>
                </div>
              </div>
            </Card>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Đang đồng bộ hóa dữ liệu...</p>
             </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
