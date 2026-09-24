Upgrade the existing SHIVNERI Enterprise Transport Management platform, specifically the Rides and Live Operations experience.

IMPORTANT:
DO NOT redesign the existing application from scratch.

Preserve the current:

* Sidebar
* Header
* Navigation
* Typography
* Colors
* Tables
* KPI cards
* Filters
* Buttons
* Status badges
* AI Assistant
* Overall Shivneri visual identity

The goal is to make the existing product feel like a **real enterprise transportation command center** by adding deeper ride details, live route visualization, operational activity, safety workflows, ETA intelligence, and contextual actions.

The design should remain clean, professional, enterprise-grade, responsive, and presentation-ready.

==================================================

1. RIDE DETAILS MUST OPEN IN A DIALOG
   ==================================================

On the existing Rides page:

When the user clicks:

"Details"

DO NOT navigate to another page.

Open a centered:

"Ride Details Dialog"

Keep the Rides page visible behind the dialog.

Add a semi-transparent dark backdrop.

Dialog:

* Width: 950–1100px
* Max height: 85vh
* Scrollable content
* Sticky header
* Sticky footer
* Rounded 16–20px corners
* Subtle enterprise shadow
* White background

Animation:

* Fade backdrop
* Scale + fade dialog
* 150–200ms

==================================================
2. INTELLIGENT RIDE HEADER
==========================

Dialog header:

Ride Details

RIDE-10421

Status:
● On Route

Organization:
TCS Pune Campus

Date:
23 September 2026

Top-right:

* Refresh
* More actions
* Close X

More actions:

Track Live
Contact Driver
Report Issue
Share Ride
Export Ride Summary

==================================================
3. SMART RIDE STATUS
====================

Create a prominent status section.

Example:

ON ROUTE

Driver is currently moving toward destination.

ETA:
08 minutes

Progress:
72%

Distance remaining:
4.8 km

Add a visual progress bar.

For each status dynamically change the interface:

Scheduled
Assigned
Driver Arrived
Ride Started
On Route
Delayed
Completed
Cancelled
SOS

==================================================
4. RIDE SUMMARY CARDS
=====================

Create compact metric cards:

PASSENGERS
4 / 6

DISTANCE
18 km

ETA
08 min

COST
₹420

DURATION
40 min

PROGRESS
72%

Use the existing Shivneri card style.

==================================================
5. ROUTE VISUALIZATION
======================

This is a HIGH PRIORITY feature.

Add a large interactive map inside the dialog.

The map must visually show:

📍 Pickup Point
📍 Current Vehicle Location
📍 Drop Location

Draw the actual route path between them.

Show:

Pickup:
Baner

Current:
Wakad

Destination:
Infosys Phase 2

Route progress:

Pickup → On Route → Destination

Show a moving vehicle marker.

Vehicle:
MH12AB1234

Driver:
Raj Kumar

ETA:
08 minutes

Distance remaining:
4.8 km

The vehicle marker should visually indicate movement along the route.

Add map controls:

*

−
Recenter
Fullscreen
Traffic
Satellite

Route legend:

Blue = Completed route
Bright blue = Current route
Gray = Remaining route
Red = Incident

This enhancement should communicate real-time employee transportation tracking immediately, matching the project analysis recommendation.

==================================================
6. LIVE TRIP INFORMATION PANEL
==============================

Create a right-side information panel next to the map.

Title:

Active Trip

Trip ID:
TRIP-10421

Employee:
Raj Kumar

Company:
Infosys

Driver:
Ajay Patil

Vehicle:
MH12AB1234

Passengers:
4 / 6

Current Location:
Baner

Destination:
Infosys Phase 2

ETA:
08 minutes

Status:
On Route

These fields directly follow the recommended Active Trip Details structure from the project analysis.

==================================================
7. LIVE ETA INTELLIGENCE
========================

Create an ETA card.

Current ETA:
08 min

Original ETA:
12 min

Updated:
10:22 PM

Show:

ETA improved by 4 minutes

or:

⚠ ETA increased by 4 minutes

Reason:
Traffic congestion

Add:

"ETA History"

10:05 PM → 12 min
10:15 PM → 10 min
10:22 PM → 16 min
10:28 PM → 08 min

Use a small line chart.

==================================================
8. REAL-TIME ACTIVITY FEED
==========================

Add a new section:

"Live Activity"

This should behave like a command-center event stream.

Example:

10:05 PM
Driver reached pickup location

10:08 PM
Employee boarded vehicle

10:10 PM
Trip started successfully

10:16 PM
Vehicle crossed Baner checkpoint

10:19 PM
Traffic congestion detected

10:22 PM
ETA updated from 12 min to 16 min

