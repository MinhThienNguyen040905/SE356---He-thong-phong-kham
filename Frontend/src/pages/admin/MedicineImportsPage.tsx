"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Calendar, Package, FileText, Eye, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { MedicineService, type MedicineImport } from "../../features/inventory/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function MedicineImportsPage() {
  const [imports, setImports] = useState<MedicineImport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchImports()
  }, [pagination.page])

  const fetchImports = async () => {
    try {
      setIsLoading(true)
      const response = await MedicineService.getAllMedicineImports({
        page: pagination.page,
        limit: pagination.limit,
      })
      
      if (response.data) {
        setImports(response.data as MedicineImport[])
        setPagination({
          ...pagination,
          total: response.total,
          totalPages: response.totalPages,
        })
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách nhập kho"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const filteredImports = imports.filter((importItem) => {
    const matchesSearch =
      importItem.medicine?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      importItem.medicine?.medicineCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      importItem.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      importItem.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const totalValue = imports.reduce(
    (sum, item) => sum + item.quantity * item.importPrice,
    0
  )

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lịch sử nhập kho</h1>
            <p className="text-slate-600 mt-1">Xem tất cả các lần nhập thuốc vào kho</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tổng quan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Tổng số lần nhập</p>
                <p className="text-2xl font-bold text-slate-900">{pagination.total}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tổng giá trị nhập</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {totalValue.toLocaleString("vi-VN")} VND
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Trang hiện tại</p>
                <p className="text-2xl font-bold text-slate-900">
                  {pagination.page} / {pagination.totalPages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên thuốc, mã thuốc, nhà cung cấp, số lô..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách nhập kho</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredImports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có lịch sử nhập kho</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-slate-700">Mã thuốc</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Tên thuốc</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Số lượng</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Giá nhập</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Thành tiền</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Nhà cung cấp</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Số lô</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Người nhập</th>
                      <th className="text-left p-4 font-semibold text-slate-700">Ngày nhập</th>
                      <th className="text-right p-4 font-semibold text-slate-700">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredImports.map((importItem) => (
                      <tr
                        key={importItem.id}
                        className="border-b hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono">
                            {importItem.medicine?.medicineCode || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {importItem.medicine ? (
                            <Link
                              to={`/pharmacy/${importItem.medicine.id}`}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {importItem.medicine.name}
                            </Link>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4">{importItem.quantity}</td>
                        <td className="p-4">
                          {importItem.importPrice.toLocaleString("vi-VN")} VND
                        </td>
                        <td className="p-4 font-semibold">
                          {(importItem.quantity * importItem.importPrice).toLocaleString("vi-VN")} VND
                        </td>
                        <td className="p-4">{importItem.supplier || "N/A"}</td>
                        <td className="p-4">
                          {importItem.batchNumber ? (
                            <Badge variant="outline" className="font-mono">
                              {importItem.batchNumber}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4">
                          {importItem.importer?.fullName || "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(importItem.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: vi,
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/medicines/imports/${importItem.id}`}>
                              <Eye className="h-4 w-4 text-slate-500 hover:text-blue-600" />
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
            {!isLoading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-slate-600">
                  Hiển thị {((pagination.page - 1) * pagination.limit) + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{" "}
                  {pagination.total} kết quả
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}
