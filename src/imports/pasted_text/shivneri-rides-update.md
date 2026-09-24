Update the existing **SHIVNERI Rides page** shown in the current design.

IMPORTANT:
Do NOT redesign the existing Rides page.

Keep unchanged:

* Header
* Sidebar
* KPI cards
* Ride Lifecycle
* Filters
* Ride table
* Status badges
* Typography
* Colors
* Spacing
* Search
* AI Assistant button

ONLY modify the interaction for the **"Details"** button in the Actions column.

==================================================
RIDE DETAILS → DIALOG
=====================

When the user clicks the **"Details"** button for any ride:

DO NOT navigate to another page.

Open a centered **Ride Details Dialog Box** over the current Rides page.

The Rides page must remain visible in the background with a subtle dark/gray overlay.

Dialog should look like a premium enterprise SaaS modal.

Width:
900–1000px

Maximum height:
80–85vh

Content should be scrollable if required.

Use:

* White background
* 16–20px rounded corners
* Subtle shadow
* Light border
* Existing Shivneri blue
* Existing status badge styles
* Existing typography
* Clean enterprise spacing

==================================================
DIALOG HEADER
=============

Header:

Ride Details

RIDE-10421

Status badge:
✓ Completed

Top-right:

[Close X]

Below the title:

"TCS Pune Campus • 23 Sep 2026"

Add a small contextual label:

Ride Lifecycle:
Completed

==================================================
RIDE SUMMARY
============

Create a summary section at the top.

Four compact metric cards:

DISTANCE
18 km

COST
₹420

PASSENGERS
4

SCHEDULED
08:00 AM

Use the existing Shivneri card design.

==================================================

1. RIDE INFORMATION
   ==================================================

Create a section:

"Ride Information"

Two-column layout.

Ride ID:
RIDE-10421

Organization:
TCS Pune Campus

Scheduled:
08:00 AM

Ride Status:
Completed

Pickup:
Kothrud, Pune

Drop:
Hinjewadi Phase 1

Distance:
18 km

Cost:
₹420

Passengers:
4

Ride Type:
Employee Transport

Date:
23 Sep 2026

==================================================
2. RIDE LIFECYCLE
=================

Display a horizontal timeline inside the dialog.

Scheduled
↓
Driver Assigned
↓
Driver Arrived
↓
Ride Started
↓
Ride Completed

For completed rides:

✓ Scheduled
✓ Driver Assigned
✓ Driver Arrived
✓ Ride Started
✓ Ride Completed

Show timestamp below each step.

Example:

07:45
Driver Assigned

07:57
Driver Arrived

08:02
Ride Started

08:42
Ride Completed

Use the same blue lifecycle styling already present on the Rides page.

==================================================
3. DRIVER INFORMATION
=====================

Section title:

"Driver"

Create a driver card.

Avatar:
RJ

Raj Kumar

DRV-001

✓ Verified

Phone:
••••••8821

Rating:
★ 4.8

Status:
On Duty

Vehicle:
MH12AB1234

Buttons:

[View Driver]

If "View Driver" is clicked, open the Driver Details Dialog rather than navigating away.

==================================================
4. VEHICLE INFORMATION
======================

Section title:

"Vehicle"

Vehicle card:

Vehicle Number:
MH12AB1234

Model:
Toyota Innova Crysta

Capacity:
7

Current Driver:
Raj Kumar

Status:
Active

Utilization:
82%

Button:

[View Vehicle]

Clicking "View Vehicle" should open the existing Vehicle Details Dialog.

==================================================
5. PASSENGERS
=============

Section title:

"Passengers"

Create a compact passenger table.

Columns:

Employee ID
Name
Pickup
Drop
Verification
Status

Example:

EMP-10481
Akshat Gupta
Kothrud
Hinjewadi Ph1
✓ Verified
Completed

EMP-10482
Priya Sharma
Kothrud
Hinjewadi Ph1
✓ Verified
Completed

Show up to 4 passengers.

Button:

[View All Passengers]

If clicked, expand the passenger list inside the dialog.

==================================================
6. ROUTE & MAP
==============

Create a route section.

Title:

"Route"

Display a map-style visual inside the dialog.

Show:

📍 Pickup
Kothrud, Pune

↓ Route line

📍 Drop
Hinjewadi Phase 1

Display:

Distance:
18 km

Estimated Duration:
42 min

Actual Duration:
40 min

Add route status:

✓ Route completed

Do not make the map full-screen.

Use a compact map card approximately 100% width × 220px height.

==================================================
7. LIVE / COMPLETED TRACKING
============================

For an active ride:

Show:

"Live Tracking"

Driver location
Current location
ETA
Speed
Route progress

For a completed ride:

Change the section title to:

"Ride Tracking Summary"

Show:

