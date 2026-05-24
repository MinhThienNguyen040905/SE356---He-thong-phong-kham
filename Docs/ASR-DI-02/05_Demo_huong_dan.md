# Bước 8: Demo trên hệ thống thực

## Bối cảnh

> *"Demo cho thầy/cô xem ASR-DI-02 hoạt động thực tế đi."*

→ Đây là bước **ăn điểm cao nhất** vì chứng cứ trực quan — không phải chỉ giải thích miệng.

---

## Chuẩn bị trước khi vào phòng thi

### Checklist 5 phút trước demo

- [ ] **Backend đang chạy**: `npm run dev` trong terminal — thấy `Server is running on port 5000`
- [ ] **Frontend đang chạy**: `npm run dev` — thấy `Local: http://localhost:5173`
- [ ] **Beekeeper Studio** đã kết nối DB `healthcare_db`
- [ ] **VSCode** đã mở sẵn: `prescription.service.ts`, `invoice.service.ts`, `stateMachine.ts`
- [ ] **Trình duyệt** đã login sẵn 2 tài khoản ở 2 tab khác nhau:
  - Tab 1: `doctor1@clinic.local` / `123456`
  - Tab 2: `recep@clinic.local` / `123456`

### Reset data nếu cần (chạy trước demo)

```powershell
cd D:\Data\Project\SE356---He-thong-phong-kham\Backend
docker exec -i clinic-mysql mysql -uroot -p123456 healthcare_db -e "
SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE invoice_items;
TRUNCATE TABLE payments;
TRUNCATE TABLE invoices;
TRUNCATE TABLE medicine_exports;
TRUNCATE TABLE prescription_details;
TRUNCATE TABLE prescriptions;
TRUNCATE TABLE visits;
TRUNCATE TABLE appointments;
TRUNCATE TABLE doctor_shifts;
SET FOREIGN_KEY_CHECKS=1;
"
npm run seed:demo
```

### Mở sẵn 4 query tab trong Beekeeper Studio

**Tab 1 — Xem tồn kho thuốc demo:**
```sql
SELECT id, name, quantity, salePrice
FROM medicines
WHERE name IN ('Paracetamol 500mg', 'Vitamin C 500mg', 'Augmentin 625mg', 'Insulin Lantus')
ORDER BY id;
```

**Tab 2 — Xem prescription mới nhất:**
```sql
SELECT p.id, p.prescriptionCode, p.totalAmount, p.status, v.visitCode, pa.fullName as patient
FROM prescriptions p
JOIN visits v ON v.id = p.visitId
JOIN patients pa ON pa.id = v.patientId
ORDER BY p.id DESC
LIMIT 5;
```

**Tab 3 — Xem MedicineExport mới nhất:**
```sql
SELECT me.id, me.exportCode, m.name as medicine, me.quantity, me.reason, me.createdAt
FROM medicine_exports me
JOIN medicines m ON m.id = me.medicineId
ORDER BY me.id DESC
LIMIT 10;
```

**Tab 4 — Xem hóa đơn + items:**
```sql
SELECT i.invoiceCode, i.totalAmount, i.paymentStatus,
       ii.itemType, ii.medicineName, ii.quantity, ii.unitPrice, ii.subtotal
FROM invoices i
JOIN invoice_items ii ON ii.invoiceId = i.id
ORDER BY i.id DESC, ii.id ASC
LIMIT 20;
```

---

## 5 kịch bản demo theo thứ tự

### 🎬 Demo 1 — Kê đơn THÀNH CÔNG (biên a hoạt động đúng)

**Bước thao tác:**
1. Tab Doctor → mở danh sách bệnh nhân ca sáng
2. Chọn **bệnh nhân 4 (Phạm Thị D)** — Visit đang `EXAMINING`
3. Bấm **"Kê đơn"**
4. Chọn 2 thuốc:
   - **Paracetamol 500mg** — số lượng **5**
   - **Vitamin C 500mg** — số lượng **10**
5. Bấm **Lưu đơn thuốc**

**Kỳ vọng UI:** ✅ 201 Created, hiển thị đơn thuốc với tổng tiền 25.000đ (5×2000 + 10×1500)

**Verify ở Beekeeper — chạy lần lượt 4 tab và bấm Refresh:**

| Tab | Kết quả mong đợi |
|---|---|
| Tab 1 (Medicine) | Paracetamol: 500 → **495** ✅, Vitamin C: 600 → **590** ✅ |
| Tab 2 (Prescription) | Có 1 dòng mới, status `DRAFT`, totalAmount = 25000 ✅ |
| Tab 3 (MedicineExport) | Có 2 dòng mới với reason `PRESCRIPTION_RX...` ✅ |
| Tab 4 (Invoice) | Chưa có gì — vì biên (b) chưa chạy ✅ |

