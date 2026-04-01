export type AppointmentStatus =
  | "Confirmed"
  | "Pending"
  | "Checked-in"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface IDoctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
}

export interface IAppointment {
  id: string;
  date: string;
  time: string;
  doctor: IDoctor;
  patient: {
    id: number;
    name: string;
    code: string;
    gender?: string;
    dob?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  type: string;
  location: string;
  reason: string;
  status: AppointmentStatus;
  displayStatus?: string;
  rawStatus?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  nextSteps?: string;
  
  patientName?: string;
  patientPhone?: string;
  patientDob?: string;
  patientGender?: "MALE" | "FEMALE";
}
