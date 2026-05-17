# Quality Attribute Scenarios (QAS)

## 1. Security

### 1.1 Authentication Protection
**Element Statement**
* **Stimulus:** An unauthenticated or malicious user attempts to access protected API endpoints (e.g., `/api/patients`, `/api/appointments`).
* **Stimulus Source:** External User / Client Application.
* **Environment:** Normal operation.
* **Artifact:** System Authentication Middleware (`auth.middlewares.ts`), JWT Service.
* **Response:** The system intercepts the request, extracts the JWT from the `Authorization` header, and verifies its signature. If the token is missing or invalid, the system denies access and returns a `401 Unauthorized` status.
* **Response Measure:** 100% of unauthorized or improperly authenticated requests are denied.

### 1.2 Token Revocation and Session Invalidation
**Element Statement**
* **Stimulus:** A user logs out or an administrator forcefully revokes a compromised user session.
* **Stimulus Source:** Authenticated User / System Administrator.
* **Environment:** Normal operation.
* **Artifact:** `TokenBlacklistService` (Redis), Authentication Middleware.
* **Response:** The system adds the invalidated JWT to a Redis-based blacklist. Subsequent requests using this token are intercepted by the authentication middleware, checked against the blacklist, and immediately rejected.
* **Response Measure:** The revoked token is invalidated system-wide in < 100ms, and 100% of subsequent requests with the revoked token are denied.

### 1.3 Role-based Authorization (RBAC)
**Element Statement**
* **Stimulus:** An authenticated user attempts to perform an administrative action (e.g., modifying system settings, assigning roles) without sufficient privileges.
* **Stimulus Source:** Authenticated User (e.g., Patient, standard Employee).
* **Environment:** Normal operation.
* **Artifact:** Permission Middleware (`permission.middlewares.ts`), Role/Permission Models.
* **Response:** The system checks the user's assigned role and associated permissions against the required permissions for the endpoint. The system denies the request, returning a `403 Forbidden` status with a message indicating missing permissions.
* **Response Measure:** 100% of out-of-scope authorization attempts are blocked, and access control is enforced consistently across all protected endpoints.

### 1.4 Rate Limiting & DDoS Protection
**Element Statement**
* **Stimulus:** An attacker or a malfunctioning client script sends an abnormally high volume of requests to the API within a short time frame.
* **Stimulus Source:** External Attacker / Malfunctioning Client.
* **Environment:** Under peak load or attack conditions.
* **Artifact:** Rate Limiter Middleware (`express-rate-limit` in `app.ts`).
* **Response:** The system tracks the number of requests per IP address. Upon exceeding the predefined threshold (e.g., `RATE_LIMIT_MAX_REQUESTS` per `RATE_LIMIT_WINDOW_MS`), the system blocks further requests from that IP, returning a `429 Too Many Requests` status.
* **Response Measure:** Brute-force and flooding attacks are mitigated with 0% system degradation for legitimate traffic.

### 1.5 Secure Password Storage
**Element Statement**
* **Stimulus:** The system stores a newly created or updated user password in the database.
* **Stimulus Source:** Authentication Module / Registration Flow.
* **Environment:** Normal operation.
* **Artifact:** Authentication Service (`bcrypt`, `bcryptjs`).
* **Response:** The system generates a cryptographic salt and hashes the plaintext password using the bcrypt algorithm before storing the hash in the database.
* **Response Measure:** 100% of user passwords are mathematically irreversible from the database records, mitigating data breach impacts.

### 1.6 Cross-Site Scripting (XSS) & Header Security
**Element Statement**
* **Stimulus:** A user submits malicious script payloads via input fields, or a browser attempts to execute untrusted scripts.
* **Stimulus Source:** Malicious User / Compromised Client.
* **Environment:** Normal operation.
* **Artifact:** Security Middleware (`helmet`), Content Sanitizer (`isomorphic-dompurify`).
* **Response:** The system enforces strict HTTP response headers (via Helmet) to prevent execution of unauthorized scripts and sanitizes all incoming HTML/text payloads before processing or persisting them.
* **Response Measure:** 100% of recognized script injection payloads are neutralized before reaching the database.

---

## 2. Performance

### 2.1 Low Latency API Response (Data Retrieval)
**Element Statement**
* **Stimulus:** A client application requests frequently accessed, static, or semi-static data (e.g., list of specialties, public doctor profiles).
* **Stimulus Source:** Client Application.
* **Environment:** Normal or high traffic operation.
* **Artifact:** In-memory Cache Middleware (`cache.middlewares.ts`).
* **Response:** The system intercepts the `GET` request, generates a cache key based on the URL and query parameters, and retrieves the response payload directly from memory, bypassing the database layer.
* **Response Measure:** API response time for cached endpoints is < 50ms for 95% of requests.

