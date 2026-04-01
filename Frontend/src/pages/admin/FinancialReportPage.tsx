import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/layout/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  PieChart as PieChartIcon, 
  Download, 
  FileSpreadsheet,
  SlidersHorizontal, 
  Loader2, 
  Search, 
  Activity,
  Users,
  Wallet,
  Calendar,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";


interface RevenueOverTime {
  period: string;
  revenue: number;
  [key: string]: any;
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
  [key: string]: any;
}

interface RevenueReportData {
  summary: RevenueBySummary;
  byStatus: RevenueByStatus[];
  overTime: RevenueOverTime[];
}

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
  [key: string]: any;
}

interface ExpenseReportData {
  summary: ExpenseSummary;
  salaryByRole: SalaryByRole[];
  medicineByMonth: { month: number; expense: number }[];
}

interface ProfitOverTime {
  period: string;
  revenue: number;
  expense: number;
  profit: number;
  [key: string]: any;
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



const CustomTooltip = ({ active, payload, label, isCurrency = true }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-2xl p-4 min-w-[200px]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-50 italic">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{entry.name}</span>
              </div>
              <span className="text-sm font-black text-slate-900 tabular-nums">
                {isCurrency ? new Intl.NumberFormat("vi-VN").format(entry.value) + "đ" : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function FinancialReportPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseReportData | null>(null);
  const [profitData, setProfitData] = useState<ProfitReportData | null>(null);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = [
    { value: "all", label: "Cả năm" },
    { value: "1", label: "Tháng 01" }, { value: "2", label: "Tháng 02" },
    { value: "3", label: "Tháng 03" }, { value: "4", label: "Tháng 04" },
    { value: "5", label: "Tháng 05" }, { value: "6", label: "Tháng 06" },
    { value: "7", label: "Tháng 07" }, { value: "8", label: "Tháng 08" },
    { value: "9", label: "Tháng 09" }, { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" }, { value: "12", label: "Tháng 12" },
  ];

  const fetchData = useCallback(async (tab: string = activeTab) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/${tab}?${params.toString()}`);
      if (response.data.success) {
        if (tab === "revenue") setRevenueData(response.data.data);
        if (tab === "expense") setExpenseData(response.data.data);
        if (tab === "profit") setProfitData(response.data.data);
      }
    } catch (error: any) {
      console.error(`Error fetching ${tab} report:`, error);
      toast.error(error.response?.data?.message || `Lỗi khi tải báo cáo ${tab}`);
    } finally {
      setLoading(false);
    }
  }, [year, month, activeTab]);

  useEffect(() => {
    
    fetchData("profit");
    
    if (activeTab !== "profit") {
      fetchData(activeTab);
    }
  }, [year, month, activeTab, fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
    }).format(value) + " VND";
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(format);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/${activeTab}/${format}?${params.toString()}`, {
        responseType: "blob",
      });

      const tabNames: Record<string, string> = {
        revenue: "Bao_cao_Doanh_thu",
        expense: "Bao_cao_Chi_phi",
        profit: "Bao_cao_Loi_nhuan"
      };

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `${tabNames[activeTab] || activeTab}_${year}${month !== 'all' ? `_T${month}` : ""}.${extension}`;
      
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success(`Tải báo cáo ${format.toUpperCase()} thành công`);
    } catch (error: any) {
      console.error(`Error exporting ${format}:`, error);
      toast.error(`Lỗi khi tải báo cáo ${format.toUpperCase()}`);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/10 to-emerald-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-100px] right-[20%] w-96 h-96 bg-gradient-to-br from-rose-400/5 to-orange-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            {}
            <div className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-3xl p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms]" />
              <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-gradient-to-tl from-blue-500/10 via-emerald-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms] delay-1000" />
              
