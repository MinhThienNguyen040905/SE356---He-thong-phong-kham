import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/layout/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
  Legend
} from "recharts";
import { 
  AlertTriangle, 
  Download, 
  Pill, 
  Package, 
  Clock, 
  Loader2,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  FileText,
  ShieldAlert,
  Timer,
  XCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";


interface Medicine {
  id: number;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
}

interface TopMedicine {
  medicine: Medicine;
  totalQuantity: number;
  prescriptionCount: number;
  estimatedRevenue: number;
}

interface MedicineAlert {
  id: number;
  medicineCode: string;
  medicineName: string;
  currentQuantity: number;
  minStockLevel: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  alertType: 'low-stock' | 'expiring' | 'expired';
}

interface TopMedicinesResponse {
  topMedicines: TopMedicine[];
}

interface MedicineAlertsResponse {
  lowStockMedicines: MedicineAlert[];
  expiringMedicines: MedicineAlert[];
  expiredMedicines: MedicineAlert[];
  summary: {
    totalLowStock: number;
    totalExpiring: number;
    totalExpired: number;
    urgentCount: number;
  };
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[180px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{payload[0]?.payload?.fullName || label}</p>
        <div className="space-y-1">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">{p.name}</span>
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

export default function MedicineReportPage() {
  const [activeTab, setActiveTab] = useState("top-medicines");
  
  
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [limit, setLimit] = useState<string>("10");
  const [loadingTop, setLoadingTop] = useState(false);
  const [topMedicinesData, setTopMedicinesData] = useState<TopMedicinesResponse | null>(null);
  
  
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<string>("30");
  const [minStock, setMinStock] = useState<string>("10");
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [medicineAlertsData, setMedicineAlertsData] = useState<MedicineAlertsResponse | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 01" }, { value: "2", label: "Tháng 02" },
    { value: "3", label: "Tháng 03" }, { value: "4", label: "Tháng 04" },
    { value: "5", label: "Tháng 05" }, { value: "6", label: "Tháng 06" },
    { value: "7", label: "Tháng 07" }, { value: "8", label: "Tháng 08" },
    { value: "9", label: "Tháng 09" }, { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" }, { value: "12", label: "Tháng 12" },
  ];

  
  const fetchTopMedicines = useCallback(async () => {
    try {
      setLoadingTop(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      params.append("limit", limit);
      if (month) params.append("month", month);

      const response = await api.get(`/reports/top-medicines?${params.toString()}`);
      if (response.data.success) {
        setTopMedicinesData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching top medicines:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo thuốc");
    } finally {
      setLoadingTop(false);
    }
  }, [year, month, limit]);

  
  const fetchMedicineAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const params = new URLSearchParams();
      params.append("daysUntilExpiry", daysUntilExpiry);
      params.append("minStock", minStock);

      const response = await api.get(`/reports/medicine-alerts?${params.toString()}`);
      if (response.data.success) {
        setMedicineAlertsData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu cảnh báo");
      }
    } catch (error: any) {
      console.error("Error fetching medicine alerts:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải cảnh báo thuốc");
    } finally {
      setLoadingAlerts(false);
    }
  }, [daysUntilExpiry, minStock]);

  useEffect(() => {
    fetchTopMedicines();
    fetchMedicineAlerts();
  }, []);

  const handleExportTopMedicinesPDF = async () => {
    try {
      toast.info("Đang khởi tạo tệp PDF...");
      const params = new URLSearchParams();
      params.append("year", year.toString());
      params.append("limit", limit);
      if (month) params.append("month", month);

      const response = await api.get(`/reports/top-medicines/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `top-medicines-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công!");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  const handleExportAlertsPDF = async () => {
    try {
      toast.info("Đang khởi tạo tệp PDF...");
      const response = await api.get(`/reports/medicine-alerts/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `medicine-alerts-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công!");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
    }).format(value) + " VND";
  };

  const topMedicinesChartData = (topMedicinesData?.topMedicines || []).map((item, idx) => ({
    name: item.medicine.name.length > 12 ? item.medicine.name.substring(0, 12) + "..." : item.medicine.name,
    fullName: item.medicine.name,
    quantity: item.totalQuantity,
    revenue: item.estimatedRevenue,
    prescriptions: item.prescriptionCount,
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  const getAlertBadge = (alertType: string) => {
    switch (alertType) {
      case 'low-stock':
        return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-red-200">Sắp hết</Badge>;
      case 'expiring':
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-amber-200">Sắp hết hạn</Badge>;
      case 'expired':
        return <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-slate-200">Đã hết hạn</Badge>;
      default:
        return null;
    }
  };

  
  const alertsPieData = medicineAlertsData ? [
    { name: 'Sắp hết', value: medicineAlertsData.summary?.totalLowStock ?? 0, fill: '#ef4444' },
    { name: 'Sắp hết hạn', value: medicineAlertsData.summary?.totalExpiring ?? 0, fill: '#f59e0b' },
    { name: 'Đã hết hạn', value: medicineAlertsData.summary?.totalExpired ?? 0, fill: '#64748b' },
  ].filter(item => item.value > 0) : [];

  const totalAlerts = (medicineAlertsData?.summary?.totalLowStock ?? 0) + 
                      (medicineAlertsData?.summary?.totalExpiring ?? 0) + 
                      (medicineAlertsData?.summary?.totalExpired ?? 0);

  
  const totalRevenue = topMedicinesData?.topMedicines?.reduce((sum, item) => sum + item.estimatedRevenue, 0) || 0;
  const totalQuantity = topMedicinesData?.topMedicines?.reduce((sum, item) => sum + item.totalQuantity, 0) || 0;

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] bg-cyan-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            <div className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-3xl p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-teal-400/5 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Pill className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black uppercase tracking-[0.2em] text-[9px] px-2.5 py-0.5 rounded-full animate-in fade-in slide-in-from-left-4 duration-700">
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-500 animate-spin-slow" />
                        Inventory Intel
                      </Badge>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Real-time
                      </div>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                      Báo cáo kho thuốc
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                       Thống kê kê đơn & quản trị tồn kho hệ thống
                    </p>
                  </div>
                </div>

                {}
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/60 backdrop-blur-xl rounded-[20px] px-5 py-2.5 border border-white/60 shadow-sm group/stat hover:bg-emerald-50/50 transition-all duration-500">
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 leading-none">
                      <Package className="w-2.5 h-2.5" /> Tổng thuốc top
                    </p>
                    <p className="text-[15px] font-black text-slate-800 leading-none tabular-nums">
                      {topMedicinesData?.topMedicines?.length || 0} <span className="text-[10px] text-slate-400 font-bold ml-0.5">Mặt hàng</span>
                    </p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-xl rounded-[20px] px-5 py-2.5 border border-white/60 shadow-sm group/stat hover:bg-amber-50/50 transition-all duration-500">
                    <p className="text-amber-600 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 leading-none">
                      <AlertCircle className="w-2.5 h-2.5" /> Chỉ số cảnh báo
                    </p>
                    <p className="text-[15px] font-black text-slate-800 leading-none tabular-nums flex items-center gap-1.5">
                      {totalAlerts}
                      {totalAlerts > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="bg-white/60 backdrop-blur-xl p-2 rounded-[28px] border border-white/60 shadow-xl shadow-slate-200/40 w-fit">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
                  <TabsList className="bg-transparent h-auto p-0 gap-1.5 border-0">
                    <TabsTrigger 
                      value="top-medicines" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200/50 rounded-[22px] px-7 py-3 font-bold text-slate-500 transition-all duration-500 flex items-center gap-2.5 h-12"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Thuốc dùng nhiều
                    </TabsTrigger>
                    <TabsTrigger 
                      value="alerts" 
                      className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200/50 rounded-[22px] px-7 py-3 font-bold text-slate-500 transition-all duration-500 flex items-center gap-2.5 h-12 relative"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Cảnh báo thuốc
                      {totalAlerts > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse ring-4 ring-white">
                          {totalAlerts}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={activeTab === "top-medicines" ? handleExportTopMedicinesPDF : handleExportAlertsPDF}
                  disabled={(activeTab === "top-medicines" ? !topMedicinesData || loadingTop : !medicineAlertsData || loadingAlerts)}
                  className="bg-white/80 backdrop-blur-xl hover:bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl px-6 h-14 font-black shadow-lg shadow-emerald-200/20 transition-all hover:-translate-y-1 hover:shadow-xl group"
                >
                  <Download className="h-5 w-5 mr-3 group-hover:bounce transition-all" />
                  Xuất Báo cáo PDF
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8 space-y-8">
              <TabsContent value="top-medicines" className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {}
                <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/40">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 px-4 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[140px]">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                        <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none font-black text-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          {years.map((y) => <SelectItem key={y} value={y.toString()} className="font-bold py-3 rounded-xl">{y}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 px-4 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[170px]">
                      <FileText className="w-4 h-4 text-teal-500" />
                      <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                        <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none font-black text-slate-700">
                          <SelectValue placeholder="Tất cả tháng" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          <SelectItem value="0" className="font-bold py-3 rounded-xl">Tất cả tháng</SelectItem>
                          {months.map((m) => <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl">{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-3 px-4 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[140px]">
                      <Package className="w-4 h-4 text-cyan-500" />
                      <Select value={limit} onValueChange={setLimit}>
                        <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none font-black text-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                          <SelectItem value="5" className="font-bold py-3 rounded-xl">Top 5</SelectItem>
                          <SelectItem value="10" className="font-bold py-3 rounded-xl">Top 10</SelectItem>
                          <SelectItem value="15" className="font-bold py-3 rounded-xl">Top 15</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden lg:block" />

                    <Button 
                      onClick={fetchTopMedicines} 
                      disabled={loadingTop}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-8 h-12 font-black shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                    >
                      {loadingTop ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Phân tích
                    </Button>

                    <Button 
                      onClick={() => { setYear(currentYear); setMonth(""); setLimit("10"); }}
                      variant="ghost"
                      className="h-12 w-12 rounded-2xl p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {loadingTop ? (
                  <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse" />
                      <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-emerald-500 animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-bold text-slate-400">Đang phân tích dữ liệu thuốc...</p>
                  </div>
                ) : topMedicinesData && topMedicinesData.topMedicines.length > 0 ? (
                  <div className="space-y-6">
                    {}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
                      {[
                        { 
                          label: "Tổng số lượng", 
                          value: totalQuantity, 
                          desc: "đơn vị thuốc đã kê",
                          icon: Package, 
                          color: "emerald",
                          shadow: "shadow-emerald-500/10"
                        },
                        { 
                          label: "Doanh thu dự kiến", 
                          value: formatCurrency(totalRevenue), 
                          desc: "giá trị từ danh mục top",
                          icon: TrendingUp, 
                          color: "indigo",
                          shadow: "shadow-indigo-500/10"
                        },
                        { 
                          label: "Kỳ báo cáo", 
                          value: month ? `Tháng ${month.padStart(2, '0')}/${year}` : `Năm ${year}`, 
                          desc: "phạm vi dữ liệu",
                          icon: Calendar, 
                          color: "rose",
                          shadow: "shadow-rose-500/10"
                        }
                      ].map((item, idx) => (
                        <Card key={idx} className={`group relative border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl`}>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                            item.color === 'emerald' ? 'bg-emerald-600' : 
                            item.color === 'indigo' ? 'bg-indigo-600' : 'bg-rose-600'
                          }`} />
                          <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                              item.color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/40' : 
                              item.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-500/40' : 'bg-rose-600 shadow-rose-500/40'
                            }`}>
                              <item.icon className="h-7 w-7 text-white" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                              <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                                {typeof item.value === 'number' ? item.value.toLocaleString('vi-VN') : item.value}
                              </h4>
                              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      {}
                      <Card className="lg:col-span-3 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80 transition-all hover:shadow-emerald-100/50">
                        <CardHeader className="p-10 border-b border-slate-50">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                              </div>
                              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Biểu đồ Top Thuốc</CardTitle>
                            </div>
                            <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">
                              {month ? `Tháng ${month}/${year}` : `Năm ${year}`} • Top {limit} danh mục dược phẩm được kê đơn tối đa
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="p-10 h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMedicinesChartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                              <defs>
                                {topMedicinesChartData.map((_, idx) => (
                                  <linearGradient key={idx} id={`barGradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={0.6} />
                                    <stop offset="100%" stopColor={CHART_COLORS[idx % CHART_COLORS.length]} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '900' }} />
                              <YAxis 
                                type="category" 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                width={120}
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: '900' }}
                              />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                              <Bar dataKey="quantity" radius={[0, 12, 12, 0]} barSize={26} animationDuration={2000}>
                                {topMedicinesChartData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={`url(#barGradient-${index % CHART_COLORS.length})`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {}
                      <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/60">
                        <CardHeader className="p-10 border-b border-slate-50">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm">
                              <Sparkles className="h-5 w-5 text-indigo-600" />
                            </div>
                            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Medicine Ranking</CardTitle>
                          </div>
                          <CardDescription className="font-bold text-slate-400 pl-14 uppercase tracking-widest text-[10px] italic">Danh sách chi tiết hiệu năng kê đơn</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                            {topMedicinesData.topMedicines.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="group relative overflow-hidden flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border border-transparent hover:border-slate-100"
                              >
                                <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200' : 
                                  idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-lg shadow-slate-200' :
                                  idx === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-200' : 
                                  'bg-white text-slate-400 shadow-sm border border-slate-100'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="relative z-10 flex-1 min-w-0">
                                  <h4 className="font-black text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{item.medicine.name}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="border-slate-200 text-[9px] font-black uppercase tracking-widest px-2 py-0 h-4 bg-white">
                                      {item.medicine.code}
                                    </Badge>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.medicine.unit}</span>
                                  </div>
                                </div>
                                <div className="relative z-10 text-right shrink-0">
                                  <span className="text-xl font-black text-slate-900 tabular-nums">{item.totalQuantity.toLocaleString()}</span>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{item.prescriptionCount} lượt kê</p>
                                </div>
                                
                                {}
                                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-16 flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-6 rounded-full mb-6">
                        <Pill className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy dữ liệu</h3>
                      <p className="text-slate-500 mb-6 text-center max-w-sm">Vui lòng thay đổi bộ lọc và thử lại.</p>
                      <Button onClick={fetchTopMedicines} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold">
                        Tải lại
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {}
              <TabsContent value="alerts" className="space-y-6 animate-in fade-in-50 duration-500">
                {}
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Timer className="h-3 w-3" /> Sắp hết hạn (ngày)
                        </label>
                        <Select value={daysUntilExpiry} onValueChange={setDaysUntilExpiry}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="7" className="font-semibold py-2.5 rounded-lg">7 ngày</SelectItem>
                            <SelectItem value="14" className="font-semibold py-2.5 rounded-lg">14 ngày</SelectItem>
                            <SelectItem value="30" className="font-semibold py-2.5 rounded-lg">30 ngày</SelectItem>
                            <SelectItem value="60" className="font-semibold py-2.5 rounded-lg">60 ngày</SelectItem>
                            <SelectItem value="90" className="font-semibold py-2.5 rounded-lg">90 ngày</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Package className="h-3 w-3" /> Tồn kho tối thiểu
                        </label>
                        <Select value={minStock} onValueChange={setMinStock}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="5" className="font-semibold py-2.5 rounded-lg">5 đơn vị</SelectItem>
                            <SelectItem value="10" className="font-semibold py-2.5 rounded-lg">10 đơn vị</SelectItem>
                            <SelectItem value="20" className="font-semibold py-2.5 rounded-lg">20 đơn vị</SelectItem>
                            <SelectItem value="50" className="font-semibold py-2.5 rounded-lg">50 đơn vị</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={fetchMedicineAlerts} 
                        disabled={loadingAlerts}
                        className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
                      >
                        {loadingAlerts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                        Cập nhật
                      </Button>
                      
                      <Button 
                        onClick={() => { setDaysUntilExpiry("30"); setMinStock("10"); }}
                        variant="outline"
                        className="h-12 rounded-xl font-semibold border-2 border-slate-200 hover:bg-slate-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Đặt lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {loadingAlerts ? (
                  <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-pulse" />
                      <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-amber-500 animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-bold text-slate-400">Đang kiểm tra cảnh báo thuốc...</p>
                  </div>
                ) : medicineAlertsData ? (
                  <div className="space-y-6">
                    {}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-1">
                      {[
                        { 
                          label: "Sắp hết hàng", 
                          value: medicineAlertsData.summary?.totalLowStock ?? 0, 
                          desc: "cần nhập kho ngay",
                          icon: Package, 
                          color: "red",
                          shadow: "shadow-red-500/10"
                        },
                        { 
                          label: "Sắp hết hạn", 
                          value: medicineAlertsData.summary?.totalExpiring ?? 0, 
                          desc: "theo dõi chặt chẽ",
                          icon: Clock, 
                          color: "amber",
                          shadow: "shadow-amber-500/10"
                        },
                        { 
                          label: "Đã hết hạn", 
                          value: medicineAlertsData.summary?.totalExpired ?? 0, 
                          desc: "loại bỏ khỏi kho",
                          icon: XCircle, 
                          color: "slate",
                          shadow: "shadow-slate-500/10"
                        },
                        { 
                          label: "Khẩn cấp", 
                          value: medicineAlertsData.summary?.urgentCount ?? 0, 
                          desc: "xử lý ưu tiên cao",
                          icon: AlertTriangle, 
                          color: "orange",
                          shadow: "shadow-orange-500/10",
                          pulse: true
                        }
                      ].map((item, idx) => (
                        <Card key={idx} className={`group relative border-0 shadow-2xl ${item.shadow} bg-white rounded-[40px] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl`}>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 blur-3xl ${
                            item.color === 'red' ? 'bg-red-600' : 
                            item.color === 'amber' ? 'bg-amber-600' : 
                            item.color === 'slate' ? 'bg-slate-600' : 'bg-orange-600'
                          }`} />
                          <CardContent className="p-10 relative z-10 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                              item.color === 'red' ? 'bg-red-600 shadow-red-500/40' : 
                              item.color === 'amber' ? 'bg-amber-600 shadow-amber-500/40' : 
                              item.color === 'slate' ? 'bg-slate-600 shadow-slate-500/40' : 'bg-orange-600 shadow-orange-500/40'
                            }`}>
                              <item.icon className={`h-7 w-7 text-white ${item.pulse ? 'animate-pulse' : ''}`} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 leading-none italic">{item.label}</p>
                              <h4 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter tabular-nums mb-2">
                                {item.value.toLocaleString('vi-VN')}
                              </h4>
                              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">{item.desc}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {}
                      {alertsPieData.length > 0 && (
                        <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                          <CardHeader className="pb-0 pt-6 px-6">
                            <CardTitle className="text-xl font-black text-slate-800">Phân loại cảnh báo</CardTitle>
                            <CardDescription className="font-medium text-slate-400 mt-1">Tổng quan tình trạng</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={alertsPieData}
                                  cx="50%"
                                  cy="45%"
                                  innerRadius={50}
                                  outerRadius={85}
                                  paddingAngle={4}
                                  dataKey="value"
                                  strokeWidth={0}
                                >
                                  {alertsPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                  verticalAlign="bottom" 
                                  height={36}
                                  formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {}
                      <Card className={`border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden ${alertsPieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <CardHeader className="pb-2 pt-6 px-6">
                          <CardTitle className="text-xl font-black text-slate-800">Danh sách cảnh báo</CardTitle>
                          <CardDescription className="font-medium text-slate-400 mt-1">Thuốc cần được xử lý ({totalAlerts} mục)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {}
                            {medicineAlertsData.lowStockMedicines?.map((medicine) => (
                              <Link
                                key={`low-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-red-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-red-100 group"
                              >
                                <div className="bg-red-500/10 p-2.5 rounded-xl">
                                  <Package className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-red-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">Mã: {medicine.medicineCode} • Tồn: <span className="font-bold text-red-600">{medicine.currentQuantity}</span></p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                              </Link>
                            ))}

                            {}
                            {medicineAlertsData.expiringMedicines?.map((medicine) => (
                              <Link
                                key={`exp-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-amber-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-amber-100 group"
                              >
                                <div className="bg-amber-500/10 p-2.5 rounded-xl">
                                  <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-amber-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">
                                    HSD: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"} • 
                                    Còn: <span className="font-bold text-amber-600">{medicine.daysUntilExpiry} ngày</span>
                                  </p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                              </Link>
                            ))}

                            {}
                            {medicineAlertsData.expiredMedicines?.map((medicine) => (
                              <Link
                                key={`expired-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-slate-200 group"
                              >
                                <div className="bg-slate-500/10 p-2.5 rounded-xl">
                                  <XCircle className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-slate-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">
                                    HSD: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"} • Đã hết hạn
                                  </p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                              </Link>
                            ))}

                            {}
                            {totalAlerts === 0 && (
                              <div className="text-center py-12">
                                <div className="bg-emerald-100 p-4 rounded-full inline-block mb-4">
                                  <Package className="h-8 w-8 text-emerald-600" />
                                </div>
                                <p className="font-bold text-slate-700">Không có cảnh báo!</p>
                                <p className="text-sm text-slate-400 mt-1">Tất cả thuốc đều trong tình trạng tốt </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-16 flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-6 rounded-full mb-6">
                        <AlertTriangle className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy dữ liệu</h3>
                      <p className="text-slate-500 mb-6 text-center max-w-sm">Vui lòng thử lại hoặc kiểm tra kết nối.</p>
                      <Button onClick={fetchMedicineAlerts} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 font-bold">
                        Tải lại
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </AdminSidebar>
  );
}