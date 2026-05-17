# Utility Tree – Hệ thống Quản lý Phòng khám

Tài liệu này được dẫn xuất **1–1 từ 24 ASR** đã xác định trong tài liệu ASR. Mỗi UT scenario có mã trùng số với ASR tương ứng (ví dụ `UT-SEC-01` ↔ `ASR-SEC-01`) và có cột **Traceability** chỉ rõ ASR nguồn. Tài liệu được dùng làm đầu vào cho bước **ADD (Attribute-Driven Design)** và **SAD**.

---

## Bước 1 — Tổng hợp các Quality Attribute chính

| Nhóm chất lượng | Vì sao quan trọng với hệ thống | Ảnh hưởng kiến trúc chính | Số ASR | Số UT scenario |
| --- | --- | --- | --- | --- |
| **Security** | Dữ liệu y tế và tài chính nhạy cảm, nhiều vai trò truy cập, có endpoint công khai. | Pipeline middleware xác thực/phân quyền, mô hình RBAC, kho thu hồi token, hashing, validate/sanitize. | 5 | 5 |
| **Performance** | Lễ tân/bác sĩ thao tác liên tục theo thời gian thực. | Lớp cache, chỉ mục DB, phân trang bắt buộc, rate limit. | 2 | 2 |
| **Data Integrity** | Đặt lịch đồng thời, giao dịch tài chính, vòng đời nghiệp vụ phức tạp. | Transaction + row-level lock, state machine module, audit log cross-cutting. | 4 | 4 |
| **Availability** | Phòng khám phục vụ liên tục; nhiều phụ thuộc ngoài (email, OAuth, cache). | Scheduler tách riêng, maintenance mode, fallback cho dependency ngoài. | 3 | 3 |
| **Usability** | Bốn vai trò khác biệt; frontend cần đồng bộ với phân quyền backend. | API contract chuẩn, global error handler, frontend phân vùng theo vai trò. | 2 | 2 |
| **Manageability** | Cần truy vết sự cố, cấu hình quy tắc nghiệp vụ thay đổi, báo cáo định kỳ. | Logging chuẩn, audit log, system settings runtime, service báo cáo tách biệt. | 3 | 3 |
| **Modifiability** | Hệ thống dài hạn cần thêm provider auth, thêm kênh thông báo, mở rộng module. | Module hóa theo domain, adapter pattern, event-driven nội bộ. | 3 | 3 |
| **Scalability** | Tăng trưởng dữ liệu nhiều năm và khả năng mở rộng số instance. | Stateless API, externalized shared state, chỉ mục, phân trang. | 2 | 2 |
| **Tổng** | | | **24** | **24** |

---

## Bước 2 — Utility Tree

> Quy ước: mỗi UT scenario có một ASR nguồn duy nhất. Cột **Traceability** ghi rõ mã ASR đó.

### 1. Security

#### Concern: Authentication & session lifecycle

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SEC-01 | Khi người dùng đăng xuất, đổi mật khẩu hoặc bị admin khóa, mọi request kế tiếp dùng token cũ phải bị từ chối trên toàn hệ thống trong ≤ 1 giây, bất kể token còn hiệu lực theo thời gian. | High | High | ASR-SEC-01 |

#### Concern: Authorization

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SEC-02 | Khi một người dùng có vai trò bất kỳ gọi một endpoint nghiệp vụ, hệ thống phải kiểm tra quyền chi tiết tương ứng trước khi cho vào lớp nghiệp vụ; thay đổi ma trận quyền có hiệu lực mà không cần triển khai lại. | High | High | ASR-SEC-02 |
| UT-SEC-03 | Khi một bệnh nhân (kể cả có ý đồ) yêu cầu xem/sửa tài nguyên bằng ID không thuộc về mình (lịch hẹn, đơn thuốc, hóa đơn, hồ sơ), hệ thống phải từ chối truy cập với 0 trường hợp rò rỉ dữ liệu chéo. | High | High | ASR-SEC-03 |

