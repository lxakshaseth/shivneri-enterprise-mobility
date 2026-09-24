REDESIGN AND ENHANCE ONLY THE EXISTING “ORGANIZATIONS” PAGE.

IMPORTANT:
- Do NOT modify, redesign, regenerate, remove, or restructure the sidebar.
- Do NOT modify other pages.
- Do NOT create a completely different page.
- Preserve the existing Shivneri visual identity, header, sidebar and overall layout.
- Focus ONLY on making the Organizations page highly interactive, responsive, polished and prototype-ready.
- Use realistic sample data.
- Make all interactions functional in the prototype.

PAGE PURPOSE:
This is the Shivneri Platform Admin → Organizations management page for managing multi-tenant client organizations.

==================================================
1. ORGANIZATION STATUS FILTERS
==================================================

Keep the existing filter tabs:

- All
- Active
- Trial
- Suspended

Make them fully functional.

When the user clicks a filter:
- Active tab becomes visually selected.
- Table updates immediately.
- Only organizations matching that status are displayed.
- Organization count updates dynamically.
- Search results must respect the currently selected filter.
- Pagination must update according to the filtered results.
- If there are no matching results, show a professional empty-state message.

Example:
All → 8 organizations
Active → 5 organizations
Trial → 2 organizations
Suspended → 1 organization

Use realistic organization data so each filter visibly produces different results.

Add a subtle 150–250ms transition when switching filters.

==================================================
2. ORGANIZATION SEARCH
==================================================

Make the search field fully interactive.

Placeholder:
“Search by name, ID, or city…”

Search should work across:
- Organization name
- Organization ID
- City

Example:
Searching “Pune” should show Pune organizations only.

Search must work together with the selected status filter.

Example:
Active + Pune = only active Pune organizations.

Update:
- table rows
- organization count
- pagination
- empty state

Use a subtle search transition rather than instantly replacing the entire table.

Add a clear “X” button when text is entered.

==================================================
3. ORGANIZATION TABLE
==================================================

Keep the current enterprise table structure:

Organization
ID
Employees
Drivers
Vehicles
Active Trips
Status
Plan
Created
Actions

Improve the table visually:
- clean spacing
- readable typography
- clear column hierarchy
- subtle row separators
- hover state
- selected row state
- smooth row hover animation
- status badges
- plan badges
- consistent alignment

On row hover:
- slightly highlight the row
- reveal a subtle interaction affordance
- do not use excessive animation.

Clicking a row should open the organization details view.

==================================================
4. ORGANIZATION DETAILS
==================================================

Make “View” fully interactive.

When clicking View on an organization, open a detailed Organization Details page or large detail panel.

Show:

Organization name
Organization ID
City
Status
Plan
Created date

Summary cards:
- Total Employees
- Drivers
- Vehicles
- Active Trips
- Today's Trips
- Monthly Transport Cost

Add sections:

Organization Information
Contact Information
Transport Overview
Current Active Trips
Fleet Summary
Recent Activity

Add actions:
- Edit Organization
- Suspend Organization / Activate Organization
- Close / Back to Organizations

The selected organization data must match the organization clicked.

Example:
If the user clicks TCS Pune Campus,
the details must show TCS Pune Campus data,
NOT generic data.

==================================================
5. ADD ORGANIZATION
==================================================

Make “+ Add Organization” fully interactive.

Clicking it opens a clean modal or dedicated form.

Form sections:

BASIC INFORMATION
- Organization Name
- Organization ID
- City
- Address

CONTACT INFORMATION
- Contact Person
- Email
- Phone

SUBSCRIPTION
- Plan: Trial / Business / Enterprise
- Start Date
- End Date

SETTINGS
- Status
- Live Tracking
- SOS

Buttons:
- Cancel
- Create Organization

Add:
- required-field validation
- email validation
- clear error messages
- loading state on Create
- success animation/toast after creation

After successful creation:
- close modal
- add the new organization to the table
- update organization count
- show success toast:
  “Organization created successfully”
- automatically keep the current filter/search logic consistent.

==================================================
6. ACTION MENU
==================================================

For every organization, make the “…” menu interactive.

Dropdown options:

View Details
Edit Organization
Suspend Organization / Activate Organization
Delete Organization

Each action must work as a prototype interaction.

Suspend:
Show confirmation modal:
“Are you sure you want to suspend this organization?”

Buttons:
Cancel
Suspend Organization

After confirmation:
- status changes to Suspended
- Active filter removes it
- Suspended filter includes it
- All count remains correct
- show success toast.

Activate should work similarly.

