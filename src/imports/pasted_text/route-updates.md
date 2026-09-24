STRICT INSTRUCTION — MODIFY ONLY 2 EXISTING PAGES:
1. ROUTES
2. SAFETY & INCIDENTS

You must actually update these two existing pages in the current prototype.
Do not just describe the changes. Apply the changes directly to the existing design.

USE THE ATTACHED SCREENSHOTS AS REFERENCE FOR THE CURRENT PAGES.

====================================================
GLOBAL RULES
====================================================

DO NOT TOUCH ANYTHING OUTSIDE THESE TWO PAGES.

Do NOT modify:
- Sidebar
- Header
- Navigation
- Branding
- Colors/theme used by the existing application
- Other pages
- Billing
- Analytics
- Access Control
- Policy Engine
- Policy Simulator
- Approvals
- Security & Audit
- Employee App
- Driver App
- Organizations
- Any other existing module

Preserve the existing Shivneri design language and layout style.

The goal is NOT to make these pages more complicated.

The goal is:
- Simple
- Clear
- Useful
- Realistic
- Highly interactive
- Fully responsive
- Easy for a non-technical client to understand
- Client-demo ready

REMOVE unnecessary features instead of adding more complexity.

====================================================
PAGE 1 — ROUTES
====================================================

Keep the existing Routes page structure.

REMOVE COMPLETELY:
- Optimize Route button
- Any AI route optimization feature
- Any unnecessary advanced route-planning controls

Keep the page focused on route management.

----------------------------------------------------
ROUTE LIST
----------------------------------------------------

Keep a clean route list with realistic corporate routes.

Example routes:

RT-001 — Kothrud → Hinjewadi Ph1
RT-002 — Baner → Hinjewadi Ph2
RT-003 — Aundh → Magarpatta
RT-004 — Viman Nagar → Kharadi
RT-005 — Wakad → Hinjewadi Ph1
RT-006 — Hadapsar → Magarpatta
RT-007 — Kothrud → Baner
RT-008 — Pimpri → Hinjewadi

Use realistic different data for every route.

Each route must show clearly:

- Route ID
- Route Name
- Organization
- Assigned Driver
- Vehicle Number
- Employees
- Number of Stops
- Distance
- ETA
- Status

IMPORTANT:
The organization must be clearly visible for every route.

Example:
Kothrud → Hinjewadi Ph1
Organization: TCS Pune Campus
Driver: Raj Kumar
Vehicle: MH12AB1234

Do not hide the organization inside a complicated interaction.

----------------------------------------------------
ROUTE SELECTION
----------------------------------------------------

When the user clicks any route:

The selected route must update the complete right-side content.

Update:
- Route name
- Organization
- Driver
- Vehicle
- Employees
- Stops
- Distance
- ETA
- Status
- Map
- Pickup stops

Different routes must display different realistic data.

Do NOT show identical information for every route.

----------------------------------------------------
MAP
----------------------------------------------------

Keep the map simple.

Show:
- Route path
- Pickup stops
- Destination
- Vehicle position

The purpose is simply to help the client understand the route.

Do not add advanced map controls.

----------------------------------------------------
PICKUP STOPS
----------------------------------------------------

Show a simple numbered list of pickup stops.

Example:

1. Kothrud Depot — Picked up
2. Karve Nagar — Picked up
3. Chandani Chowk — ETA +6 min
4. Wakad Bridge — ETA +12 min
5. Wakad Signal — ETA +18 min
6. Hinjewadi Ph1 Gate — ETA +24 min

Change the stops when another route is selected.

----------------------------------------------------
EDIT ROUTE — MUST ACTUALLY UPDATE
----------------------------------------------------

Keep the existing Edit Route interaction and use the attached Edit Route screenshot as reference.

The Edit Route form must contain only useful fields:

- Route Name
- Organization
- Driver
- Vehicle
- No. of Stops
- Employees
- Distance
- ETA
- Status

Status:
- Active
- Delayed
- Inactive

Buttons:
- Cancel
- Save Changes

CRITICAL:
The Save Changes interaction MUST actually update the displayed prototype data.

Example:

Change:
Route Name
Employees
Driver
Vehicle
ETA
Status

After Save Changes:

- Route list must show the updated value
- Selected route details must show the updated value
- Organization/driver/vehicle information must update
- Employee count must update
- ETA/status must update
- Map/route information should reflect the updated selected route where relevant
- Show toast:
“Route updated successfully”

Do not leave the old values visible after saving.

----------------------------------------------------
CREATE ROUTE
----------------------------------------------------

Keep + Create.

Use a simple form:

- Route Name
- Organization
- Driver
- Vehicle
- Stops
- Employees
- Distance
- ETA
- Status

After Create:
- New route appears in the route list
- It can be selected
- Its details appear
- Show:
“Route created successfully”

----------------------------------------------------
ASSIGN DRIVER
----------------------------------------------------

Keep Assign Driver because it is useful.

Make it simple:

Select Driver
Select Vehicle

After assignment:
- Driver changes on selected route
- Vehicle changes on selected route
- Related UI updates
- Show:
“Driver assigned successfully”

----------------------------------------------------
SEARCH
----------------------------------------------------

Keep route search.

Search should work by:
- Route name
- Route ID
- Organization
- Driver
- Vehicle number

Show:
“No routes found”

Provide Clear Search.

----------------------------------------------------
ROUTES RESPONSIVENESS
----------------------------------------------------

FULLY RESPONSIVE.

Desktop:
- Route list
- Route details
- Map

Tablet:
- Preserve readability
- Use smart stacking where required

