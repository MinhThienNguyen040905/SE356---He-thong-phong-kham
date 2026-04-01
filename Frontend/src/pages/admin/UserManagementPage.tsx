import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin'
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Users,
  Sparkles,
  Filter,
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { toast } from "sonner"
import { UserService, type User } from "../../features/auth/services/user.service"

type RoleFilter = "all" | "admin" | "doctor" | "receptionist" | "patient" | "employee"
type StatusFilter = "all" | "active" | "inactive"

export default function UserManagementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get("role") as RoleFilter) || "all"
  
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(initialRole)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const role = searchParams.get("role") as RoleFilter
    if (role) {
      setRoleFilter(role)
      setCurrentPage(1)
    }
  }, [searchParams])
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  const itemsPerPage = 10

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (roleFilter !== "all") {
        params.role = roleFilter
      }
      
      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active"
      }
      
      const response = await UserService.getUsers(params)
      console.log("fetchUsers response:", response)
      
      const userList = response.users || []
      const mappedUsers = userList.map((user: any) => {
        let roleString = 'patient'
        if (typeof user.role === 'string') {
          roleString = user.role.toLowerCase()
        } else if (user.role?.name) {
          roleString = user.role.name.toLowerCase()
        } else if (user.roleId) {
          const roleIdMap: Record<number, string> = {
            1: 'admin',
            2: 'receptionist',
            3: 'patient',
            4: 'doctor',
          }
          roleString = roleIdMap[user.roleId] || 'patient'
        }
        return {
          ...user,
          role: roleString as any,
        }
      })
      setUsers(mappedUsers)
      setTotalPages(response.totalPages || 1)
    } catch (err: any) {
      console.error("fetchUsers error:", err)
      if (err.response?.status === 429) {
        const errorMessage = "Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại."
        toast.error(errorMessage)
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, statusFilter])

  useEffect(() => {
    
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchUsers()
      } else {
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    
    try {
      setIsDeleting(true)
      await UserService.deleteUser(userToDelete.id)
      toast.success("Xóa người dùng thành công!")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      setTimeout(() => {
        fetchUsers()
      }, 500)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        const errorMessage = error.response?.data?.message || "Không thể xóa người dùng"
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleActivateClick = (user: User) => {
    setUserToToggle(user)
    setStatusDialogOpen(true)
  }

  const handleDeactivateClick = (user: User) => {
    setUserToToggle(user)
    setStatusDialogOpen(true)
  }

  const handleStatusToggleConfirm = async () => {
    if (!userToToggle) return
    
    try {
      setIsTogglingStatus(true)
      if (userToToggle.isActive) {
        await UserService.deactivateUser(userToToggle.id)
        toast.success("Vô hiệu hóa người dùng thành công!")
      } else {
        await UserService.activateUser(userToToggle.id)
        toast.success("Kích hoạt người dùng thành công!")
      }
      setStatusDialogOpen(false)
      setUserToToggle(null)
      fetchUsers()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể thay đổi trạng thái")
      }
    } finally {
      setIsTogglingStatus(false)
    }
  }



  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      admin: { label: "Admin", className: "bg-red-100 text-red-800 border-red-200" },
      doctor: { label: "Bác sĩ", className: "bg-blue-100 text-blue-800 border-blue-200" },
      receptionist: { label: "Lễ tân", className: "bg-green-100 text-green-800 border-green-200" },
      patient: { label: "Bệnh nhân", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    
    const roleName = typeof role === 'string' ? role.toLowerCase() : 'patient'
    const roleConfig = config[roleName] || config.patient
    
    return (
      <Badge variant="outline" className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
        {isActive ? "Hoạt động" : "Vô hiệu hóa"}
      </Badge>
    )
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

  if (loading && users.length === 0) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách người dùng...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-indigo-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            <div className="relative overflow-hidden rounded-[32px] bg-white/40 backdrop-blur-3xl p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-400/5 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-blue-500/10 text-blue-600 border-0 font-black uppercase tracking-[0.2em] text-[9px] px-2.5 py-0.5 rounded-full animate-in fade-in slide-in-from-left-4 duration-700">
                        <Sparkles className="w-3 h-3 mr-1 text-blue-500 animate-spin-slow" />
                        Access Control
                      </Badge>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                        Live
                      </div>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                      Quản lý Người dùng
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      Điều phối tài khoản & phân quyền hệ thống
                    </p>
                  </div>
                </div>

                {}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-white/60 backdrop-blur-xl rounded-[20px] px-5 py-2.5 border border-white/60 shadow-sm group/stat hover:bg-blue-50/50 transition-all duration-500">
                    <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 leading-none">
                      <Users className="w-2.5 h-2.5" /> Tổng tài khoản
                    </p>
                    <p className="text-[15px] font-black text-slate-800 leading-none tabular-nums">
                      {users.length} <span className="text-[10px] text-slate-400 font-bold ml-0.5">Users</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/admin/users/add")}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-12 px-6 rounded-2xl font-black shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                    Thêm người dùng
                  </Button>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[32px] border border-white/60 shadow-xl shadow-slate-200/40">
              <div className="flex flex-wrap items-center gap-3">
                {}
                <div className="relative flex-1 min-w-[300px]">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <Input
                    placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                    className="w-full h-12 pl-11 pr-4 bg-white border border-slate-100 focus:bg-white focus:border-blue-500/50 rounded-2xl transition-all text-sm font-medium shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {}
                <div className="flex items-center gap-3 px-4 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[160px]">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                    <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none font-black text-slate-700">
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="all" className="font-bold py-3 rounded-xl">Tất cả vai trò</SelectItem>
                      <SelectItem value="employee" className="font-bold py-3 rounded-xl">Nhân viên</SelectItem>
                      <SelectItem value="admin" className="font-bold py-3 rounded-xl">Admin</SelectItem>
                      <SelectItem value="doctor" className="font-bold py-3 rounded-xl">Bác sĩ</SelectItem>
                      <SelectItem value="receptionist" className="font-bold py-3 rounded-xl">Lễ tân</SelectItem>
                      <SelectItem value="patient" className="font-bold py-3 rounded-xl">Bệnh nhân</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {}
                <div className="flex items-center gap-3 px-4 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm min-w-[150px]">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                    <SelectTrigger className="border-0 p-0 h-auto focus:ring-0 shadow-none font-black text-slate-700">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      <SelectItem value="all" className="font-bold py-3 rounded-xl">Tất cả</SelectItem>
                      <SelectItem value="active" className="font-bold py-3 rounded-xl">Hoạt động</SelectItem>
                      <SelectItem value="inactive" className="font-bold py-3 rounded-xl">Vô hiệu hóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {}
            <div className="mb-4">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Hiển thị <span className="text-slate-900 font-bold">{users.length}</span> người dùng
              </span>
            </div>

            {}
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden border border-white/80">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          NGƯỜI DÙNG
                        </th>
                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          EMAIL
                        </th>
                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          VAI TRÒ
                        </th>
                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          TRẠNG THÁI
                        </th>
                        <th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                          THAO TÁC
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors duration-200 group">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(user.fullName)} flex items-center justify-center text-white font-black text-sm shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300`}>
                                {user.avatar ? (
                                  <img 
                                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${user.avatar}`} 
                                    alt={user.fullName}
                                    className="w-12 h-12 rounded-2xl object-cover"
                                  />
                                ) : (
                                  getAvatarInitials(user.fullName)
                                )}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 text-sm">{user.fullName}</div>
                                {user.phone && (
                                  <div className="text-xs text-slate-500 font-medium mt-0.5">{user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-8">
                            <span className="text-slate-700 font-medium text-sm">{user.email}</span>
                          </td>
                          <td className="py-5 px-8">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="py-5 px-8">
                            {getStatusBadge(user.isActive)}
                          </td>
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-2">
                              <Link to={`/admin/users/${user.id}`}>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {user.isActive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-xl transition-all"
                                  onClick={() => handleDeactivateClick(user)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-9 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-all"
                                  onClick={() => handleActivateClick(user)}
                                >
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

        {}
        {users.length > 0 && (
          <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Hiển thị trang <span className="text-slate-900 font-bold">{currentPage}</span> / <span className="text-slate-900 font-bold">{totalPages}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-1">
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
                          ? "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 hover:scale-105" 
                          : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
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
              <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.fullName}</strong> ({userToDelete?.email})? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setUserToDelete(null)
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
        
        {}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {userToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} người dùng <strong>{userToToggle?.fullName}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusDialogOpen(false)
                  setUserToToggle(null)
                }}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={userToToggle?.isActive ? "destructive" : "default"}
                onClick={handleStatusToggleConfirm}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
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
