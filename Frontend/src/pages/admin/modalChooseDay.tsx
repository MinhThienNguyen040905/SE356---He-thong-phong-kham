"use client"

import React, { useState } from "react"
import { Button } from "../../components/ui/button"
import api from "../../lib/api"
import { toast } from "sonner"

interface Doctor {
  id: number
  doctorCode: string
    user: {
    id: number
    fullName: string
    email: string
    avatar?: string
  }
  specialty: {
    id: number
    name: string
  }
}

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface ScheduleEventModalProps {
  open: boolean
  doctor: Doctor | null
  selectedDate: string
  shifts: Shift[]
  onDateChange: (date: string) => void
  onClose: () => void
  onSuccess: (scheduleData: {
    doctorId: number
    shiftId: number
    workDate: string
  }) => void
  getAvatarColor: (name: string) => string
}

export default function ScheduleEventModal({
  open,
  doctor,
  selectedDate,
  shifts,
  onDateChange,
  onClose,
  onSuccess,
  getAvatarColor
}: ScheduleEventModalProps) {
  const [eventType, setEventType] = useState<'consultation' | 'on-leave'>('consultation')
  const [selectedShiftId, setSelectedShiftId] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  
  React.useEffect(() => {
    if (shifts && shifts.length > 0 && selectedShiftId === 0) {
      setSelectedShiftId(shifts[0].id)
    }
  }, [shifts, selectedShiftId])

  if (!open || !doctor) return null

  const handleSubmit = async () => {
    if (!selectedDate || !selectedShiftId) {
      toast.error('Vui lòng chọn ngày và ca trực')
      return
    }

    setLoading(true)
    
    try {
      const payload = {
        doctorId: doctor.id,
        shiftId: selectedShiftId,
        workDate: selectedDate
      }
      
      const response = await api.post('/doctor-shifts', payload)
      
      if (response.data.success) {
        toast.success('Đã phân công bác sĩ thành công')
        
        
        onSuccess({
          doctorId: doctor.id,
          shiftId: selectedShiftId,
          workDate: selectedDate
        })
        
        onClose() 
      } else {
        throw new Error(response.data.message || 'Phân công thất bại')
      }
    } catch (err: any) {
      console.error('API Error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Phân công thất bại'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const formatShiftTime = (shift: Shift) => {
    return `${shift.startTime} - ${shift.endTime}`
  }

  const getAvatarInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 w-96 max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        {}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Schedule Event</h3>
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0" onClick={onClose} disabled={loading}></Button>
        </div>

        {}
        <div className="mb-6">
          <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <div
              className={`w-12 h-12 rounded-full ${getAvatarColor(
                doctor.user.fullName
              )} flex items-center justify-center text-white font-bold text-base overflow-hidden shrink-0 shadow-sm`}
            >
              {doctor.user.avatar ? (
                <img 
                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${doctor.user.avatar}`} 
                  alt={doctor.user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getAvatarInitials(doctor.user.fullName)
              )}
            </div>
            <div>
              <div className="font-medium">{doctor.user.fullName}</div>
              <div className="text-sm text-gray-500">{doctor.specialty.name}</div>
              <div className="text-xs text-gray-400">{doctor.doctorCode}</div>
            </div>
          </div>
        </div>

        {}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded-md"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            disabled={loading}
          />
        </div>

        {}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Event Type</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as 'consultation' | 'on-leave')}
            disabled={loading}
          >
            <option value="consultation">Ca trực</option>
            {}
          </select>
        </div>

        {}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Time Slot</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(Number(e.target.value))}
            disabled={loading}
          >
            {shifts.map(shift => (
              <option key={shift.id} value={shift.id}>
                {shift.name} ({formatShiftTime(shift)})
              </option>
            ))}
          </select>
        </div>

        {}
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-blue-600 text-white" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Schedule Event'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
        
      </div>
    </div>
  )
}
