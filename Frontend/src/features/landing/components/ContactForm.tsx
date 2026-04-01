import React from 'react';
import { MapPin, Phone, Mail, Map as MapIcon, Send } from 'lucide-react';
import { PublicService } from '../services/public.service';

const ContactForm = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Tư vấn chung',
    message: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)' });
      setLoading(false);
      return; // Keep the return here to prevent sending if validation fails
    }

    try {
      
      const result = await PublicService.sendContactMessage(formData);
      
      if (result.success) {
        setStatus({ type: 'success', message: 'Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ lại sớm.' });
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            department: 'Tư vấn chung',
            message: ''
        });
      } else {
        setStatus({ type: 'error', message: result.message || 'Có lỗi xảy ra.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Có lỗi xảy ra khi kết nối server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="w-full max-w-7xl mx-auto p-4 md:p-6 font-sans py-20">
      <div className="mb-12 text-center">
         <span className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-3 block">LIÊN HỆ VỚI CHÚNG TÔI</span>
         <h2 className="text-3xl font-bold lg:text-4xl text-gray-900">Gửi thắc mắc của bạn</h2>
      </div>

      <div className="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        
        {}
        <div className="w-full lg:w-5/12 bg-blue-600 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          {}
          <div className="relative z-10 space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Thông tin liên hệ</h3>
              <p className="text-blue-100 leading-relaxed">
                Bạn có câu hỏi hoặc cần hỗ trợ? Điền vào biểu mẫu hoặc ghé thăm chúng tôi trực tiếp.
              </p>
            </div>

            <div className="space-y-6">
              {}
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                   <MapPin className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Địa chỉ</h4>
                  <p className="text-blue-100 text-sm mt-1 leading-relaxed">
                    Hàn Thuyên, khu phố 6 P, Thủ Đức,<br />
                    Thành phố Hồ Chí Minh
                  </p>
                </div>
              </div>

              {}
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                   <Phone className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Điện thoại</h4>
                  <p className="text-blue-100 text-sm mt-1">
                    Hotline: (028) 3554 5555<br />
                    Cấp cứu: 115
                  </p>
                </div>
              </div>

              {}
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                   <Mail className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Email</h4>
                  <p className="text-blue-100 text-sm mt-1">
                    contact@healthcare.vn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="mt-12 relative z-10">
            <div className="h-48 w-full rounded-2xl overflow-hidden relative bg-blue-900/20 border border-white/20 group shadow-lg">
              
              {}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5599.958363299317!2d106.79855026986118!3d10.87223801524219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbiAtIMSQSFFHIFRQLkhDTQ!5e1!3m2!1svi!2s!4v1765772058522!5m2!1svi!2s"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
              />

              {}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                 <a 
                   href="https://maps.google.com/?q=Hàn+Thuyên,+khu+phố+6+P,+Thủ+Đức,+Thành+phố+Hồ+Chí+Minh" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="pointer-events-auto flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-xl hover:scale-105"
                 >
                    <MapIcon size={16} />
                    Xem bản đồ
                 </a>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="w-full lg:w-7/12 bg-white p-8 md:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi tin nhắn</h3>
          <p className="text-gray-500 mb-8">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Họ <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nguyễn"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              
              {}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tên <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Văn An"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Số điện thoại</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(090) 000-0000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              />
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phòng ban liên hệ</label>
              <div className="relative">
                <select 
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none appearance-none text-gray-700 cursor-pointer"
                >
                  <option value="Tư vấn chung">Tư vấn chung</option>
                  <option value="Khoa Tim mạch">Khoa Tim mạch</option>
                  <option value="Khoa Nhi">Khoa Nhi</option>
                  <option value="Cấp cứu">Cấp cứu</option>
                  <option value="Đặt lịch hẹn">Đặt lịch hẹn</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Lời nhắn <span className="text-red-500">*</span></label>
              <textarea 
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Nội dung cần hỗ trợ..."
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none resize-none"
              ></textarea>
            </div>

            {}
            {status && (
              <div className={`p-4 rounded-xl ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status.message}
              </div>
            )}

            {}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 mt-4 active:scale-[0.99] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi Tin Nhắn
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ContactForm;