              {}
              <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
                backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`,
                backgroundSize: `20px 20px`
              }} />
              
              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <div className="h-11 w-11 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                        <Activity className="h-5 w-5 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600 text-white border-0 font-black uppercase tracking-[0.25em] text-[8px] px-3 py-0.5 rounded-full shadow-lg shadow-indigo-100">
                        <Sparkles className="w-3 h-3 mr-1.5 animate-spin-slow" />
                        Financial Intel
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold uppercase tracking-widest text-[8px] px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-ping" />
                        Live
                      </Badge>
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        Báo cáo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600">Tài chính</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-[11px] lg:text-xs">
                        Phân tích dữ liệu hợp nhất doanh thu & lợi nhuận chuyên sâu.
                      </p>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex gap-4">
                  {[
                    { 
                      label: "Doanh thu", 
                      value: (profitData?.summary?.totalRevenue || revenueData?.summary?.totalRevenue) 
                        ? formatCurrency(profitData?.summary?.totalRevenue || revenueData?.summary?.totalRevenue || 0) 
                        : "---",
                      icon: DollarSign,
                      color: "indigo",
                      gradient: "from-indigo-600 to-blue-600"
                    },
                    { 
                      label: "Hiệu suất", 
                      value: profitData?.summary ? `${profitData.summary.profitMargin.toFixed(1)}%` : "---",
                      icon: TrendingUp,
                      color: "emerald",
                      gradient: "from-emerald-600 to-teal-600"
                    }
                  ].map((stat, idx) => (
                    <div key={idx} className="relative group/stat">
                      <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover/stat:opacity-100 transition duration-500 rounded-2xl blur-sm bg-slate-100"></div>
                      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white min-w-[200px] shadow-sm group-hover/stat:bg-white group-hover/stat:-translate-y-0.5 transition-all duration-500">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl bg-${stat.color}-50 flex items-center justify-center transition-transform group-hover/stat:scale-110 group-hover/stat:rotate-6 duration-500`}>
                            <stat.icon className={`w-4.5 h-4.5 text-${stat.color}-600`} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider leading-none italic">
                              {stat.label}
                            </p>
                            <p className="text-[15px] font-black text-slate-900 tabular-nums tracking-tight">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${stat.gradient} w-[70%] rounded-full group-hover/stat:w-full transition-all duration-1000`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
              <div className="w-full xl:flex-1 bg-white/60 backdrop-blur-xl p-3 rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/40">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {}
                  <div className="flex-1">
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm hover:shadow-md transition-all px-6 group data-[state=open]:ring-2 ring-blue-500/20 outline-none">
                        <div className="flex items-center gap-4 w-full text-left">
                          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5 italic">Năm tài chính</span>
                            <div className="text-sm font-black text-slate-900 tracking-tight">Năm {year}</div>
                          </div>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px]">
                        {years.map((y) => (
                          <SelectItem key={y} value={y} className="font-bold py-3 rounded-xl focus:bg-blue-50 cursor-pointer">
                            Năm {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {}
                  <div className="flex-1">
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm hover:shadow-md transition-all px-6 group data-[state=open]:ring-2 ring-indigo-500/20 outline-none">
                        <div className="flex items-center gap-4 w-full text-left">
                          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5 italic">Chu kỳ tháng</span>
                            <div className="text-sm font-black text-slate-900 tracking-tight">
                              {month === "all" ? "Cả năm" : `Tháng ${month.padStart(2, '0')}`}
                            </div>
                          </div>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px]">
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl focus:bg-blue-50 cursor-pointer">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fetchData()}
                      disabled={loading}
                      className="flex-1 h-14 bg-[#0f172a] hover:bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border-0 group"
                    >
                      <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-all">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </div>
                      <span className="uppercase tracking-widest text-[11px]">Phân tích</span>
                    </Button>
                    <Button
                      onClick={() => { setYear(currentYear.toString()); setMonth("all"); }}
                      variant="outline"
                      className="w-14 h-14 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all"
                    >
                      <RefreshCw className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {}
              <div className="flex gap-3 h-16">
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={loading || !!exportLoading}
                  className="px-6 h-full bg-white hover:bg-rose-50 text-slate-900 border-2 border-slate-100 font-black rounded-2xl shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1 active:scale-95 group"
                  variant="outline"
                >
                  <div className="bg-rose-100 p-2 rounded-xl group-hover:scale-110 transition-transform mr-3">
                    {exportLoading === 'pdf' ? <Loader2 className="w-4 h-4 text-rose-600 animate-spin" /> : <Download className="w-4 h-4 text-rose-600" />}
                  </div>
                  Xuất PDF
                </Button>
                <Button
                  onClick={() => handleExport('excel')}
                  disabled={loading || !!exportLoading}
                  className="px-6 h-full bg-white hover:bg-emerald-50 text-slate-900 border-2 border-slate-100 font-black rounded-2xl shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1 active:scale-95 group"
                  variant="outline"
                >
                  <div className="bg-emerald-100 p-2 rounded-xl group-hover:scale-110 transition-transform mr-3">
                    {exportLoading === 'excel' ? <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                  </div>
                  Excel
                </Button>
              </div>
            </div>

            {}
            <Tabs defaultValue="revenue" className="w-full space-y-8" onValueChange={setActiveTab}>
              <div className="flex items-center justify-center">
                <TabsList className="bg-white/60 backdrop-blur-xl p-1.5 rounded-[28px] border border-white/60 shadow-xl shadow-slate-200/20 h-auto gap-2 flex w-full max-w-2xl">
                  <TabsTrigger value="revenue" className="flex-1 rounded-[22px] py-4 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
                    <DollarSign className="w-4 h-4 mr-2" /> Doanh thu
                  </TabsTrigger>
                  <TabsTrigger value="expense" className="flex-1 rounded-[22px] py-4 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
                    <Wallet className="w-4 h-4 mr-2" /> Chi phí
                  </TabsTrigger>
                  <TabsTrigger value="profit" className="flex-1 rounded-[22px] py-4 font-black text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-300">
                    <TrendingUp className="w-4 h-4 mr-2" /> Lợi nhuận
                  </TabsTrigger>
                </TabsList>
              </div>

              {}
              <TabsContent value="revenue" className="space-y-8 focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                {revenueData && !loading && (
                  <>
                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                        { label: "Tổng doanh thu", value: revenueData.summary.totalRevenue, icon: DollarSign, color: "blue", shadow: "shadow-blue-500/10", desc: "Tổng giá trị hóa đơn" },
                        { label: "Thực thu", value: revenueData.summary.collectedRevenue, icon: ArrowUpRight, color: "emerald", shadow: "shadow-emerald-500/10", desc: "Tổng tiền đã thanh toán" },
                        { label: "Số lượng hóa đơn", value: revenueData.summary.totalInvoices, icon: FileText, color: "orange", shadow: "shadow-orange-500/10", desc: "Tổng lượt giao dịch" },
                        { label: "Trung bình hóa đơn", value: revenueData.summary.averageInvoiceValue, icon: PieChartIcon, color: "violet", shadow: "shadow-violet-500/10", desc: "Giá trị TB / Hóa đơn" }
                      ].map((item, idx) => (
                        <Card key={idx} className={`group border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden relative transition-all duration-700 hover:shadow-3xl hover:-translate-y-2`}>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                            item.color === 'blue' ? 'bg-blue-600' : 
                            item.color === 'emerald' ? 'bg-emerald-600' : 
                            item.color === 'orange' ? 'bg-orange-600' : 'bg-violet-600'
                          }`} />
                          <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                              item.color === 'blue' ? 'bg-blue-600 shadow-blue-500/40' : 
                              item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/40' : 
                              item.color === 'orange' ? 'bg-orange-600 shadow-orange-500/40' : 'bg-violet-600 shadow-violet-500/40'
                            }`}>
                              <item.icon className="h-7 w-7 text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                              <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                                {idx !== 2 ? formatCurrency(item.value) : item.value.toLocaleString()}
                              </h4>
                              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {}
                    <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-blue-100/50">
                      <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Xu hướng Doanh thu</CardTitle>
                          </div>
                          <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">
                            {month !== "all" ? `Phân tích theo ngày của tháng ${month}/${year}` : `Báo cáo tăng trưởng doanh thu năm ${year}`}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-10 h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData.overTime} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="period" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} 
                              dy={15}
                              tickFormatter={(val) => month !== "all" ? val.split('-').pop() : `T${val.split('-').pop()}`}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} 
                              tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                              type="monotone" 
                              dataKey="revenue" 
                              name="Doanh thu"
                              stroke="#3b82f6" 
                              strokeWidth={5} 
                              fillOpacity={1} 
                              fill="url(#colorRevenue)" 
                              animationDuration={2500}
                              activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#3b82f6' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {}
              <TabsContent value="expense" className="space-y-8 focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                {expenseData && !loading && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { label: "Tổng chi thực tế", value: expenseData.summary.totalExpense, icon: Wallet, color: "rose", shadow: "shadow-rose-500/10", desc: "Tổng các khoản chi" },
                        { label: "Ngân sách nhân sự", value: expenseData.summary.salaryExpense, icon: Users, color: "indigo", shadow: "shadow-indigo-500/10", desc: "Quỹ lương & phụ cấp" },
                        { label: "Chi phí thuốc", value: expenseData.summary.medicineExpense, icon: Activity, color: "orange", shadow: "shadow-orange-500/10", desc: "Mua dược phẩm & vật tư" },
                      ].map((item, idx) => (
                        <Card key={idx} className={`group border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden relative transition-all duration-500 hover:shadow-3xl hover:-translate-y-2`}>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                            item.color === 'rose' ? 'bg-rose-600' : 
                            item.color === 'indigo' ? 'bg-indigo-600' : 'bg-orange-600'
                          }`} />
                          <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                              item.color === 'rose' ? 'bg-rose-600 shadow-rose-500/40' : 
                              item.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-500/40' : 'bg-orange-600 shadow-orange-500/40'
                            }`}>
                              <item.icon className="h-7 w-7 text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                              <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                                {formatCurrency(item.value)}
                              </h4>
                              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/60">
                        <CardHeader className="p-10 border-b border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                               <PieChartIcon className="h-5 w-5 text-indigo-600" />
                             </div>
                             <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Cơ cấu Chi phí</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-10 h-[450px] flex flex-col justify-between">
                          <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Lương", value: expenseData.summary.salaryExpense },
                                    { name: "Thuốc", value: expenseData.summary.medicineExpense }
                                  ]}
                                  cx="50%" cy="50%" innerRadius={85} outerRadius={115} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={12}
                                >
                                  <Cell fill="#6366f1" />
                                  <Cell fill="#f59e0b" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-5px]">
                              <span className="block text-2xl font-black text-slate-800 leading-none">
                                {((expenseData.summary.totalExpense / 1000000).toFixed(0))}Tr
                              </span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Tổng chi</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {[
                              { label: "Nhân sự", value: expenseData.summary.salaryPercentage, color: "bg-indigo-500" },
                              { label: "Dược phẩm", value: expenseData.summary.medicinePercentage, color: "bg-amber-500" }
                            ].map((p, idx) => (
                              <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${p.color}`} />
                                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{p.label}</span>
                                </div>
                                <span className="text-lg font-black text-slate-900">{p.value.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/60">
                        <CardHeader className="p-10 border-b border-slate-50">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                               <Users className="h-5 w-5 text-blue-600" />
                             </div>
                             <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Ngân sách theo Phòng / Vị trí</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-10 h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={expenseData.salaryByRole} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 12 }} />
                              <Bar 
                                dataKey="totalSalary" 
                                name="Chi phí lương"
                                fill="#6366f1" 
                                radius={[12, 12, 0, 0]} 
                                barSize={60}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </TabsContent>

              {}
              <TabsContent value="profit" className="space-y-8 focus:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                {profitData && !loading && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                        { label: "Doanh thu cơ sở", value: profitData.summary.totalRevenue, color: "blue", shadow: "shadow-blue-500/10", change: profitData.summary.revenueChange, icon: DollarSign },
                        { label: "Tổng chi phí", value: profitData.summary.totalExpense, color: "rose", shadow: "shadow-rose-500/10", change: profitData.summary.expenseChange, icon: Wallet },
                        { label: "Lợi nhuận ròng", value: profitData.summary.totalProfit, color: "emerald", shadow: "shadow-emerald-500/10", change: profitData.summary.profitChange, icon: TrendingUp },
                        { label: "Biên lợi nhuận", value: `${profitData.summary.profitMargin.toFixed(2)}%`, color: "violet", shadow: "shadow-violet-500/10", icon: Activity }
                      ].map((item, idx) => (
                        <Card key={idx} className={`group border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden relative transition-all duration-500 hover:shadow-3xl hover:-translate-y-2`}>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                            item.color === 'blue' ? 'bg-blue-600' : 
                            item.color === 'rose' ? 'bg-rose-600' : 
                            item.color === 'emerald' ? 'bg-emerald-600' : 'bg-violet-600'
                          }`} />
                          <CardContent className="p-8 relative z-10 flex flex-col items-center text-center">
                            <div className="w-full flex justify-end absolute top-6 right-6">
                              {item.change !== undefined && item.change !== 0 && (
                                <Badge className={`text-[9px] font-black rounded-lg px-2.5 py-1 ${item.change > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} border-none shadow-sm flex items-center gap-1`}>
                                  {item.change > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                  {item.change > 0 ? '+' : ''}{(item.change as number).toFixed(1)}%
                                </Badge>
                              )}
                            </div>
                            <div className={`w-14 h-14 rounded-[20px] bg-white flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ring-1 ring-slate-50`}>
                              <div className={`w-11 h-11 rounded-[16px] flex items-center justify-center ${
                                item.color === 'blue' ? 'bg-blue-600 shadow-blue-500/40' : 
                                item.color === 'rose' ? 'bg-rose-600 shadow-rose-500/40' : 
                                item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/40' : 'bg-violet-600 shadow-violet-500/40'
                              }`}>
                                <item.icon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                              <h4 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">
                                {typeof item.value === 'string' ? item.value : formatCurrency(item.value)}
                              </h4>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80">
                      <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                         <div className="space-y-2">
                           <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <Activity className="h-5 w-5 text-emerald-600" />
                              </div>
                              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Cân đối Doanh thu - Chi phí - Lợi nhuận</CardTitle>
                           </div>
                           <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Biểu đồ so sánh hiệu quả tài chính tổng hợp qua chu kỳ báo cáo</CardDescription>
                         </div>
                      </CardHeader>
                      <CardContent className="p-10 h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={profitData.overTime} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                               dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} dy={15} 
                               tickFormatter={(val) => month !== "all" ? val.split('-').pop() : `T${val.split('-').pop()}`}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                              iconType="circle" 
                              verticalAlign="top" 
                              align="right" 
                              height={50}
                              formatter={(value) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-2">{value === 'revenue' ? 'Doanh thu' : value === 'expense' ? 'Chi phí' : 'Lợi nhuận'}</span>}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="revenue" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="expense" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={5} name="profit" dot={{ r: 5, strokeWidth: 3, fill: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} animationDuration={3000} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            </Tabs>

            {}
            {!loading && !revenueData && !expenseData && !profitData && (
               <Card className="border-0 shadow-2xl shadow-slate-300/20 bg-white/60 backdrop-blur-xl rounded-[40px] p-32 text-center border border-white/60 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-emerald-500/5" />
                  <div className="max-w-md mx-auto space-y-8 relative z-10">
                    <div className="bg-white w-32 h-32 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-100 border border-slate-50 relative group transition-transform group-hover:scale-110 duration-700">
                      <Activity className="h-16 w-16 text-slate-200 group-hover:text-blue-500 transition-colors duration-700" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight">Trung tâm Tài chính sẵn sàng</h3>
                      <p className="text-slate-400 font-bold leading-relaxed px-10">Vui lòng cung cấp chu kỳ thời gian phía trên để khởi tạo báo cáo phân tích tài chính chuyên sâu.</p>
                    </div>
                    <Button onClick={() => fetchData()} className="h-16 px-12 bg-slate-950 hover:bg-blue-600 text-white font-black rounded-2xl shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-[0.2em] text-xs">
                      Bắt đầu phân tích
                    </Button>
                  </div>
               </Card>
            )}

            {}
            {loading && (
               <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-3xl animate-in fade-in duration-700">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full border-[6px] border-slate-100 border-t-blue-600 animate-spin shadow-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Activity className="h-10 w-10 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-12 space-y-4 text-center">
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-600/60 block animate-pulse italic">Quantum Data Processing</span>
                    <h2 className="text-2xl font-black text-slate-900">Đang đồng bộ hóa hệ thống tài chính...</h2>
                    <p className="text-slate-400 font-bold text-sm">Phân tích hành triệu chi tiết điểm dữ liệu kết quả kinh doanh</p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
