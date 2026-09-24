REDESIGN ONLY THE CURRENT SHIVNERI PLATFORM ADMIN DASHBOARD / OVERVIEW PAGE.

THIS IS A DASHBOARD-ONLY REDESIGN.

VERY IMPORTANT:
Do NOT modify, redesign, delete, rename, reorder, or create any other page.

Do NOT touch the existing:
- Organizations page
- Users & Employees page
- Drivers page
- Vehicles page
- Rides page
- Live Operations page
- Routes page
- Safety & Incidents page
- Billing page
- Reports page
- Analytics page
- Settings page

Do NOT change the existing sidebar navigation destinations.

Only redesign and improve the CURRENT Dashboard / Overview page.

==================================================
PROJECT CONTEXT
==================================================

SHIVNERI is a multi-tenant corporate employee transportation management platform.

The Super Admin manages the complete transportation ecosystem across multiple organizations/tenants.

The dashboard should give the Super Admin an immediate understanding of:

- Organizations
- Employees
- Drivers
- Vehicles
- Today's trips
- Active trips
- Delayed trips
- SOS alerts
- Live transportation operations
- Fleet utilization
- Transportation cost
- Organization growth
- Trip performance
- Safety events
- Recent system activity

The dashboard should feel like a REAL CORPORATE TRANSPORTATION CONTROL CENTER.

It should NOT look like a generic business analytics dashboard.

==================================================
DESIGN DIRECTION
==================================================

Keep the existing SHIVNERI identity.

Preserve:
- SHIVNERI branding
- Dark navy sidebar
- Blue primary color
- Light background
- Enterprise SaaS style
- Existing navigation structure

Improve:
- UI hierarchy
- spacing
- typography
- card design
- alignment
- readability
- visual consistency
- information density
- interaction design

Use a modern, premium and professional enterprise dashboard style.

Avoid:
- excessive gradients
- excessive colors
- unnecessary illustrations
- emojis as UI icons
- oversized cards
- unnecessary decorative elements
- random analytics widgets

Use a consistent professional icon library.

==================================================
1. TOP HEADER
==================================================

Keep the existing header but improve it.

Show:

Dashboard
Platform Admin / Overview

Subtitle:
"Real-time transportation operations across all tenant organizations"

Right side:
- Global search
- Notifications
- Help
- Super Admin profile
- Profile dropdown

Search placeholder:

"Search organizations, employees, drivers, vehicles..."

The search should be interactive.

==================================================
2. KPI OVERVIEW
==================================================

Create a strong KPI section at the top.

Show 8 important KPI cards:

1. Organizations
44
Active organizations

2. Active Employees
12,847
Active employees

3. Active Drivers
1,203
Verified drivers

4. Fleet Vehicles
896
Active vehicles

5. Today's Trips
1,954
Scheduled today

6. Active Trips
247
Currently in progress

7. Delayed Trips
18
Require attention

8. SOS Alerts
2
Active alerts

Each KPI card should contain:
- Icon
- Metric name
- Large value
- Supporting text
- Small trend indicator where appropriate

Use:
Green = healthy/positive
Amber = warning
Red = critical/SOS
Blue = normal information

Do NOT make every card colorful.

==================================================
3. LIVE OPERATIONS — PRIMARY SECTION
==================================================

This should be the most important section after KPIs.

Create a large:

"Live Operations"

panel.

Left:
Large live transportation map.

Show:
- Vehicle markers
- Route lines
- Pickup locations
- Drop locations
- Active trip markers

Right:
"Active Trips"

Show 5 realistic trip rows.

Each row:

Trip ID
Organization
Driver
Vehicle
Status
ETA

Example:

TRP-10482
Infosys
Ramesh Kumar
MH12 AB 1234
On Trip
12 min

TRP-10483
TCS
Suresh Patil
MH12 CD 5678
Arriving
5 min

TRP-10484
Wipro
Imran Shah
MH12 EF 9012
Delayed
18 min

Statuses:
On Trip
Arriving
Delayed
Completed

Add:

"View Live Operations"

This MUST navigate to the existing Live Operations page.

==================================================
4. TODAY'S TRANSPORT STATUS
==================================================

Add a compact operational summary:

Today's Transportation

Scheduled Trips
1,954

Completed
1,689

Active
247

