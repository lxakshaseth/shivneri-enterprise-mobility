Update the existing SHIVNERI Enterprise Transport Management dashboard UI.

IMPORTANT:
Do NOT redesign or replace the existing pages, tables, sidebar, header, colors, typography, spacing, cards, filters, or navigation.

Keep the current design exactly as it is.

Only improve the interaction behavior by implementing reusable **Dialog / Modal components** for Add, View, Edit, and Documents actions.

The dialogs must appear as centered rectangular/square enterprise-style modal components over the existing page with a subtle backdrop overlay.

Use the existing Shivneri design system:

* White dialog background
* Rounded corners
* Subtle shadow
* Thin/light border
* Blue primary buttons
* Red destructive actions
* Green success states
* Existing typography
* Existing spacing
* Existing icons
* Consistent button styles

The modal should NOT look like a full-page navigation.
It must clearly appear as an overlay dialog.

==================================================
GLOBAL DIALOG BEHAVIOR
======================

Create one reusable component:

"Shivneri Dialog"

Properties:

* Size: Small / Medium / Large / Extra Large
* Title
* Description
* Icon
* Content
* Footer
* Close button
* Backdrop
* Loading state
* Error state
* Success state

Default behavior:

When a user clicks an action:
→ Keep the current page visible in the background
→ Add a slightly dimmed backdrop
→ Open a centered dialog
→ Prevent interaction with the background
→ Allow closing using X
→ Allow closing using Cancel
→ Allow ESC to close where appropriate

Do NOT navigate away from the current page.

Animation:

* Fade in backdrop
* Slight scale-up + fade-in for dialog
* Smooth 150–200ms transition

==================================================

1. ORGANIZATIONS PAGE
   ==================================================

Existing page:
"Organizations"

Keep the current organization table exactly as designed.

---

## A. THREE-DOT MENU → EDIT ORGANIZATION

When user clicks the three-dot menu of an organization:

Show existing dropdown:

View Details
Edit Organization
Suspend
Delete

When user clicks:

"Edit Organization"

Open a centered Dialog Box.

Title:
"Edit Organization"

Subtitle:
"Update organization information and settings."

Dialog width:
600–700px

Fields:

Organization Name
Organization ID
City
Industry
Plan
Status
Contact Email
Contact Phone
Employee Capacity

Example:

Organization Name:
TCS Pune Campus

Organization ID:
ORG-001

City:
Pune

Plan:
Enterprise

Status:
Active

Contact Email:
[admin@tcs.example](mailto:admin@tcs.example)

Contact Phone:
+91 XXXXX XXXXX

Buttons:

Cancel
Save Changes

Primary:
"Save Changes"

Show success state after save:

✓ Organization updated successfully.

Organization:
TCS Pune Campus

Automatically close the success state after confirmation.

---

## B. ADD ORGANIZATION

When clicking:

"+ Add Organization"

DO NOT navigate to a new page.

Open a centered Dialog Box.

Title:
"Add Organization"

Subtitle:
"Create a new client organization."

Dialog size:
Large / 650–750px

Form sections:

Organization Information

Organization Name *
Organization ID *
Industry
City
Address

Contact Information

Admin Name
Email
Phone

Subscription

Plan:
Business / Enterprise / Trial

Status:
Active / Trial / Suspended

Settings

Employee Limit
Transport Policy
Timezone

Footer:

Cancel
Create Organization

Primary button:
"Create Organization"

Show validation states.

Required fields should display *.

After successful creation:

✓ Organization created successfully.

Show newly created organization summary.

---

## C. VIEW ORGANIZATION

When clicking:

"View"

Open a centered Large Dialog.

Title:
"TCS Pune Campus"

Subtitle:
"Organization overview"

Inside the dialog show:

Organization status:
Active

Plan:
Enterprise

Organization ID:
ORG-001

City:
Pune

Created:
Jan 2024

Statistics:

Employees
4,200

Drivers
182

Vehicles
134

Active Trips
89

Add tabs:

Overview
Employees
Drivers
Vehicles
Rides
Billing
Audit

Use compact cards and tables inside the dialog.

Footer:
Close
"Open Full Details"

"Open Full Details" can navigate to the detailed organization page.

==================================================
2. EMPLOYEES PAGE
=================

Keep the existing Employees table exactly as shown.

---

## A. ADD EMPLOYEE

When clicking:

"+ Add Employee"

Open centered Dialog.

Title:
"Add Employee"

Subtitle:
"Create an employee transport profile."

Dialog width:
700px

Sections:

Personal Information

First Name *
Last Name *
Employee ID *
Email *
Phone

