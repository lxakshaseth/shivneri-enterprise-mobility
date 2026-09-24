IMPORTANT — MODIFY ONLY THESE TWO PAGES:
1. Routes
2. Safety & Incidents

DO NOT CHANGE:
- Sidebar
- Header
- Other pages
- Overall Shivneri branding
- Existing navigation
- Any unrelated modules
- Any existing page structure outside these two pages

Use the attached screenshots as the direct visual reference for the current Routes and Safety & Incidents pages.

The goal is to make both pages:
- simple
- easy to understand
- realistic
- highly interactive
- fully responsive
- useful for a client demo
- professional but NOT over-complicated

====================================================
PAGE 1 — ROUTES
====================================================

Keep the existing Routes page layout and visual style.

Remove the “Optimize Route” button completely.
Do not replace it with another complex AI feature.

The Routes page should focus only on the useful operational information that an admin actually needs.

----------------------------------------------------
A. ROUTE LIST
----------------------------------------------------

Keep a simple route list on the left.

Show realistic corporate routes such as:

RT-001
Kothrud → Hinjewadi Ph1

RT-002
Baner → Hinjewadi Ph2

RT-003
Aundh → Magarpatta

RT-004
Viman Nagar → Kharadi

RT-005
Wakad → Hinjewadi Ph1

RT-006
Hadapsar → Magarpatta

RT-007
Kothrud → Baner

RT-008
Pimpri → Hinjewadi

Use realistic values for:
- number of stops
- employees
- distance
- ETA
- status

Use simple statuses:
- Active
- Delayed
- Inactive

----------------------------------------------------
B. ORGANIZATION MUST BE VISIBLE
----------------------------------------------------

VERY IMPORTANT:

For every route, clearly show which organization the route belongs to.

Example:

Kothrud → Hinjewadi Ph1
Organization: TCS Pune Campus

Baner → Hinjewadi Ph2
Organization: Infosys BPM Ltd

Aundh → Magarpatta
Organization: Wipro Technologies

Also show the organization in the selected route details area.

The organization information must be easy to see and not hidden inside a complicated interaction.

----------------------------------------------------
C. ASSIGNED VEHICLE + DRIVER
----------------------------------------------------

For every selected route, clearly show:

Organization
Assigned Vehicle
Vehicle Number
Driver Name
Employees
Stops
Distance
ETA
Status

Example:

Organization: TCS Pune Campus
Driver: Raj Kumar
Vehicle: MH12AB1234
Employees: 24
Stops: 6
Distance: 18 km
ETA: 35 min
Status: Active

This should make it immediately understandable:
“Which company's route is this, and which vehicle/driver is handling it?”

----------------------------------------------------
D. ROUTE SELECTION
----------------------------------------------------

When the user clicks any route on the left:

- selected route becomes highlighted
- right-side details update
- map/route visualization updates
- organization updates
- driver updates
- vehicle updates
- employee count updates
- stops update
- distance updates
- ETA updates
- status updates

Do NOT show the same information for every route.

Each route must have its own realistic data.

----------------------------------------------------
E. ROUTE MAP
----------------------------------------------------

Keep the simple route visualization/map.

Show:
- pickup stops
- route direction
- destination
- vehicle position where appropriate

Do not make the map overly technical.

The purpose is simply to help the admin understand:
“Where does this route go?”

----------------------------------------------------
F. PICKUP STOPS
----------------------------------------------------

Keep a clear numbered pickup stop list.

Example:

1. Kothrud Depot — Picked up
2. Karve Nagar — Picked up
3. Chandani Chowk — ETA +6 min
4. Wakad Bridge — ETA +12 min
5. Wakad Signal — ETA +18 min
6. Hinjewadi Ph1 Gate — ETA +24 min

When a different route is selected, its stops must change accordingly.

----------------------------------------------------
G. EDIT ROUTE — MUST ACTUALLY UPDATE DATA
----------------------------------------------------

