"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../features/auth/context/authContext"
import { ArrowLeft, Calendar, Package, DollarSign, TrendingUp, Clock, Loader2, Edit, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { toast } from "sonner"
import AdminSidebar from "../components/layout/sidebar/admin"
import ReceptionistSidebar from "../components/layout/sidebar/recep"
import DoctorSidebar from "../components/layout/sidebar/doctor"
import { MedicineService, type Medicine, type MedicineImport, type MedicineExport, MedicineStatus, MedicineUnit } from "../features/inventory/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"

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

export default function PharmacyDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [imports, setImports] = useState<MedicineImport[]>([])
  const [exports, setExports] = useState<MedicineExport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("imports")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!medicine) return
    
    try {
      setIsDeleting(true)
      await MedicineService.deleteMedicine(medicine.id)
      toast.success("Xóa thuốc thành công!")
      setIsDeleteDialogOpen(false)
      window.history.back()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa thuốc")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchMedicine()
    }
  }, [id])

  const fetchMedicine = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await MedicineService.getMedicineById(Number(id))
      setMedicine(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải thông tin thuốc")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchImports = async () => {
    if (!id) return
    try {
      setIsLoadingHistory(true)
      const data = await MedicineService.getMedicineImportHistory(Number(id))
      setImports(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch sử nhập kho")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const fetchExports = async () => {
    if (!id) return
    try {
      setIsLoadingHistory(true)
      const data = await MedicineService.getMedicineExportHistory(Number(id))
      setExports(data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch sử xuất kho")
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (id && activeTab === "imports") {
      fetchImports()
    } else if (id && activeTab === "exports") {
      fetchExports()
    }
  }, [id, activeTab])

  const getSidebarComponent = () => {
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

  const SidebarComponent = getSidebarComponent()

  if (!SidebarComponent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <SidebarComponent userName={user?.fullName || user?.email}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarComponent>
    )
  }

  if (!medicine) {
    return (
      <SidebarComponent userName={user?.fullName || user?.email}>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin thuốc</p>
          <Button onClick={() => window.history.back()} className="mt-4">
            Quay lại
          </Button>
        </div>
      </SidebarComponent>
    )
  }

  const profitMargin = medicine.importPrice > 0
    ? ((medicine.salePrice - medicine.importPrice) / medicine.importPrice) * 100
    : 0

  return (
    <SidebarComponent userName={user?.fullName || user?.email}>
      <div className="space-y-6">
        {}
        <div className="flex items-start justify-between">
          <div>
            <Button variant="ghost" className="mb-2 pl-0" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{medicine.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                {medicine.group}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {medicine.medicineCode}
              </Badge>
              <Badge
                variant="outline"
                className={
                  medicine.status === MedicineStatus.ACTIVE
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                    : medicine.status === MedicineStatus.EXPIRED
                    ? "bg-red-500/10 text-red-700 border-red-200"
                    : "bg-gray-500/10 text-gray-700 border-gray-200"
                }
              >
                <Package className="h-3 w-3 mr-1" />
                {medicine.status === MedicineStatus.ACTIVE
                  ? "Hoạt động"
                  : medicine.status === MedicineStatus.EXPIRED
                  ? "Hết hạn"
                  : "Đã xóa"}
              </Badge>
            </div>
          </div>
          {(user?.roleId === 1 || String(user?.role || "").toLowerCase() === "admin") && (
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="outline"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 text-white border-0"
                asChild
              >
                <Link to={`/admin/medicines/${medicine.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Link>
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Số lượng tồn kho</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {medicine.quantity} {getUnitLabel(medicine.unit)}
                    </div>
                    {medicine.minStockLevel > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        Mức tối thiểu: {medicine.minStockLevel} {getUnitLabel(medicine.unit)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Hạn sử dụng</div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })}
                    </div>
                  </div>
                  {medicine.activeIngredient && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Hoạt chất</div>
                      <div className="text-lg font-semibold text-slate-900">{medicine.activeIngredient}</div>
                    </div>
                  )}
                  {medicine.manufacturer && (
                    <div>
                      <div className="text-sm text-slate-600 mb-1">Nhà sản xuất</div>
                      <div className="text-lg font-semibold text-slate-900">{medicine.manufacturer}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Thông tin giá</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Giá vốn</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                      <span className="text-xl font-bold text-slate-900">
                        {new Intl.NumberFormat("vi-VN").format(Number(medicine.importPrice))} VND
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Giá bán</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                      <span className="text-xl font-bold text-blue-600">
                        {new Intl.NumberFormat("vi-VN").format(Number(medicine.salePrice))} VND
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Lãi suất</div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <span className="text-xl font-bold text-emerald-600">+{profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {}
            {medicine.description && (
              <Card className="border-0 shadow-xl shadow-slate-900/5">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="text-xl text-slate-900">Mô tả</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700">{medicine.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {}
          <div>
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Lịch sử kho</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full rounded-none border-b">
                    <TabsTrigger value="imports" className="flex-1">
                      Nhập kho
                    </TabsTrigger>
                    <TabsTrigger value="exports" className="flex-1">
                      Xuất kho
                    </TabsTrigger>
                  </TabsList>

                  {}
                  <TabsContent value="imports" className="p-6">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : imports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Chưa có lịch sử nhập kho</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {imports.map((importItem) => (
                          <div
                            key={importItem.id}
                            className="p-4 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {format(new Date(importItem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </span>
                              {importItem.batchNumber && (
                                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                                  {importItem.batchNumber}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <div className="flex justify-between">
                                <span>Số lượng:</span>
                                <span className="font-medium text-slate-900">
                                  {importItem.quantity} {getUnitLabel(medicine.unit)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Giá nhập:</span>
                                <span className="font-medium text-slate-900">
                                  {new Intl.NumberFormat("vi-VN").format(Number(importItem.importPrice))} VND
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Thành tiền:</span>
                                <span className="font-medium text-slate-900">
                                  {new Intl.NumberFormat("vi-VN").format(Number(importItem.quantity * importItem.importPrice))} VND
                                </span>
                              </div>
                              {importItem.supplier && (
                                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                                  <div>NCC: {importItem.supplier}</div>
                                  {importItem.importer && (
                                    <div>Nhập bởi: {importItem.importer.fullName}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {}
                  <TabsContent value="exports" className="p-6">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : exports.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Chưa có lịch sử xuất kho</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {exports.map((exportItem) => (
                          <div
                            key={exportItem.id}
                            className="p-4 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {format(new Date(exportItem.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600">
                              <div className="flex justify-between">
                                <span>Số lượng:</span>
                                <span className="font-medium text-slate-900">
                                  {exportItem.quantity} {getUnitLabel(medicine.unit)}
                                </span>
                              </div>
                              {exportItem.exporter && (
                                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                                  <div>Xuất bởi: {exportItem.exporter.fullName}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa thuốc</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa thuốc <strong>{medicine.name}</strong> (Mã: {medicine.medicineCode})? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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
    </SidebarComponent>
  )
}
