REDESIGN THE CURRENT SHIVNERI PLATFORM ADMIN DASHBOARD ONLY.

IMPORTANT:
I am providing the existing Shivneri dashboard as the design context/reference.

I want a SIGNIFICANT visual and UX improvement of the CURRENT DASHBOARD.

Do NOT modify any other page.

DO NOT redesign or change:
- Organizations
- Users & Employees
- Drivers
- Vehicles
- Rides
- Live Operations
- Routes
- Safety & Incidents
- Billing
- Reports
- Analytics
- Settings

Do not change the existing sidebar navigation or its destinations.

ONLY redesign the current Dashboard / Overview page.

====================================================
GOAL
====================================================

The dashboard should feel like a REAL CORPORATE EMPLOYEE TRANSPORTATION CONTROL CENTER.

When a Super Admin opens the dashboard, they should immediately understand:

1. Overall platform health
2. Today's transportation status
3. Live vehicle/ride activity
4. Delayed rides
5. Safety/SOS alerts
6. Fleet utilization
7. Transportation cost
8. Organization growth
9. What requires immediate attention
10. Recent system activity

The current dashboard should be transformed, not just slightly edited.

====================================================
OVERALL VISUAL STYLE
====================================================

Use a modern enterprise SaaS design.

Style:
- Premium
- Clean
- Professional
- Data-driven
- Transportation-control-center feel
- Highly usable
- Modern but not flashy

Keep SHIVNERI branding.

Keep:
- Dark navy sidebar
- Blue primary accent
- Light background
- Existing SHIVNERI identity

Improve:
- Typography
- Spacing
- Alignment
- Visual hierarchy
- Card proportions
- Section grouping
- Charts
- Tables
- Interactive states
- Responsiveness

Do NOT use emojis as UI icons.

Use one consistent professional icon system.

====================================================
DASHBOARD STRUCTURE
====================================================

Create this hierarchy:

HEADER
↓
GLOBAL FILTERS
↓
KPI OVERVIEW
↓
LIVE OPERATIONS
↓
TODAY'S TRANSPORTATION + QUICK ACTIONS
↓
FLEET + TRIP ANALYTICS
↓
TRANSPORT COST + ORGANIZATION GROWTH
↓
SAFETY & INCIDENTS + NEEDS ATTENTION
↓
RECENT ACTIVITY

====================================================
1. HEADER
====================================================

Keep the current dashboard header but make it cleaner.

Show:

Dashboard
Platform Admin / Overview

Subtitle:

"Real-time transportation operations across all tenant organizations"

Right side:

Global Search
Notifications
Help
Super Admin profile

Search placeholder:

"Search organizations, employees, drivers, vehicles..."

Make search interactive.

When the user types:
show matching sample results in a dropdown.

====================================================
2. DASHBOARD FILTER BAR
====================================================

Add a compact filter bar directly below the header.

Filters:

Date:
Today
This Week
This Month
Custom Range

Organization:
All Organizations
Infosys
TCS
Wipro
Cognizant

Trip Status:
All
Active
Completed
Delayed

Add:

"Reset Filters"

IMPORTANT:
Filters must actually change the dashboard's sample data.

For example:
Changing "Today" to "This Month" should update KPI/chart values.

Do not make fake-looking dropdowns.

====================================================
3. KPI SECTION
====================================================

Create 8 premium KPI cards.

Organizations
44
Active organizations

Active Employees
12,847
Active employees

Active Drivers
1,203
Verified drivers

Fleet Vehicles
896
Active vehicles

Today's Trips
1,954
Scheduled today

Active Trips
247
Currently in progress

Delayed Trips
18
Require attention

SOS Alerts
2
Active alerts

Each card:

- Icon
- Label
- Large number
- Supporting information
- Small trend indicator
- Clickable state

Example:

Organizations
44
+6 this month

Employees
12,847
+342 this week

Use subtle trend indicators.

SOS should have a clear but professional alert treatment.

Do NOT make all cards colorful.

====================================================
4. LIVE OPERATIONS
====================================================

THIS MUST BE THE MAIN VISUAL FOCUS.

Create a large Live Operations section.

Header:

Live Operations
LIVE

Subtitle:

"Real-time tracking of active vehicles across organizations"

Layout:

LEFT:
Large map

RIGHT:
Active Trips panel

Map should show:

- Multiple vehicle markers
- Different vehicle statuses
- Route paths
- Pickup points
- Drop points
- Selected vehicle state

Use realistic Pune-area transport context for the prototype.

Vehicle status colors:

Green = On Trip
Blue = Arriving
Orange = Delayed
Gray = Idle

Clicking a vehicle marker must open a detail popover:

Vehicle:
MH12 AB 1234

Driver:
Ramesh Kumar

Organization:
Infosys

Trip:
TRP-10482

Status:
On Trip

ETA:
12 min

Route:
Hinjewadi → Kharadi

Add map controls:
Zoom +
Zoom -
Recenter

Add filter:
All Organizations

====================================================
5. ACTIVE TRIPS PANEL
====================================================

Show:

Active Trips (247)

Table columns:

Trip ID
Organization
Driver
Vehicle
Status
ETA

Use 5–6 realistic sample rows.

Each row is clickable.

Clicking a row should open a detailed trip popover/modal with:

Trip ID
Employee
Organization
Driver
Vehicle
Pickup
Drop
Status
ETA
Trip start time

Add:

"View Live Operations →"

This MUST navigate to the EXISTING Live Operations page.

====================================================
6. TODAY'S TRANSPORTATION
====================================================

Create a dedicated operational card:

Today's Transportation

Show:

Scheduled
1,954

Completed
1,689

Active
247

Delayed
18

Add:

Completion Rate
86%

Use a horizontal progress visualization.

Add:

"View All Trips →"

This should navigate to the EXISTING Rides page.

====================================================
7. QUICK ACTIONS
====================================================

Place Quick Actions near Today's Transportation.

Actions:

Add Organization
Add Driver
Add Vehicle
View Live Trips
Generate Report

Every action must work.

Use existing page destinations.

Do NOT create new pages.

====================================================
8. FLEET UTILIZATION
====================================================

Create:

Fleet Utilization

Show:

Total Vehicles
896

On Trip
524

Available
233

Maintenance
139

Utilization
74%

Use a professional donut chart.

Make chart segments clickable.

Clicking "Maintenance" should navigate to the existing Vehicles page.

Clicking "On Trip" should navigate to existing Live Operations.

====================================================
9. TRIPS BY ORGANIZATION
====================================================

Create:

Trips by Organization

Show:

Infosys
35%

TCS
25%

Wipro
20%

Cognizant
12%

Others
8%

Use a donut chart.

Center:

1,954
Total Trips

Make segments interactive.

Clicking a segment should show:

Organization
Trips
Percentage
Active Trips
Completed Trips

====================================================
10. MONTHLY TRANSPORT COST
====================================================

Keep the existing Monthly Transport Cost feature, but redesign it professionally.

Chart:

Apr
May
Jun
Jul
Aug
Sep

Show cost in INR.

Filters:

6 Months
12 Months
This Year

Summary:

Current Month
₹360K

Average Monthly Cost
₹335K

Cost per Trip
₹228

Hover/click a month:

Month
Transport Cost
Trips
Cost per Trip

Chart must update based on filters.

====================================================
11. ORGANIZATION GROWTH
====================================================

Keep the existing Organization Growth chart.

Show:

Apr
May
Jun
Jul
Aug
Sep

Summary:

Current Organizations
44

New This Month
+6

Growth
+6%

Filters:

Monthly
Quarterly
Yearly

Clicking a point should show:

Month
Total Organizations
New Organizations

====================================================
12. SAFETY & INCIDENTS
====================================================

Create:

Safety & Incidents

Show:

SOS Alert
Infosys
Trip TRP-10482
2 min ago
ACTIVE

Vehicle Breakdown
TCS
Trip TRP-10461
18 min ago
INVESTIGATING

Accident Report
Wipro
1 hr ago
RESOLVED

Harassment Alert
Cognizant
3 hrs ago
RESOLVED

Use clear severity indicators.

Add:

"View Safety Center →"

This navigates to the EXISTING Safety & Incidents page.

====================================================
13. NEEDS ATTENTION
====================================================

Add a new dashboard feature:

NEEDS ATTENTION

This is a priority action area.

Show:

18
Delayed Trips
View Trips →

2
Active SOS Alerts
View Incidents →

12
Vehicles Due for Renewal
View Vehicles →

5
Driver Verifications Pending
View Drivers →

These should be visually distinct but compact.

Clicking each should navigate to the corresponding EXISTING module.

====================================================
14. RECENT ACTIVITY
====================================================

Keep the existing Recent Activity section.

But make activities Shivneri-specific.

Use:

New organization onboarded
Infosys BPM Ltd — 1,200 employees

Driver verified
Raj Kumar — License verified

Vehicle added
MH12 CD 5678

Transport request approved
TCS — 45 employees

SOS event triggered
Employee #10482 — Trip TRP-98231