#### Concern: Input & boundary defense

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SEC-04 | Khi client gửi payload có ký tự nguy hiểm, kích thước vượt mức, nội dung HTML có script, hoặc spam request, lớp biên phải validate cấu trúc, làm sạch nội dung, áp rate limit và đính kèm security header trước khi vào lớp nghiệp vụ. | High | Medium | ASR-SEC-04 |

#### Concern: Secret & credential management

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SEC-05 | Khi triển khai ở môi trường mới, ứng dụng phải đọc bí mật từ cấu hình ngoài và từ chối khởi động nếu thiếu; mật khẩu trong CSDL phải được hash bằng thuật toán adaptive và không thể bị giải mã ngược. | High | Medium | ASR-SEC-05 |

---

### 2. Performance

#### Concern: Read latency for interactive screens

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-PERF-01 | Trong giờ cao điểm, khi lễ tân/bác sĩ/admin mở danh sách (bệnh nhân, lịch hẹn, đơn thuốc, hóa đơn, thuốc) hoặc dashboard có lọc/tìm kiếm, P95 phản hồi phải dưới 500 ms cho danh sách và dưới 1.5 s cho dashboard ở tải định mức. | High | Medium | ASR-PERF-01 |

#### Concern: Resource protection under burst

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-PERF-02 | Khi một client gửi burst request vượt ngưỡng (đặc biệt vào endpoint đăng nhập/OTP), hệ thống phải áp giới hạn tần suất và không cho phép suy giảm chất lượng cho các client hợp lệ khác. | High | Medium | ASR-PERF-02 |

---

### 3. Data Integrity

#### Concern: Concurrent booking

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-DI-01 | Khi nhiều bệnh nhân hoặc lễ tân đặt cùng một ca trực gần đầy đồng thời, hệ thống chỉ chấp nhận đến đúng số slot tối đa; 0 trường hợp vượt slot ngay cả dưới concurrency cao. | High | High | ASR-DI-01 |

#### Concern: Financial atomicity

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-DI-02 | Khi tạo hóa đơn cho một lượt khám có nhiều mục (phí khám + thuốc) hoặc xử lý hoàn tiền, nếu một bước thất bại giữa chừng, tất cả thay đổi trên hóa đơn, thanh toán và tồn kho thuốc phải rollback toàn bộ; không tồn tại bản ghi nửa vời. | High | High | ASR-DI-02 |

#### Concern: Lifecycle integrity

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-DI-03 | Khi nhiều API/role khác nhau cùng cố chuyển trạng thái cho lịch hẹn/lượt khám/hóa đơn, mọi chuyển đổi phải đi qua quy tắc tập trung; 0 trường hợp chuyển trạng thái bất hợp lệ (ví dụ Cancelled → Completed). | High | Medium | ASR-DI-03 |

#### Concern: Auditability

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-DI-04 | Khi xảy ra một sự cố nghiệp vụ trên dữ liệu nhạy cảm, vận hành phải truy được đầy đủ ai – làm gì – khi nào – giá trị trước/sau, với 100% endpoint mutating có audit và việc ghi log không cản trở request chính. | High | Medium | ASR-DI-04 |

---

### 4. Availability

#### Concern: Background processing isolation

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-AVL-01 | Khi các tác vụ định kỳ (auto no-show, cảnh báo thuốc hết hạn, tổng hợp chấm công, sinh lịch trực) chạy, lỗi của chúng không được kéo theo lỗi của API người dùng và mỗi job phải có log thành công/thất bại. | High | Medium | ASR-AVL-01 |

#### Concern: Operational toggles

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-AVL-02 | Khi admin bật chế độ bảo trì, người dùng thường nhận 503 thân thiện trong ≤ 1 giây trong khi admin vẫn dùng được endpoint quản trị, không cần triển khai lại. | Medium | Medium | ASR-AVL-02 |

#### Concern: External dependency failure

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-AVL-03 | Khi dịch vụ email, OAuth provider hoặc cache store lỗi tạm thời, các nghiệp vụ cốt lõi (đặt lịch, khám, kê đơn, thanh toán) phải vẫn hoạt động; chức năng phụ trợ suy giảm có kiểm soát; lõi nghiệp vụ duy trì khả dụng ≥ 99%. | High | High | ASR-AVL-03 |

