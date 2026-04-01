import { Button } from "../../../components/ui/button"
import { CheckCircle2, Calendar } from "lucide-react"
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-50/50 pt-16 pb-20 lg:pt-32 lg:pb-32">
       {}
       <div className="absolute top-[-10%] right-[-5%] -z-10 w-[60%] h-[80vh] bg-gradient-to-bl from-blue-100/50 via-cyan-50/30 to-transparent rounded-bl-[150px] blur-[80px] opacity-70"></div>
       <div className="absolute bottom-[-10%] left-[-10%] -z-10 w-[40%] h-[60vh] bg-gradient-to-tr from-emerald-50/60 to-transparent rounded-tr-[150px] blur-[80px] opacity-60"></div>
       
       {}
       <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12 items-center">
          
          {}
          <div className="lg:col-span-6 flex flex-col justify-center animate-in slide-in-from-left-5 duration-1000 fade-in z-10">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-xs font-extra-bold text-blue-600 mb-8 border border-blue-100 shadow-sm uppercase tracking-widest hover:border-blue-200 transition-colors cursor-default">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
               Hệ thống Y tế Hàng đầu
            </div>
            
            <h1 className="mb-6 text-5xl font-black tracking-tight text-slate-900 lg:text-7xl lg:leading-[1.1] font-display">
              Chăm sóc sức khỏe
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> toàn diện</span>
            </h1>
            
            <p className="mb-10 text-lg text-slate-500 lg:text-xl max-w-xl leading-relaxed font-medium">
              Kết hợp công nghệ tiên tiến với đội ngũ chuyên gia tận tâm. Chúng tôi cam kết mang lại trải nghiệm y tế chuẩn quốc tế cho gia đình bạn.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl shadow-blue-500/20 font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98]" asChild>
                <Link to="/patient/book-appointment">
                  Đặt lịch khám ngay
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-base transition-all" asChild>
                 <a href="#services">
                  Tìm hiểu dịch vụ
                 </a>
              </Button>
            </div>

            {}
            <div className="grid grid-cols-3 gap-8 py-8 border-t border-slate-200/60 max-w-lg">
                <div>
                   <h3 className="text-3xl font-black text-slate-900 mb-1">50+</h3>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Bác sĩ chuyên khoa</p>
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 mb-1">10k+</h3>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Bệnh nhân tin dùng</p>
                </div>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 mb-1">24/7</h3>
                   <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Hỗ trợ khẩn cấp</p>
                </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-6 relative h-[500px] lg:h-[700px] w-full animate-in slide-in-from-right-5 duration-1000 fade-in delay-200 hidden lg:block">
             <div className="relative w-full h-full">
                
                {}
                <div className="absolute top-10 right-0 w-[85%] h-[85%] rounded-[40px] overflow-hidden shadow-2xl shadow-blue-900/10 z-10 border-[6px] border-white">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=2574&auto=format&fit=crop"
                    alt="Modern Medical Facility"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  
                  {}
                   <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-lg z-20 flex flex-col gap-2 border border-slate-100">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i =>(
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                               <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                            </div>
                         ))}
                         <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold">+2k</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className="flex text-yellow-500"></div>
                         <span className="text-xs font-bold text-slate-800">4.9/5 Rating</span>
                      </div>
                   </div>
                </div>

                {}
                <div className="absolute bottom-20 left-0 w-[45%] aspect-[4/5] bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-3 z-20 animate-in fade-in slide-in-from-bottom-10 delay-500 duration-1000">
                   <div className="w-full h-full rounded-2xl overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2670&auto=format&fit=crop" 
                        alt="Doctor" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60">
                         <div className="absolute bottom-4 left-4 text-white">
                            <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-1">Chuyên gia</p>
                            <p className="font-bold text-lg">Dr. Sarah Johnson</p>
                         </div>
                      </div>
                   </div>
                </div>

                {}
                <div className="absolute top-0 right-[20%] w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute bottom-[20%] left-[10%] w-32 h-32 bg-emerald-400 rounded-full opacity-20 blur-2xl"></div>
                
                {}
                 <div className="absolute top-[20%] left-[5%] bg-white p-3 rounded-2xl shadow-lg border border-slate-100 animate-bounce duration-[3000ms] z-30">
                    <div className="flex items-center gap-3">
                       <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">Chứng nhận</p>
                          <p className="text-sm font-bold text-slate-800">Đạt chuẩn ISO</p>
                       </div>
                    </div>
                 </div>

             </div>
          </div>

        </div>
      </div>
    </section>
  )
}
