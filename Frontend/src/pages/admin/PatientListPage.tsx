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
  Calendar,
  ChevronLeft,
  ChevronRight,
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
import { toast } from "sonner";
import { getPatients, updatePatient, type Patient } from "../../features/patient/services/patient.service";

export default function PatientListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [patientToToggle, setPatientToToggle] = useState<Patient | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const itemsPerPage = 10

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { patients: data, pagination } = await getPatients({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      })
      setPatients(data)
      setTotalPages(pagination?.totalPages || Math.ceil((pagination?.total || data.length) / itemsPerPage))
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách bệnh nhân")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [currentPage])

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchPatients()
      } else {
        setCurrentPage(1)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
        {isActive ? "Hoạt động" : "Vô hiệu hóa"}
      </Badge>
    )
  }

  const getGenderBadge = (gender: string) => {
    const config: Record<string, { label: string; className: string }> = {
      MALE: { label: "Nam", className: "bg-blue-100 text-blue-800 border-blue-200" },
      FEMALE: { label: "Nữ", className: "bg-pink-100 text-pink-800 border-pink-200" },
      OTHER: { label: "Khác", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    const item = config[gender?.toUpperCase()] || config.OTHER
    return (
      <Badge variant="outline" className={item.className}>
        {item.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  const handleToggleStatusClick = (patient: Patient) => {
    setPatientToToggle(patient)
    setStatusDialogOpen(true)
  }

  const handleToggleStatusConfirm = async () => {
    if (!patientToToggle) return
    try {
      setIsTogglingStatus(true)
      const newStatus = !patientToToggle.isActive;
      await updatePatient(patientToToggle.id, { isActive: newStatus });
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công!`);
      setStatusDialogOpen(false)
      setPatientToToggle(null)
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return
    try {
      setIsDeleting(true)
      
      await updatePatient(patientToDelete.id, { isActive: false });
      toast.success("Đã xóa bệnh nhân thành công (vô hiệu hóa)!")
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
      fetchPatients()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa bệnh nhân")
    } finally {
      setIsDeleting(false)
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
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative p-4 md:p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {}
            <div className="relative overflow-hidden rounded-2xl md:rounded-[32px] bg-white/40 backdrop-blur-3xl p-4 md:p-6 lg:p-7 border border-white/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] group">
              {}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-400/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-teal-400/5 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '3s' }} />
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black uppercase tracking-[0.2em] text-[9px] px-2.5 py-0.5 rounded-full animate-in fade-in slide-in-from-left-4 duration-700">
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-500 animate-spin-slow" />
                        Care Registry
                      </Badge>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200/50">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live
                      </div>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2 md:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                      Quản lý Bệnh nhân
                    </h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      Lưu trữ hồ sơ, theo dõi lượt khám & hỗ trợ
                    </p>
                  </div>
                </div>

                {}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <div className="bg-white/60 backdrop-blur-xl rounded-[20px] px-5 py-2.5 border border-white/60 shadow-sm group/stat hover:bg-emerald-50/50 transition-all duration-500">
                    <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5 leading-none">
                      <Users className="w-2.5 h-2.5" /> Tổng bệnh nhân 
                    </p>
                    <p className="text-[15px] font-black text-slate-800 leading-none tabular-nums">
                      {patients.length} <span className="text-[10px] text-slate-400 font-bold ml-0.5">Patients</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate("/admin/users/add?role=patient")}
                    className="bg-slate-900 hover:bg-slate-800 text-white h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-black shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
                  >
                    <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                    Thêm bệnh nhân
                  </Button>
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
                    placeholder="Tìm kiếm bệnh nhân (Tên, Email, Mã BN, SĐT)..."
                    className="w-full h-12 pl-11 pr-4 bg-white border border-slate-100 focus:bg-white focus:border-emerald-500/50 rounded-2xl transition-all text-sm font-medium shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {}
            <div className="mb-4">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Hiển thị <span className="text-slate-900 font-bold">{patients.length}</span> bệnh nhân
              </span>
            </div>

            {}
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-2xl md:rounded-[40px] overflow-hidden border border-white/80">
              <CardContent className="p-0">
                <div className="overflow-x-auto -mx-px">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b-2 border-slate-100 bg-slate-50/50">
                        <th className="text-left py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Bệnh nhân</th>
                        <th className="text-left py-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Liên hệ</th>
                        <th className="text-center py-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="text-center py-3 px-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-2" />
                            <p className="text-slate-500 font-medium text-sm">Đang tải...</p>
                          </td>
                        </tr>
                      ) : patients.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-500 text-sm">
                            Không tìm thấy bệnh nhân
                          </td>
                        </tr>
                      ) : (
                        patients.map((patient) => (
                          <tr key={patient.id} className="border-b border-slate-100 hover:bg-emerald-50/20 transition-colors group">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-xl ${getAvatarColor(patient.fullName)} flex items-center justify-center text-white font-bold text-xs shadow-md transition-transform group-hover:scale-105 duration-200`}>
                                  {patient.avatar ? (
                                    <img 
                                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${patient.avatar}`} 
                                      alt={patient.fullName}
                                      className="w-9 h-9 rounded-xl object-cover"
                                    />
                                  ) : (
                                    getAvatarInitials(patient.fullName)
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 text-xs truncate">{patient.fullName}</div>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                    {getGenderBadge(patient.gender)}
                                    <span className="text-slate-400">•</span>
                                    <span className="font-mono">{patient.patientCode || "-"}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="space-y-1">
                                {patient.phone && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                                    <Phone className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                    <span className="truncate">{patient.phone}</span>
                                  </div>
                                )}
                                {patient.email && (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                    <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{patient.email}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <Calendar className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                  <span>{formatDate(patient.dateOfBirth)}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              {getStatusBadge(patient.isActive)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all"
                                  onClick={() => navigate(`/admin/patients/${patient.id}`)}
                                  title="Chi tiết"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 rounded-lg transition-all ${patient.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                                  onClick={() => handleToggleStatusClick(patient)}
                                  title={patient.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                                >
                                  {patient.isActive ? <Ban className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  onClick={() => handleDeleteClick(patient)}
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
        {patients.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 md:mt-8 bg-white p-3 md:p-4 rounded-xl border border-slate-100 shadow-sm gap-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Hiển thị trang <span className="text-slate-900 font-bold">{currentPage}</span> / <span className="text-slate-900 font-bold">{totalPages}</span>
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
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {patientToToggle?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {patientToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản của bệnh nhân{" "}
                <strong>{patientToToggle?.fullName}</strong>?
                {patientToToggle?.isActive && (
                  <span className="block mt-2 text-amber-600">
                    Bệnh nhân sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusDialogOpen(false)
                  setPatientToToggle(null)
                }}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={patientToToggle?.isActive ? "destructive" : "default"}
                onClick={handleToggleStatusConfirm}
                disabled={isTogglingStatus}
                className={!patientToToggle?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {patientToToggle?.isActive ? (
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

        {}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa bệnh nhân</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa bệnh nhân <strong>{patientToDelete?.fullName}</strong>?
                <span className="block mt-2 text-amber-600">
                  Thao tác này sẽ vô hiệu hóa tài khoản bệnh nhân và giữ lại dữ liệu cho mục đích lưu trữ.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Xóa
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
