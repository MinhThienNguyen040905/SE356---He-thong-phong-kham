import { BadgeCheck, Users, Clock, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { PublicService, type LandingStats } from "../services/public.service"

export function Stats() {
  const [stats, setStats] = useState<LandingStats>({
    patientCount: 0,
    doctorCount: 0,
    visitCount: 0,
    experienceYears: 15,
    satisfactionRate: 98
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await PublicService.getLandingStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats", error)
      }
    }
    fetchStats()
  }, [])

  return (
    <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
      {}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {}
          <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Clock className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-4xl md:text-5xl font-bold mb-2 font-serif tracking-tight">
               {stats.experienceYears}+
            </div>
            <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">Năm kinh nghiệm</p>
          </div>

          {}
          <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Users className="w-8 h-8 text-blue-200" />
            </div>
            <div className="text-4xl md:text-5xl font-bold mb-2 font-serif tracking-tight">
               {(stats.patientCount + 1000).toLocaleString()}+
            </div>
            <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">Lượt bệnh nhân</p>
          </div>

          {}
          <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
               <Award className="w-8 h-8 text-blue-200" />
             </div>
             <div className="text-4xl md:text-5xl font-bold mb-2 font-serif tracking-tight">
                {stats.satisfactionRate}%
             </div>
             <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">Tỷ lệ hài lòng</p>
          </div>

          {}
          <div className="text-center group hover:-translate-y-2 transition-transform duration-300">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
               <BadgeCheck className="w-8 h-8 text-blue-200" />
             </div>
             <div className="text-4xl md:text-5xl font-bold mb-2 font-serif tracking-tight">
                24/7
             </div>
             <p className="text-blue-100 font-medium uppercase tracking-wider text-sm">Hỗ trợ y tế</p>
          </div>
        </div>
      </div>
    </section>
  )
}
