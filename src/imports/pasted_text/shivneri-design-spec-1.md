Design a complete, production-ready enterprise SaaS product called **SHIVNERI – Enterprise Transport Management Platform**.

Create a modern, premium, enterprise-grade UI/UX for a multi-tenant corporate employee transportation platform. The product manages employees, drivers, vehicles, routes, rides, live tracking, safety, billing, analytics, permissions, policies, approvals, and security.

The design must feel similar in quality to modern enterprise platforms such as Microsoft, Google Cloud, Stripe, Linear, and Datadog — clean, professional, information-dense but easy to understand.

## 1. DESIGN SYSTEM

Create a complete reusable design system first.

Visual style:

* Premium enterprise SaaS
* Clean and minimal
* Professional corporate appearance
* High information clarity
* Strong visual hierarchy
* Spacious but optimized for dashboard density
* Rounded cards and modern tables
* Subtle shadows
* Minimal gradients
* Consistent iconography
* Accessible contrast
* Responsive layouts

Primary brand:

* Brand name: SHIVNERI
* Logo concept: modern geometric "S" inspired by transportation/network routes
* Primary color: deep navy / royal blue
* Secondary accent: cyan/teal
* Success: green
* Warning: amber
* Error/SOS: red
* Neutral background: light gray/white
* Dark mode should also be supported

Typography:

* Use Inter or a similar modern enterprise font
* Large bold dashboard headings
* Medium-weight section headings
* Highly readable body text
* Compact table typography

Create:

* Color tokens
* Typography tokens
* Spacing scale
* Border radius system
* Shadows
* Buttons
* Inputs
* Selects
* Dropdowns
* Tabs
* Badges
* Status indicators
* Modals
* Drawers
* Toast notifications
* Tooltips
* Data tables
* Pagination
* Charts
* Empty states
* Loading states
* Error states
* Confirmation dialogs

## 2. APPLICATION STRUCTURE

Create four major experiences:

1. SHIVNERI PLATFORM ADMIN PORTAL
2. CLIENT ORGANIZATION PORTAL
3. EMPLOYEE MOBILE APP
4. DRIVER MOBILE APP

The system is multi-tenant. Client organizations must only see their own organization data.

Include role-based navigation and permission-aware UI.

The documentation defines layered authorization using authentication, tenant resolution, RBAC, ABAC/policy rules, resource ownership, business rules and auditing. Reflect this architecture visually in the product.

---

# 3. PLATFORM ADMIN PORTAL

Design a desktop web application.

### Global Layout

Left sidebar:

* Overview
* Organizations
* Users
* Drivers
* Vehicles
* Rides
* Live Operations
* Routes
* Safety & Incidents
* Billing
* Analytics
* Access Control
* Policy Engine
* Approvals
* Security & Audit
* Integrations
* Settings

Top navigation:

* Global search
* Organization selector
* Notifications
* Emergency alerts
* Help
* User profile

---

# 4. ADMIN DASHBOARD

Create an executive dashboard containing:

KPI cards:

* Total Organizations
* Active Employees
* Active Drivers
* Vehicles
* Today's Trips
* Active Trips
* Delayed Trips
* SOS Alerts

Charts:

* Daily trips
* Ride completion rate
* Vehicle utilization
* Driver utilization
* Monthly transport cost
* Organization growth

Live operations panel:

* Active rides
* Delayed rides
* SOS incidents
* Driver availability

Map:

* Real-time vehicle locations
* Active routes
* Incident markers
* Pickup/drop locations

Recent activity:

* New organization
* Driver verification
* Permission changes
* Policy changes
* Billing events
* Security events

---

# 5. ORGANIZATION MANAGEMENT

Create:

Organizations list page:

* Organization name
* Organization ID
* Employees
* Drivers
* Vehicles
* Active trips
* Status
* Subscription
* Created date
* Actions

Organization detail page with tabs:

Overview
Employees
Drivers
Vehicles
Routes
Rides
Billing
Policies
Roles
Reports
Audit

Include:

* Suspend organization
* Activate organization
* Configure policies
* Manage tenant settings
* Branding configuration

---

# 6. CLIENT ORGANIZATION PORTAL

Create a tenant-specific dashboard.

Sidebar:

Dashboard
Employees
Transport Requests
Shifts
Routes
Rides
Drivers
Vehicles
Safety
Reports
Billing
Access Control
Policies
Approvals
Audit Logs
Settings

Dashboard KPIs:

* Employees using transport
* Today's rides
* Active rides
* Delayed rides
* Cancellation rate
* Vehicle utilization
* Monthly transport cost
* Open incidents

Create a tenant-specific live transportation map.

---

# 7. EMPLOYEE MANAGEMENT

Employee table columns:

Employee ID
Name
Department
Shift
Pickup Location
Drop Location
Transport Eligibility
Upcoming Ride
Status
Actions

