
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { ArrowLeft, Calendar, User, Package, DollarSign, FileText, Printer, Building } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { MedicineService, type MedicineImport } from "../../features/inventory/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

export default function MedicineImportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [importData, setImportData] = useState<MedicineImport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchImportDetail(id)
    }
  }, [id])

  const fetchImportDetail = async (importId: string) => {
    try {
      setIsLoading(true)
      const data = await MedicineService.getMedicineImportById(parseInt(importId))
      setImportData(data)
    } catch (error) {
      toast.error("Lỗi khi tải thông tin nhập kho")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminSidebar>
    )
  }

  if (!importData) {
    return (
      <AdminSidebar>
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Không tìm thấy nội dung</h2>
            <Button onClick={() => navigate("/admin/medicines/imports")}>Quay lại danh sách</Button>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8 max-w-5xl mx-auto">
        {}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => navigate("/admin/medicines/imports")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết Nhập kho</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(importData.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                <span>•</span>
                <span className="font-mono">#{importData.id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              In phiếu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Thông tin Thuốc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Tên thuốc</span>
                        <span className="font-medium text-lg text-gray-900">{importData.medicine?.name}</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Mã thuốc</span>
                        <Badge variant="outline" className="font-mono">{importData.medicine?.medicineCode}</Badge>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Số đăng ký</span>
                        <span className="font-medium">{importData.medicine?.registrationNumber || "N/A"}</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Hoạt chất</span>
                        <span className="font-medium">{importData.medicine?.activeIngredient || "N/A"}</span>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Chi tiết nhập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Số lượng nhập</span>
                        <span className="text-xl font-bold text-blue-600">{importData.quantity}</span>
                         <span className="text-sm text-gray-500 ml-1">{importData.medicine?.unit}</span>
                    </div>
                     <div>
                        <span className="text-sm text-gray-500 block mb-1">Số lô (Batch Number)</span>
                         <Badge variant="secondary" className="font-mono text-base">{importData.batchNumber || "Unknown"}</Badge>
                    </div>
                    <div>
                         <span className="text-sm text-gray-500 block mb-1">Hạn sử dụng</span>
                         <span className="font-medium">
                            {importData.expiryDate ? format(new Date(importData.expiryDate), "dd/MM/yyyy") : "N/A"}
                         </span>
                    </div>
                     <div>
                         <span className="text-sm text-gray-500 block mb-1">Ngày sản xuất</span>
                         <span className="font-medium">
                            {importData.manufactureDate ? format(new Date(importData.manufactureDate), "dd/MM/yyyy") : "N/A"}
                         </span>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <DollarSign className="h-4 w-4" />
                        Tài chính
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Đơn giá nhập</span>
                        <span className="font-medium">{importData.importPrice?.toLocaleString("vi-VN")} VND</span>
                    </div>
                     <div className="flex justify-between items-center py-2">
                        <span className="font-semibold text-gray-900">Tổng tiền</span>
                        <span className="font-bold text-xl text-green-600">
                            {(importData.importPrice * importData.quantity).toLocaleString("vi-VN")} VND
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Building className="h-4 w-4" />
                        Nhà cung cấp
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="font-medium text-gray-900 mb-1">{importData.supplier || "Chưa cập nhật"}</div>
                    <p className="text-sm text-gray-500">Thông tin liên hệ nhà cung cấp chưa có trong bản ghi này.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Người thực hiện
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {importData.importer?.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{importData.importer?.fullName || "Hệ thống"}</div>
                            <div className="text-xs text-gray-500">Staff ID: {importData.importedBy}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
