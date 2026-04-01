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
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { 
  Calendar, 
  CheckCircle2, 
  UserMinus, 
  Activity, 
  Download, 
  Search, 
  Loader2, 
  TrendingUp,
  SlidersHorizontal,
  Users,
  FileSpreadsheet,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";


interface AppointmentTrend {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface AppointmentByStatus {
  status: string;
  count: number;
  percentage: number;
  [key: string]: any;
}

interface AppointmentByDoctor {
  doctorName: string;
  count: number;
}

interface AppointmentReportData {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    averagePerDay: number;
    completionRate: number;
  };
  overTime: AppointmentTrend[];
  byStatus: AppointmentByStatus[];
  byDoctor: AppointmentByDoctor[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];


const CustomTooltip = ({ active, payload, label, isCount = true }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[180px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                <span className="text-sm font-medium text-slate-600">{p.name}</span>
              </div>
              <span className="text-sm font-black text-slate-900">
                {typeof p.value === 'number' ? p.value.toLocaleString('vi-VN') : p.value}
                {isCount && ' lịch'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AppointmentReportPage() {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
  const [reportData, setReportData] = useState<AppointmentReportData | null>(null);

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

  const fetchAppointmentReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/appointments?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching appointment report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo lịch hẹn");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(format);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/appointments/${format}?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `Bao_cao_Lich_hen_${year}${month !== 'all' ? `_T${month}` : ""}.${extension}`;
      
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

  useEffect(() => {
    fetchAppointmentReport();
  }, [fetchAppointmentReport]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Vắng mặt",
      WAITING: "Đang chờ",
      IN_PROGRESS: "Đang thực hiện",
      CHECKED_IN: "Đã check-in"
    };
    return labels[status] || status;
  };

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc]">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="relative z-10 p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            <div className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-3xl p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms]" />
              <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-gradient-to-tl from-emerald-500/10 via-teal-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms] delay-1000" />
              
              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <div className="h-11 w-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-inner">
                        <Calendar className="h-5 w-5 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white border-0 font-black uppercase tracking-[0.25em] text-[8px] px-3 py-0.5 rounded-full shadow-lg shadow-blue-100">
                        <Sparkles className="w-3 h-3 mr-1.5 animate-spin-slow" />
                        Operation Intel
                      </Badge>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold uppercase tracking-widest text-[8px] px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full mr-1.5 animate-ping" />
                        Live
                      </Badge>
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        Hiệu suất <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Lịch hẹn</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-[11px] lg:text-xs">
                        Phân tích chuyên sâu về vận hành và xu hướng tiếp nhận bệnh nhân.
                      </p>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex gap-4">
                  {[
                    { 
                      label: "Tỷ lệ hoàn tất", 
                      value: reportData?.summary?.completionRate ? `${reportData.summary.completionRate.toFixed(1)}%` : "---",
                      icon: CheckCircle2,
                      color: "emerald",
                      gradient: "from-emerald-600 to-teal-600"
                    },
                    { 
                      label: "TB mỗi ngày", 
                      value: reportData?.summary?.averagePerDay ? reportData.summary.averagePerDay.toFixed(1) : "---",
                      icon: Clock,
                      color: "blue",
                      gradient: "from-blue-600 to-indigo-600"
                    }
                  ].map((stat, idx) => (
                    <div key={idx} className="relative group/stat">
                      <div className="absolute -inset-0.5 bg-solid opacity-0 group-hover/stat:opacity-100 transition duration-500 rounded-2xl blur-sm bg-slate-100"></div>
                      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white min-w-[180px] shadow-sm group-hover/stat:bg-white group-hover/stat:-translate-y-0.5 transition-all duration-500">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl bg-${stat.color}-50 flex items-center justify-center transition-transform group-hover/stat:scale-110 group-hover/stat:rotate-6 duration-500`}>
                            <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider leading-none mb-1 italic">
                              {stat.label}
                            </p>
                            <p className="text-[15px] font-black text-slate-900 tabular-nums tracking-tight">
                              {stat.value}
                            </p>
                          </div>
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
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5 italic">Năm báo cáo</span>
                            <div className="text-sm font-black text-slate-900 tracking-tight">Năm {year}</div>
                          </div>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px]">
                        {years.map((y) => (
                          <SelectItem key={y} value={y} className="font-bold py-3 rounded-xl focus:bg-blue-50 cursor-pointer text-slate-700">
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
                          <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl focus:bg-blue-50 cursor-pointer text-slate-700">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {}
                  <div className="flex gap-2">
                    <Button
                      onClick={fetchAppointmentReport}
                      disabled={loading}
                      className="flex-1 h-14 bg-slate-900 hover:bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border-0 group"
                    >
                      <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-all">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Search className="h-4 w-4 text-white" />}
                      </div>
                      <span className="uppercase tracking-widest text-[11px]">Phân tích</span>
                    </Button>
                    <Button
                      onClick={() => { setYear(currentYear.toString()); setMonth("all"); }}
                      variant="outline"
                      className="w-14 h-14 rounded-2xl border-2 border-slate-100 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <RefreshCw className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </div>

              {}
              <div className="flex gap-3 h-14">
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={loading || !!exportLoading}
                  className="px-6 h-full bg-white hover:bg-rose-50 text-slate-900 border-2 border-slate-100 font-black rounded-2xl shadow-xl shadow-slate-200/40 transition-all hover:-translate-y-1 active:scale-95 group"
                  variant="outline"
                >
                  <div className="bg-rose-100 p-2 rounded-xl group-hover:scale-110 transition-transform mr-3">
                    {exportLoading === 'pdf' ? <Loader2 className="w-4 h-4 text-rose-600 animate-spin" /> : <Download className="w-4 h-4 text-rose-600" />}
                  </div>
                  PDF
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
            {reportData && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { 
                    label: "Tổng lịch hẹn", 
                    value: reportData.summary.totalAppointments, 
                    icon: Calendar, 
                    color: "blue",
                    shadow: "shadow-blue-500/10",
                    desc: "Số lượng đăng ký"
                  },
                  { 
                    label: "Khám thành công", 
                    value: reportData.summary.completedAppointments, 
                    icon: CheckCircle2, 
                    color: "emerald",
                    shadow: "shadow-emerald-500/10",
                    desc: "Tỷ lệ: " + reportData.summary.completionRate.toFixed(1) + "%"
                  },
                  { 
                    label: "Số lượt hủy", 
                    value: reportData.summary.cancelledAppointments, 
                    icon: UserMinus, 
                    color: "rose",
                    shadow: "shadow-rose-500/10",
                    desc: "BN chủ động hủy"
                  },
                  { 
                    label: "Bệnh nhân vắng", 
                    value: reportData.summary.noShowAppointments, 
                    icon: Activity, 
                    color: "orange",
                    shadow: "shadow-orange-500/10",
                    desc: "Không đến theo lịch"
                  }
                ].map((item, idx) => (
                  <Card key={idx} className={`group border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden relative transition-all duration-700 hover:shadow-3xl hover:-translate-y-2`}>
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                      item.color === 'blue' ? 'bg-blue-600' : 
                      item.color === 'emerald' ? 'bg-emerald-600' : 
                      item.color === 'rose' ? 'bg-rose-600' : 'bg-orange-600'
                    }`} />
                    <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                        item.color === 'blue' ? 'bg-blue-600 shadow-blue-500/40' : 
                        item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/40' : 
                        item.color === 'rose' ? 'bg-rose-600 shadow-rose-500/40' : 'bg-orange-600 shadow-orange-500/40'
                      }`}>
                        <item.icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                        <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                          {item.value.toLocaleString()}
                        </h4>
                        <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {}
            {reportData && !loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                
                {}
                <Card className="lg:col-span-3 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-blue-100/50">
                  <CardHeader className="p-10 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Xu hướng Tiếp nhận Lịch hẹn</CardTitle>
                        </div>
                        <CardDescription className="font-bold text-slate-400 pl-13 uppercase tracking-widest text-[10px] italic">
                          Tương quan giữa tổng lịch hẹn và tỷ lệ hoàn tất qua các kỳ
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 h-[480px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.overTime} margin={{ top: 20, right: 30, left: 0, bottom: 20 }} barGap={12}>
                        <defs>
                          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '800' }} 
                          dy={10}
                          tickFormatter={(val) => month !== "all" ? val.split('-').pop()! : `Tháng ${val.split('-').pop()}`}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '800' }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 10 }} />
                        <Legend 
                           verticalAlign="top" 
                           align="right" 
                           height={40}
                           formatter={(value) => <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{value === 'total' ? 'Tổng lịch' : 'Đã hoàn thành'}</span>}
                        />
                        <Bar 
                          dataKey="total" 
                          fill="url(#totalGrad)" 
                          radius={[10, 10, 0, 0]} 
                          barSize={24} 
                          name="total"
                        />
                        <Bar 
                          dataKey="completed" 
                          fill="url(#compGrad)" 
                          radius={[10, 10, 0, 0]} 
                          barSize={24} 
                          name="completed"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {}
                <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden flex flex-col border border-white/80">
                  <CardHeader className="p-10 pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                        <Activity className="h-5 w-5 text-indigo-600" />
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Cơ cấu Trạng thái</CardTitle>
                    </div>
                    <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Phân tích tỷ lệ thực hiện lịch hẹn</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 flex-1 flex flex-col justify-between">
                    <div className="h-[280px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={reportData.byStatus}
                            cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={2}
                            dataKey="count" stroke="none" cornerRadius={8}
                          >
                            {reportData.byStatus.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-5px] bg-white/40 backdrop-blur-sm rounded-full p-6 w-32 h-32 flex flex-col items-center justify-center">
                        <span className="block text-3xl font-black text-slate-800 leading-none tabular-nums">{reportData.summary.totalAppointments}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 block">Lịch hẹn</span>
                      </div>
                    </div>

                    <div className="mt-8 space-y-3">
                      {reportData.byStatus.slice(0, 4).sort((a,b) => b.count - a.count).map((status, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 flex items-center justify-between transition-all hover:bg-white hover:shadow-md group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{getStatusLabel(status.status)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{status.percentage.toFixed(1)}%</span>
                            <p className="text-[10px] font-bold text-slate-400">{status.count} lịch</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {}
                <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-emerald-100/50">
                  <CardHeader className="p-10 pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Top Bác sĩ Tiếp nhận</CardTitle>
                    </div>
                    <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Hiệu quả xử lý lịch hẹn của đội ngũ bác sĩ</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={reportData.byDoctor.sort((a,b) => b.count - a.count).slice(0, 8)} 
                        layout="vertical"
                        margin={{ top: 5, right: 40, left: 40, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="docGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="doctorName" 
                          type="category"
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: '900' }}
                          width={140}
                        />
                        <Tooltip content={<CustomTooltip isCount={true} />} cursor={{ fill: '#f8fafc', radius: 10 }} />
                        <Bar 
                          dataKey="count" 
                          fill="url(#docGrad)" 
                          radius={[0, 12, 12, 0]} 
                          barSize={32}
                          name="Lịch hẹn"
                        >
                          {reportData.byDoctor.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill="url(#docGrad)" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>


              </div>
            ) : (
              
              <div className="flex flex-col items-center justify-center py-48 space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                  <div className="h-24 w-24 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-xl" />
                  <Activity className="h-10 w-10 text-blue-600 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center space-y-3">
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-600/60 block animate-pulse">Computing Operation Metrics</span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">Đang tổng hợp hệ thống báo cáo vận hành...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
