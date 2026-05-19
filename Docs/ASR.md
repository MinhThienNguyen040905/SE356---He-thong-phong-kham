# Tài liệu ASR – Hệ thống Quản lý Phòng khám

> Tài liệu này được viết dưới góc nhìn **"chuẩn bị kiến trúc trước khi code"**, không phải reverse-engineering sau khi triển khai. Mỗi ASR là một **yêu cầu có ý nghĩa kiến trúc** — ảnh hưởng đến quyết định thiết kế, không phải chức năng nghiệp vụ đơn thuần.
>
> Tài liệu chỉ nhắc đến module ở mức khái niệm (Authentication module, Patient module, Database layer, API layer…). Không sử dụng tên hàm, tên class, tên file, tên bảng, tên migration hoặc chi tiết implementation.

---

## Mục lục

- [A. Tóm tắt phạm vi hệ thống](#a-tóm-tắt-phạm-vi-hệ-thống)
- [1. Security](#1-security)
- [2. Performance](#2-performance)
- [3. Data Integrity](#3-data-integrity)
- [4. Availability & Reliability](#4-availability--reliability)
- [5. Usability](#5-usability)
- [6. Manageability](#6-manageability)
- [7. Modifiability & Extensibility](#7-modifiability--extensibility)
- [8. Scalability](#8-scalability)
- [Tổng kết](#tổng-kết)

---

## A. Tóm tắt phạm vi hệ thống

Hệ thống là một nền tảng quản lý phòng khám (Clinic Management System) phục vụ bốn nhóm vai trò chính: **Admin, Lễ tân (Receptionist), Bác sĩ (Doctor), Bệnh nhân (Patient)**. Hệ thống được triển khai theo kiến trúc client–server với một backend cung cấp API và một frontend web client.

### Các chức năng chính

1. **Authentication & Identity** – Đăng ký, đăng nhập (mật khẩu + OAuth bên thứ ba), xác thực OTP qua email, đặt lại mật khẩu, đăng xuất với thu hồi token.
2. **Authorization (RBAC)** – Phân quyền theo vai trò và quyền chi tiết gắn vào vai trò; phân biệt ngữ cảnh truy cập của người dùng (ví dụ bệnh nhân chỉ xem được dữ liệu của chính mình).
3. **Quản lý người dùng & nhân viên** – Hồ sơ người dùng, nhân viên, bác sĩ, bệnh nhân, ảnh đại diện.
4. **Đặt lịch khám (Appointment)** – Đặt lịch online/offline, kiểm tra slot, hủy lịch, đổi lịch, trạng thái lịch hẹn, xử lý no-show tự động.
5. **Khám bệnh (Visit)** – Check-in/check-out, ghi chẩn đoán, triệu chứng, dấu hiệu sinh tồn, danh mục bệnh.
6. **Kê đơn & quản lý thuốc** – Kê đơn theo visit, quản lý kho thuốc, nhập/xuất, cảnh báo hết hạn.
7. **Tài chính** – Hóa đơn (gồm phí khám + thuốc), thanh toán, hoàn tiền, bảng lương nhân viên.
8. **Ca trực & chấm công** – Mẫu ca, sinh lịch trực tự động, chấm công, đổi ca cho bác sĩ.
9. **Thông báo** – Thông báo trong app + email, cài đặt thông báo cá nhân, sự kiện nghiệp vụ (lịch hẹn, kê đơn, thuốc sắp hết hạn).
10. **Quản trị hệ thống** – Audit log đầy đủ thao tác, dashboard thống kê, báo cáo PDF/Excel, cấu hình hệ thống, chế độ bảo trì.
11. **Cross-cutting** – Rate limit, CORS, security header, validate + sanitize đầu vào, cache, transaction + row-level lock, tác vụ nền theo lịch.

Từ các chức năng này, các yêu cầu kiến trúc trọng yếu (ASR) được suy diễn dưới đây.

### Tiêu chí xác định một yêu cầu là ASR

Một yêu cầu được coi là ASR khi thỏa mãn ít nhất một trong các điều kiện:

- Nếu bỏ yêu cầu này, kiến trúc hệ thống phải thay đổi đáng kể.
- Yêu cầu ảnh hưởng xuyên suốt nhiều module.
- Yêu cầu có rủi ro cao về bảo mật, dữ liệu, hiệu năng, độ tin cậy hoặc khả năng mở rộng.
- Yêu cầu buộc hệ thống dùng một tactic / pattern cụ thể.

---

## 1. Security

### 1. ASR-SEC-01: Strong authentication with token revocation

**Tên ASR:** ASR-SEC-01: Xác thực mạnh kèm khả năng thu hồi phiên

**Quality Attribute:** Security

**Mô tả ngắn:** Hệ thống phải xác thực người dùng qua cơ chế token có thời hạn, hỗ trợ nhiều kênh đăng nhập (mật khẩu, OTP, OAuth bên thứ ba) và phải có khả năng thu hồi phiên ngay lập tức khi cần (logout, đổi mật khẩu, nghi ngờ lộ token).

**Quality Attribute Scenario:**
- **Source:** Người dùng đã đăng nhập hoặc quản trị viên.
- **Stimulus:** Người dùng đăng xuất, đổi mật khẩu, hoặc admin chủ động khóa tài khoản.
- **Environment:** Hệ thống đang hoạt động bình thường, token có thể còn hiệu lực hợp lệ về mặt thời gian.
- **Artifact:** Authentication module, API layer cross-cutting middleware xác thực, kho lưu danh sách token bị thu hồi.
- **Response:** Mọi request kế tiếp dùng token đã thu hồi phải bị từ chối trước khi đi vào lớp nghiệp vụ.
- **Response Measure:** Token bị thu hồi không còn truy cập được sau ≤ 1 giây trên toàn hệ thống; 100% endpoint nghiệp vụ phải đi qua bước kiểm tra này.

**Lý do đây là ASR:** Token-based stateless authentication không tự thu hồi được, nên việc yêu cầu hỗ trợ thu hồi buộc kiến trúc phải có **một kho trạng thái dùng chung tốc độ cao** (in-memory store ngoài tiến trình) và một **middleware xác thực bắt buộc** trước mọi route nghiệp vụ. Đồng thời, hỗ trợ nhiều kênh đăng nhập kéo theo quyết định tách riêng module xác thực với các adapter (local, OAuth, OTP).

**Ghi chú thiết kế sơ bộ:** Dùng token có thời hạn ngắn, kết hợp blacklist trên in-memory store dùng chung; tách Authentication module với các sub-flow riêng (password, OAuth, OTP); middleware xác thực đặt ở lớp cross-cutting trước mọi controller.

---

### 2. ASR-SEC-02: Role-Based Access Control with fine-grained permissions

**Tên ASR:** ASR-SEC-02: Phân quyền theo vai trò với quyền chi tiết

**Quality Attribute:** Security

**Mô tả ngắn:** Hệ thống phải áp dụng kiểm soát truy cập theo vai trò (Admin, Doctor, Receptionist, Patient) và theo quyền chi tiết, cho phép mở rộng quyền mà không phải sửa code lõi.

**Quality Attribute Scenario:**
- **Source:** Người dùng có vai trò bất kỳ.
- **Stimulus:** Gửi request đến một chức năng nghiệp vụ.
- **Environment:** Người dùng đã xác thực, ma trận phân quyền có thể được cập nhật theo thời gian.
- **Artifact:** Authorization module, các API nghiệp vụ.
- **Response:** Chỉ chấp nhận request nếu vai trò người gọi sở hữu quyền tương ứng; thay đổi quyền có hiệu lực mà không cần deploy lại.
- **Response Measure:** 100% endpoint nghiệp vụ bị bảo vệ; thay đổi cấu hình quyền có hiệu lực trong phiên kế tiếp; không vai trò nào thực hiện được hành động ngoài tập quyền của mình.

**Lý do đây là ASR:** Yêu cầu này định hình một **mô hình dữ liệu Role–Permission** ở Database layer, một **lớp middleware phân quyền** tách biệt khỏi lớp nghiệp vụ và một **chiến lược kiểm tra quyền dạng khai báo** (declarative) trên từng route. Bỏ yêu cầu này thì kiến trúc sẽ sụp về if/else trộn lẫn trong service.

**Ghi chú thiết kế sơ bộ:** Mô hình Role–Permission nhiều–nhiều, middleware kiểm tra quyền áp dụng ở mức route; gom quyền theo nhóm chức năng.

---

### 3. ASR-SEC-03: Patient data confidentiality (self-scope enforcement)

**Tên ASR:** ASR-SEC-03: Đảm bảo bệnh nhân chỉ truy cập dữ liệu của chính họ

**Quality Attribute:** Security / Privacy

**Mô tả ngắn:** Khi người gọi là bệnh nhân, mọi API trả về dữ liệu y tế (lịch hẹn, đơn thuốc, hóa đơn, hồ sơ) phải bị giới hạn về đúng bản ghi của bệnh nhân đó, kể cả khi tham số đầu vào hợp lệ.

**Quality Attribute Scenario:**
- **Source:** Bệnh nhân đã đăng nhập (có thể có ý đồ truy cập tài nguyên của người khác).
- **Stimulus:** Yêu cầu xem/sửa một tài nguyên y tế bằng ID.
- **Environment:** Hệ thống vận hành bình thường, dữ liệu đa bệnh nhân nằm chung bảng.
- **Artifact:** Patient module, Appointment module, Prescription, Invoice; tầng middleware ngữ cảnh người dùng.
- **Response:** Hệ thống ép điều kiện lọc theo định danh bệnh nhân của chính người gọi trước khi truy cập dữ liệu; truy cập sai phạm vi bị từ chối với lỗi 403.
- **Response Measure:** 0 trường hợp rò rỉ dữ liệu chéo trong test phân quyền; mọi truy vấn dữ liệu y tế của bệnh nhân đều có ràng buộc scope ở tầng service.

**Lý do đây là ASR:** Đây là rủi ro bảo mật lớn nhất với dữ liệu y tế. Yêu cầu buộc kiến trúc phải có **một bước phân giải ngữ cảnh người dùng** (resolve định danh bệnh nhân / bác sĩ từ token) sau xác thực, và một **policy / middleware self-scope** dùng chung cho mọi tài nguyên thuộc về bệnh nhân.

**Ghi chú thiết kế sơ bộ:** Middleware resolve ngữ cảnh sau xác thực; service nhận actor và ép where-clause; tách rõ API dạng "của tôi" và API dạng "admin/staff".

---

### 4. ASR-SEC-04: Input validation, sanitization và defense in depth

**Tên ASR:** ASR-SEC-04: Phòng thủ nhiều lớp ở biên API

**Quality Attribute:** Security

**Mô tả ngắn:** Mọi dữ liệu đến từ client (form, query, body, file upload) phải được validate cấu trúc/kiểu và làm sạch nội dung trước khi vào lớp nghiệp vụ; HTTP response phải đính kèm các header bảo mật và bị giới hạn tần suất.

**Quality Attribute Scenario:**
- **Source:** Client bên ngoài (kể cả client độc hại).
- **Stimulus:** Gửi payload có ký tự nguy hiểm (XSS, injection), kích thước lớn, hoặc spam request.
- **Environment:** Endpoint public (đăng ký, đăng nhập, đặt lịch).
- **Artifact:** API layer, các module nhận dữ liệu nhạy cảm (Auth, Patient, Appointment, Inventory).
- **Response:** Từ chối payload không hợp lệ, làm sạch HTML, áp rate limit, đính kèm header bảo mật chuẩn.
- **Response Measure:** ≥ 95% payload tấn công thông thường bị chặn ở biên; tài nguyên không gặp lỗi do payload không hợp lệ ở tầng nghiệp vụ; rate limit kích hoạt trong vòng N request/khoảng thời gian.

**Lý do đây là ASR:** Yêu cầu này định hướng kiến trúc về một **pipeline middleware chuẩn hóa** (security headers → CORS → rate limit → body parser → validate → sanitize → controller). Nó cũng tách rõ trách nhiệm validate khỏi service, làm cho mọi module mới phải tuân theo cùng pipeline.

**Ghi chú thiết kế sơ bộ:** Bộ validator dùng chung cho mỗi module nghiệp vụ; sanitization middleware xử lý chuỗi HTML; rate limit cấp toàn cục cho lớp API, có khả năng cấu hình.

---

### 5. ASR-SEC-05: Secure handling of credentials and secrets

**Tên ASR:** ASR-SEC-05: Bảo vệ thông tin xác thực và bí mật cấu hình

**Quality Attribute:** Security

**Mô tả ngắn:** Mật khẩu không bao giờ được lưu/trả về dưới dạng rõ; bí mật hệ thống (signing key của token, OAuth client secret, mật khẩu DB, SMTP credential) phải tách khỏi mã nguồn và được kiểm tra khi khởi động.

**Quality Attribute Scenario:**
- **Source:** Quản trị viên hoặc DevOps.
- **Stimulus:** Triển khai hệ thống ở môi trường mới.
- **Environment:** Quá trình khởi động dịch vụ.
- **Artifact:** Config module, Authentication module.
- **Response:** Hệ thống đọc bí mật từ biến môi trường, validate sự tồn tại; mật khẩu được hash bằng thuật toán adaptive trước khi lưu.
- **Response Measure:** Không có giá trị bí mật trong mã nguồn; ứng dụng từ chối khởi động khi thiếu biến môi trường bắt buộc; mật khẩu lưu trong DB không thể bị giải mã ngược.

**Lý do đây là ASR:** Ảnh hưởng đến quyết định về **lớp cấu hình tập trung** và **chiến lược hashing** chuẩn, đồng thời ảnh hưởng pipeline triển khai (CI/CD, secret manager).

**Ghi chú thiết kế sơ bộ:** Tách module config với env validation; thuật toán hash adaptive cho mật khẩu; loại trường mật khẩu khỏi mọi response của User.

---

### Bảng tóm tắt nhóm Security

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-SEC-01 | Xác thực mạnh kèm thu hồi phiên | Security | Token thu hồi có hiệu lực ≤ 1s | Cao |
| ASR-SEC-02 | RBAC + permission chi tiết | Security | 100% endpoint nghiệp vụ được bảo vệ | Cao |
| ASR-SEC-03 | Bệnh nhân chỉ thấy dữ liệu của mình | Security/Privacy | 0 rò rỉ chéo trong test | Cao |
| ASR-SEC-04 | Phòng thủ nhiều lớp ở biên API | Security | ≥ 95% payload bất thường bị chặn | Trung bình – Cao |
| ASR-SEC-05 | Bảo vệ credential & secret | Security | 0 bí mật trong mã nguồn | Trung bình – Cao |

**Kết luận:** Nhóm Security định hình **lớp middleware cross-cutting** (xác thực, phân quyền, validate, sanitize, rate limit, security header) và **mô hình dữ liệu Role–Permission** ở Database layer. Liên quan đến các phần như API xác thực, quản lý người dùng, quản lý quyền, quản lý bệnh nhân, cấu hình hệ thống và frontend client.

---

## 2. Performance

### 6. ASR-PERF-01: Low-latency reads for list/search and dashboard

**Tên ASR:** ASR-PERF-01: Đáp ứng nhanh cho danh sách, tìm kiếm và dashboard

**Quality Attribute:** Performance

**Mô tả ngắn:** Các API danh sách (bệnh nhân, lịch hẹn, thuốc, hóa đơn), tìm kiếm và dashboard tổng hợp phải trả về đủ nhanh dưới tải bình thường để phục vụ thao tác tương tác của lễ tân và bác sĩ.

**Quality Attribute Scenario:**
- **Source:** Người dùng nội bộ (Lễ tân, Bác sĩ, Admin).
- **Stimulus:** Mở danh sách hoặc dashboard có lọc/tìm kiếm.
- **Environment:** Giờ cao điểm, DB có lượng bản ghi lớn (đa năm).
- **Artifact:** API layer, Database layer (chỉ mục), lớp cache.
- **Response:** Trả kết quả với độ trễ chấp nhận được, hỗ trợ phân trang và lọc trên DB.
- **Response Measure:** P95 < 500 ms cho API danh sách thông dụng dưới tải định mức; dashboard < 1.5 s.

**Lý do đây là ASR:** Định hướng kiến trúc dùng **chỉ mục DB có chủ đích**, **phân trang bắt buộc**, và một **lớp cache cho dữ liệu đọc nhiều ghi ít** (danh mục, dashboard). Bỏ yêu cầu này thì có thể giữ kiến trúc đơn giản hơn (không cache, không index riêng).

**Ghi chú thiết kế sơ bộ:** Middleware cache có TTL cho GET; tạo chỉ mục phù hợp cho các trường lọc; truy vấn aggregate phục vụ dashboard tách riêng service.

---

### 7. ASR-PERF-02: Bounded resource usage under attack or burst traffic

**Tên ASR:** ASR-PERF-02: Khống chế tài nguyên dưới tải đột biến

**Quality Attribute:** Performance / Availability

**Mô tả ngắn:** Hệ thống phải tự bảo vệ trước burst traffic hoặc tấn công brute force để duy trì dịch vụ cho người dùng hợp lệ.

**Quality Attribute Scenario:**
- **Source:** Client bất kỳ.
- **Stimulus:** Gửi lượng request vượt ngưỡng trong cửa sổ thời gian (đặc biệt với endpoint đăng nhập, OTP).
- **Environment:** Bất kỳ thời điểm nào.
- **Artifact:** API layer (rate limit), Authentication module.
- **Response:** Áp giới hạn tần suất và trả lỗi 429; các client khác không bị ảnh hưởng.
- **Response Measure:** Số request quá ngưỡng bị từ chối 100%; CPU và bộ nhớ không tăng quá X% so với baseline khi có burst.

**Lý do đây là ASR:** Buộc kiến trúc có **rate limit toàn cục** và **giới hạn riêng cho endpoint nhạy cảm** (login, OTP, OAuth). Ảnh hưởng đến cấu hình triển khai và lựa chọn store đếm phân tán nếu mở rộng nhiều instance.

**Ghi chú thiết kế sơ bộ:** Rate limit theo IP/user ở mức lớp API; cấu hình ngưỡng qua biến môi trường.

---

### Bảng tóm tắt nhóm Performance

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-PERF-01 | Đáp ứng nhanh cho list/search/dashboard | Performance | P95 < 500 ms cho danh sách | Trung bình – Cao |
| ASR-PERF-02 | Khống chế tài nguyên dưới burst | Performance/Availability | 100% request quá ngưỡng bị từ chối | Trung bình |

**Kết luận:** Performance định hình quyết định **đưa vào cache layer, chỉ mục DB và rate limit middleware**. Liên quan đến API danh sách của hầu hết module nghiệp vụ, dashboard quản trị và lớp cơ sở dữ liệu.

---

## 3. Data Integrity

### 8. ASR-DI-01: Transactional consistency for booking and concurrent slot

**Tên ASR:** ASR-DI-01: Toàn vẹn dữ liệu khi đặt lịch khám đồng thời

**Quality Attribute:** Data Integrity / Reliability

**Mô tả ngắn:** Quá trình tạo lịch hẹn phải đảm bảo không vượt số slot tối đa của một ca trực ngay cả khi nhiều người đặt cùng lúc, và phải toàn vẹn giữa các bảng liên quan (lịch hẹn, ca trực, bệnh nhân).

**Quality Attribute Scenario:**
- **Source:** Nhiều bệnh nhân hoặc lễ tân.
- **Stimulus:** Gửi đồng thời nhiều yêu cầu đặt vào cùng một ca trực gần đầy.
- **Environment:** Giờ cao điểm đặt lịch trong ngày.
- **Artifact:** Appointment module, Database layer.
- **Response:** Chỉ chấp nhận đến đúng giới hạn slot, các request thừa bị từ chối với lỗi rõ ràng; không phát sinh trạng thái không nhất quán.
- **Response Measure:** 0 trường hợp vượt slot trong test concurrent; mọi thao tác đặt lịch nằm trong một transaction.

**Lý do đây là ASR:** Buộc kiến trúc sử dụng **transaction kèm row-level lock** (pessimistic) ở lớp service đặt lịch, định nghĩa rõ **mức cô lập** (read committed) và mô hình hóa **trạng thái lịch hẹn rõ ràng**. Đây là quyết định kiến trúc lớn vì ảnh hưởng đến service layer, DB layer và hành vi API.

**Ghi chú thiết kế sơ bộ:** Bao bọc đặt lịch trong transaction; khóa hàng ca trực tương ứng trước khi đếm slot; sinh mã lịch hẹn trong cùng transaction.

---

### 9. ASR-DI-02: Atomic financial operations (invoice, payment, refund)

**Tên ASR:** ASR-DI-02: Tính nguyên tử của giao dịch tài chính

**Quality Attribute:** Data Integrity

**Mô tả ngắn:** Việc tạo hóa đơn, ghi nhận thanh toán và hoàn tiền phải mang tính nguyên tử trên nhiều bảng (hóa đơn, mục hóa đơn, thanh toán, kho thuốc) để không sinh dữ liệu nửa vời.

**Quality Attribute Scenario:**
- **Source:** Lễ tân/Admin.
- **Stimulus:** Tạo hóa đơn cho một lượt khám có nhiều mục (phí khám + thuốc).
- **Environment:** Hệ thống có thể gặp lỗi giữa chừng (DB, mạng).
- **Artifact:** Finance module, Inventory module, Database layer.
- **Response:** Tất cả thay đổi commit cùng nhau hoặc rollback toàn bộ; tồn kho thuốc và mục hóa đơn không lệch.
- **Response Measure:** 0 hóa đơn "mồ côi"/lệch tồn trong test inject lỗi.

**Lý do đây là ASR:** Định hình **service layer dùng transaction** xuyên module (Finance ↔ Inventory ↔ Appointment) và quyết định không dùng eventual consistency cho luồng thanh toán; có thể tác động đến chiến lược sinh mã chứng từ.

**Ghi chú thiết kế sơ bộ:** Service finance điều phối transaction; cập nhật tồn kho trong cùng transaction khi xuất thuốc gắn với hóa đơn.

---

### 10. ASR-DI-03: Explicit state machine for appointment, visit, invoice

**Tên ASR:** ASR-DI-03: State machine tường minh cho các thực thể nghiệp vụ trọng tâm

**Quality Attribute:** Data Integrity / Modifiability

**Mô tả ngắn:** Lịch hẹn, lượt khám và hóa đơn có vòng đời nhiều trạng thái với các chuyển đổi hợp lệ phải được kiểm soát tập trung để tránh thao tác không hợp lệ.

**Quality Attribute Scenario:**
- **Source:** Nhiều vai trò (Bệnh nhân, Lễ tân, Bác sĩ, Admin) thông qua nhiều API khác nhau.
- **Stimulus:** Yêu cầu chuyển trạng thái (hủy lịch, đổi lịch, no-show, hoàn tất khám, đã thanh toán).
- **Environment:** Vận hành thường xuyên.
- **Artifact:** Appointment, Visit, Invoice service.
- **Response:** Từ chối chuyển trạng thái không hợp lệ; áp đồng nhất bất kể API/role nào gọi.
- **Response Measure:** 100% chuyển trạng thái đi qua state machine; 0 trường hợp "Cancelled → Completed".

**Lý do đây là ASR:** Yêu cầu này buộc tách một **lớp state machine dùng chung** thay vì rải if/else trong từng controller. Nó tác động xuyên suốt nhiều module và quyết định hình dạng API.

**Ghi chú thiết kế sơ bộ:** Module utility state machine; mọi transition đi qua service, không cho controller cập nhật trạng thái trực tiếp.

---

### 11. ASR-DI-04: Comprehensive audit trail for sensitive actions

**Tên ASR:** ASR-DI-04: Nhật ký kiểm tra cho mọi thao tác nhạy cảm

**Quality Attribute:** Data Integrity / Manageability / Compliance

**Mô tả ngắn:** Mọi thao tác tạo/sửa/xóa/xuất dữ liệu nhạy cảm phải được ghi nhật ký kiểm tra với thông tin chủ thể, hành động, đối tượng và giá trị trước/sau.

**Quality Attribute Scenario:**
- **Source:** Người dùng nội bộ thực hiện thao tác trên dữ liệu y tế/tài chính/người dùng.
- **Stimulus:** Tạo, sửa, xóa, xuất bản ghi.
- **Environment:** Bình thường.
- **Artifact:** Admin module (audit), tất cả module nghiệp vụ.
- **Response:** Ghi log bất đồng bộ, không cản trở request chính; admin có thể truy vết lại đầy đủ.
- **Response Measure:** 100% endpoint mutating trên dữ liệu nhạy cảm có audit; truy vấn lịch sử theo bản ghi luôn truy được.

**Lý do đây là ASR:** Yêu cầu phải có **một middleware audit dùng chung** và một **module log riêng** ở DB layer, kèm chính sách ghi bất đồng bộ để không làm chậm request.

**Ghi chú thiết kế sơ bộ:** Audit middleware bám sau service trả về kết quả; bảng audit log với cấu trúc generic (tên bảng, ID bản ghi, giá trị trước, giá trị sau).

---

### Bảng tóm tắt nhóm Data Integrity

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-DI-01 | Đặt lịch đồng thời nhất quán | Data Integrity/Reliability | 0 vượt slot | Cao |
| ASR-DI-02 | Tài chính nguyên tử | Data Integrity | 0 hóa đơn lệch | Cao |
| ASR-DI-03 | State machine tường minh | Data Integrity/Modifiability | 100% transition qua SM | Trung bình – Cao |
| ASR-DI-04 | Audit log cho thao tác nhạy cảm | Data Integrity/Manageability | 100% endpoint mutating có audit | Trung bình – Cao |

**Kết luận:** Nhóm Data Integrity định hình quyết định dùng **transaction + locking ở service layer**, đưa vào **state machine module** và **audit log cross-cutting**. Liên quan đến API đặt lịch, khám bệnh, kê đơn, hóa đơn, kho thuốc và cơ sở dữ liệu.

---

## 4. Availability & Reliability

### 12. ASR-AVL-01: Scheduled background jobs without blocking user requests

**Tên ASR:** ASR-AVL-01: Tác vụ nền không cản trở request người dùng

**Quality Attribute:** Availability / Reliability

**Mô tả ngắn:** Các tác vụ định kỳ (auto no-show, cảnh báo thuốc hết hạn, tổng hợp chấm công, sinh lịch trực) phải chạy nền độc lập, có thể lỗi mà không kéo theo lỗi của API chính.

**Quality Attribute Scenario:**
- **Source:** Bộ scheduler nội bộ.
- **Stimulus:** Đến thời điểm cron đã định.
- **Environment:** Service đang phục vụ người dùng.
- **Artifact:** Job module, các service nghiệp vụ liên quan.
- **Response:** Job chạy nền, lỗi được bắt cục bộ, ghi log; không ảnh hưởng API.
- **Response Measure:** 0 sự cố API gây ra bởi job; mọi job đều có log thành công/thất bại.

**Lý do đây là ASR:** Đẩy quyết định kiến trúc theo hướng có **module scheduler riêng**, tách job khỏi request pipeline; định hướng triển khai (single-instance scheduler hay leader election khi scale).

**Ghi chú thiết kế sơ bộ:** Cron-based scheduler khởi tạo trong vòng đời server; job tự xử lý lỗi; tách handler job khỏi controller.

---

### 13. ASR-AVL-02: Maintenance mode without redeploy

**Tên ASR:** ASR-AVL-02: Bật chế độ bảo trì không cần triển khai lại

**Quality Attribute:** Availability / Manageability

**Mô tả ngắn:** Admin có thể bật/tắt chế độ bảo trì cho phần API nghiệp vụ trong khi vẫn giữ truy cập cho admin để xử lý sự cố.

**Quality Attribute Scenario:**
- **Source:** Admin.
- **Stimulus:** Bật maintenance mode.
- **Environment:** Hệ thống đang chạy production.
- **Artifact:** Admin/System module, API layer.
- **Response:** Người dùng thường nhận 503 thân thiện; admin vẫn truy cập được; mọi thay đổi hiệu lực tức thì.
- **Response Measure:** ≤ 1s từ lúc bật đến lúc API thường bị chặn; admin endpoint vẫn dùng được.

**Lý do đây là ASR:** Đưa vào **một middleware maintenance dùng chung** và **bảng cấu hình hệ thống** đọc/ghi runtime, ảnh hưởng pipeline middleware và mô hình cấu hình.

**Ghi chú thiết kế sơ bộ:** Cấu hình hệ thống persistent + cache trong tiến trình; middleware kiểm tra trước route nghiệp vụ; vai trò admin được bypass.

---

### 14. ASR-AVL-03: Graceful degradation when external services fail

**Tên ASR:** ASR-AVL-03: Suy giảm có kiểm soát khi dịch vụ ngoài lỗi

**Quality Attribute:** Availability / Reliability

**Mô tả ngắn:** Khi các phụ thuộc ngoài (email/SMTP, OAuth provider, cache store) lỗi tạm thời, nghiệp vụ cốt lõi vẫn phải tiếp tục được; chức năng phụ thuộc có thể tạm thoái lui có thông báo.

**Quality Attribute Scenario:**
- **Source:** Hạ tầng ngoài.
- **Stimulus:** SMTP down hoặc cache store mất kết nối.
- **Environment:** Vận hành bình thường.
- **Artifact:** Notification module, Authentication module, lớp cache.
- **Response:** Đặt lịch/khám/thanh toán vẫn xử lý; email/OTP được retry hoặc fail nhẹ; cache miss vẫn truy DB.
- **Response Measure:** Lõi nghiệp vụ duy trì khả dụng ≥ 99% khi một phụ thuộc phụ trợ lỗi.

**Lý do đây là ASR:** Buộc tách biên rõ giữa **dịch vụ thiết yếu** và **dịch vụ phụ trợ**; định hướng quyết định về **xử lý lỗi, retry và fallback** trên các adapter ngoài.

**Ghi chú thiết kế sơ bộ:** Wrapper với try/catch + log cho mọi tích hợp ngoài; cache miss đi DB; notification gửi bất đồng bộ.

---

### Bảng tóm tắt nhóm Availability & Reliability

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-AVL-01 | Tác vụ nền không cản trở request | Availability/Reliability | 0 sự cố API do job | Trung bình – Cao |
| ASR-AVL-02 | Maintenance mode runtime | Availability/Manageability | ≤ 1s có hiệu lực | Trung bình |
| ASR-AVL-03 | Graceful degradation | Availability/Reliability | Core ≥ 99% khi phụ thuộc lỗi | Trung bình – Cao |

**Kết luận:** Nhóm Availability định hình **module scheduler riêng**, **middleware bảo trì** và **adapter integration có xử lý lỗi**. Liên quan đến các tác vụ nền của lịch hẹn, kho thuốc, chấm công, ca trực, gửi email và xác thực OAuth.

---

## 5. Usability

### 15. ASR-USA-01: Consistent API contract and error semantics

**Tên ASR:** ASR-USA-01: Hợp đồng API và mã lỗi đồng nhất

**Quality Attribute:** Usability (developer-facing) / Modifiability

**Mô tả ngắn:** Mọi API phải có cấu trúc response thống nhất (success flag, message, data) và mã lỗi nghiệp vụ chuẩn hóa để frontend xử lý nhất quán và đa ngôn ngữ.

**Quality Attribute Scenario:**
- **Source:** Frontend client.
- **Stimulus:** Nhận response từ bất kỳ API nào.
- **Environment:** Mọi tình huống.
- **Artifact:** API layer (controller, error handler).
- **Response:** Cùng cấu trúc thành công/thất bại; lỗi có mã rõ ràng.
- **Response Measure:** 100% endpoint trả về đúng schema response chuẩn; frontend không cần xử lý đặc biệt theo từng API.

**Lý do đây là ASR:** Buộc có **global error handler** và **quy ước response** áp dụng xuyên suốt; ảnh hưởng đến mọi module mới.

**Ghi chú thiết kế sơ bộ:** Error handler trung tâm; chuẩn hóa mã lỗi dạng UPPER_SNAKE; ánh xạ ngoại lệ → mã HTTP.

---

### 16. ASR-USA-02: Role-tailored frontend experience

**Tên ASR:** ASR-USA-02: Trải nghiệm frontend tùy biến theo vai trò

**Quality Attribute:** Usability

**Mô tả ngắn:** Frontend phải hiển thị giao diện, điều hướng và quyền hành phù hợp với vai trò người dùng và phải đồng bộ với quyền của backend.

**Quality Attribute Scenario:**
- **Source:** Người dùng đã đăng nhập.
- **Stimulus:** Mở ứng dụng.
- **Environment:** Trên trình duyệt.
- **Artifact:** Frontend client.
- **Response:** Hiển thị đúng menu/nút theo vai trò; ẩn chức năng không có quyền.
- **Response Measure:** 0 nút/route truy cập được chức năng mà backend sẽ từ chối; trải nghiệm thống nhất theo vai trò.

**Lý do đây là ASR:** Đòi hỏi **route guard và component-level permission check** ở frontend, đồng thời phải có API trả về thông tin vai trò/quyền hiệu dụng; ảnh hưởng tổ chức module frontend (admin/doctor/recep/patient).

**Ghi chú thiết kế sơ bộ:** Tách feature theo vai trò; route guard dựa trên claim trong token + API "me".

---

### Bảng tóm tắt nhóm Usability

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-USA-01 | API contract đồng nhất | Usability/Modifiability | 100% schema chuẩn | Trung bình |
| ASR-USA-02 | UI theo vai trò | Usability | 0 hành động vượt quyền hiển thị | Trung bình |

**Kết luận:** Nhóm Usability định hình **global error handler ở backend** và **cấu trúc frontend theo vai trò**. Liên quan đến API layer và frontend client.

---

## 6. Manageability

### 17. ASR-MAN-01: Operational observability (logs and audit)

**Tên ASR:** ASR-MAN-01: Khả năng quan sát vận hành

**Quality Attribute:** Manageability

**Mô tả ngắn:** Vận hành viên phải có khả năng theo dõi request, lỗi và lịch sử thao tác nghiệp vụ để điều tra sự cố.

**Quality Attribute Scenario:**
- **Source:** DevOps / Admin.
- **Stimulus:** Một sự cố nghiệp vụ được báo cáo.
- **Environment:** Production.
- **Artifact:** Logging module, Audit log module.
- **Response:** Truy được request log, error log và audit trail theo bản ghi.
- **Response Measure:** Thời gian truy vết một sự cố ≤ 15 phút.

**Lý do đây là ASR:** Buộc đưa vào **structured logging** và một **module audit độc lập** ngay từ đầu, ảnh hưởng pipeline middleware và DB schema.

**Ghi chú thiết kế sơ bộ:** Logging chuẩn hóa; audit middleware tự động cho mutating endpoint.

---

### 18. ASR-MAN-02: Configurable business parameters at runtime

**Tên ASR:** ASR-MAN-02: Tham số nghiệp vụ có thể cấu hình runtime

**Quality Attribute:** Manageability / Modifiability

**Mô tả ngắn:** Các tham số nghiệp vụ thường thay đổi (số slot tối đa/ca, ngưỡng cảnh báo thuốc hết hạn, giá khám, cấu hình thông báo, maintenance mode) phải cấu hình được mà không cần đổi mã.

**Quality Attribute Scenario:**
- **Source:** Admin.
- **Stimulus:** Yêu cầu thay đổi quy tắc nghiệp vụ.
- **Environment:** Production.
- **Artifact:** System settings module, các service tương ứng.
- **Response:** Thay đổi áp dụng cho request kế tiếp.
- **Response Measure:** ≤ 1 phút kể từ khi đổi cấu hình đến khi có hiệu lực toàn hệ thống.

**Lý do đây là ASR:** Đẩy kiến trúc theo hướng có **bảng cấu hình hệ thống** và **API quản trị cấu hình**, đồng thời quyết định nơi đọc tham số (service vs hard-code).

**Ghi chú thiết kế sơ bộ:** System settings persistent; service nghiệp vụ đọc qua một wrapper cache.

---

### 19. ASR-MAN-03: Reporting and analytics export

**Tên ASR:** ASR-MAN-03: Báo cáo và xuất dữ liệu phân tích

**Quality Attribute:** Manageability

**Mô tả ngắn:** Admin phải có thể xem dashboard và xuất báo cáo (PDF/Excel) theo nhiều chiều (doanh thu, khám bệnh, kho, lương) mà không ảnh hưởng tải vận hành.

**Quality Attribute Scenario:**
- **Source:** Admin.
- **Stimulus:** Yêu cầu báo cáo theo khoảng thời gian.
- **Environment:** Có thể giờ thấp tải.
- **Artifact:** Admin/report module.
- **Response:** Sinh báo cáo, ưu tiên truy vấn read-only, không khóa nghiệp vụ.
- **Response Measure:** Báo cáo dải tháng < 5 s; không gây timeout cho API thường.

**Lý do đây là ASR:** Yêu cầu tách **service báo cáo** riêng và lựa chọn chiến lược truy vấn (aggregate trên DB vs job nền), ảnh hưởng cấu trúc dashboard và lựa chọn thư viện xuất file.

**Ghi chú thiết kế sơ bộ:** Service báo cáo độc lập; render Excel/PDF ở backend.

---

### Bảng tóm tắt nhóm Manageability

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-MAN-01 | Quan sát vận hành | Manageability | Truy vết ≤ 15 phút | Trung bình – Cao |
| ASR-MAN-02 | Cấu hình runtime | Manageability/Modifiability | Hiệu lực ≤ 1 phút | Trung bình |
| ASR-MAN-03 | Báo cáo/xuất dữ liệu | Manageability | Báo cáo tháng < 5 s | Trung bình |

**Kết luận:** Nhóm Manageability tác động đến **module audit, logging, cấu hình hệ thống và báo cáo**. Liên quan đến Admin module, hệ thống cấu hình và lớp cơ sở dữ liệu.

---

## 7. Modifiability & Extensibility

### 20. ASR-MOD-01: Modular separation by business domain

**Tên ASR:** ASR-MOD-01: Tách module theo domain nghiệp vụ

**Quality Attribute:** Modifiability

**Mô tả ngắn:** Mã nguồn phải được tổ chức theo các domain rõ ràng (Auth, Patient, Appointment, Visit, Inventory, Finance, Shift, Notification, Admin) để cho phép phát triển song song và thay đổi cục bộ.

**Quality Attribute Scenario:**
- **Source:** Đội phát triển.
- **Stimulus:** Thêm tính năng/sửa lỗi trong một domain.
- **Environment:** Phát triển bình thường.
- **Artifact:** Toàn bộ backend.
- **Response:** Thay đổi gói gọn trong một module, không lan ra nhiều module khác.
- **Response Measure:** Thay đổi điển hình chạm ≤ 2 module; thời gian onboarding 1 dev mới ≤ 1 tuần.

**Lý do đây là ASR:** Định hình cách tổ chức repo, quy ước tách controller/service/route/middleware theo domain. Bỏ yêu cầu này thì kiến trúc dễ trở thành monolith hỗn loạn.

**Ghi chú thiết kế sơ bộ:** Mỗi module có controller/route/service/validator riêng; các tiện ích dùng chung gom vào lớp shared.

---

### 21. ASR-MOD-02: Pluggable authentication providers

**Tên ASR:** ASR-MOD-02: Thêm phương thức đăng nhập mới mà không sửa mã lõi

**Quality Attribute:** Modifiability

**Mô tả ngắn:** Hệ thống phải cho phép bổ sung kênh đăng nhập (OAuth provider khác, SSO) mà không động đến phần xác thực lõi.

**Quality Attribute Scenario:**
- **Source:** Đội phát triển.
- **Stimulus:** Thêm Facebook/Microsoft OAuth.
- **Environment:** Sprint mới.
- **Artifact:** Authentication module.
- **Response:** Thêm adapter mới, đăng ký với pipeline xác thực; lõi không đổi.
- **Response Measure:** Bổ sung provider mới trong ≤ 1–2 ngày công.

**Lý do đây là ASR:** Yêu cầu phải có **adapter pattern** ở module xác thực và một quy ước map account ngoài về account nội bộ.

**Ghi chú thiết kế sơ bộ:** Adapter-based, module Auth có pipeline chuẩn hóa user identity ngoài → user nội bộ.

---

### 22. ASR-MOD-03: Notification channels are extensible

**Tên ASR:** ASR-MOD-03: Thông báo dễ mở rộng kênh

**Quality Attribute:** Modifiability

**Mô tả ngắn:** Hệ thống phải cho phép thêm kênh thông báo (push, SMS) bên cạnh email và in-app mà không thay đổi nghiệp vụ phát sinh thông báo.

**Quality Attribute Scenario:**
- **Source:** Đội phát triển.
- **Stimulus:** Yêu cầu thêm push notification.
- **Environment:** Sprint mới.
- **Artifact:** Notification module.
- **Response:** Thêm channel handler; sự kiện nghiệp vụ không đổi.
- **Response Measure:** Thay đổi gói gọn trong Notification module.

**Lý do đây là ASR:** Đẩy kiến trúc về **event-driven nội bộ + handler theo kênh** thay vì gọi email trực tiếp trong service nghiệp vụ.

**Ghi chú thiết kế sơ bộ:** Event emitter nội bộ, handler đăng ký theo loại sự kiện và kênh; cài đặt thông báo theo người dùng.

---

### Bảng tóm tắt nhóm Modifiability

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-MOD-01 | Tách module theo domain | Modifiability | Thay đổi ≤ 2 module | Cao |
| ASR-MOD-02 | Pluggable auth provider | Modifiability | Thêm provider ≤ 2 ngày | Trung bình |
| ASR-MOD-03 | Thêm kênh notification | Modifiability | Thay đổi gói trong 1 module | Trung bình |

**Kết luận:** Nhóm Modifiability định hình **cấu trúc module theo domain**, **adapter cho xác thực** và **event-driven cho notification**. Liên quan đến Authentication module, Notification module và tổ chức tổng thể của backend.

---

## 8. Scalability

### 23. ASR-SCA-01: Stateless API tier and externalized shared state

**Tên ASR:** ASR-SCA-01: Tầng API stateless và trạng thái dùng chung tách ngoài

**Quality Attribute:** Scalability

**Mô tả ngắn:** Tầng API phải stateless để có thể nhân bản theo chiều ngang khi tải tăng; mọi trạng thái dùng chung (phiên thu hồi, rate limit counter, cache nội dung) cần đặt được ở store ngoài.

**Quality Attribute Scenario:**
- **Source:** Vận hành.
- **Stimulus:** Tải tăng đột biến hoặc dự kiến mở rộng số lượng phòng khám.
- **Environment:** Production.
- **Artifact:** API layer, lớp cache, DB layer.
- **Response:** Có thể chạy nhiều instance API sau load balancer mà không phá vỡ chức năng (đăng nhập, thu hồi token, rate limit).
- **Response Measure:** Triển khai N instance không làm hỏng các bất biến (token thu hồi đồng bộ, rate limit chính xác).

**Lý do đây là ASR:** Quyết định lớn về **không lưu state trong process**, **dùng token stateless thay vì session**, **cache/blacklist trên store ngoài**, và chiến lược **scheduler một-leader** khi scale.

**Ghi chú thiết kế sơ bộ:** Token blacklist trên in-memory store ngoài tiến trình; cấu hình rate limit trên store chia sẻ khi scale; scheduler tách process hoặc dùng cờ leader.

---

### 24. ASR-SCA-02: Data growth strategy with indexing and pagination

**Tên ASR:** ASR-SCA-02: Chiến lược tăng trưởng dữ liệu với chỉ mục và phân trang

**Quality Attribute:** Scalability / Performance

**Mô tả ngắn:** Theo thời gian, các bảng nghiệp vụ chính (visit, appointment, audit log, invoice) sẽ tăng nhanh; kiến trúc phải duy trì hiệu năng đọc/ghi.

**Quality Attribute Scenario:**
- **Source:** Sự gia tăng dữ liệu theo năm.
- **Stimulus:** Số bản ghi vượt ngưỡng triệu.
- **Environment:** Production.
- **Artifact:** Database layer, API danh sách/truy vấn.
- **Response:** Truy vấn vẫn nhanh nhờ chỉ mục; mọi API danh sách yêu cầu phân trang/lọc bắt buộc.
- **Response Measure:** P95 truy vấn list giữ < 500 ms ở mốc dữ liệu × 10.

**Lý do đây là ASR:** Buộc có **kế hoạch chỉ mục có chủ đích**, **phân trang bắt buộc ở API**, và mở đường cho **archiving/partitioning** trong tương lai.

**Ghi chú thiết kế sơ bộ:** Chỉ mục theo trường lọc thông dụng; chuẩn hóa phân trang ở API; tách audit log để có thể archive độc lập.

---

### Bảng tóm tắt nhóm Scalability

| Mã ASR | Tên ASR | Quality Attribute | Response Measure chính | Mức ảnh hưởng |
|---|---|---|---|---|
| ASR-SCA-01 | API stateless + state ngoài | Scalability | N instance không phá bất biến | Cao |
| ASR-SCA-02 | Tăng trưởng dữ liệu | Scalability/Performance | P95 giữ < 500 ms ở dữ liệu × 10 | Trung bình – Cao |

**Kết luận:** Nhóm Scalability định hình **tính stateless của API**, **store trạng thái dùng chung tách ngoài** và **chiến lược chỉ mục/phân trang**. Liên quan đến Authentication module, lớp cache, Database layer và các API danh sách của hầu hết module nghiệp vụ.

---

## Tổng kết

Tài liệu ASR trên cô đọng **24 yêu cầu có ý nghĩa kiến trúc**, được sắp xếp theo **8 nhóm quality attribute**. Các quyết định kiến trúc cốt lõi mà các ASR này định hướng gồm:

- **Pipeline middleware cross-cutting** ở API layer: security header → CORS → rate limit → validate → sanitize → auth → permission → context resolver → maintenance → audit → controller.
- **Service layer mạnh, có transaction + locking + state machine** cho các luồng đặt lịch, khám, kê đơn, thanh toán.
- **Lớp cấu hình và quản trị runtime** thông qua System Settings, audit log và maintenance mode.
- **Lớp cache và store ngoài** phục vụ thu hồi token, rate limit, dữ liệu đọc nhiều ghi ít.
- **Module hóa theo domain** ở backend và **phân vùng theo vai trò** ở frontend.
- **Job nền có cron** tách khỏi request pipeline.

### Bảng tổng hợp 24 ASR

| Nhóm | Số ASR | ASR ID |
|---|---|---|
| Security | 5 | ASR-SEC-01 → ASR-SEC-05 |
| Performance | 2 | ASR-PERF-01, ASR-PERF-02 |
| Data Integrity | 4 | ASR-DI-01 → ASR-DI-04 |
| Availability & Reliability | 3 | ASR-AVL-01 → ASR-AVL-03 |
| Usability | 2 | ASR-USA-01, ASR-USA-02 |
| Manageability | 3 | ASR-MAN-01 → ASR-MAN-03 |
| Modifiability | 3 | ASR-MOD-01 → ASR-MOD-03 |
| Scalability | 2 | ASR-SCA-01, ASR-SCA-02 |
| **Tổng** | **24** | |

Tài liệu này có thể dùng làm đầu vào trực tiếp cho bước **Utility Tree** (xếp ưu tiên theo Importance / Risk), bước **ADD (Attribute-Driven Design)** (chọn tactic / pattern / technology) và bước **SAD (Software Architecture Document)** (thiết kế chi tiết).
