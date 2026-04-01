import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { AuthProvider } from "./features/auth/context/authContext"
import { Toaster } from "./components/ui/sonner"
import ProtectedRoute from "./features/auth/components/ProtectedRoute"


import HomePage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/patient/SignupPage"
import BookAppointmentPage from "./pages/patient/BookAppointmentPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import TermsOfServicePage from "./pages/TermsOfServicePage"
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage"
import OAuthCallbackPage from "./pages/OAuthCallbackPage"
import OAuthErrorPage from "./pages/OAuthErrorPage"
import EmailVerificationPage from "./pages/EmailVerificationPage"
const ProfilePage = lazy(() => import("./pages/ProfilePage"))


const AdminProfilePage = lazy(() => import("./pages/admin/ProfilePage"))
const DoctorProfilePage = lazy(() => import("./pages/doctor/ProfilePage"))
const PatientProfilePage = lazy(() => import("./pages/patient/ProfilePage"))
const PatientUpdateHealthInfoPage = lazy(() => import("./pages/patient/UpdateHealthInfoPage"))
const ReceptionistProfilePage = lazy(() => import("./pages/recep/ProfilePage"))


const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"))
const DoctorListPage = lazy(() => import("./pages/admin/DoctorListPage"))
const DoctorDetailPage = lazy(() => import("./pages/admin/DoctorDetailPage"))
const DoctorAddPage = lazy(() => import("./pages/admin/DoctorAddPage"))
const DoctorSchedulePage = lazy(() => import("./pages/admin/DoctorSchedulePage"))
const DoctorsShiftPage = lazy(() => import("./pages/admin/DoctorShiftPage"))
const PharmacyImportPage = lazy(() => import("./pages/admin/PharmacyImportPage"))
const CreateMedicinePage = lazy(() => import("./pages/admin/CreateMedicinePage"))
const MedicineImportsPage = lazy(() => import("./pages/admin/MedicineImportsPage"))
const MedicineImportDetailPage = lazy(() => import("./pages/admin/MedicineImportDetailPage"))
const MedicineExportsPage = lazy(() => import("./pages/admin/MedicineExportsPage"))
const MedicineExportDetailPage = lazy(() => import("./pages/admin/MedicineExportDetailPage"))
const RefundsPage = lazy(() => import("./pages/admin/RefundsPage"))
const SalaryPage = lazy(() => import("./pages/admin/SalaryPage"))
const FinancialReportPage = lazy(() => import("./pages/admin/FinancialReportPage"))
const AppointmentReportPage = lazy(() => import("./pages/admin/AppointmentReportPage"))
const PatientStatisticsReportPage = lazy(() => import("./pages/admin/PatientStatisticsReportPage"))

const MedicineReportPage = lazy(() => import("./pages/admin/MedicineReportPage"))
const GenderReportPage = lazy(() => import("./pages/admin/GenderReportPage"))
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage"))
const UserDetailPage = lazy(() => import("./pages/admin/UserDetailPage"))
const UserAddPage = lazy(() => import("./pages/admin/UserAddPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"))
const PermissionPage = lazy(() => import("./pages/admin/PermissionPage"))
const EditMedicinePage = lazy(() => import("./pages/admin/EditMedicinePage"))
const PayrollDetailPage = lazy(() => import("./pages/admin/PayrollDetailPage"))
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"))
const SpecialtiesPage = lazy(() => import("./pages/admin/SpecialtiesPage"))
const ShiftsPage = lazy(() => import("./pages/admin/ShiftsPage"))
const ShiftTemplatesPage = lazy(() => import("./pages/admin/ShiftTemplatesPage"))
const ScheduleGenerationPage = lazy(() => import("./pages/admin/ScheduleGenerationPage"))
const SystemSettingsPage = lazy(() => import("./pages/admin/SystemSettingsPage"))
const AttendanceManagementPage = lazy(() => import("./pages/admin/AttendanceManagementPage"))
const EmployeeListPage = lazy(() => import("./pages/admin/EmployeeListPage"))
const EmployeeDetailPage = lazy(() => import("./pages/admin/EmployeeDetailPage"))
const PatientListPage = lazy(() => import("./pages/admin/PatientListPage"))
const AdminPatientDetailPage = lazy(() => import("./pages/admin/AdminPatientDetailPage"))
const AdminPrescriptionDetailPage = lazy(() => import("./pages/admin/AdminPrescriptionDetailPage"))
const PayrollStatisticsPage = lazy(() => import("./pages/admin/PayrollStatisticsPage"))
const MyPayrollsPage = lazy(() => import("./pages/MyPayrollsPage"))
const MyPayrollDetailPage = lazy(() => import("./pages/MyPayrollDetailPage"))


const DoctorDashboardPage = lazy(() => import("./pages/doctor/DashboardPage"))
const MedicalListPage = lazy(() => import("./pages/doctor/MedicalListPage"))
const FormMedicalPage = lazy(() => import("./pages/doctor/FormMedicalPage"))
const PrescribeMedPage = lazy(() => import("./pages/doctor/PrescribeMedPage"))
const DoctorShiftPage = lazy(() => import("./pages/doctor/DoctorShiftPage"))
const UiQuanLyDT = lazy(() => import("./pages/doctor/PrescriptionManagementPage"))

const EditPrescriptionPage = lazy(() => import("./pages/doctor/EditPrescriptionPage"))
const ConsultationPage = lazy(() => import("./pages/doctor/ConsultationPage"))


