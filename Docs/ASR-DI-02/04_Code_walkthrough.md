# Bước 7: Code Walkthrough — Chỉ vào pattern trong file thực tế

## Bối cảnh

> *"Cho thầy/cô xem code đi. Pattern em vừa nói nằm ở đâu?"*

→ Mở **2 file chính** đã chuẩn bị sẵn trong VSCode:
1. [Backend/src/modules/appointment/prescription.service.ts](../../Backend/src/modules/appointment/prescription.service.ts) — biên (a)
2. [Backend/src/modules/finance/invoice.service.ts](../../Backend/src/modules/finance/invoice.service.ts) — biên (b)

---

## Mẹo demo nhanh — Ctrl+F "Pattern (GoF"

Cả file `prescription.service.ts` đã có **đầy đủ comment đánh dấu**. Nhấn `Ctrl+F`, gõ `Pattern (GoF` — sẽ nhảy qua **~8 vị trí** đánh dấu sẵn.

---

## File 1: `prescription.service.ts` — Biên transaction (a)

### Vị trí 1 (đầu file, dòng ~28-43) — Block tổng quan

```typescript
// ============================================================
// GoF Design Patterns được dùng trong file này:
//
// 1) Template Method (Behavioral) — sequelize.transaction(callback)
// 2) State Pattern (Behavioral) — AppointmentStateMachine / VisitStateMachine
// 3) Memento Pattern (Behavioral) — createMedicineMemento(medicine)
// ============================================================
```

> **Nói khi chỉ vào:** "Em đặt block tổng quan ngay đầu file để giảng viên scroll lên thấy ngay 3 pattern được dùng — không phải đoán."

### Vị trí 2 (dòng ~45-50) — Memento helper

```typescript
// Memento Pattern (GoF, Behavioral) — helper "chụp ảnh" Medicine tại thời điểm kê.
// Originator = Medicine, Memento = object trả về, Caretaker = PrescriptionDetail.
const createMedicineMemento = (medicine: Medicine) => ({
  medicineName: medicine.name,
  unit: medicine.unit,
  unitPrice: medicine.salePrice,
});
```

> **Nói:** "Đây là Memento helper — nhận Medicine (Originator), trả về object snapshot (Memento). Sau này PrescriptionDetail (Caretaker) sẽ giữ snapshot này qua thời gian."

### Vị trí 3 (dòng ~82-87) — Template Method cho `createPrescription`

```typescript
// Template Method Pattern (GoF, Behavioral):
// Sequelize cung cấp khung cố định BEGIN -> callback -> COMMIT/ROLLBACK.
// Service chỉ lấp phần biến đổi (callback) — không phải tự viết transaction lifecycle.
return await sequelize.transaction(
  { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
  async (t) => {
    ...
  }
);
```

> **Nói:** "Template Method — Sequelize cung cấp khung `BEGIN → callback → COMMIT/ROLLBACK`. Em chỉ viết callback nghiệp vụ. Không bao giờ tự viết commit/rollback → không bao giờ quên dọn transaction."

### Vị trí 4 (dòng ~98-108) — State Pattern cho Appointment

```typescript
if (appointment.status === "CHECKED_IN") {
  // ----- State Pattern (GoF, Behavioral) -----
  // Mọi chuyển trạng thái Appointment đi qua AppointmentStateMachine
  // để chặn transition không hợp lệ (ví dụ CANCELLED -> COMPLETED).
  AppointmentStateMachine.validateTransition(
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.IN_PROGRESS
  );
  appointment.status = "IN_PROGRESS";
  await appointment.save({ transaction: t });
}
```

> **Nói:** "State Pattern — em không sửa thẳng status, mà gọi `AppointmentStateMachine.validateTransition` trước. Nếu transition không hợp lệ — ví dụ CANCELLED → COMPLETED — state machine throw lỗi ngay, không cho ghi vào DB."

