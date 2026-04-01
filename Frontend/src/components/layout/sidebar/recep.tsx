import React, { type ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import SidebarLayout from "../SidebarLayout";
import { 
  LayoutDashboard, 
  Users,   
  CalendarClock,    
  Receipt,
  UserCheck,
  Wallet,
  UserCircle,
  PlusCircle
} from 'lucide-react';

interface ReceptionistLayoutProps {
  children?: ReactNode;
  userName?: string;
}

const ReceptionistSidebar = ({ children, userName }: ReceptionistLayoutProps) => {
  const location = useLocation(); 

  const receptionistMenu = [
    {
      title: "Hệ thống",
      items: [
        { label: "Bảng điều khiển", href: "/receptionist/dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Nghiệp vụ",
      items: [
        { label: "Bệnh nhân", href: "/recep/patients", icon: <Users size={24} strokeWidth={2.5} /> },
        { label: "Lịch hẹn", href: "/appointments", icon: <CalendarClock size={24} strokeWidth={2.5} /> },
        { label: "Hóa đơn", href: "/invoices", icon: <Receipt size={24} strokeWidth={2.5} /> },
        { label: "Đặt lịch Offline", href: "/recep/appointments/offline", icon: <PlusCircle size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Cá nhân",
      items: [
        { label: "Chấm công", href: "/attendance", icon: <UserCheck size={24} strokeWidth={2.5} /> },
        { label: "Phiếu lương", href: "/my-payrolls", icon: <Wallet size={24} strokeWidth={2.5} /> },
        { label: "Hồ sơ cá nhân", href: "/receptionist/profile", icon: <UserCircle size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare"
      userName={userName || "Receptionist"}
      pageContent={children || undefined}
    >
      {receptionistMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3 mt-4 first:mt-0">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");

              return (
                <Link 
                  to={item.href}
                  key={itemIndex}
                  className={`
                    flex items-center gap-3 w-full text-left group p-2 rounded-lg transition-colors -ml-2
                    ${isActive 
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-500"
                    }
                  `}
                >
                  <span className={`transition-colors ${isActive ? "text-blue-600" : "group-hover:text-blue-600"}`}>
                    {item.icon}
                  </span>
                  <span className={`font-bold text-base transition-colors ${isActive ? "text-blue-700" : "text-gray-700 group-hover:text-black"}`}>
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

export default ReceptionistSidebar;