Delete:
Show a stronger confirmation modal.

==================================================
7. EDIT ORGANIZATION
==================================================

Clicking Edit Organization should open the same form with existing organization data pre-filled.

Allow editing:
- Organization Name
- City
- Address
- Contact Person
- Email
- Phone
- Plan
- Status

Save Changes should:
- update the displayed organization data
- close the form
- show:
“Organization updated successfully”

==================================================
8. PLAN FILTER / DATA BEHAVIOR
==================================================

Make organization information feel realistic.

Use different plans:
- Trial
- Business
- Enterprise

Use different organization statuses:
- Active
- Trial
- Suspended

Make all numbers realistic and different.

Example organizations:
TCS Pune Campus
Infosys BPM Ltd
Wipro Technologies
Cognizant Hinjewadi
Capgemini India
Accenture Pune
Tech Mahindra
Persistent Systems

Do not make every organization identical.

==================================================
9. PAGINATION
==================================================

Add functional pagination.

Example:

← Previous
1
2
3
4
Next →

Changing pages should change the visible organizations.

Pagination must work together with:
- status filters
- search

Disable Previous on first page.
Disable Next on last page.

==================================================
10. EMPTY STATES
==================================================

When filters/search produce no results, show a clean empty state:

“No organizations found”

Supporting text:
“Try changing your search or filter.”

Button:
“Clear Filters”

Clicking Clear Filters resets:
- search
- status filter
- pagination

==================================================
11. TOAST NOTIFICATIONS
==================================================

Use lightweight toast notifications for actions:

Organization created successfully
Organization updated successfully
Organization suspended successfully
Organization activated successfully
Organization deleted successfully

Toasts should:
- slide/fade in
- remain visible briefly
- disappear smoothly
- not block the interface.

==================================================
12. MICRO-ANIMATIONS
==================================================

Add subtle professional animations only.

Use:
- 150–250ms hover transitions
- filter tab transition
- search result transition
- modal fade + slight scale
- dropdown fade/slide
- toast slide-in
- button press feedback
- table row hover
- loading skeleton when appropriate

Avoid:
- excessive bouncing
- flashy animations
- unnecessary moving elements
- distracting effects

The product should feel like a professional enterprise SaaS application.

==================================================
13. LOADING STATES
==================================================

For prototype realism, include skeleton/loading states for:
- organization table
- organization details
- add/edit form submission

Example:
When opening Organization Details:
show a very short skeleton/loading transition before content appears.

==================================================
14. RESPONSIVE DESIGN
==================================================

Make the Organizations page FULLY RESPONSIVE.

DESKTOP:
- full table
- comfortable spacing
- all columns visible where possible

TABLET:
- intelligently reduce spacing
- maintain readability
- allow horizontal table scrolling if necessary

MOBILE:
Do NOT simply shrink the desktop table.

Transform organization rows into responsive organization cards.

Each card should show:
- Organization name
- City
- Status
- Plan
- Employees
- Drivers
- Vehicles
- Active Trips
- View button
- Actions menu

Search and filter controls should stack vertically on mobile.

Add Organization button should become full-width or appropriately sized.

Modals/forms must fit mobile screens.

Ensure:
- no text clipping
- no overlapping
- no horizontal page overflow
- touch-friendly buttons
- minimum comfortable touch targets

==================================================
15. ACCESSIBILITY AND CLARITY
==================================================

Keep the interface extremely clear.

Use:
- strong visual hierarchy
- readable text
- consistent spacing
- clear button labels
- sufficient contrast
- clear status colors
- intuitive icons

Do not overcrowd the screen.

==================================================
16. PROTOTYPE FLOW
==================================================

Create a realistic end-to-end interaction flow:

Organizations
↓
Search / Filter
↓
Select Organization
↓
View Details
↓
Edit Organization
↓
Save Changes
↓
Return to Organizations

Also:

Organizations
↓
Add Organization
↓
Fill Form
↓
Create
↓
Success Toast
↓
New Organization Appears

Also:

Organizations
↓
Actions
↓
Suspend
↓
Confirmation
↓
Status Changes
↓
Active filter updates automatically

==================================================
17. IMPORTANT DESIGN RULE
==================================================

This must look like a REAL enterprise transportation management SaaS product, not a generic Figma dashboard.

Keep the current Shivneri design language.

Prioritize:
1. clarity
2. usability
3. interactivity
4. responsive behavior
5. professional enterprise appearance

DO NOT modify the sidebar.
DO NOT modify other pages.
DO NOT redesign the entire application.

ONLY enhance the existing ORGANIZATIONS PAGE.