const ReceptionistDashboardPage = lazy(() => import("./pages/recep/DashboardPage"))
const RecepPatientsPage = lazy(() => import("./pages/recep/PatientListPage"))
const PatientDetailPage = lazy(() => import("./pages/recep/PatientDetailPage"))
const InvoicesPage = lazy(() => import("./pages/recep/InvoicesPage"))
const InvoiceDetailPage = lazy(() => import("./pages/recep/InvoiceDetailPage"))
const CreateInvoicePage = lazy(() => import("./pages/recep/CreateInvoicePage"))
const InvoiceStatisticsPage = lazy(() => import("./pages/admin/InvoiceStatisticsPage"))
const OfflineAppointmentPage = lazy(() => import("./pages/recep/OfflineAppointmentPage"))
const ReceptionistAppointmentsPage = lazy(() => import("./pages/recep/AppointmentsPage"))


const PatientAppointmentsPage = lazy(() => import("./pages/patient/Appointments"))
const PatientDashboardPage = lazy(() => import("./pages/patient/DashboardPage"))
const PatientMedicalHistoryPage = lazy(() => import("./pages/patient/MedicalHistoryPage"))
const PatientPrescriptionsPage = lazy(() => import("./pages/patient/PrescriptionsPage"))
const PatientPrescriptionDetailPage = lazy(() => import("./pages/patient/PrescriptionDetailPage"))
const PatientInvoicesPage = lazy(() => import("./pages/patient/InvoicesPage"))
const PatientSettingsPage = lazy(() => import("./pages/patient/PatientSettingsPage"))
const SetupPatientProfilePage = lazy(() => import("./pages/patient/SetupPatientProfilePage"))


const AppointmentDetailPage = lazy(() => import("./pages/AppointmentDetailPage"))
const VisitDetailPage = lazy(() => import("./pages/doctor/VisitDetailPage"))
const DoctorPrescriptionDetailPage = lazy(() => import("./pages/doctor/PrescriptionDetailPage"))
const AttendancePage = lazy(() => import("./pages/AttendancePage"))
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"))


const PharmacyPage = lazy(() => import("./pages/PharmacyPage"))
const PharmacyDetailPage = lazy(() => import("./pages/PharmacyDetailPage"))


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/oauth/error" element={<OAuthErrorPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          {}
          <Route path="/book-appointment" element={<Navigate to="/patient/book-appointment" replace />} />

          {}
          <Route
            path="/patient/book-appointment"
            element={
              <ProtectedRoute requiredRole="patient">
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/setup"
            element={
              <ProtectedRoute requiredRole="patient">
                <SetupPatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medical-history"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientMedicalHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientPrescriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions/:id"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientPrescriptionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions/:id"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientPrescriptionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/invoices"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/update-health-info"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientUpdateHealthInfoPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/visits/:id"
            element={
              <ProtectedRoute>
                <VisitDetailPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpCenterPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/add"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id/shift"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorsShiftPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacy/import"
            element={
              <ProtectedRoute requiredRole="admin">
                <PharmacyImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/create"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateMedicinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/imports"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineImportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/exports"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineExportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/imports/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineImportDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/exports/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineExportDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/refunds"
            element={
              <ProtectedRoute requiredRole="admin">
                <RefundsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requiredRole="admin">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/:id/edit"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditMedicinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salary"
            element={
              <ProtectedRoute requiredRole="admin">
                <SalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salary/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <PayrollDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices/statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <InvoiceStatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/financial"
            element={
              <ProtectedRoute requiredRole="admin">
                <FinancialReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/appointments"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppointmentReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/patient-statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <PatientStatisticsReportPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/payroll-statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <PayrollStatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AttendanceManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports/medicines"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/gender"
            element={
              <ProtectedRoute requiredRole="admin">
                <GenderReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployeeListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employees/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <EmployeeDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute requiredRole="admin">
                <PatientListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/prescriptions/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPrescriptionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute requiredRole="admin">
                <PermissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/specialties"
            element={
              <ProtectedRoute requiredRole="admin">
                <SpecialtiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shifts"
            element={
              <ProtectedRoute requiredRole="admin">
                <ShiftsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shift-templates"
            element={
              <ProtectedRoute requiredRole="admin">
                <ShiftTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule-generation"
            element={
              <ProtectedRoute requiredRole="admin">
                <ScheduleGenerationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AttendanceManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payroll-statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <PayrollStatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payrolls"
            element={
              <ProtectedRoute>
                <MyPayrollsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payrolls/:id"
            element={
              <ProtectedRoute>
                <MyPayrollDetailPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/medicalList"
            element={
              <ProtectedRoute requiredRole="doctor">
                <MedicalListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/shift"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorShiftPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id/prescription"
            element={
              <ProtectedRoute requiredRole="doctor">
                <PrescribeMedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id/examination"
            element={
              <ProtectedRoute requiredRole="doctor">
                <FormMedicalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id"
            element={
              <ProtectedRoute requiredRole="doctor">
                <FormMedicalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute requiredRole="doctor">
                <UiQuanLyDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions/:id"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorPrescriptionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions/:id/edit"
            element={
              <ProtectedRoute requiredRole="doctor">
                <EditPrescriptionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultation/:visitId"
            element={
              <ProtectedRoute requiredRole="doctor">
                <ConsultationPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/receptionist/profile"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/dashboard"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/patients"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <RecepPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/patients/:id"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "patient"]}>
                <InvoiceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/invoices/create"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <CreateInvoicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/appointments/offline"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <OfflineAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <ReceptionistAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/appointments"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistAppointmentsPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "doctor"]}>
                <PharmacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/:id"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "doctor"]}>
                <PharmacyDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  )
}

export default App