Employee profile page:

Personal information
Employee ID
Department
Contact information
Pickup/drop locations
Shift
Transport history
Upcoming rides
Attendance
Complaints
Safety contacts
Access permissions

Sensitive information should be masked by default.

Example:
Phone: ******4821
Identity document: ••••••••••
Emergency contact: Restricted

---

# 8. ROLE & PERMISSION MANAGEMENT

Create a sophisticated **Access Control Center**.

Roles:

* Organization Admin
* Transport Manager
* Operations Manager
* HR Manager
* Security Manager
* Finance Manager
* Report Manager
* Fleet Manager
* Driver Supervisor
* Vehicle Manager
* Employee
* Custom Role

The documentation requires organizations to create custom roles using granular permissions.

Create:

### Roles Page

Table:
Role
Users
Permissions
Scope
Status
Last Updated
Actions

### Create Role

Fields:
Role Name
Description
Role Type
Organization Scope
Department Scope
Location Scope
Time Restrictions

Permission matrix:

```
                Read   Create   Update   Delete   Approve
```

Employees            ✓       ✓        ✓        ✓        -
Drivers              ✓       ✓        ✓        ✓        ✓
Vehicles             ✓       ✓        ✓        ✓        ✓
Rides                ✓       ✓        ✓        ✓        ✓
Tracking             ✓       -        -        -        -
Billing              ✓       ✓        ✓        -        ✓
Reports              ✓       -        -        -        -
Incidents            ✓       ✓        ✓        -        ✓

Use grouped permissions:

* Organization
* Employees
* Drivers
* Vehicles
* Rides
* Tracking
* Safety
* Recordings
* Billing
* Reports
* Administration

---

# 9. POLICY ENGINE

Create a flagship **Rule-Based Access Control / Policy Engine** interface.

This should be one of the most visually impressive sections.

Page title:
"Policy Engine"

Subtitle:
"Define contextual rules that determine who can access what, when and under which conditions."

Policy list:

Policy Name
Resource
Action
Condition
Effect
Priority
Version
Status
Last Modified

Example policies:

Employee can view own ride
→ IF ride.employee_id == user.id
→ ALLOW

Tenant isolation
→ IF resource.organization_id != user.organization_id
→ DENY

Manager cancellation
→ IF role = Transport Manager AND cancellation before cutoff
→ ALLOW

Department restriction
→ IF employee.department belongs to manager scope
→ ALLOW

Temporary recording access
→ IF current_time < access.expiry
→ ALLOW

Emergency access
→ IF active SOS AND authorized security role
→ ALLOW + AUDIT

These policy examples should visually represent the documented policy engine model.

---

# 10. VISUAL POLICY BUILDER

Create a drag-and-drop / form-based policy builder.

Header:
"Create Access Policy"

Sections:

WHEN

* User
* Role
* Organization
* Department
* Location
* Time
* Device
* Risk Level

CAN

* Read
* Create
* Update
* Delete
* Approve
* Export
* Track
* Download

RESOURCE

* Employee
* Ride
* Driver
* Vehicle
* Incident
* Recording
* Billing

IF CONDITIONS

* Department equals
* Location is within
* Shift is active
* Resource belongs to organization
* Date/time condition
* Risk score
* Approval status

THEN

* ALLOW
* DENY
* REQUIRE APPROVAL

Add a visual rule:

USER → ROLE → RESOURCE → CONDITIONS → DECISION

Show live policy preview.

---

# 11. POLICY SIMULATOR

Create an advanced testing interface.

Title:
"Policy Decision Simulator"

Inputs:

User:
Akshat Gupta

Role:
Transport Manager

Organization:
Shivneri Demo Organization

Action:
ride.cancel

Resource:
Ride #RIDE-10492

Context:
Department = Engineering
Location = Pune
Shift = Active
Time = 18:20

Button:
"Evaluate Policy"

Result card:

ACCESS ALLOWED

Reason:
"Transport Manager has ride.cancel permission and the ride belongs to the user's organization."

Show:
Policy matched
Policy ID
Priority
Conditions evaluated
Decision
Correlation ID
Timestamp

Support three outcomes:
ALLOW
DENY
REQUIRE APPROVAL

The documentation explicitly specifies this simulator and human-readable decision explanation.

---

# 12. ACCESS REQUEST / APPROVAL SYSTEM

Create an approval center.

Cards:

* Pending Access Requests
* Emergency Access
* Sensitive Permission Requests
* Vehicle Approval
* Driver Verification
* Billing Approval

Request detail:

Requester
Requested permission
Resource
Reason
Requested duration
Risk level
Approvers
Created at

Actions:
Approve
Reject
Request Changes

Show approval timeline.

---

# 13. EMERGENCY / BREAK-GLASS ACCESS

Create a dedicated security interface.

