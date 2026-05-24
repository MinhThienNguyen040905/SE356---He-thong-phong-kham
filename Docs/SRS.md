# SOFTWARE REQUIREMENTS SPECIFICATION
## Clinic Management System

**Prepared for:** Clinic Management System Project
**Version:** 1.0

---

## Revision and Sign Off Sheet

### Change Record

| Author | Version | Change reference | Date |
| --- | --- | --- | --- |
| Nguyen Minh Thien | 0.1 | Initialize | 2026-05-01 |
| Nguyen Minh Thien | 0.2 | Add use case descriptions for Authentication and Appointment modules | 2026-05-05 |
| Nguyen Minh Thien | 0.3 | Add Visit, Prescription, Inventory module use cases | 2026-05-10 |
| Nguyen Minh Thien | 0.4 | Add Finance, Shift, Admin module use cases | 2026-05-15 |
| Nguyen Minh Thien | 1.0 | Add non-functional requirements, glossary, messages list | 2026-05-20 |

### Reviewers

| Name | Version | Position | Date |
| --- | --- | --- | --- |
| Nguyen Minh Thien | 0.1 | Application Owner | 2026-05-02 |
| Nguyen Minh Thien | 0.2 | Application Owner | 2026-05-06 |
| Nguyen Minh Thien | 0.3 | Application Owner | 2026-05-11 |
| Nguyen Minh Thien | 0.4 | Application Owner | 2026-05-16 |
| Nguyen Minh Thien | 1.0 | Application Owner | 2026-05-20 |

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1. Purpose
   - 1.2. Scope
   - 1.3. Intended Audiences and Document Organization
