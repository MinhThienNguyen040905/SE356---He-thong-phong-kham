import { useNavigate, useLocation } from "react-router-dom";
import {
  House, 
  ClipboardClock,   
  CalendarPlus,     
  SquareActivity,    
  Pill,              
  Receipt,           
  HelpCircle,        
  Settings,          
} from 'lucide-react';
import { cn } from "../../../lib/utils";
import SidebarLayout from "../SidebarLayout";
import type { ReactNode } from 'react';

interface PatientSidebarProps {
  children?: ReactNode;
  userName?: string;
  patientCode?: string;
}

const PatientSidebar = ({ children, userName, patientCode }: PatientSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const PatientMenu = [
    {
      title: "CÁ NHÂN",
      items: [
        { 
          label: "Trang chủ", 
          icon: <House size={24} strokeWidth={2.5} />,
          href: "/patient/dashboard",
          onClick: () => navigate("/patient/dashboard")
        },
        { 
          label: "Lịch khám bệnh", 
          icon: <ClipboardClock size={24} strokeWidth={2.5} />,
          href: "/patient/appointments",
          onClick: () => navigate("/patient/appointments")
        },
        { 
          label: "Đặt lịch khám", 
          icon: <CalendarPlus size={24} strokeWidth={2.5} />,
          href: "/patient/book-appointment",
          onClick: () => navigate("/patient/book-appointment")
        },
        { 
          label: "Hồ sơ sức khỏe", 
          icon: <SquareActivity size={24} strokeWidth={2.5} />,
          href: "/patient/medical-history",
          onClick: () => navigate("/patient/medical-history")
        },
        { 
          label: "Đơn thuốc", 
          icon: <Pill size={24} strokeWidth={2.5} />,
          href: "/patient/prescriptions",
          onClick: () => navigate("/patient/prescriptions")
        },
        { 
          label: "Hóa đơn", 
          icon: <Receipt size={24} strokeWidth={2.5} />,
          href: "/patient/invoices",
          onClick: () => navigate("/patient/invoices")
        }
      ]
    },
    {
      title: "HỖ TRỢ",
      items: [
        { 
          label: "Trung tâm trợ giúp", 
          icon: <HelpCircle size={24} strokeWidth={2.5} />,
          href: "/help",
          onClick: () => navigate("/help")
        },
        { 
          label: "Cài đặt tài khoản", 
          icon: <Settings size={24} strokeWidth={2.5} />,
          href: "/patient/settings",
          onClick: () => navigate("/patient/settings")
        }
      ]
    },
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <SidebarLayout 
      logoText="HealthCare"
      userName={userName || "Patient"}
      patientCode={patientCode}
      pageContent={
        <div className="h-full space-y-6">
          {children} 
        </div>
      }
    >
      {PatientMenu.map((group, index) => (
        <div key={index} className={index > 0 ? "mt-8" : ""}>
          {}
          <div className="mb-3 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {group.title}
            </span>
          </div>
          
          <div className="space-y-2">
            {group.items.map((item, itemIndex) => {
              const active = isActive(item.href);

              return (
                <button 
                  key={itemIndex}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full text-left group p-2 rounded-lg transition-colors -ml-2",
                    active 
                      ? "bg-primary/10 text-primary hover:bg-primary/15 border-l-4 border-primary" 
                      : "hover:bg-gray-50 text-gray-800"
                  )}
                >
                  <span className={cn(
                    active ? "text-primary" : "text-gray-800"
                  )}>
                    {item.icon}
                  </span>
                  <span className={cn(
                    "font-bold text-base",
                    active ? "text-primary" : "text-black"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </SidebarLayout>
  );
};

export default PatientSidebar;