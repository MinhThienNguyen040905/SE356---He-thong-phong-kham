import SidebarLayout from "../SidebarLayout";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  FileText,
  UsersRound,
  Banknote,
  Component,
  Clock,
  UserCheck,
  Package,
} from "lucide-react";
import type { ReactNode } from "react";

interface AdminSidebarProps {
  children?: ReactNode;
  userName?: string;
}

const AdminSidebar = ({ children, userName }: AdminSidebarProps) => {
  const location = useLocation();

  const adminMenu = [
    {
      title: "Dashboard",
      items: [
        {
          label: "Bảng Điều khiển",
          href: "/admin/dashboard",
          icon: <LayoutDashboard size={24} strokeWidth={2.5} />,
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          label: "Lịch hẹn",
          href: "/admin/schedule",
          icon: <CalendarDays size={24} strokeWidth={2.5} />,
        },
        {
          label: "Kho thuốc",
          href: "/admin/inventory",
          icon: <Package size={24} strokeWidth={2.5} />,
        },
        {
          label: "Chuyên khoa",
          href: "/admin/specialties",
          icon: <Component size={24} strokeWidth={2.5} />,
        },
        {
          label: "Ca làm việc",
          href: "/admin/shifts",
          icon: <Clock size={24} strokeWidth={2.5} />,
        },
        {
          label: "Mẫu ca làm việc",
          href: "/admin/shift-templates",
          icon: <FileText size={24} strokeWidth={2.5} />,
        },
        {
          label: "Tạo lịch làm việc",
          href: "/admin/schedule-generation",
          icon: <CalendarDays size={24} strokeWidth={2.5} />,
        },
        {
          label: "Lương",
          href: "/admin/salary",
          icon: <Banknote size={24} strokeWidth={2.5} />,
        },
        {
          label: "Chấm công",
          href: "/admin/attendance",
          icon: <UserCheck size={24} strokeWidth={2.5} />,
        },
      ],
    },
    {
      title: "Báo cáo",
      items: [
        {
          label: "Doanh thu",
          href: "/admin/reports/financial",
          icon: <Banknote size={24} strokeWidth={2.5} />,
        },
        {
          label: "Lich hẹn",
          href: "/admin/reports/appointments",
          icon: <CalendarDays size={24} strokeWidth={2.5} />,
        },
        {
          label: "Bệnh nhân",
          href: "/admin/reports/patient-statistics",
          icon: <UsersRound size={24} strokeWidth={2.5} />,
        },
        {
          label: "Thuốc",
          href: "/admin/reports/medicines",
          icon: <ClipboardList size={24} strokeWidth={2.5} />,
        },
      ],
    },
    {
      title: "Quản lý người dùng",
      items: [
        {
          label: "Người dùng",
          href: "/admin/users",
          icon: <UsersRound size={24} strokeWidth={2.5} />,
        },
        {
          label: "Nhân viên",
          href: "/admin/employees",
          icon: <UsersRound size={24} strokeWidth={2.5} />,
        },
        {
          label: "Bệnh nhân",
          href: "/admin/patients",
          icon: <UserCheck size={24} strokeWidth={2.5} />,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          label: "Cài đặt hệ thống",
          href: "/admin/settings",
          icon: <Component size={24} strokeWidth={2.5} />,
        },
      ],
    },
  ];

  return (
    <SidebarLayout
      logoText="HealthCare Admin"
      userName={userName || "Admin"}
      pageContent={children || undefined}
    >
      {adminMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3 mt-4 first:mt-0">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => {
              
              const isActive = location.pathname === item.href;

              return (
                <Link
                  to={item.href}
                  key={itemIndex}
                  className={`
                    flex items-center gap-3 w-full text-left group p-2 rounded-lg transition-colors -ml-2
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50 text-gray-500"
                    }
                  `}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? "text-blue-600" : "group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-bold text-base transition-colors ${
                      isActive
                        ? "text-blue-700"
                        : "text-gray-700 group-hover:text-black"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </SidebarLayout>
  );
};

export default AdminSidebar;
