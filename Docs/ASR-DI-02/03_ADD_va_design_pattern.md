# Bước 5-6: ADD — Tactic + Design Pattern + SAD

## Bối cảnh

> *"Tactic em chọn là gì? Có dùng design pattern nào không?"*

→ Mở [ADD.md](../ADD.md) §2.3.2 và §3.5.2 (sequence diagram).

---

## Tactic chính — Hai biên transaction tách biệt

> "Em chia luồng nguyên tử thành **2 biên transaction tách biệt theo trách nhiệm nghiệp vụ** — không gom làm 1 biên duy nhất."

### Biên (a) — Prescription transaction

| Yếu tố | Chi tiết |
|---|---|
| **Ai kích hoạt** | Bác sĩ |
| **Khi nào** | Sau khi khám xong, kê thuốc |
| **Bảng động vào** | Prescription, PrescriptionDetail, Medicine (trừ kho), MedicineExport, Visit, Appointment |
| **Tactic** | Transaction READ COMMITTED + Pessimistic Lock trên Medicine + State Pattern cho transitions |

### Biên (b) — Invoice transaction

| Yếu tố | Chi tiết |
|---|---|
| **Ai kích hoạt** | Lễ tân (hoặc tự động khi bác sĩ complete visit) |
| **Khi nào** | Sau khi đơn thuốc đã chốt |
| **Bảng động vào** | Invoice, InvoiceItem |
| **Tactic** | Transaction + Idempotency check + đọc Snapshot từ PrescriptionDetail (không lock kho) |

### Tại sao chia 2 biên thay vì gom 1?

> "Có 4 lý do:
>
> 1. **Hai actor khác nhau** — bác sĩ kê đơn, lễ tân tính tiền. Gom 1 biên → bác sĩ phải biết phí khám, hoặc lễ tân phải biết kê đơn → vi phạm phân vai trò.
>
> 2. **Hai thời điểm khác nhau** — bệnh nhân có thể được kê đơn xong, đi xét nghiệm, rồi mới quay lại quầy thanh toán. Đơn thuốc đã chốt nhưng hóa đơn chưa tạo.
>
> 3. **Tồn kho phải được trừ sớm** — bác sĩ vừa kê xong là kho phải trừ ngay để bác sĩ B không kê được cùng thuốc lúc cuối kho.
>
> 4. **Snapshot cô lập giá** — nếu admin đổi giá thuốc giữa lúc kê và lúc tính tiền, hóa đơn vẫn dùng giá tại thời điểm kê (snapshot ở PrescriptionDetail)."

---

## Alternative đã cân nhắc và từ chối

| Alternative | Vì sao từ chối |
|---|---|
| **Một transaction lớn ôm cả 6 bảng + sinh hóa đơn luôn** | Vi phạm phân vai trò (lễ tân ≠ bác sĩ); bác sĩ không biết phí khám |
| **Saga Pattern (microservice + compensation)** | Phức tạp gấp 10 lần; phù hợp Amazon/Uber chứ không cho 1 phòng khám có 1 DB |
| **Eventual Consistency (event-driven)** | Tồn kho lệch trong vài giây → không chấp nhận được trong y tế |
| **Optimistic Locking thay Pessimistic** | Conflict rate cao trong giờ cao điểm → optimistic phải retry nhiều → tốn hơn |

---

## 3 GoF Design Pattern đã áp dụng

> 💡 **Lưu ý**: GoF Pattern khác với Enterprise Pattern (Fowler PoEAA) khác với Concurrency Pattern. Khi giảng viên hỏi "design pattern" mà chưa rõ nhóm nào, **mở đầu bằng câu chia nhóm**:
>
> *"Dạ tùy nhóm pattern thầy/cô muốn nghe — em phân thành GoF, Enterprise và Concurrency. Trong file này em dùng cả 3 nhóm: về GoF có Template Method, State, Memento; về Enterprise có Transaction Script, Service Layer; về Concurrency có Pessimistic Locking..."*

### Pattern 1 — Template Method (GoF, Behavioral)