This is compulsory.

Use the attached Edit Route screenshot as the design reference.

When the user clicks “Edit Route”:

Open the Edit Route form/modal.

Keep it simple.

Fields:

Route Name
Organization
Assigned Driver
Assigned Vehicle
No. of Stops
Employees
Distance
ETA
Status

Status options:
- Active
- Inactive
- Delayed

Buttons:
Cancel
Save Changes

----------------------------------------------------
H. ACTUAL EDIT BEHAVIOR
----------------------------------------------------

Saving changes MUST actually reflect throughout the prototype.

Example:

If the user changes:

Route Name:
“Kothrud → Hinjewadi Ph1”
to
“Kothrud → Hinjewadi Ph2”

and changes:

Employees:
24 → 30

Driver:
Raj Kumar → Suresh Yadav

Vehicle:
MH12AB1234 → MH12CD5678

then after clicking Save Changes:

- selected route details must update
- route list must update
- organization/driver/vehicle information must update
- employees count must update
- stops/distance/ETA must update where edited
- map information should reflect the selected route
- show a success toast:
  “Route updated successfully”

This must NOT look like a fake button.

The prototype should demonstrate that the edited data is reflected in the relevant UI.

----------------------------------------------------
I. CREATE ROUTE
----------------------------------------------------

Keep the existing “+ Create” option.

Make it simple.

Fields:
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
- new route appears in route list
- route count/data updates
- route can be selected
- details appear
- show:
  “Route created successfully”

----------------------------------------------------
J. ASSIGN DRIVER
----------------------------------------------------

Keep “Assign Driver” because it is useful.

Clicking it should open a simple selection:
- Driver
- Vehicle

After assignment:
- selected route shows the new driver
- selected route shows the new vehicle
- route details update
- show success toast

Do not introduce any complex workflow.

----------------------------------------------------
K. SEARCH ROUTES
----------------------------------------------------

Search should work by:
- Route name
- Route ID
- Organization
- Driver
- Vehicle number

Results should update immediately.

If nothing matches:
“No routes found”

Add a clear “Clear Search” action.

----------------------------------------------------
L. RESPONSIVE ROUTES PAGE
----------------------------------------------------

Desktop:
- route list + route details + map

Tablet:
- preserve readability
- allow controlled stacking

Mobile:
- route list becomes cards
- selected route opens in a clean detail section
- edit/create forms fit mobile screens
- no horizontal overflow
- touch-friendly buttons

====================================================
PAGE 2 — SAFETY & INCIDENTS
====================================================

IMPORTANT:

Keep this page SIMPLE.

Do NOT make it look like a complicated security dashboard.

Only keep features that are necessary and easy for a client to understand.

The main purpose is:

“Detect an emergency → see who/where → respond → track incident → close it.”

----------------------------------------------------
A. SIMPLE SUMMARY CARDS
----------------------------------------------------

Keep only these essential cards:

SOS Active
Open Incidents
Average Response Time
Resolved Today

Use clear values and simple labels.

Do not add unnecessary metrics.

----------------------------------------------------
B. ACTIVE SOS SECTION
----------------------------------------------------

Keep one highly visible Active SOS alert area.

Show:

Employee
Ride ID
Driver
Vehicle
Location
Time

Example:

ACTIVE SOS
Employee #10482
Ride: RIDE-98231
Driver: Raj Kumar
Vehicle: MH12AB1234
Location: Raj Nagar, Pune
Time: 22:18

The alert should be visually prominent but professional.

----------------------------------------------------
C. ESSENTIAL ACTIONS ONLY
----------------------------------------------------

Keep only these actions:

View Location
Contact Employee
Contact Driver
Open Incident

Also keep:
Break-Glass Access

But present it simply and clearly.

Do NOT add too many action buttons.

----------------------------------------------------
D. BREAK-GLASS ACCESS
----------------------------------------------------