---

### 5. Usability

#### Concern: API consistency

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-USA-01 | Khi frontend hoặc tích hợp ngoài gọi bất kỳ API nào, cấu trúc response thành công và lỗi phải đồng nhất, kèm mã lỗi nghiệp vụ chuẩn hóa để xử lý đa ngôn ngữ. | Medium | Low | ASR-USA-01 |

#### Concern: Role-tailored UI

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-USA-02 | Khi người dùng có vai trò bất kỳ đăng nhập, frontend chỉ hiển thị điều hướng và hành động phù hợp với quyền; không nút/route nào dẫn đến chức năng mà backend sẽ từ chối. | Medium | Medium | ASR-USA-02 |

---

### 6. Manageability

#### Concern: Observability

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MAN-01 | Khi một sự cố nghiệp vụ được báo cáo, đội vận hành phải truy ra request log, error log và audit trail liên quan trong ≤ 15 phút. | High | Medium | ASR-MAN-01 |

#### Concern: Runtime configurability

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MAN-02 | Khi admin cần đổi tham số nghiệp vụ (số slot tối đa/ca, ngưỡng cảnh báo thuốc hết hạn, giá khám, cài đặt thông báo, maintenance mode), thay đổi phải có hiệu lực trong ≤ 1 phút và không cần đổi mã. | Medium | Medium | ASR-MAN-02 |

#### Concern: Reporting isolation

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MAN-03 | Khi admin yêu cầu báo cáo dải tháng (doanh thu, khám bệnh, kho, lương), việc sinh báo cáo (PDF/Excel) phải hoàn tất < 5 giây và không gây timeout cho API thường. | Medium | Medium | ASR-MAN-03 |

---

### 7. Modifiability

#### Concern: Domain modularity

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MOD-01 | Khi đội phát triển sửa/thêm tính năng trong một domain (ví dụ kê đơn), thay đổi phải gói gọn trong ≤ 2 module, không lan ra các domain không liên quan. | High | Medium | ASR-MOD-01 |

#### Concern: Pluggable authentication providers

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MOD-02 | Khi cần thêm một phương thức đăng nhập mới (OAuth provider khác hoặc SSO), việc bổ sung phải thực hiện được qua adapter mới trong ≤ 1–2 ngày công, mà không phải sửa phần xác thực lõi. | Medium | Medium | ASR-MOD-02 |

#### Concern: Pluggable notification channels

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-MOD-03 | Khi cần thêm một kênh thông báo mới (push, SMS) bên cạnh email/in-app, các service nghiệp vụ phát sinh sự kiện không phải thay đổi; thay đổi gói gọn trong module thông báo. | Medium | Medium | ASR-MOD-03 |

---

### 8. Scalability

#### Concern: Horizontal scaling of API tier

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SCA-01 | Khi triển khai nhiều instance API sau load balancer, các bất biến (token thu hồi đồng bộ, rate limit chính xác, trạng thái xác thực) phải được giữ vững mà không phụ thuộc vào instance cụ thể xử lý request. | High | High | ASR-SCA-01 |

#### Concern: Data growth

| Scenario ID | Quality Attribute Scenario | Importance | Risk | Traceability |
| --- | --- | --- | --- | --- |
| UT-SCA-02 | Khi khối lượng bản ghi nghiệp vụ chính (lịch hẹn, lượt khám, hóa đơn, audit log) tăng gấp 10 lần qua các năm, P95 truy vấn danh sách vẫn phải dưới 500 ms với phân trang/lọc bắt buộc. | High | Medium | ASR-SCA-02 |

---

## Bảng tổng hợp Utility Tree Priority (kèm Traceability)