Organization

Department
Designation
Manager
Employment Status

Transport Details

Shift
Pickup Location
Drop Location
Transport Eligibility

Emergency Information

Emergency Contact Name
Emergency Contact Phone
Relationship

Access

Role
Transport Access
Notification Preferences

Footer:

Cancel
Create Employee

Primary:
"Create Employee"

Show:

✓ Employee created successfully.

---

## B. VIEW EMPLOYEE

When clicking:

"View"

from any employee row:

Open centered Large Dialog.

Title:
"Employee Profile"

Show profile header:

Avatar
Akshat Gupta
EMP-10481
Engineering
Active

Information cards:

Employee ID
Department
Shift
Pickup
Drop
Eligibility
Upcoming Ride
Status

Add tabs:

Overview
Transport
Ride History
Attendance
Safety
Access

Transport section:

Pickup:
Kothrud, Pune

Drop:
Hinjewadi Phase 1

Shift:
Morning

Upcoming Ride:
RIDE-10421

Ride History table:

Ride ID
Date
Route
Driver
Status

Safety section:

Emergency Contact
Safety Preferences
Recent Incidents

Access section:

Role
Permissions
Organization
Last Login

Footer:

Close
Edit Employee

"Edit Employee" should open the Edit Employee dialog.

==================================================
3. DRIVERS PAGE
===============

Keep existing Drivers table and layout unchanged.

---

## A. ADD DRIVER

When clicking:

"+ Add Driver"

Open centered Large Dialog.

Title:
"Add Driver"

Subtitle:
"Register and verify a new driver."

Sections:

Driver Information

Full Name *
Driver ID *
Phone *
Email
Address

License Information

License Number *
License Type
Issue Date
Expiry Date

Identity Verification

Government ID
Verification Status

Vehicle Assignment

Vehicle
Availability
Shift

Emergency Contact

Name
Phone
Relationship

Footer:

Cancel
Create Driver

Primary:
"Create Driver"

Show validation.

After creation:

✓ Driver created successfully.

---

## B. VIEW DRIVER

When clicking:

"View"

Open centered Large Dialog.

Header:

Driver avatar
Raj Kumar

DRV-001

✓ Verified

On Duty

Driver details:

Phone
License
Vehicle
Availability
Trips Today
Rating
Incidents

Create metric cards:

Trips Today
5

Rating
4.8 ★

Incidents
0

Status
Available

Tabs:

Overview
Trips
Vehicle
Documents
Performance
Incidents

Documents section:

Driving License
Identity Document
Police Verification
Insurance/Compliance

Each document should show:

Document name
Status
Uploaded date
Expiry date

Buttons:

View
Download

Footer:

Close
Edit Driver

==================================================
4. FLEET VEHICLES PAGE
======================

Keep the current Fleet Vehicles page unchanged.

Preserve:

KPI cards
Expiry warning
Filters
Vehicle table
Utilization bars
Status badges

---

## A. ADD VEHICLE

When clicking:

"+ Add Vehicle"

Open centered Large Dialog.

Title:
"Add Vehicle"

Subtitle:
"Register a vehicle and configure compliance details."

Sections:

Vehicle Information

Vehicle Number *
Vehicle Model *
Manufacturer
Vehicle Type
Capacity
Fuel Type

Assignment

Driver
Organization
Route

Compliance

Insurance Number
Insurance Expiry
Fitness Certificate
Fitness Expiry
Permit Number
Permit Expiry

Maintenance

Last Service
Next Service
Maintenance Status

Footer:

Cancel
Add Vehicle

Primary:
"Add Vehicle"

After success:

✓ Vehicle added successfully.

---

## B. VIEW VEHICLE

When clicking:

"View"

Open centered Large Dialog.

Title:

"Vehicle Details"

Header:

Vehicle Number:
MH12AB1234

Toyota Innova Crysta

Status:
Active

Driver:
Raj Kumar

Capacity:
7

Utilization:
82%

Create metric cards:

Capacity
7

Utilization
82%

Trips Today
5

Status
Active

Tabs:

Overview
Documents
Trips
Maintenance
Driver Assignment
Utilization

Overview:

Vehicle Number
Model
Capacity
Fuel Type
Organization
Current Driver
Current Route
Status

Maintenance:

Last Service
Next Service
Maintenance Status

Trips:

Recent trips table.

---

## C. VEHICLE DOCUMENTS

When clicking:

"Docs"

Open a dedicated centered Dialog.

Title:

"Vehicle Documents"

Subtitle:

"Compliance and vehicle documentation"

Show document cards:

