
import { Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import type { IAppointment } from "../../../types/appointment"; 
import { getStatusColor } from "../../../lib/utils/appointmentUtils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AppointmentCardProps {
  appointment: IAppointment;
  onViewDetails: (apt: IAppointment) => void; 
  onCancel?: (id: string) => void;
  onFollowUp?: (doctorId: number) => void;
}

export function AppointmentCard({ 
  appointment, 
  onViewDetails, 
  onCancel, 
  onFollowUp 
}: AppointmentCardProps) {
  
  const isPast = ["Completed", "Cancelled"].includes(appointment.status);
  
  
  const dateObj = new Date(appointment.date);
  const day = dateObj.getDate();
  const month = format(dateObj, "MMM", { locale: vi });
  const weekday = format(dateObj, "EEEE", { locale: vi });

  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div 
      onClick={() => onViewDetails(appointment)}
      className="group relative flex flex-col md:flex-row md:items-center gap-4 p-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
    >
      {}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/30 to-indigo-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
      
      {}
      <div className="relative z-10 flex md:flex-col items-center md:items-start min-w-[90px] gap-2 md:gap-0 border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 md:pr-3 group-hover:border-blue-100 transition-colors">
         <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{day}</span>
            <span className="text-sm font-semibold text-gray-400 group-hover:text-blue-500 uppercase transition-colors">{month}</span>
         </div>
         <div className="flex items-center text-gray-500 group-hover:text-blue-500 text-xs font-medium mt-1 transition-colors">
           <Clock className="w-3.5 h-3.5 mr-1.5" />
           {appointment.time}
         </div>
         <div className="text-[11px] text-gray-400 font-medium hidden md:block mt-1.5 uppercase tracking-wide">
            {weekday}
         </div>
      </div>

      {}
      <div className="relative z-10 flex flex-1 items-center gap-4">
        <div className="relative group-hover:scale-105 transition-transform duration-300">
            {appointment.doctor.image && appointment.doctor.image !== "/placeholder.svg" ? (
              <img
                src={appointment.doctor.image}
                alt={appointment.doctor.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all bg-gray-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  e.currentTarget.nextElementSibling?.classList.add('flex');
                }}
              />
            ) : null}
            
            {}
            <div 
              className={`h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all bg-blue-100 items-center justify-center text-blue-600 font-bold text-xs
                ${appointment.doctor.image && appointment.doctor.image !== "/placeholder.svg" ? 'hidden' : 'flex'}`}
            >
              {getInitials(appointment.doctor.name)}
            </div>

            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${["Completed", "Confirmed", "In Progress"].includes(appointment.status) ? "bg-green-500" : "bg-gray-300"}`} />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 text-base transition-colors">
              {appointment.doctor.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
               <span className="bg-gray-50 group-hover:bg-blue-50 text-gray-600 group-hover:text-blue-600 px-2 py-0.5 rounded-md font-medium transition-colors">
                  {appointment.doctor.specialty}
               </span>
            </div>
        </div>
      </div>



      {}
      <div className="relative z-10 flex items-center gap-3 justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
         <Badge variant="outline" className={`${getStatusColor(appointment.status)} text-xs px-3 py-1 border-0 ring-1 ring-inset whitespace-nowrap shadow-sm`}>
            {appointment.displayStatus || appointment.status}
         </Badge>

         <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 transform translate-x-4 group-hover:translate-x-0">
            {!isPast && onCancel && (
                <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-transform hover:rotate-90 duration-300"
                    onClick={(e) => { e.stopPropagation(); onCancel(appointment.id); }}
                    title="Hủy lịch"
                >
                   <span className="sr-only">Hủy</span>
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                </Button>
            )}

            {isPast && onFollowUp && appointment.status === "Completed" && (
                 <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold h-9 px-3 rounded-xl"
                    onClick={(e) => { e.stopPropagation(); onFollowUp(appointment.doctor.id); }}
                >
                    Tái khám
                </Button>
            )}

            <Button 
                variant="default"
                size="sm" 
                className="h-9 text-xs bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 shadow-sm rounded-xl transition-all"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onViewDetails(appointment); 
                }}
            >
               Chi tiết
            </Button>
         </div>
      </div>
    </div>
  );
}
