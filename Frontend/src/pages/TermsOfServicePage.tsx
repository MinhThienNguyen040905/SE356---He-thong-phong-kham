
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col pt-32 bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Điều khoản dịch vụ</h1>
        <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none">
          <p className="mb-4">
            Chào mừng bạn đến với HealthCare Plus. Bằng việc truy cập hoặc sử dụng ứng dụng của chúng tôi, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản sau đây. Vui lòng đọc kỹ các điều khoản này.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Chấp nhận điều khoản</h2>
          <p className="mb-4">
            Bằng việc đăng ký tài khoản và sử dụng dịch vụ, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ Điều khoản dịch vụ này cùng với chính sách bảo mật của chúng tôi. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Dịch vụ cung cấp</h2>
          <p className="mb-4">
            HealthCare Plus cung cấp nền tảng quản lý phòng khám, cho phép bệnh nhân đặt lịch hẹn, xem hồ sơ bệnh án, và tương tác với các bác sĩ. Chúng tôi nỗ lực đảm bảo dịch vụ hoạt động ổn định nhưng không cam kết dịch vụ sẽ không bị gián đoạn.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Trách nhiệm của người dùng</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Cung cấp thông tin cá nhân chính xác và cập nhật.</li>
            <li>Bảo mật tài khoản và mật khẩu đăng nhập.</li>
            <li>Không sử dụng dịch vụ vào mục đích vi phạm pháp luật hoặc gây hại cho người khác.</li>
            <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép vào tài khoản.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Quyền riêng tư</h2>
          <p className="mb-4">
            Chúng tôi coi trọng quyền riêng tư của bạn. Việc thu thập và sử dụng thông tin cá nhân được quy định chi tiết trong Chính sách bảo mật.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Thay đổi điều khoản</h2>
          <p className="mb-4">
            Chúng tôi có quyền sửa đổi hoặc cập nhật các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng dụng. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Liên hệ</h2>
          <p>
            Nếu có bất kỳ thắc mắc nào về Điều khoản dịch vụ, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi tại <a href="mailto:support@healthcareplus.com" className="text-blue-600 hover:underline">support@healthcareplus.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
