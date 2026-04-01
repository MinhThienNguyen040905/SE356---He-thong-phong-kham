<div align="center">

### HỆ THỐNG QUẢN LÝ PHÒNG KHÁM TƯ HEALTHCARE

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

[Tính năng](#-tính-năng) • [Công nghệ](#-công-nghệ) • [Bắt đầu](#-bắt-đầu) • [Cấu trúc dự án](#-cấu-trúc-dự-án) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Tổng quan

HỆ THỐNG QUẢN LÝ PHÒNG KHÁM TƯ HEALTHCARE là **Hệ thống Quản lý Y tế** đầy đủ tính năng được thiết kế để tối ưu hóa hoạt động phòng khám. Nó cung cấp dashboard dựa trên vai trò cho **Quản trị viên**, **Bác sĩ**, **Lễ tân** và **Bệnh nhân**, cho phép quản lý hiệu quả lịch hẹn, đơn thuốc, hóa đơn, kho thuốc và nhiều hơn nữa.

## ✨ Tính năng

### 🔐 Xác thực & Phân quyền

- **Xác thực đa vai trò** (Admin, Bác sĩ, Lễ tân, Bệnh nhân)
- Tích hợp OAuth 2.0 (Đăng nhập Google)
- Quản lý phiên làm việc dựa trên JWT
- Đặt lại mật khẩu & xác minh email
- Kiểm soát truy cập dựa trên vai trò (RBAC)

### 👨‍💼 Cổng thông tin Quản trị viên

- **Dashboard** với phân tích & KPI theo thời gian thực
- **Quản lý người dùng** - Thao tác CRUD cho tất cả vai trò
- **Quản lý bác sĩ** - Lịch trình, ca trực, chuyên khoa
- **Quản lý bệnh nhân** - Lịch sử y tế, đơn thuốc
- **Quản lý nhân viên** - Chấm công, lương, tiền công
- **Quản lý nhà thuốc** - Kho, nhập/xuất
- **Báo cáo tài chính** - Doanh thu, hóa đơn, thống kê
- **Nhật ký kiểm toán** - Theo dõi hoạt động hệ thống
- **Cài đặt hệ thống** - Cấu hình ứng dụng

### 👨‍⚕️ Cổng thông tin Bác sĩ

- **Hàng đợi bệnh nhân** - Danh sách bệnh nhân theo thời gian thực
- **Khám bệnh** - Chẩn đoán, ghi nhận dấu hiệu sinh tồn
- **Quản lý đơn thuốc** - Tạo, chỉnh sửa, khóa đơn thuốc
- **Đơn thuốc điện tử** - Xuất PDF, chữ ký điện tử
- **Quản lý ca trực** - Xem lịch trình được phân công

### 👨‍💼 Cổng thông tin Lễ tân

- **Quản lý lịch hẹn** - Đặt lịch online & offline
- **Đăng ký bệnh nhân** - Tiếp nhận bệnh nhân mới
- **Quản lý hóa đơn** - Tạo, chỉnh sửa, xử lý thanh toán
- **Tra cứu bệnh nhân** - Tìm kiếm nhanh & truy cập lịch sử

### 🧑‍🤝‍🧑 Cổng thông tin Bệnh nhân

- **Đặt lịch hẹn** - Lên lịch online
- **Lịch sử y tế** - Xem lượt khám & chẩn đoán trước đây
- **Truy cập đơn thuốc** - Xem đơn thuốc điện tử
- **Lịch sử hóa đơn** - Trạng thái thanh toán & biên lai
- **Quản lý hồ sơ** - Thông tin sức khỏe cá nhân

### 📊 Báo cáo & Phân tích

- Báo cáo doanh thu & tài chính với biểu đồ
- Thống kê & xu hướng lịch hẹn
- Phân tích nhân khẩu học bệnh nhân
- Báo cáo sử dụng thuốc
- Xuất ra PDF & Excel

## 🛠 Công nghệ

### Framework cốt lõi

| Công nghệ      | Phiên bản | Mục đích                |
| -------------- | --------- | ----------------------- |
| **React**      | 19.2      | Thư viện UI             |
| **TypeScript** | 5.9       | Type Safety             |
| **Vite**       | 7.2       | Build Tool & Dev Server |

### UI & Styling

| Công nghệ          | Mục đích                     |
| ------------------ | ---------------------------- |
| **Tailwind CSS 4** | CSS Utility-first            |
| **Radix UI**       | Headless UI Components       |
| **Lucide React**   | Thư viện Icon                |
| **shadcn/ui**      | Thư viện Component           |
| **Recharts**       | Trực quan hóa dữ liệu        |

### State & Forms

| Công nghệ           | Mục đích                    |
| ------------------- | --------------------------- |
| **Zustand**         | Quản lý State toàn cục      |
| **React Hook Form** | Xử lý Form                  |
| **Zod / Yup**       | Xác thực Schema             |

### Tích hợp Backend

| Công nghệ            | Mục đích                     |
| -------------------- | ---------------------------- |
| **Axios**            | HTTP Client                  |
| **Firebase**         | Xác thực & Hosting           |
| **React Router DOM** | Định tuyến phía Client       |

### Trải nghiệm Developer

| Công nghệ             | Mục đích                |
| --------------------- | ----------------------- |
| **ESLint**            | Code Linting            |
| **TypeScript ESLint** | TS-specific Linting     |
| **Prettier**          | Định dạng Code          |

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js** >= 18.x
- **npm** >= 9.x hoặc **yarn** >= 1.22
- **Git**

### Cài đặt

1. **Clone repository**

   ```bash
   git clone https://github.com/QLBV/Frontend.git
   cd Frontend
   ```

2. **Cài đặt dependencies**

   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. **Thiết lập môi trường**

   Tạo file `.env` trong thư mục gốc:

   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Khởi động Development Server**

   ```bash
   npm run dev
   ```

   Ứng dụng sẽ chạy tại `http://localhost:5173`

### Build cho Production

```bash
npm run build
```

### Xem trước Production Build

```bash
npm run preview
```

## 📁 Cấu trúc dự án

```
src/
├── assets/              # Tài nguyên tĩnh (hình ảnh, fonts)
├── auth/                # Context & guards xác thực
├── components/          # Component UI có thể tái sử dụng
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── sidebar/         # Sidebar theo vai trò
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Thư viện tiện ích
├── pages/               # Page components
│   ├── admin/           # Trang dashboard Admin
│   ├── doctor/          # Trang cổng thông tin Bác sĩ
│   ├── patient/         # Trang cổng thông tin Bệnh nhân
│   └── recep/           # Trang Lễ tân
├── services/            # Lớp dịch vụ API
├── types/               # Định nghĩa kiểu TypeScript
├── utils/               # Hàm tiện ích
├── App.tsx              # Component ứng dụng chính
├── main.tsx             # Entry point ứng dụng
└── index.css            # Styles toàn cục
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/tinh-nang-tuyet-voi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng tuyệt vời'`)
4. Push lên branch (`git push origin feature/tinh-nang-tuyet-voi`)
5. Mở Pull Request

### Quy ước Commit

```
feat: Thêm tính năng mới
fix: Sửa lỗi
docs: Thay đổi tài liệu
style: Thay đổi style code
refactor: Tái cấu trúc code
test: Cập nhật testing
chore: Công việc bảo trì
```

## 📄 Giấy phép

Dự án này là phần mềm độc quyền. Bảo lưu mọi quyền.

## 👥 Đội ngũ

Phát triển với ❤️ bởi Đội ngũ Phát triển Healthcare

---

<div align="center">

**[⬆ Về đầu trang](#-healos---hệ-thống-quản-lý-y-tế)**

</div>