**Định nghĩa:** Định nghĩa khung xương của một thuật toán ở một chỗ, để callback (hoặc subclass) lấp các bước biến đổi cụ thể.

**Ẩn dụ:** Công thức nấu ăn trên hộp bột pha sẵn — hãng làm bánh đảm bảo bước 1, 3, 4, 5 đúng; bạn chỉ tự do ở bước 2 (thêm trứng/sữa).

**Áp dụng:**

```typescript
return await sequelize.transaction(
  { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
  async (t) => {
    // ← phần callback do em viết, chỉ logic nghiệp vụ
  }
);
```

- **Khung cố định (do Sequelize lo):** `BEGIN → callback → COMMIT (nếu return) / ROLLBACK (nếu throw)`
- **Phần em viết:** chỉ logic nghiệp vụ, không bao giờ tự viết commit/rollback

**Lợi ích:** Mọi service trong hệ thống đều có vòng đời transaction nhất quán, không quên commit/rollback.

### Pattern 2 — State Pattern (GoF, Behavioral)

**Định nghĩa:** Khi một object có nhiều trạng thái sống và không phải transition nào cũng hợp lệ, tách quy tắc vào một lớp riêng thay vì rải `if/else`.

**Ẩn dụ:** Đèn giao thông — Đỏ → Vàng → Xanh. Đèn không bao giờ "Đỏ thẳng sang Xanh".

**Áp dụng:**

```typescript
// State Pattern (GoF, Behavioral)
AppointmentStateMachine.validateTransition(
  AppointmentStatus.CHECKED_IN,
  AppointmentStatus.IN_PROGRESS
);
appointment.status = "IN_PROGRESS";
```

**Mapping GoF:**
| Vai trò GoF | Trong code |
|---|---|
| Context | `Appointment` / `Visit` model |
| State | Các giá trị enum (WAITING, EXAMINING, COMPLETED, ...) |
| Rules class | `AppointmentStateMachine` / `VisitStateMachine` |

**Lưu ý GoF cổ điển vs hiện đại:** GoF gốc dùng inheritance (mỗi state là 1 class). Code dùng lookup table `Record<status, status[]>` — biến thể hiện đại, được Martin Fowler/Robert C. Martin công nhận là State Pattern (table-driven state machine).

**Lợi ích:** Bug "trạng thái sai" chặn ngay tại service, throw lỗi rõ ràng `INVALID_*_STATE_TRANSITION`. Thêm trạng thái mới chỉ sửa 1 file.

### Pattern 3 — Memento Pattern (GoF, Behavioral)

**Định nghĩa:** Lưu ảnh chụp trạng thái của một object tại một thời điểm, để dùng sau này không phụ thuộc vào thay đổi của object gốc.

**Ẩn dụ:** Ctrl+Z trong Word — Word lưu snapshot của từng bước gõ, bạn vẫn tiếp tục sửa, các snapshot không bị ảnh hưởng.

**Mapping GoF:**
| Vai trò GoF | Trong code |
|---|---|
| Originator | `Medicine` (có thể đổi giá, đổi tên qua thời gian) |
| Memento | Object `{ medicineName, unit, unitPrice }` mà `createMedicineMemento()` trả về |
| Caretaker | `PrescriptionDetail` (giữ snapshot qua nhiều tháng/năm) |

**Áp dụng:**

```typescript
// Memento helper
const createMedicineMemento = (medicine: Medicine) => ({
  medicineName: medicine.name,
  unit: medicine.unit,
  unitPrice: medicine.salePrice,
});

// Lúc kê đơn, "chụp ảnh"
await PrescriptionDetail.create({
  prescriptionId: prescription.id,
  medicineId: medicine.id,
  ...createMedicineMemento(medicine),   // ← snapshot
  quantity: item.quantity,
});
```

**Kịch bản nghiệp vụ thuyết phục:**