Ride completed
Infosys — TRP-10482

Invoice approved
INV-2024-0891

Each row:

Icon
Time
Activity
Details
Actor

Add:

"View All →"

Do not create a new page if no existing activity page exists.

====================================================
15. INTERACTIVITY — CRITICAL
====================================================

EVERY INTERACTIVE ELEMENT MUST ACTUALLY WORK IN THE PROTOTYPE.

Do NOT create dead buttons.

Required interactions:

KPI cards:
- Organizations → Organizations page
- Employees → Users & Employees page
- Drivers → Drivers page
- Vehicles → Vehicles page
- Today's Trips → Rides page
- Active Trips → Live Operations page
- Delayed Trips → Rides page
- SOS → Safety & Incidents page

Sidebar:
Keep existing navigation.
Active Dashboard state should remain selected.

Search:
Typing should show matching sample entities.

Filters:
Must update dashboard sample values.

Charts:
Must respond to filter changes.

Map:
Markers must be clickable.

Trip rows:
Must open trip detail popup.

Notifications:
Click → notification dropdown.

Profile:
Click → profile menu.

Quick Actions:
All buttons must work.

Buttons:
Hover
Pressed
Focus
Disabled states where appropriate.

Cards:
Hover and selected states.

Tooltips:
Use for chart values and unfamiliar icons.

====================================================
16. MODALS / POPOVERS
====================================================

Use lightweight modal/popover interactions for:

Vehicle Details
Trip Details
SOS Details
Chart Details
Notification Details

Example SOS popup:

SOS ALERT

Organization:
Infosys

Employee:
#10482

Trip:
TRP-98231

Time:
2 min ago

Status:
Active

Actions:

View Incident
Acknowledge

"View Incident" should navigate to existing Safety & Incidents page.

====================================================
17. RESPONSIVE DESIGN — VERY IMPORTANT
====================================================

The dashboard MUST be responsive.

Design for:

1440px desktop
1280px desktop
1024px tablet
768px tablet
390px mobile
320px mobile

Desktop:
Use multi-column dashboard layout.

Tablet:
Reduce columns and stack cards intelligently.

Mobile:
Use:

- Collapsible sidebar / menu
- 1-column KPI cards
- Horizontally scrollable KPI row if needed
- Live Operations map above trip list
- Charts stacked vertically
- Tables converted into cards
- Quick Actions in 2-column grid
- Filters become horizontally scrollable or dropdown-based

NEVER allow:

- Text clipping
- Card overlap
- Broken charts
- Horizontal page overflow
- Tiny unreadable text

Touch targets should be comfortable.

====================================================
18. ACCESSIBILITY
====================================================

Use:

- readable contrast
- clear labels
- visible focus states
- keyboard-friendly controls
- accessible buttons
- meaningful tooltips
- icons with labels where necessary

Do not rely only on color to communicate status.

====================================================
19. MICRO-ANIMATIONS
====================================================

Use subtle professional animations:

- KPI number transition
- Card hover
- Chart transition
- Dropdown animation
- Modal open/close
- Map marker selection
- Filter transition
- Notification panel
- Sidebar active state

Keep animations fast and professional.

No excessive animations.

====================================================
20. DATA CONSISTENCY
====================================================

Use realistic prototype data.

Keep values logically consistent.

Use:

Organizations: 44
Employees: 12,847
Drivers: 1,203
Vehicles: 896
Today's Trips: 1,954
Active Trips: 247
Completed Trips: 1,689
Delayed Trips: 18
SOS Alerts: 2
Drivers Available: 389
Fleet Utilization: 74%

====================================================
21. IMPORTANT VISUAL PRIORITY
====================================================

The most visually important parts should be:

1. Live Operations
2. Today's Transportation
3. Safety / SOS
4. KPI overview
5. Fleet Utilization
6. Trip Analytics
7. Cost Analytics
8. Organization Growth
9. Needs Attention
10. Recent Activity

Do not give equal visual weight to every widget.

Live Operations should clearly feel like the heart of the dashboard.

====================================================
22. FINAL SCOPE RULE
====================================================

ONLY modify the CURRENT SHIVNERI DASHBOARD / OVERVIEW PAGE.

Do not modify other pages.

Do not create new pages.

Do not remove existing navigation.

Do not change existing module names.

Do not change existing page destinations.

The result should be a polished, highly interactive, responsive, production-quality SHIVNERI Super Admin Dashboard prototype.

It should feel like a real corporate employee transportation control center rather than a generic admin template.

Every important element should have a clear purpose and interaction.