This is emergency temporary access.

Keep only the essential information:

- Live Location
- Emergency Contact
- Duration

Duration options:
15 minutes
30 minutes
60 minutes

Button:

Grant Emergency Access

After clicking:
show a confirmation modal:

“Grant emergency access for 30 minutes?”

Buttons:
Cancel
Confirm

After confirmation:
- show success state
- show:
  “Emergency access granted”
- indicate that the action is logged

Do not include billing data or personal documents in this simplified version unless necessary for the prototype.

----------------------------------------------------
E. INCIDENT TABLE
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
View
Investigate

Keep the table easy to read.

----------------------------------------------------
F. INCIDENT INTERACTION
----------------------------------------------------

When “View” is clicked:

Open a simple Incident Details panel/modal showing:

Incident ID
Employee
Driver
Vehicle
Location
Incident Type
Severity
Time
Current Status
Description

Actions:

View Location
Contact Employee
Contact Driver
Update Status

----------------------------------------------------
G. STATUS UPDATE MUST ACTUALLY REFLECT
----------------------------------------------------

This is compulsory.

Example:

Open → Investigating → Resolved → Closed

When status changes:

- incident table updates
- summary card count updates where relevant
- Active SOS section updates if applicable
- show success toast

Example:
“Incident status updated successfully”

If an SOS is resolved:
- SOS Active count decreases
- Active SOS section disappears or updates
- incident moves to Resolved/Closed state

Do not leave the data visually unchanged after an action.

----------------------------------------------------
H. SEARCH / FILTER
----------------------------------------------------

Keep simple filters:

- All
- SOS
- Accident
- Breakdown
- Complaint

Optional status filter:
- Open
- Investigating
- Resolved

Search by:
- Incident ID
- Employee
- Driver
- Location

When filters/search change:
- table updates
- counts update
- pagination updates

----------------------------------------------------
I. SIMPLE INCIDENT CHART
----------------------------------------------------

Do NOT create a complicated analytics section.

If keeping the current SOS Events & Incidents chart, make it a very simple monthly overview only.

Keep it visually secondary.

The page should primarily focus on active incidents and response.

----------------------------------------------------
J. RESPONSIVE SAFETY PAGE
----------------------------------------------------

Desktop:
- summary cards
- active SOS
- incident table

Tablet:
- cards stack naturally
- table remains readable

Mobile:
- summary cards become 2-column or stacked cards
- Active SOS becomes a prominent mobile card
- action buttons become stacked/full width
- incident table becomes incident cards
- no horizontal overflow

----------------------------------------------------
K. MICRO-ANIMATIONS
----------------------------------------------------

Use subtle professional animation only:

- filter transition
- card hover
- modal fade/slide
- toast slide-in
- status change transition
- button press feedback
- selected route transition
- selected incident transition

Avoid flashy animations.

====================================================
OVERALL PROTOTYPE RULES
====================================================

Both pages must feel connected and data-driven.

If route data changes:
the route list and route details must reflect it.

If incident status changes:
the incident list and relevant summary information must reflect it.

If a driver or vehicle changes:
the selected route must show the updated driver/vehicle.

If an organization is changed in a route:
the route must display the updated organization.

Use realistic Indian corporate transportation data, especially Pune routes and organizations.

Keep everything understandable to a non-technical client.

The client should be able to understand every screen without needing a technical explanation.

MOST IMPORTANT:
DO NOT MODIFY ANY OTHER PAGE OR MODULE.
DO NOT REDESIGN THE SIDEBAR.
DO NOT REDESIGN THE HEADER.
DO NOT TOUCH BILLING, ANALYTICS, ACCESS CONTROL, POLICY ENGINE, POLICY SIMULATOR, APPROVALS, SECURITY & AUDIT OR ANY OTHER PAGE.

ONLY MAKE THE REQUIRED CHANGES TO:
1. ROUTES
2. SAFETY & INCIDENTS