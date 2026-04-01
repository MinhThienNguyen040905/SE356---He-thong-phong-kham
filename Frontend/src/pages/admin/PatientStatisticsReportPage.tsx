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
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Download,
  Calendar,
  Search,
  Loader2,
  Activity,
  FileSpreadsheet,
  SlidersHorizontal,
  Sparkles,
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
  Mars,
  Venus
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";

interface PatientStats {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  inactivePatients: number;
  genderRatio: { gender: string; count: number }[];
  ageDistribution: { ageRange: string; count: number }[];
  patientGrowth: { period: string; newPatients: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[180px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">{p.name === 'count' ? 'Số lượng' : p.name}</span>
              <span className="text-sm font-black text-slate-900">
                {typeof p.value === 'number' ? p.value.toLocaleString('vi-VN') : p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function PatientStatisticsReportPage() {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PatientStats | null>(null);
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/patient-statistics?${params.toString()}`);
      if (response.data.success) {
        const rawData = response.data.data;
        
        setReportData({
          ...rawData,
          genderRatio: rawData.patientsByGender || [],
          ageDistribution: rawData.patientsByAge || [],
          patientGrowth: rawData.patientsOverTime || []
        });
      }
    } catch (error: any) {
      console.error("Error fetching report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setExportLoading(format);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/patient-statistics/${format}?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      const fileName = `Bao_cao_Benh_nhan_${year}${month !== 'all' ? `_T${month}` : ""}.${extension}`;
      
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
              <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms]" />
              <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[200%] bg-gradient-to-tl from-violet-500/10 via-purple-500/10 to-transparent blur-[80px] rounded-full animate-pulse transition-all duration-[6000ms] delay-1000" />
              
              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <div className="h-11 w-11 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-inner">
                        <Users className="h-5 w-5 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-600 text-white border-0 font-black uppercase tracking-[0.25em] text-[8px] px-3 py-0.5 rounded-full shadow-lg shadow-indigo-100">
                        <Sparkles className="w-3 h-3 mr-1.5 animate-spin-slow" />
                        Patient Intel
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50/50 text-blue-700 font-bold uppercase tracking-widest text-[8px] px-2.5 py-0.5 rounded-full backdrop-blur-md">
                        <div className="w-1 h-1 bg-blue-500 rounded-full mr-1.5 animate-ping" />
                        Live Analysis
                      </Badge>
                    </div>
                    <div>
                      <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                        Phân tích <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600">Bệnh nhân</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-[11px] lg:text-xs">
                        Thống kê chi tiết về nhân khẩu học, độ tuổi và xu hướng tăng trưởng.
                      </p>
                    </div>
                  </div>
                </div>

                {}
                <div className="flex gap-4">
                  {[
                    { 
                      label: "Tổng bệnh nhân", 
                      value: reportData?.totalPatients?.toLocaleString() || "---",
                      icon: Users,
                      color: "indigo",
                    },
                    { 
                      label: "Bệnh nhân mới", 
                      value: reportData?.newPatients?.toLocaleString() || "---",
                      icon: UserPlus,
                      color: "blue",
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
                      <SelectTrigger className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm hover:shadow-md transition-all px-6 group data-[state=open]:ring-2 ring-indigo-500/20 outline-none">
                        <div className="flex items-center gap-4 w-full text-left">
                          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-0.5 italic">Năm báo cáo</span>
                            <div className="text-sm font-black text-slate-900 tracking-tight">Năm {year}</div>
                          </div>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px]">
                        {years.map((y) => (
                          <SelectItem key={y} value={y} className="font-bold py-3 rounded-xl focus:bg-indigo-50 cursor-pointer text-slate-700">
                            Năm {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {}
                  <div className="flex-1">
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger className="h-14 w-full rounded-2xl bg-white border-0 shadow-sm hover:shadow-md transition-all px-6 group data-[state=open]:ring-2 ring-blue-500/20 outline-none">
                        <div className="flex items-center gap-4 w-full text-left">
                          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
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
                      onClick={() => fetchData()}
                      disabled={loading}
                      className="flex-1 h-14 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border-0 group"
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

            {reportData && (
              <>
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: "Bệnh nhân mới", value: reportData?.newPatients, icon: UserPlus, color: "blue", shadow: "shadow-blue-500/10", desc: "Đăng ký trong kỳ" },
                    { label: "Đang hoạt động", value: reportData?.activePatients, icon: UserCheck, color: "emerald", shadow: "shadow-emerald-500/10", desc: "Có lượt khám gần đây" },
                    { label: "Tạm ngưng", value: reportData?.inactivePatients, icon: UserX, color: "rose", shadow: "shadow-rose-500/10", desc: "Không khám trên 6 tháng" },
                    { label: "Tổng bệnh nhân", value: reportData?.totalPatients, icon: Users, color: "indigo", shadow: "shadow-indigo-500/10", desc: "Hệ thống quản lý" }
                  ].map((item, idx) => (
                    <Card key={idx} className={`group border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden relative transition-all duration-700 hover:shadow-3xl hover:-translate-y-2`}>
                      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                        item.color === 'blue' ? 'bg-blue-600' : 
                        item.color === 'emerald' ? 'bg-emerald-600' : 
                        item.color === 'rose' ? 'bg-rose-600' : 'bg-indigo-600'
                      }`} />
                      <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                          item.color === 'blue' ? 'bg-blue-600 shadow-blue-500/40' : 
                          item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/40' : 
                          item.color === 'rose' ? 'bg-rose-600 shadow-rose-500/40' : 'bg-indigo-600 shadow-indigo-500/40'
                        }`}>
                          <item.icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                          <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                            {item.value?.toLocaleString() || 0}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {}
                  <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-indigo-100/50">
                    <CardHeader className="p-10 border-b border-slate-50">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                          </div>
                          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Tăng trưởng Bệnh nhân</CardTitle>
                        </div>
                        <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Biểu đồ xu hướng bệnh nhân đăng ký mới qua từng kỳ</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData.patientGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="newPatients" name="Bệnh nhân mới" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" animationDuration={2000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {}
                  <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/60">
                    <CardHeader className="p-10 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                           <PieChartIcon className="h-5 w-5 text-blue-600" />
                         </div>
                         <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Cơ cấu Giới tính</CardTitle>
                      </div>
                      <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Tỷ lệ bệnh nhân theo giới tính</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 flex flex-col">
                      <div className="h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reportData?.genderRatio || []}
                              cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4}
                              dataKey="count" nameKey="gender" strokeWidth={0} cornerRadius={8}
                              animationBegin={0} animationDuration={1500}
                            >
                              {(reportData?.genderRatio || []).map((_, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={index === 0 ? '#4f46e5' : index === 1 ? '#ec4899' : COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none bg-white/40 backdrop-blur-sm rounded-full p-4 w-24 h-24 flex flex-col items-center justify-center shadow-inner border border-white/50">
                          <Users className="w-5 h-5 text-slate-400 mb-1" />
                          <div className="text-lg font-black text-slate-900 leading-none tabular-nums">
                             {reportData?.totalPatients?.toLocaleString()}
                          </div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Tổng BN</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-6">
                        {(reportData?.genderRatio || []).map((item, index) => {
                          const isMale = item.gender.toLowerCase().includes('nam') || item.gender.toUpperCase() === 'MALE';
                          const isFemale = item.gender.toLowerCase().includes('nữ') || item.gender.toUpperCase() === 'FEMALE';
                          
                          const color = isMale ? 'bg-indigo-600' : isFemale ? 'bg-pink-600' : 'bg-slate-400';
                          const textColor = isMale ? 'text-indigo-600' : isFemale ? 'text-pink-600' : 'text-slate-600';
                          const bgColor = isMale ? 'bg-indigo-50/50' : isFemale ? 'bg-pink-50/50' : 'bg-slate-50/50';
                          const GenderIcon = isMale ? Mars : isFemale ? Venus : Users;
                          const percentage = reportData?.totalPatients ? Math.round((item.count / reportData.totalPatients) * 100) : 0;
                          
                          return (
                            <div key={index} className={`relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl ${bgColor} border border-transparent transition-all hover:bg-white hover:shadow-lg group`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isMale ? 'bg-indigo-100 text-indigo-600' : 
                                isFemale ? 'bg-pink-100 text-pink-600' : 'bg-slate-100 text-slate-400'
                              }`}>
                                <GenderIcon className="w-4 h-4" />
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className={`text-[9px] font-black uppercase tracking-wider ${textColor} truncate`}>{item.gender}</span>
                                  <span className="text-[10px] font-black text-slate-900">{percentage}%</span>
                                </div>
                                <div className="text-sm font-black text-slate-900 leading-none">
                                  {item.count.toLocaleString()}
                                </div>
                              </div>

                              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-100/50 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${color}`} 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {}
                  <Card className="lg:col-span-3 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-amber-100/50">
                    <CardHeader className="p-10 border-b border-slate-50">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
                             <Activity className="h-5 w-5 text-amber-600" />
                           </div>
                           <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Phân phối Độ tuổi</CardTitle>
                        </div>
                        <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Phân tích chi tiết số lượng bệnh nhân theo các tầng lớp độ tuổi</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-10 h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData?.ageDistribution || []} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="ageRange" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 12 }} />
                          <Bar dataKey="count" name="Số lượng" fill="#4f46e5" radius={[12, 12, 0, 0]} barSize={50} animationDuration={2000}>
                            {(reportData?.ageDistribution || []).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {!loading && !reportData && (
               <Card className="border-0 shadow-2xl shadow-slate-300/20 bg-white/60 backdrop-blur-xl rounded-[40px] p-32 text-center border border-white/60">
                  <div className="max-w-md mx-auto space-y-8">
                    <div className="bg-white w-28 h-28 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl border border-white relative group">
                      <div className="absolute -inset-2 bg-indigo-100 rounded-[48px] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                      <Users className="h-14 w-14 text-slate-200 relative z-10" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight">Trung tâm Phân tích Dữ liệu</h3>
                      <p className="text-slate-500 font-bold leading-relaxed px-10">Vui lòng cung cấp tham số chu kỳ thời gian bên trên để khởi tạo báo cáo phân tích bệnh nhân chi tiết.</p>
                    </div>
                    <Button onClick={() => fetchData()} className="h-14 px-10 bg-slate-900 hover:bg-indigo-600 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs border-0">
                      Bắt đầu phân tích
                    </Button>
                  </div>
               </Card>
            )}

            {loading && (
               <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-3xl animate-in fade-in duration-700">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full border-[6px] border-indigo-50 border-t-indigo-600 animate-spin shadow-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Users className="h-10 w-10 text-indigo-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-12 space-y-2 text-center">
                    <p className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-600/60 block animate-pulse italic">Syncing Health Intelligence...</p>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đang khởi tạo báo cáo phân tích bệnh nhân...</h2>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>

  );
}
