import { Card, CardContent } from "../../../components/ui/card"
import { HeartPulse, Baby, Stethoscope, Microscope, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { SpecialtyService, type Specialty } from "../../appointment/services/specialty.service"
import { toast } from "sonner"

export function Services() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await SpecialtyService.getSpecialties({ active: true })
        setSpecialties(response.specialties)
      } catch (error) {
        console.error("Failed to fetch specialties:", error)
        toast.error("Không thể tải danh sách chuyên khoa")
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  const getSpecialtyIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('tim')) return HeartPulse
    if (lowerName.includes('nhi')) return Baby
    if (lowerName.includes('tiêu hóa') || lowerName.includes('nội soi')) return Microscope
    if (lowerName.includes('phụ sản') || lowerName.includes('sản')) return Stethoscope
    return Activity
  }

  const getSpecialtyColor = () => {
     
     return "text-blue-600"
  }

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <span className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-3 block">CHUYÊN MÔN CỦA CHÚNG TÔI</span>
          <h2 className="text-3xl font-serif font-bold lg:text-4xl text-gray-900 mb-4 family-serif">Dịch vụ chuyên khoa</h2>
        </div>

        {loading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-64 animate-pulse bg-gray-50 border-0 rounded-2xl">
                   <CardContent className="p-8"></CardContent>
                </Card>
              ))}
           </div>
        ) : (
          <div className="relative">
            {}
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide hover:scrollbar-default scroll-smooth">
              {specialties.length === 0 ? (
                <div className="w-full text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
                  <p>Đang cập nhật danh sách chuyên khoa...</p>
                </div>
              ) : (
                specialties.map((service) => {
                  const Icon = getSpecialtyIcon(service.name)
                  const colorClass = getSpecialtyColor()
                  
                  return (
                    <Card 
                      key={service.id} 
                      className="group overflow-hidden border-0 shadow-sm bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 rounded-2xl flex-none w-80 snap-start"
                    >
                      <CardContent className="p-8">
                        <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-600 transition-colors duration-300`}>
                          <Icon className={`h-6 w-6 ${colorClass} group-hover:text-white transition-colors duration-300`} />
                        </div>
                        
                        <h3 className="mb-3 text-lg font-bold text-gray-900 line-clamp-1" title={service.name}>{service.name}</h3>
                        <p className="mb-6 text-gray-500 leading-relaxed text-sm h-20 line-clamp-3">
                          {service.description || `Chuyên khoa ${service.name} hàng đầu với đội ngũ bác sĩ giàu kinh nghiệm.`}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
            
            {}
            {specialties.length > 3 && (
              <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
