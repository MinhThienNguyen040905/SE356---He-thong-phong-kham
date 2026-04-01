import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DoctorSidebar from '../../components/layout/sidebar/doctor'
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import api from "../../lib/api"
import { toast } from "sonner"
import { PrescriptionService } from '../../features/appointment/services/prescription.service'
import type { Prescription } from '../../types/prescription.types'
import { 
  ArrowLeft, 
  Save,
  Plus,
  Trash2,
  Pill,
  Activity,
  Loader2,
  User,
  Heart,
  Thermometer,
  Scale,
  Stethoscope,
  FileText,
  Sparkles,
  Clock
} from "lucide-react"


interface Medicine {
  id: number
  name: string
  category: string
  unit: string
  currentStock: number
  unitPrice: number
}

interface Medication {
  id: string
  medicineId: number | null
  name: string
  quantity: number
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  instruction: string
  days: number
}

export default function EditPrescriptionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  
  const [medications, setMedications] = useState<Medication[]>([])
  
  
  const [additionalNotes, setAdditionalNotes] = useState("")
  
  
  const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({})
  const [showSuggestions, setShowSuggestions] = useState<{[key: string]: boolean}>({})

  
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID đơn thuốc không hợp lệ')
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        
        const medicinesResponse = await api.get('/medicines')
        if (medicinesResponse.data.success) {
          setMedicines(medicinesResponse.data.data)
        }
        
        
        const prescriptionResponse = await PrescriptionService.getPrescriptionById(parseInt(id))
        
        if (prescriptionResponse.success && prescriptionResponse.data) {
          const transformedPrescription = PrescriptionService.transformPrescriptionData(prescriptionResponse.data)
          setPrescription(transformedPrescription)
          
          
          if (transformedPrescription.details && transformedPrescription.details.length > 0) {
            const loadedMedications: Medication[] = transformedPrescription.details.map((detail: any, index: number) => ({
              id: `existing-${detail.id || index}`,
              medicineId: detail.medicineId,
              name: detail.medicineName,
              quantity: detail.quantity,
              dosageMorning: detail.dosageMorning || 0,
              dosageNoon: detail.dosageNoon || 0,
              dosageAfternoon: detail.dosageAfternoon || 0,
              dosageEvening: detail.dosageEvening || 0,
              instruction: detail.instruction || "",
              days: detail.days || 1
            }))
            setMedications(loadedMedications)
            
            const searchTermsMap: {[key: string]: string} = {}
            loadedMedications.forEach(med => {
              searchTermsMap[med.id] = med.name
            })
            setSearchTerms(searchTermsMap)
          } else {
            
            setMedications([{
              id: "1",
              medicineId: null,
              name: "",
              quantity: 0,
              dosageMorning: 0,
              dosageNoon: 0,
              dosageAfternoon: 0,
              dosageEvening: 0,
              instruction: "",
              days: 1
            }])
          }
          
          
          setAdditionalNotes(transformedPrescription.note || "")
          
        } else {
          setError('Không tìm thấy đơn thuốc')
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  
  const getFilteredMedicines = (searchTerm: string) => {
    if (!searchTerm || typeof searchTerm !== 'string') return []
    const term = searchTerm.toLowerCase()
    
    return medicines.filter(medicine => {
      const name = medicine?.name?.toLowerCase() || ""
      const category = medicine?.category?.toLowerCase() || ""
      return name.includes(term) || category.includes(term)
    }).slice(0, 5)
  }

  
  const selectMedicine = (medicationId: string, medicine: Medicine) => {
    updateMedication(medicationId, 'name', medicine.name)
    updateMedication(medicationId, 'medicineId', medicine.id)
    setShowSuggestions(prev => ({ ...prev, [medicationId]: false }))
    setSearchTerms(prev => ({ ...prev, [medicationId]: medicine.name }))
  }

  
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      medicineId: null,
      name: "",
      quantity: 0,
      dosageMorning: 0,
      dosageNoon: 0,
      dosageAfternoon: 0,
      dosageEvening: 0,
      instruction: "",
      days: 1
    }
    setMedications([...medications, newMedication])
  }

  
  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id))
      setSearchTerms(prev => {
        const newTerms = { ...prev }
        delete newTerms[id]
        return newTerms
      })
    }
  }

  
  const updateMedication = (id: string, field: keyof Medication, value: string | number | null) => {
    setMedications(medications.map(med => {
      if (med.id === id) {
        const updatedMed = { ...med, [field]: value }
        
        
        if (field === 'dosageMorning' || field === 'dosageNoon' || field === 'dosageAfternoon' || field === 'dosageEvening') {
          const morning = field === 'dosageMorning' ? (value as number) : med.dosageMorning
          const noon = field === 'dosageNoon' ? (value as number) : med.dosageNoon
          const afternoon = field === 'dosageAfternoon' ? (value as number) : med.dosageAfternoon
          const evening = field === 'dosageEvening' ? (value as number) : med.dosageEvening
          updatedMed.quantity = morning + noon + afternoon + evening
        }
        
        return updatedMed
      }
      return med
    }))
    
    
    if (field === 'name') {
      setSearchTerms(prev => ({ ...prev, [id]: value as string }))
    }
  }

  
  const handleMedicineSearch = (medicationId: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [medicationId]: value }))
    setShowSuggestions(prev => ({ ...prev, [medicationId]: value.length > 0 }))
    updateMedication(medicationId, 'name', value)
    updateMedication(medicationId, 'medicineId', null)
  }

  
  const handleSavePrescription = async () => {
    if (!prescription) return
    
    try {
      setSaving(true)
      setError(null)
      
      
      const validMedications = medications.filter(med => med.medicineId && med.quantity > 0)
      
      if (validMedications.length === 0) {
        toast.error('Vui lòng thêm ít nhất một loại thuốc vào đơn')
        setError('Vui lòng thêm ít nhất một loại thuốc vào đơn')
        return
      }
      
      
      for (let i = 0; i < validMedications.length; i++) {
        const med = validMedications[i]
        const totalDosage = (med.dosageMorning || 0) + 
                           (med.dosageNoon || 0) + 
                           (med.dosageAfternoon || 0) + 
                           (med.dosageEvening || 0)
        
        if (totalDosage <= 0) {
          toast.error(`Thuốc "${med.name || 'thứ ' + (i + 1)}" phải có ít nhất một liều dùng lớn hơn 0`)
          setError(`Thuốc "${med.name || 'thứ ' + (i + 1)}" phải có ít nhất một liều dùng lớn hơn 0`)
          return
        }
        
        if (!med.medicineId) {
          toast.error(`Vui lòng chọn thuốc cho dòng thứ ${i + 1}`)
          setError(`Vui lòng chọn thuốc cho dòng thứ ${i + 1}`)
          return
        }
      }
      
      
      const prescriptionData = {
        medicines: validMedications.map(med => ({
          medicineId: med.medicineId as number,
          quantity: med.quantity,
          dosageMorning: med.dosageMorning || 0,
          dosageNoon: med.dosageNoon || 0,
          dosageAfternoon: med.dosageAfternoon || 0,
          dosageEvening: med.dosageEvening || 0,
          instruction: med.instruction || "Uống theo chỉ dẫn của bác sĩ"
        })),
        note: additionalNotes
      }
      
      console.log('Updating prescription:', prescriptionData)
      
      
      try {
        const response = await PrescriptionService.updatePrescription(prescription.id, prescriptionData)
        
        if (response.success) {
          console.log('Prescription updated successfully:', response.data)
          toast.success('Cập nhật đơn thuốc thành công!')
          navigate(`/doctor/prescriptions/${prescription.id}`)
          return
        }
      } catch (apiError: any) {
        const errorMessage = apiError.response?.data?.message || 'Không thể cập nhật đơn thuốc'
        console.error('API error:', errorMessage)
        toast.error(errorMessage)
        setError(errorMessage)
        return
      }
      
    } catch (err: any) {
      console.error('Error updating prescription:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update prescription'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 animate-pulse mx-auto mb-6 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-30 animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium">Đang tải dữ liệu đơn thuốc...</p>
            <p className="text-slate-400 text-sm mt-1">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (error && !prescription) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-200">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">Lỗi tải dữ liệu</p>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button 
              onClick={() => navigate("/doctor/prescriptions")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
            >
              Quay lại danh sách đơn thuốc
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (!prescription) {
    return null
  }

  
  if (prescription.status !== 'DRAFT') {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-amber-200">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-2">Không thể chỉnh sửa</p>
            <p className="text-slate-500 mb-6">Đơn thuốc này đã được khóa và không thể chỉnh sửa.</p>
            <Button 
              onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
            >
              Xem chi tiết đơn thuốc
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        
        {}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 shadow-xl">
          {}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Chỉnh sửa đơn thuốc</span>
                </div>
                <h1 className="text-2xl font-bold text-white">#{prescription.prescriptionCode}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                className="h-10 px-5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSavePrescription}
                disabled={saving}
                className="h-10 px-6 text-sm font-bold bg-white text-indigo-600 hover:bg-white/90 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {}
          <div className="lg:col-span-3 space-y-6">
            
            {}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Danh mục thuốc kê đơn</h3>
                    <p className="text-xs text-slate-500">{medications.length} loại thuốc</p>
                  </div>
                </div>
                <Button
                  onClick={addMedication}
                  size="sm"
                  className="h-9 px-4 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-emerald-200 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Thêm thuốc
                </Button>
              </div>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="p-3 text-center w-12 font-bold text-slate-600 text-xs uppercase tracking-wider">#</th>
                        <th className="p-3 text-left font-bold text-slate-600 text-xs uppercase tracking-wider">Tên thuốc</th>
                        <th className="p-3 text-center w-20 font-bold text-blue-600 text-xs uppercase tracking-wider">Số lượng</th>
                        <th className="p-3 text-center w-16 font-bold text-slate-600 text-xs uppercase tracking-wider">Ngày</th>
                        <th className="p-3 text-center w-16 font-bold text-amber-600 text-xs uppercase tracking-wider">Sáng</th>
                        <th className="p-3 text-center w-16 font-bold text-orange-600 text-xs uppercase tracking-wider">Trưa</th>
                        <th className="p-3 text-center w-16 font-bold text-blue-600 text-xs uppercase tracking-wider">Chiều</th>
                        <th className="p-3 text-center w-16 font-bold text-violet-600 text-xs uppercase tracking-wider">Tối</th>
                        <th className="p-3 text-left font-bold text-slate-600 text-xs uppercase tracking-wider">Hướng dẫn</th>
                        <th className="p-3 text-center w-14"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {medications.map((medication, index) => (
                        <tr 
                          key={medication.id} 
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                        >
                          <td className="p-3 text-center">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-blue-600 transition-colors mx-auto">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="relative">
                              <Input
                                placeholder="Tìm kiếm thuốc..."
                                value={searchTerms[medication.id] || medication.name}
                                onChange={(e) => handleMedicineSearch(medication.id, e.target.value)}
                                onFocus={() => setShowSuggestions(prev => ({ ...prev, [medication.id]: (searchTerms[medication.id] || medication.name).length > 0 }))}
                                className="h-10 text-sm border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl font-medium bg-slate-50/50 hover:bg-white transition-colors"
                              />
                              {showSuggestions[medication.id] && (
                                <div className="absolute z-30 w-96 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                                  {getFilteredMedicines(searchTerms[medication.id] || medication.name).map((medicine) => (
                                    <div
                                      key={medicine.id}
                                      className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent cursor-pointer border-b border-slate-50 last:border-b-0 transition-colors"
                                      onClick={() => selectMedicine(medication.id, medicine)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                          <Pill className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-bold text-slate-800 text-sm">{medicine.name}</div>
                                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                            <span>Kho: {medicine.currentStock} {medicine.unit}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span>{medicine.category}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {getFilteredMedicines(searchTerms[medication.id] || medication.name).length === 0 && (
                                    <div className="p-4 text-center text-slate-400 text-sm">
                                      Không tìm thấy thuốc phù hợp
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-xl shadow-md shadow-blue-200 min-w-[4rem] text-sm">
                              {medication.quantity || 0}
                            </div>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              value={medication.days || ""}
                              onChange={(e) => {
                                const days = parseInt(e.target.value) || 0
                                if (days >= 0) {
                                  const dailyDosage = (medication.dosageMorning || 0) + (medication.dosageNoon || 0) + (medication.dosageAfternoon || 0) + (medication.dosageEvening || 0)
                                  updateMedication(medication.id, 'days', days)
                                  updateMedication(medication.id, 'quantity', dailyDosage * days)
                                }
                              }}
                              className="h-10 p-2 text-center border-slate-200 bg-slate-50/50 rounded-xl font-bold text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          {[
                            { field: 'dosageMorning', color: 'amber' },
                            { field: 'dosageNoon', color: 'orange' },
                            { field: 'dosageAfternoon', color: 'blue' },
                            { field: 'dosageEvening', color: 'violet' }
                          ].map(({ field, color }) => (
                            <td key={field} className="p-2">
                              <Input
                                type="number"
                                min="0"
                                value={medication[field as keyof Medication] || ""}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0
                                  if (value >= 0) {
                                    updateMedication(medication.id, field as keyof Medication, value)
                                    
                                    
                                    const m = { ...medication, [field]: value }
                                    const dailyDosage = (m.dosageMorning || 0) + (m.dosageNoon || 0) + (m.dosageAfternoon || 0) + (m.dosageEvening || 0)
                                    updateMedication(medication.id, 'quantity', dailyDosage * (m.days || 1))
                                  }
                                }}
                                className={`h-10 p-2 text-center border-${color}-200 bg-${color}-50/30 rounded-xl font-bold text-${color}-700 focus:border-${color}-500 focus:ring-2 focus:ring-${color}-100`}
                              />
                            </td>
                          ))}
                          <td className="p-2">
                            <Input
                              placeholder="VD: Uống sau ăn..."
                              value={medication.instruction}
                              onChange={(e) => updateMedication(medication.id, 'instruction', e.target.value)}
                              className="h-10 text-sm border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <Button
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeMedication(medication.id)}
                              disabled={medications.length === 1}
                              className="h-9 w-9 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-white">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/80 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Lời dặn của bác sĩ</h3>
                  <p className="text-xs text-slate-500">Hướng dẫn chi tiết cho bệnh nhân</p>
                </div>
              </div>
              <CardContent className="p-4">
                <Textarea
                  placeholder="Nhập hướng dẫn sử dụng thuốc chi tiết, lời khuyên về chế độ sinh hoạt, ăn uống..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                  className="resize-none border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm leading-relaxed bg-slate-50/50 hover:bg-white transition-colors"
                />
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-6">
            {}
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
              <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-5 text-white">
                {}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>
                
                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black shadow-lg">
                    {prescription.patient.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold leading-tight">{prescription.patient.fullName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3.5 h-3.5 text-white/60" />
                      <span className="text-xs font-medium text-white/70">Mã BN: #{prescription.patientId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tuổi</span>
                    </div>
                    <p className="text-lg font-black text-slate-800">{calculateAge(prescription.patient.dateOfBirth)}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giới tính</span>
                    </div>
                    <p className="text-lg font-black text-slate-800">{prescription.patient.gender === "MALE" ? "Nam" : "Nữ"}</p>
                  </div>
                </div>

                {}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Stethoscope className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chẩn đoán</span>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50/50 rounded-xl border border-rose-100">
                    <p className="text-sm font-semibold text-rose-900 leading-relaxed italic">
                      "{prescription.visit?.diagnosis || "Chưa cập nhật kết quả chẩn đoán"}"
                    </p>
                  </div>
                </div>

                {}
                {prescription.visit?.vitalSigns && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sinh hiệu</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100 text-center">
                        <Heart className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="text-[9px] font-bold text-blue-400 uppercase">Huyết áp</p>
                        <p className="text-sm font-black text-blue-700">{prescription.visit.vitalSigns.bloodPressure || "--"}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl border border-emerald-100 text-center">
                        <Activity className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <p className="text-[9px] font-bold text-emerald-400 uppercase">Nhịp tim</p>
                        <p className="text-sm font-black text-emerald-700">{prescription.visit.vitalSigns.heartRate || "--"}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl border border-orange-100 text-center">
                        <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                        <p className="text-[9px] font-bold text-orange-400 uppercase">Nhiệt độ</p>
                        <p className="text-sm font-black text-orange-700">{prescription.visit.vitalSigns.temperature || "--"}°C</p>
                      </div>
                      <div className="p-3 bg-gradient-to-br from-violet-50 to-purple-50/50 rounded-xl border border-violet-100 text-center">
                        <Scale className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                        <p className="text-[9px] font-bold text-violet-400 uppercase">Cân nặng</p>
                        <p className="text-sm font-black text-violet-700">{prescription.visit.vitalSigns.weight || "--"} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {}
            <div className="space-y-3">
              <Button
                onClick={handleSavePrescription}
                disabled={saving}
                className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    LƯU ĐƠN THUỐC
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
                className="w-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-semibold h-10 text-sm rounded-xl transition-colors"
              >
                Hủy thay đổi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DoctorSidebar>
  )
}
