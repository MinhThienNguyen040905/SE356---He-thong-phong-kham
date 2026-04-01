
import { useState } from "react"
import AdminSidebar from "../../components/layout/sidebar/admin"
import { Search, Eye, CheckCircle, XCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

export default function RefundsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  
  const refunds = [
    {
      id: "RF-2024-001",
      invoiceId: "INV-001",
      patientName: "Nguyễn Văn A",
      amount: 500000,
      reason: "Thuốc không đúng",
      status: "PENDING",
      requestDate: "2024-01-10",
    },
    {
      id: "RF-2024-002",
      invoiceId: "INV-005",
      patientName: "Trần Thị B",
      amount: 1200000,
      reason: "Dịch vụ đã hủy",
      status: "APPROVED",
      requestDate: "2024-01-09",
    },
     {
      id: "RF-2024-003",
      invoiceId: "INV-008",
      patientName: "Lê Văn C",
      amount: 300000,
      reason: "Bệnh nhân không đến",
      status: "REJECTED",
      requestDate: "2024-01-08",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Đã duyệt</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Từ chối</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ duyệt</Badge>
    }
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Hoàn tiền</h1>
          <p className="text-gray-500">Xem và xử lý các yêu cầu hoàn tiền từ bệnh nhân</p>
        </div>

        {}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm theo mã hoàn tiền, hóa đơn, tên bệnh nhân..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Mã Hoàn Tiền</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Hóa Đơn</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Bệnh Nhân</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Số Tiền</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Lý Do</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Ngày Yêu Cầu</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-500">Trạng Thái</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-500">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => (
                  <tr key={refund.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">{refund.id}</td>
                    <td className="py-4 px-6 text-blue-600 hover:underline cursor-pointer">{refund.invoiceId}</td>
                    <td className="py-4 px-6">{refund.patientName}</td>
                    <td className="py-4 px-6 font-semibold">{refund.amount.toLocaleString("vi-VN")} VND</td>
                    <td className="py-4 px-6 text-gray-600">{refund.reason}</td>
                    <td className="py-4 px-6 text-gray-600">{refund.requestDate}</td>
                    <td className="py-4 px-6">{getStatusBadge(refund.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {refund.status === "PENDING" && (
                          <>
                            <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" title="Duyệt">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Từ chối">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}
