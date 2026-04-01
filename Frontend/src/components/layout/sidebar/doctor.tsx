import SidebarLayout from "../SidebarLayout";
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList,
  Pill,
  Calendar,
  UserCheck,
  FileText,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface DoctorSidebarProps {
  children?: ReactNode;
  userName?: string;
}

const DoctorSidebar = ({ children, userName }: DoctorSidebarProps) => {
  const location = useLocation();

  const doctorMenu = [
    {
      title: "Hệ thống",
      items: [
        { label: "Bảng điều khiển", href: "/doctor/dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    
    {
      title: "Lịch",
      items: [
        { label: "Lịch của tôi", href: "/doctor/shift", icon: <Calendar size={24} strokeWidth={2.5} /> }
      ]
    },
    
    {
      title: "Khám bệnh",
      items: [
        { label: "Danh sách bệnh nhân", href: "/doctor/medicalList", icon: <ClipboardList size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Thuốc",
      items: [
        { label: "Danh sách thuốc", href: "/doctor/prescriptions", icon: <Pill size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Chấm công",
      items: [
        { label: "Chấm công", href: "/attendance", icon: <UserCheck size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Lương",
      items: [
        { label: "Lương của tôi", href: "/my-payrolls", icon: <FileText size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare Doctor"
      userName={userName || "Doctor"}
      pageContent={children || undefined}
    >
      {doctorMenu.map((group, index) => (
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

export default DoctorSidebar;