2. [Functional Requirements](#2-functional-requirements)
   - 2.1. Use Case Description
     - UC1: Sign In
     - UC2: Sign Up
     - UC3: Forgot Password
     - UC4: Sign In with Google OAuth
     - UC5: Sign Out
     - UC6: Change Password
     - UC7: Update User Profile
     - UC8: Manage Employee Account
     - UC9: Book Appointment Online (Patient)
     - UC10: Book Appointment Offline (Receptionist)
     - UC11: Cancel Appointment
     - UC12: Reschedule Appointment
     - UC13: Check-in Patient
     - UC14: Record Visit
     - UC15: Create Prescription
     - UC16: Manage Medicine
     - UC17: Import Medicine to Stock
     - UC18: Create Invoice
     - UC19: Process Payment
     - UC20: Process Refund
     - UC21: Generate Payroll
     - UC22: Generate Doctor Schedule
     - UC23: Record Attendance
     - UC24: View Audit Logs
     - UC25: Generate Report
     - UC26: Update System Settings
     - UC27: Toggle Maintenance Mode
   - 2.2. List Description
   - 2.3. View Description
3. [Non-functional Requirements](#3-non-functional-requirements)
   - 3.1. User Access and Security
   - 3.2. Performance Requirements
   - 3.3. Implementation Requirements
4. [Appendixes](#4-appendixes)
   - Glossary
   - Messages
   - Issues List

---

## 1. Introduction

### 1.1. Purpose

This document serves as the comprehensive **Software Requirements Specification (SRS)** for the **Clinic Management System** project. It encapsulates the detailed functional and non-functional requirements that will guide the development process. This document is an essential reference for developers, providing a roadmap for application functionality, business rule implementation, task assignment, and deployment strategies.

The primary purpose of this document is to outline the software requirements for the Clinic Management System project and establish a clear specification framework. It acts as a foundational guide for developers, project managers, business analysts, quality assurance engineers, and other stakeholders involved in the software development lifecycle. By detailing each use case, business rule, and validation logic, this document ensures a shared understanding of project goals, behavior, and acceptance criteria.

### 1.2. Scope

The scope of this document encompasses both the **functional** and **non-functional** requirements of the Clinic Management System project. It defines how the application under development will operate, outlining features, constraints, and interfaces.

The system targets a single private clinic of small-to-medium scale, supporting end-to-end clinic operations:
- Patient self-service (registration, online appointment booking, viewing personal medical records).
- Receptionist operations (offline appointment booking, patient check-in, invoice creation, payment processing).
- Doctor clinical workflow (viewing shift schedule, recording diagnosis, prescribing medication).
- Administrative oversight (audit logs, reports, system configuration, staff payroll, inventory tracking).

The scope extends to cover user interactions, system performance under expected load, security mechanisms (authentication, authorization, audit), and deployment considerations for both on-premise and cloud environments.

### 1.3. Intended Audiences and Document Organization

This document outlines the roles and responsibilities of various teams involved in the Clinic Management System project. Each team plays a crucial role in ensuring the success of the project, and this document aims to provide a detailed overview of business requirements that drive their work.

This document is intended for:

- **Development team**: The development team transforms project requirements into functional, high-quality software. Their responsibilities extend from detailed design to implementation, code review, and unit testing.

- **Documentation Team**: The documentation team creates user-friendly and informative documentation that accompanies the Clinic Management System application. Their work contributes to user understanding, efficient onboarding, and successful application usage.

- **UAT team**: The UAT team is responsible for validating the application's functionality and usability from an end-user perspective. Their role is crucial in ensuring that the application meets clinical staff and patient expectations.

- **Business Analyst team**: The BA team uses this document as the source of truth for business rules and acceptance criteria.

- **Project Manager**: To plan sprints, estimate effort, and track progress against documented requirements.

Below are the main sections of the document:

- **1. Introduction**: This section describes the general introduction of this document.
- **2. Functional Requirements**: This section describes the functional requirements in detail through use cases, activities flow diagrams, and business rules.
- **3. Non-functional Requirements**: This section describes the non-functional requirements of this application such as user access and security matrix, performance targets, and implementation/deployment constraints.
- **4. Appendixes**: This section describes the glossary of terms, list of system messages, and known issues for this document.

---

## 2. Functional Requirements

### 2.1. Use Case Description

---

#### UC1: Sign In

| Name | Sign In |
| --- | --- |
| **Description** | This use case describes the process by which a user (Patient, Doctor, Receptionist, or Admin) logs into the system. |
| **Actor** | User |
| **Trigger** | When the user clicks on the "Sign In" button. |
| **Pre-condition** | The user is not logged in to the system. The user is on the sign in page (refer to "Sign In Form" in "List description" file). |
| **Post-condition** | The user is logged in to the system. The user is redirected to the home page corresponding to their role. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Enter sign in details (email, password);
|System|
:(2) Send credentials to Authentication controller;
if ((3) data is valid?) then (yes)
  :(5) Notification "Logged in successfully";
  :(6) Redirect to role-specific home page;
  stop
else (no)
  |User|
  :(4) Notification "Email or password is incorrect";
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR1 | **Validate Rules:**<br/>• The system checks the items [email], [password].<br/>• If any of them is null or blank, the system shows error message MSG 2.<br/>• [user] = User Repository find by email [email] (call `findByEmail()` function).<br/>• If [user] does not exist, the system shows error message MSG 22.<br/>• If `bcrypt.compare([password], [user.passwordHash])` returns false, the system shows error message MSG 22.<br/>• If [user.status] == 'BANNED', the system shows error message MSG 23.<br/>• Else, generate JWT from [user.id, user.roleId] with `JWT_EXPIRES_IN` (default 7d) and record this login session. |
| (4) | BR2 | **Message Rules:** The system shows error message MSG 22. |
| (5) | BR3 | **Message Rules:** The system shows success message MSG 24. |
| (6) | BR4 | **Redirect Rules:** The system redirects to the home page according to user's role: Admin → `/admin`, Doctor → `/doctor`, Receptionist → `/recep`, Patient → `/`. |

---

#### UC2: Sign Up

| Name | Sign Up |
| --- | --- |
| **Description** | This use case describes the process by which a new Patient self-registers an account in the system with email verification via OTP. |
| **Actor** | Patient (Guest) |
| **Trigger** | When the user clicks on the "Sign Up" button. |
| **Pre-condition** | The user is on the sign up page (refer to "Sign Up Form" in "List description" file). The user has a valid email address. |
| **Post-condition** | A new User account has been created with role 'PATIENT' and status 'ACTIVE'. A corresponding Patient profile is created and linked. The user is redirected to the sign in page. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Enter sign up details (fullName, email, password, phone);
|System|
:(2) Validate inputs;
if (inputs valid?) then (no)
  |User|
  :(3) Show validation error;
  stop
else (yes)
endif
:(4) Send to User controller;
:(5) Check if email already exists;
if (email exists?) then (yes)
  |User|
  :(6) Show "Email already registered" error;
  stop
else (no)
endif
:(7) Hash password with bcrypt (cost 10);
:(8) Generate OTP, store in Redis (TTL 5min), send OTP email;
|User|
:(9) Receive email, enter OTP;
|System|
:(10) Send OTP to verification controller;
:(11) Verify OTP against Redis;
if (OTP valid?) then (yes)
  :(12) Begin transaction, insert User and Patient, commit, delete OTP;
  |User|
  :(13) Notification "Registration successful" and redirect to sign in;
  stop
else (no)
  |User|
  :(14) Show "Invalid or expired OTP" error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR5 | **Validate Rules:**<br/>• The system checks [fullName], [email], [password], [phone].<br/>• If any entry is empty, the system shows error message MSG 2.<br/>• If `pattern.compile('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$').notMatch([email])`, the system shows error MSG 31.<br/>• If `pattern.compile('^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$').notMatch([password])`, the system shows error MSG 25.<br/>• If `pattern.compile('^(84|0[3|5|7|8|9])+([0-9]{8})$').notMatch([phone])`, the system shows error MSG 30. |
| (5) | BR6 | **Email Existence Rules:**<br/>• If `userRepository.findByEmail([email]) != null`, the system shows error MSG 27. |
| (8) | BR7 | **OTP Generation Rules:**<br/>• Generate 6-digit numeric OTP.<br/>• Store in Redis: `SETEX otp:register:{email} 300 {otp, hashedPassword, fullName, phone}`.<br/>• Send email using template below. |
| (8) | BR8 | **Email Templates:**<br/>**From:** `noreply@clinic.local`<br/>**To:** [email]<br/>**Subject:** "Verify Your Clinic Account Registration"<br/>**Body:** `"Hello [fullName], your verification code is: [otp]. This code will expire in 5 minutes. If you did not request this, please ignore this email."` |
| (11) | BR9 | **OTP Verification Rules:**<br/>• `[cached] = redis.get('otp:register:' + [email])`.<br/>• If [cached] == null, the system shows error MSG 33.<br/>• If [cached.otp] != [enteredOtp], the system shows error MSG 46.<br/>• Else, create User and Patient records in a single transaction.<br/>• Delete OTP from Redis. |
| (13) | BR10 | **Redirect Rules:** The system redirects to the sign in page with success message MSG 28. |

---

#### UC3: Forgot Password

| Name | Forgot Password |
| --- | --- |
| **Description** | This use case describes how users reset their password when they have forgotten it. |
| **Actor** | User |
| **Trigger** | When the user clicks on the "Forgot Password" link on the sign in page. |
| **Pre-condition** | The user is not logged in. The user is on the sign in page. The user has a registered email. |
| **Post-condition** | The user's password has been changed. The user is redirected to the sign in page. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Click "Forgot Password" link;
|System|
:(2) Display Forgot Password page;
|User|
:(3) Enter registered email;
|System|
if ((4) email valid and exists?) then (yes)
  :(5) Generate reset token (TTL 10 min), store in Redis;
  :(6) Send reset link to user's email;
else (no)
  |User|
  :Show error message;
  stop
endif
|User|
:(7) Click reset link in email;
|System|
if ((8) token valid and not expired?) then (yes)
  :(9) Redirect to Change Password page;
else (no)
  |User|
  :(10) Notification "Invalid verification link";
  stop
endif
|User|
:(11) Enter new password;
|System|
if ((12) password valid and different from old?) then (yes)
  :(13) Hash new password, update User.passwordHash, revoke all tokens;
  |User|
  :(14) Redirect to sign in page;
  stop
else (no)
  |User|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR11 | **Email Validate Rules:**<br/>• If [email] is null or blank, return 400 with MSG 2.<br/>• If `pattern.compile('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$').notMatch([email])`, return 400 with MSG 31.<br/>• [user] = userRepository.findByEmail([email]).<br/>• If [user] == null, return 400 with MSG 32. |
| (5) | BR12 | **Generate Reset Token Rules:**<br/>• Generate UUID v4 token.<br/>• Store in Redis: `SETEX reset:token:{userId} 600 {token, expiresAt}`.<br/>• Build reset link: `https://clinic.local/reset-password?token={token}&userId={userId}`. |
| (6) | BR13 | **Email Template:** **Subject:** "Reset Your Clinic Account Password" — **Body:** `"Hello [user.fullName], you requested a password reset. Click the link to reset: [link]. The link expires in 10 minutes. If you didn't request this, please ignore this email."` |
| (9) | BR14 | **Token Validate Rules:**<br/>• Look up Redis key `reset:token:{userId}`.<br/>• If null or `expiresAt < now()`, show error MSG 33. |
| (12) | BR15 | **Password Validate Rules:**<br/>• If `pattern.compile('^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$').notMatch([password])`, show MSG 25.<br/>• If `bcrypt.compare([password], [user.passwordHash])` returns true, show error MSG 34 (cannot reuse old password).<br/>• Else, [user.passwordHash] = `bcrypt.hash([password], 10)`. |
| (13) | BR16 | **Token Revocation Rules:**<br/>• Add all active tokens of [userId] to blacklist via `tokenBlacklistService.revokeAllForUser([userId])`. |

---

#### UC4: Sign In with Google OAuth

| Name | Sign In with Google OAuth |
| --- | --- |
| **Description** | This use case allows users to sign in using their Google account via OAuth 2.0 authorization code flow. |
| **Actor** | User |
| **Trigger** | When the user clicks on the "Sign In with Google" button. |
| **Pre-condition** | The user is on the sign in page. The user has a Google account. The system is configured with Google OAuth client credentials. |
| **Post-condition** | If the email is new, a new Patient account is automatically created. The user is logged in and redirected to the home page. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Click "Sign In with Google";
|System|
:(2) Redirect to Google OAuth consent screen;
|User|
:(3) Authenticate with Google and grant consent;
|System|
:(4) Receive authorization code at callback URL;
:(5) Exchange code for access token, fetch user profile;
:(6) Look up User by email;
if ((7) user exists?) then (no)
  :(8) Begin transaction, auto-provision User (PATIENT) and Patient, commit;
else (yes)
  if (user.status == BANNED?) then (yes)
    |User|
    :Show "Account banned" error;
    stop
  else (no)
  endif
endif
:(9) Issue JWT token;
|User|
:(10) Receive token and redirect to home page;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR17 | **OAuth Redirect Rules:**<br/>• Redirect URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id={GOOGLE_CLIENT_ID}&redirect_uri={callback}&scope=openid+email+profile&response_type=code&state={csrf_token}`. |
| (5) | BR18 | **Token Exchange Rules:**<br/>• Verify `state` parameter matches CSRF token.<br/>• POST to `https://oauth2.googleapis.com/token` with code, client_id, client_secret.<br/>• If exchange fails, redirect to sign in page with error MSG 56. |
| (8) | BR19 | **Auto Provisioning Rules:**<br/>• If [user] == null:<br/>&nbsp;&nbsp;[user] = new User { email: [google.email], fullName: [google.name], oauthProvider: 'GOOGLE', roleId: PATIENT, status: ACTIVE, passwordHash: null }.<br/>&nbsp;&nbsp;[patient] = new Patient { userId: [user.id], fullName: [google.name] }.<br/>• If [user] exists and [user.oauthProvider] is null, link Google account by setting [user.oauthProvider] = 'GOOGLE'. |

---

#### UC5: Sign Out

| Name | Sign Out |
| --- | --- |
| **Description** | This use case describes how a user signs out from the system with immediate token revocation. |
| **Actor** | User (any role) |
| **Trigger** | When the user clicks on the "Sign Out" button. |
| **Pre-condition** | The user is logged in to the system. |
| **Post-condition** | The user's current JWT token is added to the revocation blacklist. The user is redirected to the sign in page. Subsequent requests with the same token are rejected within ≤ 1 second. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Click "Sign Out";
|System|
:(2) Extract JWT token from Authorization header;
:(3) Add token to Redis blacklist with remaining TTL;
:(4) Clear client-side token storage;
|User|
:(5) Redirect to sign in page;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR20 | **Token Revocation Rules:**<br/>• [decoded] = `jwt.decode([token])`.<br/>• [ttl] = [decoded.exp] - `Math.floor(Date.now() / 1000)`.<br/>• If [ttl] > 0, call `redis.setex('blacklist:token:' + [token], [ttl], '1')`.<br/>• If [ttl] ≤ 0, skip (token already expired). |
| (5) | BR21 | **Message Rules:** The system shows success message MSG 57. |

---

#### UC6: Change Password

| Name | Change Password |
| --- | --- |
| **Description** | This use case describes how a logged-in user changes their password. |
| **Actor** | User (any role) |
| **Trigger** | When the user clicks on the "Change Password" button in profile settings. |
| **Pre-condition** | The user is logged in. |
| **Post-condition** | The user's password is updated. All existing tokens of this user are revoked. The user is forced to sign in again. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Enter current password, new password, confirm new password;
|System|
if ((2) current password matches User.passwordHash?) then (no)
  |User|
  :Show "Current password incorrect" error;
  stop
else (yes)
endif
if ((4) new password meets strength rules?) then (no)
  |User|
  :Show validation error;
  stop
else (yes)
endif
if ((6) new password same as old?) then (yes)
  |User|
  :Show "Cannot reuse old password" error;
  stop
else (no)
endif
:(8) Hash new password and update User.passwordHash;
:(9) Revoke all active tokens of this user;
|User|
:(10) Show success and redirect to sign in;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR22 | **Validate Current Password:** If `bcrypt.compare([currentPassword], [user.passwordHash])` returns false, show error MSG 22. |
| (4) | BR23 | **Validate New Password:** Same regex as BR5. If invalid, show MSG 25. |
| (6) | BR24 | **Reuse Check:** If `bcrypt.compare([newPassword], [user.passwordHash])` returns true, show error MSG 34. |
| (9) | BR25 | **Token Revocation:** Call `tokenBlacklistService.revokeAllForUser([userId])` to invalidate all sessions. |

---

#### UC7: Update User Profile

| Name | Update User Profile |
| --- | --- |
| **Description** | This use case describes how a user updates their personal information and avatar. |
| **Actor** | User (any role) |
| **Trigger** | When the user clicks on the "Save" button on the profile page. |
| **Pre-condition** | The user is logged in. The user is on the profile page. |
| **Post-condition** | The user's profile information is updated. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Edit profile fields (fullName, phone, dateOfBirth, gender, address);
:(2) Optionally upload new avatar;
:Click "Save";
|System|
if ((3) inputs valid?) then (yes)
  if ((4) avatar uploaded?) then (yes)
    :(5) Validate file size and MIME type, save to uploads, update User.avatar;
  else (no)
  endif
  :(6) Update User table with new fields;
  :(7) Audit middleware logs the change;
  |User|
  :(8) Show success message;
  stop
else (no)
  |User|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR26 | **Validate Rules:** Check [fullName] is not empty, [phone] matches Vietnam phone pattern (BR5), [dateOfBirth] is a valid date in the past, [gender] ∈ {MALE, FEMALE, OTHER}. |
| (5) | BR27 | **Avatar Upload Rules:** If file size > 5MB, show MSG 11. If MIME type not in allowed list, show MSG 58. Store file path in User.avatar. |
| (7) | BR28 | **Audit Rules:** Audit middleware captures old and new values and writes to AuditLog table asynchronously. |

---

#### UC8: Manage Employee Account

| Name | Manage Employee Account |
| --- | --- |
| **Description** | This use case describes how Admin creates, updates, or deactivates employee accounts (Doctor, Receptionist). |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks on "Create Employee" or "Edit" button. |
| **Pre-condition** | The Admin is logged in with role 'ADMIN'. The Admin is on the Employee management page. |
| **Post-condition** | A new Employee account is created, or an existing one is updated. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Click "Create Employee" or select employee to edit;
|System|
:(2) Display Employee form;
|Admin|
:(3) Fill in employee details (fullName, email, phone, role, salary);
:(4) Click "Save";
|System|
if ((5) inputs valid and admin has 'employees.manage' permission?) then (yes)
  :(6) Begin transaction, create or update User+Employee (and Doctor if role=DOCTOR), commit;
  :(7) Audit log the action;
  |Admin|
  :(8) Show success message;
  stop
else (no)
  |Admin|
  :Show permission denied or validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (5) | BR29 | **Permission Check:** Middleware `requirePermission('employees.manage')` must pass. Else, return 403 with MSG 15. |
| (5) | BR30 | **Validate Rules:** Check [fullName], [email], [phone], [roleId ∈ {DOCTOR, RECEPTIONIST}], [salary ≥ 0]. If [roleId] == DOCTOR, require [specialtyId] and [licenseNumber]. |
| (6) | BR31 | **Create Rules:** Temporary password = `crypto.randomBytes(8).toString('hex')`. Hash with bcrypt. Send welcome email with the temp password and instruction to change on first login. |
| (7) | BR32 | **Audit Rules:** Insert audit log entry with action='CREATE_EMPLOYEE' or 'UPDATE_EMPLOYEE'. |

---

#### UC9: Book Appointment Online (Patient)

| Name | Book Appointment Online |
| --- | --- |
| **Description** | This use case allows a patient to book an appointment online by selecting specialty, doctor, shift, and date. The system must guarantee no over-booking under concurrent requests. |
| **Actor** | Patient |
| **Trigger** | When the patient clicks on "Book Appointment" button. |
| **Pre-condition** | The patient is logged in. The patient does not have an active appointment with the same doctor on the same date. |
| **Post-condition** | A new Appointment record is created with status 'WAITING'. A confirmation notification is sent. |

**Activities Flow**

```plantuml
@startuml
|Patient|
start
:(1) Select specialty;
|System|
:(2) Display list of doctors in that specialty;
|Patient|
:(3) Select doctor;
|System|
:(4) Display calendar showing available shifts for next 14 days;
|Patient|
:(5) Select date and shift, enter symptom (optional), click "Confirm Booking";
|System|
:(6) Begin transaction (READ COMMITTED);
:(7) SELECT DoctorShift FOR UPDATE;
:(8) Validate shift active and not ended;
:(9) Count active appointments and check against maxSlots;
if (slots available and shift not ended?) then (yes)
  :(10) Generate appointmentCode and INSERT Appointment with status WAITING;
  :(11) Commit transaction;
  :(12) Emit AppointmentCreated event (notification + email sent async);
  :(13) Audit log entry inserted;
  |Patient|
  :(14) Show success with appointment code;
  stop
else (no)
  :Rollback;
  |Patient|
  :Show "Slots full" or "Shift ended" error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR33 | **Doctor Listing Rules:**<br/>• Fetch all Doctor records WHERE specialtyId=[selected] AND isActive=true.<br/>• Sort by experienceYears DESC. |
| (4) | BR34 | **Shift Availability Rules:**<br/>• For each date in next 14 days, fetch DoctorShift WHERE doctorId=[selected] AND workDate=[date].<br/>• For each DoctorShift, calculate `availableSlots = ds.maxSlots - count(active appointments)`.<br/>• Only show shifts with `availableSlots > 0`. |
| (9) | BR35 | **Concurrent Booking Rules (CRITICAL):**<br/>• Wrap booking logic in `sequelize.transaction({ isolationLevel: READ_COMMITTED })`.<br/>• Lock the target DoctorShift row using `lock: t.LOCK.UPDATE`.<br/>• Count active appointments AFTER acquiring lock.<br/>• If `count >= maxSlots`, throw `SLOTS_FULL` error with message MSG 59.<br/>• If [date] == today and `now() >= shift.endTime`, throw `SHIFT_ALREADY_ENDED` with MSG 60. |
| (10) | BR36 | **Code Generation Rules:**<br/>• Format: `APT-YYYYMMDD-XXXXX` where XXXXX is a 5-digit sequence.<br/>• Generated within the same transaction to avoid duplicates. |
| (12) | BR37 | **Event Emission Rules:**<br/>• Emit `AppointmentCreated` event via internal event bus AFTER commit.<br/>• Notification service listens and: (a) inserts Notification record, (b) queues email via Nodemailer. |
| (13) | BR38 | **Audit Rules:** Audit middleware inserts entry with action='CREATE_APPOINTMENT', tableName='Appointment', recordId=[id], newValue=[appointment]. |

---

#### UC10: Book Appointment Offline (Receptionist)

| Name | Book Appointment Offline |
| --- | --- |
| **Description** | This use case allows a Receptionist to book an appointment on behalf of a walk-in patient. If the patient does not have an account, the Receptionist can create a Patient record without User account. |
| **Actor** | Receptionist |
| **Trigger** | When the Receptionist clicks on "Walk-in Booking" button. |
| **Pre-condition** | The Receptionist is logged in with permission `appointments.create.proxy`. |
| **Post-condition** | A new Appointment is created with status 'CHECKED_IN' (since patient is physically present). |

**Activities Flow**

```plantuml
@startuml
|Receptionist|
start
:(1) Search patient by phone or name;
|System|
:(2) Display matching patients;
|Receptionist|
if ((3) patient exists?) then (yes)
  :(4) Select existing patient;
else (no)
  :(5) Fill in new patient info (fullName, phone, dob, gender);
  |System|
  :(6) Create new Patient (without User account);
endif
|Receptionist|
:(7) Select doctor and shift, click "Book";
|System|
:(8) Apply booking transaction with row-level lock (same as UC9);
if (booking succeeded?) then (yes)
  :(9) Create Appointment, optionally check-in immediately;
  |Receptionist|
  :(10) Print appointment slip;
  stop
else (no)
  |Receptionist|
  :Show error message;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR39 | **Patient Search Rules:**<br/>• `patientRepository.findByPhoneOrName([query])` returns top 10 matches.<br/>• If no match and [query] is a phone, allow quick-create. |
| (6) | BR40 | **Walk-in Patient Creation Rules:**<br/>• Create Patient with `userId = null`, `createdBy = [receptionist.id]`.<br/>• Patient cannot self-login until they later register and link their account. |
| (8) | BR41 | **Booking Rules:** Same as BR35, but status can be set directly to 'CHECKED_IN' if Receptionist confirms patient presence. |
| (10) | BR42 | **Print Rules:** Generate PDF slip with `pdfkit` containing appointment code, doctor name, shift time, queue number. |

---

#### UC11: Cancel Appointment

| Name | Cancel Appointment |
| --- | --- |
| **Description** | This use case allows a patient to cancel their own appointment, or Receptionist/Admin to cancel any appointment within policy. |
| **Actor** | Patient, Receptionist, Admin |
| **Trigger** | When the user clicks the "Cancel" button on appointment details page. |
| **Pre-condition** | The user is logged in. The appointment exists and is in status 'WAITING' or 'CHECKED_IN'. |
| **Post-condition** | The appointment status is updated to 'CANCELLED'. Slot is freed for other patients. Notification is sent. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Open appointment detail page;
:(2) Click "Cancel";
|System|
:(3) Show confirmation dialog;
|User|
if (confirm?) then (no)
  stop
else (yes)
endif
|System|
:(4) Verify ownership (if Patient, must own this appointment);
:(5) Apply cancellation policy check (late cancellation count);
if ((6) AppointmentStateMachine allows WAITING|CHECKED_IN → CANCELLED?) then (yes)
  :(7) Update Appointment.status = 'CANCELLED', cancelledAt, reason;
  :(8) Emit AppointmentCancelled event (notification + audit log);
  |User|
  :(9) Show success message;
  stop
else (no)
  |User|
  :Show "Cannot cancel completed appointment" error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (4) | BR43 | **Ownership Check:** If `req.user.roleId == PATIENT`, ensure `appointment.patientId == req.user.patientId`. Else, return 403 with MSG 15. |
| (6) | BR44 | **State Machine Check:** Use `AppointmentStateMachine.canTransition(current, 'CANCELLED')`. Allowed from WAITING and CHECKED_IN. Not allowed from IN_PROGRESS, COMPLETED, NO_SHOW. |
| (5) | BR45 | **Cancellation Policy Rules:**<br/>• If cancelled < 2 hours before shift start, increment `patient.lateCancellationCount`.<br/>• If `patient.lateCancellationCount >= 3` within 30 days, flag patient for staff review (does NOT auto-ban). |

---

#### UC12: Reschedule Appointment

| Name | Reschedule Appointment |
| --- | --- |
| **Description** | This use case allows rescheduling an appointment to a different doctor shift while preserving the appointment record. |
| **Actor** | Patient, Receptionist |
| **Trigger** | When the user clicks the "Reschedule" button. |
| **Pre-condition** | The appointment exists and is in 'WAITING' status. |
| **Post-condition** | The appointment is updated with new doctorShiftId. The old slot is freed. The new slot is occupied. |

**Activities Flow**

```plantuml
@startuml
|User|
start
:(1) Open appointment to reschedule;
:(2) Select new doctor and shift, click "Reschedule";
|System|
:(3) Check rescheduledCount < 3;
:(4) Begin transaction, lock old and new DoctorShift in deterministic order (by id ascending);
:(5) Count active appointments in new shift;
if (new shift has space and not ended?) then (yes)
  :(6) Update Appointment.doctorShiftId, doctorId, workDate, rescheduledCount += 1;
  :(7) Commit and notify both old and new doctors;
  |User|
  :(8) Show success;
  stop
else (no)
  :Rollback;
  |User|
  :Show error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR47 | **Reschedule Limit:** If `appointment.rescheduledCount >= 3`, deny with MSG 61 ("Maximum reschedules reached"). |
| (4) | BR46 | **Deadlock Prevention:** Always lock the DoctorShift rows in ascending order of `id` (lower id first) to prevent deadlock when multiple users reschedule simultaneously. |

---

#### UC13: Check-in Patient

| Name | Check-in Patient |
| --- | --- |
| **Description** | This use case allows Receptionist to check in a patient when they arrive at the clinic, creating a Visit record. |
| **Actor** | Receptionist |
| **Trigger** | When the Receptionist clicks the "Check-in" button on appointment list. |
| **Pre-condition** | The Receptionist is logged in. The appointment exists and is in status 'WAITING'. The current time is within ±60 minutes of shift start. |
| **Post-condition** | The Appointment status is updated to 'CHECKED_IN'. A new Visit record is created with status 'IN_PROGRESS'. |

**Activities Flow**

```plantuml
@startuml
|Receptionist|
start
:(1) Search appointment by code or patient phone;
|System|
:(2) Display appointment details;
|Receptionist|
:(3) Click "Check-in";
|System|
:(4) Check time window (shift.startTime - 60 min to shift.endTime + 30 min);
:(5) Begin transaction, SELECT Appointment FOR UPDATE, validate state transition;
if (WAITING → CHECKED_IN allowed?) then (yes)
  :(6) Update Appointment.status = 'CHECKED_IN';
  :(7) Create Visit, assign queue number, commit, notify doctor;
  |Receptionist|
  :(8) Display queue number and direct patient to waiting area;
  stop
else (no)
  |Receptionist|
  :Show error (already checked in, or cancelled);
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (4) | BR48 | **Time Window Rules:**<br/>• Allow check-in from `shift.startTime - 60 min` to `shift.endTime + 30 min`.<br/>• Outside window, show warning but allow override by Admin. |
| (5) | BR49 | **State Transition:** Use `AppointmentStateMachine.validateTransition`. Allowed only from WAITING. |
| (7) | BR50 | **Queue Number Rules:**<br/>• Sequential per doctor per shift, starting from 1.<br/>• `queueNumber = COUNT(visits WHERE doctorId=? AND DATE(checkInTime)=today) + 1`. |

---

#### UC14: Record Visit

| Name | Record Visit |
| --- | --- |
| **Description** | This use case allows a Doctor to record clinical examination details: symptoms, vital signs, diagnosis, and optionally attach images. |
| **Actor** | Doctor |
| **Trigger** | When the Doctor opens a visit in progress and starts entering data. |
| **Pre-condition** | The Doctor is logged in. The Visit is in status 'IN_PROGRESS' and assigned to the current doctor. |
| **Post-condition** | The Visit record is updated with clinical data. |

**Activities Flow**

```plantuml
@startuml
|Doctor|
start
:(1) Open visit from "My Today's Visits" list;
|System|
:(2) Verify ownership (visit.doctorId == req.user.doctorId);
:(3) Display Visit form with patient history;
|Doctor|
:(4) Record symptoms, vital signs, disease category, diagnosis;
:(5) Optionally upload symptom images;
:(6) Click "Save";
|System|
:(7) Sanitize HTML in text fields with dompurify;
:(8) Validate vital signs ranges;
if (valid?) then (yes)
  :(9) Validate images (size, MIME) and save to uploads/visits/{visitId}/;
  :(10) Update Visit table;
  :(11) Audit log entry inserted;
  |Doctor|
  :Show "Saved" message;
  stop
else (no)
  |Doctor|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR51 | **Ownership Check:** `visit.doctorId == req.user.doctorId`. Else, return 403 with MSG 15. |
| (8) | BR52 | **Vital Signs Validation:**<br/>• bloodPressureSystolic ∈ [50, 250]<br/>• bloodPressureDiastolic ∈ [30, 150]<br/>• heartRate ∈ [30, 220]<br/>• temperature ∈ [30.0, 45.0]<br/>• weight ∈ [0.5, 500]<br/>• height ∈ [20, 250].<br/>• Out-of-range values prompt for confirmation, not blocked. |
| (7) | BR53 | **HTML Sanitization:** Apply `DOMPurify.sanitize()` to [symptoms], [diagnosis] fields to prevent stored XSS. |
| (9) | BR54 | **Image Upload Rules:** Max 10MB per file, MIME ∈ {image/jpeg, image/png, image/webp}, max 5 images per visit. |
| (11) | BR55 | **Audit Rules:** Captures old values of diagnosis and vitals for full audit trail. |

---

#### UC15: Create Prescription

| Name | Create Prescription |
| --- | --- |
| **Description** | This use case allows a Doctor to create a prescription tied to a visit, specifying medicines, dosages, and instructions. **This is the *prescription transaction boundary* of ASR-DI-02** — it is atomic across Prescription, PrescriptionDetail (snapshotting medicine name/unit/unit price), Medicine.stock deduction, MedicineExport, the Appointment state transition (CHECKED_IN → IN_PROGRESS), and the Visit state transition (EXAMINING/EXAMINED → EXAMINED). |
| **Actor** | Doctor |
| **Trigger** | When the Doctor clicks "Create Prescription" on the visit page. |
| **Pre-condition** | The Doctor is logged in and owns the Visit. The Visit is in status 'EXAMINING', 'EXAMINED' or 'COMPLETED'. The Appointment is in 'CHECKED_IN' or 'IN_PROGRESS'. No prescription has been created for this visit yet. |
| **Post-condition** | A new Prescription (status DRAFT) with PrescriptionDetail entries is created. Medicine.quantity is decremented for each item. A MedicineExport row is inserted for each item. The Visit transitions to EXAMINED. If any step fails, **all changes are rolled back** (atomicity). |

**Activities Flow**

```plantuml
@startuml
|Doctor|
start
:(1) Click "Create Prescription";
|System|
:(2) Display prescription form with medicine search;
|Doctor|
:(3) Search medicine, select items, enter quantity, dosage per session, days, instruction (repeat for each medicine);
:(4) Click "Save Prescription";
|System|
:(5) Begin transaction (READ COMMITTED);
:(6) Verify Visit ownership and state;
:(7) Lock Appointment FOR UPDATE; transition Appointment via AppointmentStateMachine if needed;
:(8) Check no existing Prescription for this visit (idempotency);
:(9) Generate prescriptionCode and insert Prescription header (DRAFT, totalAmount=0);
:(10) For each item: lock Medicine FOR UPDATE, validate ACTIVE + stock >= requested (else throw INSUFFICIENT_STOCK and rollback), decrement Medicine.quantity, insert PrescriptionDetail (with medicine name/unit/unitPrice snapshot), insert MedicineExport (reason = PRESCRIPTION_{code});
:(11) Update Prescription.totalAmount;
:(12) Transition Visit to EXAMINED via VisitStateMachine; set checkOutTime;
:(13) Commit;
|Doctor|
:(14) Show success and optionally print prescription PDF;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR56 | **Medicine Search Rules:**<br/>• `medicineRepository.searchByName([q])` with `WHERE name LIKE %?% AND status = 'ACTIVE'`.<br/>• Limit 20 results, ordered by relevance. |
| (3) | BR57 | **Prescription Detail Rules:**<br/>• [quantity] required, integer ≥ 1.<br/>• [dosageMorning/Noon/Afternoon/Evening] required, decimal ≥ 0.<br/>• [days] required, integer ≥ 1.<br/>• [instruction] optional, e.g. "after meal". |
| (6)–(7) | BR58a | **Ownership & State Rules:**<br/>• `visit.doctorId === requesterDoctorId` else throw `UNAUTHORIZED_VISIT`.<br/>• `visit.status ∈ {EXAMINING, EXAMINED, COMPLETED}` else throw `VISIT_NOT_EXAMINED`.<br/>• Lock `Appointment` row with `FOR UPDATE`. If status = CHECKED_IN, transition to IN_PROGRESS via `AppointmentStateMachine.validateTransition`; if already IN_PROGRESS, proceed; otherwise throw `APPOINTMENT_NOT_IN_PROGRESS`. |
| (8) | BR58b | **Idempotency Rules:**<br/>• If a Prescription already exists for this `visitId`, throw `PRESCRIPTION_ALREADY_EXISTS`. |
| (10) | BR58c | **Atomic Stock Deduction Rules (CRITICAL):**<br/>• Entire flow wrapped in `sequelize.transaction({ isolationLevel: READ_COMMITTED })`.<br/>• Each Medicine row is loaded with `lock: t.LOCK.UPDATE` (`SELECT ... FOR UPDATE`).<br/>• If `medicine.status !== 'ACTIVE'`, throw `MEDICINE_NOT_ACTIVE_{name}` and rollback.<br/>• If `medicine.quantity < requested`, throw `INSUFFICIENT_STOCK_{name}_Available:X_Requested:Y` and rollback.<br/>• `medicine.quantity -= requested` is persisted in the same transaction.<br/>• PrescriptionDetail stores **snapshot** of `medicineName`, `unit`, `unitPrice` (Memento Pattern) so downstream invoices remain stable against future price/name changes.<br/>• A MedicineExport row is inserted with `reason = 'PRESCRIPTION_' + prescriptionCode` for traceability.<br/>• Any failure inside the loop rolls back the whole transaction — stock is restored, prescription header disappears, exports disappear. |
| (9) | BR59 | **Code Generation:** `prescriptionCode = 'RX-' + YYYYMMDD + '-' + 5_digit_sequence`, generated inside the transaction to avoid duplicates. |
| (12) | BR58d | **Visit State Transition:** Use `VisitStateMachine.validateTransition(currentStatus, 'EXAMINED')` before assignment. Skipped if visit is already EXAMINED or COMPLETED. |

---

#### UC16: Manage Medicine

| Name | Manage Medicine |
| --- | --- |
| **Description** | This use case allows Admin or authorized staff to create, update, or deactivate medicines in the catalog. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Add Medicine" or "Edit" on medicine list page. |
| **Pre-condition** | The Admin is logged in with permission `medicines.manage`. |
| **Post-condition** | A medicine is created, updated, or deactivated in the catalog. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Open Medicine list;
:(2) Click "Add Medicine" or select to edit;
|System|
:(3) Display Medicine form;
|Admin|
:(4) Fill in: name, code, unit, sellingPrice, category, description;
:Click "Save";
|System|
if ((5) inputs valid?) then (yes)
  if (create mode?) then (yes)
    :(6) Insert Medicine with stock=0, isActive=true;
  else
    :Update fields;
  endif
  :(7) Audit log entry inserted;
  |Admin|
  :Show success;
  stop
else (no)
  |Admin|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (5) | BR60 | **Validate Rules:** [name] not empty and unique, [code] unique, [sellingPrice] > 0, [unit] ∈ {viên, vỉ, hộp, lọ, ống, ml, gói}. |
| (6) | BR61 | **Stock Initialization:** New medicine starts with `stock = 0`. Stock can only be incremented via UC17 (Import). |

---

#### UC17: Import Medicine to Stock

| Name | Import Medicine to Stock |
| --- | --- |
| **Description** | This use case allows authorized staff to record an import (stock-in) of medicines from a supplier. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "New Import" button. |
| **Pre-condition** | The Admin is logged in with permission `medicines.import`. |
| **Post-condition** | A MedicineImport record is created. The corresponding Medicine.stock is increased. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Click "New Import";
|System|
:(2) Display import form;
|Admin|
:(3) Fill supplier info, importDate;
:(4) Add line items (medicine, quantity, costPrice, expiryDate, batchNumber);
:Click "Save Import";
|System|
:(5) Begin transaction, validate each item (expiry, quantity);
if (all valid?) then (yes)
  :(6) Insert MedicineImport header and details, increment Medicine.stock atomically;
  :(7) Commit transaction, record costPrice for margin reports;
  :(8) Audit log;
  |Admin|
  :Show success;
  stop
else (no)
  :Rollback;
  |Admin|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (5) | BR62 | **Expiry Validation:** `expiryDate >= today + 30 days`. Else warn with MSG 62 ("Medicine expires soon"). Block if `expiryDate <= today`. |
| (6) | BR63 | **Stock Update:** Atomic increment within same transaction using `UPDATE Medicine SET stock = stock + ?`. |
| (7) | BR64 | **Cost Recording:** Store `costPrice` per import to enable margin reports. |

---

#### UC18: Create Invoice

| Name | Create Invoice |
| --- | --- |
| **Description** | This use case allows the Receptionist to create an invoice for a visit that has been examined (its prescription, if any, has already been finalised by UC15). **This is the *invoice transaction boundary* of ASR-DI-02** — it is atomic across Invoice and InvoiceItem only. It populates medicine line items by **reading the price/quantity snapshot from PrescriptionDetail** (Memento) and does NOT touch Medicine.stock or MedicineExport (those were already updated atomically inside the UC15 prescription transaction). An idempotency check prevents creating two invoices for the same visit. |
| **Actor** | Receptionist |
| **Trigger** | When the Receptionist clicks "Create Invoice" on the visit page. |
| **Pre-condition** | The Receptionist is logged in. The Visit exists and has not yet been invoiced. If the doctor created a prescription, the prescription transaction (UC15) has already committed — Medicine.stock is already decremented and PrescriptionDetail rows hold the price snapshot. |
| **Post-condition** | A new Invoice (status UNPAID) is created with one EXAMINATION InvoiceItem and one MEDICINE InvoiceItem per PrescriptionDetail. `Invoice.totalAmount = examinationFee + medicineTotalAmount - discount`. If any step fails, **all changes within the invoice transaction are rolled back** — but Medicine.stock / MedicineExport from UC15 are NOT affected (they belong to a different boundary). |

**Activities Flow**

```plantuml
@startuml
|Receptionist|
start
:(1) Select a visit that has been examined;
|System|
:(2) Display visit summary with prescription items and their snapshot unitPrice and quantity;
|Receptionist|
:(3) Confirm consultation fee;
:(4) Click Create Invoice;
|System|
:(5) Begin transaction;
:(6) Load Visit with its Prescription and PrescriptionDetail rows;
:(7) Idempotency check: rollback if an Invoice already exists for this visitId;
:(8) Generate invoiceCode inside transaction;
:(9) Insert Invoice header (status UNPAID, medicineTotalAmount zero, totalAmount equals examinationFee);
:(10) Insert InvoiceItem of itemType EXAMINATION for the consultation fee;
:(11) For each PrescriptionDetail insert InvoiceItem of itemType MEDICINE by copying medicineName, quantity, unitPrice from PrescriptionDetail (snapshot read, no Medicine table touched);
:(12) Update Invoice.medicineTotalAmount and Invoice.totalAmount;
:(13) Commit, emit InvoiceCreated event, audit log;
|Receptionist|
:(14) Display invoice with print option;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR65 | **Pre-fetch Rules:** Display the prescription items with their snapshotted `unitPrice` and `quantity` from PrescriptionDetail. Do NOT re-read `Medicine.salePrice` — even if an admin has changed the price since the prescription was written, the invoice must reflect the price at the time of prescription. |
| (7) | BR66a | **Idempotency Rules:**<br/>• Look up `Invoice WHERE visitId = ?` inside the transaction.<br/>• If a row already exists, throw `Invoice already exists for this visit` and rollback. Two invoices for the same visit must never coexist. |
| (8) | BR67 | **Invoice Code:** `invoiceCode = 'INV-' + YYYYMMDD + '-' + 5_digit_sequence`, generated inside the transaction to avoid duplicates. |
| (9)–(11) | BR66b | **Atomic Invoice Transaction Rules (CRITICAL):**<br/>• Entire flow wrapped in `sequelize.transaction()`.<br/>• This boundary does NOT lock or update Medicine; it does NOT insert MedicineExport. Those side effects belong to UC15 (the prescription transaction) and have already committed.<br/>• `InvoiceItem.unitPrice`, `medicineName`, `quantity` are read **from PrescriptionDetail** (Memento snapshot), not from Medicine.<br/>• `InvoiceItem.prescriptionDetailId` links back to the source detail for traceability and to support later edits (UC15 update) that need to re-sync invoice items. |
| (11) | BR68 | **Pricing Rules:** Consultation fee passed in by the Receptionist (or default from `SystemSettings.consultation_fee_default`). Medicine line `subtotal = PrescriptionDetail.quantity × PrescriptionDetail.unitPrice`. `Invoice.totalAmount = examinationFee + Σ medicine subtotals − discount`. |
| — | BR69 | **State Notes:** Creating an invoice does NOT transition the Visit state. The Visit transitions to COMPLETED later, inside the payment transaction (UC19), when the invoice is fully paid — that transition uses `VisitStateMachine.validateTransition(currentStatus, 'COMPLETED')`. |

---

#### UC19: Process Payment

| Name | Process Payment |
| --- | --- |
| **Description** | This use case allows Receptionist to record a payment against an invoice. Currently supports cash; structure ready for online gateways. |
| **Actor** | Receptionist |
| **Trigger** | When the Receptionist clicks "Record Payment" on an invoice. |
| **Pre-condition** | The Receptionist is logged in. The Invoice is in status 'PENDING'. |
| **Post-condition** | A Payment record is created. The Invoice.status changes to 'PAID' if fully paid. |

**Activities Flow**

```plantuml
@startuml
|Receptionist|
start
:(1) Open invoice and click "Record Payment";
|System|
:(2) Display payment form;
|Receptionist|
:(3) Enter payment method, amount, optional reference number;
:(4) Click "Confirm";
|System|
:(5) Validate payment method ∈ allowed list;
:(6) Begin transaction, SELECT Invoice FOR UPDATE;
:(7) Validate amount (no overpayment);
if (valid?) then (yes)
  :(8) Insert Payment (invoiceId, amount, method, receivedBy, paidAt);
  :(9) Update Invoice status (PAID or PARTIALLY_PAID) via state machine;
  :(10) Commit transaction;
  :(11) Print payment receipt;
  |Receptionist|
  :(12) Hand receipt to patient;
  stop
else (no)
  :Rollback;
  |Receptionist|
  :Show overpayment error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (5) | BR70 | **Payment Method Validation:** [method] ∈ {CASH, BANK_TRANSFER, CARD, MOMO, VNPAY, ZALOPAY}. CARD/online methods marked as "not yet implemented" if gateway not connected. |
| (7) | BR71 | **Amount Validation:** [amount] > 0 AND `alreadyPaid + amount <= invoice.total`. Else show MSG 64. |
| (9) | BR72 | **State Transition:** Use `InvoiceStateMachine`: PENDING → PARTIALLY_PAID → PAID. PAID is terminal except for REFUNDED. |

---

#### UC20: Process Refund

| Name | Process Refund |
| --- | --- |
| **Description** | This use case allows Admin to process a refund for a paid invoice (e.g. wrong medicine dispensed, service not delivered). |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Issue Refund" on a paid invoice. |
| **Pre-condition** | The Admin is logged in with permission `invoices.refund`. The Invoice is in status 'PAID' or 'PARTIALLY_PAID'. |
| **Post-condition** | A Refund record is created. If refund covers medicines, those items can be returned to stock. Invoice.status becomes 'REFUNDED' or 'PARTIALLY_REFUNDED'. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Open invoice and click "Issue Refund";
|System|
:(2) Display refund form with refundable items only;
|Admin|
:(3) Select items, choose stock return option, enter reason;
:(4) Click "Confirm";
|System|
:(5) Show confirmation dialog (MSG 1);
|Admin|
if (confirmed?) then (no)
  stop
else (yes)
endif
|System|
:(6) Begin transaction, validate refund amount ≤ paid - already refunded;
:(7) Insert Refund (invoiceId, amount, reason, processedBy);
:(8) For each medicine item to return: increment Medicine.stock, update MedicineExport.returnedQty;
:(9) Update Invoice.status (REFUNDED or PARTIALLY_REFUNDED);
:(10) Commit, audit log, notify patient;
|Admin|
:(11) Print refund receipt;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR73 | **Refundable Items:** Only items not yet consumed (e.g. medicines patient hasn't picked up). Consultation fee usually non-refundable unless visit was cancelled. |
| (6) | BR74 | **Refund Amount:** `refundAmount <= total paid - already refunded`. Else error MSG 65. |
| (8) | BR75 | **Stock Restoration:** Only if medicine package is unopened and within 7 days of original export. Older returns require Admin override. |

---

#### UC21: Generate Payroll

| Name | Generate Payroll |
| --- | --- |
| **Description** | This use case allows Admin to generate monthly payroll for all employees based on base salary and attendance records. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Generate Payroll" for a target month. |
| **Pre-condition** | The Admin is logged in with permission `payroll.manage`. The target month has ended. Attendance records exist for the period. |
| **Post-condition** | Payroll records are created for all active employees. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Select target month and click "Generate Payroll";
|System|
:(2) Show confirmation;
|Admin|
if (confirmed?) then (no)
  stop
else (yes)
endif
|System|
:(3) Begin transaction, fetch all active Employees;
:(4) Check for duplicate Payroll (same employee + month);
:(5) For each employee: aggregate Attendance, calculate gross/deductions/bonus/net;
:(6) Insert Payroll records with status='DRAFT';
:(7) Commit transaction;
|Admin|
:(8) Review and approve each payroll, set status='APPROVED', notify employees;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (4) | BR76 | **Duplicate Check:** If Payroll for the same employee + month already exists with status != 'DRAFT', skip with warning. |
| (5) | BR77 | **Calculation:** `lateRate` and `overtimeRate` configurable in SystemSettings. Default lateRate = baseSalary/22/8/60 (per minute). Default overtimeRate = baseSalary/22/8 * 1.5 (per hour). |
| (8) | BR78 | **Approval Workflow:** Payroll starts in DRAFT. Admin must explicitly approve to lock it. Once APPROVED, becomes immutable. |

---

#### UC22: Generate Doctor Schedule

| Name | Generate Doctor Schedule |
| --- | --- |
| **Description** | This use case allows automatic or manual generation of doctor shift assignments for a future period, based on Shift Templates. |
| **Actor** | Admin, System (cron job) |
| **Trigger** | Weekly cron job, or Admin clicks "Generate Schedule" button. |
| **Pre-condition** | Shift Templates are defined for each shift (morning/afternoon/evening). Doctors have specialty and availability info. |
| **Post-condition** | DoctorShift records are created for the target week. |

**Activities Flow**

```plantuml
@startuml
|Trigger|
start
if ((1) manual or cron?) then (manual)
  |Admin|
  :(2) Select target week and click "Generate";
else (cron)
  |System|
  :(3) Cron fires every Sunday 23:00 (leader instance only);
endif
|System|
:(4) For each day × each ShiftTemplate, select doctors by rotation policy;
:(5) Insert DoctorShift records with default maxSlots from SystemSettings;
:(6) Log generation result;
|Admin|
:(7) Review and adjust assignments;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (3) | BR79 | **Cron Schedule:** `0 23 * * 0` (every Sunday at 23:00). Only the leader instance executes (when `ENABLE_SCHEDULER=true`). |
| (4) | BR80 | **Rotation Policy:** Round-robin within specialty. Avoid scheduling same doctor for 2 consecutive shifts on same day. Honor doctor's preferred days (stored in Doctor.preferredDays). |
| (5) | BR81 | **Default maxSlots:** Read from `SystemSettings.default_slots_per_shift` (default 15). |

---

#### UC23: Record Attendance

| Name | Record Attendance |
| --- | --- |
| **Description** | This use case allows employees to clock in and clock out, recording their attendance. |
| **Actor** | Employee (Doctor, Receptionist) |
| **Trigger** | When the employee clicks "Clock In" or "Clock Out" button. |
| **Pre-condition** | The employee is logged in. |
| **Post-condition** | An Attendance record is created or updated. |

**Activities Flow**

```plantuml
@startuml
|Employee|
start
:(1) Open Attendance page;
|System|
:(2) Display today's status;
|Employee|
:(3) Choose action: Clock In or Clock Out;
|System|
if (action == "Clock In"?) then (yes)
  :(4) Check duplicate (unique constraint on employeeId + date);
  :(5) Insert Attendance with clockInTime, calculate lateMinutes;
else (clock out)
  :(6) Fetch today's Attendance, update clockOutTime;
  :(7) Calculate workMinutes and overtimeMinutes;
endif
|Employee|
:(8) Show updated status;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (4) | BR82 | **Duplicate Clock-in Prevention:** Use unique constraint `(employeeId, date)` on Attendance table. |
| (5) | BR83 | **Late Calculation:** `lateMinutes = max(0, clockInTime - scheduledStart - 15_min_grace)`. |
| (7) | BR84 | **Overtime Calculation:** `overtimeMinutes = max(0, workMinutes - scheduledDuration - 30_min_grace)`. |

---

#### UC24: View Audit Logs

| Name | View Audit Logs |
| --- | --- |
| **Description** | This use case allows Admin to query and inspect audit log entries for compliance and incident investigation. |
| **Actor** | Admin |
| **Trigger** | When the Admin opens the Audit Log page. |
| **Pre-condition** | The Admin is logged in with permission `audit_logs.read`. |
| **Post-condition** | Audit log entries matching the filter are displayed. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Open Audit Log page;
|System|
:(2) Display filter form;
|Admin|
:(3) Set filters (date range, user, tableName, action);
:(4) Click "Search";
|System|
:(5) Validate filter rules (date range ≤ 90 days, etc.);
:(6) Build query and apply pagination (default limit=50, max 200);
:(7) Fetch from AuditLog table and return paged results;
|Admin|
:(8) View list and click entry to see old vs new values diff;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (5) | BR85 | **Filter Rules:** [dateFrom, dateTo] (max 90-day range), [userId], [tableName], [action] ∈ {CREATE, UPDATE, DELETE, VIEW, EXPORT}. |
| (6) | BR86 | **Pagination:** Default page=1, limit=50, max limit=200. |
| (8) | BR87 | **Diff Display:** Show oldValue and newValue as JSON, with diff highlighting (e.g. using `jsondiffpatch`). |

---

#### UC25: Generate Report

| Name | Generate Report |
| --- | --- |
| **Description** | This use case allows Admin to generate analytical reports (revenue, visits, inventory, payroll) for a specified period, exportable as Excel or PDF with charts. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Generate Report" button. |
| **Pre-condition** | The Admin is logged in with permission `reports.read`. |
| **Post-condition** | A report file (Excel/PDF) is downloaded by the user. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Open Reports page;
:(2) Select report type, date range, format;
:(3) Click "Generate";
|System|
:(4) Validate inputs (date range ≤ 12 months) and permission;
:(5) Run aggregate queries (route to replica DB if configured);
:(6) Build report data structure;
if (format == Excel?) then (yes)
  :(7) Build Excel workbook with exceljs;
else (PDF)
  :(7) Build PDF with pdfkit;
endif
:(8) Stream file to client;
|Admin|
:(9) Receive downloaded file;
stop
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (4) | BR88 | **Date Range:** Max 12 months per report. If exceeded, show error MSG 66. |
| (5) | BR89 | **Read Replica:** If `DB_REPLICA_URL` is configured, route aggregate queries to replica via Sequelize `useMaster: false`. |
| (8) | BR90 | **Streaming:** For large reports (>5000 rows), use Excel streaming writer to avoid memory issues. |
| (7) | BR91 | **Chart Generation:** Use chartjs-node-canvas to render PNG charts at 800x400, embed via `pdfkit.image()`. |

---

#### UC26: Update System Settings

| Name | Update System Settings |
| --- | --- |
| **Description** | This use case allows Admin to change runtime business parameters without redeploying the system. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Save Settings" on the System Settings page. |
| **Pre-condition** | The Admin is logged in with permission `system_settings.manage`. |
| **Post-condition** | The settings are persisted in SystemSettings table. In-process cache is invalidated. New requests use updated values. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Open System Settings page;
|System|
:(2) Display current settings;
|Admin|
:(3) Modify values according to settings schema;
:(4) Click "Save";
|System|
:(5) Show confirmation;
|Admin|
if (confirmed?) then (no)
  stop
else (yes)
endif
|System|
if ((6) valid per settings schema?) then (yes)
  :(7) UPDATE SystemSettings and invalidate in-process cache;
  :(8) Audit log each key change separately;
  |Admin|
  :Show success;
  stop
else (no)
  |Admin|
  :Show validation error;
  stop
endif
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (6) | BR92 | **Settings Schema:** Each setting has a defined key, type, validation rule. Examples:<br/>• `default_slots_per_shift` (int, 1-50)<br/>• `consultation_fee_default` (decimal, > 0)<br/>• `medicine_expiry_warning_days` (int, 1-180)<br/>• `late_cancellation_threshold_hours` (int, 1-72)<br/>• `notification_email_enabled` (boolean). |
| (7) | BR93 | **Cache Invalidation:** Call `systemSettingsService.refreshCache()`. Wrapper has TTL of 60s; explicit invalidation makes change effective within 1 second. |
| (8) | BR94 | **Audit Rules:** Each key change captured separately with old/new values. |

---

#### UC27: Toggle Maintenance Mode

| Name | Toggle Maintenance Mode |
| --- | --- |
| **Description** | This use case allows Admin to enable or disable maintenance mode, which blocks normal user API access while keeping admin endpoints available. |
| **Actor** | Admin |
| **Trigger** | When the Admin clicks "Enable/Disable Maintenance" on System Settings. |
| **Pre-condition** | The Admin is logged in with permission `maintenance.toggle`. |
| **Post-condition** | The maintenance flag is updated. Non-admin requests receive 503 within ≤ 1 second. |

**Activities Flow**

```plantuml
@startuml
|Admin|
start
:(1) Click "Enable Maintenance" or "Disable Maintenance";
|System|
:(2) Show strong confirmation dialog with impact preview;
|Admin|
if (confirmed?) then (no)
  stop
else (yes)
endif
|System|
:(3) UPDATE SystemSettings.maintenance_mode;
:(4) Invalidate in-process cache (TTL ≤ 1s for maintenance flag);
:(5) Audit log with action='TOGGLE_MAINTENANCE';
|Admin|
:(6) Show success with current status;
stop

note right
  When maintenance is ON:
  - checkMaintenance middleware
    returns 503 for non-admin requests
  - Admin endpoints (/api/admin/*, /api/auth/*)
    are bypassed
  - Frontend shows maintenance banner
end note
@enduml
```

**Business Rules**

| Activity | BR Code | Description |
| --- | --- | --- |
| (2) | BR95 | **Confirmation Required:** Strong confirmation dialog showing impact (number of currently logged-in users). |
| (4) | BR96 | **Effective Time:** ≤ 1 second from save to enforcement (limited by in-process cache TTL of 1 second when maintenance mode changes). |
| (5) | BR97 | **Bypass Rules:** Middleware bypasses for routes matching `/api/auth/*`, `/api/admin/*`, and any request whose JWT roleId == ADMIN. |

---

### 2.2. List Description

`Clinic Management System List Description.xlsx`

(Separate file containing detailed UI specifications for all forms and pages.)

### 2.3. View Description

`Clinic Management System View Description.xlsx`

(Separate file containing detailed screen layouts and component specifications.)

---

## 3. Non-functional Requirements

### 3.1. User Access and Security

| Function \\ Actor | Admin | Doctor | Receptionist | Patient |
| --- | :---: | :---: | :---: | :---: |
| Sign In | x | x | x | x |
| Sign Up | | | | x |
| Forgot Password | x | x | x | x |
| Sign In with Google OAuth | | | | x |
| Sign Out | x | x | x | x |
| Change Password | x | x | x | x |
| Update Own Profile | x | x | x | x |
| Manage Employee Account | x | | | |
| Book Appointment Online | | | | x |
| Book Appointment Offline | | | x | |
| Cancel Own Appointment | | | | x |
| Cancel Any Appointment | x | | x | |
| Reschedule Own Appointment | | | | x |
| Reschedule Any Appointment | x | | x | |
| Check-in Patient | x | | x | |
| Record Visit | | x | | |
| Create Prescription | | x | | |
| View Own Prescription | | | | x |
| Manage Medicine | x | | | |
| Import Medicine to Stock | x | | | |
| Create Invoice | x | | x | |
| View Own Invoice | | | | x |
| Process Payment | x | | x | |
| Process Refund | x | | | |
| Generate Payroll | x | | | |
| View Own Payroll | | x | x | |
| Generate Doctor Schedule | x | | | |
| View Own Schedule | | x | | |
| Record Own Attendance | | x | x | |
| View Audit Logs | x | | | |
| Generate Report | x | | | |
| View Dashboard | x | | | |
| Update System Settings | x | | | |
| Toggle Maintenance Mode | x | | | |

**Legend:** `x` = User has permission to perform the action.

---

### 3.2. Performance Requirements

**Number of users**

- Number of concurrent users: 50 (typical) — 100 (peak during morning registration hours)
- Number of business users: 500 — 1500 registered patients per clinic + 5-20 staff members

**Data volume**

- Number of records (steady state after 3 years):
  - Patient: 5,000 — 20,000
  - Appointment: 50,000 — 200,000 (≈ 50–80 per day)
  - Visit: 50,000 — 200,000
  - Prescription: 40,000 — 180,000
  - Invoice: 50,000 — 200,000
  - AuditLog: 500,000 — 2,000,000
- Data growth rate: ~5 MB/day (excluding file uploads)
- File upload growth: ~50 MB/day (avatars + symptom images)

**Level of availability**

- 99% uptime for core business flows (appointment booking, visit recording, invoice creation, payment).
- Maximum downtime: ~3.65 days/year (including planned maintenance).
- Recovery Time Objective (RTO): < 30 minutes for service restoration after failure.
- Recovery Point Objective (RPO): < 1 hour data loss tolerance.

**Response time**

- P95 < 500 ms for list/search APIs (patients, appointments, prescriptions, invoices, medicines).
- Dashboard aggregate queries < 1.5 seconds.
- Monthly report generation < 5 seconds.
- JWT verification < 100 ms.
- OTP email delivery < 30 seconds.
- Token revocation effective within ≤ 1 second across the system.

**Usage frequency**

- The system is used continuously during clinic operating hours (typically 7:00 — 20:00 local time, 7 days/week).
- Peak usage occurs during morning registration (7:00 — 9:00) and end-of-day invoicing (17:00 — 19:00).
- Maintenance windows are scheduled outside operating hours.

**Concurrency requirements**

- Up to 10 patients may attempt to book the same near-full doctor shift simultaneously without over-booking.
- The system must reject excess bookings with clear error messages.
- 0 cases of over-booking allowed (validated via concurrent test).

---

### 3.3. Implementation Requirements

**Location**

Ho Chi Minh City, Viet Nam (primary). Can be deployed on-premise at clinic location or in cloud (AWS ap-southeast-1, GCP asia-southeast1, Azure SEA region).

**Read-only Duration**

1 day (during planned major migrations, e.g. schema upgrades that cannot be done online).

**Read-only Timeframe**

00:00 — 04:00 (off-hours) on the day of maintenance.

**Maintenance Window**

Every week on Sunday evening at 23:00, lasting 1 to 2 hours. During this time, developers can deploy new versions, apply migrations, and perform infrastructure changes. Maintenance mode is enabled to block normal user traffic while admins can still access for monitoring.

**Overall conversion timeline**

- Initial data import (existing patient records from legacy system): one-time at go-live.
- Backup schedule: daily full backup at 02:00, weekly archive on Sunday.

**Deployment topology**

- Single-instance on-premise (Docker Compose): for clinics with stable on-site IT.
- Multi-instance cloud (Kubernetes or ECS): for clinic chains, with N stateless API instances behind a load balancer, MySQL primary+replica, Redis cluster, S3-compatible object storage for uploads.

**Browser compatibility**

- Chrome, Edge, Firefox, Safari: latest 2 major versions.
- No support for Internet Explorer.
- Mobile: responsive design supporting iOS Safari 14+ and Android Chrome 90+.

**Localization**

- Primary language: Vietnamese.
- All error codes are language-agnostic UPPER_SNAKE strings; frontend maps to localized text.
- Future support for English planned (i18n framework in frontend).

---

## 4. Appendixes

### Glossary

The list below contains all the necessary terms to interpret the document, including acronyms and abbreviations.

| Term | Description |
| --- | --- |
| **BR** | **B**usiness **R**ule |
| **CBR** | **C**ommon **B**usiness **R**ule |
| **DB** | **D**ata**b**ase |
| **MSG** | **M**essa**g**e |
| **UC** | **U**se **C**ase |
| **N/A** | **N**ot **A**vailable or **N**ot **A**pplicable, used to indicate when information in a certain section could not be provided because it does not apply to this application. |
| **UI** | **U**ser **I**nterface |
| **SRS** | **S**oftware **R**equirements **S**pecification |
| **TBD** | **T**o **b**e **d**etermined or to be defined |
| **OTP** | **O**ne-**T**ime **P**assword |
| **JWT** | **J**SON **W**eb **T**oken |
| **RBAC** | **R**ole-**B**ased **A**ccess **C**ontrol |
| **OAuth** | Open Authorization standard for delegated authentication |
| **PII** | **P**ersonally **I**dentifiable **I**nformation |
| **CRUD** | **C**reate, **R**ead, **U**pdate, **D**elete |
| **Appointment** | A scheduled meeting between patient and doctor at a specific shift. |
| **Visit** | A clinical examination event derived from a checked-in appointment, containing diagnosis and vitals. |
| **Prescription** | A list of medicines prescribed by a doctor during a visit. |
| **DoctorShift** | An assignment of a doctor to a specific shift on a specific date, with maxSlots. |
| **Shift** | A standardized work period (e.g. morning shift 7:00–11:00). |
| **Invoice** | A billing document for a completed visit, containing consultation fee and medicine items. |
| **Medicine Export** | A record of medicines dispensed to a patient. Created automatically inside the prescription transaction (UC15), in the same step as the Medicine.stock decrement (not at invoice creation time). |
| **Medicine Import** | A record of medicines stocked in from a supplier; increments stock. |
| **No-show** | An appointment status indicating the patient did not check in by the end of the shift. |
| **State Machine** | A centralized utility enforcing valid status transitions for Appointment, Visit, and Invoice entities. |
| **Audit Log** | A record of every mutating action capturing actor, action, target, before/after values, and timestamp. |
| **Maintenance Mode** | A runtime flag that returns 503 to non-admin users while allowing admins to continue operations. |
| **Token Blacklist** | A Redis-backed set of revoked JWT tokens checked on every authenticated request. |

---

### Messages

This section describes the details of messages used in business rules e.g. error messages, confirmation messages, etc.

| Message Code | Message Content | Button |
| --- | --- | --- |
| MSG 1 | Are you certain with this decision? | OK / Cancel |
| MSG 2 | You need to fill in all fields. | |
| MSG 3 | Operation completed successfully. | |
| MSG 4 | Payment failed. Please check your account. | |
| MSG 5 | Payment successful. | |
| MSG 6 | Are you sure you have received your service? | OK / Cancel |
| MSG 7 | Are you certain to approve this item? | |
| MSG 8 | Approve successful. | |
| MSG 9 | Are you certain to reject this item? | |
| MSG 10 | Reject successful. | |
| MSG 11 | File size is too large. | |
| MSG 12 | Item does not exist. | |
| MSG 13 | Price cannot be less than 0. | |
| MSG 14 | Description must contain at least 50 characters. | |
| MSG 15 | You don't have permission to perform this action. | |
| MSG 16 | Record updated. | |
| MSG 17 | Update failed. | |
| MSG 18 | The record does not exist. | |
| MSG 19 | Cannot delete a record with dependent data. | |
| MSG 20 | Delete successful. | |
| MSG 21 | Delete failed. | |
| MSG 22 | Email or password is incorrect. | |
| MSG 23 | Your account has been suspended. Please contact the clinic. | |
| MSG 24 | Logged in successfully. | |
| MSG 25 | Invalid password. Password must contain at least 8 characters, including letters, numbers, and special characters. | |
| MSG 26 | Phone number has been used. | |
| MSG 27 | Email has been registered. | |
| MSG 28 | Successfully registered. Please sign in. | |
| MSG 29 | Phone / email already exists. | |
| MSG 30 | Invalid phone number. | |
| MSG 31 | Invalid email format. | |
| MSG 32 | User not found. | |
| MSG 33 | Invalid or expired verification link. | |
| MSG 34 | New password must not be the same as the old password. | |
| MSG 35 | The message contains inappropriate words. | |
| MSG 36 | Network error. Please try again. | |
| MSG 37 | Invalid payment information. | |
| MSG 38 | Refund successful. | |
| MSG 39 | Refund failed. | |
| MSG 40 | Confirm successful. | |
| MSG 41 | Operation failed. | |
| MSG 42 | Thank you. | |
| MSG 43 | Status updated. | |
| MSG 44 | Action required. | OK / Cancel |
| MSG 45 | Phone number is not valid. | |
| MSG 46 | OTP is incorrect. | |
| MSG 47 | Thank you for your feedback. We will review it. | |
| MSG 48 | New record has been created. | |
| MSG 49 | This name already exists. | |
| MSG 50 | Update successful. | |
| MSG 51 | ALERT. Do you want to delete this? This action cannot be undone. | OK / Cancel |
| MSG 52 | Account change successful. | |
| MSG 53 | This account is invalid. | |
| MSG 54 | Document was updated successfully. | |
| MSG 55 | Feedback handled successfully. | |
| MSG 56 | OAuth authentication failed. Please try signing in with email and password. | |
| MSG 57 | You have been signed out successfully. | |
| MSG 58 | Invalid file format. Only JPEG, PNG, and WebP are allowed. | |
| MSG 59 | All slots for this shift have been booked. Please choose another shift. | |
| MSG 60 | This shift has already ended. Please choose another shift. | |
| MSG 61 | You have reached the maximum number of reschedules for this appointment. | |
| MSG 62 | This medicine will expire within 30 days. Please confirm to proceed. | OK / Cancel |
| MSG 63 | Stock is insufficient for this medicine. | |
| MSG 64 | Payment amount cannot exceed the invoice total. | |
| MSG 65 | Refund amount cannot exceed the paid amount. | |
| MSG 66 | Date range cannot exceed 12 months. | |
| MSG 67 | The system is under maintenance. Please try again later. | |
| MSG 68 | Your session has expired. Please sign in again. | |
| MSG 69 | Too many requests. Please slow down and try again later. | |
| MSG 70 | The doctor is not on duty for the selected shift. | |

---

### Issues List

| ID | Issue | Status | Assigned To | Notes |
| --- | --- | --- | --- | --- |
| ISS-001 | Online payment gateway (VNPay / MoMo) integration not yet implemented. Only cash and bank transfer (manual reconciliation) are supported. | Open | Backend Team | Structure ready; gateway sandbox accounts pending. |
| ISS-002 | Multi-instance deployment requires additional infrastructure changes (Redis-backed rate limit, scheduler leader flag). | Open | DevOps | See SAD Section 9 for migration plan. |
| ISS-003 | English UI translation not yet implemented. Currently Vietnamese only. | Deferred | Frontend Team | Phase 2 deliverable. |
| ISS-004 | Lab result integration with external lab systems not in scope for v1.0. | Out of Scope | — | Possible future enhancement. |
| ISS-005 | Telemedicine (video consultation) not supported in v1.0. | Out of Scope | — | — |
| ISS-006 | Insurance claim processing not supported in v1.0. | Out of Scope | — | Pending regulatory clarification. |

---

*End of Software Requirements Specification document.*
