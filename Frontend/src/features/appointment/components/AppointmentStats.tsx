import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface StatsProps {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export function AppointmentStats({ stats }: { stats: StatsProps }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Tổng lịch hẹn" 
        value={stats.total} 
        icon={<Calendar className="w-6 h-6" />} 
        colorScheme="indigo"
      />
      <StatCard 
        label="Sắp tới" 
        value={stats.upcoming} 
        icon={<Clock className="w-6 h-6" />} 
        colorScheme="blue"
      />
      <StatCard 
        label="Đã hoàn thành" 
        value={stats.completed} 
        icon={<CheckCircle className="w-6 h-6" />} 
        colorScheme="emerald"
      />
      <StatCard 
        label="Đã hủy" 
        value={stats.cancelled} 
        icon={<XCircle className="w-6 h-6" />} 
        colorScheme="red"
      />
    </div>
  );
}


type ColorScheme = "indigo" | "blue" | "emerald" | "red";

const colorStyles: Record<ColorScheme, { bg: string; iconBg: string; iconColor: string; shadow: string; border: string }> = {
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
    iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    iconColor: "text-white",
    shadow: "shadow-lg shadow-indigo-100",
    border: "border-indigo-200/50"
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconColor: "text-white",
    shadow: "shadow-lg shadow-blue-100",
    border: "border-blue-200/50"
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white",
    shadow: "shadow-lg shadow-emerald-100",
    border: "border-emerald-200/50"
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100/50",
    iconBg: "bg-gradient-to-br from-red-500 to-red-600",
    iconColor: "text-white",
    shadow: "shadow-lg shadow-red-100",
    border: "border-red-200/50"
  }
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorScheme: ColorScheme;
}

function StatCard({ label, value, icon, colorScheme }: StatCardProps) {
  const styles = colorStyles[colorScheme];
  
  return (
    <div className={`
      ${styles.bg} ${styles.shadow} ${styles.border}
      border rounded-2xl p-5 
      flex items-center justify-between 
      transition-all duration-300 
      hover:scale-[1.02] hover:shadow-xl
      cursor-default
    `}>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={`${styles.iconBg} ${styles.iconColor} p-3 rounded-xl shadow-md`}>
        {icon}
      </div>
    </div>
  );
}
