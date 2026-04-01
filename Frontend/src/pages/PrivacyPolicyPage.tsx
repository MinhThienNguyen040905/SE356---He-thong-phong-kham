
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col pt-32 bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Chính sách bảo mật</h1>
        <div className="bg-white p-8 rounded-lg shadow-md prose max-w-none">
          <p className="mb-4">
            Tại HealthCare Plus, bảo vệ thông tin cá nhân của bạn là ưu tiên hàng đầu. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn khi sử dụng ứng dụng.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Thông tin thu thập</h2>
          <p className="mb-4">
            Chúng tôi có thể thu thập các thông tin sau:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Thông tin định danh: Tên, ngày sinh, giới tính.</li>
            <li>Thông tin liên lạc: Số điện thoại, địa chỉ email, địa chỉ nhà.</li>
            <li>Thông tin y tế: Lịch sử khám bệnh, đơn thuốc, kết quả xét nghiệm (chỉ được truy cập bởi nhân viên y tế có thẩm quyền).</li>
            <li>Thông tin thiết bị và nhật ký truy cập để cải thiện trải nghiệm người dùng.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Mục đích sử dụng thông tin</h2>
          <p className="mb-4">
            Thông tin của bạn được sử dụng để:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Đặt lịch hẹn và quản lý khám chữa bệnh.</li>
            <li>Liên lạc và gửi thông báo quan trọng về dịch vụ.</li>
            <li>Cải thiện chất lượng dịch vụ và hỗ trợ khách hàng.</li>
            <li>Tuân thủ các quy định pháp luật.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Chia sẻ thông tin</h2>
          <p className="mb-4">
            Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Khi có sự đồng ý của bạn.</li>
            <li>Các bác sĩ và nhân viên y tế trực tiếp tham gia quá trình điều trị.</li>
            <li>Cơ quan chức năng khi có yêu cầu hợp pháp.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 mb-4">4. Bảo mật</h2>
          <p className="mb-4">
            Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức tiên tiến để bảo vệ dữ liệu của bạn khỏi truy cập trái phép, mất mát hoặc phá hủy. Dữ liệu y tế được mã hóa và chỉ có những người có thẩm quyền mới được phép truy cập.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">5. Quyền của bạn</h2>
          <p className="mb-4">
            Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình. Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua thông tin bên dưới.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">6. Liên hệ</h2>
          <p>
            Nếu có câu hỏi về chính sách bảo mật, vui lòng liên hệ: <a href="mailto:support@healthcareplus.com" className="text-blue-600 hover:underline">support@healthcareplus.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