### 2.2 Background Job Processing
**Element Statement**
* **Stimulus:** The system needs to perform heavy, time-consuming tasks such as checking medicine expiry dates or generating recurring doctor schedules.
* **Stimulus Source:** System Scheduler (Time-based trigger).
* **Environment:** Normal operation.
* **Artifact:** Job Scheduler (`node-cron`), Background Workers (`medicineExpiryCheck.ts`, `scheduleGenerationCron.ts`).
* **Response:** The system offloads these tasks to asynchronous background jobs running on predefined cron schedules. The main Node.js event loop remains unblocked, allowing the API to continue serving client requests without latency spikes.
* **Response Measure:** Background processing does not increase API latency; main thread event loop delay remains < 50ms during job execution.

### 2.3 Bulk Data Export Throughput
**Element Statement**
* **Stimulus:** An administrator requests the export of a large dataset (e.g., monthly financial reports, inventory logs) to Excel or PDF format.
* **Stimulus Source:** System Administrator / Manager.
* **Environment:** Normal operation.
* **Artifact:** Reporting Services (`exceljs`, `pdfkit`).
* **Response:** The system queries the database using pagination or streams, compiles the data, generates the requested file format, and streams the file back to the client.
* **Response Measure:** System can generate and export a 10,000-record report in < 5 seconds without causing memory overflow (OOM) errors.

---

## 3. Manageability

### 3.1 Comprehensive Audit Logging
**Element Statement**
* **Stimulus:** A user performs a critical state-changing operation (e.g., updating a patient record, changing system settings, issuing a refund).
* **Stimulus Source:** Authenticated User (Admin/Employee/Doctor).
* **Environment:** Normal operation.
* **Artifact:** Audit Log Middleware (`auditLog.middlewares.ts`), `AuditLog` Model.
* **Response:** The system automatically captures the user ID, action type, endpoint, IP address, and payload (before/after state), and asynchronously persists this record to the `AuditLogs` table for future compliance and security review.
* **Response Measure:** 100% of state-changing operations on sensitive entities are logged with < 10ms overhead per transaction.

### 3.2 System Maintenance Mode
**Element Statement**
* **Stimulus:** The IT team needs to perform an emergency database migration or critical update.
* **Stimulus Source:** System Administrator.
* **Environment:** Maintenance operation.
* **Artifact:** Maintenance Middleware (`maintenance.middlewares.ts`).
* **Response:** The system administrator activates maintenance mode. The middleware intercepts all incoming non-admin API requests and returns a standard `503 Service Unavailable` response with a maintenance message, while allowing administrators to bypass the lock to verify the update.
* **Response Measure:** Maintenance mode is activated globally in < 1 second, and 100% of non-essential traffic is halted immediately.

### 3.3 Centralized Application Logging
**Element Statement**
* **Stimulus:** An unhandled exception occurs, or the system processes standard HTTP requests.
* **Stimulus Source:** Application Runtime / Client Requests.
* **Environment:** All environments (Development, Staging, Production).
* **Artifact:** Logging Framework (`morgan`, `winston`).
* **Response:** The system formats the request metadata or error stack trace and outputs it to the standard output/error streams and persistent log files with appropriate log levels (INFO, WARN, ERROR).
* **Response Measure:** 100% of runtime errors are captured and traceable via log aggregators with exact timestamps and stack traces.

---

## 4. Data Integrity

### 4.1 Strict Input Validation
**Element Statement**
* **Stimulus:** A client submits a payload to create a new prescription or update a patient profile containing missing or malformed fields.
* **Stimulus Source:** Client Application.
* **Environment:** Normal operation.
* **Artifact:** Validation Middlewares (`validatePrescription.middlewares.ts`, `validatePatient.middlewares.ts`, `express-validator`), Frontend Validation (`zod`, `react-hook-form`).
* **Response:** The system validates the payload against predefined schemas (e.g., checking data types, string lengths, mandatory fields). If the payload is invalid, the system aborts the operation and returns a `400 Bad Request` with detailed validation error messages.
* **Response Measure:** 100% of malformed payloads are rejected before interacting with the database schema.

### 4.2 Relational Consistency
**Element Statement**
* **Stimulus:** An administrator attempts to delete a doctor profile that has existing appointments and prescriptions linked to it.
* **Stimulus Source:** System Administrator.
* **Environment:** Normal operation.
* **Artifact:** ORM Layer (`sequelize`), Database Constraints (`associations.ts`).
* **Response:** The database enforces foreign key constraints. The system either rejects the hard delete operation, or utilizes a "soft delete" (if configured) to mark the record as inactive while preserving historical medical data integrity.
* **Response Measure:** 0 orphaned records are created; referential integrity is maintained at 100%.

