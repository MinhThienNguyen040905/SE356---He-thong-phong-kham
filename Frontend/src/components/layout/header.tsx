"use client"

import { Button } from "../ui/button"
import { 
  Menu, 
  X, 
  User, 
  Home, 
  Calendar, 
  LogOut 
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/context/authContext"
import { logError } from "../../utils/logger"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate();

  const { user, logout } = useAuth(); 
  
  const patientName = user?.fullName || user?.email?.split('@')[0] || "Bệnh nhân";

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate("/login"); 
    } catch (error) {
      logError("Failed to log out", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          
          {}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200 transition-all group-hover:scale-105 group-hover:shadow-blue-300">
               <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">HealthCare</span>
               <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase -mt-1">Plus</span>
            </div>
          </Link>

          {}
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#services" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Dịch vụ</a>
            <a href="#doctors" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Đội ngũ bác sĩ</a>
            <a href="#process" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Quy trình</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Liên hệ</a>
          </nav>

          {}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-3 rounded-full border border-gray-200 p-1 pl-4 pr-1 transition-all hover:bg-gray-50 hover:border-gray-300 ${isProfileOpen ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
                >
                  <span className="text-sm font-semibold text-gray-700 max-w-[150px] truncate">{patientName}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 border border-blue-200 shadow-sm">
                    <User size={18} />
                  </div>
                </button>

                {}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 mb-1 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tài khoản của tôi</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-1">{user.email}</p>
                    </div>

                    <div className="space-y-1 p-1">
                      <Link 
                        to="/patient/dashboard" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Home size={18} /> Tổng quan
                      </Link>
                      <Link 
                        to="/patient/appointments" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Calendar size={18} /> Lịch hẹn
                      </Link>
                      
                      <div className="my-1 h-px bg-gray-100" />

                      <button 
                        onClick={handleLogout} 
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              
              <div className="flex items-center gap-3">
                 <Link to="/login">
                  <Button variant="ghost" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 font-medium">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 rounded-lg px-6 font-medium">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>
          
          {}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {}
        {mobileMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              <a href="#services" className="text-base font-medium text-gray-700 px-2" onClick={() => setMobileMenuOpen(false)}>Dịch vụ</a>
              <a href="#doctors" className="text-base font-medium text-gray-700 px-2" onClick={() => setMobileMenuOpen(false)}>Đội ngũ bác sĩ</a>
              <a href="#process" className="text-base font-medium text-gray-700 px-2" onClick={() => setMobileMenuOpen(false)}>Quy trình</a>
              <a href="#contact" className="text-base font-medium text-gray-700 px-2" onClick={() => setMobileMenuOpen(false)}>Liên hệ</a>
              
              <div className="border-t border-gray-100 my-2"></div>
              
              {user ? (
                <>
                   <div className="px-2 py-2 text-sm text-gray-500">Xin chào, <span className="font-bold text-gray-900">{patientName}</span></div>
                   <Link to="/patient/dashboard" className="flex items-center gap-2 text-sm font-medium px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Home size={18} /> Tổng quan
                   </Link>
                   <Link to="/patient/appointments" className="flex items-center gap-2 text-sm font-medium px-2 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <Calendar size={18} /> Lịch hẹn
                   </Link>
                   <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-600 px-2 py-2 hover:bg-red-50 rounded-lg w-full text-left mt-2">
                      <LogOut size={18} /> Đăng xuất
                   </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-2">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full justify-center">Đăng nhập</Button>
                  </Link>
                  <Link to="/login" className="w-full">
                     <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700">Đăng ký khám</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}