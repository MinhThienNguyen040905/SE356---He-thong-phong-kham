

export interface PrescriptionDetail {
  id: number
  prescriptionId: number
  medicineId: number
  medicineName: string
  quantity: number
  unit: string
  unitPrice: number
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  instruction: string
  days?: number
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: number
  fullName: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  phoneNumber?: string
  email?: string
  address?: string
  cccd?: string
}

export interface Doctor {
  id: number
  fullName: string
  specialty: string
  degree?: string
  position?: string
  phoneNumber?: string
  email?: string
}

export interface Visit {
  id: number
  checkInTime: string
  diagnosis?: string
  symptoms?: string
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    weight?: string
  }
}

export interface Prescription {
  id: number
  prescriptionCode: string
  visitId: number
  doctorId: number
  patientId: number
  totalAmount: number
  status: "DRAFT" | "LOCKED" | "CANCELLED"
  note?: string
  createdAt: string
  updatedAt: string
  
  patient: Patient
  doctor: Doctor
  visit?: Visit
  details: PrescriptionDetail[]
}

export type PrescriptionStatus = "DRAFT" | "LOCKED" | "CANCELLED"