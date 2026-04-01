import api from '../../../lib/api'

export const MedicineUnit = {
  VIEN: "VIEN",
  ML: "ML",
  HOP: "HOP",
  CHAI: "CHAI",
  TUYP: "TUYP",
  GOI: "GOI",
} as const

export type MedicineUnit = typeof MedicineUnit[keyof typeof MedicineUnit]

export const MedicineStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  REMOVED: "REMOVED",
} as const

export type MedicineStatus = typeof MedicineStatus[keyof typeof MedicineStatus]

export interface Medicine {
  id: number
  medicineCode: string
  name: string
  group: string
  activeIngredient?: string
  manufacturer?: string
  registrationNumber?: string 
  unit: MedicineUnit
  importPrice: number
  salePrice: number
  quantity: number
  minStockLevel: number
  expiryDate: string
  description?: string
  status: MedicineStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateMedicineData {
  name: string
  group: string
  activeIngredient?: string
  manufacturer?: string
  unit: MedicineUnit
  importPrice: number
  salePrice: number
  quantity: number
  minStockLevel?: number
  expiryDate: string
  description?: string
}

export interface UpdateMedicineData {
  name?: string
  group?: string
  activeIngredient?: string
  manufacturer?: string
  unit?: MedicineUnit
  importPrice?: number
  salePrice?: number
  quantity?: number
  minStockLevel?: number
  expiryDate?: string
  description?: string
}

export interface MedicineListResponse {
  medicines: Medicine[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MedicineImport {
  id: number
  medicineId: number
  medicine?: Medicine
  quantity: number
  importPrice: number
  supplier?: string
  supplierInvoice?: string
  batchNumber?: string
  note?: string
  importedBy: number
  importer?: {
    id: number
    fullName: string
    email: string
  }
  expiryDate?: string 
  manufactureDate?: string 
  createdAt: string
  updatedAt?: string
}

export interface MedicineExport {
  id: number
  medicineId: number
  medicine?: Medicine
  quantity: number
  exportedBy: number
  exporter?: {
    id: number
    fullName: string
    email: string
  }
  prescriptionId?: number 
  createdAt: string
  updatedAt?: string
}

export interface ImportExportListResponse {
  data: MedicineImport[] | MedicineExport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class MedicineService {
  
  static async createMedicine(data: CreateMedicineData): Promise<Medicine> {
    const response = await api.post('/medicines', data)
    return response.data.data
  }

  
  static async getMedicines(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines', { params })
    const data = response.data.data || response.data
    
    
    if (Array.isArray(data)) {
      return {
        medicines: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      }
    }

    const medicines = 
      (Array.isArray(data?.medicines) ? data.medicines : null) ||
      (Array.isArray(data?.content) ? data.content : null) ||
      (Array.isArray(data?.items) ? data.items : null) ||
      (Array.isArray(data?.results) ? data.results : null) ||
      (Array.isArray(data?.data) ? data.data : null) ||
      [];

    return {
      medicines,
      total: data?.total || data?.totalElements || medicines.length,
      page: data?.page || (data?.number ? data.number + 1 : 1),
      limit: data?.limit || data?.size || 10,
      totalPages: data?.totalPages || 1
    }
  }

  
  static async getMedicineById(id: number): Promise<Medicine> {
    const response = await api.get(`/medicines/${id}`)
    return response.data.data
  }

  
  static async updateMedicine(id: number, data: UpdateMedicineData): Promise<Medicine> {
    const response = await api.put(`/medicines/${id}`, data)
    return response.data.data
  }

  
  static async deleteMedicine(id: number): Promise<void> {
    await api.delete(`/medicines/${id}`)
  }

  
  static async importMedicine(
    id: number,
    data: {
      quantity: number
      importPrice: number
      supplier?: string
      supplierInvoice?: string
      batchNumber?: string
      note?: string
    }
  ): Promise<MedicineImport> {
    const response = await api.post(`/medicines/${id}/import`, data)
    return response.data.data
  }

  
  static async exportMedicine(
    id: number,
    data: {
      quantity: number
    }
  ): Promise<MedicineExport> {
    const response = await api.post(`/medicines/${id}/export`, data)
    return response.data.data
  }

  
  static async getLowStockMedicines(params?: {
    page?: number
    limit?: number
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines/low-stock', { params })
    const data = response.data.data || response.data
    
    
    if (Array.isArray(data)) {
      return {
        medicines: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      }
    }
    
    const medicines = 
      (Array.isArray(data?.medicines) ? data.medicines : null) ||
      (Array.isArray(data?.content) ? data.content : null) ||
      (Array.isArray(data?.items) ? data.items : null) ||
      (Array.isArray(data?.results) ? data.results : null) ||
      (Array.isArray(data?.data) ? data.data : null) ||
      [];

    return {
      medicines,
      total: data?.total || data?.totalElements || medicines.length,
      page: data?.page || (data?.number ? data.number + 1 : 1),
      limit: data?.limit || data?.size || 10,
      totalPages: data?.totalPages || 1
    }
  }

  
  static async getExpiringMedicines(params?: {
    page?: number
    limit?: number
  }): Promise<MedicineListResponse> {
    const response = await api.get('/medicines/expiring', { params })
    const data = response.data.data || response.data
    
    
    if (Array.isArray(data)) {
      return {
        medicines: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      }
    }

    const medicines = 
      (Array.isArray(data?.medicines) ? data.medicines : null) ||
      (Array.isArray(data?.content) ? data.content : null) ||
      (Array.isArray(data?.items) ? data.items : null) ||
      (Array.isArray(data?.results) ? data.results : null) ||
      (Array.isArray(data?.data) ? data.data : null) ||
      [];

    return {
      medicines,
      total: data?.total || data?.totalElements || medicines.length,
      page: data?.page || (data?.number ? data.number + 1 : 1),
      limit: data?.limit || data?.size || 10,
      totalPages: data?.totalPages || 1
    }
  }

  
  static async getMedicineImportHistory(id: number): Promise<MedicineImport[]> {
    const response = await api.get(`/medicines/${id}/imports`)
    return response.data.data || []
  }

  
  static async getMedicineExportHistory(id: number): Promise<MedicineExport[]> {
    const response = await api.get(`/medicines/${id}/exports`)
    return response.data.data || []
  }

  
  static async getAllMedicineImports(params?: {
    page?: number
    limit?: number
  }): Promise<ImportExportListResponse> {
    const response = await api.get('/medicine-imports', { params })
    const data = response.data.data || response.data
    
    
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      }
    }
    
    const items = 
      (Array.isArray(data?.data) ? data.data : null) ||
      (Array.isArray(data?.content) ? data.content : null) ||
      (Array.isArray(data?.items) ? data.items : null) ||
      (Array.isArray(data?.results) ? data.results : null) ||
      [];

    return {
      data: items,
      total: data?.total || data?.totalElements || items.length,
      page: data?.page || (data?.number ? data.number + 1 : 1),
      limit: data?.limit || data?.size || 10,
      totalPages: data?.totalPages || 1
    }
  }

  
  static async getMedicineImportById(id: number): Promise<MedicineImport> {
    const response = await api.get(`/medicine-imports/${id}`)
    return response.data.data
  }

  
  static async getAllMedicineExports(params?: {
    page?: number
    limit?: number
  }): Promise<ImportExportListResponse> {
    const response = await api.get('/medicine-exports', { params })
    const data = response.data.data || response.data

    
    if (Array.isArray(data)) {
      return {
        data: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1
      }
    }
    
    const items = 
      (Array.isArray(data?.data) ? data.data : null) ||
      (Array.isArray(data?.content) ? data.content : null) ||
      (Array.isArray(data?.items) ? data.items : null) ||
      (Array.isArray(data?.results) ? data.results : null) ||
      [];

    return {
      data: items,
      total: data?.total || data?.totalElements || items.length,
      page: data?.page || (data?.number ? data.number + 1 : 1),
      limit: data?.limit || data?.size || 10,
      totalPages: data?.totalPages || 1
    }
  }

  
  static async getMedicineExportById(id: number): Promise<MedicineExport> {
    const response = await api.get(`/medicine-exports/${id}`)
    return response.data.data
  }

  
  static async markMedicineAsExpired(id: number): Promise<Medicine> {
    const response = await api.post(`/medicines/${id}/mark-expired`)
    return response.data.data
  }

  
  static async autoMarkExpired(): Promise<{ count: number; medicines: Medicine[] }> {
    try {
      const response = await api.post('/medicines/auto-mark-expired')
      if (response.data.success) {
        return response.data.data || { count: 0, medicines: [] }
      }
      throw new Error(response.data.message || 'Failed to auto-mark expired medicines')
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.')
      }
      throw error
    }
  }
}
