# Bước 1-2: ASR-DI-02 + Lý do có ý nghĩa kiến trúc

## Bối cảnh — Giảng viên có thể bắt đầu thế này

> *"Module tài chính có yêu cầu chất lượng nào về toàn vẹn dữ liệu? Vì sao tạo hóa đơn lại có ý nghĩa kiến trúc?"*

→ Mở [ASR.md](../ASR.md) phần §3 Data Integrity, trỏ vào **ASR-DI-02**.

---

## Bước 1 — Chỉ ra ASR (nói trong 15 giây)

> "Dạ, em chọn **ASR-DI-02 — Tính nguyên tử của giao dịch tài chính**.
>
> Hệ thống chia luồng này thành **hai biên transaction tách biệt**:
> - **Biên (a)** — kê đơn kèm xuất kho do bác sĩ kích hoạt
> - **Biên (b)** — tạo hóa đơn do lễ tân kích hoạt sau đó
>
> Mỗi biên đảm bảo *all-or-nothing* — hoặc commit toàn bộ, hoặc rollback toàn bộ."

> 💡 **Câu mở đầu này rất quan trọng** — nói trong 5 giây đầu để giảng viên biết bạn hiểu kiến trúc, không phải vẹt theo doc.

---

## Bước 2 — Vì sao đây là ASR (phần ăn điểm cao nhất)

Áp dụng đúng **4 tiêu chí xác định ASR** trong ASR.md §A. Trả lời bằng **3 lý do** rõ ràng:

### Lý do 1 — Xuyên nhiều module và nhiều bảng

> "Yêu cầu này **không gói gọn trong 1 module**. Biên (a) chạm vào 6 bảng:
> Prescription, PrescriptionDetail, Medicine, MedicineExport, Visit, Appointment.
> Biên (b) chạm vào Invoice + InvoiceItem.
>
> Tổng cộng **8 bảng trong 4 module**. Không có transaction xuyên module → dữ liệu lệch ngay."

### Lý do 2 — Nếu bỏ yêu cầu, kiến trúc phải khác hẳn

> "Nếu bỏ ASR-DI-02, em phải chọn 1 trong 2 hướng khác:
> - **Saga Pattern + microservice** — mỗi service có DB riêng, dùng compensation transaction để rollback thủ công. Phức tạp gấp 10 lần.
> - **Eventual consistency với event-driven** — các bảng đồng bộ chậm vài giây. Không chấp nhận được vì kho thuốc và tài chính cần chính xác tức thì.
>
> Cả 2 hướng đều dẫn đến kiến trúc phức tạp hơn nhiều mà **không giải quyết vấn đề nào thật** trong phạm vi 1 phòng khám."

### Lý do 3 — Buộc dùng tactic cụ thể

> "Yêu cầu này ép em phải dùng những tactic *không thể tránh*:
> - **Row-level lock** trên thực thể thuốc để chống tồn kho âm dưới concurrency.
> - **Sinh mã chứng từ trong cùng transaction** để tránh trùng mã.
> - **Snapshot Pattern** lưu giá thuốc vào PrescriptionDetail để hóa đơn cô lập khỏi thay đổi giá sau này.
>
> Đây là những quyết định kiến trúc cấp service-layer, không phải implementation detail."

---

## Quality Attribute Scenario (full, để tham khảo)

| Element | Statement |
|---|---|
| **Stimulus** | Bác sĩ kê đơn (đồng thời xuất thuốc khỏi kho), lễ tân tạo hóa đơn cho lượt khám gồm phí khám và các thuốc đã kê, ghi nhận thanh toán, hoặc xử lý hoàn tiền. |
| **Stimulus source** | Bác sĩ (kê đơn), Lễ tân, Admin (hóa đơn, thanh toán, hoàn tiền). |
| **Environment** | Quá trình tạo / cập nhật chứng từ y tế và tài chính, có thể gặp lỗi giữa chừng. |
| **Artifact** | Prescription service, Finance service, Inventory service, lớp persistence. |
| **Response** | Hai biên transaction tách biệt theo trách nhiệm nghiệp vụ. Mỗi biên là một transaction nguyên tử với row-level lock + snapshot pattern. |
| **Response measure** | 0 hóa đơn "mồ côi" / tồn kho lệch trong test inject lỗi. Tồn kho không bao giờ âm dưới concurrency. |

---

## Utility Tree (nếu giảng viên hỏi tới)

Mở [UtilityTree.md](../UtilityTree.md) tìm dòng UT-DI-02:

| Importance | Risk | Architectural Impact |
|---|---|---|
| **High** | **High** | ⭐ **Very High** |

> "Em xếp ưu tiên cao nhất nhóm Data Integrity vì sai sót ở đây gây **mất tiền** — bệnh nhân bị tính tiền mà không có thuốc, hoặc kho trừ rồi mà hóa đơn không có. Đây là rủi ro nghiệp vụ + pháp lý."

---

## Giải thích từ "Tính nguyên tử" (nếu giảng viên hỏi)

> "**Tính nguyên tử (Atomicity)** là chữ **A** trong **ACID** — đặc trưng của database transaction.
>
> Ý nghĩa: một chuỗi thao tác hoặc **commit toàn bộ**, hoặc **rollback toàn bộ**. Không tồn tại trạng thái thực thi dở dang.
>
> Ví dụ trong hệ thống em: tạo Prescription header → trừ kho 5 thuốc → tạo 5 MedicineExport → update Visit status. Nếu giữa chừng lỗi, *cả 8 thao tác đều bị xóa sạch*, DB trở về y nguyên trạng thái trước khi bắt đầu."

---

## Câu kết bước 2 — Tóm lại 1 câu

> "Vì 3 lý do trên — xuyên module, kiến trúc phải khác nếu bỏ, và buộc dùng tactic cụ thể — ASR-DI-02 thực sự là một **architecturally significant requirement**, không phải chỉ là yêu cầu nghiệp vụ thông thường."

**Sau câu này, giảng viên thường sẽ gật đầu và yêu cầu mở SRS** → chuyển sang [02_SRS_va_business_rules.md](02_SRS_va_business_rules.md).