| Scenario ID | Concern | Importance | Risk | Architectural Impact | ASR nguồn |
| --- | --- | --- | --- | --- | --- |
| UT-SEC-01 | Authentication & session lifecycle | High | High | Very High | ASR-SEC-01 |
| UT-SEC-02 | Authorization (RBAC) | High | High | Very High | ASR-SEC-02 |
| UT-SEC-03 | Authorization (patient self-scope) | High | High | Very High | ASR-SEC-03 |
| UT-SEC-04 | Input & boundary defense | High | Medium | High | ASR-SEC-04 |
| UT-SEC-05 | Secret & credential management | High | Medium | High | ASR-SEC-05 |
| UT-PERF-01 | Read latency (lists & dashboard) | High | Medium | High | ASR-PERF-01 |
| UT-PERF-02 | Resource protection under burst | High | Medium | High | ASR-PERF-02 |
| UT-DI-01 | Concurrent booking | High | High | Very High | ASR-DI-01 |
| UT-DI-02 | Financial atomicity | High | High | Very High | ASR-DI-02 |
| UT-DI-03 | Lifecycle integrity (state machine) | High | Medium | High | ASR-DI-03 |
| UT-DI-04 | Auditability | High | Medium | High | ASR-DI-04 |
| UT-AVL-01 | Background processing isolation | High | Medium | High | ASR-AVL-01 |
| UT-AVL-02 | Operational toggles | Medium | Medium | Medium | ASR-AVL-02 |
| UT-AVL-03 | External dependency failure | High | High | Very High | ASR-AVL-03 |
| UT-USA-01 | API consistency | Medium | Low | Medium | ASR-USA-01 |
| UT-USA-02 | Role-tailored UI | Medium | Medium | Medium | ASR-USA-02 |
| UT-MAN-01 | Observability | High | Medium | High | ASR-MAN-01 |
| UT-MAN-02 | Runtime configurability | Medium | Medium | Medium | ASR-MAN-02 |
| UT-MAN-03 | Reporting isolation | Medium | Medium | Medium | ASR-MAN-03 |
| UT-MOD-01 | Domain modularity | High | Medium | High | ASR-MOD-01 |
| UT-MOD-02 | Pluggable auth providers | Medium | Medium | Medium | ASR-MOD-02 |
| UT-MOD-03 | Pluggable notification channels | Medium | Medium | Medium | ASR-MOD-03 |
| UT-SCA-01 | Horizontal scaling of API tier | High | High | Very High | ASR-SCA-01 |
| UT-SCA-02 | Data growth | High | Medium | High | ASR-SCA-02 |

---

## Bảng truy vết ASR ↔ UT (Coverage Matrix)

| ASR | Tên ASR | UT Scenario | Trạng thái |
| --- | --- | --- | --- |
| ASR-SEC-01 | Xác thực mạnh kèm thu hồi phiên | UT-SEC-01 | Covered |
| ASR-SEC-02 | RBAC + permission chi tiết | UT-SEC-02 | Covered |
| ASR-SEC-03 | Bệnh nhân chỉ thấy dữ liệu của mình | UT-SEC-03 | Covered |
| ASR-SEC-04 | Phòng thủ nhiều lớp ở biên API | UT-SEC-04 | Covered |
| ASR-SEC-05 | Bảo vệ credential & secret | UT-SEC-05 | Covered |
| ASR-PERF-01 | Đáp ứng nhanh cho list/search/dashboard | UT-PERF-01 | Covered |
| ASR-PERF-02 | Khống chế tài nguyên dưới burst | UT-PERF-02 | Covered |
| ASR-DI-01 | Đặt lịch đồng thời nhất quán | UT-DI-01 | Covered |
| ASR-DI-02 | Tài chính nguyên tử | UT-DI-02 | Covered |
| ASR-DI-03 | State machine tường minh | UT-DI-03 | Covered |
| ASR-DI-04 | Audit log cho thao tác nhạy cảm | UT-DI-04 | Covered |
| ASR-AVL-01 | Tác vụ nền không cản trở request | UT-AVL-01 | Covered |
| ASR-AVL-02 | Maintenance mode runtime | UT-AVL-02 | Covered |
| ASR-AVL-03 | Graceful degradation | UT-AVL-03 | Covered |
| ASR-USA-01 | API contract đồng nhất | UT-USA-01 | Covered |
| ASR-USA-02 | UI theo vai trò | UT-USA-02 | Covered |
| ASR-MAN-01 | Quan sát vận hành | UT-MAN-01 | Covered |
| ASR-MAN-02 | Cấu hình runtime | UT-MAN-02 | Covered |
| ASR-MAN-03 | Báo cáo/xuất dữ liệu | UT-MAN-03 | Covered |
| ASR-MOD-01 | Tách module theo domain | UT-MOD-01 | Covered |
| ASR-MOD-02 | Pluggable auth provider | UT-MOD-02 | Covered |
| ASR-MOD-03 | Thêm kênh notification | UT-MOD-03 | Covered |
| ASR-SCA-01 | API stateless + state ngoài | UT-SCA-01 | Covered |
| ASR-SCA-02 | Tăng trưởng dữ liệu | UT-SCA-02 | Covered |