10:28 PM
Vehicle resumed normal route

10:34 PM
Employee approaching destination

10:37 PM
Trip completed successfully

Use timeline icons and timestamps.

Show live indicator:

● LIVE

Automatically append new events at the top.

This directly implements the recommended real-time activity feed.

==================================================
9. DRIVER INFORMATION
=====================

Create a Driver card.

Raj Kumar

DRV-001

✓ Verified

Rating:
★ 4.8

Phone:
••••••8821

Status:
On Duty

Vehicle:
MH12AB1234

Actions:

Call Driver
Message Driver
View Driver

Clicking "View Driver":

Open the existing Driver Details Dialog on top of the current Ride Details Dialog.

==================================================
10. VEHICLE INFORMATION
=======================

Vehicle:

MH12AB1234

Toyota Innova Crysta

Capacity:
7

Utilization:
82%

Status:
Active

Compliance:

Insurance ✓
Fitness ✓
Permit ✓

Button:

View Vehicle

Clicking it opens the existing Vehicle Details Dialog.

==================================================
11. PASSENGER INFORMATION
=========================

Create:

"Passengers"

Show:

Avatar
Employee ID
Name
Pickup
Drop
Boarding Status

Example:

EMP-10481
Akshat Gupta
Kothrud
Hinjewadi
✓ Boarded

EMP-10482
Priya Sharma
Baner
Hinjewadi
✓ Boarded

Use:

4 / 6 passengers

Add:

View All Passengers

==================================================
12. EMPLOYEE OTP / VERIFICATION
===============================

Create:

"Ride Verification"

Employee OTP:
✓ Verified

Driver Verification:
✓ Verified

Passenger Verification:
4 / 4

Ride Start:
✓ Authorized

Show timestamps.

==================================================
13. RIDE LIFECYCLE
==================

Create a visual timeline:

Scheduled
↓
Driver Assigned
↓
Driver Arrived
↓
Ride Started
↓
On Route
↓
Destination
↓
Completed

Each completed state:
✓

Current state:
Blue animated indicator

Future state:
Gray

Add timestamp under every completed/current step.

==================================================
14. SOS / SAFETY CENTER
=======================

If the ride has an SOS event:

Change the dialog into an emergency-aware interface.

Show a prominent red alert:

🚨 SOS INCIDENT ACTIVE

Employee:
Priya Sharma

Company:
WNS

Driver:
Rakesh Patil

Vehicle:
MH12XY4567

Location:
Hinjewadi Phase 1

Alert Time:
10:42 PM

Severity:
HIGH

Status:
ACTIVE

Actions:

[Track Live]
[Call Driver]
[Call Employee]
[Contact Security]
[Resolve Incident]

These fields and actions follow the project's recommended SOS workflow.

==================================================
15. INCIDENT TIMELINE
=====================

For SOS:

10:42 PM
SOS Alert Triggered

10:43 PM
Operations Team Notified

10:44 PM
Driver Contacted

10:46 PM
Location Verified

10:50 PM
Incident Resolved

Display as an incident timeline.

==================================================
16. EMERGENCY BREAK-GLASS ACCESS
================================

Add an enterprise security action:

"Request Emergency Access"

When clicked:

Open confirmation dialog.

Title:

Emergency Access

Reason:
Required to investigate active SOS incident.

Access:

✓ Live Location
✓ Driver Information
✓ Employee Emergency Contact
✗ Billing
✗ Unrelated Employee Data

Duration:
30 minutes

Buttons:

Cancel
Request Access

Show:

"All emergency access is logged."

==================================================
17. SAFETY INCIDENT ACTIONS
===========================

Add:

Report Accident
Report Breakdown
Create Incident
View Incident
Share Location

If an incident exists:

Incident ID:
INC-20481

Severity:
High

Owner:
Security Team

Status:
Investigating

==================================================
18. COST & BILLING
==================

Create:

"Trip Cost"

Base:
₹350

Distance:
₹50

Additional:
₹20

Total:
₹420

Billing:
Generated

Invoice:
INV-2026-10421

Buttons:

View Invoice
Export

==================================================
19. ATTENDANCE
==============

Add:

"Attendance"

Employee:
4

Boarded:
4

Absent:
0

OTP Verified:
4

Attendance status:

✓ Complete

==================================================
20. FEEDBACK & RATING
=====================

For completed rides:

Driver Rating:
★ 4.8

Employee Feedback:
"Smooth and comfortable ride."

Add:

View Feedback

For unresolved feedback:

"Report Issue"

==================================================
21. RIDE ANALYTICS
==================

Add a compact analytics section.

Metrics:

Actual Duration
40 min

Expected Duration
42 min