**Câu chốt nói với giảng viên:**
> "Đây là *all* của all-or-nothing. 4 bảng (Prescription, PrescriptionDetail, Medicine, MedicineExport) đều được cập nhật cùng lúc, kèm Visit status chuyển sang EXAMINED. Tất cả trong **1 transaction duy nhất**."

---

### 🔥 Demo 2 — Kê đơn THẤT BẠI → rollback toàn bộ (cú chốt mạnh nhất!)

**Bước thao tác:**
1. Tab Doctor → chọn **bệnh nhân 5 (Hoàng Văn E)** — Visit đang `EXAMINING`
2. Bấm **"Kê đơn"**
3. Chọn **Augmentin 625mg** — số lượng **50** (kho chỉ có 8!)
4. Bấm **Lưu đơn thuốc**

**Kỳ vọng UI:** ❌ 400 Bad Request, message:
```
INSUFFICIENT_STOCK_Augmentin 625mg_Available:8_Requested:50
```

**Verify ở Beekeeper — đây là chứng cứ cốt lõi của tính nguyên tử:**

```sql
-- 1. Kho Augmentin KHÔNG đổi (vẫn 8)
SELECT name, quantity FROM medicines WHERE name = 'Augmentin 625mg';
-- → quantity = 8 ✅

-- 2. KHÔNG có prescription mới cho visit của Hoàng Văn E
SELECT COUNT(*) FROM prescriptions p
JOIN visits v ON v.id = p.visitId
JOIN patients pa ON pa.id = v.patientId
WHERE pa.fullName = 'Hoàng Văn E';
-- → COUNT = 0 ✅

-- 3. KHÔNG có MedicineExport mới cho Augmentin
SELECT COUNT(*) FROM medicine_exports
WHERE medicineId = (SELECT id FROM medicines WHERE name = 'Augmentin 625mg')
  AND createdAt > NOW() - INTERVAL 5 MINUTE;
-- → COUNT = 0 ✅

-- 4. Visit của Hoàng Văn E status vẫn EXAMINING
SELECT v.visitCode, v.status FROM visits v
JOIN patients p ON p.id = v.patientId
WHERE p.fullName = 'Hoàng Văn E';
-- → status = EXAMINING (không phải EXAMINED) ✅
```

**Câu chốt nói với giảng viên (CỰC QUAN TRỌNG):**
> "Đây là cú chốt mạnh nhất cho **Atomicity của ACID**.
>
> Trong code, em đã INSERT Prescription header *trước* khi vào vòng lặp medicine. Vậy nếu transaction không nguyên tử, prescription đã commit và phải tồn tại trong DB.
>
> Em vừa chạy SQL — **không có dòng nào**.
>
> Đó là Atomicity hoạt động — `ROLLBACK` đã dọn sạch toàn bộ thao tác đã chạy trước khi thất bại. DB trở về y nguyên trạng thái trước khi bắt đầu transaction."

---

### 🎬 Demo 3 — Tạo hóa đơn (biên b hoạt động đúng)

**Bước thao tác:**
1. Logout doctor → **Login lễ tân**: `recep@clinic.local` / `123456`
2. Vào trang **Hóa đơn**
3. Tìm bệnh nhân **Phạm Thị D** (người được kê đơn thành công ở Demo 1)
4. Bấm **"Tạo hóa đơn"**

**Kỳ vọng UI:** ✅ 201 Created, hóa đơn có 3 items:
- EXAMINATION: Khám bệnh — 200.000đ
- MEDICINE: Paracetamol 500mg × 5 — 10.000đ
- MEDICINE: Vitamin C 500mg × 10 — 15.000đ
- **Tổng: 225.000đ**

**Verify Tab 4 (Invoice) ở Beekeeper:**

```sql
SELECT i.invoiceCode, i.totalAmount, i.paymentStatus,
       ii.itemType, ii.medicineName, ii.quantity, ii.unitPrice, ii.subtotal
FROM invoices i
JOIN invoice_items ii ON ii.invoiceId = i.id
WHERE i.id = (SELECT MAX(id) FROM invoices)
ORDER BY ii.id ASC;
```

**Kết quả phải thấy 3 dòng:**

| invoiceCode | totalAmount | paymentStatus | itemType | medicineName | quantity | unitPrice | subtotal |
|---|---|---|---|---|---|---|---|
| INV... | 225000 | UNPAID | EXAMINATION | NULL | 1 | 200000 | 200000 |
| INV... | 225000 | UNPAID | MEDICINE | Paracetamol 500mg | 5 | 2000 | 10000 |
| INV... | 225000 | UNPAID | MEDICINE | Vitamin C 500mg | 10 | 1500 | 15000 |

**Câu chốt:**
> "Biên (b) chạy. Lưu ý 2 điểm:
> - InvoiceItem.medicineName, unitPrice **đọc từ PrescriptionDetail** (Memento) — không đọc lại Medicine.
> - Biên (b) **không động vào kho** — Tab 1 nếu mở lại sẽ thấy quantity vẫn 495/590, không bị trừ thêm lần nào nữa."

