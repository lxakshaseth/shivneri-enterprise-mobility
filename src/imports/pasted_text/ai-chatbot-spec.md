Design and integrate an **AI-Powered Support Chatbot** into the SHIVNERI Enterprise Transport Management Platform.

The chatbot should help employees, drivers, transport managers, and administrators resolve transportation-related issues through natural-language conversation.

The experience must feel like a premium enterprise AI assistant: fast, trustworthy, simple, contextual, and deeply integrated with Shivneri's transport operations.

## 1. AI ASSISTANT IDENTITY

Name:
"Shivneri AI Assistant"

Tagline:
"Your intelligent transport support assistant"

Avatar:
Create a professional AI assistant icon using the Shivneri brand style.

The assistant should understand:

* Employee transport issues
* Ride booking
* Ride cancellation
* Driver delays
* Pickup/drop problems
* Live tracking
* ETA questions
* Driver/vehicle information
* Route issues
* SOS and safety concerns
* Lost items
* Attendance/ride history
* Billing questions
* Account/access issues
* Policy and permission questions

---

# 2. CHATBOT ENTRY POINT

Add a persistent AI assistant button to the Shivneri application.

Desktop:
Floating button in the bottom-right corner.

Button:
AI icon + "Ask Shivneri AI"

When clicked:
Open a right-side chat drawer.

Mobile:
Floating circular AI button above the bottom navigation.

---

# 3. CHAT WINDOW

Create a modern conversational interface.

Header:

Shivneri AI
● Online

"How can I help you today?"

Header actions:

* Minimize
* Expand
* Conversation history
* Close

Chat area:
User messages aligned right.
AI messages aligned left.

Use typing animation:
"Shivneri AI is thinking..."

---

# 4. WELCOME SCREEN

When the user opens the chatbot for the first time:

"Hi Akshat 👋
I'm Shivneri AI.

I can help you with rides, drivers, routes, bookings, safety, and account issues."

Quick action cards:

🚗 Track my ride
🕐 My driver is late
📍 Change pickup location
❌ Cancel my ride
📅 Book a ride
🆘 Emergency / SOS
💳 Billing issue
🔐 Account & access

Add:
"Or describe your problem below."

---

# 5. NATURAL LANGUAGE ISSUE RESOLUTION

The user should be able to type naturally.

Example:

User:
"My driver hasn't arrived yet."

AI:
"I can check your current ride."

Show a contextual ride card:

Today's Ride
Ride ID: RIDE-10482
Pickup: Wakad
Drop: Hinjewadi
Driver: Raj Kumar
Vehicle: MH12AB1234
Scheduled: 8:30 AM
Current ETA: 12 minutes

Status:
Driver is 1.8 km away.

Actions:
[Track Driver]
[Contact Driver]
[Report Delay]

---

# 6. AI ISSUE CLASSIFICATION

When a user reports an issue, visually show a subtle processing state:

Understanding issue...

Category:
Ride Delay

Priority:
Medium

Context:
Current Ride

Then generate a concise response.

Do not overwhelm the user with technical AI information.

---

# 7. CONTEXT-AWARE AI

The chatbot should use available authorized context such as:

Current user
Organization
Role
Current ride
Upcoming rides
Ride history
Driver
Vehicle
Route
Shift
Location
Previous support conversations

The UI should show when context is being used.

Example:

"Based on your current ride..."

or

"I found your upcoming ride for today."

Never expose information that the current user is not authorized to access.

---

# 8. ISSUE RESOLUTION FLOW

Create a structured resolution pattern:

USER ISSUE
↓
AI UNDERSTANDS ISSUE
↓
IDENTIFIES CONTEXT
↓
CHECKS AUTHORIZED DATA
↓
SUGGESTS SOLUTION
↓
USER CONFIRMS
↓
ACTION EXECUTED
↓
RESULT SHOWN
↓
FEEDBACK

Example:

User:
"I want to cancel today's ride."

AI:
"I found your 7:30 AM ride."

Ride card:
7:30 AM
Pune → Hinjewadi
Driver: Raj Kumar

"Would you like to cancel this ride?"

[Cancel Ride] [Keep Ride]

After confirmation:

"Your ride has been cancelled successfully."

Show:
✓ Cancellation confirmed
Ride ID: RIDE-10482

---

# 9. ACTION CONFIRMATION

For actions that change data, never execute immediately.

Show confirmation cards.

Example:

Cancel Ride?

