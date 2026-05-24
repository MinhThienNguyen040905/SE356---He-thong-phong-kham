# Q&A Cheatsheet — Câu hỏi giảng viên hay hỏi + Trả lời mẫu

> File này tổng hợp các câu giảng viên thường hỏi khi defense ASR-DI-02, kèm câu trả lời gọn.

---

## Nhóm 1 — Về ASR và ý nghĩa kiến trúc

### Q1.1 — "Vì sao đây là ASR mà không phải yêu cầu nghiệp vụ thông thường?"

> "Vì 3 lý do:
> 1. **Xuyên 4 module và 8 bảng** — không gói gọn trong 1 module.
> 2. **Bỏ yêu cầu này thì kiến trúc phải khác hẳn** — em sẽ phải dùng Saga hoặc eventual consistency, phức tạp gấp 10 lần.
> 3. **Buộc dùng tactic cụ thể** — row-level lock, sinh mã trong transaction, snapshot pattern. Không thể tránh được."

### Q1.2 — "Tính nguyên tử nghĩa là gì? Đây là từ khó hiểu."

> "**Tính nguyên tử (Atomicity)** là chữ A trong ACID — đặc trưng database transaction.
>
> Ý nghĩa **all-or-nothing**: một chuỗi thao tác hoặc commit toàn bộ, hoặc rollback toàn bộ. Không tồn tại trạng thái thực thi dở dang.
>
> Ví dụ: kê đơn = trừ kho + ghi prescription + ghi xuất kho. Nếu giữa chừng lỗi → **cả 3 thao tác đều bị xóa sạch**, DB trở về y nguyên."

### Q1.3 — "Sao không dùng NoSQL như MongoDB?"

> "MongoDB phiên bản cũ (trước 4.0) không hỗ trợ multi-document transaction → không đảm bảo nguyên tử xuyên collection.
>
> MongoDB 4.0+ có hỗ trợ, nhưng:
> - **Hiệu năng**: transaction giảm throughput 2-5 lần so với commit từng document.
> - **Mô hình quan hệ**: dữ liệu phòng khám có nhiều quan hệ N-N (Prescription ↔ Medicine, Role ↔ Permission), foreign key + JOIN của SQL tự nhiên hơn nhiều.
> - **Ràng buộc**: SQL có foreign key + UNIQUE + CHECK ở DB layer, MongoDB phải validate ở app.
>
> Với bài toán 1 phòng khám, MySQL là lựa chọn đơn giản và mạnh nhất."

---

## Nhóm 2 — Về kiến trúc 2 biên transaction

### Q2.1 — "Sao chia 2 biên thay vì gom 1 transaction lớn?"

> "Vì 4 lý do:
> 1. **Hai actor khác nhau** — bác sĩ kê đơn, lễ tân tính tiền. Gom 1 biên vi phạm phân vai trò.
> 2. **Hai thời điểm khác nhau** — bệnh nhân kê đơn xong, đi xét nghiệm rồi mới quay lại quầy thanh toán.
> 3. **Tồn kho phải được trừ sớm** — bác sĩ vừa kê là kho phải trừ ngay để bác sĩ B không kê được cùng thuốc lúc cuối kho.
> 4. **Snapshot cô lập giá** — Memento Pattern đảm bảo hóa đơn không đổi theo giá Medicine."

### Q2.2 — "Nếu bệnh nhân kê đơn xong không quay lại lấy thuốc thì sao? Kho đã trừ rồi đó."

> "Đây là trade-off có chủ đích. Em ưu tiên **không over-commit kho** hơn là tiết kiệm vài viên khi bệnh nhân bỏ về.
>
> Có 3 cơ chế xử lý hủy:
> - **`cancelPrescription`** — phục hồi tồn kho nguyên tử trong 1 transaction.
> - **`lockPrescription`** — sau khi tạo hóa đơn, đơn được khóa, không hủy được nữa.
> - **`updatePrescription`** — sửa đơn cũng nguyên tử: phục hồi kho cũ + trừ kho mới.
>
> Có một edge case là *silent abandonment* — bệnh nhân bỏ về im lặng. Hiện chưa có cron auto-cancel, đây là **known limitation** có thể bổ sung bằng job định kỳ rà đơn DRAFT quá X giờ → tự đánh dấu CANCELLED và phục hồi kho."

### Q2.3 — "Nếu biên (b) chạy mà phát hiện đơn thuốc cần sửa thì sao?"