---

## 5. Availability & Reliability

### 5.1 Graceful Error Recovery
**Element Statement**
* **Stimulus:** A database connection timeout occurs during a critical transaction.
* **Stimulus Source:** Database Layer / Network Interface.
* **Environment:** Degraded network operation.
* **Artifact:** Global Error Handler (`errorHandler.middlewares.ts`).
* **Response:** The system catches the unhandled promise rejection, logs the critical failure, and returns a standardized `500 Internal Server Error` payload to the client without crashing the main Node.js process.
* **Response Measure:** The Node.js application process remains alive (0% crash rate from unhandled async errors), and the client receives a formatted error response in < 50ms.

### 5.2 Removal from Service (Planned Maintenance)
**Element Statement**
* **Stimulus:** The system administrator needs to perform a critical database migration, software upgrade, or system maintenance task that could cause faults if executed on a live system.
* **Stimulus Source:** System Administrator (via System Settings UI).
* **Environment:** Pre-maintenance window (planned or emergency).
* **Artifact:** Maintenance Middleware (`maintenance.middlewares.ts`), System Settings Controller (`system.controller.ts`), SystemSettings Model (`maintenanceMode` flag).
* **Response:** The administrator activates Maintenance Mode through the admin dashboard. The `checkMaintenance` middleware intercepts all incoming API requests: requests from Admin users are allowed through (bypass) for monitoring and verification, while all non-admin requests are immediately rejected with HTTP `503 Service Unavailable` and a user-friendly maintenance message. The maintenance state is cached for 30 seconds to minimize database queries, with immediate cache invalidation upon state change via `clearMaintenanceCache()`. Once maintenance is complete, the administrator deactivates Maintenance Mode, restoring full service availability.
* **Response Measure:** Maintenance mode activates system-wide in < 1 second. 100% of non-admin traffic is halted. System returns to full operation within < 1 second of deactivation. Zero data loss during the maintenance window.

---

## 6. Usability

### 6.1 Responsive Frontend UI
**Element Statement**
* **Stimulus:** A doctor accesses the clinic dashboard using a mobile device or a tablet.
* **Stimulus Source:** End User (Doctor).
* **Environment:** Normal operation.
* **Artifact:** Frontend Framework (`React`, `Vite`), Styling (`Tailwind CSS`, `Radix UI`).
* **Response:** The user interface automatically adapts its layout, typography, and component structure based on the viewport width (responsive breakpoints).
* **Response Measure:** The application is fully readable and interactive on viewports ranging from 320px to 4K without horizontal scrolling.

---

## Implementation Mapping
*(Code feature → Generated Requirement)*

| Code Feature / Implementation | Generated Quality Attribute Scenario | QA Category |
| :--- | :--- | :--- |
| `jsonwebtoken`, `auth.middlewares.ts` | 1.1 Authentication Protection | Security |
| `TokenBlacklistService` (Redis) | 1.2 Token Revocation and Session Invalidation | Security |
| `permission.middlewares.ts`, `Role`/`Permission` Models | 1.3 Role-based Authorization (RBAC) | Security |
| `express-rate-limit` in `app.ts` | 1.4 Rate Limiting & DDoS Protection | Security |
| `bcrypt`, `bcryptjs` dependencies | 1.5 Secure Password Storage | Security |
| `helmet`, `isomorphic-dompurify` dependencies | 1.6 Cross-Site Scripting (XSS) & Header Security | Security |
| `cache.middlewares.ts` (In-memory Map) | 2.1 Low Latency API Response | Performance |
| `node-cron`, `jobs/medicineExpiryCheck.ts` | 2.2 Background Job Processing | Performance |
| `exceljs`, `pdfkit` dependencies | 2.3 Bulk Data Export Throughput | Performance |
| `auditLog.middlewares.ts`, `AuditLog` Model | 3.1 Comprehensive Audit Logging | Manageability |
| `maintenance.middlewares.ts` | 3.2 System Maintenance Mode | Manageability |
| `morgan`, `winston` dependencies | 3.3 Centralized Application Logging | Manageability |
| `express-validator`, `middlewares/validate*.ts`, `zod` | 4.1 Strict Input Validation | Data Integrity |
| `sequelize`, `models/associations.ts` | 4.2 Relational Consistency | Data Integrity |
| `errorHandler.middlewares.ts` | 5.1 Graceful Error Recovery | Availability & Reliability |
| `maintenance.middlewares.ts`, `system.controller.ts`, `SystemSettings` | 5.2 Removal from Service (Planned Maintenance) | Availability & Reliability |
| `React`, `Tailwind CSS`, `Radix UI` | 6.1 Responsive Frontend UI | Usability |
