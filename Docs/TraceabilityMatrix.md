# Traceability Matrix — Exam Preparation Reference

> Mục đích: khi giảng viên hỏi bất kỳ ASR / module / quality attribute nào, mở file này ra là có sẵn đầy đủ chuỗi truy vết **SRS UC ↔ ASR ↔ UtilityTree ↔ ADD ↔ SAD ↔ Code file ↔ Design Pattern ↔ Demo scenario**.

---

## Mục lục

1. [Master Traceability Matrix (24 ASRs)](#1-master-traceability-matrix-24-asrs)
2. [Quick Reference — Top 7 ASR có Architectural Impact = Very High](#2-quick-reference--top-7-asr-c%C3%B3-architectural-impact--very-high)
3. [Module ↔ ASR Cross-reference](#3-module--asr-cross-reference)
4. [Design Pattern Index](#4-design-pattern-index)
5. [Code File Index](#5-code-file-index)

---

## 1. Master Traceability Matrix (24 ASRs)

| # | ASR ID | ASR Name | UT | SRS UC | ADD § | SAD § | Code File(s) | Design Pattern(s) | Demo Scenario |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **ASR-SEC-01** | Strong Authentication with Token Revocation | UT-SEC-01 | UC1, UC5, UC6 | 2.1.1 | 2.1.1, 4.2.3, 6.1 | [Backend/src/middlewares/auth.middlewares.ts](Backend/src/middlewares/auth.middlewares.ts), [Backend/src/config/redis.config.ts](Backend/src/config/redis.config.ts) (`TokenBlacklistService`), [Backend/src/modules/auth/auth.controller.ts](Backend/src/modules/auth/auth.controller.ts) | **Token Revocation List**, **Middleware Chain**, **Singleton** (Redis client) | Login → call protected API (200) → Logout → call same API immediately (401 TOKEN_REVOKED) trong < 1s |
| 2 | **ASR-SEC-02** | Role-Based Access Control (2 tầng: vai trò ở route + Permission sẵn sàng) | UT-SEC-02 | UC8, plus all mutating UCs | 2.1.2 | 2.1.2, 6.2 | **Tầng đang dùng:** [Backend/src/middlewares/roleCheck.middlewares.ts](Backend/src/middlewares/roleCheck.middlewares.ts) (`requireRole(...allowedRoles)`), được gắn ở từng `*.routes.ts` (ví dụ [employee.routes.ts](Backend/src/modules/user/employee.routes.ts) dòng 10-11 `router.use(verifyToken)` + `router.use(requireRole(RoleCode.ADMIN))`), [Backend/src/constant/role.ts](Backend/src/constant/role.ts). **Tầng dự phòng / mở rộng:** [Backend/src/middlewares/permission.middlewares.ts](Backend/src/middlewares/permission.middlewares.ts) (`requirePermission`, `requireAnyPermission`, `requireAllPermissions`), [Backend/src/models/Role.ts](Backend/src/models/Role.ts), [Backend/src/models/Permission.ts](Backend/src/models/Permission.ts), [Backend/src/models/RolePermission.ts](Backend/src/models/RolePermission.ts) — mô hình dữ liệu sẵn sàng, chưa kích hoạt ở route layer. | **RBAC (Role-Based)**, **Middleware Chain (Chain of Responsibility)**, **Higher-Order Function** (factory `requireRole(...)`), **Repository Pattern** (Role/Permission/RolePermission models) | Login as Patient → gọi `GET /api/employees` (admin-only endpoint) → 403 `FORBIDDEN`. Đổi sang token Admin cùng endpoint → 200 + danh sách nhân viên. |
| 3 | **ASR-SEC-03** | Patient Data Self-scope Enforcement | UT-SEC-03 | UC7, UC11 (own only), patient-scoped GET endpoints | 2.1.3 | 2.1.3, 6.2 | [Backend/src/middlewares/requireSelfPatient.middlewares.ts](Backend/src/middlewares/requireSelfPatient.middlewares.ts), [Backend/src/middlewares/requireContext.middlewares.ts](Backend/src/middlewares/requireContext.middlewares.ts) | **Self-scope Guard**, **Context Resolver**, **Authorization Filter** | Login as Patient A → GET /api/appointments/{id-của-Patient-B} → 403 OUT_OF_SCOPE |
| 4 | **ASR-SEC-04** | Input Validation and Boundary Defense | UT-SEC-04 | All UCs with input | 2.1.4 | 2.1.4, 6.3 | [Backend/src/app.ts](Backend/src/app.ts) (helmet, cors, rate limit setup), [Backend/src/middlewares/sanitize.middlewares.ts](Backend/src/middlewares/sanitize.middlewares.ts), [Backend/src/middlewares/validators/](Backend/src/middlewares/validators/) (express-validator schemas) | **Middleware Pipeline (Chain of Responsibility)**, **Decorator** (validator chains) | POST /api/visits với `symptoms: "<script>alert(1)</script>"` → kiểm tra DB lưu sanitized text |
| 5 | **ASR-SEC-05** | Secure Credential and Secret Management | UT-SEC-05 | UC1, UC2, UC6 (password); deployment | 2.1.5 | 2.1.5, 6.1, 6.4 | [Backend/src/config/env.validation.ts](Backend/src/config/env.validation.ts), [Backend/src/utils/password.ts](Backend/src/utils/password.ts) (bcrypt wrapper) | **Configuration Externalization**, **Adaptive Hashing (bcrypt)**, **Fail-fast Bootstrap** | Xóa biến JWT_SECRET → npm run dev → backend từ chối khởi động với lỗi rõ |
| 6 | **ASR-PERF-01** | Low-latency Reads for Lists, Search and Dashboard | UT-PERF-01 | All list/search UCs (UC9 doctor list, UC25 reports) | 2.2.1 | 2.2.1, 7.1 | [Backend/src/middlewares/cache.middlewares.ts](Backend/src/middlewares/cache.middlewares.ts), [Backend/migrations/20250103000001-add-performance-indexes.js](Backend/migrations/20250103000001-add-performance-indexes.js), [Backend/migrations/20250104000001-add-additional-performance-indexes.js](Backend/migrations/20250104000001-add-additional-performance-indexes.js) | **Cache-aside**, **Database Indexing**, **Pagination** | GET /api/appointments với 10k bản ghi → đo P95 < 500ms qua Postman runner |
| 7 | **ASR-PERF-02** | Resource Protection Under Burst Traffic | UT-PERF-02 | UC1 (login brute-force) | 2.2.2 | 2.2.2, 6.3 | [Backend/src/app.ts](Backend/src/app.ts) (express-rate-limit config), [Backend/src/middlewares/rateLimit.middlewares.ts](Backend/src/middlewares/rateLimit.middlewares.ts) | **Rate Limiting**, **Throttling** | `for i in {1..50}; do curl POST /api/auth/login; done` → request thứ ~10+ trả 429 Too Many Requests |
| 8 | **ASR-DI-01** | **Concurrent Booking Consistency** ⭐ | UT-DI-01 | UC9, UC10, UC12 | 2.3.1 | 2.3.1, 4.2.1 | [Backend/src/modules/appointment/appointment.service.ts](Backend/src/modules/appointment/appointment.service.ts) (`createAppointmentService`), [Backend/src/utils/stateMachine.ts](Backend/src/utils/stateMachine.ts) (`AppointmentStateMachine`), [Backend/src/utils/codeGenerator.ts](Backend/src/utils/codeGenerator.ts) (`generateAppointmentCode`) | **Transaction Script**, **Pessimistic Locking** (SELECT FOR UPDATE), **State Machine**, **Code Generator** | Seed DB: DoctorShift còn 1 slot. Chạy 2 request concurrent qua `xargs -P 2`. 1 thành công (201), 1 fail (409 SLOTS_FULL) |
| 9 | **ASR-DI-02** | **Atomic Financial Operations** ⭐ | UT-DI-02 | UC15, UC18, UC19, UC20 | 2.3.2 | 2.3.2, 4.2.4 | [Backend/src/modules/appointment/prescription.service.ts](Backend/src/modules/appointment/prescription.service.ts) (`createPrescription`, `updatePrescription` — biên transaction kê đơn + xuất kho), [Backend/src/modules/finance/invoice.service.ts](Backend/src/modules/finance/invoice.service.ts) (`createInvoiceFromVisit` — biên transaction tạo hóa đơn từ snapshot), [Backend/src/utils/stateMachine.ts](Backend/src/utils/stateMachine.ts) (VisitStateMachine) | **Transaction Script** (2 biên tách biệt), **Pessimistic Locking** (Medicine row trong prescription transaction), **State Machine** (VisitStateMachine), **Snapshot Pattern** (PrescriptionDetail giữ unitPrice/quantity cho InvoiceItem đọc lại) | **(a)** Kê đơn với số lượng > stock → INSUFFICIENT_STOCK, Prescription + Medicine.quantity + MedicineExport đều rollback. **(b)** Đã có đơn thuốc, tạo hóa đơn 2 lần cho cùng visit → lần 2 báo INVOICE_ALREADY_EXISTS, không sinh hóa đơn trùng. |
| 10 | **ASR-DI-03** | Explicit State Machine for Business Entities | UT-DI-03 | UC11, UC12, UC13, UC14, UC18 | 2.3.3 | 2.3.3, 2.2 (mô tả) | [Backend/src/utils/stateMachine.ts](Backend/src/utils/stateMachine.ts) (`AppointmentStateMachine`, `VisitStateMachine`, `InvoiceStateMachine`) | **State Machine Pattern**, **Strategy** (per entity type) | Cố gọi API chuyển CANCELLED → COMPLETED → throw `INVALID_APPOINTMENT_STATE_TRANSITION` |
| 11 | **ASR-DI-04** | Comprehensive Audit Trail | UT-DI-04 | All mutating UCs | 2.3.4 | 2.3.4, 6.5 | [Backend/src/middlewares/auditLog.middlewares.ts](Backend/src/middlewares/auditLog.middlewares.ts), [Backend/src/modules/admin/auditLog.service.ts](Backend/src/modules/admin/auditLog.service.ts), [Backend/src/models/AuditLog.ts](Backend/src/models/AuditLog.ts) | **Interceptor**, **Decorator** (auditCreate/Update/Delete wrappers), **Async Write** | Update bệnh nhân → query GET /api/audit-logs?recordId={id} → thấy entry với oldValue/newValue |
| 12 | **ASR-AVL-01** | Background Job Isolation | UT-AVL-01 | UC22 (cron schedule generation), auto-no-show | 2.4.1 | 2.4.1, 4.2.5 (sequence) | [Backend/src/jobs/scheduler.ts](Backend/src/jobs/scheduler.ts), [Backend/src/jobs/autoNoShow.job.ts](Backend/src/jobs/autoNoShow.job.ts), [Backend/src/jobs/attendance.job.ts](Backend/src/jobs/attendance.job.ts), [Backend/src/jobs/medicineExpiryCheck.ts](Backend/src/jobs/medicineExpiryCheck.ts), [Backend/src/jobs/scheduleGenerationCron.ts](Backend/src/jobs/scheduleGenerationCron.ts) | **Scheduler**, **Try-Catch Wrapper**, (đề xuất tương lai: **Leader Election**) | Inject lỗi vào auto-no-show job → log thấy "[Scheduler] Auto no-show job failed:" nhưng API vẫn 200 OK |
| 13 | **ASR-AVL-02** | Runtime Maintenance Mode | UT-AVL-02 | UC27 | 2.4.2 | 2.4.2 | [Backend/src/middlewares/maintenance.middlewares.ts](Backend/src/middlewares/maintenance.middlewares.ts) (`checkMaintenance`), [Backend/src/models/SystemSettings.ts](Backend/src/models/SystemSettings.ts), [Backend/src/modules/admin/system.controller.ts](Backend/src/modules/admin/system.controller.ts) | **Feature Toggle**, **Cache-Aside** | Login as Admin → bật maintenance → mở tab khác làm Patient → GET /api/appointments → 503 trong < 1s |
| 14 | **ASR-AVL-03** | Graceful Degradation on External Dependency Failure | UT-AVL-03 | UC2 (OTP send fail), UC4 (OAuth down) | 2.4.3 | 2.4.3, 7.1 | [Backend/src/services/email.service.ts](Backend/src/services/email.service.ts), [Backend/src/config/redis.config.ts](Backend/src/config/redis.config.ts) (Redis client error handlers) | **Bulkhead**, **Fallback**, **Retry** | Tắt SMTP → đặt lịch khám vẫn thành công, chỉ email confirmation không gửi (có log warning) |
| 15 | **ASR-USA-01** | Consistent API Contract and Error Semantics | UT-USA-01 | All UCs | 2.5.1 | 2.5.1 | [Backend/src/middlewares/errorHandler.middlewares.ts](Backend/src/middlewares/errorHandler.middlewares.ts), [Backend/src/utils/response.utils.ts](Backend/src/utils/response.utils.ts), [Backend/src/utils/AppError.ts](Backend/src/utils/AppError.ts) | **Global Error Handler**, **DTO** (response schema), **Exception Mapper** | Trigger các loại lỗi khác nhau (400, 401, 403, 404, 500) → tất cả response cùng schema `{ success, message, data }` |
| 16 | **ASR-USA-02** | Role-tailored Frontend Experience | UT-USA-02 | All UCs (filtered by Security Matrix in SRS 3.1) | 2.5.2 | 2.5.2 | [Frontend/src/pages/admin/](Frontend/src/pages/admin/), [Frontend/src/pages/doctor/](Frontend/src/pages/doctor/), [Frontend/src/pages/recep/](Frontend/src/pages/recep/), [Frontend/src/pages/patient/](Frontend/src/pages/patient/), [Frontend/src/features/](Frontend/src/features/) | **Route Guard**, **Package-by-Role**, **Conditional Rendering** | Login as Doctor → sidebar không hiện menu Admin / Reports / Audit Log |
| 17 | **ASR-MAN-01** | Operational Observability | UT-MAN-01 | UC24 | 2.6.1 | 2.6.1 | [Backend/src/utils/logger.ts](Backend/src/utils/logger.ts) (Winston), [Backend/src/app.ts](Backend/src/app.ts) (Morgan), [Backend/src/modules/admin/auditLog.controller.ts](Backend/src/modules/admin/auditLog.controller.ts) | **Structured Logging**, **Audit Log Query Interface** | Tạo lỗi 500 nào đó → check console log có request id, route, user, stack trace |
| 18 | **ASR-MAN-02** | Runtime Configurability of Business Parameters | UT-MAN-02 | UC26 | 2.6.2 | 2.6.2 | [Backend/src/modules/admin/system.controller.ts](Backend/src/modules/admin/system.controller.ts), [Backend/src/models/SystemSettings.ts](Backend/src/models/SystemSettings.ts), [Backend/src/config/booking.config.ts](Backend/src/config/booking.config.ts) (default fallback) | **Configuration Repository**, **Cache-Aside with TTL** | Đổi `default_slots_per_shift` từ 15 → 10 qua API admin → tạo DoctorShift mới có maxSlots=10 ngay |
| 19 | **ASR-MAN-03** | Reporting and Export | UT-MAN-03 | UC25 | 2.6.3 | 2.6.3 | [Backend/src/modules/admin/report.service.ts](Backend/src/modules/admin/report.service.ts), [Backend/src/modules/admin/reportExcel.service.ts](Backend/src/modules/admin/reportExcel.service.ts), [Backend/src/modules/admin/reportPDF.service.ts](Backend/src/modules/admin/reportPDF.service.ts), [Backend/src/utils/pdfGenerator.ts](Backend/src/utils/pdfGenerator.ts), [Backend/src/utils/excelGenerator.ts](Backend/src/utils/excelGenerator.ts) | **Strategy** (Excel vs PDF), **Template Method**, **Builder** (chart + table) | Generate report tháng → file Excel/PDF download, không làm chậm API khác đang chạy |
| 20 | **ASR-MOD-01** | Domain Modularity | UT-MOD-01 | All UCs (organization) | 2.7.1 | 2.7.1, 3.1 (AD-002) | [Backend/src/modules/](Backend/src/modules/) (cấu trúc package-by-feature) | **Package-by-Feature**, **Layered Architecture** (route → controller → service → model) | Mở src/modules/appointment → thấy đủ 5 file (controller, route, service, validator, cancel/reschedule sub-services) — không có code Appointment ngoài folder này |
| 21 | **ASR-MOD-02** | Pluggable Authentication Providers | UT-MOD-02 | UC4 | 2.7.2 | 2.7.2 | [Backend/src/config/oauth.config.ts](Backend/src/config/oauth.config.ts) (Passport setup), [Backend/src/modules/auth/oauth.controller.ts](Backend/src/modules/auth/oauth.controller.ts), [Backend/src/modules/auth/oauth.routes.ts](Backend/src/modules/auth/oauth.routes.ts) | **Adapter Pattern** (Passport strategies), **Pipeline** (verify → normalize → upsert → issue JWT) | Mô tả: thêm Facebook OAuth chỉ cần `npm i passport-facebook` + 1 file strategy mới + 2 route — lõi auth không động |
| 22 | **ASR-MOD-03** | Pluggable Notification Channels | UT-MOD-03 | Cross-cutting (after most UCs) | 2.7.3 | 2.7.3 | [Backend/src/events/appointmentEvents.ts](Backend/src/events/appointmentEvents.ts), [Backend/src/modules/notification/notification.service.ts](Backend/src/modules/notification/notification.service.ts), [Backend/src/modules/notification/notificationSettings.service.ts](Backend/src/modules/notification/notificationSettings.service.ts), [Backend/src/services/email.service.ts](Backend/src/services/email.service.ts) | **Observer / Event Emitter**, **Strategy** (per channel handler) | Mô tả: thêm SMS channel = đăng ký listener mới cho event `AppointmentCreated` — service Appointment không đổi |
| 23 | **ASR-SCA-01** | **Stateless API Tier + Externalized Shared State** ⭐ | UT-SCA-01 | All UCs | 2.8.1 | 2.8.1, 5.1, 9.1, 9.2, 9.3 | [Backend/src/app.ts](Backend/src/app.ts) (`trust proxy = 1`), [Backend/src/config/redis.config.ts](Backend/src/config/redis.config.ts) (TokenBlacklistService) | **Stateless Service**, **Externalized State** (Redis), (tương lai: **Leader Election**) | Restart backend container giữa lúc user đang dùng → user vẫn login được vì JWT stateless |
| 24 | **ASR-SCA-02** | Data Growth Handling | UT-SCA-02 | All list UCs over time | 2.8.2 | 2.8.2, 7.2, 9.4 | [Backend/migrations/](Backend/migrations/) (67+ files), [Backend/src/modules/](Backend/src/modules/) (pagination ở mỗi list endpoint) | **Database Indexing**, **Pagination**, (tương lai: **Partitioning**) | Seed 100k appointments → query GET /api/appointments?page=1&limit=20 → vẫn < 500ms nhờ index |

> ⭐ = ASR có Architectural Impact = **Very High**, dễ bị giảng viên hỏi sâu nhất.

---

## 2. Quick Reference — Top 7 ASR có Architectural Impact = Very High

Đây là **7 ASR có khả năng giảng viên hỏi cao nhất**. Chuẩn bị thuộc nội dung dưới đây.

### ⭐ ASR-DI-01 — Concurrent Booking (đặt lịch đồng thời)

**Câu hỏi mẫu:** *"Module Appointment có yêu cầu Data Integrity nào? Giải thích sao có ý nghĩa kiến trúc?"*

**Trả lời theo cấu trúc:**

1. **ASR là gì** — ASR-DI-01: đặt lịch đồng thời không vượt slot ca trực.
2. **Sao có ý nghĩa kiến trúc** — Vì:
   - Concurrency cao (giờ cao điểm 7-9h sáng nhiều người đặt cùng lúc).
   - Bỏ yêu cầu này thì cần thay đổi quyết định kiến trúc lớn (không cần transaction, không cần lock).
   - Rủi ro cao: vượt slot là sự cố nghiệp vụ rõ ràng.
   - Buộc dùng tactic cụ thể: pessimistic locking.
3. **Tactic chọn** — Transaction + `SELECT ... FOR UPDATE` ở mức cô lập READ COMMITTED.
4. **Trade-off** — Pessimistic giảm throughput dưới concurrency cao so với optimistic, nhưng ca trực gần đầy có xác suất conflict cao → optimistic phải retry nhiều → tốn hơn.
5. **Code** — `Backend/src/modules/appointment/appointment.service.ts` hàm `createAppointmentService`.
6. **Pattern** — Transaction Script + Pessimistic Locking + State Machine (AppointmentStateMachine) + Code Generator (sinh appointmentCode trong cùng transaction).
7. **Demo** — Seed DB còn 1 slot → 2 request concurrent → 1 success, 1 fail 409 SLOTS_FULL.

---

### ⭐ ASR-DI-02 — Atomic Financial Operations (kê đơn + tạo hóa đơn)

**Câu hỏi mẫu:** *"Tại sao việc kê đơn và tạo hóa đơn phải atomic? Implement thế nào?"*

**Key points:**
- Hệ thống chia luồng tài chính thành **2 biên transaction** theo vai trò nghiệp vụ:
  - **Biên (a) – Prescription transaction** (bác sĩ kê đơn): atomic giữa Prescription + PrescriptionDetail + Medicine.quantity (trừ kho) + MedicineExport + Visit.status. Đây mới là nơi "động vào tồn kho".
  - **Biên (b) – Invoice transaction** (lễ tân tạo hóa đơn): atomic giữa Invoice + InvoiceItem cho phí khám + InvoiceItem cho từng PrescriptionDetail (đọc snapshot unitPrice/quantity từ đơn).
- Lý do chia: đảm bảo bác sĩ không kê vượt tồn kho ngay tại thời điểm khám (không thể "kê rồi mai tính"); hóa đơn chỉ là chứng từ tổng hợp.
- Tactic biên (a): `sequelize.transaction({ isolationLevel: READ_COMMITTED })` + `Medicine.findByPk({ lock: t.LOCK.UPDATE })` cho mỗi medicine item, rồi check `quantity >= qty` và trừ.
- Tactic biên (b): `sequelize.transaction()` đọc Visit + Prescription + Details, check `existingInvoice` để chống tạo trùng, sinh `invoiceCode` trong transaction.
- Pattern: Transaction Script (×2) + Pessimistic Locking (Medicine row) + State Machine (VisitStateMachine) + Snapshot Pattern (PrescriptionDetail giữ giá tại thời điểm kê).
- Code:
  - [prescription.service.ts](Backend/src/modules/appointment/prescription.service.ts) hàm `createPrescription` (biên a) và `updatePrescription` (sửa đơn = phục hồi kho cũ + trừ kho mới + xóa InvoiceItem cũ — vẫn trong 1 transaction).
  - [invoice.service.ts](Backend/src/modules/finance/invoice.service.ts) hàm `createInvoiceFromVisit` (biên b).
- Demo:
  - **(a)** Kê đơn với medicine số lượng > stock → throw `INSUFFICIENT_STOCK_*`. Kiểm DB: Prescription không tồn tại, Medicine.quantity không đổi, không có MedicineExport mới.
  - **(b)** Tạo hóa đơn 2 lần cho cùng `visitId` → lần 2 báo `Invoice already exists for this visit`, không sinh hóa đơn trùng.

---

### ⭐ ASR-SEC-01 — Strong Authentication with Token Revocation

**Câu hỏi mẫu:** *"JWT là stateless, làm sao thu hồi được token?"*

**Key points:**
- JWT stateless không thu hồi được tự nhiên — chữ ký còn hợp lệ thì backend không từ chối.
- Giải pháp: **Token Revocation List** trên Redis.
- Logout → token thêm vào Redis key `blacklist:token:{jwt}` với TTL = remaining lifetime.
- Mọi request qua `verifyToken` middleware kiểm Redis trước khi verify chữ ký.
- Code: [auth.middlewares.ts](Backend/src/middlewares/auth.middlewares.ts), [redis.config.ts](Backend/src/config/redis.config.ts) (TokenBlacklistService).
- Pattern: Middleware Chain + Token Revocation List + Singleton (Redis client).
- Demo: Login → call API OK (200) → Logout → call lại API → 401 TOKEN_REVOKED trong < 1s.

---

### ⭐ ASR-SEC-02 — Role-Based Access Control (2 tầng)

**Câu hỏi mẫu:** *"Phân quyền như thế nào? Có ma trận không? Sao có file `permission.middlewares.ts` mà route không dùng?"*

**Key points:**

- Hệ thống thiết kế phân quyền **hai tầng** để cân bằng giữa đơn giản hiện tại và mở rộng tương lai:
  - **Tầng đang dùng — Coarse-grained (Role-based):**
    - 4 vai trò hard-code trong enum `RoleCode` (ADMIN=1, RECEPTIONIST=2, PATIENT=3, DOCTOR=4) để có hằng số kiểu mạnh.
    - Middleware `requireRole(...allowedRoles)` ở [roleCheck.middlewares.ts](Backend/src/middlewares/roleCheck.middlewares.ts) — đọc `roleId` từ JWT đã verify, kiểm có nằm trong danh sách cho phép không, sai trả 403 `FORBIDDEN`.
    - Cách gắn: ở mỗi `*.routes.ts` dùng `router.use(verifyToken)` + `router.use(requireRole(RoleCode.X))` cho cả file, hoặc gắn từng route. Ví dụ [employee.routes.ts](Backend/src/modules/user/employee.routes.ts) chỉ Admin dùng được.
    - **Vì sao chọn tầng này hiện tại:** với 4 vai trò cố định trong phạm vi v1.0, kiểm tra vai trò đã đủ phân tách ngữ cảnh truy cập; đơn giản, dễ đọc, ít overhead query DB.
  - **Tầng dự phòng — Fine-grained (Permission-based):**
    - Mô hình quan hệ Role × Permission (bảng `Role`, `Permission`, `RolePermission`) đã sẵn ở Database layer.
    - Middleware `requirePermission(name)`, `requireAnyPermission([...])`, `requireAllPermissions([...])` ở [permission.middlewares.ts](Backend/src/middlewares/permission.middlewares.ts) đã được implement đầy đủ và unit-test.
    - **Hiện chưa được route nào gắn** — chờ kích hoạt khi nhu cầu phân quyền tinh hơn xuất hiện (thêm vai trò Pharmacist, tách quyền nội bộ trong Admin, v.v.).
- **Đường nâng cấp:** khi cần fine-grained, chỉ thay middleware ở route layer từ `requireRole(...)` sang `requirePermission(...)`. Mô hình dữ liệu không đổi, lớp nghiệp vụ không đổi.
- Ma trận vai trò ↔ chức năng: xem [BRD.md](Docs/BRD.md) §2.5 Security Matrix.
- Pattern: RBAC (Role-Based) + Middleware Chain (Chain of Responsibility) + Higher-Order Function (factory pattern cho `requireRole(...)`) + Repository Pattern (Sequelize models cho Role/Permission/RolePermission).
- Demo:
  - Login as Patient → `GET /api/employees` → 403 `FORBIDDEN`.
  - Đổi sang token Admin cùng endpoint → 200 + danh sách nhân viên.
- **Khi giảng viên hỏi "Sao thiết kế Permission table mà không dùng?":** trả lời thẳng — đây là quyết định kiến trúc "ready-but-not-active". v1.0 chỉ cần phân vai trò; mô hình Permission giữ sẵn để v2.0 (hoặc khi yêu cầu phân quyền tinh xuất hiện) kích hoạt qua một thay đổi tối thiểu ở route layer — không phải migration DB hay đổi nghiệp vụ.

---

### ⭐ ASR-SEC-03 — Patient Data Self-scope Enforcement

**Câu hỏi mẫu:** *"Bệnh nhân không xem được hồ sơ của người khác là làm sao?"*

**Key points:**
- Sau xác thực có thêm bước resolve `patientId` từ JWT vào `req.user.patientId`.
- Middleware `requireSelfPatient` ép `where: { patientId: req.user.patientId }` vào query.
- Service nhận actor và áp scope tự động cho role PATIENT.
- Code: [requireSelfPatient.middlewares.ts](Backend/src/middlewares/requireSelfPatient.middlewares.ts), [requireContext.middlewares.ts](Backend/src/middlewares/requireContext.middlewares.ts).
- Pattern: Self-scope Guard + Context Resolver + Authorization Filter.
- Demo: Login as Patient A → GET /api/appointments/{id-Patient-B} → 403 OUT_OF_SCOPE.

---

### ⭐ ASR-AVL-03 — Graceful Degradation

**Câu hỏi mẫu:** *"Nếu SMTP/Redis lỗi thì hệ thống có chết không?"*

**Key points:**
- Adapter ngoài bao bọc try/catch + log + fallback.
- Email/OTP: retry, fail nhẹ — nghiệp vụ chính vẫn chạy.
- Cache miss: đi thẳng DB.
- Redis blacklist down: rơi về in-memory tạm với cảnh báo cho admin.
- Lõi nghiệp vụ (đặt lịch, khám, kê đơn, thanh toán) không phụ thuộc cứng vào phụ trợ.
- Code: [email.service.ts](Backend/src/services/email.service.ts), [redis.config.ts](Backend/src/config/redis.config.ts) (error handlers).
- Pattern: Bulkhead + Fallback + Retry.
- Demo: Tắt SMTP container → đặt lịch khám vẫn 201, chỉ email không gửi (log warning).

---

### ⭐ ASR-SCA-01 — Stateless API Tier + Externalized Shared State

**Câu hỏi mẫu:** *"Hệ thống scale ngang được không? Bằng cách nào?"*

**Key points:**
- Tầng API hoàn toàn stateless — không lưu session in-memory.
- Phiên dùng JWT stateless.
- Trạng thái dùng chung (token blacklist, OTP, rate limit counter, cache) đặt trên Redis.
- Scheduler: chạy leader để tránh trùng job (hiện tại còn aspirational, xem SAD 9.1).
- `app.set('trust proxy', 1)` để rate limit hoạt động đúng sau reverse proxy.
- Code: [app.ts](Backend/src/app.ts), [redis.config.ts](Backend/src/config/redis.config.ts).
- Pattern: Stateless Service + Externalized State.
- Demo: Restart backend container → user vẫn login được, không phải đăng nhập lại (vì JWT stateless và blacklist trên Redis dùng chung).
- **Trung thực với giảng viên:** Hiện tại 1 instance đã OK. Khi scale ≥ 2, cần thêm `ENABLE_SCHEDULER` flag và `rate-limit-redis` (đã ghi trong SAD section 9 Known Limitations).

---

## 3. Module ↔ ASR Cross-reference

Khi giảng viên hỏi "Module X có yêu cầu chất lượng nào?", tra ngược ở đây:

| Module | ASR liên quan | Quality Attributes chính |
| --- | --- | --- |
| **Authentication** | ASR-SEC-01, ASR-SEC-04, ASR-SEC-05, ASR-MOD-02 | Security, Modifiability |
| **Authorization (cross-cutting)** | ASR-SEC-02, ASR-SEC-03, ASR-USA-02 | Security, Usability |
| **User & Employee** | ASR-SEC-02, ASR-DI-04 (audit) | Security, Data Integrity |
| **Patient** | ASR-SEC-03, ASR-DI-04 | Security, Data Integrity |
| **Doctor & Specialty** | ASR-MAN-02 (cấu hình specialty) | Manageability |
| **Appointment & Visit** | **ASR-DI-01** ⭐, ASR-DI-03, ASR-AVL-01 (no-show job), ASR-DI-04 | Data Integrity, Availability |
| **Prescription** | **ASR-DI-02** ⭐ (biên transaction kê đơn + xuất kho), ASR-DI-04 | Data Integrity |
| **Inventory** | ASR-DI-02 (tồn kho bị trừ khi kê đơn), ASR-AVL-01 (expiry check) | Data Integrity, Availability |
| **Finance (Invoice / Payment / Refund / Payroll)** | **ASR-DI-02** ⭐ (biên transaction tạo hóa đơn từ snapshot đơn thuốc), ASR-DI-03, ASR-DI-04 | Data Integrity |
| **Shift & Attendance** | ASR-AVL-01 (cron schedule), ASR-DI-03 | Availability, Data Integrity |
| **Notification** | ASR-AVL-03 (SMTP fail), ASR-MOD-03 | Availability, Modifiability |
| **Admin (Audit / Report / Settings / Maintenance)** | ASR-MAN-01, ASR-MAN-02, ASR-MAN-03, ASR-DI-04, ASR-AVL-02 | Manageability, Data Integrity |
| **API layer (cross-cutting middleware)** | ASR-SEC-04, ASR-PERF-01, ASR-PERF-02, ASR-USA-01 | Security, Performance, Usability |
| **Database layer** | ASR-PERF-01, ASR-SCA-02 | Performance, Scalability |
| **Frontend** | ASR-USA-01, ASR-USA-02 | Usability |

---

## 4. Design Pattern Index

Khi giảng viên hỏi "Code này dùng pattern gì?", tra ở đây:

| Pattern | Áp dụng ở đâu | ASR phục vụ |
| --- | --- | --- |
| **Middleware Chain (Chain of Responsibility)** | Toàn bộ `app.ts` middleware pipeline | ASR-SEC-01..04, PERF-02, AVL-02, USA-01 |
| **Adapter Pattern** | Passport strategies (Google OAuth) | ASR-MOD-02 |
| **State Machine** | `utils/stateMachine.ts` (Appointment/Visit/Invoice) | ASR-DI-03 |
| **Transaction Script** | Service methods nghiệp vụ chính (booking, invoice) | ASR-DI-01, ASR-DI-02 |
| **Pessimistic Locking** | `appointment.service.ts` (`lock: t.LOCK.UPDATE`) | ASR-DI-01 |
| **Conditional Update** | `medicine.service.ts` (`UPDATE ... WHERE stock >= ?`) | ASR-DI-02 |
| **Repository Pattern** | Sequelize models = repositories | Cross-cutting |
| **DTO** | Service input interfaces, response schema | ASR-USA-01 |
| **Observer / Event Emitter** | `events/appointmentEvents.ts` + Notification listeners | ASR-MOD-03 |
| **Singleton** | Redis client, Sequelize instance | ASR-SEC-01, SCA-01 |
| **Facade** | Service layer wrap nhiều model query | ASR-MOD-01 |
| **Strategy** | PaymentMethod xử lý, Excel vs PDF report | ASR-USA-01, MAN-03 |
| **Decorator** | Audit middleware wrap controllers, validator chains | ASR-DI-04 |
| **Cache-Aside** | `cache.middlewares.ts`, SystemSettings wrapper | ASR-PERF-01, MAN-02 |
| **Rate Limiting / Throttling** | `express-rate-limit` ở `/api` | ASR-PERF-02 |
| **Token Revocation List** | Redis blacklist | ASR-SEC-01 |
| **Self-scope Guard** | `requireSelfPatient` middleware | ASR-SEC-03 |
| **RBAC (Role-Based)** | `requireRole(...)` middleware (đang dùng); `requirePermission(...)` (sẵn sàng kích hoạt) | ASR-SEC-02 |
| **Higher-Order Function (factory)** | `requireRole(RoleCode.ADMIN)` trả về middleware tùy biến theo vai trò | ASR-SEC-02 |
| **Bulkhead / Fallback / Retry** | Email service, Redis error handling | ASR-AVL-03 |
| **Scheduler** | `node-cron` trong `jobs/scheduler.ts` | ASR-AVL-01 |
| **Feature Toggle** | Maintenance mode flag | ASR-AVL-02 |
| **Layered Architecture** | route → controller → service → model | ASR-MOD-01 |
| **Package-by-Feature** | `src/modules/{domain}/` structure | ASR-MOD-01 |
| **Configuration Externalization** | env vars + env.validation | ASR-SEC-05 |
| **Global Error Handler** | `errorHandler.middlewares.ts` | ASR-USA-01 |

---

## 5. Code File Index

Khi giảng viên nói "Mở file [X] ra", biết ngay đường dẫn:

### Cross-cutting Middleware (quan trọng nhất)

| File | Mục đích | ASR phục vụ |
| --- | --- | --- |
| [Backend/src/app.ts](Backend/src/app.ts) | Application bootstrap, middleware pipeline | ASR-SEC-04, PERF-02, SCA-01 |
| [Backend/src/middlewares/auth.middlewares.ts](Backend/src/middlewares/auth.middlewares.ts) | `verifyToken` — JWT + blacklist check | ASR-SEC-01 |
| [Backend/src/middlewares/roleCheck.middlewares.ts](Backend/src/middlewares/roleCheck.middlewares.ts) | `requireRole(...allowedRoles)` — tầng phân quyền *đang được dùng* ở mọi route nghiệp vụ | ASR-SEC-02 |
| [Backend/src/middlewares/permission.middlewares.ts](Backend/src/middlewares/permission.middlewares.ts) | `requirePermission`, `requireAnyPermission`, `requireAllPermissions` — tầng fine-grained *sẵn sàng kích hoạt* khi cần phân quyền tinh hơn (chưa gắn ở route nào) | ASR-SEC-02 |
| [Backend/src/middlewares/requireSelfPatient.middlewares.ts](Backend/src/middlewares/requireSelfPatient.middlewares.ts) | Self-scope guard cho Patient | ASR-SEC-03 |
| [Backend/src/middlewares/requireContext.middlewares.ts](Backend/src/middlewares/requireContext.middlewares.ts) | Gắn patientId/doctorId vào req | ASR-SEC-03 |
| [Backend/src/middlewares/sanitize.middlewares.ts](Backend/src/middlewares/sanitize.middlewares.ts) | HTML sanitization với dompurify | ASR-SEC-04 |
| [Backend/src/middlewares/rateLimit.middlewares.ts](Backend/src/middlewares/rateLimit.middlewares.ts) | Rate limit cho endpoint nhạy cảm | ASR-PERF-02 |
| [Backend/src/middlewares/cache.middlewares.ts](Backend/src/middlewares/cache.middlewares.ts) | Cache GET in-process | ASR-PERF-01 |
| [Backend/src/middlewares/auditLog.middlewares.ts](Backend/src/middlewares/auditLog.middlewares.ts) | Audit Create/Update/Delete/View/Export | ASR-DI-04 |
| [Backend/src/middlewares/maintenance.middlewares.ts](Backend/src/middlewares/maintenance.middlewares.ts) | `checkMaintenance` | ASR-AVL-02 |
| [Backend/src/middlewares/errorHandler.middlewares.ts](Backend/src/middlewares/errorHandler.middlewares.ts) | Global error handler | ASR-USA-01 |

### Utilities & Config

| File | Mục đích | ASR phục vụ |
| --- | --- | --- |
| [Backend/src/utils/stateMachine.ts](Backend/src/utils/stateMachine.ts) | AppointmentStateMachine, VisitStateMachine | ASR-DI-03 |
| [Backend/src/utils/codeGenerator.ts](Backend/src/utils/codeGenerator.ts) | generateAppointmentCode, generateInvoiceCode | ASR-DI-01, DI-02 |
| [Backend/src/utils/jwt.ts](Backend/src/utils/jwt.ts) | JWT helper functions | ASR-SEC-01 |
| [Backend/src/utils/password.ts](Backend/src/utils/password.ts) | bcrypt wrapper | ASR-SEC-05 |
| [Backend/src/config/redis.config.ts](Backend/src/config/redis.config.ts) | Redis client + TokenBlacklistService | ASR-SEC-01, SCA-01 |
| [Backend/src/config/oauth.config.ts](Backend/src/config/oauth.config.ts) | Passport setup cho Google OAuth | ASR-MOD-02 |
| [Backend/src/config/env.validation.ts](Backend/src/config/env.validation.ts) | Validate biến môi trường khi khởi động | ASR-SEC-05 |
| [Backend/src/config/booking.config.ts](Backend/src/config/booking.config.ts) | Default slots/ca, etc. | ASR-MAN-02 |

### Domain modules (chỉ liệt kê file CỐT LÕI)

| Module | File quan trọng | ASR phục vụ |
| --- | --- | --- |
| Authentication | [auth.controller.ts](Backend/src/modules/auth/auth.controller.ts), [oauth.controller.ts](Backend/src/modules/auth/oauth.controller.ts), [otp.service.ts](Backend/src/modules/auth/otp.service.ts) | ASR-SEC-01, SEC-05, MOD-02 |
| Appointment | [appointment.service.ts](Backend/src/modules/appointment/appointment.service.ts) ⭐ | ASR-DI-01, DI-03 |
| Finance | [invoice.service.ts](Backend/src/modules/finance/invoice.service.ts) ⭐ | ASR-DI-02 |
| Inventory | [medicine.service.ts](Backend/src/modules/inventory/medicine.service.ts) | ASR-DI-02 |
| Notification | [notification.service.ts](Backend/src/modules/notification/notification.service.ts), [events/appointmentEvents.ts](Backend/src/events/appointmentEvents.ts) | ASR-MOD-03, AVL-03 |
| Admin | [auditLog.service.ts](Backend/src/modules/admin/auditLog.service.ts), [system.controller.ts](Backend/src/modules/admin/system.controller.ts), [report*.service.ts](Backend/src/modules/admin/) | ASR-MAN-01, MAN-02, MAN-03, AVL-02 |

### Jobs (Cron-based background tasks)

| File | Mục đích | ASR phục vụ |
| --- | --- | --- |
| [Backend/src/jobs/scheduler.ts](Backend/src/jobs/scheduler.ts) | Khởi tạo cron jobs | ASR-AVL-01 |
| [Backend/src/jobs/autoNoShow.job.ts](Backend/src/jobs/autoNoShow.job.ts) | Đánh dấu no-show mỗi 30 phút | ASR-AVL-01, DI-03 |
| [Backend/src/jobs/attendance.job.ts](Backend/src/jobs/attendance.job.ts) | Tổng hợp chấm công | ASR-AVL-01 |
| [Backend/src/jobs/medicineExpiryCheck.ts](Backend/src/jobs/medicineExpiryCheck.ts) | Cảnh báo thuốc hết hạn | ASR-AVL-01 |
| [Backend/src/jobs/scheduleGenerationCron.ts](Backend/src/jobs/scheduleGenerationCron.ts) | Sinh lịch trực tuần kế tiếp | ASR-AVL-01 |

### Frontend (phân vùng theo vai trò)

| Folder | Mục đích |
| --- | --- |
| [Frontend/src/pages/admin/](Frontend/src/pages/admin/) | Trang dành cho Admin |
| [Frontend/src/pages/doctor/](Frontend/src/pages/doctor/) | Trang dành cho Doctor |
| [Frontend/src/pages/recep/](Frontend/src/pages/recep/) | Trang dành cho Receptionist |
| [Frontend/src/pages/patient/](Frontend/src/pages/patient/) | Trang dành cho Patient |
| [Frontend/src/features/](Frontend/src/features/) | Components nghiệp vụ theo domain |

---

## Tips cho buổi kiểm tra

### Trước buổi kiểm tra

1. **In file này ra hoặc mở sẵn trên màn hình thứ 2** — đừng mở khi giảng viên đến hỏi.
2. **Học thuộc 7 Quick Reference ở Section 2** — đây là 7 ASR có khả năng bị hỏi sâu nhất.
3. **Mở sẵn 3 file code quan trọng nhất** trong VS Code tab:
   - `appointment.service.ts` (ASR-DI-01)
   - `invoice.service.ts` (ASR-DI-02)
   - `auth.middlewares.ts` (ASR-SEC-01)
4. **Backend phải đang chạy** với data demo seed sẵn.

### Trong buổi kiểm tra

- Khi giảng viên hỏi 1 ASR, **luôn dẫn theo thứ tự**: ASR → SRS UC → ADD → SAD → Code → Pattern → Demo. Đừng nhảy thẳng vào code.
- Mỗi quyết định kiến trúc đều phải có **lý do** + **trade-off**.
- Đừng nói "vì framework có sẵn" — nói "vì pattern X giải quyết vấn đề Y trong ASR Z".
- Nếu không nhớ tên file, mở [TraceabilityMatrix.md](Docs/TraceabilityMatrix.md) Section 5 (Code File Index) ra tra.

### Khi bí

- Nói "*Em sẽ tra trong tài liệu Traceability Matrix em đã chuẩn bị*" — đây là điểm cộng (cho thấy bạn có chuẩn bị tài liệu).
- Mở file này ra, tìm ASR đang hỏi → có sẵn câu trả lời.

---

*Cuối tài liệu Traceability Matrix.*
