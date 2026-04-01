"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Users,
  Eye,
  Stethoscope,
  Save,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  ArrowRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Switch } from "../../components/ui/switch"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { SpecialtyService, type Specialty, type Doctor } from "../../features/appointment/services/specialty.service"
import api from "../../lib/api"

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDoctorsDialogOpen, setIsViewDoctorsDialogOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSpecialties, setTotalSpecialties] = useState(0)
  const itemsPerPage = 10

  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  })

  useEffect(() => {
    fetchSpecialties()
  }, [currentPage])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchSpecialties()
      } else {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter])

  const fetchSpecialties = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery.trim() || undefined,
      }

      if (statusFilter === "active") {
        params.active = true
      } else if (statusFilter === "inactive") {
        params.active = false
      }

      const response = await SpecialtyService.getSpecialties(params)
      setSpecialties(response.specialties)
      setTotalPages(response.totalPages)
      setTotalSpecialties(response.total)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách chuyên khoa")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDoctorsBySpecialty = async (specialtyId: number) => {
    try {
      setIsLoadingDoctors(true)
      const doctors = await SpecialtyService.getDoctorsBySpecialty(specialtyId)
      setDoctorsBySpecialty(doctors)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách bác sĩ")
      }
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: "", description: "", isActive: true })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
      isActive: specialty.isActive !== false, 
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDoctors = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setIsViewDoctorsDialogOpen(true)
    await fetchDoctorsBySpecialty(specialty.id)
  }

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên chuyên khoa")
      return
    }

    try {
      setIsCreating(true)
      const response = await api.post("/specialties", {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      })

      if (response.data.success) {
        toast.success("Tạo chuyên khoa thành công!")
        setIsCreateDialogOpen(false)
        setFormData({ name: "", description: "", isActive: true })
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể tạo chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo chuyên khoa")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedSpecialty || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên chuyên khoa")
      return
    }

    try {
      setIsUpdating(true)
      const response = await api.put(`/specialties/${selectedSpecialty.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      })

      if (response.data.success) {
        toast.success("Cập nhật chuyên khoa thành công!")
        setIsEditDialogOpen(false)
        setSelectedSpecialty(null)
        setFormData({ name: "", description: "", isActive: true })
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể cập nhật chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật chuyên khoa")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedSpecialty) return

    try {
      setIsDeleting(true)
      const response = await api.delete(`/specialties/${selectedSpecialty.id}`)

      if (response.data.success) {
        toast.success("Xóa chuyên khoa thành công!")
        setIsDeleteDialogOpen(false)
        setSelectedSpecialty(null)
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể xóa chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa chuyên khoa")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  
  const displaySpecialties = specialties

  return (
    <AdminSidebar>
      <div className="relative p-6 lg:p-8 min-h-screen bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto space-y-6">
          
          {}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Quản lý Chuyên khoa
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  Thiết lập danh mục chuyên môn và đội ngũ bác sĩ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="mr-3 p-1.5 bg-indigo-50 rounded-lg">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider leading-none mb-1">Tổng quy mô</p>
                  <p className="text-lg font-bold text-slate-900 leading-none tabular-nums">{totalSpecialties}</p>
                </div>
              </div>
              <Button 
                onClick={handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-6 rounded-xl font-bold transition-all shadow-md shadow-indigo-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm chuyên khoa
              </Button>
            </div>
          </div>



          {}
          <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-2 border border-slate-100 shadow-sm mb-6">
            <div className="flex flex-col xl:flex-row gap-3">
              {}
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  placeholder="Tìm kiếm chuyên khoa (Tên, Mô tả)..."
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl transition-all text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {}
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 rounded-xl text-sm font-medium">
                    <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <SelectValue placeholder="Trạng thái" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all" className="text-sm font-medium py-2.5">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active" className="text-sm font-medium py-2.5 text-emerald-600">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive" className="text-sm font-medium py-2.5 text-slate-500">Ngưng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {}
          <Card className="border-0 shadow-lg overflow-hidden bg-white rounded-[24px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4 border-b border-slate-50">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  Danh sách chuyên khoa
                </CardTitle>
                <CardDescription className="font-medium text-xs">Các chuyên khoa hiện có trong hệ thống ({totalSpecialties})</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : displaySpecialties.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50">
                  <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">Không tìm thấy chuyên khoa</h3>
                  <p className="text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm mới</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader className="bg-slate-50/50 border-y border-slate-100">
                        <TableRow>
                          <TableHead className="w-[100px] pl-6 font-bold uppercase text-[11px] tracking-widest text-slate-500">ID</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Tên chuyên khoa</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Mô tả</TableHead>
                          <TableHead className="font-bold uppercase text-[11px] tracking-widest text-slate-500">Trạng thái</TableHead>
                          <TableHead className="text-right pr-6 font-bold uppercase text-[11px] tracking-widest text-slate-500">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {displaySpecialties.map((specialty) => (
                        <TableRow key={specialty.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                          <TableCell className="pl-6 font-mono text-xs text-slate-400 font-bold">#{specialty.id}</TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900">{specialty.name}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600 text-sm font-medium line-clamp-1 max-w-[300px]">
                              {specialty.description || <span className="text-slate-300 italic text-xs">Không có mô tả</span>}
                            </span>
                          </TableCell>
                          <TableCell>
                            {specialty.isActive !== false ? (
                              <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                                <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                                HOẠT ĐỘNG
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                                <span className="h-1 w-1 rounded-full bg-slate-400 mr-1.5" />
                                TẠM NGƯNG
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                onClick={() => handleViewDoctors(specialty)}
                                title="Xem bác sĩ"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                onClick={() => handleEdit(specialty)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                onClick={() => handleDelete(specialty)}
                                title="Xóa chuyên khoa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {}
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
                              className={`h-8 w-8 p-0 rounded-lg font-bold text-xs transition-all ${
                                currentPage === page 
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700" 
                                  : "text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200"
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
                </>
              )}
            </CardContent>
          </Card>

          {}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border shadow-lg rounded-xl bg-white">
              <div className="p-6 border-b border-slate-100">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Thêm chuyên khoa mới
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1">
                  Nhập thông tin để đăng ký chuyên khoa mới vào hệ thống.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="create-name" className="text-sm font-semibold text-slate-700">Tên chuyên khoa <span className="text-red-500">*</span></Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Tim mạch, Nhi khoa..."
                    className="h-10 rounded-lg border-slate-200 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-description" className="text-sm font-semibold text-slate-700">Mô tả</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về chuyên khoa..."
                    rows={3}
                    className="rounded-lg border-slate-200 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-900">Trạng thái hoạt động</Label>
                    <p className="text-[11px] text-slate-500">Cho phép bệnh nhân chọn chuyên khoa này</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating} className="rounded-lg h-9">
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateSubmit} 
                  disabled={isCreating} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-6 font-bold shadow-sm"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lưu dữ liệu"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border shadow-lg rounded-xl bg-white">
              <div className="p-6 border-b border-slate-100">
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Chỉnh sửa chuyên khoa
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-sm mt-1">
                  Cập nhật các thông số cho chuyên khoa <span className="font-bold text-slate-900">{selectedSpecialty?.name}</span>.
                </DialogDescription>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name" className="text-sm font-semibold text-slate-700">Tên chuyên khoa <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Tim mạch, Nhi khoa..."
                    className="h-10 rounded-lg border-slate-200 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-description" className="text-sm font-semibold text-slate-700">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về chuyên khoa..."
                    rows={3}
                    className="rounded-lg border-slate-200 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-slate-900">Trạng thái hoạt động</Label>
                    <p className="text-[11px] text-slate-500">Bật/tắt khả năng tiếp nhận bệnh nhân mới</p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating} className="rounded-lg h-9">
                  Hủy
                </Button>
                <Button 
                  onClick={handleUpdateSubmit} 
                  disabled={isUpdating} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9 px-6 font-bold shadow-sm"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cập nhật thay đổi"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-center">Xóa chuyên khoa</DialogTitle>
                <DialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa chuyên khoa <span className="font-semibold text-slate-900">"{selectedSpecialty?.name}"</span>? 
                  <br/>Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa vĩnh viễn"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isViewDoctorsDialogOpen} onOpenChange={setIsViewDoctorsDialogOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden border shadow-lg rounded-xl bg-white">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    Bác sĩ chuyên khoa {selectedSpecialty?.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-500 text-sm">
                    Danh sách các bác sĩ thuộc chuyên khoa này
                  </DialogDescription>
                </div>
              </div>

              <div className="p-6">
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {isLoadingDoctors ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-2" />
                      <p className="text-sm text-slate-500">Đang tải danh sách...</p>
                    </div>
                  ) : doctorsBySpecialty.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-semibold text-slate-900 mb-1">Chưa có bác sĩ nào</h3>
                      <p className="text-slate-500 text-sm">
                        Chuyên khoa này hiện chưa được gán bác sĩ nào.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctorsBySpecialty.map((doctor) => (
                        <div key={doctor.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                          <Avatar className="h-12 w-12 border border-slate-200">
                            <AvatarImage src={doctor.user?.avatar} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold uppercase">
                              {doctor.user?.fullName?.charAt(0) || "D"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-grow min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {doctor.user?.fullName || "Chưa cập nhật"}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500 font-medium">{doctor.doctorCode}</span>
                              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px] font-bold rounded px-1.5 py-0">
                                {doctor.degree || "Bác sĩ"}
                              </Badge>
                            </div>
                          </div>
                          
                          <Link to={`/admin/doctors?search=${doctor.doctorCode}`} className="h-8 w-8 hover:bg-indigo-50 flex items-center justify-center rounded-full text-indigo-600 transition-colors">
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white flex justify-end border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsViewDoctorsDialogOpen(false)}
                  className="rounded-xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50"
                >
                  Close Panel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminSidebar>
  )
}