When an employee triggers SOS:

Large emergency alert:

🚨 ACTIVE SOS

Employee:
Employee #10482

Ride:
RIDE-98231

Location:
Live GPS location

Driver:
Raj Kumar

Vehicle:
MH12AB1234

Time:
22:18

Actions:

View Live Location
Contact Employee
Contact Driver
Access Emergency Data
Open Incident

Emergency access must require explicit authorization.

Show:
"Break-Glass Access"

Fields:
Reason
Access Scope
Duration

Example:
Access scope:
✓ Live Location
✓ Emergency Contact
✗ Billing
✗ Personal Documents

Duration:
30 minutes

Button:
"Grant Emergency Access"

Show warning:
"All emergency access is logged and automatically expires."

This reflects the documented emergency-access workflow.

---

# 14. SAFETY & INCIDENT MANAGEMENT

Create Safety dashboard.

KPIs:
SOS Events
Open Incidents
Average Response Time
Resolved Incidents

Incident table:
Incident ID
Severity
Employee
Driver
Vehicle
Location
Type
Status
Assigned Security Officer
Created
Actions

Incident detail:

Timeline
GPS map
Employee information
Driver information
Vehicle
Evidence
Audio/video access
Actions taken
Security notes
Audit trail

Severity:
Critical
High
Medium
Low

---

# 15. LIVE OPERATIONS CENTER

Create a highly visual operations dashboard.

Full-screen map.

Map markers:

* Green = active
* Yellow = delayed
* Red = SOS
* Gray = inactive

Right-side panel:

Active Trips

RIDE-10421
Driver: Raj
Employee: 4
ETA: 08 min
Status: On Route

RIDE-10422
Delayed 12 min

Clicking a ride opens live tracking.

Show:
Driver location
Route
Pickup
Drop
ETA
Speed
Passengers
Ride state

Ride lifecycle:

Assigned
→ Driver Arrived
→ Ride Started
→ Ride Completed

---

# 16. FLEET MANAGEMENT

Create:

Vehicles page

Columns:
Vehicle Number
Model
Capacity
Driver
Status
Insurance
Fitness
Permit
Utilization
Next Service

Vehicle detail:
Vehicle information
Documents
Driver assignment
Maintenance
Trips
Utilization
Compliance

Add expiry alerts.

---

# 17. DRIVER MANAGEMENT

Driver list:

Photo
Name
Driver ID
Verification
Vehicle
Availability
Trips Today
Rating
Incidents
Status

Driver profile:

Personal information
License
Identity verification
Assigned vehicle
Trip history
Performance
Ratings
Incidents
Documents
Availability

Use verification badges.

---

# 18. ROUTE MANAGEMENT

Create route planning interface.

Left:
Route details

Right:
Large map

Show:
Pickup stops
Drop stops
Employee clusters
Driver
Vehicle
Estimated distance
ETA
Route status

Actions:
Create Route
Optimize Route
Assign Driver
Assign Vehicle

---

# 19. BILLING & FINANCE

Create finance dashboard.

KPIs:
Monthly Revenue
Transport Cost
Cost / Employee
Cost / Route
Pending Invoices
Paid Invoices

Charts:
Monthly billing
Cost trend
Organization billing
Route cost

Invoice table:
Invoice ID
Organization
Period
Amount
Status
Generated
Approved
Actions

Invoice detail:
Trips
Employees
Routes
Cost breakdown
Taxes
Total
Approval timeline

---

# 20. ANALYTICS

Create an enterprise analytics dashboard.

Tabs:
Operations
Fleet
Safety
Finance
Drivers
Employees
Tenant

Charts:
Trips over time
Completion rate
Cancellation rate
Vehicle utilization
Driver utilization
SOS events
Incident response time
Cost per employee
Cost per route
Employee usage
Booking trends

Allow:
Date filter
Organization filter
Department filter
Location filter
Export
Schedule Report

---

# 21. SECURITY & AUDIT CENTER

Create a professional security event viewer.

Events:
Login
Logout
Failed login
Role change
Permission change
Policy change
Sensitive data access
Location access
SOS access
Recording access
Export
Billing change
Admin action

Table:

Timestamp
Actor
Organization
Action
Resource
Result
IP
Device
Session
Risk

Filters:
Date
User
Organization
Action
Result
Risk

Result badges:
SUCCESS
DENIED
REQUIRES APPROVAL

---

# 22. ACCESS TRANSPARENCY

Whenever access is denied, design a friendly explanation.

Example:

Access Denied

"You don't have permission to cancel this ride."

Reason:
Your role does not include ride.cancel permission.

Additional condition:
Ride belongs to another department.

Request Access button.

Do NOT expose sensitive internal policy implementation details to normal users.

---

# 23. EMPLOYEE MOBILE APP

Create iOS/Android mobile screens.

