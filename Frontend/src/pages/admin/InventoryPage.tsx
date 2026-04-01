"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  Loader2,
  Download,
  Upload,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { MedicineService, type Medicine, MedicineStatus, MedicineUnit } from "../../features/inventory/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

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

const getStatusBadge = (status: "in-stock" | "low-stock" | "near-expiry" | "expired") => {
  switch (status) {
    case "expired":
      return (
        <Badge className="bg-rose-100/50 text-rose-700 border-rose-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
          <span className="h-1 w-1 rounded-full bg-rose-500 mr-1.5" />
          HẾT HẠN
        </Badge>
      )
    case "near-expiry":
      return (
        <Badge className="bg-amber-100/50 text-amber-700 border-amber-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
          <span className="h-1 w-1 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
          SẮP HẾT HẠN
        </Badge>
      )
    case "low-stock":
      return (
        <Badge className="bg-orange-100/50 text-orange-700 border-orange-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
          <span className="h-1 w-1 rounded-full bg-orange-500 mr-1.5 animate-pulse" />
          SẮP HẾT
        </Badge>
      )
    default:
      return (
        <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
          <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1.5" />
          CÒN HÀNG
        </Badge>
      )
  }
}

const getDaysUntilExpiry = (expiryDate: string): number => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [groups, setGroups] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [isAutoMarking, setIsAutoMarking] = useState(false)
  const [isAutoMarkDialogOpen, setIsAutoMarkDialogOpen] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [currentPage, selectedGroup, selectedStatus])

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchMedicines = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      
      if (searchQuery) params.search = searchQuery
      if (selectedGroup !== "all") params.group = selectedGroup
      if (selectedStatus !== "all") params.status = selectedStatus

      const response = await MedicineService.getMedicines(params)
      if (response.medicines) {
        setMedicines(response.medicines)
        setTotalPages(response.totalPages || 1)
        
        if (groups.length === 0) {
          const uniqueGroups = Array.from(new Set(response.medicines.map(m => m.group))).sort()
          setGroups(uniqueGroups)
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tải danh sách thuốc")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      setIsLoadingAlerts(true)
      const [lowStockResponse, expiringResponse] = await Promise.all([
        MedicineService.getLowStockMedicines({ page: 1, limit: 10 }),
        MedicineService.getExpiringMedicines({ page: 1, limit: 10 }),
      ])
      
      if (lowStockResponse.medicines) {
        setLowStockMedicines(lowStockResponse.medicines)
      }
      if (expiringResponse.medicines) {
        setExpiringMedicines(expiringResponse.medicines)
      }
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.message || "Không thể tải cảnh báo thuốc")
      }
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchMedicines()
      } else {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  
  const displayMedicines = medicines

  const handleAutoMarkExpired = async () => {
    try {
      setIsAutoMarking(true)
      const result = await MedicineService.autoMarkExpired()
      toast.success(`Đã đánh dấu ${result.count} thuốc hết hạn!`)
      setIsAutoMarkDialogOpen(false)
      await fetchMedicines()
      await fetchAlerts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đánh dấu thuốc hết hạn")
    } finally {
      setIsAutoMarking(false)
    }
  }

  const lowStockCount = lowStockMedicines.length
  const expiringCount = expiringMedicines.length
  const totalMedicines = medicines.length
  const inStockCount = medicines.filter(m => getMedicineStatus(m) === "in-stock").length

  return (
    <AdminSidebar>
      <div className="relative p-6 lg:p-8">
        <div className="max-w-[1700px] mx-auto space-y-6">
          
          {}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Quản lý kho thuốc
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  Theo dõi số lượng, kiểm kê và xuất nhập kho y tế.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoMarkDialogOpen(true)}
                className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Auto-fix hết hạn
              </Button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
              <Button asChild variant="outline" size="sm" className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50">
                <Link to="/admin/medicines/imports">
                  <Upload className="h-3.5 w-3.5 mr-2" />
                  Nhập kho
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50">
                <Link to="/admin/medicines/exports">
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Xuất kho
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-lg font-bold text-xs px-4">
                <Link to="/admin/medicines/create">
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Thêm thuốc
                </Link>
              </Button>
            </div>
          </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-blue-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng loại thuốc</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{totalMedicines}</h3>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Mã hàng</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-emerald-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đang còn hàng</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{inStockCount}</h3>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Ổn định</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-yellow-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mức tồn thấp</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{lowStockCount}</h3>
                  <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded uppercase">Cần nhập</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-orange-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sắp hết hạn</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{expiringCount}</h3>
                  <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">{"< 30 Ngày"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        {(lowStockCount > 0 || expiringCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {lowStockCount > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-5 w-5" />
                    Cảnh báo: Thuốc sắp hết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockMedicines.slice(0, 5).map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{medicine.name}</p>
                            <p className="text-xs text-slate-500">
                              Còn: {medicine.quantity} {getUnitLabel(medicine.unit)} / Tối thiểu: {medicine.minStockLevel} {getUnitLabel(medicine.unit)}
                            </p>
                          </div>
                          <Link to={`/pharmacy/${medicine.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {lowStockCount > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {lowStockCount - 5} thuốc khác...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {expiringCount > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Clock className="h-5 w-5" />
                    Cảnh báo: Thuốc sắp hết hạn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {expiringMedicines.slice(0, 5).map((medicine) => {
                        const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
                        return (
                          <div key={medicine.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{medicine.name}</p>
                              <p className="text-xs text-slate-500">
                                Hết hạn: {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })} ({daysLeft} ngày)
                              </p>
                            </div>
                            <Link to={`/pharmacy/${medicine.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        )
                      })}
                      {expiringCount > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {expiringCount - 5} thuốc khác...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-2 border border-slate-100 shadow-sm mb-6">
          <div className="flex flex-col xl:flex-row gap-3">
            {}
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                placeholder="Tìm kiếm thuốc (Tên, Mã, Nhóm)..."
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/50 rounded-xl transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
                <div className="px-3 flex items-center gap-2 border-r border-slate-200 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ lọc</span>
                </div>
                
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="h-9 w-[160px] border-none bg-transparent focus:ring-0 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Nhóm thuốc" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhóm</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-9 w-[140px] border-none bg-transparent focus:ring-0 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="in-stock">Còn hàng</SelectItem>
                    <SelectItem value="low-stock">Sắp hết</SelectItem>
                    <SelectItem value="near-expiry">Sắp hết hạn</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách thuốc ({displayMedicines.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMedicines}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : displayMedicines.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy thuốc nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-y border-slate-100">
                  <tr>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Thông tin thuốc</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Nhóm</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Số lượng</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Giá nhập</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Giá bán</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Hạn sử dụng</th>
                    <th className="p-4 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Trạng thái</th>
                    <th className="p-4 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                  <tbody>
                    {displayMedicines.map((medicine) => {
                      const status = getMedicineStatus(medicine)
                      const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
                      return (
                        <tr key={medicine.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="font-mono text-[10px] text-slate-500 font-semibold block">{medicine.medicineCode}</span>
                              <p className="font-bold text-slate-900">{medicine.name}</p>
                              {medicine.manufacturer && (
                                <p className="text-xs text-slate-500 font-medium">{medicine.manufacturer}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-slate-50 font-bold">{medicine.group}</Badge>
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="font-bold text-slate-900">
                                {medicine.quantity} {getUnitLabel(medicine.unit)}
                              </span>
                              <p className="text-[10px] text-slate-500 font-semibold uppercase">
                                Tối thiểu: {medicine.minStockLevel}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-600 font-semibold text-sm">
                              {new Intl.NumberFormat('vi-VN').format(medicine.importPrice)} VND
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-blue-600">
                              {new Intl.NumberFormat('vi-VN').format(medicine.salePrice)} VND
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <span className="text-sm font-bold text-slate-700">
                                {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })}
                              </span>
                              {daysLeft <= 30 && daysLeft >= 0 && (
                                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-tight">
                                {daysLeft} ngày
                                </p>
                              )}
                              {daysLeft < 0 && (
                                <p className="text-[10px] text-red-600 font-bold uppercase">Đã hết hạn</p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(status)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/admin/medicines/${medicine.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/medicines/${medicine.id}/edit`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {}
            {displayMedicines.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    Trang <span className="text-slate-900 font-bold">{currentPage}</span> / {totalPages}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
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
                          className={`h-8 w-8 p-0 rounded-lg font-bold text-xs transition-colors ${
                            currentPage === page 
                              ? "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700" 
                              : "text-slate-600 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-200"
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
                      return <span key={page} className="px-1 text-slate-400 font-bold text-[10px]">...</span>;
                    }
                    return null;
                  })}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Dialog open={isAutoMarkDialogOpen} onOpenChange={setIsAutoMarkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tự động đánh dấu thuốc hết hạn</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ tự động đánh dấu tất cả thuốc đã hết hạn dựa trên ngày hết hạn (expiryDate).
                Thao tác này sẽ cập nhật trạng thái của thuốc thành "Hết hạn" (EXPIRED).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Lưu ý quan trọng
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                      <li>Thao tác này sẽ quét toàn bộ danh sách thuốc</li>
                      <li>Chỉ đánh dấu những thuốc có expiryDate đã qua ngày hiện tại</li>
                      <li>Không thể hoàn tác sau khi thực hiện</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAutoMarkDialogOpen(false)}
                disabled={isAutoMarking}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAutoMarkExpired}
                disabled={isAutoMarking}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isAutoMarking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Xác nhận đánh dấu
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </AdminSidebar>
  )
}