Delayed
18

Show a visual completion/progress indicator.

Also show:

Completion Rate
86%

The numbers should visually relate to each other.

==================================================
5. FLEET UTILIZATION
==================================================

Create:

"Fleet Utilization"

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

Use a clean donut/progress visualization.

This should be easy to understand at a glance.

==================================================
6. MONTHLY TRANSPORT COST
==================================================

KEEP AND IMPROVE THE EXISTING "Monthly Transport Cost" SECTION.

Show monthly cost:

Apr
May
Jun
Jul
Aug
Sep

Use a clean bar chart.

Add filters:

- 6 Months
- 12 Months
- This Year

Add currency selector:

INR

Add a small summary:

Current Month
₹360K

Average Monthly Cost
₹335K

The chart must be interactive.

Clicking a month should show:
- Month
- Transport cost
- Trips
- Cost per trip

Do NOT create a separate page.

==================================================
7. ORGANIZATION GROWTH
==================================================

KEEP AND IMPROVE THE EXISTING "Organization Growth" chart.

Show:

Apr
May
Jun
Jul
Aug
Sep

Use a clean line chart.

Show:

Current Organizations
44

New This Month
+6

Growth trend

Add filter:

Monthly / Quarterly / Yearly

Clicking a chart point should show:
- Month
- Total organizations
- New organizations

Keep it inside the dashboard.

==================================================
8. LIVE OPERATIONS SUMMARY CARD
==================================================

KEEP the existing Live Operations summary card but improve it.

Show:

LIVE

Active Rides
247

Delayed
18

SOS Active
2

Drivers Available
389

Make each row/card clickable.

Clicking:
Active Rides → existing Rides/Live Operations page
Delayed → existing Rides/Live Operations page
SOS Active → existing Safety & Incidents page
Drivers Available → existing Drivers page

Do NOT create new pages.

==================================================
9. SAFETY & INCIDENTS
==================================================

Add a compact dashboard section:

"Safety & Incidents"

Show recent events:

SOS Alert
Infosys
Trip TRP-10482
2 min ago

Vehicle Breakdown
TCS
Trip TRP-10461
18 min ago

Accident Report
Wipro
Resolved
1 hr ago

Use:
Red = active critical event
Amber = warning
Green/neutral = resolved

Add:

"View Safety Center"

This must navigate to the existing Safety & Incidents page.

==================================================
10. TRIPS BY ORGANIZATION
==================================================

Add a small visualization:

"Trips by Organization"

Organizations:

Infosys
TCS
Wipro
Cognizant
Other

Use a donut chart or horizontal bar chart.

Show percentage and trip count.

Clicking an organization should show its trip count in a tooltip/detail state.

==================================================
11. RECENT ACTIVITY
==================================================

KEEP the existing "Recent Activity" section but improve its content.

Do NOT use unrelated generic activities such as:
- random policy modifications
- random permission changes

Use activities directly related to Shivneri transportation operations.

Examples:

New organization onboarded
Infosys BPM Ltd — 1,200 employees

Driver verified
Raj Kumar — License verified

Vehicle added
MH12 CD 5678

Transport request approved
TCS

SOS event triggered
Employee #10482 — Ride TRP-98231

Invoice approved
INV-2024-0891

Ride completed
Infosys — TRP-10482

Each activity should show:
- status icon
- activity title
- related entity
- timestamp
- actor/source

Add:
"View All Activity"

If there is no existing activity page, keep it as a dashboard interaction only.
Do NOT create a new page.

==================================================
12. ALERTS / ATTENTION REQUIRED
==================================================

Add a compact section:

"Needs Attention"

Show only important items:

18 Delayed Trips
2 Active SOS Alerts
12 Vehicles due for document renewal
5 Driver verifications pending

IMPORTANT:
These should be summary cards only.

Clicking each should navigate to the corresponding EXISTING module.

This gives the Super Admin an immediate action list.

==================================================
13. QUICK ACTIONS
==================================================

Add a compact "Quick Actions" area.

Actions:

+ Add Organization
+ Add Driver
+ Add Vehicle
View Live Trips
Generate Report

These MUST navigate to existing pages or existing flows.

Do not create new modules.

==================================================
14. GLOBAL FILTERS
==================================================

Add a small dashboard filter area.

Filters:

