"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader2, User, Stethoscope, Pill, X } from "lucide-react"
import { Input } from "../ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Card } from "../ui/card"
import api from "../../lib/api"

interface SearchResult {
  id: number
  name: string
  code?: string
  type: "patient" | "doctor" | "medicine"
  link: string
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const performSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      
      const [patientsRes, doctorsRes, medicinesRes] = await Promise.allSettled([
        api.post("/search/patients", { query }),
        api.post("/search/doctors", { query }),
        api.post("/search/medicines", { query }),
      ])

      const allResults: SearchResult[] = []

      
      if (patientsRes.status === "fulfilled" && patientsRes.value.data.success) {
        const patients = patientsRes.value.data.data || []
        patients.forEach((patient: any) => {
          allResults.push({
            id: patient.id,
            name: patient.fullName || patient.name,
            code: patient.patientCode,
            type: "patient",
            link: `/recep/patients/${patient.id}`,
          })
        })
      }

      
      if (doctorsRes.status === "fulfilled" && doctorsRes.value.data.success) {
        const doctors = doctorsRes.value.data.data || []
        doctors.forEach((doctor: any) => {
          allResults.push({
            id: doctor.id,
            name: doctor.user?.fullName || doctor.name,
            code: doctor.doctorCode,
            type: "doctor",
            link: `/admin/doctors/${doctor.id}`,
          })
        })
      }

      
      if (medicinesRes.status === "fulfilled" && medicinesRes.value.data.success) {
        const medicines = medicinesRes.value.data.data || []
        medicines.forEach((medicine: any) => {
          allResults.push({
            id: medicine.id,
            name: medicine.name,
            code: medicine.medicineCode,
            type: "medicine",
            link: `/pharmacy/${medicine.id}`,
          })
        })
      }

      setResults(allResults.slice(0, 10)) 
      setIsOpen(allResults.length > 0)
    } catch (error: any) {
      if (error.response?.status !== 429) {
        console.error("Search error:", error)
      }
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(result.link)
    setSearchQuery("")
    setResults([])
    setIsOpen(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "patient":
        return <User className="h-4 w-4 text-blue-600" />
      case "doctor":
        return <Stethoscope className="h-4 w-4 text-green-600" />
      case "medicine":
        return <Pill className="h-4 w-4 text-purple-600" />
      default:
        return <Search className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "patient":
        return "Bệnh nhân"
      case "doctor":
        return "Bác sĩ"
      case "medicine":
        return "Thuốc"
      default:
        return type
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm bệnh nhân, bác sĩ, thuốc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) {
                setIsOpen(true)
              }
            }}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSearchQuery("")
                setResults([])
                setIsOpen(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        {results.length > 0 ? (
          <Card className="border-0 shadow-lg">
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.name}
                      </div>
                      {result.code && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Mã: {result.code}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {getTypeLabel(result.type)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        ) : searchQuery.trim().length >= 2 && !isSearching ? (
          <Card className="border-0 shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              Không tìm thấy kết quả
            </p>
          </Card>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