### Vị trí 5 (dòng ~125-135) — Pessimistic Locking trên Medicine

```typescript
for (const item of input.medicines) {
  const medicine = await Medicine.findByPk(item.medicineId, {
    transaction: t,
    lock: t.LOCK.UPDATE,    // ← Pessimistic Locking
  });
  ...
}
```

> **Nói:** "`lock: t.LOCK.UPDATE` chính là `SELECT FOR UPDATE` của MySQL — khóa hàng Medicine tới khi commit. Nếu bác sĩ B kê cùng thuốc đồng thời, bác sĩ B phải đợi → đọc lại stock mới → biết đủ hay không. Đây là cách chống tồn kho âm."

### Vị trí 6 (dòng ~155-167) — Memento được áp dụng

```typescript
await PrescriptionDetail.create(
  {
    prescriptionId: prescription.id,
    medicineId: medicine.id,
    ...createMedicineMemento(medicine), // Memento Pattern: snapshot tên/đơn vị/giá
    quantity: item.quantity,
    dosageMorning: item.dosageMorning,
    ...
  },
  { transaction: t }
);
```

> **Nói:** "Đây là chỗ Memento được **áp dụng**. Toán tử `...createMedicineMemento(medicine)` trải snapshot vào PrescriptionDetail. Từ đây trở đi, snapshot nằm trong DB, không phụ thuộc bảng Medicine."

### Vị trí 7 (dòng ~209-220) — State Pattern cho Visit

```typescript
if (visit.status !== "COMPLETED") {
  if (visit.status !== "EXAMINED") {
    // ----- State Pattern (GoF, Behavioral) -----
    // Mọi chuyển trạng thái Visit đi qua VisitStateMachine để chặn
    // transition không hợp lệ (ví dụ CANCELLED -> EXAMINED).
    VisitStateMachine.validateTransition(visit.status, "EXAMINED");
    visit.status = "EXAMINED";
  }
  visit.checkOutTime = visit.checkOutTime ?? new Date();
  await visit.save({ transaction: t });
}
```

> **Nói:** "Lần thứ 2 dùng State Pattern — chuyển Visit sang EXAMINED. Cùng nguyên tắc: validate trước, set sau."

### Vị trí 8 và 9 — Template Method ở `updatePrescriptionService` và `cancelPrescriptionService`

Cùng dạng comment ở dòng ~243 và ~451. Đảm bảo tính nhất quán: cả 3 hàm trong file đều dùng cùng pattern.

---

## File 2: `invoice.service.ts` — Biên transaction (b)

Mở hàm `createInvoiceFromVisit` (~dòng 188).

### Đoạn cốt lõi

```typescript
export const createInvoiceFromVisit = async (
  visitId: number,
  createdBy: number,
  examinationFee: number,
  transaction?: Transaction
) => {
  const t = transaction || (await sequelize.transaction());

  try {
    // Đọc Visit + Prescription + Details (đã chốt ở biên a)
    const visit = await Visit.findByPk(visitId, {
      include: [{ association: "prescription", include: [{ association: "details" }] }],
      transaction: t,
    });

    // Idempotency check — chống tạo trùng
    const existingInvoice = await Invoice.findOne({
      where: { visitId }, transaction: t,
    });
    if (existingInvoice) throw new Error("Invoice already exists for this visit");

    // Sinh invoiceCode trong transaction
    const invoiceCode = await generateInvoiceCode();

    // Tạo Invoice + InvoiceItem cho phí khám
    const invoice = await Invoice.create({...}, { transaction: t });
    await InvoiceItem.create({
      invoiceId: invoice.id,
      itemType: ItemType.EXAMINATION,
      ...
    }, { transaction: t });

    // Đọc snapshot từ PrescriptionDetail — đây là chỗ Memento được "đọc lại"
    for (const detail of prescriptionDetails) {
      const subtotal = detail.quantity * detail.unitPrice; // ← unitPrice là snapshot
      await InvoiceItem.create({
        invoiceId: invoice.id,
        itemType: ItemType.MEDICINE,
        medicineName: detail.medicineName,  // ← snapshot
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,         // ← snapshot
        subtotal,
      }, { transaction: t });
    }

    invoice.totalAmount = examinationFee + medicineTotalAmount - invoice.discount;
    await invoice.save({ transaction: t });
    if (!transaction) await t.commit();
    return invoice;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};
```