Date:
Today
This Week
This Month
Custom

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

The filters should visibly update the dashboard sample data.

Keep the filters compact and professional.

==================================================
15. INTERACTIVITY — VERY IMPORTANT
==================================================

The dashboard must be highly interactive.

Do NOT create a static dashboard.

Every meaningful interactive element should work in the prototype.

Required interactions:

KPI cards:
- Organizations → existing Organizations page
- Employees → existing Users & Employees page
- Drivers → existing Drivers page
- Vehicles → existing Vehicles page
- Today's Trips → existing Rides page
- Active Trips → existing Live Operations page
- Delayed Trips → existing Rides/Live Operations page
- SOS Alerts → existing Safety & Incidents page

Charts:
- Date filters change chart data
- Month selection changes cost details
- Organization chart selection shows details
- Organization Growth chart points show details
- Trip charts respond to filters

Live map:
- Vehicle markers are clickable
- Selected marker opens a small detail panel

Detail panel should show:
Driver
Vehicle
Organization
Trip ID
Status
ETA

Recent Activity:
- Activity rows are clickable where relevant
- Clicking an activity opens the appropriate existing module

Notifications:
- Notification icon opens a dropdown/panel

Search:
- Search filters dashboard entities/sample data

Quick Actions:
- All buttons must work

Dropdowns:
- Open and close properly

Cards:
- Hover states
- Selected states
- Click states

==================================================
16. MICRO INTERACTIONS
==================================================

Add subtle professional interactions:

- Smooth card hover
- Button hover
- Active states
- Chart transitions
- Dropdown animations
- Notification panel animation
- Map marker selection
- Filter transitions
- Tooltip animations

Keep animations fast and professional.

No flashy or excessive animations.

==================================================
17. DASHBOARD LAYOUT
==================================================

Use this information hierarchy:

TOP:
Header

THEN:
KPI Overview

THEN:
Live Operations
+ Active Trips

THEN:
Today's Transportation Status
+ Fleet Utilization

THEN:
Monthly Transport Cost
+ Organization Growth

THEN:
Trips by Organization
+ Safety & Incidents
+ Live Operations Summary

THEN:
Needs Attention

THEN:
Recent Activity

THEN:
Quick Actions

Maintain good whitespace.

Do not make the dashboard excessively long.

Use a balanced 2-column / 3-column grid where appropriate.

==================================================
18. UI QUALITY
==================================================

Use:

Font:
Inter or equivalent

Colors:
Navy
Blue
White
Light gray
Green
Amber
Red only when required

Cards:
12–16px radius
Subtle border
Very subtle shadow
Consistent padding

Charts:
Minimal
Readable
Professional
No unnecessary decoration

Tables/lists:
Clean rows
Clear alignment
Readable typography

Icons:
One consistent icon family
No emojis

==================================================
19. RESPONSIVE
==================================================

Make the dashboard work properly at:

1440px
1280px
1024px

No overlapping elements.
No clipped charts.
No broken cards.
No horizontal overflow.

==================================================
20. DATA CONSISTENCY
==================================================

Use realistic prototype data.

Keep related numbers consistent.

Example:

Organizations: 44
Employees: 12,847
Drivers: 1,203
Vehicles: 896
Today's Trips: 1,954
Active Trips: 247
Delayed Trips: 18
SOS Alerts: 2
Drivers Available: 389
Fleet Utilization: 74%

==================================================
21. FINAL SCOPE RULE
==================================================

THIS IS THE MOST IMPORTANT INSTRUCTION:

ONLY MODIFY THE CURRENT DASHBOARD / OVERVIEW PAGE.

Do not modify any other existing page.

Do not create additional pages.

Do not remove existing navigation.

Do not change existing module names.

Do not redesign the sidebar into a different navigation system.

Improve the current dashboard using the existing content plus the new dashboard-level features described above.

The final result should feel like a REAL SHIVNERI SUPER ADMIN TRANSPORTATION CONTROL CENTER.

The first screen should immediately answer:

"How is Shivneri's transportation system operating right now?"

Priority:

1. Current operational status
2. Live rides
3. Safety/SOS
4. Fleet status
5. Trips
6. Transport cost
7. Organization growth
8. Recent activity
9. Actions requiring attention

Make everything polished, interactive, responsive and prototype-ready.