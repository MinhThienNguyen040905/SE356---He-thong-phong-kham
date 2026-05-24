# Bước 3-4: SRS + Business Rules + Utility Tree

## Bối cảnh

Sau khi giải thích ASR (file 01), giảng viên sẽ yêu cầu:

> *"Cho xem use case và business rule tương ứng trong SRS đi."*

→ Mở [SRS.md](../SRS.md), tìm 2 use case: **UC15 Create Prescription** và **UC18 Create Invoice**.

---

## UC15 — Create Prescription (Biên transaction a)

### Tóm tắt nói cho giảng viên

> "UC15 là **bác sĩ kê đơn thuốc** cho bệnh nhân vừa khám xong. Đây chính là biên transaction (a) trong kiến trúc ASR-DI-02."

### Activities Flow (trình bày khi giảng viên hỏi)

```
1. Bác sĩ mở giao diện khám bệnh, chọn các thuốc + số lượng + liều
2. Hệ thống mở transaction (READ COMMITTED)
3. Verify Visit ở trạng thái EXAMINING/EXAMINED/COMPLETED
4. Lock Appointment, đẩy CHECKED_IN → IN_PROGRESS qua state machine
5. Check chưa có Prescription cho visit này (chống tạo trùng)
6. Sinh prescriptionCode trong transaction
7. INSERT Prescription header (DRAFT)
8. VÒNG LẶP cho từng thuốc:
   a. SELECT Medicine FOR UPDATE (pessimistic lock)
   b. Check medicine ACTIVE + đủ tồn kho
   c. UPDATE Medicine quantity (trừ kho)
   d. INSERT PrescriptionDetail (snapshot giá/tên/đơn vị)
   e. INSERT MedicineExport (truy vết xuất kho)
9. UPDATE Prescription.totalAmount
10. Chuyển Visit qua state machine sang EXAMINED
11. COMMIT (hoặc ROLLBACK nếu bất cứ bước nào fail)
```

### Business Rules chính

| BR | Nội dung |
|---|---|
| BR-PR-01 | Chỉ Doctor sở hữu visit mới được kê đơn (`visit.doctorId === requesterDoctorId`). Sai → throw `UNAUTHORIZED_VISIT` |
| BR-PR-02 | Visit phải ở trạng thái EXAMINING, EXAMINED, hoặc COMPLETED. Nếu WAITING/CANCELLED → throw `VISIT_NOT_EXAMINED` |
| BR-PR-03 | Appointment phải ở IN_PROGRESS (hoặc CHECKED_IN sẽ tự đẩy lên IN_PROGRESS). Khác → throw `APPOINTMENT_NOT_IN_PROGRESS` |
| BR-PR-04 | Mỗi visit chỉ có 1 prescription. Đã tồn tại → throw `PRESCRIPTION_ALREADY_EXISTS` |
| BR-PR-05 | Thuốc phải ACTIVE. Khác → throw `MEDICINE_NOT_ACTIVE_{name}` |
| BR-PR-06 | Số lượng kê ≤ tồn kho hiện tại. Vượt → throw `INSUFFICIENT_STOCK_{name}_Available:X_Requested:Y` |
| BR-PR-07 | Mọi transition của Visit/Appointment phải đi qua state machine. Transition không hợp lệ → throw `INVALID_*_STATE_TRANSITION` |

---

## UC18 — Create Invoice (Biên transaction b)

### Tóm tắt nói cho giảng viên

> "UC18 là **lễ tân tạo hóa đơn** cho lượt khám đã hoàn tất. Đây là biên transaction (b) — đọc snapshot từ đơn thuốc đã chốt ở biên (a), không động vào kho nữa."

### Activities Flow

```
1. Lễ tân chọn visit cần xuất hóa đơn
2. Hệ thống mở transaction (mới, độc lập với biên a)
3. Đọc Visit + Prescription + PrescriptionDetails
4. Check chưa có Invoice cho visit này (chống tạo trùng)
5. Sinh invoiceCode trong transaction
6. INSERT Invoice header (UNPAID, totalAmount = examinationFee)
7. INSERT InvoiceItem cho phí khám (EXAMINATION)
8. VÒNG LẶP cho mỗi PrescriptionDetail:
   - INSERT InvoiceItem (MEDICINE, đọc snapshot từ PrescriptionDetail)
9. UPDATE Invoice.totalAmount (tổng = phí khám + thuốc - discount)
10. COMMIT
```

### Business Rules chính

| BR | Nội dung |
|---|---|
| BR-INV-01 | Mỗi visit chỉ có 1 invoice. Đã tồn tại → throw `Invoice already exists for this visit` |
| BR-INV-02 | InvoiceItem.unitPrice **đọc từ PrescriptionDetail.unitPrice** (snapshot), không đọc lại Medicine.salePrice |
| BR-INV-03 | totalAmount = examinationFee + tổng các medicine subtotal - discount |
| BR-INV-04 | Sinh invoiceCode trong transaction để tránh trùng mã |

---

## State Machine của Visit và Appointment (để vẽ khi giảng viên hỏi)

### Visit lifecycle

```
WAITING ──> EXAMINING ──> EXAMINED ──> COMPLETED
       └─> EXAMINED (đi tắt)
       └─> CANCELLED
EXAMINING ──> CANCELLED
```

### Appointment lifecycle

```
WAITING ──> CHECKED_IN ──> IN_PROGRESS ──> COMPLETED
       └─> CANCELLED
       └─> NO_SHOW
CHECKED_IN ──> NO_SHOW
```

→ Mỗi mũi tên là **một transition hợp lệ**. State Pattern (file `stateMachine.ts`) enforce điều này — transition không có trong sơ đồ → throw lỗi.

---

## Utility Tree — UT-DI-02

Mở [UtilityTree.md](../UtilityTree.md):

| Scenario ID | Quality Attribute Scenario | Importance | Risk |
|---|---|---|---|
| **UT-DI-02** | Khi tạo hóa đơn cho lượt khám có nhiều mục (phí khám + thuốc) hoặc xử lý hoàn tiền, nếu một bước thất bại giữa chừng, tất cả thay đổi trên hóa đơn, thanh toán và tồn kho thuốc phải rollback toàn bộ; không tồn tại bản ghi nửa vời. | **High** | **High** |

> "**UT-DI-02** có Importance = High và Risk = High → Architectural Impact = **Very High**. Đây là 1 trong 7 ASR ưu tiên cao nhất của hệ thống."

---

## Nói gọn cho giảng viên (30 giây)

> "Hai use case liên quan là UC15 kê đơn và UC18 tạo hóa đơn. UC15 là biên transaction a — gom kê đơn + xuất kho. UC18 là biên transaction b — gom tạo hóa đơn + items. Cả 2 UC đều có Business Rule yêu cầu *all-or-nothing* khi gặp lỗi giữa chừng. Bên cạnh đó, có 2 state machine của Visit và Appointment phối hợp để chặn các transition không hợp lệ."

**Tiếp theo:** sang [03_ADD_va_design_pattern.md](03_ADD_va_design_pattern.md) — phần ADD + Design Pattern.
