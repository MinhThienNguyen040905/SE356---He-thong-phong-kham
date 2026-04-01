
import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { ArrowLeft, Calendar, User, Package, FileText, Printer, FileSpreadsheet, ExternalLink } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { MedicineService, type MedicineExport } from "../../features/inventory/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

export default function MedicineExportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exportData, setExportData] = useState<MedicineExport | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchExportDetail(id)
    }
  }, [id])

  const fetchExportDetail = async (exportId: string) => {
    try {
      setIsLoading(true)
      const data = await MedicineService.getMedicineExportById(parseInt(exportId))
      setExportData(data)
    } catch (error) {
      toast.error("Lỗi khi tải thông tin xuất kho")
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

  if (!exportData) {
    return (
      <AdminSidebar>
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Không tìm thấy nội dung</h2>
            <Button onClick={() => navigate("/admin/medicines/exports")}>Quay lại danh sách</Button>
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
             <Button variant="ghost" size="icon" onClick={() => navigate("/admin/medicines/exports")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết Xuất kho</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(exportData.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                <span>•</span>
                <span className="font-mono">#{exportData.id}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              In phiếu xuất
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
                        <Link to={`/pharmacy/${exportData.medicine?.id}`} className="font-medium text-lg text-blue-600 hover:underline">
                            {exportData.medicine?.name}
                        </Link>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Mã thuốc</span>
                        <Badge variant="outline" className="font-mono">{exportData.medicine?.medicineCode}</Badge>
                    </div>
                    <div className="col-span-2">
                        <span className="text-sm text-gray-500 block mb-1">Ghi chú thuốc</span>
                        <p className="text-sm text-gray-700">{exportData.medicine?.description || "Không có mô tả"}</p>
                    </div>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Chi tiết xuất
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Loại xuất</span>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                             {exportData.prescriptionId ? "Bán theo đơn" : "Xuất hủy / Khác"}
                        </Badge>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 block mb-1">Số lượng xuất</span>
                        <span className="text-xl font-bold text-red-600">-{exportData.quantity}</span>
                         <span className="text-sm text-gray-500 ml-1">{exportData.medicine?.unit}</span>
                    </div>

                    {exportData.prescriptionId && (
                        <div className="col-span-2 p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-900 block">Đơn thuốc liên quan</span>
                                    <span className="text-xs text-gray-500 font-mono">ID: {exportData.prescriptionId}</span>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link to={`/prescriptions/${exportData.prescriptionId}`}>
                                        Xem đơn thuốc <ExternalLink className="h-3 w-3 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Người thực hiện
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                            {exportData.exporter?.fullName?.charAt(0) || "U"}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{exportData.exporter?.fullName || "Hệ thống"}</div>
                            <div className="text-xs text-gray-500">Staff ID: {exportData.exportedBy}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileSpreadsheet className="h-4 w-4" />
                        Ghi chú
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 italic">
                        {}
                        Phiếu xuất được tạo tự động từ hệ thống kê đơn.
                    </p>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
