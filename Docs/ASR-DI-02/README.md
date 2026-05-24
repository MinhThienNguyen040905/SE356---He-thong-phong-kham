# Ví dụ báo cáo ASR-DI-02 — Atomic Financial Operations

> Folder này chứa toàn bộ kịch bản trình bày ASR-DI-02 cho buổi báo cáo cuối kỳ.
> Đọc tuần tự từ file 01 → 06 để nắm hết.

## Quy trình kiểm tra của giảng viên (7 bước)

```
ASR → SRS UC → Utility Tree → ADD → SAD → Code → Pattern → Demo
```

| Bước | File trong folder này |
|---|---|
| 1-2. Giải thích ASR + lý do có ý nghĩa kiến trúc | [01_ASR_va_y_nghia_kien_truc.md](01_ASR_va_y_nghia_kien_truc.md) |
| 3-4. Mở SRS + business rules + Utility Tree | [02_SRS_va_business_rules.md](02_SRS_va_business_rules.md) |
| 5-6. ADD: tactic + GoF pattern + SAD view | [03_ADD_va_design_pattern.md](03_ADD_va_design_pattern.md) |
| 7. Sang code + chỉ ra pattern | [04_Code_walkthrough.md](04_Code_walkthrough.md) |
| Demo trên hệ thống thực | [05_Demo_huong_dan.md](05_Demo_huong_dan.md) |
| Câu hỏi giảng viên hay hỏi + trả lời mẫu | [06_QA_cheatsheet.md](06_QA_cheatsheet.md) |

---

## Tóm tắt nhanh ASR-DI-02

| Mục | Nội dung |
|---|---|
| **Tên ASR** | ASR-DI-02 — Tính nguyên tử của giao dịch tài chính |
| **Quality Attribute** | Data Integrity (Tính toàn vẹn dữ liệu) |
| **Module ảnh hưởng** | Prescription, Finance, Inventory, Database layer |
| **Tactic cốt lõi** | 2 biên transaction tách biệt + Pessimistic Locking + Snapshot |
| **Architectural Impact** | ⭐ Very High |

## 3 GoF Design Pattern đã áp dụng

| Pattern | Loại | Vai trò |
|---|---|---|
| **Template Method** | Behavioral | Sequelize cung cấp khung BEGIN → callback → COMMIT/ROLLBACK |
| **State** | Behavioral | `AppointmentStateMachine` + `VisitStateMachine` chặn transition không hợp lệ |
| **Memento** | Behavioral | `PrescriptionDetail` lưu snapshot giá thuốc tại thời điểm kê |

## File code chính cần mở khi demo

| File | Vai trò |
|---|---|
| [Backend/src/modules/appointment/prescription.service.ts](../../Backend/src/modules/appointment/prescription.service.ts) | **Biên (a)** — kê đơn + xuất kho |
| [Backend/src/modules/finance/invoice.service.ts](../../Backend/src/modules/finance/invoice.service.ts) | **Biên (b)** — tạo hóa đơn từ snapshot |
| [Backend/src/utils/stateMachine.ts](../../Backend/src/utils/stateMachine.ts) | State Pattern centralized |

## Trước buổi báo cáo cần làm

- [ ] Đọc xong 6 file trong folder này.
- [ ] Học thuộc câu mở đầu "2 biên transaction tách biệt..." (xem file 01).
- [ ] Học thuộc 3 GoF pattern + nơi chúng xuất hiện trong code (xem file 04).
- [ ] Chạy thử 5 demo scenarios ở nhà ít nhất 1 lần (xem file 05).
- [ ] Mở sẵn trong VSCode: `prescription.service.ts`, `invoice.service.ts`, `stateMachine.ts`.
- [ ] Mở sẵn Beekeeper Studio kết nối DB để query trực tiếp khi demo.
- [ ] Backend đang chạy + Frontend đang chạy.

## Tip đi thi

Khi giảng viên hỏi, **luôn dẫn theo thứ tự**: ASR → SRS → ADD → SAD → Code → Pattern → Demo.
Đừng nhảy thẳng vào code. Mỗi bước chỉ nói 2-3 câu, giảng viên sẽ ngắt nếu muốn đào sâu.
