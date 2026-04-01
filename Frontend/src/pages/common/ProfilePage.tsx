import React, { useState, useEffect } from "react";
import { 
  Camera, Save, Lock, Mail, User as UserIcon, Phone, MapPin, 
  Calendar, X, Shield, Activity, Briefcase, GraduationCap, 
  Award, FileText, CheckCircle
} from "lucide-react";
import { ProfileService } from "../../features/auth/services/profile.service";
import type { UserProfile, UpdateProfileData, ChangePasswordData } from "../../types/profile.types";
import { useAuth } from "../../features/auth/context/authContext";
import { toast } from "sonner";

interface ProfilePageProps {
  role: "admin" | "doctor" | "patient" | "receptionist";
}

export default function ProfilePage({ role }: ProfilePageProps) {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    
    dateOfBirth: "",
    gender: "",
    cccd: "",
    phone: "",
    address: "",
    city: "",
    ward: "",
    
    bio: "",
    yearsOfExperience: 0,
    position: "",
    degree: "",
    expertise: "",
  });

  
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getMyProfile();
      setProfile(data);

      
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        
        dateOfBirth: (data.patient?.dateOfBirth || data.doctor?.dateOfBirth)?.split("T")[0] || "",
        gender: data.patient?.gender || data.doctor?.gender || "",
        cccd: data.patient?.cccd || data.doctor?.cccd || "",
        
        phone: data.patient?.profiles?.find((p) => p.type === "phone")?.value || data.doctor?.phone || "",
        address: data.patient?.profiles?.find((p) => p.type === "address")?.value || data.doctor?.address || "",
        city: data.patient?.profiles?.find((p) => p.type === "address")?.city || "",
        ward: data.patient?.profiles?.find((p) => p.type === "address")?.ward || "",
        
        bio: data.doctor?.bio || data.doctor?.description || "",
        yearsOfExperience: data.doctor?.yearsOfExperience || 0,
        position: data.doctor?.position || "",
        degree: data.doctor?.degree || "",
        expertise: data.doctor?.expertise || "",
      });

      
      
      const docWithAvatar = data.doctor as unknown as { avatar?: string };
      const avatarUrl = data.avatar || docWithAvatar?.avatar || data.patient?.avatar;
      
      if (avatarUrl) {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
        setAvatarPreview(`${baseUrl}${avatarUrl}?t=${new Date().getTime()}`);
      }
    } catch (error) {
      
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB");
        return;
      }

      
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh");
        return;
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      
      if (avatarFile) {
        await ProfileService.uploadAvatar(avatarFile);
        toast.success("Cập nhật avatar thành công");
      }

      
      const updateData: UpdateProfileData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        cccd: formData.cccd,
      };

      if (role === "patient") {
        updateData.profiles = [
          { type: "phone", value: formData.phone },
          {
            type: "address",
            value: formData.address,
            city: formData.city,
            ward: formData.ward,
          },
        ];
      } else if (role === "doctor" || role === "admin" || role === "receptionist") {
        updateData.bio = formData.bio;
        updateData.yearsOfExperience = formData.yearsOfExperience;
        updateData.position = formData.position;
        updateData.degree = formData.degree;
        updateData.expertise = formData.expertise;
      }

      const updatedProfile = await ProfileService.updateMyProfile(updateData);
      setProfile(updatedProfile);

      
      await refreshUser();

      toast.success("Cập nhật thông tin thành công");
      setAvatarFile(null); 
      
      setTimeout(() => {
        window.history.back();
      }, 1000);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== confirmPassword) {
        toast.error("Mật khẩu xác nhận không khớp");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      setSaving(true);
      await ProfileService.changePassword(passwordData);

      toast.success("Đổi mật khẩu thành công");

      
      setPasswordData({ currentPassword: "", newPassword: "" });
      setConfirmPassword("");
      setActiveTab("info");
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể đổi mật khẩu");
    } finally {
      setSaving(false);
    }
  };

  
  const getRoleTheme = () => {
    switch (role) {
      case "admin": return { gradient: "from-indigo-600 to-purple-700", text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" };
      case "doctor": return { gradient: "from-blue-500 to-cyan-600", text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
      case "receptionist": return { gradient: "from-pink-500 to-rose-600", text: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200" };
      case "patient": return { gradient: "from-emerald-500 to-teal-600", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
      default: return { gradient: "from-gray-700 to-gray-900", text: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200" };
    }
  };

  const theme = getRoleTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.text}`}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white">
          {}
          <div className={`h-48 w-full bg-gradient-to-r ${theme.gradient} relative`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
            <div className="absolute bottom-4 right-6 text-white/90 text-sm font-medium backdrop-blur-md bg-white/20 px-4 py-1.5 rounded-full">
              {role.toUpperCase()} PROFILE
            </div>
          </div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
              {}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-white flex items-center justify-center overflow-hidden relative z-10 transition-transform duration-300 group-hover:scale-105">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${theme.bg} ${theme.text} text-5xl font-bold`}>
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-2 right-2 z-20 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${theme.gradient} group-hover:scale-110`}
                >
                  <Camera size={18} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div className="flex-1 pt-4 md:pt-0 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{formData.fullName || "User Name"}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                  <Mail size={16} /> {formData.email}
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {role === "patient" && profile?.patient && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Shield size={12} /> BN: {profile.patient.patientCode}
                    </span>
                  )}
                  {(role === "doctor" || role === "admin" || role === "receptionist") && profile?.doctor && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${theme.bg} ${theme.text} border ${theme.border}`}>
                      <Briefcase size={12} /> ID: {profile.doctor.employeeCode}
                    </span>
                  )}
                  {formData.position && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <Award size={12} /> {formData.position}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {}
          <div className="lg:col-span-3 space-y-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "info"
                    ? `bg-white text-gray-900 shadow-md border-l-4 border-${theme.text.split('-')[1]}-500`
                    : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
                }`}
              >
                <UserIcon size={20} className={activeTab === "info" ? theme.text : "text-gray-400"} />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "password"
                    ? `bg-white text-gray-900 shadow-md border-l-4 border-${theme.text.split('-')[1]}-500`
                    : "text-gray-500 hover:bg-white/60 hover:text-gray-700"
                }`}
              >
                <Lock size={20} className={activeTab === "password" ? theme.text : "text-gray-400"} />
                Đổi mật khẩu
              </button>
            </nav>

            {}
            {(role === "doctor" || role === "admin") && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Tổng quan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500">Kinh nghiệm</span>
                     <span className="text-sm font-bold text-gray-900">{formData.yearsOfExperience} năm</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-500">Học vị</span>
                     <span className="text-sm font-bold text-gray-900">{formData.degree || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="lg:col-span-9">
            {activeTab === "info" ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className={theme.text} size={24} />
                    Thông tin chi tiết
                  </h2>
                </div>

                <div className="space-y-8">
                  {}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Họ và tên</label>
                        <div className="relative">
                          <UserIcon size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                            placeholder="Nhập họ tên"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-indigo-600 transition-colors">Email</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                        <div className="relative">
                          <Calendar size={18} className="absolute left-4 top-3.5 text-gray-400" />
                          <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                        <div className="relative">
                           <Activity size={18} className="absolute left-4 top-3.5 text-gray-400" />
                          <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">CCCD / CMND</label>
                        <div className="relative">
                          <FileText size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                          <input
                            type="text"
                            value={formData.cccd}
                            onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                            placeholder="Số CCCD"
                            maxLength={12}
                          />
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                         <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                            placeholder="0123456789"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {}
                  <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Địa chỉ liên hệ</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ thường trú</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                              placeholder="Số nhà, tên đường, khu phố..."
                            />
                          </div>
                        </div>
                        {role === "patient" && (
                          <>
                             <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                                <input
                                  type="text"
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                  placeholder="TP. HCM"
                                />
                             </div>
                             <div className="group">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phường / Xã</label>
                                <input
                                  type="text"
                                  value={formData.ward}
                                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                  placeholder="Phường 1"
                                />
                             </div>
                          </>
                        )}
                     </div>
                  </section>

                   {}
                   {(role === "doctor" || role === "admin" || role === "receptionist") && (
                     <section>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5">Thông tin công việc</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Chức vụ</label>
                              <div className="relative">
                                <Briefcase size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                  type="text"
                                  value={formData.position}
                                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                  placeholder="Ví dụ: Bác sĩ trưởng"
                                />
                              </div>
                           </div>
                           <div className="group">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Học vị</label>
                              <div className="relative">
                                <GraduationCap size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                  type="text"
                                  value={formData.degree}
                                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                  placeholder="Ví dụ: Thạc sĩ"
                                />
                              </div>
                           </div>
                            {role === "doctor" && (
                              <>
                                 {profile?.doctor?.specialty && (
                                   <div className="group">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên khoa</label>
                                      <input
                                        type="text"
                                        value={profile.doctor.specialty.name}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                                      />
                                   </div>
                                 )}
                                 <div className="group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm (năm)</label>
                                    <input
                                      type="number"
                                      value={formData.yearsOfExperience}
                                      onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                      min="0"
                                    />
                                 </div>
                                 <div className="md:col-span-2 group">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-indigo-600 font-semibold">
                                       Lĩnh vực chuyên môn (Expertise)
                                    </label>
                                    <textarea
                                      value={formData.expertise}
                                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                      className="w-full px-4 py-3 border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-white"
                                      rows={3}
                                      placeholder="Mô tả kỹ năng và chuyên môn sâu..."
                                    />
                                 </div>
                              </>
                            )}
                           <div className="md:col-span-2 group">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu (Bio)</label>
                              <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all bg-gray-50/50 focus:bg-white"
                                rows={4}
                                placeholder="Viết vài dòng giới thiệu về bản thân..."
                              />
                           </div>
                        </div>
                     </section>
                   )}

                  {}
                  <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
                    <button
                      onClick={() => window.history.back()}
                      disabled={saving}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <X size={18} />
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className={`px-8 py-3 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock className={theme.text} size={24} />
                    Bảo mật & Mật khẩu
                  </h2>
                </div>

                <div className="max-w-xl mx-auto space-y-8 py-4">
                  <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 flex gap-3 text-orange-800 text-sm">
                    <Shield size={20} className="shrink-0" />
                    <p>Mật khẩu của bạn nên có ít nhất 6 ký tự. Hãy sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all bg-gray-50/50 focus:bg-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all bg-gray-50/50 focus:bg-white"
                          placeholder="Nhập mật khẩu mới"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                       <div className="relative">
                        <CheckCircle size={18} className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all bg-gray-50/50 focus:bg-white"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !confirmPassword}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                         <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Đang xử lý...
                        </>
                      ) : (
                         <>
                          <Lock size={18} />
                          Đổi mật khẩu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
