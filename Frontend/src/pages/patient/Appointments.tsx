"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarDays, 
  History, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../features/auth/context/authContext";
import { usePatientAppointments } from "../../hooks/usePatientAppointments";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import PatientSidebar from "../../components/layout/sidebar/patient";
import { AppointmentStats } from "../../features/appointment/components/AppointmentStats";
import { AppointmentCard } from "../../features/appointment/components/AppointmentCard";
import { AppointmentDetailModal } from "../../features/appointment/components/AppointmentDetailModal";


interface PremiumPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function PremiumPagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  className
}: PremiumPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 ${className || "mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm"}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-medium text-gray-900">{startItem}-{endItem}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{totalItems} lịch hẹn</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">•••</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`
                  h-9 w-9 p-0 rounded-xl font-medium text-sm transition-all duration-200
                  ${currentPage === page 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700' 
                    : 'hover:bg-blue-50 hover:text-blue-600 text-gray-600'
                  }
                `}
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 rounded-xl hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  
  const { 
    appointments, 
    stats,
    selectedAppointment, 
    isDetailOpen, 
    setIsDetailOpen, 
    viewDetails, 
    cancelAppointment,
    isLoading
  } = usePatientAppointments();

  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  
  
  const [upcomingStatusFilter, setUpcomingStatusFilter] = useState("ALL");
  const [upcomingSearchQuery, setUpcomingSearchQuery] = useState("");
  
  
  const [pastStatusFilter, setPastStatusFilter] = useState("ALL");
  const [pastSearchQuery, setPastSearchQuery] = useState("");

  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  
  useEffect(() => {
    setUpcomingPage(1);
  }, [upcomingStatusFilter, upcomingSearchQuery]);
  
  useEffect(() => {
    setPastPage(1);
  }, [pastStatusFilter, pastSearchQuery]);

  
  const onInitiateCancel = (id: string) => {
    setCancelTargetId(id);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const onConfirmCancel = () => {
    if (cancelTargetId && cancelReason.trim()) {
      cancelAppointment(cancelTargetId, cancelReason);
      setIsCancelDialogOpen(false);
    }
  };

  const onBookFollowUp = (doctorId: number) => {
    navigate("/patient/book-appointment", { state: { selectedDoctorId: doctorId } });
  };

  
  const filteredUpcoming = appointments.upcoming.filter(apt => {
    
    const matchesStatus = upcomingStatusFilter === "ALL" 
      ? true 
      : upcomingStatusFilter === "CONFIRMED" 
        ? ["CHECKED_IN", "IN_PROGRESS"].includes(apt.rawStatus || "")
        : apt.rawStatus === "WAITING"; 

    
    const query = upcomingSearchQuery.toLowerCase();
    const matchesSearch = 
      apt.doctor.name.toLowerCase().includes(query) || 
      apt.doctor.specialty.toLowerCase().includes(query) ||
      apt.reason?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  
  const filteredPast = appointments.past.filter(apt => {
    
    const matchesStatus = pastStatusFilter === "ALL" 
      ? true 
      : pastStatusFilter === "COMPLETED" 
        ? apt.rawStatus === "COMPLETED"
        : ["CANCELLED", "NO_SHOW"].includes(apt.rawStatus || "");

    
    const query = pastSearchQuery.toLowerCase();
    const matchesSearch = 
      apt.doctor.name.toLowerCase().includes(query) || 
      apt.doctor.specialty.toLowerCase().includes(query) ||
      apt.reason?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  
  const totalUpcomingPages = Math.ceil(filteredUpcoming.length / ITEMS_PER_PAGE);
  const currentUpcoming = filteredUpcoming.slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE);

  const totalPastPages = Math.ceil(filteredPast.length / ITEMS_PER_PAGE);
  const currentPast = filteredPast.slice((pastPage - 1) * ITEMS_PER_PAGE, pastPage * ITEMS_PER_PAGE);

  
  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email || "Patient"}
    >
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        {}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-8 shadow-xl">
          {}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-100 text-sm font-medium px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
                  Quản lý lịch hẹn
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
                Lịch Khám Bệnh
              </h1>
              <p className="text-blue-100/90 text-lg max-w-md">
                Theo dõi và quản lý các lịch khám bệnh của bạn
              </p>
            </div>
            
            <Button 
              className="bg-white text-indigo-600 hover:bg-blue-50 shadow-xl shadow-indigo-900/20 font-semibold px-6 h-12 rounded-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/patient/book-appointment")}
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" /> Đặt lịch mới
            </Button>
          </div>
        </div>

        {}
        <AppointmentStats stats={stats} />

        {}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white p-0 rounded-2xl border border-gray-200 inline-flex shadow-lg shadow-gray-100 overflow-hidden">
              <TabsTrigger 
                value="upcoming" 
                className="group px-8 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold transition-all duration-300 border-r border-gray-100 last:border-0"
              >
                <CalendarDays className="w-4 h-4 mr-2" /> Sắp tới
                {appointments.upcoming.length > 0 && (
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-600 group-data-[state=active]:bg-white group-data-[state=active]:text-blue-600 shadow-sm">
                    {appointments.upcoming.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="group px-8 py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold transition-all duration-300"
              >
                <History className="w-4 h-4 mr-2" /> Lịch sử
                {appointments.past.length > 0 && (
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-600 group-data-[state=active]:bg-white group-data-[state=active]:text-blue-600 shadow-sm">
                    {appointments.past.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="focus:outline-none">
            {isLoading ? (
              <Card className="overflow-hidden border-gray-100 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center p-5 gap-5">
                        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : appointments.upcoming.length > 0 ? (
              <Card className="overflow-hidden border-gray-100 shadow-sm">
                {}
                <div className="p-4 border-b bg-gray-50/40">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                        <CalendarDays className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Danh sách lịch hẹn sắp tới</h3>
                        <p className="text-sm text-gray-500">
                          Hiển thị <span className="font-medium text-blue-600">{currentUpcoming.length}</span> trong tổng số <span className="font-medium text-gray-900">{filteredUpcoming.length}</span> lịch hẹn
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Tìm kiếm bác sĩ, chuyên khoa..." 
                          className="pl-10 bg-white border-gray-200 rounded-xl h-10 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                          value={upcomingSearchQuery}
                          onChange={(e) => setUpcomingSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-gray-200 w-full sm:w-auto shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400 ml-2" />
                        <Select value={upcomingStatusFilter} onValueChange={setUpcomingStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[140px] border-0 bg-transparent focus:ring-0 h-8 text-sm font-medium">
                            <SelectValue placeholder="Trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">Tất cả</SelectItem>
                            <SelectItem value="CONFIRMED">Đang xử lý</SelectItem>
                            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <CardContent className="p-0">
                  {filteredUpcoming.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {currentUpcoming.map((apt, index) => (
                        <div 
                          key={apt.id} 
                          className="transition-all duration-200 hover:bg-slate-50/80 animate-in fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <AppointmentCard
                            appointment={apt}
                            onViewDetails={viewDetails}
                            onCancel={onInitiateCancel}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                      <p className="text-gray-500 text-center max-w-sm">
                        Không có lịch hẹn nào phù hợp với bộ lọc. Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
                      </p>
                    </div>
                  )}
                </CardContent>
                
                {}
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <PremiumPagination
                    currentPage={upcomingPage}
                    totalPages={Math.max(1, totalUpcomingPages)}
                    totalItems={filteredUpcoming.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setUpcomingPage}
                    className="w-full"
                  />
                </div>
              </Card>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100">
                    <Calendar className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Chưa có lịch hẹn sắp tới</h3>
                  <p className="text-gray-500 mb-8 max-w-md text-center text-lg">
                    Bạn hiện không có lịch hẹn nào. Hãy đặt lịch khám để chăm sóc sức khỏe của mình.
                  </p>
                  <Button 
                    onClick={() => navigate("/patient/book-appointment")} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 px-8 h-12 rounded-xl font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Đặt lịch ngay
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="focus:outline-none">
            {}
            <Card className="overflow-hidden border-gray-100 shadow-sm">
              {}
              <div className="p-4 border-b bg-gray-50/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                      <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Lịch sử khám bệnh</h3>
                      <p className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium text-gray-700">{currentPast.length}</span> trong tổng số <span className="font-medium text-gray-900">{filteredPast.length}</span> lịch hẹn
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Tìm kiếm bác sĩ, chuyên khoa..." 
                        className="pl-10 bg-white border-gray-200 rounded-xl h-10 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                        value={pastSearchQuery}
                        onChange={(e) => setPastSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-gray-200 w-full sm:w-auto shadow-sm">
                      <Filter className="w-4 h-4 text-gray-400 ml-2" />
                      <Select value={pastStatusFilter} onValueChange={setPastStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px] border-0 bg-transparent focus:ring-0 h-8 text-sm font-medium">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Tất cả</SelectItem>
                          <SelectItem value="COMPLETED">Đã khám</SelectItem>
                          <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center p-5 gap-5">
                        <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : filteredPast.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {currentPast.map((apt, index) => (
                      <div 
                        key={apt.id} 
                        className="transition-all duration-200 hover:bg-slate-50/80 animate-in fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <AppointmentCard
                          appointment={apt}
                          onViewDetails={viewDetails}
                          onFollowUp={onBookFollowUp}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <FileText className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy lịch hẹn</h3>
                    <p className="text-gray-500 mb-8 max-w-md text-center text-lg">
                      {pastStatusFilter === "ALL" 
                        ? "Bạn chưa có lịch sử khám bệnh nào." 
                        : "Không có lịch hẹn nào phù hợp với bộ lọc."}
                    </p>
                    {pastStatusFilter === "ALL" && (
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/patient/book-appointment")}
                        className="border-2 border-gray-100 hover:border-blue-400 hover:text-blue-600 rounded-xl px-6 h-11 font-medium transition-all"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Đặt lịch đầu tiên
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
              
              {}
              {(filteredPast.length > 0 || !isLoading) && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  <PremiumPagination
                    currentPage={pastPage}
                    totalPages={Math.max(1, totalPastPages)}
                    totalItems={filteredPast.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setPastPage}
                    className="w-full"
                  />
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {}
        
        <AppointmentDetailModal 
          isOpen={isDetailOpen} 
          onOpenChange={setIsDetailOpen} 
          appointment={selectedAppointment} 
        />
        
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogContent className="sm:max-w-[450px] rounded-2xl">
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-100">
                  <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold">Hủy Lịch Hẹn</DialogTitle>
              <DialogDescription className="text-center pt-2 text-base">
                Bạn có chắc chắn muốn hủy lịch hẹn này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="mb-2 block text-sm font-semibold text-gray-700">Lý do hủy</Label>
              <Textarea 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)} 
                placeholder="Vui lòng cho biết lý do..."
                className="resize-none min-h-[120px] rounded-xl border-gray-200 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <DialogFooter className="sm:justify-between gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl h-11 border-2" 
                onClick={() => setIsCancelDialogOpen(false)}
              >
                Quay lại
              </Button>
              <Button 
                  variant="destructive" 
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl h-11 shadow-lg shadow-red-200" 
                  onClick={onConfirmCancel} 
                  disabled={!cancelReason.trim()}
              >
                  Xác nhận Hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientSidebar>
  );
}