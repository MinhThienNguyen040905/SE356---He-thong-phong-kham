import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import AdminSidebar from '../../components/layout/sidebar/admin';
import { 
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
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
import api from "../../lib/api";


interface Doctor {
  id: number
  doctorCode: string
  userId: number
  specialtyId: number
  position?: string
  degree?: string
  description?: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    fullName: string
    email: string
    avatar?: string
    isActive: boolean
  }
  specialty: {
    id: number
    name: string
  }
}

type SortOption = "name" | "position"

export default function DoctorList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10
  const dropdownRef = useRef<HTMLDivElement>(null)

  
  const fetchDoctors = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await api.get('/doctors')
      
      if (response.data.success) {
        setDoctors(response.data.data)
        toast.success(`Đã tải ${response.data.data.length} bác sĩ`)
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách bác sĩ')
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        const errorMessage = "Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại."
        setError(errorMessage)
        toast.error(errorMessage)
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách bác sĩ'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getStatusBadge = (isActive: boolean = true) => {
    const status = isActive ? "Active" : "Inactive"
    const statusConfig = {
      "Active": "bg-green-100 text-green-800 border-green-200",
      "Inactive": "bg-red-100 text-red-800 border-red-200"
    }
    
    return (
      <Badge variant="outline" className={statusConfig[status]}>
        {status}
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

  const getSortValue = (doctor: Doctor, sortBy: SortOption) => {
    switch (sortBy) {
      case "name":
        return doctor.user.fullName.toLowerCase()
      case "position":
        return doctor.position?.toLowerCase() || ""
      default:
        return doctor.user.fullName.toLowerCase()
    }
  }

  const sortedAndFilteredDoctors = doctors
    .filter(doctor => {
      const searchLower = searchQuery.toLowerCase()
      return doctor.user.fullName.toLowerCase().includes(searchLower) ||
             doctor.doctorCode.toLowerCase().includes(searchLower) ||
             doctor.specialty.name.toLowerCase().includes(searchLower) ||
             (doctor.user.email && doctor.user.email.toLowerCase().includes(searchLower))
    })
    .sort((a, b) => {
      const aValue = getSortValue(a, sortBy)
      const bValue = getSortValue(b, sortBy)
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })

  
  const totalPages = Math.ceil(sortedAndFilteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDoctors = sortedAndFilteredDoctors.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
    setShowSortDropdown(false)
  }

  const getSortLabel = (sortBy: SortOption) => {
    const labels = {
      name: "Name",
      position: "Position"
    }
    return labels[sortBy]
  }

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return
    
    try {
      setIsDeleting(true)
      const response = await api.delete(`/doctors/${doctorToDelete.id}`)
      
      if (response.data.success) {
        toast.success("Xóa bác sĩ thành công!")
        setDeleteDialogOpen(false)
        setDoctorToDelete(null)
        
        setTimeout(async () => {
          await fetchDoctors()
        }, 500)
      } else {
        throw new Error(response.data.message || "Không thể xóa bác sĩ")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        const errorMessage = error.response?.data?.message || "Không thể xóa bác sĩ"
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách bác sĩ...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDoctors} className="bg-blue-600 hover:bg-blue-700">
              Thử lại
            </Button>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Records</h1>
          
          {}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by Name, ID, or Specialty..."
              className="pl-10 h-12 text-base bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {}
              <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {getSortLabel(sortBy)} {sortOrder === "asc" ? "↑" : "↓"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                
                {showSortDropdown && (
                  <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[150px]">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSortChange("name")}
                      >
                        Name
                        {sortBy === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSortChange("position")}
                      >
                        Position
                        {sortBy === "position" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {}
            <Button 
            onClick={() => navigate("/admin/doctors/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
              Add Doctor
            </Button>
          </div>
        </div>

        {}
        <div className="mb-4">
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
            Hiển thị <span className="text-slate-900 font-bold">{currentDoctors.length}</span> trong tổng số <span className="text-slate-900 font-bold">{sortedAndFilteredDoctors.length}</span> bác sĩ
          </span>
        </div>

        {}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      DOCTOR
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      POSITION
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentDoctors.map((doctor, index) => (
                    <tr key={doctor.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(doctor.user.fullName)} flex items-center justify-center text-white font-semibold text-sm`}>
                            {doctor.user.avatar ? (
                              <img 
                                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${doctor.user.avatar}`} 
                                alt={doctor.user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              getAvatarInitials(doctor.user.fullName)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doctor.user.fullName}</div>
                            <div className="text-sm text-gray-500">{doctor.specialty.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-mono">{doctor.doctorCode}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{doctor.position || 'Chưa cập nhật'}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(doctor.user.isActive)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/doctors/${doctor.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                              Chi tiết
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteClick(doctor)}
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
        {sortedAndFilteredDoctors.length > 0 && (
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
                onClick={handlePrevious}
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
                      onClick={() => handlePageChange(page)}
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
                onClick={handleNext}
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
              <DialogTitle>Xác nhận xóa bác sĩ</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa bác sĩ <strong>{doctorToDelete?.user?.fullName}</strong> (Mã: {doctorToDelete?.doctorCode})? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setDoctorToDelete(null)
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
    </AdminSidebar>
  );
}