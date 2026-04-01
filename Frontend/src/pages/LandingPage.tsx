import { Header } from "../components/layout/header"
import { Hero } from "../features/landing/components/Hero"
import { Features } from "../features/landing/components/Features"
import { Services } from "../features/landing/components/Services"
import { Stats } from "../features/landing/components/Stats"
import ContactForm  from "../features/landing/components/ContactForm"
import { Footer } from "../components/layout/footer"

export default function Home() {
  return (
    <main className="min-h-screen font-sans bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <Hero />
      <Stats />
      <Services />
      
      {}
      <section id="process" className="py-20 bg-blue-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
             <span className="text-blue-300 font-bold text-xs tracking-widest uppercase mb-3 block">QUY TRÌNH LÀM VIỆC</span>
             <h2 className="text-3xl font-bold lg:text-4xl">4 Bước đơn giản để nhận chăm sóc</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
             {[
                { step: "1", title: "Đặt lịch khám", desc: "Chọn bác sĩ và thời gian phù hợp ngay trên ứng dụng hoặc website" },
                { step: "2", title: "Xác nhận", desc: "Hệ thống sẽ gửi thông báo xác nhận qua SMS hoặc Email trong 5 phút" },
                { step: "3", title: "Thăm khám", desc: "Tới phòng khám theo lịch hẹn để được các bác sĩ chuyên khoa khám trực tiếp" },
                { step: "4", title: "Nhận kết quả", desc: "Nhận đơn thuốc, chẩn đoán và kết quả xét nghiệm qua hồ sơ cá nhân" }
             ].map((item, i) => (
                <div key={i} className="text-center relative">
                   {i < 3 && <div className="hidden md:block absolute top-8 left-1/2 w-full border-t border-dashed border-blue-700 -z-10"></div>}
                   <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-blue-900/50 border-4 border-blue-800 relative z-10 transition-transform hover:scale-110">
                      {item.step}
                   </div>
                   <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                   <p className="text-blue-200 text-sm px-4 leading-relaxed">{item.desc}</p>
                </div>
             ))}
          </div>
        </div>
      </section>

      <Features />
      <ContactForm/>
      <Footer />
    </main>
  )
}