ETA Accuracy
96%

Route Deviation
0.8 km

Average Speed
32 km/h

Use small charts where useful.

==================================================
22. AI RIDE ASSISTANT
=====================

Integrate the existing:

"Ask Shivneri AI"

inside the Ride Details experience.

Add button:

"Ask AI About This Ride"

Example AI prompts:

"Why is this ride delayed?"

"Where is the driver?"

"Why did ETA change?"

"Show ride history."

"Explain this incident."

"Is this route delayed?"

AI responses must only use information the user is authorized to access.

==================================================
23. SMART ACTIONS
=================

Actions should change depending on ride state.

COMPLETED:

View Driver
View Vehicle
View Invoice
View Feedback
Export Summary

ON ROUTE:

Track Live
Contact Driver
View Route
Report Issue

DELAYED:

Track Live
Contact Driver
View Delay Reason
Report Delay

SOS:

Track Live
Contact Security
Open Incident
Emergency Access

CANCELLED:

View Cancellation Reason
View Billing
View History

==================================================
24. SHARE RIDE
==============

Add:

"Share Ride"

Open a small dialog:

Share Ride Status

Recipient:
Phone / Email

Share:

✓ Current Location
✓ ETA
✓ Driver
✓ Vehicle
✓ Route

Expiry:
30 minutes

Button:

Generate Secure Link

Show:

"Shared links automatically expire."

==================================================
25. EXPORT RIDE SUMMARY
=======================

Add:

"Export Ride Summary"

Options:

PDF
CSV

Include:

Ride information
Driver
Vehicle
Passengers
Route
Timeline
Cost
Incidents
Audit information

Show export confirmation.

==================================================
26. AUDIT TRAIL
===============

Add a collapsible section:

"Audit Trail"

Events:

Ride viewed
Driver assigned
Location accessed
ETA viewed
Incident accessed
Invoice exported

Show:

Actor
Action
Timestamp
Result

Example:

Admin
Viewed live location
10:24 PM
Allowed

==================================================
27. PERMISSION-AWARE UI
=======================

The UI must dynamically respect user permissions.

Example:

If user has:
tracking.view

Show:
Track Live

If user does NOT have:
tracking.view

Show:

🔒 Live tracking unavailable

Request Access

If recording access is unavailable:

"Recording access requires authorization."

Never allow the frontend to bypass authorization.

==================================================
28. OPERATIONS HEALTH SUMMARY
=============================

Add a separate Operations Health section to the Rides / Live Operations experience.

Metrics:

Active Trips
18

On-Time Trips
229

Delayed Trips
12

SOS Incidents
2

Fleet Utilization
91%

Average ETA Accuracy
96%

Use compact KPI cards.

These metrics follow the recommended Operations Health Summary in the project analysis.

==================================================
29. LIVE OPERATIONS MAP
=======================

Improve the existing Live Operations map.

Show:

Pickup Points
Drop Locations
Route Paths
Route Progress
Moving Vehicle Markers
SOS Markers
Delayed Ride Markers

Marker states:

🟢 Active
🔵 On Route
🟠 Delayed
🔴 SOS
⚪ Completed

Clicking a vehicle:

Open mini trip card.

Example:

MH12AB1234

Raj Kumar

On Route

ETA:
08 min

[View Ride]

==================================================
30. MAP FILTERS
===============

Add map filters:

All
Active
Delayed
SOS
Completed

Additional:

Organization
Driver
Vehicle
Route
Status

==================================================
31. REAL-TIME COMMAND CENTER
============================

The final Live Operations page should follow this structure:

TOP:

KPI CARDS

Active Trips
Delayed Trips
SOS
On-Time Rate

MAIN:

LIVE OPERATIONS MAP

with route visualization and moving vehicles

RIGHT:

ACTIVE TRIP DETAILS

BOTTOM:

REAL-TIME ACTIVITY FEED
+
OPERATIONS HEALTH

This layout follows the recommended command-center structure in the project analysis.

==================================================
32. NEW EXTRA FEATURE — TRIP REPLAY
===================================

Add an advanced enterprise feature:

"Trip Replay"

For completed rides, allow operations users to replay the vehicle journey.

Show:

Start
→
Pickup
→
Checkpoints
→
Destination

Controls:

▶ Play
⏸ Pause
↻ Replay

Timeline:

08:00 ─────── 08:42

Display vehicle movement along the route.

Add:

Speed
Distance
ETA changes
Route deviations

==================================================
33. NEW EXTRA FEATURE — ROUTE DEVIATION ALERT
=============================================

If the vehicle deviates from the planned route:

Show:

⚠ Route Deviation Detected

Planned route:
18.2 km

Current route:
20.1 km