### Nói khi chỉ vào

> "Đây là biên (b). Khác biên (a) ở 3 điểm:
> - **Không có pessimistic lock** vì biên này không động vào kho — chỉ đọc snapshot.
> - **Có idempotency check** ở dòng `existingInvoice` — chống tạo hóa đơn trùng cho cùng visit.
> - **Memento được đọc lại** trong vòng for — `detail.unitPrice`, `detail.medicineName` là snapshot do biên (a) đã chốt, không phải đọc Medicine hiện tại.
>
> Đây là cách 2 biên transaction phối hợp với nhau qua Memento Pattern — không gọi trực tiếp lẫn nhau."

---

## File 3 (tham khảo): `stateMachine.ts`

Mở [Backend/src/utils/stateMachine.ts](../../Backend/src/utils/stateMachine.ts) nếu giảng viên hỏi "State Pattern được định nghĩa ở đâu":

```typescript
export class AppointmentStateMachine {
  private static readonly validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    [AppointmentStatus.WAITING]: [
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ],
    [AppointmentStatus.CHECKED_IN]: [
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.NO_SHOW,
    ],
    [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
    [AppointmentStatus.COMPLETED]: [],   // terminal
    [AppointmentStatus.CANCELLED]: [],   // terminal
    [AppointmentStatus.NO_SHOW]: [],     // terminal
  };

  static validateTransition(from, to) {
    if (from === to) return;
    const allowed = this.validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`INVALID_APPOINTMENT_STATE_TRANSITION: Cannot transition from ${from} to ${to}`);
    }
  }
}
```

> "Đây là State Pattern theo dạng **table-driven** — quy tắc chuyển trạng thái lưu trong `validTransitions` lookup table. Hàm `validateTransition` check `from → to` có nằm trong allowed list không. Đây là biến thể hiện đại của State Pattern (GoF gốc dùng inheritance, biến thể này dùng data)."

---

## Bảng tóm tắt pattern trong 2 file

| Vị trí | Pattern | Mục đích |
|---|---|---|
| `prescription.service.ts` đầu file | Block tổng quan | Index 3 pattern |
| `prescription.service.ts` ~dòng 45 | **Memento** (helper) | Định nghĩa cách "chụp ảnh" |
| `prescription.service.ts` ~dòng 82, 243, 451 | **Template Method** (×3 hàm) | Khung transaction lifecycle |
| `prescription.service.ts` ~dòng 100 | **State** (Appointment) | Chặn transition sai |
| `prescription.service.ts` ~dòng 130 | **Pessimistic Lock** | Chống tồn kho âm |
| `prescription.service.ts` ~dòng 160, 325 | **Memento** (áp dụng) | Snapshot vào PrescriptionDetail |
| `prescription.service.ts` ~dòng 215 | **State** (Visit) | Chặn transition sai |
| `invoice.service.ts` `createInvoiceFromVisit` | **Idempotency check + Memento** (đọc lại) | Chống tạo trùng + đọc snapshot |

---

## Lời kết bước này

> "Cả 3 GoF pattern đều có comment đánh dấu rõ ràng trong file. Thầy/cô có thể `Ctrl+F` chữ 'Pattern (GoF' để nhảy qua tất cả vị trí. Em không phải dựa vào trí nhớ để chỉ ra pattern — code tự tài liệu hóa."

**Tiếp theo:** sang [05_Demo_huong_dan.md](05_Demo_huong_dan.md) — chạy demo thực tế trên hệ thống.
