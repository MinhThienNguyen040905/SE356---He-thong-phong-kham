import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin';
import { 
  Search,
  Trash2,
  Loader2,
  Plus,
  Ban,
  UserCheck,
  Users,
  Sparkles,
  Eye,
  Phone,
  Mail,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { EmployeeService, type Employee } from "../../features/doctor/services/employee.service";

export default function EmployeeListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  const itemsPerPage = 10

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      }
      if (searchQuery) params.search = searchQuery
      if (roleFilter !== "all") params.roleId = parseInt(roleFilter)
      
      const data = await EmployeeService.getEmployees(params)
      setEmployees(data.employees)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách nhân viên")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [roleFilter, currentPage])

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmployees()
      } else {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge 
        variant="outline" 
        className={`text-[10px] font-bold px-2 py-0.5 ${
          isActive 
            ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
            : "bg-red-100 text-red-700 border-red-200"
        }`}
      >
        {isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
      </Badge>
    )
  }

  const getRoleBadge = (role: any) => {
    const config: any = {
      admin: { label: "Admin", className: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
      doctor: { label: "Bác sĩ", className: "bg-blue-100 text-blue-700 border-blue-200", icon: Briefcase },
      receptionist: { label: "Lễ tân", className: "bg-orange-100 text-orange-700 border-orange-200", icon: Users },
    }
    const roleName = (typeof role === "string" ? role : role?.name || "staff").toLowerCase()
    const item = config[roleName] || {
      label: roleName.charAt(0).toUpperCase() + roleName.slice(1),
      className: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Users
    }
    const Icon = item.icon
    return (
      <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 ${item.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {item.label}
      </Badge>
    )
  }

  
  const currentEmployees = employees

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    try {
      setIsDeleting(true)
      await EmployeeService.deleteEmployee(employeeToDelete.id)
      toast.success("Xóa nhân viên thành công!")
      setDeleteDialogOpen(false)
      fetchEmployees()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa nhân viên")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatusClick = (emp: Employee) => {
    setEmployeeToToggle(emp)
    setStatusDialogOpen(true)
  }

  const handleToggleStatusConfirm = async () => {
    if (!employeeToToggle) return
    try {
      setIsTogglingStatus(true)
      const newStatus = !employeeToToggle.isActive;
      await EmployeeService.updateEmployee(employeeToToggle.id, { isActive: newStatus });
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công!`);
      setStatusDialogOpen(false)
      setEmployeeToToggle(null)
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const getAvatarInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500"
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-blue-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative p-4 md:p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[32px] bg-white/40 backdrop-blur-3xl p-4 md:p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-400/5 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-purple-500/10 text-purple-600 border-0 font-black uppercase tracking-[0.2em] text-[9px] px-2.5 py-0.5 rounded-full animate-in fade-in slide-in-from-left-4 duration-700">
                        <Sparkles className="w-3 h-3 mr-1 text-purple-500 animate-spin-slow" />
                        Staff Registry
                      </Badge>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
                        Live
                      </div>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 md:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
                      Quản lý Nhân viên
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      Bác sĩ, Lễ tân & Quản trị viên
                    </p>
                  </div>
                </div>

                {}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <div className="bg-white/60 backdrop-blur-xl rounded-[20px] px-5 py-2.5 border border-white/60 shadow-sm group/stat hover:bg-purple-50/50 transition-all duration-500">
                    <p className="text-purple-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 leading-none">
                      <Users className="w-2.5 h-2.5" /> Tổng nhân viên 
                    </p>
                    <p className="text-[15px] font-black text-slate-800 leading-none tabular-nums">
                      {employees.length} <span className="text-[10px] text-slate-400 font-bold ml-0.5">Staff</span>
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-slate-900 hover:bg-slate-800 text-white h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-black shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 text-sm md:text-base cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                        Thêm nhân viên
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl bg-white/80 backdrop-blur-xl">
                      <DropdownMenuItem 
                        onClick={() => navigate("/admin/doctors/add")}
                        className="p-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 cursor-pointer focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Briefcase className="mr-3 h-4 w-4 text-blue-500" />
                        <span>Tạo bác sĩ</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate("/admin/users/add?role=receptionist")}
                        className="p-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 cursor-pointer focus:bg-orange-50 focus:text-orange-700"
                      >
                        <Users className="mr-3 h-4 w-4 text-orange-500" />
                        <span>Tạo lễ tân</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate("/admin/users/add?role=admin")}
                        className="p-3 rounded-lg hover:bg-slate-50 font-bold text-slate-700 cursor-pointer focus:bg-purple-50 focus:text-purple-700"
                      >
                        <Shield className="mr-3 h-4 w-4 text-purple-500" />
                        <span>Tạo quản trị viên</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                    placeholder="Tìm kiếm nhân viên (Tên, Email, Mã NV)..."
                    className="w-full h-12 pl-11 pr-4 bg-white border border-slate-100 focus:bg-white focus:border-purple-500/50 rounded-2xl transition-all text-sm font-medium shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {}
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border border-slate-100 rounded-2xl font-medium shadow-sm">
                    <SelectValue placeholder="Tất cả vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="4">Bác sĩ</SelectItem>
                    <SelectItem value="2">Lễ tân</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {}
            <div className="mb-4">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Hiển thị <span className="text-slate-900 font-bold">{currentEmployees.length}</span> / <span className="text-slate-900 font-bold">{employees.length}</span> nhân viên
              </span>
            </div>

            {}
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-2xl md:rounded-[40px] overflow-hidden border border-white/80">
              <CardContent className="p-0">
                <div className="overflow-x-auto -mx-px">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                        <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Nhân viên</th>
                        <th className="text-left py-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Liên hệ</th>
                        <th className="text-center py-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Vai trò</th>
                        <th className="text-center py-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
                            <p className="text-slate-500 font-medium text-sm">Đang tải...</p>
                          </td>
                        </tr>
                      ) : currentEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-500 text-sm">
                            Không tìm thấy nhân viên
                          </td>
                        </tr>
                      ) : (
                        currentEmployees.map((emp) => (
                          <tr key={emp.id} className="border-b border-slate-100 hover:bg-purple-50/20 transition-colors group">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-xl ${getAvatarColor(emp.user.fullName)} flex items-center justify-center text-white font-bold text-xs shadow-md transition-transform group-hover:scale-105 duration-200 overflow-hidden`}>
                                  {emp.avatar ? (
                                    <img 
                                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${emp.avatar}`} 
                                      alt={emp.user.fullName}
                                      className="w-9 h-9 rounded-xl object-cover"
                                    />
                                  ) : (
                                    getAvatarInitials(emp.user.fullName)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate">{emp.user.fullName}</div>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{emp.employeeCode}</span>
                                    {emp.position && (
                                      <>
                                        <span className="text-slate-400">•</span>
                                        <span className="truncate">{emp.position}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                {emp.phone && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                    <Phone className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                    <span className="truncate">{emp.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                  <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                  <span className="truncate">{emp.user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {getRoleBadge(emp.user.role)}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {getStatusBadge(emp.isActive)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
                                  onClick={() => navigate(`/admin/employees/${emp.id}`)}
                                  title="Chi tiết"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-lg transition-all ${emp.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                                  onClick={() => handleToggleStatusClick(emp)}
                                  title={emp.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                >
                                  {emp.isActive ? <Ban className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  onClick={() => handleDeleteClick(emp)}
                                  title="Xóa"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 md:mt-8 bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                    Trang <span className="text-slate-900 font-bold">{currentPage}</span> / <span className="text-slate-900 font-bold">{totalPages}</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 justify-center sm:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
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
                          className={`h-9 w-9 p-0 rounded-lg font-bold text-sm transition-all ${
                            currentPage === page 
                              ? "bg-purple-600 text-white shadow-md shadow-purple-100 hover:bg-purple-700 hover:scale-105" 
                              : "text-slate-600 hover:bg-slate-100 hover:text-purple-600"
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
                    className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa nhân viên</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn xóa nhân viên <strong>{employeeToDelete?.user.fullName}</strong>? 
                    <span className="block mt-2 text-amber-600">
                      Thao tác này sẽ xóa hồ sơ nhân viên nhưng giữ lại tài khoản cho mục đích lưu trữ.
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                    Xóa
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {employeeToToggle?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                  </DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn {employeeToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản của nhân viên{" "}
                    <strong>{employeeToToggle?.user.fullName}</strong>?
                    {employeeToToggle?.isActive && (
                      <span className="block mt-2 text-amber-600">
                        Nhân viên sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusDialogOpen(false)
                      setEmployeeToToggle(null)
                    }}
                    disabled={isTogglingStatus}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant={employeeToToggle?.isActive ? "destructive" : "default"}
                    onClick={handleToggleStatusConfirm}
                    disabled={isTogglingStatus}
                    className={!employeeToToggle?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isTogglingStatus ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        {employeeToToggle?.isActive ? (
                          <><Ban className="h-4 w-4 mr-2" />Vô hiệu hóa</>
                        ) : (
                          <><UserCheck className="h-4 w-4 mr-2" />Kích hoạt</>
                        )}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
