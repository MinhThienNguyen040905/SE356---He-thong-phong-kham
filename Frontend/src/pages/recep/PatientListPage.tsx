"use client"

import { useState, useEffect } from "react"
import ReceptionistSidebar from '../../components/layout/sidebar/recep'
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  ChevronRight, 
  Activity, 
  Loader2, 
  X, 
  SlidersHorizontal,
  Users,
  UserCheck,
  Fingerprint
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { PremiumPagination } from "../../components/ui/premium-pagination"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { getPatients, type Patient } from "../../features/patient/services/patient.service"


export default function RecepPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGender, setFilterGender] = useState<"all" | "MALE" | "FEMALE" | "OTHER">("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    profileKeyword: "",
    gender: "all" as "all" | "MALE" | "FEMALE" | "OTHER",
    isActive: undefined as boolean | undefined,
    dateOfBirthFrom: "",
    dateOfBirthTo: "",
    createdFrom: "",
    createdTo: "",
  })

  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  })

  useEffect(() => {
    if (!isAdvancedSearchOpen && !searchQuery.trim()) {
      fetchPatients()
    }
  }, [pagination.page, filterGender, isAdvancedSearchOpen])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery
      }

      const response = await getPatients(params)
      let filtered = response.patients || []

      if (filterGender !== "all") {
        filtered = filtered.filter((p) => p.gender === filterGender)
      }

      setPatients(filtered)
      setPagination(response.pagination || pagination)
      setStats({
        total: response.pagination?.total || filtered.length,
        active: filtered.filter((p) => p.isActive).length,
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách bệnh nhân")
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      const filters: any = { page: 1, limit: pagination.limit }
      if (advancedFilters.keyword) filters.keyword = advancedFilters.keyword
      if (advancedFilters.profileKeyword) filters.profileKeyword = advancedFilters.profileKeyword
      if (advancedFilters.gender) filters.gender = advancedFilters.gender
      
      // If undefined, meaningful "All" for advanced search
      if (advancedFilters.isActive !== undefined) {
        filters.isActive = advancedFilters.isActive
      } else {
        filters.isActive = 'all'
      }

      if (advancedFilters.dateOfBirthFrom) filters.dateOfBirthFrom = advancedFilters.dateOfBirthFrom
      if (advancedFilters.dateOfBirthTo) filters.dateOfBirthTo = advancedFilters.dateOfBirthTo

      const response = await getPatients(filters)
      setPatients(response.patients || [])
      setPagination(response.pagination || pagination)
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${response.patients?.length || 0} bệnh nhân`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm bệnh nhân")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPatients()
      return
    }
    try {
      setIsSearching(true)
      const response = await getPatients({
        keyword: searchQuery,
        page: 1,
        limit: pagination.limit,
        isActive: 'all'
      })
      setPatients(response.patients || [])
      setPagination(response.pagination || pagination)
      toast.success(`Tìm thấy ${response.patients?.length || 0} bệnh nhân`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm bệnh nhân")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      profileKeyword: "",
      gender: "all",
      isActive: undefined,
      dateOfBirthFrom: "",
      dateOfBirthTo: "",
      createdFrom: "",
      createdTo: "",
    })
    fetchPatients()
  }

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) return "N/A"
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  return (
    <ReceptionistSidebar>
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="container mx-auto px-6 py-8 max-w-[1600px]">
          
          {}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hồ sơ bệnh nhân</h1>
              </div>
              <p className="text-slate-500 text-lg ml-15 font-medium opacity-80">Quản lý và tra cứu thông tin chi tiết bệnh nhân phòng khám</p>
            </div>
            
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl h-12 px-6 font-bold transition-all" asChild>
              <Link to="/recep/patients/create">
                <UserPlus className="h-5 w-5 mr-2" />
                Thêm bệnh nhân mới
              </Link>
            </Button>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 group overflow-hidden">
                <CardContent className="p-6 flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-7 h-7 text-indigo-600" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng số</div>
                      <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
                   </div>
                </CardContent>
             </Card>
             <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 group overflow-hidden">
                <CardContent className="p-6 flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <UserCheck className="w-7 h-7 text-emerald-600" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Đang hoạt động</div>
                      <div className="text-3xl font-extrabold text-slate-900">{stats.active}</div>
                   </div>
                </CardContent>
             </Card>
             <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 group overflow-hidden">
                <CardContent className="p-6 flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Activity className="w-7 h-7 text-rose-600" />
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Đang xem</div>
                      <div className="text-3xl font-extrabold text-slate-900">{patients.length}</div>
                   </div>
                </CardContent>
             </Card>
          </div>

          {}
          <Card className="border-0 shadow-sm bg-white rounded-2xl ring-1 ring-slate-200 mb-8 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    className="pl-12 h-12 bg-slate-50 border-0 ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl text-base transition-all"
                    placeholder="Tìm theo tên, mã bệnh nhân, số điện thoại, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-slate-50 p-1 rounded-xl ring-1 ring-slate-200 flex items-center gap-1">
                     {["all", "MALE", "FEMALE"].map((g) => (
                       <Button
                         key={g}
                         variant={filterGender === g ? "default" : "ghost"}
                         size="sm"
                         className={`rounded-lg px-4 h-9 font-bold transition-all ${filterGender === g ? 'bg-indigo-600' : 'text-slate-500 hover:text-indigo-600 hover:bg-white'}`}
                         onClick={() => { setFilterGender(g as any); setPagination({ ...pagination, page: 1 }) }}
                       >
                         {g === 'all' ? 'Tất cả' : g === 'MALE' ? 'Nam' : 'Nữ'}
                       </Button>
                     ))}
                  </div>

                  <Button
                    variant="outline"
                    className="h-12 border-slate-200 rounded-xl px-5 font-bold text-slate-600 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
                    onClick={() => setIsAdvancedSearchOpen(true)}
                  >
                    <SlidersHorizontal className="h-5 w-5 mr-2" />
                    Bộ lọc
                  </Button>
                  
                  <Button
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 font-extrabold shadow-lg shadow-indigo-100 group transition-all"
                    onClick={handleQuickSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                    <span className="ml-2">Tìm kiếm</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <Card className="border-0 shadow-sm bg-white rounded-3xl ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white px-8 py-6 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-extrabold text-slate-800 tracking-tight">Danh sách bệnh nhân</CardTitle>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">Danh lục hồ sơ y tế ({pagination.total} bản ghi)</p>
              </div>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
            </CardHeader>
            <CardContent className="p-0">
               {isLoading && patients.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
                    <p className="font-bold uppercase tracking-widest text-xs">Đang truy xuất dữ liệu...</p>
                 </div>
               ) : patients.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                       <Users className="h-10 w-10 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Không tìm thấy bệnh nhân</h3>
                      <p className="text-slate-400 max-w-xs mx-auto text-sm">Vui lòng kiểm tra lại từ khóa hoặc bộ lọc giới tính.</p>
                    </div>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50/80 border-b border-slate-100">
                         <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Thông tin bệnh nhân</th>
                         <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Giới tính</th>
                         <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mã định danh</th>
                         <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Liên hệ</th>
                         <th className="py-5 px-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                         <th className="py-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Chi tiết</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {patients.map((patient) => (
                           <tr key={patient.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                              <td className="py-5 px-8">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md ${
                                       patient.gender === 'MALE' ? 'bg-indigo-500 shadow-indigo-100' :
                                       patient.gender === 'FEMALE' ? 'bg-rose-500 shadow-rose-100' : 'bg-slate-500 shadow-slate-100'
                                    }`}>
                                       {patient.fullName.charAt(0)}
                                    </div>
                                    <div>
                                       <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight whitespace-nowrap">{patient.fullName}</div>
                                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                          {calculateAge(patient.dateOfBirth)} tuổi
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-5 px-6 text-center">
                                 <Badge variant="outline" className={`gap-1.5 py-1 px-3 rounded-lg font-bold border ${
                                    patient.gender === 'MALE' 
                                       ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                       : patient.gender === 'FEMALE' 
                                          ? 'bg-pink-50 text-pink-700 border-pink-200' 
                                          : 'bg-slate-50 text-slate-700 border-slate-200'
                                 }`}>
                                    {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                 </Badge>
                              </td>
                              <td className="py-5 px-6">
                                 <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 gap-1.5 py-1 px-3 rounded-lg font-bold">
                                    <Fingerprint className="w-3.5 h-3.5" />
                                    {patient.patientCode}
                                 </Badge>
                              </td>
                              <td className="py-5 px-6">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                       <Phone className="w-3 h-3 text-slate-400" />
                                       {patient.phone || "Chưa có SĐT"}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                       <Mail className="w-3 h-3" />
                                       {patient.email || "Chưa có email"}
                                    </div>
                                 </div>
                              </td>
                              <td className="py-5 px-6 text-center">
                                 {patient.isActive ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-bold rounded-lg px-2.5 py-1 whitespace-nowrap">Đang hoạt động</Badge>
                                 ) : (
                                    <Badge className="bg-slate-100 text-slate-400 hover:bg-slate-100 border-slate-200 font-bold rounded-lg px-2.5 py-1 whitespace-nowrap">Ngưng hoạt động</Badge>
                                 )}
                              </td>
                              <td className="py-5 px-8 text-right">
                                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all group/btn" asChild>
                                    <Link to={`/recep/patients/${patient.id}`}>
                                       <ChevronRight className="h-5 w-5 text-slate-400 group-hover/btn:text-indigo-600 transition-all" />
                                    </Link>
                                 </Button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                 </div>
               )}

               {}
               {pagination.totalPages > 1 && (
                 <div className="px-8 pb-8">
                   <PremiumPagination
                     currentPage={pagination.page}
                     totalPages={pagination.totalPages}
                     totalItems={pagination.total}
                     itemsPerPage={pagination.limit}
                     onPageChange={(page) => setPagination({ ...pagination, page })}
                   />
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {}
        <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
          <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-indigo-600 px-8 py-6 text-white text-center sm:text-left">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight uppercase tracking-wider">Bộ lọc hồ sơ</DialogTitle>
                <DialogDescription className="text-indigo-100 opacity-90 font-medium">
                  Tìm kiếm thông tin bệnh nhân theo các tiêu chí chuyên sâu
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Họ tên / Mã BN</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="VD: Nguyễn Văn A hoặc BN-123"
                    value={advancedFilters.keyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thông tin bổ sung</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11"
                    placeholder="SĐT, Email, Địa chỉ..."
                    value={advancedFilters.profileKeyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, profileKeyword: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giới tính</Label>
                  <Select
                    value={advancedFilters.gender}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, gender: value as any })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trạng thái hồ sơ</Label>
                  <Select
                    value={advancedFilters.isActive === undefined ? "all" : advancedFilters.isActive.toString()}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, isActive: value === "all" ? undefined : value === "true" })}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 h-11">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="true">Đang hoạt động</SelectItem>
                      <SelectItem value="false">Ngưng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày sinh từ</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 font-medium"
                    type="date"
                    value={advancedFilters.dateOfBirthFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateOfBirthFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Đến ngày sinh</Label>
                  <Input
                    className="rounded-xl border-slate-200 bg-slate-50 h-11 font-medium"
                    type="date"
                    value={advancedFilters.dateOfBirthTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateOfBirthTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="bg-slate-50/80 px-8 py-5 flex items-center justify-between border-t border-slate-100">
              <Button 
                variant="ghost" 
                onClick={clearAdvancedSearch}
                className="rounded-xl font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50"
              >
                <X className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button 
                onClick={handleAdvancedSearch} 
                disabled={isSearching}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-8 font-extrabold shadow-lg shadow-indigo-100"
              >
                {isSearching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Áp dụng bộ lọc
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ReceptionistSidebar>
  )
}