Deviation:
1.9 km

Actions:

View Route
Contact Driver
Create Incident

==================================================
34. NEW EXTRA FEATURE — DELAY REASON
====================================

When a ride becomes delayed:

Automatically display:

Delay:
+12 min

Possible Reason:

Traffic congestion

Other possible states:

Vehicle issue
Driver delay
Route deviation
Weather
Pickup delay
Unknown

Button:

"Report Incorrect Reason"

==================================================
35. NEW EXTRA FEATURE — VEHICLE HEALTH
======================================

Inside Vehicle information:

Vehicle Health:

Engine:
✓ Normal

Documents:
✓ Valid

Maintenance:
⚠ Service due in 8 days

Tyres:
✓ Normal

GPS:
✓ Connected

Overall:

92% Vehicle Health

==================================================
36. NEW EXTRA FEATURE — DRIVER SAFETY SCORE
===========================================

Show:

Driver Safety Score

92 / 100

Metrics:

Harsh Braking
2

Overspeeding
0

Rapid Acceleration
1

Route Compliance
98%

Safety trend:

↑ Improving

This should be informational and not replace formal safety procedures.

==================================================
37. NEW EXTRA FEATURE — SMART NOTIFICATIONS
===========================================

Create contextual alerts:

⚠ Ride delayed by 12 minutes

🚗 Driver arrived

📍 Vehicle approaching destination

🚨 SOS triggered

✓ Ride completed

📄 Vehicle document expiring

🔐 Access request requires approval

==================================================
38. DIALOG STATES
=================

Create variants:

Ride Details / Scheduled
Ride Details / Assigned
Ride Details / Driver Arrived
Ride Details / Started
Ride Details / On Route
Ride Details / Delayed
Ride Details / Completed
Ride Details / Cancelled
Ride Details / SOS

Also:

Loading
Error
Offline
Permission Denied
Requires Approval

==================================================
39. RESPONSIVE DESIGN
=====================

Desktop:
950–1100px dialog

Tablet:
90% width

Mobile:
Full-height bottom sheet / modal

Mobile order:

Ride Status
↓
ETA
↓
Map
↓
Driver
↓
Passengers
↓
Timeline
↓
Activity
↓
Billing
↓
Actions

==================================================
40. PROTOTYPE FLOWS
===================

Create working Figma prototype interactions:

FLOW 1:

Rides
→ Details
→ Ride Details Dialog
→ Close

FLOW 2:

Rides
→ Details
→ Track Live
→ Live Map

FLOW 3:

Rides
→ Details
→ View Driver
→ Driver Dialog
→ Close
→ Return to Ride Dialog

FLOW 4:

Rides
→ Details
→ View Vehicle
→ Vehicle Dialog
→ Documents Dialog

FLOW 5:

Delayed Ride
→ Details
→ Delay Reason
→ Contact Driver

FLOW 6:

SOS Ride
→ Details
→ SOS Center
→ Track Live
→ Incident
→ Resolve

FLOW 7:

Completed Ride
→ Details
→ Trip Replay
→ Play Route
→ View Timeline

FLOW 8:

Ride
→ Details
→ Ask Shivneri AI
→ AI explains issue
→ Suggested Action

FLOW 9:

Restricted User
→ Details
→ Track Live
→ Permission Denied
→ Request Access

==================================================
41. COMPONENT SYSTEM
====================

Create reusable components:

RideDetailsDialog
RideStatusBadge
RideSummaryCard
RouteMap
RouteProgress
VehicleMarker
DriverCard
VehicleCard
PassengerTable
RideTimeline
ActivityFeed
ETAWidget
IncidentCard
SOSPanel
TripReplay
BillingCard
AuditTimeline
PermissionCard
AI Ride Assistant
ShareRideDialog
ExportRideDialog
EmergencyAccessDialog

Create variants for all states.

Use Auto Layout.

Use Figma Variables.

Use component properties.

==================================================
42. FINAL DESIGN PRINCIPLE
==========================

Do NOT make the product look like a generic taxi/ride-booking application.

SHIVNERI should feel like an:

"Enterprise Corporate Mobility Command Center"

The user should be able to understand:

WHO is travelling
WHERE the vehicle is
WHERE it is going
HOW the route is progressing
WHEN it will arrive
WHAT happened during the ride
WHETHER there is a safety issue
WHO is responsible
WHAT actions are available
WHY an action is allowed or restricted

The final experience must combine:

Real-time operations
Transportation management
Safety
Enterprise security
Route intelligence
AI assistance
Auditability
Billing
Analytics

Keep the existing Shivneri visual design intact while making the Rides and Live Operations modules substantially more interactive, informative, and enterprise-ready.
