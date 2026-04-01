"use client"

import { useState, useEffect, useMemo } from "react"
import {
  DollarSign, Package, AlertTriangle, ArrowUpRight,
  Loader2, Users, CalendarIcon,
  UserCheck, ChevronDown, Bell, Activity
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { MedicineService, type Medicine } from "../../features/inventory/services/medicine.service"
import { DashboardService, type DashboardData } from "../../features/admin/services/dashboard.service"
import { ShiftService, type DoctorOnDuty } from "../../features/shift/services/shift.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function AdminDashboardPage() {
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<DoctorOnDuty[]>([])
  const [isLoadingOnDuty, setIsLoadingOnDuty] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastActivityCount, setLastActivityCount] = useState(0)
  const [chartRange, setChartRange] = useState(7)
  const [statusRange, setStatusRange] = useState<'today' | 'month'>('month')
  const [isChartLoading, setIsChartLoading] = useState(false)


  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchDashboardData(),
        fetchAlerts(),
        fetchDoctorsOnDuty()
      ])
      setIsLoading(false)
    }
    init()
  }, [])

  const fetchDoctorsOnDuty = async () => {
    try {
      setIsLoadingOnDuty(true)
      const data = await ShiftService.getDoctorsOnDuty()
      setDoctorsOnDuty(data)
    } catch (error) {
      console.error('Failed to fetch doctors on duty:', error)
    } finally {
      setIsLoadingOnDuty(false)
    }
  }



  const fetchDashboardData = async (days: number = chartRange) => {
    try {
      setIsChartLoading(true)
      const data = await DashboardService.getDashboardData(days)
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsChartLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const [lowStockResponse, expiringResponse] = await Promise.all([
        MedicineService.getLowStockMedicines({ page: 1, limit: 5 }),
        MedicineService.getExpiringMedicines({ page: 1, limit: 5 }),
      ])
      
      setLowStockMedicines(lowStockResponse.medicines || [])
      setExpiringMedicines(expiringResponse.medicines || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  
  const revenueData = useMemo(() => dashboardData?.charts?.dailyRevenue || [], [dashboardData])
  const overview = dashboardData?.overview
  const activities = dashboardData?.recentActivities || []

  
  useEffect(() => {
    if (activities.length > lastActivityCount && lastActivityCount !== 0) {
      setIsExpanded(true)
    }
    setLastActivityCount(activities.length)
  }, [activities.length, lastActivityCount])
  const appointmentStats = useMemo(() => {
    const dist = statusRange === 'today' 
      ? dashboardData?.charts?.todayStatusDistribution || []
      : dashboardData?.charts?.monthlyStatusDistribution || []
    
    const total = dist.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0)
    
    const colors: Record<string, string> = {
      COMPLETED: "#10b981", 
      NO_SHOW: "#3b82f6",   
      IN_PROGRESS: "#f59e0b",
      CHECKED_IN: "#ef4444", 
      WAITING: "#64748b",    
      CANCELLED: "#94a3b8"   
    }

    const labels: Record<string, string> = {
      COMPLETED: "Hoàn thành",
      NO_SHOW: "Vắng mặt",
      IN_PROGRESS: "Đang thực hiện",
      CHECKED_IN: "Đã check-in",
      WAITING: "Đang chờ",
      CANCELLED: "Đã hủy"
    }

    return dist.map((item: { status: string; count: number }) => ({
      name: labels[item.status] || item.status,
      value: item.count,
      percent: total > 0 ? ((item.count / total) * 100).toFixed(1) : "0",
      color: colors[item.status] || "#cbd5e1"
    }))
  }, [dashboardData, statusRange])

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex h-[80vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary/60" />
            <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 bg-slate-50/50 min-h-screen">
        {}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between mb-6 md:mb-8 lg:mb-10 gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Chào ngày mới, <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary via-blue-600 to-indigo-600 drop-shadow-sm">Admin</span>
            </h1>
            <div className="flex items-center gap-3 pl-1">
              <p className="text-slate-500 flex items-center gap-2 font-bold text-sm md:text-base">
                <CalendarIcon className="h-4 w-4 text-primary/60" />
                {format(new Date(), "eeee, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })}
              </p>
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <p className="text-slate-400 font-bold text-sm">{format(new Date(), "HH:mm")}</p>
            </div>
          </div>
          

        </header>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            { 
              label: "Doanh thu hôm nay", 
              value: formatCurrency(overview?.revenue?.today || 0), 
              change: `${(overview?.revenue?.today ?? 0) > 0 ? '+' : ''}${overview?.revenue?.change || 0}%`, 
              trend: (overview?.revenue?.change || 0) >= 0 ? "up" : "down",
              icon: DollarSign, 
              gradient: "from-emerald-400 to-teal-600",
              shadow: "shadow-emerald-200/40",
              accent: "bg-emerald-500"
            },
            { 
              label: "Bệnh nhân mới", 
              value: overview?.patients.today || 0, 
              change: `+${overview?.patients.change || 0}%`, 
              trend: "up",
              icon: Users, 
              gradient: "from-blue-400 to-indigo-600",
              shadow: "shadow-blue-200/40",
              accent: "bg-blue-500"
            },
            { 
              label: "Lịch hẹn", 
              value: overview?.appointments.today || 0, 
              change: `+${overview?.appointments.change || 0}%`, 
              trend: "up",
              icon: CalendarIcon, 
              gradient: "from-purple-400 to-fuchsia-600",
              shadow: "shadow-purple-200/40",
              accent: "bg-purple-500"
            },
            { 
              label: "Kho thuốc", 
              value: overview?.medicationStock || 0, 
              change: "Trong kho", 
              trend: "neutral",
              icon: Package, 
              gradient: "from-amber-400 to-orange-600",
              shadow: "shadow-amber-200/40",
              accent: "bg-amber-500"
            }
          ].map((item, idx) => (
            <Card key={idx} className={`group border-0 shadow-xl ${item.shadow} hover:shadow-2xl transition-all duration-500 bg-white rounded-[28px] overflow-hidden relative border border-white/40`}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-[0.05] group-hover:opacity-10 transition-opacity duration-700 blur-2xl rounded-full -mr-12 -mt-12`} />
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div className={`p-3.5 rounded-xl bg-gradient-to-br ${item.gradient} text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-md`}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <Badge className={`border-0 font-black text-[9px] px-2.5 py-1 shadow-sm rounded-lg ${item.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : item.trend === 'down' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
                    {item.change}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-[1.5px] mb-1.5">{item.label}</h3>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter group-hover:translate-x-1 transition-transform">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {}
        <Card className="border-0 shadow-2xl shadow-rose-200/20 bg-white overflow-hidden rounded-2xl md:rounded-[28px] border border-white/60 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                {}
                <div className="p-4 md:p-6 lg:w-1/4 bg-slate-50/30 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="h-11 w-11 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm shadow-rose-200/40 shrink-0">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight whitespace-nowrap">Trung tâm cảnh báo</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">Hệ thống kho & Dược</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="w-fit border-rose-100 bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1 rounded-xl whitespace-nowrap shrink-0 animate-pulse">
                        {lowStockMedicines.length + expiringMedicines.length} VẤN ĐỀ CẦN XỬ LÝ
                    </Badge>
                </div>

                {}
                <div className="flex-1 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-3 border-rose-500 pl-3">Sắp hết hàng</p>
                            <Link to="/pharmacy" className="text-[9px] font-black text-primary hover:underline uppercase tracking-tight">Xem tất cả</Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {lowStockMedicines.length === 0 ? (
                                <p className="text-[11px] text-slate-300 font-bold py-2 italic text-center col-span-2">Không có cảnh báo tồn kho</p>
                            ) : lowStockMedicines.slice(0, 4).map(m => (
                                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                                    <span className="text-[11px] font-black text-slate-700 truncate mr-2">{m.name}</span>
                                    <span className="text-[10px] font-black text-rose-600 bg-white px-1.5 py-0.5 rounded border border-rose-50 shrink-0">
                                        {m.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-3 border-amber-500 pl-3">Sắp hết hạn</p>
                            <Link to="/pharmacy" className="text-[9px] font-black text-primary hover:underline uppercase tracking-tight">Chi tiết</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                             {expiringMedicines.length === 0 ? (
                                <p className="text-[11px] text-slate-300 font-bold py-2 italic text-center col-span-2">Mọi thứ đều trong hạn sử dụng</p>
                            ) : expiringMedicines.slice(0, 4).map(m => (
                                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all">
                                    <span className="text-[11px] font-black text-slate-700 truncate mr-2">{m.name}</span>
                                    <span className="text-[9px] font-black text-amber-600 bg-white px-1.5 py-0.5 rounded border border-amber-50 shrink-0">
                                        {format(new Date(m.expiryDate), "dd/MM")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        {}
        <div className="space-y-8">

            {}
            <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-2xl md:rounded-[24px] border border-white/40 group/chart">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-50 py-4 md:py-6 px-4 md:px-8 bg-slate-50/10 gap-3 md:gap-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 mb-0.5">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <DollarSign className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Xu hướng doanh thu</CardTitle>
                  </div>
                  <CardDescription className="text-slate-500 font-bold pl-0 sm:pl-9 text-xs">Thống kê thanh toán {chartRange} ngày gần nhất</CardDescription>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1">
                    <button 
                      onClick={() => {
                        setChartRange(7);
                        fetchDashboardData(7);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartRange === 7 ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                      7 Ngày
                    </button>
                    <button 
                      onClick={() => {
                        setChartRange(30);
                        fetchDashboardData(30);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${chartRange === 30 ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                      30 Ngày
                    </button>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl border-slate-200 font-black hover:bg-slate-50 shadow-sm transition-all text-[10px]">
                    Xuất CSV
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 md:pt-8 pb-4 md:pb-6 px-3 md:px-6 h-[250px] md:h-[300px] lg:h-[320px] relative">
                {isChartLoading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex items-center justify-center animate-in fade-in duration-300">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 900 }} 
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '6 6' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '24px', 
                        border: '1px solid rgba(255, 255, 255, 0.4)', 
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        padding: '16px 20px'
                      }}
                      itemStyle={{ fontWeight: 900, color: '#0f172a', fontSize: '14px' }}
                      labelStyle={{ color: '#64748b', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '9px' }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={2500}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#3b82f6' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {}
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-2xl md:rounded-[24px] border border-white/40">
                  <CardHeader className="pb-2 px-6 pt-6 border-b border-slate-50/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-black flex items-center gap-2.5">
                      <div className="bg-blue-50 p-2 rounded-xl">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      Thống kê trạng thái
                    </CardTitle>
                    <div className="bg-slate-100/80 p-0.5 rounded-lg flex gap-0.5">
                        <button 
                            onClick={() => setStatusRange('today')}
                            className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tight transition-all ${statusRange === 'today' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:bg-white/50'}`}
                        >
                            Hôm nay
                        </button>
                        <button 
                            onClick={() => setStatusRange('month')}
                            className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tight transition-all ${statusRange === 'month' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:bg-white/50'}`}
                        >
                            Tháng {format(new Date(), "MM")}
                        </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[160px] w-full mb-6 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={appointmentStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={75}
                            paddingAngle={10}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                          >
                            {appointmentStats.map((entry: { color: string }, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '16px', 
                              border: 'none', 
                              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                              fontSize: '11px',
                              fontWeight: 900
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {statusRange === 'today' ? 'Hôm nay' : 'Trong tháng'}
                        </span>
                        <span className="text-2xl font-black text-slate-900 leading-none">
                          {appointmentStats.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {appointmentStats.map((item: { color: string; name: string; percent: string | number }, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/30 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 group">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate">{item.name}</span>
                          </div>
                          <p className="text-base font-black text-slate-900 leading-none group-hover:scale-105 transition-transform origin-left">{item.percent}%</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {}
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-2xl md:rounded-[24px] border border-white/40">
                  <CardHeader className="pb-3 px-6 pt-6 border-b border-slate-50/50">
                    <CardTitle className="text-sm font-black flex items-center gap-2.5">
                      <div className="bg-emerald-50 p-2 rounded-xl">
                        <UserCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      Bác sĩ đang trực
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                      {isLoadingOnDuty ? (
                        <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-primary/20" /></div>
                      ) : doctorsOnDuty.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-slate-50/30 rounded-[20px] border border-dashed border-slate-200 group/empty">
                          <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 group-hover/empty:scale-110 transition-transform">
                            <Users className="h-6 w-6 text-slate-200" />
                          </div>
                          <h4 className="text-slate-400 font-black text-[9px] uppercase tracking-[2px]">Hiện không có bác sĩ trực</h4>
                          <p className="text-[10px] text-slate-300 font-bold mt-1">Hệ thống sẽ cập nhật khi có ca trực mới</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {doctorsOnDuty.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-[18px] bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 transition-all border border-transparent hover:border-slate-100 group cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <Avatar className="h-9 w-9 border-2 border-white shadow-md transition-transform group-hover:scale-105">
                                    {d.avatar && (
                                      <img 
                                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${d.avatar}`} 
                                        alt={d.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-black text-[10px]">
                                      {d.fullName.split(' ').pop()?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                                </div>
                                <div>
                                  <p className="text-[13px] font-black text-slate-800 leading-none mb-1 group-hover:text-primary transition-colors">{d.fullName}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{d.specialty}</p>
                                </div>
                              </div>
                              <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
            </div>
        </div>
      </div>

      {}
      <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isExpanded ? 'w-[calc(100vw-2rem)] max-w-[340px] md:w-[340px]' : 'w-12 h-12 md:w-14 md:h-14'}`}>
        <Card className={`border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl overflow-hidden border border-white/40 ring-1 ring-slate-200/50 transition-all duration-500 ${!isExpanded ? 'rounded-full h-12 md:h-14' : 'rounded-2xl md:rounded-[28px] h-[90vh] max-h-[520px]'}`}>
            <div 
                className={`flex items-center cursor-pointer transition-all duration-300 ${isExpanded ? 'p-5 justify-between border-b border-slate-100/50 bg-slate-50/30' : 'h-full w-full justify-center hover:scale-110 active:scale-90'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className={`flex items-center gap-3 ${!isExpanded ? 'justify-center' : ''}`}>
                    <div className={`rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 dark:shadow-none relative transition-all duration-500 ${isExpanded ? 'h-9 w-9' : 'h-10 w-10'}`}>
                        <Bell className={`h-4.5 w-4.5 text-white ${activities.length > 0 && !isExpanded ? 'animate-bounce' : ''}`} />
                        {activities.length > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                                    {activities.length > 9 ? '9+' : activities.length}
                                </span>
                            </div>
                        )}
                    </div>
                    {isExpanded && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                          <span className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Thông báo</span>
                          <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE
                          </span>
                        </div>
                    )}
                </div>
                {isExpanded && (
                    <div className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronDown className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                )}
            </div>
            
            {isExpanded && (
                <div className="flex flex-col h-[calc(520px-77px)] animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 bg-slate-50/20">
                        <div className="space-y-2.5">
                            {activities.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                                      <Activity className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Không có dữ liệu</p>
                                </div>
                            ) : (
                                activities.map((act, idx) => (
                                    <div key={act.id} className="p-3.5 rounded-[20px] bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-slate-200/30 hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-3 group cursor-default">
                                        <div className="relative shrink-0 mt-0.5">
                                            <Avatar className="h-9 w-9 border-2 border-slate-50 shadow-sm">
                                                {act.user?.avatar && (
                                                    <img 
                                                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${act.user.avatar}`} 
                                                        alt={act.user.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <AvatarFallback className={`text-white text-[10px] font-black ${idx % 3 === 0 ? 'bg-indigo-500' : idx % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                                                    {act.user?.fullName?.charAt(0) || "S"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                                                act.type === 'appointment' ? 'bg-blue-500' : 
                                                act.type === 'invoice' ? 'bg-emerald-500' : 
                                                act.type === 'visit' ? 'bg-purple-500' : 'bg-indigo-500'
                                            }`}>
                                                <div className="h-1 w-1 rounded-full bg-white animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{act.type}</p>
                                                <p className="text-[9px] font-black text-slate-400 tabular-nums">
                                                    {format(new Date(act.timestamp), "HH:mm")}
                                                </p>
                                            </div>
                                            <p className="text-[12px] font-bold text-slate-700 leading-tight mb-1.5 group-hover:text-slate-900 transition-colors line-clamp-2">
                                                {act.description}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                <p className="text-[10px] text-slate-400 font-bold">{act.user?.fullName || "Hệ thống"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                        <Link 
                            to="/admin/logs" 
                            className="text-[9px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-[1.5px]"
                        >
                            Log Registry
                        </Link>
                        <Button variant="ghost" size="sm" className="h-7 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
                          Read All
                        </Button>
                    </div>
                </div>
            )}
        </Card>
      </div>
    </AdminSidebar>
  )
}
