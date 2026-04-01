import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  Calendar, 
  X,         
} from 'lucide-react';
import Topbar from './topbar';
import { useAuth } from '../../features/auth/context/authContext'; 

interface SidebarLayoutProps {
  children: ReactNode;     
  pageContent?: ReactNode;  
  logoText?: string; 
  userName?: string;
  patientCode?: string;
  userRole?: string;
}

const SidebarLayout = ({ 
  children, 
  pageContent, 
  logoText = "HealthCare", 
  userName,
  patientCode,
  userRole
}: SidebarLayoutProps) => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); 

  
  
  const getUserRoleLabel = () => {
    if (userRole) return userRole; 
    
    const roleId = user?.roleId;
    switch (roleId) {
      case 1:
        return "Quản trị viên";
      case 2:
        return "Lễ tân";
      case 3:
        return "Bệnh nhân";
      case 4:
        return "Bác sĩ";
      default:
        return "";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);   

    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${currentDateTime.getDate().toString().padStart(2, '0')}/${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}/${currentDateTime.getFullYear()} ${currentDateTime.toLocaleTimeString('en-US')}`;

  
  const handleMenuClick = () => {
    
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(true);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {}
      <aside 
        className={
          
          
          `group 
          ${isCollapsed ? 'collapsed' : ''}
          fixed md:relative z-50
          bg-white shadow-xl 
          flex flex-col 
          transition-all duration-300 ease-in-out
          md:overflow-hidden
          h-full inset-y-0 left-0
          
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          
          md:translate-x-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-[20px] md:border md:border-gray-100
          ${isCollapsed ? 'md:w-0' : 'md:w-72'} 
        `}
      >
        {}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 md:hidden text-gray-500"
        >
          <X size={20} />
        </button>

        {}
        <div className={`p-6 flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2' : ''}`}>
          
          {}
          <div className='flex items-center gap-3 mb-6 px-1'>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-200">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              {logoText}
            </span>
          </div>
          {}
          <div className="mb-8 md:hidden mt-8">
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">
              Menu
            </h1>
          </div>

          {}
          <div className="space-y-6">
             {children}
          </div>
        </div>

        {}
        <div className={`
          bg-white mt-auto border-t md:border-none border-gray-100 transition-all
          ${isCollapsed ? 'p-4 flex flex-col items-center' : 'p-6 pb-8'}
        `}>
          
          {}
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-6 whitespace-nowrap overflow-hidden">
              <Calendar className="text-gray-800 min-w-[24px]" size={24} strokeWidth={2} />
              <span className="text-sm font-bold text-black">
                {formattedDate}
              </span>
            </div>
          )}

          {}
        </div>
      </aside>

      {}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pl-0"> 
          <Topbar 
            onMenuClick={handleMenuClick} 
            userName={userName}
            userRole={getUserRoleLabel()}
            patientCode={patientCode}
          />

          <div className="mt-2">
            {pageContent}
          </div>
        </div>
      </main>

    </div>
  );
};

export default SidebarLayout;