> "Có hàm `updatePrescription` xử lý — chạy trong 1 transaction:
> 1. Đọc PrescriptionDetail cũ → cộng kho cho từng thuốc cũ
> 2. Xóa PrescriptionDetail cũ + MedicineExport cũ
> 3. Xóa InvoiceItem MEDICINE cũ (nếu đã có invoice)
> 4. Trừ kho mới + tạo PrescriptionDetail mới + MedicineExport mới
> 5. Tạo InvoiceItem mới
>
> Tất cả nguyên tử. Nếu fail giữa chừng, kho và hóa đơn quay về trạng thái trước update."

---

## Nhóm 3 — Về Design Pattern (GoF)

### Q3.1 — "Em dùng design pattern nào?"

> "Em dùng **3 GoF Behavioral Pattern** trong file này:
> 1. **Template Method** — sequelize.transaction(callback) cung cấp khung BEGIN-COMMIT-ROLLBACK.
> 2. **State Pattern** — AppointmentStateMachine + VisitStateMachine tập trung quy tắc chuyển trạng thái.
> 3. **Memento Pattern** — PrescriptionDetail lưu snapshot giá thuốc tại thời điểm kê.
>
> Ngoài ra còn dùng Enterprise Pattern (Fowler PoEAA) như Transaction Script, Service Layer, Unit of Work; và Concurrency Pattern như Pessimistic Locking — nếu thầy/cô muốn em nói thêm."

### Q3.2 — "Em dùng GoF State Pattern, nhưng GoF dùng inheritance, code em dùng bảng tra cứu — sao gọi là cùng pattern?"

> "GoF gốc dùng inheritance vì C++/Java 1994 chưa có first-class function. **Mục đích cốt lõi** của State Pattern là tách quy tắc chuyển trạng thái khỏi nghiệp vụ và gom vào một chỗ tập trung.
>
> Em dùng `Record<status, status[]>` (lookup table) cùng `validateTransition` — đạt đúng mục đích đó với code gọn hơn. Đây gọi là *table-driven state machine* — biến thể được Martin Fowler và Robert C. Martin công nhận là State Pattern."

### Q3.3 — "Memento Pattern gốc dùng cho Undo, code em không có Undo — sao gọi là Memento?"

> "GoF Memento gốc lưu state trong **memory** cho mục đích Undo. Em áp dụng **tinh thần** đó ở mức persistence — snapshot lưu vào DB (PrescriptionDetail) thay vì memory.
>
> Đây là biến thể *persistent memento* — phổ biến trong hệ thống nghiệp vụ cần audit trail hoặc historical pricing. Bản chất 3 vai trò Originator / Memento / Caretaker vẫn giữ nguyên."

### Q3.4 — "Tại sao file này có 2 chỗ dùng State Pattern (Appointment + Visit), không gom 1 chỗ được sao?"

> "Vì 2 thực thể có vòng đời hoàn toàn khác nhau và phục vụ 2 góc nhìn nghiệp vụ khác nhau:
> - **Appointment** = 'hàng đợi lễ tân' (góc nhìn front-office)
> - **Visit** = 'hồ sơ bệnh án bác sĩ' (góc nhìn clinical)
>
> Gom 1 chỗ vi phạm Single Responsibility Principle. Tách 2 state machine cho phép từng vòng đời tiến hóa độc lập."

### Q3.5 — "Snapshot Pattern và Memento Pattern khác nhau như thế nào?"

> "Trong DB literature, *Snapshot Pattern* và *Memento Pattern* về cơ bản là cùng ý tưởng. Snapshot là cách gọi thân thiện hơn trong ngữ cảnh DB; Memento là tên formal của GoF.
>
> Em chọn gọi Memento vì giảng viên trong môn Software Architecture quen với từ vựng GoF hơn."

### Q3.6 — "Sao không dùng inheritance để mỗi state là 1 class riêng cho đúng GoF?"

> "Đó là *State Pattern dạng cổ điển*. Với 5-6 trạng thái đơn giản, code mỗi state 1 class rất verbose — phải tạo 12 file. Lookup table 5 dòng đạt cùng mục đích.
>
> Khi nào em chọn inheritance? Khi mỗi state có **hành vi phức tạp riêng** (ví dụ state EXAMINING phải tính BMI, state COMPLETED phải gửi notification, ...). Trong code em, mỗi state chỉ là một marker — lookup table đủ rồi."

---

## Nhóm 4 — Về code chi tiết

### Q4.1 — "Sao lock Medicine mà không lock Appointment?"

