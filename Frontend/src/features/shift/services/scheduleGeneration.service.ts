import api from "../../../lib/api"

export interface GenerationPreview {
  success: boolean
  period: {
    year: number
    month: number
    startDate: string
    endDate: string
  }
  totalTemplates: number
  totalShifts: number
  newShifts: number
  existingShifts: number
  shifts: Array<{
    date: string
    doctorId: number
    shiftId: number
    exists: boolean
  }>
}

export interface GenerationResult {
  success: boolean
  message: string
  generated: number
  skipped: number
  period: {
    year: number
    month: number
    startDate: string
    endDate: string
  }
}

export const ScheduleGenerationService = {
  
  previewNextMonth: async (): Promise<GenerationPreview> => {
    const response = await api.get("/schedule-generation/preview")
    return response.data
  },

  
  generateNextMonth: async (): Promise<GenerationResult> => {
    const response = await api.post("/schedule-generation/generate-monthly")
    return response.data
  },

  
  generateForMonth: async (year: number, month: number): Promise<GenerationResult> => {
    const response = await api.post("/schedule-generation/generate-for-month", {
      year,
      month
    })
    return response.data
  }
}
