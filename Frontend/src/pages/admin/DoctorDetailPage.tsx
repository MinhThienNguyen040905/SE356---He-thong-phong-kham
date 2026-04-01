import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from '../../components/layout/sidebar/admin';
import { 
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Save,
  X,
  Upload,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../../lib/api";


interface Doctor {
  id: number
  doctorCode: string
  userId: number
  specialtyId: number
  position?: string
  degree?: string
  description?: string
  createdAt: string
  updatedAt: string
  user: {
    id: number
    fullName: string
    email: string
    isActive: boolean
    avatar?: string
    employee?: {
      phone?: string
      address?: string
    }
  }
  specialty: {
    id: number
    name: string
  }
}



export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingContact, setEditingContact] = useState(false);
  
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  
  const [personalForm, setPersonalForm] = useState({
    position: "",
    degree: "",
    description: ""
  });
  
  const [contactForm, setContactForm] = useState({
    email: "",
    fullName: ""
  });

  
  const [activeTab, setActiveTab] = useState<"overview" | "schedule">("overview")
  
  
  const [shifts, setShifts] = useState<any[]>([])
  const [isLoadingShifts, setIsLoadingShifts] = useState(false)

  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('JavaScript Error:', event.error);
      setError('Có lỗi xảy ra trong ứng dụng. Vui lòng refresh trang.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  
  const fetchDoctor = async () => {
    if (!id) {
      setError('ID bác sĩ không hợp lệ');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching doctor with ID:', id);
      const response = await api.get(`/doctors/${id}`)
      console.log('Doctor response:', response.data);
      
      if (response.data.success && response.data.data) {
        const doctorData = response.data.data;
        
        
        if (!doctorData.user || !doctorData.specialty) {
          throw new Error('Dữ liệu bác sĩ không đầy đủ');
        }
        
        setDoctor(doctorData);
        
        setPersonalForm({
          position: doctorData.position || "",
          degree: doctorData.degree || "",
          description: doctorData.description || ""
        });
        setContactForm({
          email: doctorData.user.email || "",
          fullName: doctorData.user.fullName || ""
        });
      } else {
        throw new Error(response.data.message || 'Không thể tải thông tin bác sĩ');
      }
    } catch (err: any) {
      console.error('Error fetching doctor:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải thông tin bác sĩ';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  const updateDoctor = async (updateData: Partial<Doctor>) => {
    if (!id || !doctor) {
      console.error('Missing id or doctor data');
      return false;
    }
    
    try {
      console.log('Updating doctor with data:', updateData);
      const response = await api.put(`/doctors/${id}`, updateData);
      console.log('Update response:', response.data);

      if (response.data.success) {
        
        toast.success('Cập nhật thông tin thành công');
        return true;
      } else {
        throw new Error(response.data.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      console.error('Error updating doctor:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Cập nhật thất bại';
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  
  const fetchDoctorShifts = async () => {
    if (!id) return
    
    try {
      setIsLoadingShifts(true)
      
      const endpoint = `/doctors/${id}/shifts`
      
      try {
        const response = await api.get(endpoint)
        if (response.data.success && response.data.data) {
          const shiftsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data]
          setShifts(shiftsData)
          return
        }
      } catch (err: any) {
        
        if (err.response?.status === 429) {
          toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
          setShifts([])
          return
        }
        
        if (err.response?.status === 404) {
          try {
            const altResponse = await api.get(`/doctor-shifts/doctor/${id}`)
            if (altResponse.data.success && altResponse.data.data) {
              const shiftsData = Array.isArray(altResponse.data.data) 
                ? altResponse.data.data 
                : [altResponse.data.data]
              setShifts(shiftsData)
              return
            }
          } catch (altErr: any) {
            if (altErr.response?.status === 429) {
              toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
            }
          }
        }
      }
      
      
      setShifts([])
    } catch (error: any) {
      console.error('Error fetching shifts:', error)
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      }
      setShifts([])
    } finally {
      setIsLoadingShifts(false)
    }
  }

  
  useEffect(() => {
    if (activeTab === "schedule" && id) {
      
      const timer = setTimeout(() => {
        fetchDoctorShifts()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [activeTab, id])
  
  
  const handlePersonalEdit = () => {
    setEditingPersonal(true);
    if (doctor) {
      setPersonalForm({
        position: doctor.position || "",
        degree: doctor.degree || "",
        description: doctor.description || ""
      });
    }
  };

  const handlePersonalSave = async () => {
    try {
      if (!doctor) {
        toast.error('Không tìm thấy thông tin bác sĩ');
        return;
      }

      const success = await updateDoctor({
        specialtyId: doctor.specialtyId,
        position: personalForm.position,
        degree: personalForm.degree,
        description: personalForm.description
      });
      
      if (success) {
        setEditingPersonal(false);
        
        await fetchDoctor();
      }
    } catch (error) {
      console.error('Error in handlePersonalSave:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const handlePersonalCancel = () => {
    try {
      setEditingPersonal(false);
      if (doctor) {
        setPersonalForm({
          position: doctor.position || "",
          degree: doctor.degree || "",
          description: doctor.description || ""
        });
      }
    } catch (error) {
      console.error('Error in handlePersonalCancel:', error);
    }
  };

  
  const handleContactEdit = () => {
    try {
      setEditingContact(true);
      if (doctor) {
        setContactForm({
          email: doctor.user?.email || "",
          fullName: doctor.user?.fullName || ""
        });
      }
    } catch (error) {
      console.error('Error in handleContactEdit:', error);
    }
  };

  const handleContactSave = () => {
    try {
      
      
      toast.info('Cập nhật thông tin liên hệ cần API riêng cho User');
      setEditingContact(false);
    } catch (error) {
      console.error('Error in handleContactSave:', error);
    }
  };

  const handleContactCancel = () => {
    try {
      setEditingContact(false);
      if (doctor) {
        setContactForm({
          email: doctor.user?.email || "",
          fullName: doctor.user?.fullName || ""
        });
      }
    } catch (error) {
      console.error('Error in handleContactCancel:', error);
    }
  };

  
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
        return;
      }

      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      
      toast.info('Tính năng upload avatar sẽ được thêm sau');
    }
  };

  const getAvatarInitials = (fullName: string) => {
    try {
      if (!fullName || typeof fullName !== 'string') {
        return 'NA';
      }
      return fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'NA';
    } catch (error) {
      return 'NA';
    }
  };

  const getAvatarColor = (name: string) => {
    try {
      if (!name || typeof name !== 'string') {
        return "from-blue-500 to-blue-600";
      }
      const colors = [
        "from-blue-500 to-blue-600",
        "from-purple-500 to-purple-600", 
        "from-orange-500 to-orange-600",
        "from-green-500 to-green-600",
        "from-red-500 to-red-600",
        "from-indigo-500 to-indigo-600",
        "from-pink-500 to-pink-600",
        "from-teal-500 to-teal-600"
      ];
      const index = name.length % colors.length;
      return colors[index];
    } catch (error) {
      return "from-blue-500 to-blue-600";
    }
  };

  
  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin bác sĩ...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  
  if (error) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchDoctor} className="bg-blue-600 hover:bg-blue-700">
                Thử lại
              </Button>
              <Link to="/admin/doctors">
                <Button variant="outline">
                  Quay lại danh sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  
  
  if (!doctor) {
    return (
      <AdminSidebar>
        <div className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
            <Link to="/admin/doctors" className="text-blue-600 hover:underline">
              Back to Doctor List
            </Link>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {}
        <div className="mb-6">
          <Link 
            to="/admin/doctors" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Doctor List</span>
          </Link>
        </div>

        {}
        {(() => {
          try {
            return (
              <>
                {}
                <Card className="border-0 shadow-lg mb-8">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-6">
                        {}
                        <div className="relative">
                          {avatarUrl || (doctor?.user?.avatar) ? (
                            <img 
                              src={avatarUrl || `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${doctor?.user?.avatar}`} 
                              alt={doctor?.user?.fullName || 'Doctor'}
                              className="w-24 h-24 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(doctor?.user?.fullName || '')} flex items-center justify-center text-white font-bold text-2xl`}>
                              {getAvatarInitials(doctor?.user?.fullName || '')}
                            </div>
                          )}
                          
                          {}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                              {doctor?.user?.fullName || 'Tên không xác định'}
                            </h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {doctor?.doctorCode || 'Mã không xác định'}
                            </span>
                          </div>
                          <p className="text-lg text-gray-600 mb-3">
                            Khoa {doctor?.specialty?.name || 'Chuyên khoa không xác định'}
                          </p>
                          {doctor?.position && (
                            <p className="text-sm text-gray-500">{doctor.position}</p>
                          )}
                        </div>
                      </div>

                      {}
                      <div className="flex items-center gap-3">
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleAvatarUpload}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Avatar
                        </Button>
                        <Button variant="outline" className="border-gray-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          Manage Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          } catch (error) {
            console.error('Render error:', error);
            return (
              <div className="text-center p-8">
                <p className="text-red-600">Có lỗi hiển thị. Vui lòng refresh trang.</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Refresh
                </Button>
              </div>
            );
          }
        })()}

        {}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("schedule")}
                className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "schedule"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lịch trực
              </button>
            </nav>
          </div>
        </div>

        {}
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2 space-y-8">
            
            {}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Personal Information
                </CardTitle>
                {!editingPersonal ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={handlePersonalEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-800"
                      onClick={handlePersonalSave}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={handlePersonalCancel}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!editingPersonal ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">POSITION</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.position || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">DEGREE</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.degree || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">DESCRIPTION</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.description || 'Chưa có mô tả'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">SPECIALTY</label>
                      <p className="text-gray-900 font-medium mt-1">{doctor.specialty.name}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="position" className="text-sm font-medium text-gray-500 uppercase tracking-wide">POSITION</Label>
                      <Input
                        id="position"
                        value={personalForm.position}
                        onChange={(e) => setPersonalForm({...personalForm, position: e.target.value})}
                        placeholder="e.g., Senior Doctor, Chief of Cardiology"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="degree" className="text-sm font-medium text-gray-500 uppercase tracking-wide">DEGREE</Label>
                      <Input
                        id="degree"
                        value={personalForm.degree}
                        onChange={(e) => setPersonalForm({...personalForm, degree: e.target.value})}
                        placeholder="e.g., MD, PhD, MBBS"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium text-gray-500 uppercase tracking-wide">DESCRIPTION</Label>
                      <Input
                        id="description"
                        value={personalForm.description}
                        onChange={(e) => setPersonalForm({...personalForm, description: e.target.value})}
                        placeholder="Brief description about the doctor"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Contact Details
                </CardTitle>
                {!editingContact ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    onClick={handleContactEdit}
                  >
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-800"
                      onClick={handleContactSave}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={handleContactCancel}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!editingContact ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">EMAIL ADDRESS</label>
                        <p className="text-gray-900 font-medium">{doctor.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">PHONE NUMBER</label>
                        <p className="text-gray-900 font-medium">{doctor.user.employee?.phone || 'Chưa cập nhật'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">STATUS</label>
                        <p className="text-gray-900 font-medium">
                          {doctor.user.isActive ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-500 uppercase tracking-wide">EMAIL ADDRESS</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="doctor@email.com"
                          className="flex-1"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email không thể chỉnh sửa từ đây</p>
                    </div>

                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-gray-500 uppercase tracking-wide">FULL NAME</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <Input
                          id="fullName"
                          value={contactForm.fullName}
                          onChange={(e) => setContactForm({...contactForm, fullName: e.target.value})}
                          placeholder="Full Name"
                          className="flex-1"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Tên không thể chỉnh sửa từ đây</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {}
          <div className="space-y-8">
            

            {}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded"></div>
                  Duty Schedule
                </CardTitle>
                <span className="text-sm text-blue-600 font-medium">THIS WEEK</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Today (Wed)</span>
                  </div>
                  <span className="text-sm text-gray-600">08:00 - 16:00</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Thu, Oct 24</span>
                  </div>
                  <span className="text-sm text-gray-600">10:00 - 18:00</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-900">Fri, Oct 25</span>
                  </div>
                  <span className="text-sm text-gray-600">08:00 - 16:00</span>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => navigate(`/admin/doctors/${id}/shilf`)}
                >
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        ) : (
          
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Lịch trực của bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingShifts ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : shifts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Chưa có lịch trực</p>
                  <p className="text-sm">Bác sĩ này chưa được phân công ca trực nào.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate(`/admin/doctors/${id}/shift`)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Quản lý lịch trực
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ngày</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ca trực</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Thời gian</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shifts.map((shift: any, index: number) => (
                          <tr key={shift.id || index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {shift.date 
                                    ? new Date(shift.date).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                      })
                                    : shift.shiftDate || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700">
                                {shift.shift?.name || shift.shiftName || "N/A"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {shift.shift?.startTime || shift.startTime || "N/A"} - {shift.shift?.endTime || shift.endTime || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant="outline"
                                className={
                                  shift.status === "CANCELLED" || shift.isCancelled
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {shift.status === "CANCELLED" || shift.isCancelled ? "Đã hủy" : "Đang hoạt động"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin/doctors/${id}/shift`)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Quản lý lịch trực
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminSidebar>
  );
}