Insurance
Fitness Certificate
Permit
Registration Certificate
Pollution Certificate

Each card:

Document icon

Document name

Status badge:

Valid
Expiring Soon
Expired

Expiry date

Actions:

View
Download
Replace

Example:

Insurance

Status:
⚠ Expiring Soon

Expiry:
15 Oct 2026

[View] [Replace]

For expired documents:

Insurance

Status:
Expired

Expiry:
15 Sep 2026

Use red status styling.

Add:

"Upload Document"

button.

Upload dialog should support:

Drag & Drop
Browse Files

Accepted:
PDF, JPG, PNG

Show upload progress.

After upload:

✓ Document uploaded successfully.

==================================================
5. DELETE / SUSPEND CONFIRMATION
================================

For destructive actions such as:

Delete Organization
Suspend Organization
Disable Employee
Suspend Driver
Decommission Vehicle

DO NOT immediately execute the action.

Open a small confirmation Dialog.

Example:

"Delete Organization?"

"This action will permanently remove the organization and its associated configuration."

Organization:
TCS Pune Campus

Type:
ORG-001

Buttons:

Cancel
Delete Organization

Delete button:
Red

For Suspend:

"Suspend Organization?"

Buttons:

Cancel
Suspend Organization

Use appropriate warning icon.

==================================================
6. DIALOG SIZES
===============

Use consistent sizes:

Small Dialog:
400–450px

Confirmation dialogs

Medium Dialog:
500–600px

Simple forms

Large Dialog:
650–800px

Employee / Driver / Vehicle details

Extra Large:
900–1100px

Complex analytics, documents, detailed records

Never make dialogs unnecessarily full-screen.

==================================================
7. RESPONSIVE BEHAVIOR
======================

Desktop:
Centered modal with max width.

Tablet:
Reduce width with 24px side margins.

Mobile:
Dialog becomes almost full width.

Use:

16px side margins
Rounded top corners
Scrollable content

Footer buttons remain accessible.

==================================================
8. BACKGROUND BEHAVIOR
======================

When a dialog is open:

Keep the current page visible behind it.

Add:

rgba(15, 23, 42, 0.45)

backdrop.

Do not completely hide the page.

The user should understand which organization / employee / driver / vehicle they are editing.

==================================================
9. COMPONENT REUSE
==================

Create reusable Figma components:

ShivneriDialog
DialogHeader
DialogBody
DialogFooter
FormSection
FormField
SelectField
DatePicker
StatusBadge
MetricCard
DocumentCard
ConfirmationDialog
SuccessDialog
ErrorDialog
UploadDialog

Use Auto Layout.

Create variants:

Dialog / Small
Dialog / Medium
Dialog / Large
Dialog / Extra Large

States:

Default
Loading
Success
Error
Disabled

==================================================
10. PROTOTYPE INTERACTIONS
==========================

Implement these exact interactions:

Organizations:

Three Dot
→ Edit Organization
→ Edit Dialog

Three Dot
→ View Details
→ Organization Details Dialog

Add Organization
→ Add Organization Dialog

Suspend
→ Confirmation Dialog

Delete
→ Confirmation Dialog

Employees:

Add Employee
→ Add Employee Dialog

View
→ Employee Profile Dialog

Edit Employee
→ Edit Employee Dialog

Drivers:

Add Driver
→ Add Driver Dialog

View
→ Driver Details Dialog

Verify
→ Driver Verification Dialog

Fleet:

Add Vehicle
→ Add Vehicle Dialog

View
→ Vehicle Details Dialog

Docs
→ Vehicle Documents Dialog

Upload Document
→ Upload Document Dialog

==================================================
11. IMPORTANT VISUAL REQUIREMENT
================================

The dialog must visually match the existing Shivneri dashboard shown in the current design.

Do NOT introduce a different design language.

Use the same:

Blue primary buttons
Light gray backgrounds
White cards
Rounded corners
Typography
Status badges
Table styling
Icons
Spacing
Borders

The result should feel like one unified enterprise application.

==================================================
12. FINAL UX GOAL
=================

The user should be able to manage the entire Shivneri system without unnecessary page navigation.

The interaction pattern should consistently be:

LIST PAGE
↓
ACTION
↓
DIALOG
↓
VIEW / EDIT / CREATE
↓
CONFIRM
↓
SUCCESS
↓
RETURN TO LIST

All dialogs must be polished, production-ready, accessible, responsive, and consistent with the existing Shivneri Enterprise Transport Management UI.

Do not change the existing dashboard design.
Only implement and prototype these Dialog Box interactions.
