"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Receipt, 
  User, 
  Stethoscope, 
  Calendar, 
  FileText, 
  DollarSign,
  ChevronRight,
  Info,
  CheckCircle2,
  Trash2
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { toast } from "sonner"
import { InvoiceService } from "../../features/finance/services/invoice.service"
import { getVisits, type Visit } from "../../features/appointment/services/visit.service"
import ReceptionistSidebar from "../../components/layout/sidebar/recep"
import AdminSidebar from "../../components/layout/sidebar/admin"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVisits, setIsLoadingVisits] = useState(true)
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string>("")
  const [examinationFee, setExaminationFee] = useState("")

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async () => {
    try {
      setIsLoadingVisits(true)
      const response = await getVisits({
        status: "COMPLETED",
        limit: 100,
      })
      setVisits(response.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách lần khám")
    } finally {
      setIsLoadingVisits(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisitId || !examinationFee) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    const fee = parseFloat(examinationFee)
    if (isNaN(fee) || fee <= 0) {
      toast.error("Phí khám bệnh phải lớn hơn 0")
      return
    }

    try {
      setIsLoading(true)
      const response = await InvoiceService.createInvoice({
        visitId: parseInt(selectedVisitId),
        examinationFee: fee,
      })
      if (response.success && response.data) {
        toast.success("Tạo hóa đơn thành công")
        navigate(`/invoices/${response.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo hóa đơn")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedVisit = visits.find((v) => v.id === parseInt(selectedVisitId))

  if (!user) return null
  const roleId = Number(user.roleId || 0)

  const pageContent = (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="container mx-auto px-6 py-8 max-w-[1200px]">
        
        <Button variant="ghost" className="mb-6 pl-0 group hover:bg-transparent" onClick={() => navigate(-1)}>
           <div className="w-10 h-10 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center mr-3 group-hover:ring-emerald-200 group-hover:bg-emerald-50 transition-all">
              <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
           </div>
           <span className="text-slate-500 font-black uppercase tracking-widest text-xs group-hover:text-emerald-600 transition-colors">Trở về</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                 <h1 className="text-4xl font-black tracking-tighter mb-4 leading-tight uppercase">Tạo<br/>Hóa Đơn</h1>
                 <p className="text-emerald-100 font-bold opacity-80 mb-8 leading-relaxed">Hệ thống hóa đơn thanh toán cho các phiên khám đã hoàn thành.</p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">1</div>
                       <div className="text-sm font-black uppercase tracking-wider">Chọn phiên khám</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">2</div>
                       <div className="text-sm font-black uppercase tracking-wider">Áp phí khám</div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">3</div>
                       <div className="text-sm font-black uppercase tracking-wider">Xuất bản</div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 ring-1 ring-slate-200 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-500" /> Thông tin bổ sung
                 </h3>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Hệ thống sẽ tự động quét các đơn thuốc (nếu có) thuộc phiên khám này để tính tổng chi phí. Hóa đơn sau khi tạo có thể được xuất PDF ngay lập tức.
                 </p>
              </div>
           </div>

           {}
           <div className="lg:col-span-8">
              <Card className="border-0 shadow-xl rounded-[3rem] bg-white ring-1 ring-slate-100 overflow-hidden">
                 <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                          <Receipt className="w-7 h-7 text-emerald-600" /> Khởi tạo chứng từ
                       </CardTitle>
                       <Badge className="bg-emerald-100 text-emerald-700 font-black border-0 px-3 py-1 rounded-lg text-[10px] uppercase">Hóa đơn mới</Badge>
                    </div>
                 </CardHeader>
                 <CardContent className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                       
                       {}
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Chọn phiên khám thành công *</Label>
                          {isLoadingVisits ? (
                             <div className="h-14 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
                                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                             </div>
                          ) : (
                             <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all">
                                   <SelectValue placeholder="Chọn từ danh sách chờ thanh toán..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 rounded-2xl border-slate-100">
                                   {visits.length === 0 ? (
                                      <div className="p-8 text-center text-slate-400 font-bold text-sm">Không có phiên khám nào chờ thanh toán</div>
                                   ) : (
                                      visits.map((v) => (
                                         <SelectItem key={v.id} value={v.id.toString()} className="h-14 rounded-xl focus:bg-emerald-50">
                                            <div className="flex flex-col">
                                               <span className="font-extrabold text-slate-900 uppercase text-xs">{v.patient?.fullName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{v.doctor?.fullName} • {format(new Date(v.visitDate || ""), "dd/MM/yyyy")}</span>
                                            </div>
                                         </SelectItem>
                                      ))
                                   )}
                                </SelectContent>
                             </Select>
                          )}
                       </div>

                       {}
                       {selectedVisit && (
                          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed animate-in fade-in slide-in-from-top-4 duration-300">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                   <div className="group">
                                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Bệnh nhân</div>
                                      <div className="font-extrabold text-slate-900 uppercase text-sm">{selectedVisit.patient?.fullName}</div>
                                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{selectedVisit.patient?.patientCode}</div>
                                   </div>
                                   <div className="group">
                                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Stethoscope className="w-3 h-3" /> Bác sĩ</div>
                                      <div className="font-extrabold text-slate-900 uppercase text-sm">BS. {selectedVisit.doctor?.fullName}</div>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <div className="group">
                                      <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Ngày khám</div>
                                       <div className="font-extrabold text-slate-900 uppercase text-sm">{format(new Date(selectedVisit.visitDate || ""), "EEEE, dd MMMM", { locale: vi })}</div>
                                   </div>
                                   {selectedVisit.diagnosis && (
                                      <div className="group">
                                         <div className="text-[10px] font-black uppercase text-slate-400 mb-1 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Chẩn đoán</div>
                                         <div className="text-xs font-bold text-emerald-600 truncate">{selectedVisit.diagnosis}</div>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       )}

                       {}
                       <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phí khám bệnh niêm yết (VND) *</Label>
                          <div className="relative group">
                             <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-focus-within:bg-emerald-600 transition-colors">
                                <DollarSign className="w-4 h-4 text-emerald-600 group-focus-within:text-white transition-colors" />
                             </div>
                             <Input 
                                type="number" 
                                value={examinationFee} 
                                onChange={(e) => setExaminationFee(e.target.value)} 
                                className="h-16 pl-16 rounded-2xl border-slate-200 bg-slate-50/50 font-black text-2xl text-emerald-700 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="0"
                             />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide ml-1">Nhập số tiền phí khám định danh cho loại hình dịch vụ này.</p>
                       </div>

                       {}
                       <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-slate-50">
                          <Button type="submit" disabled={isLoading || !selectedVisitId || !examinationFee} className="flex-1 h-16 bg-emerald-600 hover:bg-black rounded-[2rem] text-lg font-black text-white shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest gap-2 group">
                             {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> TẠO HÓA ĐƠN</>}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="h-16 px-10 border-slate-200 rounded-[2rem] font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-all">Hủy bỏ</Button>
                       </div>
                    </form>
                 </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )

  if (roleId === 1) return <AdminSidebar>{pageContent}</AdminSidebar>
  if (roleId === 2) return <ReceptionistSidebar>{pageContent}</ReceptionistSidebar>
  return null
}