Screens:

Splash
Login
OTP
Home
Upcoming Ride
Book Ride
Ride Details
Live Tracking
Driver Details
ETA
Ride History
Attendance
SOS
Emergency Contacts
Notifications
Profile
Settings
Feedback

Home screen:

Good Morning, Akshat 👋

Today's Ride

07:30 AM
Pune → Hinjewadi

Driver:
Raj Kumar

ETA:
12 min

[Track Ride]

Emergency SOS button should always be easily accessible.

---

# 24. DRIVER MOBILE APP

Screens:

Login
Dashboard
Trip Requests
Trip Details
Navigation
Passenger Verification
OTP Verification
Start Ride
Active Ride
Complete Ride
SOS
Accident Report
Breakdown Report
Trip History
Earnings
Performance
Profile

Driver dashboard:

Today's Trips
Completed
Upcoming
Earnings
Rating

Trip card:

Ride ID
Pickup
Drop
Employees
Distance
ETA

Actions:
Accept
Reject
Start Trip
Complete Trip

---

# 25. NOTIFICATION CENTER

Create notification system.

Categories:
Operations
Safety
Security
Billing
Approvals
System

Examples:

🚨 SOS alert received

🔐 New access request

🚗 Driver verification completed

💳 Invoice approved

⚠ Vehicle insurance expires in 7 days

---

# 26. SETTINGS

Create settings sections:

Organization
Branding
Users
Roles
Permissions
Policies
Security
MFA
SSO
Notifications
Privacy
Data Retention
Integrations
API Keys
Webhooks

API key page:
Key name
Created
Last used
Expiry
Status
IP restrictions
Rate limits

---

# 27. IMPORTANT UX STATES

Design all states:

Loading
Empty
Success
Error
Permission denied
Unauthorized
Session expired
Offline
Network error
No rides
No drivers
No vehicles
No incidents
Policy conflict
Approval required

---

# 28. RESPONSIVE DESIGN

Create desktop-first layouts for Admin and Organization portals.

Breakpoints:
1440px desktop
1280px laptop
1024px tablet
390px mobile

Mobile apps should use native mobile patterns.

Ensure tables become cards on mobile.

---

# 29. ACCESSIBILITY

Follow WCAG-style accessibility principles.

Ensure:

* High color contrast
* Keyboard navigation
* Visible focus states
* Clear labels
* Accessible error messages
* Don't rely only on color
* Large touch targets
* Screen-reader-friendly structure

---

# 30. PROTOTYPE FLOWS

Create clickable prototypes for these flows:

FLOW 1:
Login → Dashboard → Live Operations → Ride → Driver → Live Tracking

FLOW 2:
Dashboard → Employee → Employee Profile → Ride History

FLOW 3:
Access Control → Roles → Create Role → Permissions → Save

FLOW 4:
Policy Engine → Create Policy → Conditions → Decision → Publish

FLOW 5:
Policy Simulator → Select User → Select Action → Evaluate → Decision

FLOW 6:
SOS → Emergency Alert → Incident → Break-Glass Access → Audit

FLOW 7:
Driver Management → Driver → Verification → Approve

FLOW 8:
Billing → Invoice → Review → Approve → Export

FLOW 9:
Audit Center → Filter → Event → Event Details

---

# 31. FIGMA FILE ORGANIZATION

Create pages:

01 — Cover
02 — Design System
03 — Components
04 — Admin Dashboard
05 — Organization Portal
06 — Employee Management
07 — Fleet & Drivers
08 — Live Operations
09 — Safety & Incidents
10 — Billing
11 — Analytics
12 — Access Control
13 — Policy Engine
14 — Policy Simulator
15 — Approvals
16 — Security & Audit
17 — Employee Mobile
18 — Driver Mobile
19 — Settings
20 — Prototype Flows

Use Auto Layout throughout.

Use reusable components and variants.

Use variables for:

* Colors
* Spacing
* Typography
* Radius
* Shadows
* Light/dark mode

Use component variants for:

* Button states
* Input states
* Status badges
* Table rows
* Permission states
* Alerts
* Cards
* Navigation

---

# 32. DESIGN PRIORITY

The most important screens should receive the highest visual polish:

1. Admin Dashboard
2. Live Operations Center
3. Access Control Center
4. Policy Engine
5. Policy Simulator
6. Emergency / Break-Glass Access
7. Security & Audit Center
8. Analytics Dashboard
9. Employee Mobile Home
10. Driver Mobile Dashboard

The final Figma prototype should communicate that Shivneri is a **secure enterprise transportation operating system**, not merely a ride-booking application.

Maintain consistent navigation, spacing, typography, components and interaction patterns across the entire product.

Use realistic sample data instead of lorem ipsum.

Make the final result presentation-ready for a college project demo, hackathon, investor presentation, and enterprise product demonstration.