> "Em lock **cả hai**, chỉ trong tình huống khác nhau:
> - Lock **Appointment** ở dòng ~75 — chống race condition giữa bác sĩ kê đơn và lễ tân hủy lịch đồng thời.
> - Lock **Medicine** ở dòng ~127 (trong vòng for) — chống tồn kho âm khi 2 bác sĩ kê cùng thuốc đồng thời."

### Q4.2 — "Visit cho kê đơn cả ở COMPLETED? Sao không chỉ EXAMINING?"

> "Đây là **nới lỏng có chủ đích** vì UX:
> - Bác sĩ có thể bấm 'Hoàn tất' trước khi nhớ ra cần kê thêm thuốc. Chặn cứng EXAMINING sẽ buộc bác sĩ 'lùi trạng thái' — không khả thi.
>
> Tuy nhiên vẫn có **chốt chặn nghiệp vụ**: Appointment vẫn phải ở IN_PROGRESS. Nếu Appointment đã COMPLETED → throw `APPOINTMENT_NOT_IN_PROGRESS`. Hai state machine phối hợp với nhau."

### Q4.3 — "Auto-advance CHECKED_IN → IN_PROGRESS có đi qua state machine không?"

> "Có — em đã thêm `AppointmentStateMachine.validateTransition(...)` ngay trước khi sửa status (dòng ~99). Đảm bảo 100% transition đi qua state machine, không có exception."

### Q4.4 — "Sequelize transaction có gì khác `BEGIN/COMMIT` thuần?"

> "Sequelize wrap `BEGIN/COMMIT/ROLLBACK` thành callback API — đây là **Template Method Pattern**. Em không bao giờ tự viết commit/rollback → không bao giờ quên dọn transaction. Ngoài ra Sequelize tự handle **nested transaction (savepoint)** nếu cần."

### Q4.5 — "Mức cô lập READ COMMITTED có đủ không? Sao không SERIALIZABLE?"

> "READ COMMITTED là mặc định của MySQL InnoDB — đủ cho 99% case nghiệp vụ.
>
> SERIALIZABLE chặt hơn nhưng:
> - Giảm throughput đáng kể (lock nhiều hơn)
> - Tăng deadlock
>
> Cho ASR-DI-02, em đã dùng **pessimistic lock trực tiếp** (`FOR UPDATE`) trên Medicine — đảm bảo isolation mạnh ở chỗ cần thiết mà không phải nâng level toàn transaction. Đây là cách tối ưu."

---

## Nhóm 5 — Về SAD và tổng thể

### Q5.1 — "Nếu hệ thống mở rộng thành chuỗi 50 phòng khám thì sao?"

> "Lúc đó kiến trúc sẽ phải đổi đáng kể:
> - **Hoặc**: 1 cụm DB cloud lớn + sharding theo phòng khám (vẫn ACID).
> - **Hoặc**: tách thành microservice + Saga Pattern.
> - **Hoặc**: event-driven cho các tính năng không cần real-time (báo cáo tổng hợp).
>
> SAD §9 Known Limitations có ghi rõ v1.0 chỉ hỗ trợ single-clinic. Bỏ ràng buộc này → kiến trúc phải làm lại nhiều."

### Q5.2 — "Audit log cho ASR-DI-02 ở đâu?"

> "Audit log được handle bởi **middleware `auditCreate/Update/Delete`** trong [auditLog.middlewares.ts](../../Backend/src/middlewares/auditLog.middlewares.ts). Khi prescription/invoice/payment được tạo, middleware tự ghi log bất đồng bộ — không block transaction chính. Đây là ASR-DI-04 phối hợp với ASR-DI-02."

### Q5.3 — "Hoàn tiền (Refund) có đảm bảo nguyên tử không?"

> "Có — `processRefund` trong [invoice.service.ts](../../Backend/src/modules/finance/invoice.service.ts) chạy trong transaction:
> 1. Tạo Refund record
> 2. Cập nhật Invoice.paymentStatus
> 3. Nếu refund cho đơn thuốc → phục hồi tồn kho
>
> Tất cả nguyên tử. Nếu một bước fail, toàn bộ rollback."

---

## Nhóm 6 — Câu hỏi "bẫy"

### Q6.1 — "Em có chắc transaction trong code thực sự rollback không? Có test không?"

> "Em đã chuẩn bị **demo trực tiếp** chứng minh — kê 50 viên Augmentin (chỉ có 8 trong kho) → throw `INSUFFICIENT_STOCK`. Sau đó em chạy SQL ngay → DB không đổi gì. Đây là chứng cứ trực quan rằng transaction thực sự rollback."