Mobile:
- Route list becomes cards
- Route details stack vertically
- Map becomes responsive
- Edit/Create forms fit the screen
- Buttons remain touch-friendly
- No clipping
- No overlapping
- No horizontal page overflow

====================================================
PAGE 2 — SAFETY & INCIDENTS
====================================================

IMPORTANT:
SIMPLIFY THIS PAGE.

Remove anything that is not necessary for a clear client demonstration.

The main purpose of this page is:

SOS detected
→ identify employee/driver/vehicle/location
→ respond
→ create/manage incident
→ resolve incident

----------------------------------------------------
REMOVE THESE UNNECESSARY FEATURES
----------------------------------------------------

REMOVE:
- SOS Events & Incidents chart
- Complex analytics
- Unnecessary security details
- Billing Data permission
- Personal Documents permission
- Complicated emergency-access permission controls
- Any unnecessary advanced security configuration

Do NOT add new complex features.

----------------------------------------------------
KEEP ONLY ESSENTIAL SUMMARY
----------------------------------------------------

Keep simple summary cards:

- SOS Active
- Open Incidents
- Resolved Today

Keep Average Response Time only if it already fits naturally.
Otherwise remove it.

----------------------------------------------------
ACTIVE SOS
----------------------------------------------------

Keep one clear and prominent Active SOS section.

Show only:

- Employee
- Ride ID
- Driver
- Vehicle
- Location
- Time

Actions:

- View Location
- Contact Employee
- Contact Driver
- Open Incident

Buttons must work as prototype interactions.

----------------------------------------------------
BREAK-GLASS ACCESS
----------------------------------------------------

Keep Break-Glass Access only as a simple emergency feature.

REMOVE the detailed permission list.

Show only:

Emergency Access
Temporary emergency access to:
- Live Location
- Emergency Contact

Duration:
- 15 minutes
- 30 minutes
- 60 minutes

Button:
Grant Emergency Access

On click:
show confirmation.

After confirmation:
- Show success state
- Show:
“Emergency access granted”
- Clearly indicate that the emergency action is logged

Keep this simple.

----------------------------------------------------
INCIDENT TABLE
----------------------------------------------------

Keep a simple incident table.

Columns:

Incident ID
Severity
Employee
Driver
Vehicle
Location
Type
Status
Time
Actions

Types:
- SOS
- Accident
- Breakdown
- Complaint

Statuses:
- Open
- Investigating
- Resolved
- Closed

Actions:
- View
- Investigate

Do not add unnecessary columns.

----------------------------------------------------
INCIDENT DETAILS
----------------------------------------------------

When View is clicked, open a simple Incident Details panel/modal.

Show:
- Incident ID
- Employee
- Driver
- Vehicle
- Location
- Type
- Severity
- Time
- Description
- Current Status

Actions:
- View Location
- Contact Employee
- Contact Driver
- Update Status

----------------------------------------------------
STATUS MUST ACTUALLY UPDATE
----------------------------------------------------

This is mandatory.

When status changes:

Open
→ Investigating
→ Resolved
→ Closed

The updated status must actually appear in:
- Incident details
- Incident list/table
- Relevant summary count

If an active SOS is resolved:
- SOS Active count decreases
- Active SOS section updates/disappears as appropriate
- Incident becomes Resolved
- Show:
“Incident resolved successfully”

Do NOT leave the old status visible after update.

----------------------------------------------------
SEARCH / FILTER
----------------------------------------------------

Keep only simple useful filters:

All
SOS
Accident
Breakdown
Complaint

Status filter:
- Open
- Investigating
- Resolved

Search by:
- Incident ID
- Employee
- Driver
- Location

Changing filter/search MUST update:
- visible incidents
- counts
- empty state

----------------------------------------------------
EMPTY STATE
----------------------------------------------------

If there are no matching incidents:

“No incidents found”

Button:
Clear Filters

----------------------------------------------------
SAFETY RESPONSIVENESS
----------------------------------------------------

FULLY RESPONSIVE.

Desktop:
- Summary cards
- Active SOS
- Incident list

Tablet:
- Smart stacking

Mobile:
- Cards instead of wide table
- Active SOS becomes a clear mobile card
- Action buttons stack/full width
- Incident table converts to incident cards
- No horizontal overflow
- No clipping
- No overlapping
- Touch-friendly controls

====================================================
INTERACTIONS & MICRO-ANIMATIONS
====================================================

Both pages should feel interactive but professional.

Use only subtle animations:
- Filter transition
- Search transition
- Row/card hover
- Modal fade/slide
- Button press feedback
- Toast slide-in
- Status change transition
- Selected route/incident transition

Do NOT use flashy animations.

====================================================
DATA CONSISTENCY
====================================================

This is extremely important.

The prototype should behave like connected data.

ROUTES:
If route data is edited, the updated data must appear everywhere relevant on the Routes page.

If driver changes:
Driver information updates.

If vehicle changes:
Vehicle information updates.

If organization changes:
Organization information updates.

If employees/stops/ETA/status change:
Those values update in the related route details.

SAFETY:
If incident status changes:
The table, details and counts update.

If SOS is resolved:
Active SOS state updates.

====================================================
FINAL STRICT REQUIREMENT
====================================================

Do not redesign the whole application.

Do not change other pages.

Do not change the sidebar.

Do not change the header.

Do not add unnecessary enterprise complexity.

ONLY modify these two existing pages:

1. ROUTES
2. SAFETY & INCIDENTS

Actually apply ALL requested changes to the existing prototype.

After making the changes, verify both pages for:
- working interactions
- data updates
- simple UX
- responsive layout
- no overlapping elements
- no clipped text
- no unnecessary features
- consistent Shivneri design