Ride:
RIDE-10482

Date:
23 September 2026

Pickup:
Wakad

Drop:
Hinjewadi

Cancellation policy:
Cancellation is allowed before the configured cutoff.

[Confirm Cancellation]
[Go Back]

---

# 10. PERMISSION-AWARE AI

The chatbot must respect Shivneri's RBAC/ABAC authorization model.

If a user asks for something they cannot access:

AI response:

"I can't complete that request with your current access."

Reason:
"You don't have permission to modify this resource."

Action:
[Request Access]

For sensitive operations:

"Additional approval is required."

[Request Approval]

The chatbot must not bypass permissions.

---

# 11. ROLE-SPECIFIC ASSISTANCE

## Employee

Suggested actions:

* Track ride
* Book ride
* Cancel ride
* View ride history
* Report driver issue
* Report lost item
* Contact support
* SOS

## Driver

Suggested actions:

* View assigned trips
* Accept/reject trip
* Report breakdown
* Report accident
* Contact operations
* Navigation help
* Passenger verification
* Trip status help

## Transport Manager

Suggested actions:

* View delayed rides
* Find available drivers
* Check route status
* Manage transport requests
* View operational issues
* Generate reports

## Security Manager

Suggested actions:

* View SOS incidents
* Review incidents
* Emergency access
* Incident status
* Security audit

## Finance Manager

Suggested actions:

* Invoice status
* Billing issues
* Trip cost
* Payment status
* Invoice export

---

# 12. SAFETY / SOS HANDLING

If the user says:

"I am in danger"
"I need help"
"Emergency"
"Someone is threatening me"
"Accident"
"Vehicle accident"

Immediately switch to an emergency UI.

Show:

🚨 EMERGENCY SUPPORT

"Your safety is our priority."

Current Ride:
RIDE-10482

Driver:
Raj Kumar

Vehicle:
MH12AB1234

Live Location:
Available

Actions:

[Trigger SOS]
[Call Emergency Contact]
[Share Live Location]
[Contact Security]

Do not bury emergency options inside normal chatbot responses.

---

# 13. SUPPORT ESCALATION

If AI cannot resolve an issue:

"Would you like me to connect you with Shivneri Support?"

Buttons:

[Connect to Support]
[Continue with AI]

If escalated, create a support ticket.

Ticket card:

Support Ticket
#SUP-20481

Issue:
Driver delay

Priority:
Medium

Status:
Assigned to Operations

Created:
10:42 AM

Actions:
View Ticket
Add Message
Close Ticket

---

# 14. HUMAN HANDOFF

Create a seamless AI → Human support transition.

AI:

"I've shared the relevant ride details with the operations team, so you won't need to explain everything again."

Show:

Ticket #SUP-20481
Assigned Team: Transport Operations
Estimated Response: Soon

Chat continues in the same interface.

---

# 15. CONVERSATION HISTORY

Create a history panel.

Recent conversations:

Driver delay
Today · Resolved

Ride cancellation
Yesterday · Resolved

Pickup location issue
20 Sep · Resolved

Billing question
18 Sep · Escalated

Allow:
Search conversations
Filter
Delete conversation

---

# 16. AI RESPONSE UI

Support rich AI responses.

Text
Lists
Tables
Ride cards
Driver cards
Vehicle cards
Route cards
Status badges
Buttons
Links
Maps
Ticket cards
Confirmation dialogs

Example:

"Your driver is currently 4 minutes away."

Driver card:
Raj Kumar
⭐ 4.8
Vehicle: MH12AB1234
ETA: 4 min

[Track Driver]

---

# 17. AI SUGGESTIONS

After every resolved issue, show contextual suggestions.

Example:

Issue resolved ✓

"Is there anything else I can help with?"

Suggestions:
Track another ride
View ride history
Contact support
Book tomorrow's ride

---

# 18. FEEDBACK

After resolution:

"Did this resolve your issue?"

👍 Yes
👎 No

If No:

"What went wrong?"

Options:

* Answer wasn't helpful
* Issue still exists
* Need human support
* Other

Add optional text field.

---

# 19. AI TRANSPARENCY

Add subtle AI transparency.

For important answers:

"Based on your current ride information."

For actions:

"Checked against your organization's transport policy."

For authorization:

"Access evaluated using your current role and organization permissions."

Do not expose sensitive internal policy rules.

---

# 20. AI CONFIDENCE / UNCERTAINTY

