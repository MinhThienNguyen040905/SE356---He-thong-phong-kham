"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../features/auth/context/authContext"
import {
  Search,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  ChevronRight,
  ChevronLeft,
  TrendingDown,
  Calendar,
  XCircle,
  Trash2,
  Loader2,
  Sparkles,
  Pill,
  Eye,
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { toast } from "sonner"
import SidebarLayout from "../components/layout/SidebarLayout"
import AdminSidebar from "../components/layout/sidebar/admin"
import ReceptionistSidebar from "../components/layout/sidebar/recep"
import DoctorSidebar from "../components/layout/sidebar/doctor"
import { MedicineService, type Medicine, MedicineStatus, MedicineUnit } from "../features/inventory/services/medicine.service"
import { format } from "date-fns"

const getUnitLabel = (unit: MedicineUnit): string => {
  const unitMap: Record<MedicineUnit, string> = {
    [MedicineUnit.VIEN]: "viên",
    [MedicineUnit.ML]: "ml",
    [MedicineUnit.HOP]: "hộp",
    [MedicineUnit.CHAI]: "chai",
    [MedicineUnit.TUYP]: "tuýp",
    [MedicineUnit.GOI]: "gói",
  }
  return unitMap[unit] || unit
}

const getMedicineStatus = (medicine: Medicine): "in-stock" | "low-stock" | "near-expiry" | "expired" => {
  if (medicine.status === MedicineStatus.EXPIRED) {
    return "expired"
  }
  
  const expiryDate = new Date(medicine.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) {
    return "expired"
  }
  if (daysUntilExpiry <= 30) {
    return "near-expiry"
  }
  if (medicine.quantity <= medicine.minStockLevel) {
    return "low-stock"
  }
  return "in-stock"
}

export default function PharmacyPage() {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      setIsLoading(true)
      const response = await MedicineService.getMedicines({
        page: 1,
        limit: 1000,
      })
      if (response.medicines) {
        setMedicines(response.medicines)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách thuốc")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!medicineToDelete) return
    
    try {
      setIsDeleting(true)
      await MedicineService.deleteMedicine(medicineToDelete.id)
      toast.success("Xóa thuốc thành công!")
      setDeleteDialogOpen(false)
      setMedicineToDelete(null)
      fetchMedicines()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể xóa thuốc"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: "in-stock" | "low-stock" | "near-expiry" | "expired") => {
    const statusConfig = {
      "in-stock": {
        label: "Còn hàng",
        icon: Package,
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      },
      "low-stock": {
        label: "Sắp hết",
        icon: TrendingDown,
        className: "bg-amber-100 text-amber-700 border-amber-200",
      },
      "near-expiry": {
        label: "Sắp hết hạn",
        icon: Clock,
        className: "bg-orange-100 text-orange-700 border-orange-200",
      },
      expired: {
        label: "Hết hạn",
        icon: XCircle,
        className: "bg-red-100 text-red-700 border-red-200",
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`text-[10px] font-bold ${config.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const medicationGroups = ["all", ...Array.from(new Set(medicines.map(m => m.group)))]

  const filteredMedications = medicines.filter((med) => {
    const status = getMedicineStatus(med)
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.medicineCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroup === "all" || med.group === selectedGroup
    const matchesStatus = selectedStatus === "all" || status === selectedStatus
    return matchesSearch && matchesGroup && matchesStatus
  })

  
  const totalPages = Math.ceil(filteredMedications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMedications = filteredMedications.slice(startIndex, startIndex + itemsPerPage)

  
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedGroup, selectedStatus])

  const lowStockCount = medicines.filter((m) => getMedicineStatus(m) === "low-stock").length
  const nearExpiryCount = medicines.filter((m) => getMedicineStatus(m) === "near-expiry").length
  const expiredCount = medicines.filter((m) => getMedicineStatus(m) === "expired").length
  const inStockCount = medicines.filter((m) => getMedicineStatus(m) === "in-stock").length

  const isAdmin = user?.roleId === 1 || String(user?.role || "").toLowerCase() === "admin"

  const getLayoutComponent = () => {
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    if (role === "admin" || role === "1") {
      return AdminSidebar
    }
    if (role === "doctor" || role === "4") {
      return DoctorSidebar
    }
    if (role === "receptionist" || role === "2") {
      return ReceptionistSidebar
    }
    return null
  }

  const LayoutComponent = getLayoutComponent()

  if (!LayoutComponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const pageContent = (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative p-4 md:p-6 lg:p-8">
        <div className="max-w-[1700px] mx-auto space-y-6">
            
            {}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[32px] bg-white/40 backdrop-blur-3xl p-4 md:p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-teal-400/5 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Pill className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-cyan-500/10 text-cyan-600 border-0 font-black uppercase tracking-[0.2em] text-[9px] px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 mr-1 text-cyan-500" />
                        Pharmacy
                      </Badge>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
                        Live
                      </div>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">
                      Kho thuốc
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                      Quản lý thuốc và vật tư y tế
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <Button
                      variant="outline"
                      className="border-cyan-200 text-cyan-700 hover:bg-cyan-50 h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-bold"
                      asChild
                    >
                      <Link to="/admin/medicines/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo thuốc mới
                      </Link>
                    </Button>
                    <Button 
                      className="bg-slate-900 hover:bg-slate-800 text-white h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-black shadow-lg"
                      asChild
                    >
                      <Link to="/admin/pharmacy/import">
                        <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                        Nhập thuốc
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedStatus("in-stock")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-emerald-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">{inStockCount}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Còn hàng</p>
              </div>

              <div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-amber-200/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedStatus("low-stock")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">{lowStockCount}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Sắp hết</p>
              </div>

              <div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-orange-200/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedStatus("near-expiry")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">{nearExpiryCount}</p>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Sắp hết hạn</p>
              </div>

              <div 
                className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-red-200/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setSelectedStatus("expired")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-2xl font-black text-slate-900">{expiredCount}</p>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Hết hạn</p>
              </div>
            </div>

            {}
            <div className="bg-white/60 backdrop-blur-xl p-2 md:p-3 rounded-2xl md:rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/40">
              <div className="flex flex-wrap items-center gap-3">
                {}
                <div className="relative flex-1 min-w-full md:min-w-[300px]">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    placeholder="Tìm kiếm thuốc (Tên, Mã thuốc)..."
                    className="w-full h-12 pl-11 pr-4 bg-white border border-slate-100 focus:bg-white focus:border-cyan-500/50 rounded-2xl transition-all text-sm font-medium shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {}
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border border-slate-100 rounded-2xl font-medium shadow-sm">
                    <SelectValue placeholder="Nhóm thuốc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhóm</SelectItem>
                    {medicationGroups.filter(g => g !== "all").map((group) => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[160px] h-12 bg-white border border-slate-100 rounded-2xl font-medium shadow-sm">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="in-stock">Còn hàng</SelectItem>
                    <SelectItem value="low-stock">Sắp hết</SelectItem>
                    <SelectItem value="near-expiry">Sắp hết hạn</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">
                Hiển thị <span className="text-slate-900 font-bold">{paginatedMedications.length}</span> / <span className="text-slate-900 font-bold">{filteredMedications.length}</span> thuốc
              </span>
            </div>

            {}
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-2xl md:rounded-[40px] overflow-hidden border border-white/80">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                          <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Mã thuốc</th>
                          <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Tên thuốc</th>
                          <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Nhóm</th>
                          <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Số lượng</th>
                          <th className="text-right py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Giá nhập</th>
                          <th className="text-right py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Giá bán</th>
                          <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Hạn dùng</th>
                          <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                          <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedMedications.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-16 text-center text-slate-500 text-sm">
                              Không tìm thấy thuốc
                            </td>
                          </tr>
                        ) : (
                          paginatedMedications.map((medication) => {
                            const status = getMedicineStatus(medication)
                            
                            return (
                              <tr
                                key={medication.id}
                                className="border-b border-slate-100 hover:bg-cyan-50/20 transition-colors group"
                              >
                                <td className="py-3 px-4">
                                  <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-700">
                                    {medication.medicineCode}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-900 text-xs">{medication.name}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-[11px] text-slate-600">{medication.group}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold text-xs ${medication.quantity <= medication.minStockLevel ? "text-amber-600" : "text-slate-900"}`}>
                                    {medication.quantity} {getUnitLabel(medication.unit)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="font-semibold text-xs text-slate-600">
                                    {new Intl.NumberFormat('vi-VN').format(medication.importPrice)}₫
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="font-bold text-xs text-cyan-700">
                                    {new Intl.NumberFormat('vi-VN').format(medication.salePrice)}₫
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-600">
                                    <Calendar className="h-3 w-3 text-slate-400" />
                                    {format(new Date(medication.expiryDate), "dd/MM/yyyy")}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">{getStatusBadge(status)}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 rounded-lg transition-all"
                                      asChild
                                    >
                                      <Link to={`/pharmacy/${medication.id}`}>
                                        <Eye className="h-3.5 w-3.5" />
                                      </Link>
                                    </Button>
                                    {isAdmin && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        onClick={() => handleDeleteClick(medication)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm gap-3">
                <p className="text-sm text-slate-500 font-medium">
                  Trang <span className="text-slate-900 font-bold">{currentPage}</span> / <span className="text-slate-900 font-bold">{totalPages}</span>
                </p>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          className={`h-9 w-9 p-0 rounded-lg font-bold text-sm ${
                            currentPage === page 
                              ? "bg-cyan-600 text-white shadow-md hover:bg-cyan-700" 
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                    if (
                      (page === 2 && currentPage > 3) || 
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return <span key={page} className="px-1 text-slate-400 font-bold">...</span>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-30"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>

        {}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa thuốc</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa thuốc <strong>{medicineToDelete?.name}</strong>? 
                <span className="block mt-2 text-amber-600">
                  Hành động này không thể hoàn tác.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setMedicineToDelete(null)
                }}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  return (
    <LayoutComponent userName={user?.fullName || user?.email}>
      {pageContent}
    </LayoutComponent>
  )
}
