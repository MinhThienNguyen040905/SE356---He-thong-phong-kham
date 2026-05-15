/* eslint-disable */
// Generates Docs/UtilityTree.xlsx from the Utility Tree defined in UtilityTree.md.
// Run from repo root: node Docs/generate-utility-tree-xlsx.js
// Strict 1-1 traceability: each UT scenario maps to exactly one ASR.
const path = require("path");
const ExcelJS = require(path.join(__dirname, "..", "Backend", "node_modules", "exceljs"));

const qaGroups = [
  {
    qa: "1. Security",
    description:
      "Dữ liệu y tế và tài chính nhạy cảm, nhiều vai trò truy cập, có endpoint công khai. Định hình pipeline middleware xác thực/phân quyền, RBAC, kho thu hồi token, hashing, validate/sanitize.",
    concerns: [
      {
        concern: "Authentication & session lifecycle",
        scenarios: [
          {
            id: "UT-SEC-01",
            asr: "ASR-SEC-01",
            scenario:
              "Khi người dùng đăng xuất, đổi mật khẩu hoặc bị admin khóa, mọi request kế tiếp dùng token cũ phải bị từ chối trên toàn hệ thống trong ≤ 1 giây, bất kể token còn hiệu lực theo thời gian.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
      {
        concern: "Authorization",
        scenarios: [
          {
            id: "UT-SEC-02",
            asr: "ASR-SEC-02",
            scenario:
              "Khi một người dùng có vai trò bất kỳ gọi một endpoint nghiệp vụ, hệ thống phải kiểm tra quyền chi tiết tương ứng trước khi cho vào lớp nghiệp vụ; thay đổi ma trận quyền có hiệu lực mà không cần triển khai lại.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
          {
            id: "UT-SEC-03",
            asr: "ASR-SEC-03",
            scenario:
              "Khi một bệnh nhân (kể cả có ý đồ) yêu cầu xem/sửa tài nguyên bằng ID không thuộc về mình (lịch hẹn, đơn thuốc, hóa đơn, hồ sơ), hệ thống phải từ chối truy cập với 0 trường hợp rò rỉ dữ liệu chéo.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
      {
        concern: "Input & boundary defense",
        scenarios: [
          {
            id: "UT-SEC-04",
            asr: "ASR-SEC-04",
            scenario:
              "Khi client gửi payload có ký tự nguy hiểm, kích thước vượt mức, nội dung HTML có script, hoặc spam request, lớp biên phải validate cấu trúc, làm sạch nội dung, áp rate limit và đính kèm security header trước khi vào lớp nghiệp vụ.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Secret & credential management",
        scenarios: [
          {
            id: "UT-SEC-05",
            asr: "ASR-SEC-05",
            scenario:
              "Khi triển khai ở môi trường mới, ứng dụng phải đọc bí mật từ cấu hình ngoài và từ chối khởi động nếu thiếu; mật khẩu trong CSDL phải được hash bằng thuật toán adaptive và không thể bị giải mã ngược.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
    ],
  },
  {
    qa: "2. Performance",
    description:
      "Lễ tân/bác sĩ thao tác liên tục theo thời gian thực; dashboard tổng hợp. Định hình lớp cache, chỉ mục DB, phân trang bắt buộc, rate limit.",
    concerns: [
      {
        concern: "Read latency for interactive screens",
        scenarios: [
          {
            id: "UT-PERF-01",
            asr: "ASR-PERF-01",
            scenario:
              "Trong giờ cao điểm, khi lễ tân/bác sĩ/admin mở danh sách (bệnh nhân, lịch hẹn, đơn thuốc, hóa đơn, thuốc) hoặc dashboard có lọc/tìm kiếm, P95 phản hồi phải dưới 500 ms cho danh sách và dưới 1.5 s cho dashboard ở tải định mức.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Resource protection under burst",
        scenarios: [
          {
            id: "UT-PERF-02",
            asr: "ASR-PERF-02",
            scenario:
              "Khi một client gửi burst request vượt ngưỡng (đặc biệt vào endpoint đăng nhập/OTP), hệ thống phải áp giới hạn tần suất và không cho phép suy giảm chất lượng cho các client hợp lệ khác.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
    ],
  },
  {
    qa: "3. Data Integrity",
    description:
      "Đặt lịch đồng thời, giao dịch tài chính, vòng đời nghiệp vụ phức tạp. Định hình transaction + row-level lock, state machine, audit log cross-cutting.",
    concerns: [
      {
        concern: "Concurrent booking",
        scenarios: [
          {
            id: "UT-DI-01",
            asr: "ASR-DI-01",
            scenario:
              "Khi nhiều bệnh nhân hoặc lễ tân đặt cùng một ca trực gần đầy đồng thời, hệ thống chỉ chấp nhận đến đúng số slot tối đa; 0 trường hợp vượt slot ngay cả dưới concurrency cao.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
      {
        concern: "Financial atomicity",
        scenarios: [
          {
            id: "UT-DI-02",
            asr: "ASR-DI-02",
            scenario:
              "Khi tạo hóa đơn cho một lượt khám có nhiều mục (phí khám + thuốc) hoặc xử lý hoàn tiền, nếu một bước thất bại giữa chừng, tất cả thay đổi trên hóa đơn, thanh toán và tồn kho thuốc phải rollback toàn bộ; không tồn tại bản ghi nửa vời.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
      {
        concern: "Lifecycle integrity",
        scenarios: [
          {
            id: "UT-DI-03",
            asr: "ASR-DI-03",
            scenario:
              "Khi nhiều API/role khác nhau cùng cố chuyển trạng thái cho lịch hẹn/lượt khám/hóa đơn, mọi chuyển đổi phải đi qua quy tắc tập trung; 0 trường hợp chuyển trạng thái bất hợp lệ (ví dụ Cancelled → Completed).",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Auditability",
        scenarios: [
          {
            id: "UT-DI-04",
            asr: "ASR-DI-04",
            scenario:
              "Khi xảy ra một sự cố nghiệp vụ trên dữ liệu nhạy cảm, vận hành phải truy được đầy đủ ai – làm gì – khi nào – giá trị trước/sau, với 100% endpoint mutating có audit và việc ghi log không cản trở request chính.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
    ],
  },
  {
    qa: "4. Availability",
    description:
      "Phòng khám phục vụ liên tục; nhiều phụ thuộc ngoài (email, OAuth, cache). Định hình scheduler tách riêng, maintenance mode, fallback cho dependency ngoài.",
    concerns: [
      {
        concern: "Background processing isolation",
        scenarios: [
          {
            id: "UT-AVL-01",
            asr: "ASR-AVL-01",
            scenario:
              "Khi các tác vụ định kỳ (auto no-show, cảnh báo thuốc hết hạn, tổng hợp chấm công, sinh lịch trực) chạy, lỗi của chúng không được kéo theo lỗi của API người dùng và mỗi job phải có log thành công/thất bại.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Operational toggles",
        scenarios: [
          {
            id: "UT-AVL-02",
            asr: "ASR-AVL-02",
            scenario:
              "Khi admin bật chế độ bảo trì, người dùng thường nhận 503 thân thiện trong ≤ 1 giây trong khi admin vẫn dùng được endpoint quản trị, không cần triển khai lại.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
      {
        concern: "External dependency failure",
        scenarios: [
          {
            id: "UT-AVL-03",
            asr: "ASR-AVL-03",
            scenario:
              "Khi dịch vụ email, OAuth provider hoặc cache store lỗi tạm thời, các nghiệp vụ cốt lõi (đặt lịch, khám, kê đơn, thanh toán) phải vẫn hoạt động; chức năng phụ trợ suy giảm có kiểm soát; lõi nghiệp vụ duy trì khả dụng ≥ 99%.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
    ],
  },
  {
    qa: "5. Usability",
    description:
      "Bốn vai trò khác biệt; frontend cần đồng bộ với phân quyền backend. Định hình API contract chuẩn, global error handler, phân vùng frontend theo vai trò.",
    concerns: [
      {
        concern: "API consistency",
        scenarios: [
          {
            id: "UT-USA-01",
            asr: "ASR-USA-01",
            scenario:
              "Khi frontend hoặc tích hợp ngoài gọi bất kỳ API nào, cấu trúc response thành công và lỗi phải đồng nhất, kèm mã lỗi nghiệp vụ chuẩn hóa để xử lý đa ngôn ngữ.",
            importance: "Medium",
            risk: "Low",
            impact: "Medium",
          },
        ],
      },
      {
        concern: "Role-tailored UI",
        scenarios: [
          {
            id: "UT-USA-02",
            asr: "ASR-USA-02",
            scenario:
              "Khi người dùng có vai trò bất kỳ đăng nhập, frontend chỉ hiển thị điều hướng và hành động phù hợp với quyền; không nút/route nào dẫn đến chức năng mà backend sẽ từ chối.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
    ],
  },
  {
    qa: "6. Manageability",
    description:
      "Cần truy vết sự cố, cấu hình quy tắc nghiệp vụ thay đổi, báo cáo định kỳ. Định hình logging chuẩn, audit log, system settings runtime, service báo cáo tách biệt.",
    concerns: [
      {
        concern: "Observability",
        scenarios: [
          {
            id: "UT-MAN-01",
            asr: "ASR-MAN-01",
            scenario:
              "Khi một sự cố nghiệp vụ được báo cáo, đội vận hành phải truy ra request log, error log và audit trail liên quan trong ≤ 15 phút.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Runtime configurability",
        scenarios: [
          {
            id: "UT-MAN-02",
            asr: "ASR-MAN-02",
            scenario:
              "Khi admin cần đổi tham số nghiệp vụ (số slot tối đa/ca, ngưỡng cảnh báo thuốc hết hạn, giá khám, cài đặt thông báo, maintenance mode), thay đổi phải có hiệu lực trong ≤ 1 phút và không cần đổi mã.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
      {
        concern: "Reporting isolation",
        scenarios: [
          {
            id: "UT-MAN-03",
            asr: "ASR-MAN-03",
            scenario:
              "Khi admin yêu cầu báo cáo dải tháng (doanh thu, khám bệnh, kho, lương), việc sinh báo cáo (PDF/Excel) phải hoàn tất < 5 giây và không gây timeout cho API thường.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
    ],
  },
  {
    qa: "7. Modifiability",
    description:
      "Hệ thống dài hạn cần thêm provider auth, thêm kênh thông báo, mở rộng module. Định hình tổ chức module theo domain, adapter pattern, event-driven nội bộ.",
    concerns: [
      {
        concern: "Domain modularity",
        scenarios: [
          {
            id: "UT-MOD-01",
            asr: "ASR-MOD-01",
            scenario:
              "Khi đội phát triển sửa/thêm tính năng trong một domain (ví dụ kê đơn), thay đổi phải gói gọn trong ≤ 2 module, không lan ra các domain không liên quan.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
      {
        concern: "Pluggable authentication providers",
        scenarios: [
          {
            id: "UT-MOD-02",
            asr: "ASR-MOD-02",
            scenario:
              "Khi cần thêm một phương thức đăng nhập mới (OAuth provider khác hoặc SSO), việc bổ sung phải thực hiện được qua adapter mới trong ≤ 1–2 ngày công, mà không phải sửa phần xác thực lõi.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
      {
        concern: "Pluggable notification channels",
        scenarios: [
          {
            id: "UT-MOD-03",
            asr: "ASR-MOD-03",
            scenario:
              "Khi cần thêm một kênh thông báo mới (push, SMS) bên cạnh email/in-app, các service nghiệp vụ phát sinh sự kiện không phải thay đổi; thay đổi gói gọn trong module thông báo.",
            importance: "Medium",
            risk: "Medium",
            impact: "Medium",
          },
        ],
      },
    ],
  },
  {
    qa: "8. Scalability",
    description:
      "Tăng trưởng dữ liệu nhiều năm và khả năng mở rộng số instance khi cần. Định hình stateless API, externalized shared state, chỉ mục, phân trang.",
    concerns: [
      {
        concern: "Horizontal scaling of API tier",
        scenarios: [
          {
            id: "UT-SCA-01",
            asr: "ASR-SCA-01",
            scenario:
              "Khi triển khai nhiều instance API sau load balancer, các bất biến (token thu hồi đồng bộ, rate limit chính xác, trạng thái xác thực) phải được giữ vững mà không phụ thuộc vào instance cụ thể xử lý request.",
            importance: "High",
            risk: "High",
            impact: "Very High",
          },
        ],
      },
      {
        concern: "Data growth",
        scenarios: [
          {
            id: "UT-SCA-02",
            asr: "ASR-SCA-02",
            scenario:
              "Khi khối lượng bản ghi nghiệp vụ chính (lịch hẹn, lượt khám, hóa đơn, audit log) tăng gấp 10 lần qua các năm, P95 truy vấn danh sách vẫn phải dưới 500 ms với phân trang/lọc bắt buộc.",
            importance: "High",
            risk: "Medium",
            impact: "High",
          },
        ],
      },
    ],
  },
];

const asrCatalog = [
  ["ASR-SEC-01", "Xác thực mạnh kèm thu hồi phiên"],
  ["ASR-SEC-02", "RBAC + permission chi tiết"],
  ["ASR-SEC-03", "Bệnh nhân chỉ thấy dữ liệu của mình"],
  ["ASR-SEC-04", "Phòng thủ nhiều lớp ở biên API"],
  ["ASR-SEC-05", "Bảo vệ credential & secret"],
  ["ASR-PERF-01", "Đáp ứng nhanh cho list/search/dashboard"],
  ["ASR-PERF-02", "Khống chế tài nguyên dưới burst"],
  ["ASR-DI-01", "Đặt lịch đồng thời nhất quán"],
  ["ASR-DI-02", "Tài chính nguyên tử"],
  ["ASR-DI-03", "State machine tường minh"],
  ["ASR-DI-04", "Audit log cho thao tác nhạy cảm"],
  ["ASR-AVL-01", "Tác vụ nền không cản trở request"],
  ["ASR-AVL-02", "Maintenance mode runtime"],
  ["ASR-AVL-03", "Graceful degradation"],
  ["ASR-USA-01", "API contract đồng nhất"],
  ["ASR-USA-02", "UI theo vai trò"],
  ["ASR-MAN-01", "Quan sát vận hành"],
  ["ASR-MAN-02", "Cấu hình runtime"],
  ["ASR-MAN-03", "Báo cáo/xuất dữ liệu"],
  ["ASR-MOD-01", "Tách module theo domain"],
  ["ASR-MOD-02", "Pluggable auth provider"],
  ["ASR-MOD-03", "Thêm kênh notification"],
  ["ASR-SCA-01", "API stateless + state ngoài"],
  ["ASR-SCA-02", "Tăng trưởng dữ liệu"],
];

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "ASR/Utility Tree Generator";
  wb.created = new Date();

  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
  const headerFont = { color: { argb: "FFFFFFFF" }, bold: true };
  const qaFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
  const concernFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF2CC" } };
  const thinBorder = {
    top: { style: "thin", color: { argb: "FFBFBFBF" } },
    left: { style: "thin", color: { argb: "FFBFBFBF" } },
    bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
    right: { style: "thin", color: { argb: "FFBFBFBF" } },
  };

  const importanceColor = (v) => (v === "High" ? "FFC00000" : v === "Medium" ? "FFBF8F00" : "FF548235");
  const riskColor = (v) => (v === "High" ? "FFC00000" : v === "Medium" ? "FFBF8F00" : "FF548235");
  const impactColor = (v) =>
    v === "Very High" ? "FF7030A0" : v === "High" ? "FFC00000" : v === "Medium" ? "FFBF8F00" : "FF548235";

  // ===== Sheet 1: Utility Tree (hierarchical) =====
  const s1 = wb.addWorksheet("Utility Tree");
  s1.columns = [
    { header: "Quality Attribute", key: "qa", width: 22 },
    { header: "Concern", key: "concern", width: 38 },
    { header: "Scenario ID", key: "id", width: 14 },
    { header: "Quality Attribute Scenario", key: "scenario", width: 90 },
    { header: "Importance", key: "importance", width: 12 },
    { header: "Risk", key: "risk", width: 10 },
    { header: "Architectural Impact", key: "impact", width: 20 },
    { header: "ASR nguồn", key: "asr", width: 16 },
  ];
  s1.getRow(1).eachCell((c) => {
    c.fill = headerFill;
    c.font = headerFont;
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = thinBorder;
  });
  s1.views = [{ state: "frozen", ySplit: 1 }];

  qaGroups.forEach((g) => {
    const qaRow = s1.addRow([g.qa, g.description, "", "", "", "", "", ""]);
    qaRow.eachCell((c) => {
      c.fill = qaFill;
      c.font = { bold: true };
      c.alignment = { vertical: "middle", wrapText: true };
      c.border = thinBorder;
    });
    s1.mergeCells(qaRow.number, 2, qaRow.number, 8);

    g.concerns.forEach((c) => {
      const concernRow = s1.addRow(["", c.concern, "", "", "", "", "", ""]);
      concernRow.eachCell((cell) => {
        cell.fill = concernFill;
        cell.font = { italic: true, bold: true };
        cell.alignment = { vertical: "middle", wrapText: true };
        cell.border = thinBorder;
      });
      s1.mergeCells(concernRow.number, 2, concernRow.number, 8);

      c.scenarios.forEach((sc) => {
        const r = s1.addRow(["", "", sc.id, sc.scenario, sc.importance, sc.risk, sc.impact, sc.asr]);
        r.eachCell((cell) => {
          cell.alignment = { vertical: "top", wrapText: true };
          cell.border = thinBorder;
        });
        r.getCell(5).font = { bold: true, color: { argb: importanceColor(sc.importance) } };
        r.getCell(6).font = { bold: true, color: { argb: riskColor(sc.risk) } };
        r.getCell(7).font = { bold: true, color: { argb: impactColor(sc.impact) } };
        r.getCell(8).font = { bold: true };
        r.getCell(5).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(6).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(7).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(8).alignment = { vertical: "top", horizontal: "center" };
      });
    });
  });

  // ===== Sheet 2: Priority Summary =====
  const s2 = wb.addWorksheet("Priority Summary");
  s2.columns = [
    { header: "Scenario ID", key: "id", width: 14 },
    { header: "Quality Attribute", key: "qa", width: 22 },
    { header: "Concern", key: "concern", width: 38 },
    { header: "Importance", key: "importance", width: 12 },
    { header: "Risk", key: "risk", width: 10 },
    { header: "Architectural Impact", key: "impact", width: 20 },
    { header: "ASR nguồn", key: "asr", width: 16 },
  ];
  s2.getRow(1).eachCell((c) => {
    c.fill = headerFill;
    c.font = headerFont;
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = thinBorder;
  });
  s2.views = [{ state: "frozen", ySplit: 1 }];
  s2.autoFilter = { from: "A1", to: "G1" };

  qaGroups.forEach((g) => {
    g.concerns.forEach((c) => {
      c.scenarios.forEach((sc) => {
        const r = s2.addRow([sc.id, g.qa, c.concern, sc.importance, sc.risk, sc.impact, sc.asr]);
        r.eachCell((cell) => {
          cell.alignment = { vertical: "top", wrapText: true };
          cell.border = thinBorder;
        });
        r.getCell(4).font = { bold: true, color: { argb: importanceColor(sc.importance) } };
        r.getCell(5).font = { bold: true, color: { argb: riskColor(sc.risk) } };
        r.getCell(6).font = { bold: true, color: { argb: impactColor(sc.impact) } };
        r.getCell(7).font = { bold: true };
        r.getCell(4).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(5).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(6).alignment = { vertical: "top", horizontal: "center" };
        r.getCell(7).alignment = { vertical: "top", horizontal: "center" };
      });
    });
  });

  // ===== Sheet 3: Traceability ASR <-> UT =====
  const s3 = wb.addWorksheet("Traceability ASR-UT");
  s3.columns = [
    { header: "ASR", key: "asr", width: 16 },
    { header: "Tên ASR", key: "asrName", width: 48 },
    { header: "UT Scenario", key: "ut", width: 14 },
    { header: "Trạng thái", key: "status", width: 14 },
  ];
  s3.getRow(1).eachCell((c) => {
    c.fill = headerFill;
    c.font = headerFont;
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = thinBorder;
  });
  s3.views = [{ state: "frozen", ySplit: 1 }];

  // Build a quick lookup ASR -> UT id
  const asrToUt = {};
  qaGroups.forEach((g) =>
    g.concerns.forEach((c) =>
      c.scenarios.forEach((sc) => {
        asrToUt[sc.asr] = sc.id;
      })
    )
  );

  asrCatalog.forEach(([asrId, asrName]) => {
    const ut = asrToUt[asrId] || "(missing)";
    const status = asrToUt[asrId] ? "Covered" : "MISSING";
    const r = s3.addRow([asrId, asrName, ut, status]);
    r.eachCell((cell) => {
      cell.alignment = { vertical: "top", wrapText: true };
      cell.border = thinBorder;
    });
    r.getCell(1).font = { bold: true };
    r.getCell(3).font = { bold: true };
    r.getCell(4).font = {
      bold: true,
      color: { argb: status === "Covered" ? "FF548235" : "FFC00000" },
    };
    r.getCell(1).alignment = { vertical: "top", horizontal: "center" };
    r.getCell(3).alignment = { vertical: "top", horizontal: "center" };
    r.getCell(4).alignment = { vertical: "top", horizontal: "center" };
  });

  // ===== Sheet 4: QA Overview =====
  const s4 = wb.addWorksheet("QA Overview");
  s4.columns = [
    { header: "Quality Attribute", key: "qa", width: 22 },
    { header: "Vì sao quan trọng / Ảnh hưởng kiến trúc", key: "desc", width: 110 },
    { header: "Số scenario", key: "count", width: 14 },
  ];
  s4.getRow(1).eachCell((c) => {
    c.fill = headerFill;
    c.font = headerFont;
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = thinBorder;
  });
  s4.views = [{ state: "frozen", ySplit: 1 }];

  qaGroups.forEach((g) => {
    const count = g.concerns.reduce((acc, c) => acc + c.scenarios.length, 0);
    const r = s4.addRow([g.qa, g.description, count]);
    r.eachCell((cell) => {
      cell.alignment = { vertical: "top", wrapText: true };
      cell.border = thinBorder;
    });
    r.getCell(1).font = { bold: true };
    r.getCell(3).alignment = { vertical: "top", horizontal: "center" };
  });

  const outPath = path.join(__dirname, "UtilityTree.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log("Wrote " + outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