### Q6.2 — "Em vừa nói có Memento Pattern, vậy nếu admin xóa cứng Medicine khỏi DB thì hóa đơn cũ có gãy không?"

> "Không gãy. PrescriptionDetail và InvoiceItem giữ **snapshot** đầy đủ (medicineName, unit, unitPrice). Foreign key `medicineId` chỉ để truy vết cho thống kê. Nếu xóa cứng Medicine, hóa đơn vẫn in được vì tất cả thông tin cần đã có trong snapshot. Đây là **lợi ích phụ** của Memento Pattern — *cô lập với vòng đời Originator*."

### Q6.3 — "Sao file `permission.middlewares.ts` có sẵn mà không dùng?"

> "Đây là quyết định kiến trúc 'ready-but-not-active'. Hệ thống thiết kế phân quyền **hai tầng**:
> - **Tầng đang dùng** — `requireRole(...)` (coarse-grained, phù hợp v1.0 vì chỉ có 4 vai trò cố định).
> - **Tầng dự phòng** — `requirePermission(...)` (fine-grained, dùng khi cần phân quyền tinh hơn — ví dụ thêm vai trò Pharmacist).
>
> Mô hình Role × Permission ở DB đã sẵn. Khi cần fine-grained, chỉ thay middleware ở route — không phải đổi nghiệp vụ."

### Q6.4 — "ASR-DI-02 này phụ thuộc vào ASR nào khác?"

> "Phụ thuộc 3 ASR khác:
> - **ASR-DI-01** (Concurrent Booking) — vì biên (a) cần lock Appointment.
> - **ASR-DI-03** (State Machine) — biên (a) và (b) đều dùng state machine.
> - **ASR-DI-04** (Audit Log) — middleware audit chạy sau transaction.
>
> Đây là ví dụ ASR không độc lập với nhau — chúng phối hợp tạo nên Data Integrity tổng thể."

---

## Tip cuối — Khi không biết câu trả lời

Nếu giảng viên hỏi câu **bạn không chắc**, ưu tiên 3 chiến lược:

1. **Thừa nhận trung thực + chuyển hướng** (an toàn nhất):
   > "Dạ chỗ này em chưa nghiên cứu sâu, nhưng em hiểu nguyên tắc cốt lõi là [X]. Có thể đây là [Y]. Em sẽ tra cứu lại sau buổi học."

2. **Mở tài liệu của mình ra tra cứu** (cho thấy có chuẩn bị):
   > "Dạ em sẽ tra trong tài liệu Traceability Matrix em đã chuẩn bị..."
   > (mở file `Docs/ASR-DI-02/06_QA_cheatsheet.md` — chính file này!)

3. **Quay về câu nói gốc về ASR** (an toàn nếu lạc đề):
   > "Em quay lại điểm cốt lõi: ASR-DI-02 đòi hỏi tính nguyên tử xuyên 4 module. Em đảm bảo điều này bằng 2 biên transaction với row-level lock và snapshot pattern. Mọi quyết định kỹ thuật trong code đều phục vụ mục tiêu đó."

---

## Tóm tắt khi vừa bắt đầu defense

Nếu giảng viên chỉ hỏi 1 câu mở đầu rồi để bạn nói tự do, hãy nói **đoạn 60 giây** sau:

> "Em chọn ASR-DI-02 — Tính nguyên tử của giao dịch tài chính. Đây là 1 trong 7 ASR Very High của hệ thống vì xuyên 4 module và 8 bảng. Em chia luồng thành **hai biên transaction tách biệt** — biên (a) bác sĩ kê đơn + xuất kho, biên (b) lễ tân tạo hóa đơn từ snapshot. Hai biên nối với nhau qua **Memento Pattern** ở PrescriptionDetail.
>
> Em dùng 3 GoF Behavioral Pattern: Template Method qua sequelize.transaction(callback), State Pattern qua hai state machine của Appointment và Visit, và Memento Pattern cô lập giá thuốc.
>
> Em có thể demo cú chốt mạnh nhất: kê đơn vượt tồn kho → API throw → kiểm DB → **không có dòng nào thay đổi**. Đó là Atomicity của ACID hoạt động."

→ Sau đó giảng viên sẽ chọn điểm muốn đào sâu. Cứ bình tĩnh trả lời từng câu theo các file 01-05.

Chúc bạn defense thành công! 🎯