---

### 🎬 Demo 4 — Chống tạo hóa đơn trùng (Idempotency check)

**Bước thao tác:**
1. Vẫn ở trang Lễ tân
2. Tìm lại bệnh nhân **Phạm Thị D**, bấm **"Tạo hóa đơn"** lần thứ 2

**Kỳ vọng UI:** ❌ 400 Bad Request:
```
Invoice already exists for this visit
```

**Verify:**
```sql
-- Chỉ có đúng 1 hóa đơn cho visit của Phạm Thị D
SELECT COUNT(*) FROM invoices WHERE visitId = (
  SELECT v.id FROM visits v
  JOIN patients p ON p.id = v.patientId
  WHERE p.fullName = 'Phạm Thị D'
);
-- → COUNT = 1 ✅ (không phải 2)
```

**Câu chốt:**
> "Idempotency check trong transaction — gọi 2 lần cũng chỉ có 1 hóa đơn. Đây là *consistency* — chữ C trong ACID."

---

### 💡 Demo 5 — Memento Pattern hoạt động (cú chốt cho Memento)

**Bước thao tác:**
1. Logout lễ tân → **Login Admin**: `admin@clinic.local` / `123456`
2. Vào **Quản lý thuốc**
3. Tìm **Paracetamol 500mg**, đổi giá từ **2.000đ → 10.000đ**
4. Lưu

5. Logout admin → **Login lại lễ tân**
6. Mở hóa đơn của **Phạm Thị D** vừa tạo ở Demo 3

**Kỳ vọng UI:** Hóa đơn vẫn hiển thị Paracetamol giá **2.000đ** (giá lúc kê), không phải 10.000đ (giá hiện tại). Tổng vẫn 225.000đ.

**Verify so sánh giá:**
```sql
SELECT
  m.name,
  m.salePrice AS gia_hien_tai,
  ii.unitPrice AS gia_tren_hoa_don,
  m.salePrice - ii.unitPrice AS chenh_lech
FROM invoice_items ii
JOIN prescription_details pd ON pd.id = ii.prescriptionDetailId
JOIN medicines m ON m.id = pd.medicineId
WHERE ii.medicineName = 'Paracetamol 500mg'
ORDER BY ii.id DESC LIMIT 1;
```

**Kết quả phải thấy:**

| name | gia_hien_tai | gia_tren_hoa_don | chenh_lech |
|---|---|---|---|
| Paracetamol 500mg | 10000 | 2000 | 8000 |

**Câu chốt:**
> "Đây là **Memento Pattern** hoạt động.
> - **Originator** (Medicine) đổi giá: 2.000 → 10.000
> - **Memento** (snapshot trong PrescriptionDetail.unitPrice): vẫn giữ 2.000
> - **Caretaker** (PrescriptionDetail) cô lập Memento qua thời gian
>
> Hóa đơn ngày 01/12 luôn dùng giá ngày 01/12, dù sau đó admin đổi giá bao nhiêu lần. Đây là yêu cầu kế toán + pháp lý cơ bản, đảm bảo bệnh nhân không bị tính sai giá."

---

## Bảng tổng kết 5 demo

| # | Thao tác | Kỳ vọng | Pattern minh chứng |
|---|---|---|---|
| 1 | Kê 5 Para + 10 VitC | 201, kho giảm, prescription + export sinh ra, visit EXAMINED | Transaction Script + Template Method + State + Memento |
| 2 | Kê 50 Augmentin (>kho) | 400, **DB không đổi gì** | ⭐ **Atomicity của ACID** + Pessimistic Locking |
| 3 | Tạo hóa đơn | 201, 3 items, totalAmount 225.000đ | Transaction Script + đọc Memento |
| 4 | Tạo hóa đơn lần 2 cùng visit | 400 "already exists" | Idempotency check |
| 5 | Admin đổi giá → mở hóa đơn cũ | Giá cũ vẫn được giữ | ⭐ **Memento Pattern** |

---

## Mẹo demo cuối

1. **Demo 2 là cú chốt mạnh nhất** — vì nó *chứng minh* tính nguyên tử bằng cách cho thấy DB không đổi gì sau khi API throw. Đây là chứng cứ trực quan rõ ràng nhất.

2. **Sau mỗi demo, BẤM REFRESH** trên các tab Beekeeper liên quan. Đừng giả định data tự update.

3. **Nếu lỡ tay thao tác sai** (ví dụ kê nhầm số lượng), **dừng lại**, mở terminal chạy reset script (xem đầu file này), rồi demo lại.

4. **Demo 5 là demo "wow" nhất** — show được pattern nghiệp vụ thực sự. Nếu thời gian gấp, chọn demo 2 + demo 5 là đủ ăn điểm cao.

**Tiếp theo:** sang [06_QA_cheatsheet.md](06_QA_cheatsheet.md) — danh sách câu hỏi giảng viên hay hỏi + trả lời mẫu.
