import { Facebook, Instagram, Linkedin, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-gray-50 pt-16 border-t border-gray-100">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2 opacity-0 animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-forwards">
          {}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
                 <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">HealthCare</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Hệ thống phòng khám đa khoa hiện đại, mang lại trải nghiệm y tế chuẩn quốc tế và chất lượng vượt trội cho người bệnh.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 text-base uppercase tracking-wide">Liên kết</h3>
            <ul className="space-y-3">
              {['Về chúng tôi', 'Chuyên khoa', 'Quy trình', 'Tin tức'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-bold text-gray-900 mb-6 text-base uppercase tracking-wide">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-500 w-full">
                  123 Đường Số 1, Quận Thủ Đức, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600 shrink-0" />
                <a href="tel:02835545555" className="text-sm text-gray-500 hover:text-blue-600">
                  (028) 3554 5555
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                <a href="mailto:contact@healthcare.vn" className="text-sm text-gray-500 hover:text-blue-600">
                  contact@healthcare.vn
                </a>
              </li>
            </ul>
          </div>

          {}
           <div>
            <h3 className="font-bold text-gray-900 mb-6 text-base uppercase tracking-wide">Vị trí</h3>
            <div className="bg-gray-200 rounded-xl h-32 w-full flex items-center justify-center">
               <MapPin className="text-gray-400 h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-xs text-gray-500 text-center md:text-left">
                &copy; {new Date().getFullYear()} HealthCare Plus. All rights reserved.
             </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
