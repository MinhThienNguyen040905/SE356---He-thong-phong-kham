import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Calendar, MapPin, Activity, AlertCircle, X, User, FileText } from "lucide-react";
import type { IAppointment } from "../../../types/appointment";
import { getStatusColor } from "../../../lib/utils/appointmentUtils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment | null;
}

export function AppointmentDetailModal({ isOpen, onOpenChange, appointment }: AppointmentDetailModalProps) {
  if (!appointment) return null;

  
  const dateObj = new Date(appointment.date);
  const fullDate = format(dateObj, "EEEE, dd 'tháng' MM, yyyy", { locale: vi });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-3xl overflow-hidden">
        {}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex items-center justify-between sticky top-0 z-10">
             <div className="text-white">
                <DialogTitle className="text-xl font-bold flex items-center gap-3">
                    Chi tiết Lịch hẹn
                    <Badge className={`${getStatusColor(appointment.status)} text-xs border-0 shadow-none px-2 py-0.5`} variant="secondary">
                        {appointment.displayStatus || appointment.status}
                    </Badge>
                </DialogTitle>
                <p className="text-blue-100 text-xs font-medium mt-1 opacity-90">Mã đặt lịch: #{appointment.id}</p>
            </div>
            <button 
                onClick={() => onOpenChange(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 {}
                 <div className="flex items-start gap-4">
                     {appointment.doctor.image ? (
                        <img 
                            src={appointment.doctor.image} 
                            alt={appointment.doctor.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                     ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg border-2 border-white shadow-sm">
                            {appointment.doctor.name.charAt(0)}
                        </div>
                     )}
                     <div>
                         <p className="text-xs text-gray-500 font-medium uppercase mb-0.5">Bác sĩ phụ trách</p>
                         <h4 className="font-bold text-gray-900">{appointment.doctor.name}</h4>
                         <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                             {appointment.doctor.specialty}
                         </div>
                     </div>
                 </div>

                 {}
                 <div className="space-y-3 pl-0 md:pl-4 border-l-0 md:border-l border-gray-200">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-gray-100 shrink-0">
                            <Calendar className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Thời gian</p>
                             <p className="text-sm font-semibold text-gray-900">{appointment.time} - {fullDate}</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm border border-gray-100 shrink-0">
                            <MapPin className="w-4 h-4" />
                         </div>
                         <div>
                             <p className="text-xs text-gray-400 font-bold uppercase">Địa điểm</p>
                             <p className="text-sm font-semibold text-gray-900">{appointment.location}</p>
                         </div>
                     </div>
                 </div>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {}
                <div>
                     <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-indigo-500" />
                        Thông tin Bệnh nhân
                     </h4>
                     <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                         <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                             <div>
                                 <p className="font-bold text-gray-900 text-lg">
                                   {appointment.patientName || appointment.patient?.name || "N/A"}
                                 </p>
                                 {appointment.patient?.code && (
                                     <p className="text-xs text-gray-500">{appointment.patient.code}</p>
                                 )}
                             </div>
                             <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                 <User className="w-5 h-5" />
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                             <div>
                                 <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Ngày sinh</p>
                                 <p className="font-medium text-gray-700">
                                   {appointment.patientDob || appointment.patient?.dob || "N/A"}
                                 </p>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Giới tính</p>
                                 <p className="font-medium text-gray-700">
                                   {appointment.patientGender === "MALE" ? "Nam" : 
                                    appointment.patientGender === "FEMALE" ? "Nữ" : 
                                    appointment.patient?.gender || "N/A"}
                                 </p>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Điện thoại</p>
                                 <p className="font-medium text-gray-700">
                                   {appointment.patientPhone || appointment.patient?.phone || "N/A"}
                                 </p>
                             </div>
                             {appointment.patient?.address && (
                                 <div>
                                     <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Địa chỉ</p>
                                     <p className="font-medium text-gray-700 truncate" title={appointment.patient.address}>{appointment.patient.address}</p>
                                 </div>
                             )}
                         </div>
                     </div>
                </div>

                {}
                <div>
                     <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-teal-500" />
                        Thông tin Chuyên môn
                     </h4>
                     <div className="space-y-4">
                         {}
                         <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                             <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                 <AlertCircle className="w-3.5 h-3.5" /> Lý do khám
                             </p>
                             <p className="font-medium text-gray-900">{appointment.reason}</p>
                         </div>

                         {}
                         {appointment.diagnosis && (
                             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                 <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                     <Activity className="w-3.5 h-3.5" /> Chẩn đoán
                                 </p>
                                 <p className="font-medium text-gray-900">{appointment.diagnosis}</p>
                             </div>
                         )}

                         {}
                         {appointment.prescription && (
                             <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                 <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                     <FileText className="w-3.5 h-3.5" /> Đơn thuốc
                                 </p>
                                 <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{appointment.prescription}</p>
                             </div>
                         )}
                         
                         {}
                         {appointment.status === 'Cancelled' && appointment.notes && (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <p className="text-xs text-red-600 font-bold uppercase tracking-wide mb-1">Lý do hủy</p>
                                <p className="text-sm font-medium text-red-800">{appointment.notes}</p>
                            </div>
                         )}
                     </div>
                </div>

            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