```
01/12 — Bác sĩ A kê 10 viên Paracetamol giá 5.000đ/viên
        → PrescriptionDetail.unitPrice = 5.000đ (snapshot)

15/12 — Admin tăng giá Paracetamol lên 7.000đ/viên
        → Medicine.salePrice = 7.000đ
        (snapshot trong PrescriptionDetail KHÔNG đổi)

20/12 — Lễ tân tạo hóa đơn cho Bệnh nhân X
        → Đọc PrescriptionDetail.unitPrice = 5.000đ ✅
        (KHÔNG đọc Medicine.salePrice = 7.000đ)
```

Nếu không có Memento → bệnh nhân bị tính theo giá mới → sai về kế toán + pháp lý.

**Lưu ý GoF gốc vs persistent:** GoF gốc 1994 lưu memento trong **memory** cho mục đích Undo. Code lưu memento vào **DB** qua nhiều năm — biến thể *persistent memento* (cùng tinh thần, khác chỗ lưu).

---

## Sequence Diagram (mở SAD §4.2.4 và ADD §3.5.2)

### Biên (a) — Prescription transaction

```
Doctor → API → PrescriptionService → DB
                BEGIN TRANSACTION
                ├─ Verify Visit
                ├─ Lock Appointment, đẩy state qua AppointmentStateMachine
                ├─ Check chưa có Prescription cũ
                ├─ Sinh prescriptionCode
                ├─ INSERT Prescription header
                ├─ LOOP từng thuốc:
                │    ├─ Lock Medicine FOR UPDATE
                │    ├─ Check stock đủ
                │    ├─ UPDATE Medicine.quantity (trừ kho)
                │    ├─ INSERT PrescriptionDetail (snapshot)
                │    └─ INSERT MedicineExport
                ├─ UPDATE Prescription.totalAmount
                ├─ VisitStateMachine: chuyển sang EXAMINED
                COMMIT (hoặc ROLLBACK nếu bất kỳ bước nào throw)
```

### Biên (b) — Invoice transaction

```
Receptionist → API → FinanceService → DB
                BEGIN TRANSACTION
                ├─ Đọc Visit + Prescription + PrescriptionDetails
                ├─ Check chưa có Invoice cho visit này
                ├─ Sinh invoiceCode
                ├─ INSERT Invoice header (UNPAID)
                ├─ INSERT InvoiceItem cho phí khám
                ├─ LOOP từng PrescriptionDetail:
                │    └─ INSERT InvoiceItem (đọc snapshot, KHÔNG động kho)
                ├─ UPDATE Invoice.totalAmount
                COMMIT
```

---

## SAD view (nếu giảng viên hỏi tổng quan)

Mở [SAD.md](../SAD.md):
- **§1.1** — mục tiêu: "Đảm bảo tính nguyên tử khi tạo hóa đơn xuất thuốc"
- **§2.1** — Modular Monolith: "Tính giao dịch xuyên domain — không dùng eventual consistency"
- **§4.2.4** — section riêng *"Tạo hóa đơn + xuất thuốc (atomic transaction)"* với sequence diagram

> "SAD §4.2.4 ghi rõ đây là một trong những **module nhạy cảm nhất** của hệ thống, cùng với ASR-DI-01 (booking concurrent). Quyết định kiến trúc lớn: dùng modular monolith + 1 DB MySQL để có ACID native, thay vì microservice + Saga."

---

## Bảng tổng kết để giảng viên dễ nhớ

| Tactic / Pattern | Mức | Mục đích |
|---|---|---|
| 2 biên transaction tách biệt | Architecture | Tách trách nhiệm bác sĩ vs lễ tân |
| Template Method | GoF Behavioral | Khung transaction lifecycle |
| State Pattern | GoF Behavioral | Chặn transition không hợp lệ |
| Memento Pattern | GoF Behavioral | Snapshot giá thuốc, cô lập với thay đổi sau |
| Pessimistic Locking | Concurrency | Chống tồn kho âm dưới concurrency |
| Transaction Script | Enterprise (Fowler) | Cấu trúc logic service |
| Service Layer | Enterprise (Fowler) | Tách service khỏi controller |
| Unit of Work | Enterprise (Fowler) | Transaction object `t` |

**Tiếp theo:** sang [04_Code_walkthrough.md](04_Code_walkthrough.md) — chỉ vào code thực tế.
