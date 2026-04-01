"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { toast } from "sonner"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { MedicineService, MedicineUnit, type UpdateMedicineData, type Medicine } from "../../features/inventory/services/medicine.service"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

const medicineSchema = yup.object({
  name: yup.string().required("Tên thuốc bắt buộc nhập"),
  group: yup.string().required("Nhóm thuốc bắt buộc nhập"),
  unit: yup.string().oneOf(Object.values(MedicineUnit), "Đơn vị không hợp lệ").required("Đơn vị bắt buộc nhập"),
  importPrice: yup.number().min(0, "Giá nhập phải >= 0").required("Giá nhập bắt buộc nhập"),
  salePrice: yup.number().min(0, "Giá bán phải >= 0").required("Giá bán bắt buộc nhập"),
  quantity: yup.number().min(0, "Số lượng phải >= 0").required("Số lượng bắt buộc nhập"),
  minStockLevel: yup.number().min(0, "Mức tồn kho tối thiểu phải >= 0").nullable().optional(),
  expiryDate: yup.string().required("Ngày hết hạn bắt buộc nhập"),
  activeIngredient: yup.string().nullable().optional(),
  manufacturer: yup.string().nullable().optional(),
  description: yup.string().nullable().optional(),
})

type MedicineFormValues = {
  name: string
  group: string
  unit: string
  importPrice: number
  salePrice: number
  quantity: number
  minStockLevel?: number | null | undefined
  expiryDate: string
  activeIngredient?: string | null | undefined
  manufacturer?: string | null | undefined
  description?: string | null | undefined
}

export default function EditMedicinePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMedicine, setIsLoadingMedicine] = useState(true)
  const [medicine, setMedicine] = useState<Medicine | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MedicineFormValues>({
    resolver: yupResolver(medicineSchema) as any,
  })

  const unit = watch("unit")

  useEffect(() => {
    if (id) {
      fetchMedicine()
    }
  }, [id])

  const fetchMedicine = async () => {
    if (!id) return
    try {
      setIsLoadingMedicine(true)
      const data = await MedicineService.getMedicineById(Number(id))
      setMedicine(data)
      setValue("name", data.name)
      setValue("group", data.group)
      setValue("unit", data.unit)
      setValue("importPrice", data.importPrice)
      setValue("salePrice", data.salePrice)
      setValue("quantity", data.quantity)
      setValue("minStockLevel", data.minStockLevel || 0)
      setValue("expiryDate", data.expiryDate.split('T')[0])
      setValue("activeIngredient", data.activeIngredient || "")
      setValue("manufacturer", data.manufacturer || "")
      setValue("description", data.description || "")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải thông tin thuốc")
      navigate("/admin/inventory")
    } finally {
      setIsLoadingMedicine(false)
    }
  }

  const onSubmit = async (data: MedicineFormValues) => {
    if (!id) return
    
    setIsLoading(true)
    try {
      const updateData: UpdateMedicineData = {
        name: data.name,
        group: data.group,
        unit: data.unit as MedicineUnit,
        importPrice: data.importPrice,
        salePrice: data.salePrice,
        quantity: data.quantity,
        minStockLevel: data.minStockLevel || 0,
        expiryDate: data.expiryDate,
        activeIngredient: data.activeIngredient || undefined,
        manufacturer: data.manufacturer || undefined,
        description: data.description || undefined,
      }

      await MedicineService.updateMedicine(Number(id), updateData)
      toast.success("Cập nhật thuốc thành công!")
      navigate(`/pharmacy/${id}`)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể cập nhật thuốc"
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingMedicine) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Chỉnh sửa thuốc</h1>
            <p className="text-slate-600 mt-1">Cập nhật thông tin thuốc: {medicine?.name}</p>
          </div>
          <Button variant="outline" onClick={() => navigate(`/pharmacy/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>

        {}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thuốc</CardTitle>
              <CardDescription>
                Cập nhật thông tin thuốc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Tên thuốc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ví dụ: Paracetamol 500mg"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="group">
                  Nhóm thuốc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="group"
                  {...register("group")}
                  placeholder="Ví dụ: Thuốc giảm đau, hạ sốt"
                  className={errors.group ? "border-red-500" : ""}
                />
                {errors.group && (
                  <p className="text-sm text-red-500">{errors.group.message}</p>
                )}
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="unit">
                  Đơn vị <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={unit}
                  onValueChange={(value) => setValue("unit", value)}
                >
                  <SelectTrigger className={errors.unit ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MedicineUnit.VIEN}>Viên</SelectItem>
                    <SelectItem value={MedicineUnit.ML}>ml</SelectItem>
                    <SelectItem value={MedicineUnit.HOP}>Hộp</SelectItem>
                    <SelectItem value={MedicineUnit.CHAI}>Chai</SelectItem>
                    <SelectItem value={MedicineUnit.TUYP}>Tuýp</SelectItem>
                    <SelectItem value={MedicineUnit.GOI}>Gói</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit.message}</p>
                )}
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="importPrice">
                    Giá nhập (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="importPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("importPrice", { valueAsNumber: true })}
                    className={errors.importPrice ? "border-red-500" : ""}
                  />
                  {errors.importPrice && (
                    <p className="text-sm text-red-500">
                      {errors.importPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice">
                    Giá bán (VND) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("salePrice", { valueAsNumber: true })}
                    className={errors.salePrice ? "border-red-500" : ""}
                  />
                  {errors.salePrice && (
                    <p className="text-sm text-red-500">
                      {errors.salePrice.message}
                    </p>
                  )}
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">
                    Mức tồn kho tối thiểu
                  </Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    {...register("minStockLevel", { valueAsNumber: true })}
                  />
                  {errors.minStockLevel && (
                    <p className="text-sm text-red-500">
                      {errors.minStockLevel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">
                    Ngày hết hạn <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    {...register("expiryDate")}
                    className={errors.expiryDate ? "border-red-500" : ""}
                  />
                  {errors.expiryDate && (
                    <p className="text-sm text-red-500">
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Số lượng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  {...register("quantity", { valueAsNumber: true })}
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="activeIngredient">Hoạt chất</Label>
                <Input
                  id="activeIngredient"
                  {...register("activeIngredient")}
                  placeholder="Ví dụ: Paracetamol"
                />
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Nhà sản xuất</Label>
                <Input
                  id="manufacturer"
                  {...register("manufacturer")}
                  placeholder="Ví dụ: Công ty Dược phẩm ABC"
                />
              </div>

              {}
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Mô tả về thuốc..."
                  rows={4}
                />
              </div>

              {}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/pharmacy/${id}`)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Cập nhật thuốc
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminSidebar>
  )
}
