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
  Cell,
  PieChart, 
  Pie
} from "recharts";
import { 
  TrendingDown, 
  DollarSign, 
  FileText, 
  PieChart as PieChartIcon, 
  Download, 
  FileSpreadsheet,
  SlidersHorizontal, 
  Loader2, 
  Search, 
  Activity,
  Users
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";


interface ExpenseSummary {
  totalExpense: number;
  medicineExpense: number;
  salaryExpense: number;
  medicinePercentage: number;
  salaryPercentage: number;
}

interface SalaryByRole {
  role: string;
  totalSalary: number;
  count: number;
}

interface ExpenseTrend {
  period: string;
  medicineExpense: number;
  salaryExpense: number;
  totalExpense: number;
}

interface ExpenseReportData {
  summary: ExpenseSummary;
  expenseTrends: ExpenseTrend[];
  salaryByRole: SalaryByRole[];
}

export default function ExpenseReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ExpenseReportData | null>(null);

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

  
  const fetchExpenseReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/expense?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching expense report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo chi phí");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchExpenseReport();
  }, []);

  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
    }).format(value) + " VND";
  };

  
  const chartData = reportData?.expenseTrends || [];

  
  const summaryData = reportData?.summary || {
    totalExpense: 0,
    medicineExpense: 0,
    salaryExpense: 0,
    medicinePercentage: 0,
    salaryPercentage: 0,
  };

  
  const salaryTableData = (reportData?.salaryByRole || []).map((item: any) => ({
    name: item.role,
    salary: item.totalSalary || 0,
    count: item.count || 0,
  }));

  
  const expenseBreakdown = [
    { name: "Thuốc", value: summaryData.medicineExpense },
    { name: "Lương", value: summaryData.salaryExpense },
  ];


  const handleSearch = () => {
    fetchExpenseReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/expense/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense-report-${year}${month ? `-${month}` : ""}.pdf`);
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

      const response = await api.get(`/reports/expense/excel?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense-report-${year}${month ? `-${month}` : ""}.xlsx`);
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
      <div className="container mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 via-red-50/20 to-slate-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-rose-100 p-2 rounded-xl">
                  <TrendingDown className="h-6 w-6 text-rose-600" />
                </div>
                <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 font-bold uppercase tracking-wider text-[10px] px-3">
                  Tài chính & Chi phí
                </Badge>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Phân tích Chi phí
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Theo dõi và tối ưu hóa các khoản chi phí của bệnh viện
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
                  label: "Tổng chi phí", 
                  value: summaryData.totalExpense, 
                  icon: DollarSign, 
                  color: "rose",
                  bg: "bg-rose-50",
                  text: "text-rose-600",
                  isCurrency: true
                },
                { 
                  label: "Chi phí thuốc", 
                  value: summaryData.medicineExpense, 
                  icon: FileText, 
                  color: "amber",
                  bg: "bg-amber-50",
                  text: "text-amber-600",
                  isCurrency: true,
                  sub: `${(summaryData.medicinePercentage || 0).toFixed(1)}%`
                },
                { 
                  label: "Chi phí lương", 
                  value: summaryData.salaryExpense, 
                  icon: TrendingDown, 
                  color: "blue",
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                  isCurrency: true,
                  sub: `${(summaryData.salaryPercentage || 0).toFixed(1)}%`
                },
                { 
                  label: "Số nhân viên", 
                  value: salaryTableData.reduce((sum, item) => sum + item.count, 0), 
                  icon: Users, 
                  color: "indigo",
                  bg: "bg-indigo-50",
                  text: "text-indigo-600"
                },
                { 
                  label: "Số vai trò", 
                  value: salaryTableData.length, 
                  icon: PieChartIcon, 
                  color: "emerald",
                  bg: "bg-emerald-50",
                  text: "text-emerald-600"
                }
              ].map((item, idx) => (
                <Card key={idx} className="group border-0 shadow-lg shadow-slate-200/40 bg-white rounded-3xl overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                  <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] group-hover:opacity-[0.1] transition-opacity duration-500 ${item.bg.replace('50', '500')}`} />
                  <CardContent className="p-7 relative z-10">
                    <div className={`${item.bg} ${item.text} w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        {item.sub && <span className={`text-[10px] font-bold ${item.text}`}>{item.sub}</span>}
                      </div>
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
              {!month && (
                <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
                  <CardHeader className="pb-0 pt-10 px-10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Biến động Chi phí Tổng hợp</CardTitle>
                      <CardDescription className="font-bold text-slate-400 mt-1">
                        Phân tích biến động chi phí thuốc và lương trong {month ? `tháng ${month}/${year}` : `năm ${year}`}
                      </CardDescription>
                    </div>
                    <div className="bg-rose-50 p-4 rounded-3xl">
                      <Activity className="h-6 w-6 text-rose-600 animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorMedicine" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="period" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                            dy={15}
                            tickFormatter={(val) => month ? val.split('-').pop() : val.split('-').pop()}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              backdropFilter: 'blur(10px)',
                              borderRadius: '24px', 
                              border: 'none', 
                              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                              padding: '20px'
                            }}
                            itemStyle={{ fontWeight: '900', fontSize: '14px' }}
                            labelStyle={{ color: '#64748b', fontWeight: '800', marginBottom: '12px', fontSize: '12px' }}
                            formatter={(value) => [formatCurrency(value as number)]}
                          />
                          <Area
                            type="monotone"
                            dataKey="medicineExpense"
                            stackId="1"
                            stroke="#f59e0b"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorMedicine)"
                            name="Chi phí thuốc"
                          />
                          <Area
                            type="monotone"
                            dataKey="salaryExpense"
                            stackId="1"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorSalary)"
                            name="Chi phí lương"
                          />
                        </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {}
              <Card className="lg:col-span-1 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
                <CardHeader className="pb-0 pt-10 px-10">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-indigo-100">
                    <PieChartIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Cơ cấu Chi phí</CardTitle>
                  <CardDescription className="font-bold text-slate-400 mt-1">
                    Tỷ lệ giữa các danh mục chính
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-10 h-[370px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                         contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: '20px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' 
                        }}
                        formatter={(value) => [formatCurrency(value as number)]}
                      />
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={85}
                        outerRadius={115}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        {expenseBreakdown.map((_entry, index) => (
                          <Cell 
                             key={`cell-${index}`} 
                             fill={index === 0 ? "#f59e0b" : "#3b82f6"} 
                             className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-40px]">
                    <span className="block text-2xl font-black text-slate-900 leading-none tracking-tight">
                        {((summaryData.totalExpense / 1000000).toFixed(0))}Tr
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Chi phí</span>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-amber-500 shadow-sm" />
                        <span className="text-xs font-bold text-slate-600">Thuốc</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{summaryData.medicinePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
                        <span className="text-xs font-bold text-slate-600">Lương</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{summaryData.salaryPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {}
          {reportData && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden p-8 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                    <div className="bg-rose-100 p-5 rounded-[24px] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <TrendingDown className="w-8 h-8 text-rose-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Mức chi cao nhất</p>
                        <h5 className="text-xl font-black text-slate-900 leading-tight">
                            {formatCurrency(Math.max(...chartData.map(d => d.totalExpense), 0))}
                        </h5>
                    </div>
                </Card>
                
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden p-8 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                    <div className="bg-amber-100 p-5 rounded-[24px] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Activity className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">TB Thuốc/Khám</p>
                        <h5 className="text-xl font-black text-slate-900 leading-tight">
                            {formatCurrency(summaryData.medicineExpense / (chartData.length || 1))}
                        </h5>
                    </div>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden p-8 flex items-center gap-6 group hover:shadow-2xl transition-all duration-500">
                    <div className="bg-indigo-100 p-5 rounded-[24px] group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">TB Lương/Nhân sự</p>
                        <h5 className="text-xl font-black text-slate-900 leading-tight">
                            {formatCurrency(summaryData.salaryExpense / (salaryTableData.reduce((sum, item) => sum + item.count, 0) || 1))}
                        </h5>
                    </div>
                </Card>
             </div>
          )}

          {}
          {reportData && (
             <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="text-xl font-black text-slate-800">Chi tiết Ngân sách Nhân sự</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="text-left py-5 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Vai trò</th>
                          <th className="text-center py-5 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Số nhân sự</th>
                          <th className="text-right py-5 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Tổng quỹ lương</th>
                          <th className="text-right py-5 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Lương bình quân</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {salaryTableData.map((role, index) => (
                          <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="py-5 px-8 font-bold text-slate-700">{role.name}</td>
                            <td className="text-center py-5 px-8">
                               <Badge className="bg-slate-100 text-slate-600 border-0 font-bold px-4 py-1.5 rounded-full">{role.count} người</Badge>
                            </td>
                            <td className="text-right py-5 px-8 font-black text-slate-900">{formatCurrency(role.salary)}</td>
                            <td className="text-right py-5 px-8 font-bold text-emerald-600">{formatCurrency(role.salary / (role.count || 1))}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-900 text-white">
                          <td className="py-6 px-8 font-black uppercase tracking-wider">Tổng cộng</td>
                          <td className="text-center py-6 px-8 font-black">
                            {salaryTableData.reduce((sum, item) => sum + item.count, 0)} người
                          </td>
                          <td className="text-right py-6 px-8 font-black text-lg">
                            {formatCurrency(salaryTableData.reduce((sum, item) => sum + item.salary, 0))}
                          </td>
                          <td className="text-right py-6 px-8 font-bold text-slate-400">
                            {formatCurrency(
                              salaryTableData.reduce((sum, item) => sum + item.salary, 0) /
                              (salaryTableData.reduce((sum, item) => sum + item.count, 0) || 1)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
             </Card>
          )}

          {}
          {!loading && !reportData && (
            <Card className="border-0 shadow-lg bg-white rounded-[32px] p-20 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                  <Activity className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-800">Sẵn sàng phân tích chi phí?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Chọn các thông số lọc bên trên và nhấn cập nhật dữ liệu để hệ thống truy xuất các báo cáo tài chính chuyên sâu.
                </p>
                <div className="pt-4">
                   <Button onClick={handleSearch} className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black tracking-wide">
                      Bắt đầu ngay
                   </Button>
                </div>
              </div>
            </Card>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-12 w-12 text-rose-600 animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Đang đồng bộ hóa dữ liệu chi phí...</p>
             </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