> **Độ phủ:** 24/24 ASR – 100%.

---

## Kết luận kiến trúc

**Quality driver quan trọng nhất** (Importance = High):
Security (authentication, authorization, patient self-scope), Data Integrity (concurrent booking, financial atomicity, lifecycle, audit), Availability (background isolation & graceful degradation), Scalability (stateless API, data growth), cộng với Performance, Manageability (observability) và Modifiability (domain modularity).

**Rủi ro kiến trúc lớn nhất** (Importance = High AND Risk = High → Architectural Impact = Very High):
- **UT-SEC-01** – Thu hồi phiên trong môi trường stateless.
- **UT-SEC-02** – Bao phủ phân quyền chi tiết trên mọi endpoint.
- **UT-SEC-03** – Phạm vi truy cập dữ liệu của bệnh nhân (chống rò rỉ chéo).
- **UT-DI-01** – Đặt lịch đồng thời không vượt slot.
- **UT-DI-02** – Tính nguyên tử của giao dịch tài chính xuyên module.
- **UT-AVL-03** – Suy giảm có kiểm soát khi phụ thuộc ngoài lỗi.
- **UT-SCA-01** – Bảo toàn bất biến khi scale-out.

**Tactic/pattern có khả năng xuất hiện trong ADD:**
- *Security tactics:* Authenticate Actors, Authorize Actors, Limit Access, Validate Input, Encrypt Data (hash mật khẩu), Maintain Audit Trail.
- *Token revocation list* trên externalized shared store; *RBAC + policy-based authorization*; *scoped query enforcement* cho self-scope.
- *Pessimistic locking + transactional boundary* cho đặt lịch và tài chính.
- *State Machine pattern* cho thực thể nghiệp vụ có vòng đời.
- *Audit logging* cross-cutting (interceptor/middleware), ghi bất đồng bộ.
- *Caching* cho dữ liệu read-heavy + *indexing* + *pagination*.
- *Throttling / rate limiting*.
- *Scheduled tasks* tách process, leader election khi scale.
- *Bulkhead / fallback / retry* cho dependency ngoài.
- *Adapter pattern* cho auth provider; *event-driven* nội bộ cho notification.
- *Stateless service + externalized session/blacklist/cache* cho scale-out.
- *Modularization by domain* (package-by-feature).

**Module/domain chịu ảnh hưởng mạnh nhất:**
- **Authentication module** – UT-SEC-01, UT-SEC-05, UT-SCA-01, UT-MOD-02.
- **Authorization (cross-cutting)** – UT-SEC-02, UT-SEC-03, UT-USA-02.
- **Appointment module** – UT-DI-01, UT-DI-03, UT-AVL-01.
- **Finance + Inventory module** – UT-DI-02.
- **Notification module** – UT-MOD-03, UT-AVL-03.
- **Admin / Reporting module** – UT-MAN-01, UT-MAN-02, UT-MAN-03, UT-DI-04.
- **Database layer** – UT-PERF-01, UT-SCA-02.
- **API layer (cross-cutting middleware)** – UT-SEC-04, UT-PERF-02, UT-AVL-02, UT-USA-01.
