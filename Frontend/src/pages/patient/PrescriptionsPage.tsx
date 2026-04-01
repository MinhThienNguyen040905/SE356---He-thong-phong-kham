"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { 
  Pill, 
  Calendar, 
  User,  
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Stethoscope,
  Clock,
  FileText
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { toast } from "sonner"
import type { Prescription } from "../../types/prescription.types"
import { PrescriptionService } from "../../features/appointment/services/prescription.service"
import PatientSidebar from "../../components/layout/sidebar/patient"
import { useAuth } from "../../features/auth/context/authContext"



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
          <span className="text-gray-600">{totalItems} đơn thuốc</span>
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



export default function PrescriptionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user?.patientId) {
        if (!isLoading) toast.error("Không tìm thấy thông tin bệnh nhân")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await PrescriptionService.getPrescriptionsByPatient(user.patientId)
        
        if (response.success && response.data) {
          const list = Array.isArray(response.data) 
            ? response.data.map((item: any) => PrescriptionService.transformPrescriptionData(item))
            : []
          setPrescriptions(list)
        }
      } catch (error: any) {
        console.error("Error fetching prescriptions:", error)
        toast.error(error.response?.data?.message || "Không thể tải danh sách đơn thuốc")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()
  }, [user?.patientId])

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon?: any }> = {
      DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700 border-gray-200" },
      LOCKED: { label: "Đã khóa", className: "bg-blue-50 text-blue-700 border-blue-200" },
      DISPENSED: { label: "Đã cấp phát", className: "bg-green-50 text-green-700 border-green-200" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
    }

    const info = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" }

    return (
      <Badge variant="outline" className={`${info.className} border font-medium px-2.5 py-0.5 rounded-lg`}>
        {info.label}
      </Badge>
    )
  }

  
  const filteredPrescriptions = prescriptions.filter(p => {
    const matchesSearch = 
      p.prescriptionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.doctor?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  
  const totalPages = Math.ceil(filteredPrescriptions.length / ITEMS_PER_PAGE);
  const currentPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <PatientSidebar userName={user?.fullName || user?.email}>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
        
        {}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 shadow-xl">
           <div className="absolute inset-0 opacity-10">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
           </div>
           
           <div className="relative z-10">

              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                       <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                          <Pill className="w-8 h-8 text-white" />
                       </div>
                       Đơn Thuốc Của Tôi
                    </h1>
                    <p className="text-blue-100 text-lg max-w-xl">
                       Tra cứu và quản lý lịch sử đơn thuốc điện tử, theo dõi liều lượng và hướng dẫn sử dụng.
                    </p>
                 </div>
                 
                 <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 text-white">
                        <span className="block text-2xl font-bold">{prescriptions.length}</span>
                        <span className="text-xs text-blue-100 uppercase font-medium tracking-wide">Tổng đơn thuốc</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {}
        <Card className="overflow-hidden border-gray-100 shadow-sm">
            {}
            <div className="p-4 border-b bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Tìm theo mã đơn, tên bác sĩ..." 
                    className="pl-10 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-100 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-sm h-10">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 text-sm font-medium">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Tất cả</SelectItem>
                        <SelectItem value="DISPENSED">Đã cấp phát</SelectItem>
                        <SelectItem value="LOCKED">Đã khóa</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </div>

            {}
            <CardContent className="p-0">
              {isLoading ? (
                 <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
                         <div className="space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-32" />
                         </div>
                         <Skeleton className="h-10 w-24" />
                      </div>
                    ))}
                 </div>
              ) : filteredPrescriptions.length > 0 ? (
                 <div className="divide-y divide-gray-100">
                    {currentPrescriptions.map((p) => (
                      <div 
                        key={p.id}
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-all duration-200"
                      >
                         <div className="flex items-start gap-4 mb-4 sm:mb-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                               <FileText className="w-6 h-6" />
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-bold text-gray-900 text-lg">
                                     {p.prescriptionCode}
                                  </h3>
                                  {getStatusBadge(p.status)}
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                  {p.doctor && (
                                    <div className="flex items-center gap-1.5">
                                       <Stethoscope className="w-4 h-4 text-gray-400" />
                                       <span>BS. {p.doctor.fullName}</span>
                                    </div>
                                  )}
                                  {p.visit?.checkInTime && (
                                    <div className="flex items-center gap-1.5">
                                       <Calendar className="w-4 h-4 text-gray-400" />
                                       <span>Ngày khám: {new Date(p.visit.checkInTime).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                     <Clock className="w-4 h-4 text-gray-400" />
                                     <span>Tạo lúc: {new Date(p.createdAt).toLocaleDateString("vi-VN")}</span>
                                  </div>
                               </div>
                            </div>
                         </div>
                         
                         <div>
                            <Button 
                              onClick={() => navigate(`/prescriptions/${p.id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all rounded-xl"
                              size="sm"
                            >
                               <FileText className="w-4 h-4 mr-2" />
                               Chi tiết
                            </Button>
                         </div>
                      </div>
                    ))}
                 </div>
              ) : (
                 <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                       <Pill className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy đơn thuốc</h3>
                    <p className="text-gray-500 max-w-sm mb-6">
                       {searchQuery || statusFilter !== 'ALL' 
                         ? "Không có kết quả nào phù hợp với tìm kiếm của bạn." 
                         : "Bạn chưa có đơn thuốc nào."}
                    </p>
                    {(searchQuery || statusFilter !== 'ALL') && (
                       <Button 
                         variant="outline" 
                         onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
                       >
                         Xóa bộ lọc
                       </Button>
                    )}
                 </div>
              )}
            </CardContent>

            {}
            {filteredPrescriptions.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50">
                <PremiumPagination
                   currentPage={currentPage}
                   totalPages={totalPages}
                   totalItems={filteredPrescriptions.length}
                   itemsPerPage={ITEMS_PER_PAGE}
                   onPageChange={setCurrentPage}
                   className="w-full"
                 />
              </div>
            )}
        </Card>
      </div>
    </PatientSidebar>
  )
}