Route completed
Actual distance
Actual duration
Start time
Completion time

Example:

Start:
08:02 AM

Completed:
08:42 AM

Actual Distance:
18.4 km

Actual Duration:
40 min

==================================================
8. ATTENDANCE / OTP VERIFICATION
================================

Section:

"Ride Verification"

Show:

Employee OTP Verification:
✓ Completed

Passengers Verified:
4 / 4

Driver Verification:
✓ Completed

Ride Start Verification:
✓ Completed

Use green success badges.

==================================================
9. COST & BILLING
=================

Section:

"Cost & Billing"

Display:

Base Trip Cost:
₹350

Distance Cost:
₹50

Additional Charges:
₹20

Total:
₹420

Billing Status:
Generated

Invoice:
INV-2026-10421

Button:

[View Invoice]

==================================================
10. INCIDENTS / SAFETY
======================

Section:

"Safety & Incidents"

If there are no incidents:

✓ No incidents reported for this ride.

If an incident exists:

Show an incident card:

Incident:
SOS

Severity:
Critical

Status:
Resolved

Time:
08:25 AM

[View Incident]

Use red styling only for active/critical safety events.

==================================================
11. RIDE ACTIVITY TIMELINE
==========================

Add an activity timeline.

Example:

08:42 AM
Ride completed
Raj Kumar completed the trip.

08:02 AM
Ride started
Employee OTP verified.

07:57 AM
Driver arrived
Driver reached pickup location.

07:45 AM
Driver assigned
Raj Kumar assigned to ride.

07:30 AM
Ride scheduled

Use small timeline icons and timestamps.

==================================================
12. ACTIONS
===========

At the bottom of the dialog create a footer.

For completed ride:

[Close]
[View Driver]
[View Vehicle]
[View Invoice]

For active ride:

[Close]
[Track Live Ride]
[Contact Driver]
[Report Issue]

For delayed ride:

[Close]
[Track Ride]
[Contact Driver]
[Report Delay]

For SOS ride:

[Close]
[Open Incident]
[View Live Location]
[Emergency Access]

Actions should dynamically change according to ride status.

==================================================
13. STATUS-SPECIFIC UI
======================

The dialog must adapt according to ride status.

COMPLETED:

Green status badge
"✓ Completed"

Show:
Completed timeline
Actual duration
Actual distance
Billing
Ride summary

ON ROUTE:

Blue status badge
"● On Route"

Show:
Live location
ETA
Driver status
Route progress

DELAYED:

Orange status badge
"⚠ Delayed"

Show:

Delay:
12 minutes

Expected arrival:
08:42 AM

Reason:
Traffic congestion

Actions:
Track Ride
Contact Driver
Report Delay

SOS:

Red status badge
"🚨 SOS"

Show prominent emergency section:

ACTIVE SAFETY INCIDENT

Live Location
Driver
Vehicle
Employee
Incident Time

Actions:

[Open Incident]
[View Live Location]
[Contact Security]

Do not hide the SOS information.

CANCELLED:

Red/gray status badge
"Cancelled"

Show:

Cancellation reason
Cancelled by
Cancellation time
Refund/billing status if applicable

==================================================
14. RESPONSIVE BEHAVIOR
=======================

Desktop:
900–1000px centered dialog.

Tablet:
Use 90% screen width.

Mobile:
Convert the dialog into a near full-screen bottom sheet/modal.

Maintain:
16px margins
Scrollable content
Sticky header
Sticky footer actions

==================================================
15. DIALOG INTERACTION
======================

Interaction:

Rides Page
↓
Click "Details"
↓
Backdrop appears
↓
Ride Details Dialog opens
↓
User reviews information
↓
User can interact with nested View Driver / View Vehicle / View Invoice
↓
Close
↓
Return to exact Rides page state

Do NOT reset filters or pagination when the dialog closes.

==================================================
16. REUSABLE COMPONENT
======================

Create a reusable:

"RideDetailsDialog"

Properties:

Ride ID
Organization
Status
Driver
Vehicle
Passengers
Route
Distance
Cost
Timeline
Incidents
Billing
Actions

Variants:

Ride Details / Completed
Ride Details / On Route
Ride Details / Delayed
Ride Details / SOS
Ride Details / Cancelled

==================================================
17. VISUAL CONSISTENCY
======================

The Ride Details Dialog must look like it belongs to the exact existing Shivneri application.

Do NOT introduce:

* New colors
* New typography
* Different buttons
* Different card styles
* Different border radius
* Different navigation

Reuse the existing Shivneri components.

The final interaction should feel like:

Rides Table
→ Details
→ Professional Ride Details Dialog
→ Complete ride information
→ Contextual actions
→ Close
→ Back to Rides

Make the dialog polished, enterprise-grade, responsive, and presentation-ready.
