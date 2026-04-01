import { Button } from "../../../components/ui/button"
import { Calendar, PhoneCall } from "lucide-react"
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 lg:p-16 shadow-2xl shadow-blue-300">
           {}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-balance text-3xl font-extrabold text-white lg:text-5xl tracking-tight">
              Sẵn sàng chăm sóc sức khỏe?
            </h2>
            <p className="mb-10 text-pretty text-lg text-blue-100 lg:text-xl max-w-2xl mx-auto leading-relaxed">
              Đặt lịch hẹn ngay hôm nay để trải nghiệm dịch vụ y tế chất lượng cao, tận tâm và chuyên nghiệp từ đội ngũ của chúng tôi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-center">
              <Button size="lg" variant="secondary" className="h-14 px-8 rounded-full bg-white text-blue-600 hover:bg-gray-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" asChild>
                <Link to="/patient/book-appointment">
                  <Calendar className="h-5 w-5 mr-2" />
                  Đặt lịch khám
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-lg backdrop-blur-sm transition-all"
              >
                <PhoneCall className="h-5 w-5 mr-2" />
                Liên hệ ngay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
