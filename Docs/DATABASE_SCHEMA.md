# Database Schema – Hệ thống Phòng khám

Tài liệu này mô tả ý nghĩa, mục đích sử dụng và các trường chính của từng bảng trong cơ sở dữ liệu của hệ thống quản lý phòng khám. Schema được định nghĩa bằng Sequelize ORM (xem [Backend/src/models/](../Backend/src/models/)) và được tạo qua các migration trong [Backend/migrations/](../Backend/migrations/).

## Mục lục

1. [Nhóm Phân quyền & Người dùng](#1-nhóm-phân-quyền--người-dùng)
2. [Nhóm Hồ sơ Bệnh nhân & Nhân viên](#2-nhóm-hồ-sơ-bệnh-nhân--nhân-viên)
3. [Nhóm Lịch làm việc & Ca trực](#3-nhóm-lịch-làm-việc--ca-trực)
4. [Nhóm Khám bệnh](#4-nhóm-khám-bệnh)
5. [Nhóm Đơn thuốc & Kho thuốc](#5-nhóm-đơn-thuốc--kho-thuốc)
6. [Nhóm Tài chính (Hóa đơn, Thanh toán, Lương)](#6-nhóm-tài-chính-hóa-đơn-thanh-toán-lương)
7. [Nhóm Thông báo & Hệ thống](#7-nhóm-thông-báo--hệ-thống)

---

## 1. Nhóm Phân quyền & Người dùng

### `users` – Tài khoản đăng nhập
Lưu thông tin xác thực và thông tin chung của mọi tài khoản đăng nhập vào hệ thống (admin, lễ tân, bác sĩ, dược sĩ, kế toán, bệnh nhân…). Đây là bảng "gốc" để các bảng vai trò cụ thể (`patients`, `doctors`, `employees`) tham chiếu tới.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `email` | VARCHAR(100) UNIQUE | Email đăng nhập, duy nhất |
| `password` | VARCHAR(255) NULL | Mật khẩu đã hash (NULL nếu đăng nhập bằng OAuth) |
| `fullName` | VARCHAR(100) | Họ tên hiển thị |
| `roleId` | UINT FK → roles | Vai trò của người dùng |
| `isActive` | BOOLEAN | Tài khoản còn hoạt động hay đã bị vô hiệu |
| `avatar` | VARCHAR(255) | Đường dẫn ảnh đại diện |
| `oauth2Provider` | ENUM(GOOGLE) | Nhà cung cấp OAuth (nếu có) |
| `oauth2Id` | VARCHAR(255) | ID tài khoản OAuth bên ngoài |
| `passwordResetToken/Expires` | – | Phục vụ luồng quên mật khẩu |
| `emailVerificationToken/Expires` | – | Phục vụ xác minh email |
| `isEmailVerified` | BOOLEAN | Đã xác minh email hay chưa |

Có hook `afterUpdate` để đồng bộ avatar/isActive sang `employees`, `patients`, `doctors`.

### `roles` – Vai trò
Danh mục các vai trò trong hệ thống (ADMIN, DOCTOR, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT…). Một user có một role; quyền hạn chi tiết được nối qua `role_permissions`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `name` | VARCHAR(50) UNIQUE | Tên vai trò |
| `description` | VARCHAR(255) | Mô tả vai trò |

### `permissions` – Quyền chi tiết
Danh sách các "đầu việc" (CRUD trên một module) mà hệ thống cấp phép. Ví dụ: `appointment.create`, `medicine.read`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `name` | VARCHAR(100) UNIQUE | Mã quyền |
| `description` | VARCHAR(255) | Mô tả |
| `module` | VARCHAR(50) | Tên module mà quyền thuộc về |

### `role_permissions` – Bảng nối Role ↔ Permission
Mô hình RBAC nhiều-nhiều. Khóa chính kép `(roleId, permissionId)`. Không có `createdAt/updatedAt`.

---

## 2. Nhóm Hồ sơ Bệnh nhân & Nhân viên

### `patients` – Hồ sơ bệnh nhân
Mỗi bản ghi là một bệnh nhân (có thể có hoặc không có tài khoản `users`). Bệnh nhân walk-in do lễ tân tạo có thể không có `userId`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `patientCode` | VARCHAR(20) UNIQUE | Mã bệnh nhân (BN001…) |
| `fullName` | VARCHAR(100) | Họ tên |
| `gender` | ENUM(MALE/FEMALE/OTHER) | Giới tính |
| `dateOfBirth` | DATEONLY | Ngày sinh |
| `cccd` | VARCHAR(20) UNIQUE | Số CCCD/CMND |
| `userId` | UINT FK → users (nullable) | Tài khoản đăng nhập liên kết (nếu có) |
| `bloodType` | ENUM | Nhóm máu (A, B, AB, O, +/-) |
| `height`, `weight` | DECIMAL | Chiều cao, cân nặng |
| `chronicDiseases` | JSON | Danh sách bệnh mãn tính |
| `allergies` | JSON | Danh sách dị ứng |
| `noShowCount`, `lastNoShowDate` | – | Đếm số lần bệnh nhân không đến khám |
| `isActive` | BOOLEAN | Còn hoạt động |

### `patient_profiles` – Thông tin liên lạc bệnh nhân
Lưu nhiều giá trị liên lạc (email, số điện thoại, địa chỉ) cho mỗi bệnh nhân. Có `isPrimary` để đánh dấu giá trị mặc định.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `patient_id` | UINT FK → patients | Bệnh nhân chủ sở hữu |
| `type` | ENUM(email/phone/address) | Loại thông tin |
| `value` | VARCHAR(255) | Giá trị thực |
| `ward`, `city` | VARCHAR | Phường, thành phố (cho địa chỉ) |
| `is_primary` | BOOLEAN | Đánh dấu mục mặc định |

### `doctors` – Hồ sơ bác sĩ
Mở rộng thông tin chuyên môn cho user có vai trò bác sĩ.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `doctorCode` | VARCHAR(10) UNIQUE | Mã bác sĩ (BS001…) |
| `userId` | UINT FK → users | User liên kết |
| `specialtyId` | UINT FK → specialties | Chuyên khoa |
| `position`, `degree`, `description` | – | Chức vụ, học vị, mô tả |
| `isActive` | BOOLEAN | Đang công tác hay không |

### `specialties` – Chuyên khoa
Danh mục chuyên khoa (Nội, Ngoại, Sản, Nhi…). Một bác sĩ thuộc một chuyên khoa.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `name`, `description` | – | Chuẩn |
| `isActive` | BOOLEAN | Đang dùng hay không |

### `employees` – Hồ sơ nhân viên (HR)
Bảng hợp nhất thông tin nhân sự (HR view) cho mọi nhân viên — bao gồm cả bác sĩ. Đồng bộ hai chiều với `users`, `doctors`, `patients` qua hooks (xem [Employee.ts](../Backend/src/models/Employee.ts)).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `employeeCode` | VARCHAR(20) UNIQUE | Mã nhân viên |
| `userId` | UINT FK → users | User liên kết |
| `specialtyId` | UINT FK → specialties | Chuyên khoa (nếu là bác sĩ) |
| `position`, `degree`, `description`, `expertise` | – | Thông tin chuyên môn |
| `joiningDate` | DATE | Ngày vào làm (để tính thâm niên trong payroll) |
| `phone`, `gender`, `dateOfBirth`, `address`, `cccd`, `avatar` | – | Thông tin cá nhân |
| `isActive` | BOOLEAN | Đang làm việc |

---

## 3. Nhóm Lịch làm việc & Ca trực

### `shifts` – Khung ca làm việc
Định nghĩa các ca chuẩn (Sáng 08:00–12:00, Chiều 13:00–17:00…).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `name` UNIQUE | – | Tên ca |
| `startTime`, `endTime` | VARCHAR(5) | HH:MM |

### `doctor_shifts` – Lịch trực thực tế của bác sĩ
Gán bác sĩ vào ca làm việc trong một ngày cụ thể. UNIQUE `(doctorId, shiftId, workDate)`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `doctorId` | UINT FK → doctors | Bác sĩ trực |
| `shiftId` | UINT FK → shifts | Khung ca |
| `workDate` | VARCHAR(10) | Ngày làm việc YYYY-MM-DD |
| `status` | ENUM(ACTIVE/CANCELLED/REPLACED) | Trạng thái lịch |
| `replacedBy` | UINT FK → doctors | Bác sĩ thay thế (khi REPLACED) |
| `cancelReason` | TEXT | Lý do hủy |
| `maxSlots` | INT | Số slot tối đa của ca |

### `shift_templates` – Mẫu lịch tuần
Mẫu lặp lại theo thứ trong tuần (ví dụ: BS A trực sáng thứ 2, chiều thứ 4). Dùng để tự sinh `doctor_shifts`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `doctor_id` | UINT FK → doctors | Bác sĩ |
| `shift_id` | UINT FK → shifts | Khung ca |
| `day_of_week` | INT (1–7) | 1=Mon … 7=Sun |
| `is_active` | BOOLEAN | Mẫu còn áp dụng |
| `notes` | TEXT | Ghi chú |

---

## 4. Nhóm Khám bệnh

### `appointments` – Lịch hẹn khám
Đặt lịch khám (online/offline) cho một bệnh nhân với một bác sĩ trong một slot cụ thể. UNIQUE `(doctorId, shiftId, date, slotNumber)`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `appointmentCode` | VARCHAR(50) UNIQUE | Mã lịch hẹn |
| `patientId`, `doctorId`, `shiftId` | – | Tham chiếu |
| `date` | DATEONLY | Ngày khám |
| `slotNumber` | INT | Số thứ tự slot trong ca |
| `bookingType` | ENUM(ONLINE/OFFLINE) | Cách đặt |
| `bookedBy` | ENUM(PATIENT/RECEPTIONIST) | Người đặt |
| `symptomInitial` | TEXT | Triệu chứng ban đầu |
| `patientName/Phone/Dob/Gender` | – | Thông tin "khách" (cho lịch không có hồ sơ chính thức) |
| `symptomImages` | JSON | Mảng URL ảnh triệu chứng |
| `queueNumber` | INT | Số thứ tự khi check-in |
| `status` | ENUM | WAITING / CHECKED_IN / IN_PROGRESS / COMPLETED / CANCELLED / NO_SHOW |

### `visits` – Lượt khám thực tế
Khi bệnh nhân check-in và bác sĩ bắt đầu khám, một `visit` được tạo từ `appointment`. Đây là hồ sơ chính của lượt khám.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `visitCode` | VARCHAR(20) UNIQUE | Mã lượt khám |
| `appointmentId` | UINT UNIQUE FK | Lịch hẹn nguồn (1-1) |
| `patientId`, `doctorId` | – | Bệnh nhân & bác sĩ khám |
| `checkInTime`, `checkOutTime` | DATETIME | Mốc thời gian |
| `symptoms` | TEXT | Triệu chứng ghi nhận |
| `diseaseCategoryId` | FK → disease_categories | Nhóm bệnh chính |
| `diagnosis` | TEXT | Kết luận chẩn đoán (tóm tắt) |
| `note` | TEXT | Ghi chú khám |
| `vitalSigns` | JSON | Huyết áp, nhịp tim, nhiệt độ, SpO2… |
| `referralData` | JSON | Lịch sử chuyển khoa (mảng `{fromDoctorId, toDoctorId, reason…}`) |
| `doctorSignature`, `signedAt` | – | Chữ ký số/hash của bác sĩ và thời điểm ký |
| `status` | ENUM | WAITING / EXAMINING / EXAMINED / COMPLETED |

### `disease_categories` – Nhóm bệnh
Danh mục nhóm bệnh nội bộ (có thể map sang ICD-10 ở `diagnoses`).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `code` UNIQUE, `name`, `description` | – | Mã & tên nhóm bệnh |

### `diagnoses` – Chẩn đoán chi tiết
Một `visit` có thể có nhiều `diagnoses` (đa chẩn đoán). Liên kết với `disease_categories` và lưu mã ICD-10 chuẩn WHO.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `visitId` | UINT FK → visits | Lượt khám chứa chẩn đoán |
| `diseaseCategoryId` | UINT FK → disease_categories | Nhóm bệnh |
| `diagnosisDetail` | TEXT | Mô tả chi tiết |
| `icd10Code` | VARCHAR(20) | Mã ICD-10 |
| `severity` | ENUM(MILD/MODERATE/SEVERE/CRITICAL) | Mức độ nghiêm trọng |
| `note` | TEXT | Ghi chú |

---

## 5. Nhóm Đơn thuốc & Kho thuốc

### `medicines` – Danh mục thuốc
Catalog thuốc của phòng khám, kèm tồn kho, giá nhập, giá bán.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `medicineCode` | VARCHAR(50) UNIQUE | Mã thuốc |
| `name`, `group` | – | Tên thuốc, nhóm thuốc |
| `activeIngredient`, `manufacturer` | – | Hoạt chất, NSX |
| `unit` | ENUM(VIEN/ML/HOP/CHAI/TUYP/GOI) | Đơn vị tính |
| `importPrice`, `salePrice` | DECIMAL | Giá nhập, giá bán |
| `quantity` | INT | Tồn kho hiện tại |
| `minStockLevel` | INT | Ngưỡng cảnh báo sắp hết |
| `expiryDate` | DATE | Hạn sử dụng |
| `description` | TEXT | Mô tả |
| `status` | ENUM(ACTIVE/EXPIRED/REMOVED) | Trạng thái lưu hành |

### `medicine_imports` – Phiếu nhập kho thuốc
Mỗi lần nhập một loại thuốc tạo một bản ghi để truy vết NCC, lô, hóa đơn.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `importCode` UNIQUE | – | Mã phiếu nhập |
| `medicineId` | FK → medicines | Thuốc |
| `quantity` | INT | Số lượng nhập |
| `importPrice` | DECIMAL | Giá nhập |
| `importDate` | DATETIME | Ngày nhập |
| `userId` | FK → users | Người tạo phiếu |
| `supplier`, `supplierInvoice`, `batchNumber` | – | Thông tin NCC & lô |
| `note` | TEXT | Ghi chú |

### `medicine_exports` – Phiếu xuất kho thuốc
Theo dõi xuất kho (cấp phát theo đơn, hủy, hết hạn…).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `exportCode` UNIQUE | – | Mã phiếu xuất |
| `medicineId` | FK → medicines | Thuốc |
| `quantity` | INT | Số lượng xuất |
| `exportDate` | DATETIME | Ngày xuất |
| `userId` | FK → users | Người tạo phiếu |
| `reason` | STRING | Lý do xuất |
| `note` | TEXT | Ghi chú |

### `prescriptions` – Đơn thuốc
Đơn thuốc do bác sĩ tạo trong lượt khám. 1 `visit` → 1 `prescription`.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `prescriptionCode` | VARCHAR(50) UNIQUE | Mã đơn thuốc |
| `visitId` | UNIQUE FK → visits | Lượt khám |
| `doctorId`, `patientId` | – | Bác sĩ kê & bệnh nhân |
| `totalAmount` | DECIMAL | Tổng tiền thuốc |
| `status` | ENUM(DRAFT/LOCKED/DISPENSED/CANCELLED) | Trạng thái State Pattern |
| `dispensedAt`, `dispensedBy` | – | Khi dược sĩ phát thuốc |
| `note` | TEXT | Ghi chú |

### `prescription_details` – Chi tiết đơn thuốc
Mỗi dòng là một loại thuốc trong đơn, kèm liều theo buổi.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `prescriptionId` | FK → prescriptions | Đơn thuốc cha |
| `medicineId` | FK → medicines | Loại thuốc |
| `medicineName`, `unit`, `unitPrice` | – | Snapshot tại thời điểm kê |
| `quantity` | INT | Tổng số lượng |
| `dosageMorning/Noon/Afternoon/Evening` | DECIMAL | Liều theo buổi |
| `days` | INT | Số ngày dùng |
| `instruction` | TEXT | Cách dùng |

---

## 6. Nhóm Tài chính (Hóa đơn, Thanh toán, Lương)

### `invoices` – Hóa đơn
Hóa đơn của một lượt khám (1 `visit` → 1 `invoice`). Bao gồm phí khám + tiền thuốc - giảm giá.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `invoiceCode` | VARCHAR(50) UNIQUE | Mã hóa đơn |
| `visitId` | UNIQUE FK → visits | Lượt khám |
| `patientId`, `doctorId` | – | Bệnh nhân, bác sĩ |
| `examinationFee` | DECIMAL | Phí khám |
| `medicineTotalAmount` | DECIMAL | Tổng tiền thuốc |
| `discount` | DECIMAL | Giảm giá |
| `totalAmount` | DECIMAL | Tổng phải trả |
| `paymentStatus` | ENUM(UNPAID/PARTIALLY_PAID/PAID) | Trạng thái thanh toán |
| `paidAmount` | DECIMAL | Số tiền đã thanh toán |
| `createdBy` | FK → users | Người lập hóa đơn |
| `note` | TEXT | Ghi chú |

### `invoice_items` – Dòng hóa đơn
Chi tiết các mục trong hóa đơn (phí khám, từng loại thuốc).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `invoiceId` | FK → invoices | Hóa đơn cha |
| `itemType` | ENUM(EXAMINATION/MEDICINE) | Loại mục |
| `description` | VARCHAR(500) | Diễn giải |
| `prescriptionDetailId` | FK → prescription_details | Trỏ về thuốc gốc (nếu có) |
| `medicineName`, `medicineCode` | – | Snapshot tên/mã thuốc |
| `quantity`, `unitPrice`, `subtotal` | DECIMAL | Số lượng, đơn giá, thành tiền |

### `payments` – Lần thanh toán
Một hóa đơn có thể được trả nhiều lần (tiền mặt, chuyển khoản, QR).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `invoiceId` | FK → invoices | Hóa đơn được trả |
| `amount` | DECIMAL (>0) | Số tiền thanh toán |
| `paymentMethod` | ENUM(CASH/BANK_TRANSFER/QR_CODE) | Hình thức |
| `paymentDate` | DATETIME | Thời điểm trả |
| `reference` | VARCHAR(200) | Mã giao dịch tham chiếu |
| `createdBy` | FK → users | Thu ngân |
| `note` | TEXT | Ghi chú |

### `refunds` – Hoàn tiền
Yêu cầu & xét duyệt hoàn tiền theo hóa đơn.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `invoiceId` | FK → invoices | Hóa đơn liên quan |
| `amount` | DECIMAL | Số tiền hoàn |
| `reason` | ENUM(APPOINTMENT_CANCELLED/MEDICINE_RETURNED/OVERCHARGED/DUPLICATE_PAYMENT/OTHER) | Lý do |
| `reasonDetail` | TEXT | Chi tiết lý do |
| `status` | ENUM(PENDING/APPROVED/REJECTED/COMPLETED) | Trạng thái |
| `requestedBy` | FK → users | Người yêu cầu |
| `approvedBy` | FK → users | Người duyệt |
| `requestDate/approvedDate/completedDate` | – | Mốc thời gian |
| `note` | TEXT | Ghi chú |

### `payrolls` – Bảng lương
Tính lương theo tháng cho từng nhân viên (user), bao gồm lương theo vai trò, thâm niên, hoa hồng và phạt nghỉ.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id`, `payrollCode` UNIQUE | – | Mã bảng lương |
| `userId` | FK → users | Nhân viên |
| `month`, `year` | INT | Kỳ lương |
| `baseSalary` | DECIMAL (default 2,500,000) | Lương cơ bản |
| `roleCoefficient`, `roleSalary` | – | Hệ số & lương theo vai trò |
| `yearsOfService`, `experienceBonus` | – | Thâm niên & thưởng thâm niên |
| `totalInvoices`, `commissionRate`, `commission` | – | Doanh số tạo & hoa hồng |
| `daysOff`, `allowedDaysOff`, `penaltyDaysOff`, `penaltyAmount` | – | Quản lý ngày nghỉ & phạt |
| `grossSalary`, `netSalary` | DECIMAL | Lương gộp / thực nhận |
| `status` | ENUM(DRAFT/APPROVED/PAID) | Trạng thái duyệt |
| `approvedBy`, `approvedAt`, `paidAt` | – | Người duyệt & mốc thời gian |
| `note` | TEXT | Ghi chú |

### `attendance` – Chấm công
Bản ghi điểm danh ngày cho mỗi nhân viên, dùng để tính `daysOff` trong payroll.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `userId` | FK → users | Nhân viên |
| `date` | DATEONLY | Ngày |
| `checkInTime`, `checkOutTime` | DATETIME | Giờ vào / ra |
| `status` | ENUM(PRESENT/ABSENT/LEAVE/SICK_LEAVE/LATE/EARLY_LEAVE/HALF_DAY) | Trạng thái |
| `note` | TEXT | Ghi chú |

---

## 7. Nhóm Thông báo & Hệ thống

### `notifications` – Thông báo người dùng
Thông báo in-app/email tới user về lịch hẹn, đổi bác sĩ, hệ thống…

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `userId` | FK → users | Người nhận |
| `type` | ENUM(APPOINTMENT_CREATED/APPOINTMENT_CANCELLED/DOCTOR_CHANGED/APPOINTMENT_RESCHEDULED/SYSTEM) | Loại thông báo |
| `title`, `message` | – | Tiêu đề và nội dung |
| `relatedAppointmentId` | FK → appointments | Lịch hẹn liên quan (nếu có) |
| `isRead` | BOOLEAN | Đã đọc |
| `emailSent`, `emailSentAt` | – | Đã gửi email và thời điểm |

### `notification_settings` – Cấu hình thông báo per-user
Mỗi user có 1 dòng — chọn kênh nhận (email, SMS, push, in-app) và loại nhắc (lịch hẹn, đơn thuốc).

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `userId` | UNIQUE FK → users | User sở hữu |
| `emailEnabled`, `smsEnabled`, `pushEnabled`, `inAppEnabled` | BOOLEAN | Bật/tắt kênh |
| `appointmentReminders`, `prescriptionReminders` | BOOLEAN | Bật/tắt loại nhắc |

### `audit_logs` – Nhật ký kiểm toán
Ghi lại mọi thao tác quan trọng (CREATE/UPDATE/DELETE/VIEW/LOGIN/LOGOUT/EXPORT) phục vụ compliance & truy vết.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `userId` | FK → users (nullable) | Người thực hiện (NULL nếu là system) |
| `action` | ENUM | Loại hành động |
| `tableName` | VARCHAR(100) | Bảng bị tác động |
| `recordId` | UINT | ID bản ghi |
| `oldValue`, `newValue` | JSON | Trạng thái trước & sau |
| `ipAddress` | VARCHAR(45) | IPv4/IPv6 |
| `userAgent` | TEXT | Client/browser |
| `timestamp` | DATETIME | Thời điểm |

### `system_settings` – Cấu hình hệ thống
Bảng đơn dòng (singleton) chứa cấu hình phòng khám: thông tin liên hệ, giờ làm việc, cài đặt SMTP, các flag.

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | UINT PK | Khóa chính |
| `clinicName`, `clinicAddress`, `clinicPhone`, `clinicEmail`, `clinicWebsite` | – | Thông tin phòng khám |
| `businessHours` | JSON | Giờ mở/đóng theo từng ngày trong tuần |
| `systemSettings` | JSON | `maintenanceMode`, `allowOnlineBooking`, `maxAppointmentsPerDay`, `appointmentDuration`, `currency`, `timezone`… |
| `emailSettings` | JSON | Cấu hình SMTP để gửi mail |

---

## Quan hệ chính giữa các bảng

```
users 1──1 patients / doctors / employees
users *──1 roles *──* permissions  (qua role_permissions)

patients 1──* appointments *──1 doctors
appointments 1──1 visits
visits 1──1 prescriptions 1──* prescription_details *──1 medicines
visits 1──* diagnoses *──1 disease_categories
visits 1──1 invoices 1──* invoice_items
invoices 1──* payments
invoices 1──* refunds

doctors 1──* doctor_shifts *──1 shifts
doctors 1──* shift_templates *──1 shifts

medicines 1──* medicine_imports / medicine_exports

users 1──* attendance / payrolls / notifications / audit_logs
users 1──1 notification_settings
```

Tham khảo file [associations.ts](../Backend/src/models/associations.ts) để xem chi tiết tất cả các quan hệ Sequelize đã định nghĩa.
