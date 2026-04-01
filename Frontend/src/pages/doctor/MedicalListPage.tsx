import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../../components/layout/sidebar/doctor";
import {
  Search,
  Calendar,
  ChevronRight,
  Activity,
  Filter,
  UserCheck,                                              
  Bell,
  Stethoscope,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../features/auth/context/authContext";
import { cn } from "../../lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "../../components/ui/pagination";


interface MedicalAppointment {
  id: number;
  visitId?: number;
  patientId: number;
  doctorId: number;
  shiftId: number;
  date: string;
  slotNumber: number;
  status: "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFERRAL";
  bookingType: string;
  bookedBy: string;
  symptomInitial?: string;
  isVisit?: boolean;
  isReferral?: boolean;
  referralInfo?: any;
  
  patientName?: string;
  patientPhone?: string;
  patientDob?: string;
  patientGender?: "MALE" | "FEMALE";
  
  patient?: {
    id: number;
    fullName?: string;
    gender?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    user?: {
      fullName: string;
    };
  };
  Patient?: {
    id: number;
    fullName?: string;
    User?: {
      fullName: string;
    };
  };
  shift?: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  };
  Shift?: {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
  };
}

export default function MedicalList() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filterStatus, setFilterStatus] = useState<
    "all" | "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "REFERRAL"
  >("all");
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString("en-CA") 
  );
  const [showAllDates, setShowAllDates] = useState(false);
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  
  useEffect(() => {
    if (authLoading) return; 

    if (!user) {
      setError("Please login to access this page.");
      setLoading(false);
      return;
    }

    
    if (user.roleId !== 1 && user.roleId !== 2 && user.roleId !== 4) {
      setError(
        "Access denied. This page is only for doctors, receptionists, and admins."
      );
      setLoading(false);
      return;
    }
  }, [user, authLoading]);
  
  const fetchAppointments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      
      if (!user?.doctorId) {
        if (!silent) setError("Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.");
        if (!silent) setLoading(false);
        return;
      }

      const currentDoctorId = user.doctorId;
      const dateToFetch = showAllDates ? undefined : selectedDate;
      const today = new Date().toLocaleDateString("en-CA");

      
      let appointmentsRes, visitsRes;

      const appointmentsQuery = showAllDates
        ? `/appointments?doctorId=${currentDoctorId}`
        : `/appointments?doctorId=${currentDoctorId}&date=${dateToFetch}`;

      const visitsQuery = showAllDates
        ? `/visits?doctorId=${currentDoctorId}`
        : `/visits?doctorId=${currentDoctorId}&startDate=${dateToFetch}&endDate=${dateToFetch}`;
      
      const referralsQuery = `/visits/referrals/pending`;

      
      const [apptResult, visitResult, refResult] = await Promise.allSettled([
        api.get(appointmentsQuery),
        api.get(visitsQuery),
        api.get(referralsQuery)
      ]);

      
      appointmentsRes = apptResult.status === 'fulfilled' ? apptResult.value : { data: { success: false, data: [] } };
      
      
      visitsRes = visitResult.status === 'fulfilled' ? visitResult.value : { data: { success: false, data: [] } };

      
      let referralsData: any[] = [];
      if (refResult.status === 'fulfilled' && refResult.value.data.success) {
        referralsData = refResult.value.data.data || [];
      }

      if (appointmentsRes.data.success || visitsRes.data.success || referralsData.length > 0) {
        const appointmentsData = appointmentsRes.data.success ? appointmentsRes.data.data || [] : [];
        const visitsData = visitsRes.data.success ? visitsRes.data.data || [] : [];
        
        
        const visitAppointments = visitsData.map((visit: any) => {
          const appointment = visit.appointment || {};
          const patient = visit.patient || {};
          const patientUser = patient.user || {};

          return {
            id: visit.appointmentId || visit.id,
            visitId: visit.id,
            patientId: visit.patientId,
            doctorId: visit.doctorId,
            shiftId: appointment.shiftId,
            date: visit.checkInTime
              ? new Date(visit.checkInTime).toLocaleDateString("en-CA")
              : today,
            slotNumber: appointment.slotNumber || 0,
            status:
              visit.status === "EXAMINING"
                ? "IN_PROGRESS"
                : visit.status === "COMPLETED" || visit.status === "EXAMINED"
                ? "COMPLETED"
                : visit.status === "WAITING"
                ? "CHECKED_IN"
                : "WAITING",
            bookingType: appointment.bookingType || "OFFLINE",
            bookedBy: appointment.bookedBy || "PATIENT",
            symptomInitial: appointment.symptomInitial,
            patient: {
              id: patient.id,
              dateOfBirth: patient.dateOfBirth,
              gender: patient.gender,
              phoneNumber: patient.phoneNumber,
              user: patientUser,
            },
            shift: appointment.shift || visit.appointment?.shift,
            isVisit: true,
            patientName: appointment.patientName,
            patientPhone: appointment.patientPhone,
            patientDob: appointment.patientDob,
            patientGender: appointment.patientGender,
          };
        });

        
        const referralAppointments = referralsData.map((ref: any) => {
           
           
           return {
             id: ref.visit.id, 
             visitId: ref.visit.id,
             patientId: ref.visit.patientId,
             doctorId: currentDoctorId, 
             shiftId: 0,
             date: ref.createdAt.split('T')[0],
             slotNumber: 0,
             status: "REFERRAL", 
             bookingType: "REFERRAL",
             bookedBy: "DOCTOR",
             symptomInitial: ref.reason,
             isVisit: true,
             isReferral: true,
             referralInfo: ref,
             patient: {
               id: ref.visit.patientId,
               fullName: ref.visit.patientName, 
               user: { fullName: ref.visit.patientName } 
             }
           };
        });

        
        const appointmentIdsWithVisits = new Set(
          visitsData.map((v: any) => v.appointmentId).filter(Boolean)
        );
        const uniqueAppointments = appointmentsData
          .filter((apt: any) => !appointmentIdsWithVisits.has(apt.id))
          .map((apt: any) => ({ ...apt, isVisit: false }));

        
        const allAppointments = [...referralAppointments, ...visitAppointments, ...uniqueAppointments];

        console.log(
          "MedicalList - Combined appointments count:",
          allAppointments.length
        );
        
        
        setAppointments(allAppointments);

        
        if (allAppointments.length === 0) {
          setError(null);
        }
      } else {
        
        setAppointments([]);
        setError(appointmentsRes.data.message || "Failed to load appointments");
      }
    } catch (err: any) {
      console.error("MedicalList - Unexpected error:", err);
      setAppointments([]);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while loading appointments";
      setError(errorMessage);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  
  useEffect(() => {
    if (authLoading || !user) return;

    
    if (user.roleId !== 1 && user.roleId !== 2 && user.roleId !== 4) return;

    fetchAppointments();

    
    const intervalId = setInterval(() => {
        fetchAppointments(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user?.id, user?.doctorId, authLoading, selectedDate, showAllDates]);

  const filteredAppointments = appointments.filter((appointment) => {
    
    
    const patientName =
      appointment.patientName ||
      appointment.patient?.user?.fullName ||
      appointment.Patient?.User?.fullName ||
      appointment.patient?.fullName ||
      appointment.Patient?.fullName ||
      "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.id.toString().includes(searchQuery) ||
      appointment.shift?.startTime?.includes(searchQuery) ||
      appointment.Shift?.startTime?.includes(searchQuery);

    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    
    if (a.slotNumber && b.slotNumber) {
      if (a.slotNumber !== b.slotNumber) {
        return a.slotNumber - b.slotNumber;
      }
    }
    
    if (a.slotNumber && !b.slotNumber) return -1;
    if (!a.slotNumber && b.slotNumber) return 1;

    
    return a.id - b.id;
  });

  
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, selectedDate, showAllDates]);

  const waitingCount = appointments.filter(
    (a) => a.status === "WAITING"
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "CANCELLED"
  ).length;
  const completedCount = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;
  const totalAppointments = appointments.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CHECKED_IN":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFERRAL":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Chờ checkin";
      case "CHECKED_IN":
        return "Đã check-in";
      case "IN_PROGRESS":
        return "Đang khám";
      case "COMPLETED":
        return "Đã khám";
      case "CANCELLED":
        return "Đã hủy";
      case "REFERRAL":
        return "Chuyển khoa";
      default:
        return status;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    return today.getFullYear() - birthDate.getFullYear();
  };

  const handleCallPatient = (appointment: MedicalAppointment) => {
    
    if (appointment.isReferral && appointment.visitId) {
       navigate(`/doctor/consultation/${appointment.visitId}`);
       return;
    }

    const idToUse =
      appointment.isVisit && appointment.visitId
        ? appointment.visitId
        : appointment.id;
    navigate(`/doctor/patients/${idToUse}`);
  };

  const handlePrescription = (appointment: MedicalAppointment) => {
    const appointmentId = appointment.id;
    navigate(`/doctor/patients/${appointmentId}/prescription`);
  };

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading appointments...</p>
          </div>
        </div>
      </DoctorSidebar>
    );
  }

  if (error) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading appointments</p>
              <p className="text-sm">{error}</p>
            </div>
            {user?.roleId !== 1 && user?.roleId !== 2 && user?.roleId !== 4 ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  You need to be logged in as a doctor, receptionist, or admin
                  to access this page.
                </p>
                <Button onClick={() => navigate("/login")}>Go to Login</Button>
              </div>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DoctorSidebar>
    );
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        {}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-100 rounded-xl">
                  <Stethoscope className="w-8 h-8 text-indigo-600" />
               </div>
               <h1 className="text-3xl font-bold text-slate-900">
                 Medical Appointments
               </h1>
            </div>
            <p className="text-slate-600 ml-1">
              {showAllDates
                ? "All patient appointments and examinations"
                : `Manage ${
                    selectedDate === new Date().toLocaleDateString("en-CA")
                      ? "today's"
                      : selectedDate
                  } patient appointments and examinations`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowAllDates(false);
              }}
              className="w-40"
              disabled={showAllDates}
            />
            <Button
              variant={showAllDates ? "default" : "outline"}
              onClick={() => {
                setShowAllDates(!showAllDates);
                if (!showAllDates) {
                  setSelectedDate(new Date().toLocaleDateString("en-CA"));
                }
              }}
            >
              {showAllDates ? "Show Today Only" : "Show All Dates"}
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Today
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {totalAppointments}
              </div>
              <p className="text-xs text-slate-500">Total appointments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-yellow-500/5 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Waiting
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {waitingCount}
              </div>
              <p className="text-xs text-slate-500">Patients waiting</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Cancelled
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {cancelledCount}
              </div>
              <p className="text-xs text-slate-500">Cancelled today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Completed
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                {completedCount}
              </div>
              <p className="text-xs text-slate-500">Completed today</p>
            </CardContent>
          </Card>
        </div>
        {}
        <Card className="border-0 shadow-xl shadow-slate-900/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by patient name, appointment ID, or time..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className={
                    filterStatus === "all"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={filterStatus === "WAITING" ? "default" : "outline"}
                  onClick={() => setFilterStatus("WAITING")}
                  className={
                    filterStatus === "WAITING"
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : ""
                  }
                >
                  Waiting
                </Button>

                <Button
                  variant={
                    filterStatus === "IN_PROGRESS" ? "default" : "outline"
                  }
                  onClick={() => setFilterStatus("IN_PROGRESS")}
                  className={
                    filterStatus === "IN_PROGRESS"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : ""
                  }
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                  onClick={() => setFilterStatus("COMPLETED")}
                  className={
                    filterStatus === "COMPLETED"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  Completed
                </Button>
                                <Button
                  variant={
                    filterStatus === "CANCELLED" ? "default" : "outline"
                  }
                  onClick={() => setFilterStatus("CANCELLED")}
                  className={
                    filterStatus === "CANCELLED"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <Card className="border-0 shadow-xl shadow-slate-900/5 overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">
                  {showAllDates ? "All Appointments" : "Today's Appointments"}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {filteredAppointments.length} of {totalAppointments}{" "}
                  appointments
                  {totalAppointments === 0 &&
                    ` (No appointments found${
                      showAllDates ? "" : " for " + selectedDate
                    })`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Tên bệnh nhân
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-700 w-20">
                      STT
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Mã khám
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Giờ khám
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-slate-500"
                      >
                        <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-lg font-medium">
                          No appointments found
                        </p>
                        <p className="text-sm mt-2">
                          {totalAppointments === 0
                            ? "No appointments scheduled for today"
                            : "Try adjusting your search or filter criteria"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedAppointments.map((appointment, index) => (
                      <tr
                        key={appointment.id}
                        className={`border-b hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const patient =
                                appointment.patient || appointment.Patient;

                              
                              const patientName =
                                appointment.patientName ||
                                appointment.patient?.user?.fullName ||
                                appointment.Patient?.User?.fullName ||
                                appointment.patient?.fullName ||
                                appointment.Patient?.fullName ||
                                "";
                                
                              const patientGender = 
                                appointment.patientGender || 
                                appointment.patient?.gender || 
                                "MALE";
                                
                              const patientDateOfBirth = 
                                appointment.patientDob || 
                                appointment.patient?.dateOfBirth;

                              if (!patient && !appointment.patientName) {
                                console.warn(
                                  "No patient data for appointment:",
                                  appointment.id
                                );
                                return (
                                  <div className="text-slate-500">
                                    No patient data
                                  </div>
                                );
                              }

                              return (
                                <>
                                  <div
                                    className={`h-12 w-12 rounded-full ${
                                      patientGender === "MALE"
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                        : "bg-gradient-to-br from-pink-500 to-pink-600"
                                    } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                                  >
                                    {patientName.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {patientName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {patientDateOfBirth
                                        ? `${calculateAge(
                                            patientDateOfBirth
                                          )} tuổi`
                                        : ""}{" "}
                                      •{" "}
                                      {patientGender === "MALE"
                                        ? "Nam"
                                        : patientGender === "FEMALE"
                                        ? "Nữ"
                                        : ""}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className={cn(
                            "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                            appointment.slotNumber 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-slate-100 text-slate-400"
                          )}>
                             {appointment.slotNumber || "-"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            #{appointment.id}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium">
                              {(() => {
                                const shift =
                                  appointment.shift || appointment.Shift;
                                if (!shift) return "N/A";
                                return `${shift.startTime} - ${shift.endTime}`;
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={`${getStatusBadge(appointment.status)}`}
                          >
                            {getStatusText(appointment.status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {}
                            {appointment.status === "REFERRAL" && appointment.visitId && (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => navigate(`/doctor/consultation/${appointment.visitId}`)}
                              >
                                <Stethoscope className="h-4 w-4 mr-1" />
                                Kiểm tra
                              </Button>
                            )}
                            {}
                            {(appointment.status === "COMPLETED" ||
                              appointment.status === "CANCELLED") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                asChild
                              >
                                <Link
                                  to={`/doctor/patients/${
                                    appointment.isVisit && appointment.visitId
                                      ? appointment.visitId
                                      : appointment.id
                                  }`}
                                >
                                  Chi tiết
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                            )}
                            {}
                            {(appointment.status === "WAITING" ||
                              appointment.status === "CHECKED_IN" ||
                              appointment.status === "IN_PROGRESS") && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() =>
                                  appointment.status === "IN_PROGRESS"
                                    ? handlePrescription(appointment)
                                    : handleCallPatient(appointment)
                                }
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                {appointment.status === "IN_PROGRESS"
                                  ? "Kê đơn thuốc"
                                  : appointment.status === "CHECKED_IN"
                                  ? "Khám bệnh"
                                  : "Gọi khám"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {}
             {filteredAppointments.length > 0 && (
               <div className="px-6 py-4 border-t bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Hiển thị <span className="text-slate-900">{paginatedAppointments.length}</span> trên <span className="text-slate-900">{filteredAppointments.length}</span> lịch hẹn
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(currentPage - 1) }}
                          className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                      <div className="flex items-center px-4 font-bold text-sm text-slate-700">
                          Trang {currentPage} / {totalPages || 1}
                      </div>
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(currentPage + 1) }}
                          className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
               </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </DoctorSidebar>
  );
}
