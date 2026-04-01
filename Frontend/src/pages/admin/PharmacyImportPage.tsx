"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Box,
  Tags,
  Calendar,
  Truck,
  FileText
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { useAuth } from "../../features/auth/context/authContext"
import SidebarLayout from "../../components/layout/SidebarLayout"
import AdminSidebar from "../../components/layout/sidebar/admin"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import DoctorSidebar from "../../components/layout/sidebar/doctor"

interface ImportItem {
  id: string
  name: string
  group: string
  quantity: number
  unit: string
  costPrice: number
  profitMargin: number
  sellingPrice: number
  expiryDate: string
  batchNumber: string
  supplier: string
}

export default function PharmacyImportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [importItems, setImportItems] = useState<ImportItem[]>([
    {
      id: "1",
      name: "",
      group: "",
      quantity: 0,
      unit: "viên",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      batchNumber: "",
      supplier: "",
    },
  ])

  const addImportItem = () => {
    const newItem: ImportItem = {
      id: Date.now().toString(),
      name: "",
      group: "",
      quantity: 0,
      unit: "viên",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      batchNumber: "",
      supplier: "",
    }
    setImportItems([...importItems, newItem])
  }

  const removeImportItem = (id: string) => {
    if (importItems.length > 1) {
      setImportItems(importItems.filter((item) => item.id !== id))
    }
  }

  const updateImportItem = (id: string, field: keyof ImportItem, value: string | number) => {
    setImportItems(
      importItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          
          if (field === "costPrice" || field === "profitMargin") {
            const costPrice = field === "costPrice" ? Number(value) : item.costPrice
            const profitMargin = field === "profitMargin" ? Number(value) : item.profitMargin
            updatedItem.sellingPrice = Math.round(costPrice * (1 + profitMargin / 100))
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("Importing medications:", importItems)
    alert("Nhập thuốc thành công!")
    navigate("/pharmacy")
  }

  const totalCost = importItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
  const totalValue = importItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)

  const getSidebar = () => {
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    if (role === "admin" || role === "1") {
      return <AdminSidebar />
    }
    if (role === "doctor" || role === "4") {
      return <DoctorSidebar />
    }
    if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar />
    }
    return null
  }

  const sidebar = getSidebar()
  
  const pageContent = (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      {}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-teal-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative p-4 md:p-6 lg:p-8">
        <div className="max-w-[1700px] mx-auto space-y-6">
          
          {}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/pharmacy" className="inline-flex items-center text-slate-500 hover:text-cyan-600 mb-2 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại kho thuốc
              </Link>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-900 to-teal-900">
                Nhập kho thuốc
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Tạo phiếu nhập kho mới và cập nhật số lượng
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-0 shadow-lg shadow-cyan-500/5 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-100/50 flex items-center justify-center text-cyan-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Số mặt hàng</p>
                    <p className="text-2xl font-black text-slate-900">{importItems.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg shadow-blue-500/5 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tổng giá vốn</p>
                    <p className="text-2xl font-black text-slate-900">{totalCost.toLocaleString("vi-VN")} VND</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg shadow-emerald-500/5 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Giá trị bán ra</p>
                    <p className="text-2xl font-black text-emerald-600">{totalValue.toLocaleString("vi-VN")} VND</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="space-y-6">
              {importItems.map((item, index) => (
                <Card key={item.id} className="border-0 shadow-xl shadow-slate-200/40 bg-white/90 backdrop-blur overflow-hidden group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
                  <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 to-teal-400" />
                  <CardHeader className="py-4 px-6 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-800">
                        {item.name || "Thuốc mới chưa nhập tên"}
                      </CardTitle>
                    </div>
                    {importItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImportItem(item.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Package className="h-3.5 w-3.5" />
                          Tên thuốc *
                        </Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateImportItem(item.id, "name", e.target.value)}
                          placeholder="Vd: Paracetamol 500mg"
                          className="font-semibold"
                          required
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Tags className="h-3.5 w-3.5" />
                          Nhóm thuốc *
                        </Label>
                        <select
                          value={item.group}
                          onChange={(e) => updateImportItem(item.id, "group", e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                          required
                        >
                          <option value="">Chọn nhóm thuốc</option>
                          <option value="Giảm đau - Hạ sốt">Giảm đau - Hạ sốt</option>
                          <option value="Kháng sinh">Kháng sinh</option>
                          <option value="Vitamin & Khoáng chất">Vitamin & Khoáng chất</option>
                          <option value="Tiêu hóa">Tiêu hóa</option>
                          <option value="Tim mạch">Tim mạch</option>
                          <option value="Hô hấp">Hô hấp</option>
                        </select>
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Box className="h-3.5 w-3.5" />
                          Số lượng & Đơn vị *
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateImportItem(item.id, "quantity", Number(e.target.value))}
                            placeholder="0"
                            min="1"
                            className="font-semibold"
                            required
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => updateImportItem(item.id, "unit", e.target.value)}
                            className="w-28 h-10 px-3 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                          >
                            <option value="viên">viên</option>
                            <option value="vỉ">vỉ</option>
                            <option value="hộp">hộp</option>
                            <option value="chai">chai</option>
                            <option value="gói">gói</option>
                            <option value="tuýp">tuýp</option>
                            <option value="ml">ml</option>
                          </select>
                        </div>
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5" />
                          Giá vốn (VND) *
                        </Label>
                        <Input
                          type="number"
                          value={item.costPrice}
                          onChange={(e) => updateImportItem(item.id, "costPrice", Number(e.target.value))}
                          placeholder="0"
                          min="0"
                          className="font-mono font-bold text-slate-700"
                          required
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Lãi suất (%) *
                        </Label>
                        <Input
                          type="number"
                          value={item.profitMargin}
                          onChange={(e) => updateImportItem(item.id, "profitMargin", Number(e.target.value))}
                          placeholder="30"
                          min="0"
                          step="0.01"
                          className="font-bold text-emerald-600"
                          required
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Giá bán dự kiến
                        </Label>
                        <Input
                          type="number"
                          value={item.sellingPrice}
                          readOnly
                          className="bg-slate-50 font-mono font-black text-cyan-700 border-dashed border-cyan-200"
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5" />
                          Số lô SX *
                        </Label>
                        <Input
                          value={item.batchNumber}
                          onChange={(e) => updateImportItem(item.id, "batchNumber", e.target.value)}
                          placeholder="Vd: LOT2024001"
                          className="font-mono font-medium uppercase"
                          required
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Hạn sử dụng *
                        </Label>
                        <Input
                          type="date"
                          value={item.expiryDate}
                          onChange={(e) => updateImportItem(item.id, "expiryDate", e.target.value)}
                          className="font-medium"
                          required
                        />
                      </div>

                      {}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5" />
                          Nhà cung cấp *
                        </Label>
                        <Input
                          value={item.supplier}
                          onChange={(e) => updateImportItem(item.id, "supplier", e.target.value)}
                          placeholder="Vd: Dược Hậu Giang"
                          className="font-medium"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {}
            <div className="mt-8 flex items-center justify-between sticky bottom-6 bg-white/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/50 z-10">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={addImportItem}
                className="border-dashed border-2 border-slate-300 text-slate-600 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 h-12 px-6 rounded-xl font-bold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Thêm dòng
              </Button>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => navigate("/pharmacy")}
                  className="text-slate-500 hover:text-slate-800 h-12 px-6 rounded-xl font-bold"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-lg shadow-cyan-500/30 text-white h-12 px-8 rounded-xl font-black text-lg"
                >
                  <Save className="h-5 w-5 mr-2" />
                  NHẬP KHO
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <SidebarLayout userName={user?.fullName || user?.email} pageContent={pageContent}>
      {sidebar}
    </SidebarLayout>
  )
}
