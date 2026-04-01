import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";
import AdminSidebar from "../../components/layout/sidebar/admin";

interface PatientByGender {
  gender: string;
  count: number;
  percentage: number;
  averageAge: number | null;
}

interface GenderReportResponse {
  total: number;
  byGender: PatientByGender[];
}

const COLORS = {
  MALE: "#3b82f6", 
  FEMALE: "#ec4899", 
  OTHER: "#f59e0b", 
  UNKNOWN: "#6b7280", 
};

const getColorForGender = (gender: string): string => {
  return COLORS[gender as keyof typeof COLORS] || COLORS.UNKNOWN;
};

const getVietnameseName = (gender: string): string => {
  const names: { [key: string]: string } = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
    UNKNOWN: "Không xác định",
  };
  return names[gender] || gender;
};

const fetchGenderReport = async (): Promise<GenderReportResponse> => {
  const response = await api.get("/reports/patients-by-gender");
  if (response.data?.success) {
    return response.data.data;
  }
  throw new Error(response.data?.message || "Failed to fetch gender report");
};

export default function GenderReport() {
  const [data, setData] = useState<GenderReportResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const report = await fetchGenderReport();
      setData(report);
      toast.success("Tải dữ liệu báo cáo thành công");
    } catch (error: any) {
      console.error("Error loading gender report:", error);
      toast.error(error.message || "Lỗi khi tải báo cáo");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get("/reports/patients-by-gender/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "patients-by-gender-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex-1 p-8">
          <div className="text-center">Đang tải...</div>
        </div>
      </AdminSidebar>
    );
  }

  if (!data) {
    return (
      <AdminSidebar>
        <div className="flex-1 p-8">
          <div className="text-center">Không có dữ liệu</div>
        </div>
      </AdminSidebar>
    );
  }

  const chartData = data.byGender.map((item) => ({
    name: getVietnameseName(item.gender),
    count: item.count,
    percentage: parseFloat((item.percentage || 0).toFixed(2)),
    averageAge: item.averageAge || 0,
  }));

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Báo cáo bệnh nhân theo giới tính
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={loadReport}
                variant="outline"
                className="gap-2"
                disabled={loading}
              >
                <Download className="w-4 h-4" />
                Làm mới
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={!data || loading}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tổng bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.total.toLocaleString("vi-VN")}
              </div>
            </CardContent>
          </Card>

          {data.byGender.map((item) => (
            <Card
              key={item.gender}
              className="dark:bg-slate-800 dark:border-slate-700"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {getVietnameseName(item.gender)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.count}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    ({(item.percentage || 0).toFixed(1)}%)
                  </div>
                </div>
                {item.averageAge !== null && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Tuổi trung bình: {item.averageAge} tuổi
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Tỷ lệ giới tính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Tooltip
                      formatter={(value: any) => {
                        if (typeof value === "number") {
                          return `${value} bệnh nhân`;
                        }
                        return value;
                      }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(1)}%`
                      }
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColorForGender(
                            data.byGender[index].gender
                          )}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {}
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                Số lượng bệnh nhân theo giới tính
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '320px' }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => value.toLocaleString("vi-VN")}
                    />
                    <Tooltip
                      formatter={(value: any) => {
                        if (typeof value === "number") {
                          return value.toLocaleString("vi-VN");
                        }
                        return value;
                      }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColorForGender(
                            data.byGender[index].gender
                          )}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="dark:bg-slate-800 dark:border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Tuổi trung bình theo giới tính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: '320px' }}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.1}
                  />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis
                    stroke="#6b7280"
                    label={{ value: "Tuổi", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value: any) => {
                      if (typeof value === "number") {
                        return `${value} tuổi`;
                      }
                      return value;
                    }}
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageAge"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Tuổi trung bình"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="dark:bg-slate-800 dark:border-slate-700 mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Chi tiết theo giới tính
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Giới tính
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Số lượng
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Tỷ lệ %
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      Tuổi trung bình
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byGender.map((item) => (
                    <tr
                      key={item.gender}
                      className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getColorForGender(item.gender),
                            }}
                          />
                          <span className="text-slate-900 dark:text-white font-medium">
                            {getVietnameseName(item.gender)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                        {item.count.toLocaleString("vi-VN")}
                      </td>
                      <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                        {(item.percentage || 0).toFixed(2)}%
                      </td>
                      <td className="text-right py-3 px-4 text-slate-700 dark:text-slate-300">
                        {item.averageAge !== null ? `${item.averageAge} tuổi` : "N/A"}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 font-semibold">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      Tổng cộng
                    </td>
                    <td className="text-right py-3 px-4 text-slate-900 dark:text-white">
                      {data.total.toLocaleString("vi-VN")}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-900 dark:text-white">
                      100%
                    </td>
                    <td className="text-right py-3 px-4">
                      {data.byGender.length > 0 && (
                        <span className="text-slate-900 dark:text-white">
                          {Math.round(
                            data.byGender.reduce(
                              (sum, item) => sum + (item.averageAge || 0),
                              0
                            ) / data.byGender.length
                          )}{" "}
                          tuổi
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  );
}
