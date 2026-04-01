import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  BookOpen,
  HelpCircle,
  FileText,
  ArrowLeft,
  Send,
  User,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const faqs: FAQItem[] = [
    {
      category: "Đặt lịch khám",
      question: "Làm thế nào để đặt lịch khám bệnh?",
      answer:
        "Bạn có thể đặt lịch khám bằng cách: 1) Đăng nhập vào tài khoản, 2) Chọn menu 'Đặt lịch khám', 3) Chọn bác sĩ, ca khám và ngày khám, 4) Xác nhận thông tin và hoàn tất đặt lịch.",
    },
    {
      category: "Đặt lịch khám",
      question: "Tôi có thể hủy lịch khám không?",
      answer:
        "Có, bạn có thể hủy lịch khám trước giờ khám ít nhất 2 tiếng. Vào 'Lịch khám bệnh', chọn lịch cần hủy và nhấn nút 'Hủy lịch'.",
    },
    {
      category: "Đặt lịch khám",
      question: "Tôi có thể thay đổi thời gian khám không?",
      answer:
        "Có, bạn có thể thay đổi thời gian khám bằng cách vào 'Lịch khám bệnh', chọn lịch cần thay đổi và nhấn 'Chỉnh sửa'. Lưu ý: Chỉ có thể thay đổi khi lịch đang ở trạng thái 'Đang chờ'.",
    },
    {
      category: "Tài khoản",
      question: "Làm sao để đăng ký tài khoản?",
      answer:
        "Nhấn vào nút 'Đăng ký' trên trang chủ, điền đầy đủ thông tin (email, mật khẩu, họ tên), sau đó xác nhận email để kích hoạt tài khoản.",
    },
    {
      category: "Tài khoản",
      question: "Quên mật khẩu phải làm sao?",
      answer:
        "Nhấn vào 'Quên mật khẩu' ở trang đăng nhập, nhập email đã đăng ký. Bạn sẽ nhận được link đặt lại mật khẩu qua email trong vòng 15 phút.",
    },
    {
      category: "Tài khoản",
      question: "Làm sao để cập nhật thông tin cá nhân?",
      answer:
        "Click vào avatar ở góc trên bên phải, chọn 'Thông tin cá nhân'. Tại đây bạn có thể cập nhật họ tên, email, số điện thoại, địa chỉ và ảnh đại diện.",
    },
    {
      category: "Thanh toán",
      question: "Các hình thức thanh toán nào được chấp nhận?",
      answer:
        "Chúng tôi chấp nhận thanh toán bằng tiền mặt tại phòng khám, chuyển khoản ngân hàng, và ví điện tử (Momo, ZaloPay).",
    },
    {
      category: "Thanh toán",
      question: "Tôi có thể xem lại hóa đơn không?",
      answer:
        "Có, bạn có thể xem tất cả hóa đơn của mình tại menu 'Hóa đơn'. Bạn cũng có thể tải xuống file PDF của hóa đơn để lưu trữ.",
    },
    {
      category: "Hồ sơ sức khỏe",
      question: "Làm sao để xem hồ sơ bệnh án của tôi?",
      answer:
        "Truy cập vào menu 'Hồ sơ sức khỏe' để xem lịch sử khám bệnh, kết quả xét nghiệm, chẩn đoán và các đơn thuốc đã kê.",
    },
    {
      category: "Hồ sơ sức khỏe",
      question: "Tôi có thể xem đơn thuốc cũ không?",
      answer:
        "Có, vào menu 'Đơn thuốc' để xem tất cả các đơn thuốc đã được kê. Bạn có thể xem chi tiết từng loại thuốc, liều lượng và cách dùng.",
    },
    {
      category: "Bảo mật",
      question: "Thông tin cá nhân của tôi có được bảo mật không?",
      answer:
        "Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và hồ sơ bệnh án của bạn theo quy định về bảo vệ dữ liệu cá nhân. Thông tin chỉ được truy cập bởi nhân viên y tế có thẩm quyền.",
    },
    {
      category: "Bảo mật",
      question: "Làm sao để đổi mật khẩu?",
      answer:
        "Click vào avatar, chọn 'Thông tin cá nhân', sau đó chuyển sang tab 'Đổi mật khẩu'. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.",
    },
  ];

  const categories = [
    { id: "all", name: "Tất cả", icon: <BookOpen size={20} /> },
    { id: "Đặt lịch khám", name: "Đặt lịch khám", icon: <HelpCircle size={20} /> },
    { id: "Tài khoản", name: "Tài khoản", icon: <FileText size={20} /> },
    { id: "Thanh toán", name: "Thanh toán", icon: <FileText size={20} /> },
    { id: "Hồ sơ sức khỏe", name: "Hồ sơ sức khỏe", icon: <FileText size={20} /> },
    { id: "Bảo mật", name: "Bảo mật", icon: <FileText size={20} /> },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSendingMessage(true);

      
      

      
      await new Promise(resolve => setTimeout(resolve, 1500));

      
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      alert("Câu hỏi của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi qua email trong thời gian sớm nhất.");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Không thể gửi câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          {}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
          </button>

          <h1 className="text-4xl font-bold mb-4">Trung tâm trợ giúp</h1>
          <p className="text-lg opacity-90 mb-6">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Tìm câu trả lời cho câu hỏi của bạn hoặc liên hệ với chúng tôi.
          </p>

          {}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === category.id
                        ? "bg-primary text-white shadow-sm"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-3 space-y-6">
            {}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp</h2>

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Không tìm thấy câu hỏi phù hợp</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            {faq.category}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900 mt-1">{faq.question}</h3>
                        </div>
                        {expandedFAQ === index ? (
                          <ChevronUp className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                        ) : (
                          <ChevronDown className="text-gray-400 flex-shrink-0 ml-4" size={24} />
                        )}
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Phone className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Điện thoại</h3>
                    <p className="text-sm text-gray-500">Gọi ngay để được hỗ trợ</p>
                  </div>
                </div>
                <a href="tel:0123456789" className="text-primary font-semibold hover:underline">
                  0123 456 789
                </a>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <p className="text-sm text-gray-500">Gửi email cho chúng tôi</p>
                  </div>
                </div>
                <a href="mailto:support@healthcare.com" className="text-primary font-semibold hover:underline">
                  support@healthcare.com
                </a>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Địa chỉ</h3>
                    <p className="text-sm text-gray-500">Đến trực tiếp phòng khám</p>
                  </div>
                </div>
                <p className="text-gray-700">123 Đường ABC, Phường XYZ, Quận 1, TP.HCM</p>
              </div>

              {}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Giờ làm việc</h3>
                    <p className="text-sm text-gray-500">Thời gian hỗ trợ</p>
                  </div>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p>Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                  <p>Thứ 7: 8:00 - 12:00</p>
                  <p className="text-gray-500 text-sm">Chủ nhật nghỉ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <footer className="bg-white border-t border-gray-200 py-16 mt-16">
        <div className="max-w-6xl mx-auto px-6">
          {}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Còn thắc mắc?</h2>
            <p className="text-lg text-gray-600">
              Gửi câu hỏi cho chúng tôi và nhận phản hồi qua email trong vòng 24 giờ
            </p>
          </div>

          {}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 shadow-sm border border-primary/20">
              <form onSubmit={handleSubmitContactForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactFormChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  {}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactFormChange}
                      required
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {}
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactFormChange}
                    required
                    placeholder="Tôi có câu hỏi về..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nội dung
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows={5}
                    placeholder="Mô tả chi tiết câu hỏi của bạn..."
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                  />
                </div>

                {}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSendingMessage}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all ${
                      isSendingMessage
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  >
                    {isSendingMessage ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Gửi câu hỏi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">© 2024 HealthCare. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenterPage;
