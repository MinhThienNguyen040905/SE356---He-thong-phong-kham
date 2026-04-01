import { Card, CardContent } from "../../../components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { useEffect, useState } from "react"
import { DoctorService, type PublicDoctor } from "../../doctor/services/doctor.service"

export function Features() {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await DoctorService.getPublicDoctors()
        
        setDoctors(data.slice(0, 3))
      } catch (error) {
        console.error("Failed to fetch doctors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  return (
    <section id="doctors" className="py-20 lg:py-24 bg-blue-50/30">
      <div className="container mx-auto px-4">
        {}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-3 block">ĐỘI NGŨ CỦA CHÚNG TÔI</span>
            <h2 className="text-3xl font-serif font-bold lg:text-4xl text-gray-900 mb-4">Đội ngũ bác sĩ tiêu biểu</h2>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-gray-200 hover:bg-white hover:border-gray-300">
               <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-transparent bg-blue-600 text-white hover:bg-blue-700">
               <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {loading ? (
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                 <div key={i} className="h-96 rounded-2xl bg-gray-200 animate-pulse"></div>
              ))}
           </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor, index) => (
              <Card key={index} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={doctor.user?.avatar ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${doctor.user.avatar}` : "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"}
                    alt={doctor.user?.fullName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-1 text-lg font-bold text-gray-900">{doctor.user?.fullName}</h3>
                  <p className="text-blue-600 text-sm font-semibold mb-3">
                     {doctor.specialty?.name || "Bác sĩ Chuyên khoa"}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {doctor.position || "Chuyên gia y tế tận tâm"}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {doctors.length === 0 && (
               <div className="col-span-full text-center py-10 text-gray-500">
                  Chưa có thông tin bác sĩ.
               </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
