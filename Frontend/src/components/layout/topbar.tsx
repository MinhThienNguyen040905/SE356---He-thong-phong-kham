import React, { useState, useRef, useEffect } from 'react';
import { Menu, User as UserIcon, LogOut } from 'lucide-react';
import NotificationBell from '../../features/notification/components/NotificationBell';
import SearchBar from '../shared/SearchBar';
import { useAuth } from '../../features/auth/context/authContext';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface TopbarProps {
  onMenuClick: () => void;
  userName?: string;
  userRole?: string;
  patientCode?: string;
}

const Topbar = ({ onMenuClick, userName, userRole, patientCode }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = userName || user?.fullName || "User";
  
  
  const getRoleLabel = () => {
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
  
  const displayRole = getRoleLabel();
  const displayCode = patientCode || "";

  
  const getProfileRoute = () => {
    switch (user?.roleId) {
      case 1: return '/admin/profile';
      case 2: return '/receptionist/profile';
      case 3: return '/patient/profile';
      case 4: return '/doctor/profile';
      default: return '/patient/profile';
    }
  };

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setIsLogoutDialogOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(getProfileRoute());
  };

  return (
    <>
      <div className="bg-white rounded-lg md:rounded-[20px] px-3 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm mb-4 md:mb-6 border border-gray-100">
        {}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
        </button>

        {}
        <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
          <SearchBar />
        </div>

        {}
        <div className="flex items-center gap-2 md:gap-4">
          {}
          {displayRole && (
            <span className="hidden sm:inline-block text-xs md:text-sm font-medium text-gray-600 px-2 md:px-3 py-1 bg-gray-100 rounded-full">
              {displayRole}
            </span>
          )}

          {}
          <NotificationBell />

          {}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg p-1.5 md:p-2 transition-colors"
            >
              {}
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                {displayCode && (
                  <div className="text-xs text-gray-500">{displayCode}</div>
                )}
              </div>
              {}
              <div
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold overflow-hidden shrink-0"
                title="Mở menu tài khoản"
              >
                {user?.avatarUrl ? (
                  <img 
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${user.avatarUrl}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
            </button>

            {}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tài khoản
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon size={18} />
                    Thông tin cá nhân
                  </button>

                  <div className="my-1 h-px bg-gray-100" />

                  <button
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-600 hover:bg-red-700">
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Topbar;