When the assistant is uncertain:

"I'm not completely sure about this. I can connect you with the transport operations team."

Actions:

[Contact Support]
[Try Another Question]

Never present uncertain information as confirmed facts.

---

# 21. ADMIN AI ASSISTANT

Create an enhanced AI assistant for administrators.

Example prompts:

"Show me today's delayed rides."

"Which vehicles have low utilization?"

"Show unresolved SOS incidents."

"Why was this access request denied?"

"Summarize today's transport operations."

"Find drivers whose documents expire soon."

"Explain this policy decision."

"Show this month's transport cost."

Display results using charts, tables and cards rather than only text.

---

# 22. AI OPERATIONS INSIGHTS

Admin chatbot can generate:

Daily Operations Summary

Trips:
1,284

Completed:
1,231

Delayed:
38

Cancelled:
15

SOS:
2

Average delay:
7.4 min

Then:

"Key observations"

• 3 routes experienced repeated delays.
• Vehicle utilization is lower during afternoon hours.
• 2 incidents require follow-up.

Provide:
[View Operations Dashboard]

---

# 23. CHATBOT SEARCH / COMMAND EXPERIENCE

Add command-style input.

Placeholder:

"Ask anything about your transportation..."

Examples:

"Where is my driver?"
"Why was my ride cancelled?"
"Show my upcoming rides"
"Report a vehicle problem"
"Create a support ticket"

Use slash-style suggestions:

/track
/book
/cancel
/report
/support
/incident

---

# 24. ERROR STATES

Design:

AI unavailable
Network error
Data unavailable
Permission denied
Session expired
Action failed
Action requires approval
Human support unavailable

Example:

"Unable to retrieve live ride information right now."

[Retry]

---

# 25. MOBILE CHATBOT

Design a full-screen mobile AI assistant.

Top:
Shivneri AI
Online

Chat area

Bottom:
Text input
Attachment
Voice input
Send

Quick actions above input.

Allow voice-style interaction UI.

---

# 26. VISUAL DESIGN

Use the existing Shivneri design system.

Colors:
Deep navy
Royal blue
Cyan/teal
White
Light gray

Use red only for emergency/SOS states.

AI messages should have a subtle branded AI indicator.

Use:

* Rounded cards
* Soft borders
* Minimal shadows
* Clean typography
* Smooth transitions
* Modern enterprise UI
* Consistent spacing

---

# 27. PROTOTYPE FLOWS

Create clickable prototypes for:

FLOW 1:
Open AI → Ask "Where is my driver?" → Retrieve ride → Show live ETA

FLOW 2:
Ask "Cancel my ride" → Find ride → Confirm → Cancel → Success

FLOW 3:
Report driver delay → AI identifies ride → Check status → Create ticket → Support escalation

FLOW 4:
"Something is wrong" → AI identifies emergency → Emergency UI → SOS → Security notification

FLOW 5:
Admin → Ask "Show delayed rides" → AI retrieves data → Display table → Open ride

FLOW 6:
Permission denied → Explain reason → Request Access → Approval workflow

FLOW 7:
AI cannot resolve → Human handoff → Create ticket → Continue conversation

---

# 28. FIGMA COMPONENTS

Create reusable components:

AIChatButton
AIChatDrawer
AIMessage
UserMessage
TypingIndicator
QuickAction
AIInput
SuggestionChip
RideCard
DriverCard
VehicleCard
RouteCard
TicketCard
ConfirmationCard
PermissionDeniedCard
ApprovalRequiredCard
EmergencyCard
SupportEscalationCard
FeedbackCard
ConversationHistory
AIInsightCard

Use Auto Layout and component variants.

Create states:

Default
Hover
Active
Loading
Success
Error
Disabled
Permission Denied
Requires Approval
Emergency

---

# 29. FINAL PRODUCT EXPERIENCE

The final chatbot should feel like a **deeply integrated AI transportation support and operations assistant**, not a generic ChatGPT clone.

It should:

* Understand natural language
* Use authorized Shivneri context
* Resolve common issues
* Execute approved actions
* Respect RBAC/ABAC
* Explain access decisions
* Escalate unresolved issues
* Handle emergencies prominently
* Create support tickets
* Provide operational insights
* Maintain conversation history
* Provide feedback collection

The AI assists users and operations, while authorization and security rules remain deterministic and enforced by the backend.

Make the final Figma prototype polished enough for an enterprise product demo and hackathon presentation.
