# LocalSwap MVP Specification
## Hyper-Local Bartering Marketplace

**Version:** 1.0
**Last Updated:** January 2026
**Status:** MVP Definition

---

## 1. Product Summary

LocalSwap is a hyper-local bartering marketplace that enables neighbors to trade goods and services without money. The platform prioritizes simplicity for non-technical users, safety through verified identities and transparent reputation, and trust via peer reviews and community accountability. Users can browse nearby listings, propose structured trades, negotiate through offer cards, schedule safe meetups, and build reputation through completed swaps. A unique Traveler Mode allows temporary visitors to participate in local communities. The MVP targets a single metro area, focusing on core swap functionality, trust infrastructure, and safety features before expanding to payments, shipping, or advanced verification.

---

## 2. Target Users (Personas)

### 2.1 Maria — The Busy Parent

**Demographics:** 38, mother of two, works part-time, suburban neighborhood

**Goals:**
- Declutter kids' outgrown toys and clothes quickly
- Find items for upcoming needs without spending money
- Complete trades during limited free time windows

**Pain Points:**
- No time to manage complex negotiations
- Frustrated by flaky buyers on existing marketplaces
- Worried about strangers knowing her home address

**Usage Patterns:**
- Browses during lunch breaks or after kids' bedtime
- Creates listings in batches when cleaning
- Prefers weekend meetups at public locations
- Checks app 2-3 times daily for messages

**Trust Concerns:**
- Needs to see reviews before meeting anyone
- Wants public meetup suggestions
- Concerned about no-shows wasting her time

---

### 2.2 Marcus — The Hobbyist Tradesperson

**Demographics:** 52, semi-retired electrician, enjoys woodworking

**Goals:**
- Trade skills (electrical work, furniture repair) for items he needs
- Find project materials without cash outlay
- Build a local reputation as reliable service provider

**Pain Points:**
- Hard to value services vs. goods fairly
- Existing platforms focus on sales, not trades
- Skeptical of apps after being scammed before

**Usage Patterns:**
- Lists services with clear scope and time estimates
- Browses for specific materials (lumber, tools, electronics)
- Prefers detailed negotiations to clarify scope
- Active on weekday evenings

**Trust Concerns:**
- Wants to vet requesters before committing time
- Needs clear agreement on service scope
- Values detailed reviews of his work

---

### 2.3 Jordan — The Traveler

**Demographics:** 29, remote worker, stays in cities for 2-4 weeks at a time

**Goals:**
- Trade temporary items (books, gear) while traveling
- Offer skills (photography, language tutoring) for local experiences
- Connect with locals in each city

**Pain Points:**
- Existing platforms penalize non-permanent addresses
- Locals suspicious of out-of-towners
- Limited time to build trust before moving on

**Usage Patterns:**
- Sets Traveler Mode with arrival/departure dates
- Creates time-limited listings
- Browses local goods and services immediately upon arrival
- Responsive to messages (doesn't want to miss opportunities)

**Trust Concerns:**
- Wants to appear legitimate despite being temporary
- Needs quick verification to build credibility
- Prefers public, well-reviewed meetup spots

---

### 2.4 Diane — The Cautious User

**Demographics:** 67, retired teacher, lives alone, limited tech experience

**Goals:**
- Find companions for garden produce trades
- Exchange books and puzzles
- Feel safe meeting new people

**Pain Points:**
- Anxious about online strangers
- Overwhelmed by complex interfaces
- Worried about scams targeting seniors

**Usage Patterns:**
- Browses slowly, reads all reviews
- Only contacts highly-rated users
- Prefers daytime meetups at familiar locations
- Uses app sparingly, checks daily

**Trust Concerns:**
- Needs prominent trust indicators
- Wants easy blocking and reporting
- Requires simple, clear safety guidance
- Values phone support or help resources

---

### 2.5 Alex — The Young Professional

**Demographics:** 26, apartment dweller, environmentally conscious

**Goals:**
- Reduce consumption by trading instead of buying
- Find furniture and gear for small apartment
- Offer tech help in exchange for physical items

**Pain Points:**
- Limited storage means quick turnaround needed
- Previous bad experiences with marketplace ghosting
- Wants sustainable options, not another selling platform

**Usage Patterns:**
- Heavy mobile user, quick listing creation
- Uses search filters extensively
- Prefers evening or weekend trades
- Active in messaging, expects quick responses

**Trust Concerns:**
- Checks response rate and completion rate
- Values recency of reviews
- Wants confirmation/commitment features to reduce ghosting

---

## 3. User Journeys

### 3.1 Happy Path: First-Time User Creates a Listing

```
1. Download app → Onboarding carousel (3 screens: Browse, Trade, Trust)
2. Sign up with phone number → SMS verification
3. Create profile: Name, photo, neighborhood
4. Location permission prompt (explains why needed)
5. Home feed shows nearby listings
6. Tap "+" to create listing
7. Camera opens → Take/select photos
8. Guided wizard:
   - Title (with suggestions)
   - Category (visual grid)
   - Condition (tap selection)
   - Description (optional, placeholder examples)
   - What you want (categories or specific items)
   - Availability (days/times)
9. Preview → Publish
10. Listing live → Tutorial tooltip: "You'll get notified when someone makes an offer"
```

**Failure Modes:**
- Phone verification fails → Retry with different number, or email fallback
- Camera permission denied → Show manual photo upload option
- Location denied → Allow manual neighborhood selection (limited functionality warning)
- Poor photo quality → Gentle suggestion to retake with lighting tips

---

### 3.2 Happy Path: Browsing and Making an Offer

```
1. User opens app → Home feed (nearby listings, personalized)
2. Scrolls or uses search/filters
3. Taps listing → Detail view with photos, description, owner trust score
4. Taps "Make Offer"
5. Structured offer builder:
   - Select from own listings OR
   - Describe what you're offering (text + optional photo)
   - Add message (optional)
6. Review offer → Submit
7. Owner receives push notification
8. Offer appears in owner's Offers inbox with clear accept/counter/decline options
```

**Failure Modes:**
- No listings available → Helpful empty state with filter adjustment suggestions
- User has no listings to offer → Prompt to create one, or allow "I'll offer..." description
- Owner doesn't respond → Auto-reminder at 24h, offer expires at 72h with notification

---

### 3.3 Happy Path: Negotiation and Trade Completion

```
1. Owner views offer → Sees offerer's profile, trust score, proposed trade
2. Owner taps "Counter" → Adjusts terms, sends counter-offer card
3. Back-and-forth via chat with embedded offer cards (not just text)
4. Both parties reach agreement → "Accept Trade" button becomes active
5. Both confirm → Trade moves to "Scheduled" status
6. Meetup scheduler:
   - Suggest public locations nearby (with safety ratings)
   - Select date/time
   - Optional: Share live location during meetup
7. Both mark "Trade Complete" after meeting
8. Review prompt for both parties (required for reputation)
9. Reviews posted simultaneously (prevents retaliation)
```

**Failure Modes:**
- Negotiation stalls → 48h inactivity prompt, option to withdraw
- One party ghosts → Other party can mark "No Show" after scheduled time
- Dispute at meetup → In-app report with details, items frozen pending review
- Review not submitted → Reminder at 24h, 72h, then auto-completes as neutral

---

### 3.4 Happy Path: Traveler Mode Activation

```
1. User goes to Profile → Traveler Mode toggle
2. Sets:
   - Temporary location (search or map pin)
   - Radius (default: 10 miles)
   - Date range (arrival/departure)
   - Availability windows
3. Confirmation screen explains:
   - Badge will appear on profile and listings
   - Locals can filter travelers on/off
   - Extra safety prompts may appear
4. Activate → Home feed updates to new location
5. Existing listings optionally pause or transfer to traveler location
6. On departure date: Prompt to extend, or auto-deactivate
```

**Failure Modes:**
- Location too far from any active community → Warning, suggest nearby alternatives
- Date range in past → Validation error
- Overlapping with existing traveler dates → Merge or replace prompt

---

### 3.5 Unhappy Path: Report and Block

```
1. User encounters concerning behavior
2. Taps "..." menu → "Report" or "Block"
3. Report flow:
   - Select reason (categories: Scam, No-show, Harassment, Inappropriate content, Other)
   - Add details (text)
   - Attach screenshots (optional)
   - Submit
4. Confirmation: "Thanks for reporting. We'll review within 24 hours."
5. Block option: "Also block this user?" → Prevents future contact
6. Moderation team reviews → Actions: Warning, Suspension, Ban
7. Reporter notified of outcome (without details for privacy)
```

---

## 4. Information Architecture

### 4.1 Mobile App Screens

```
Root Navigation (Bottom Tabs):
├── Home (Feed)
├── Search
├── Create (+)
├── Inbox
└── Profile

Home Tab:
├── Nearby Listings Feed
├── Category Quick Filters
├── Pull-to-refresh
└── Listing Cards → Listing Detail

Search Tab:
├── Search Bar
├── Filter Panel
│   ├── Distance Slider
│   ├── Categories (multi-select)
│   ├── Condition
│   ├── Listing Type (Goods/Services/Both)
│   ├── What They Want (categories)
│   ├── Show Travelers (toggle)
│   └── Availability
├── Results Grid/List Toggle
└── Save Search

Create Tab (Wizard):
├── Photo Capture/Select
├── Title & Category
├── Condition & Description
├── What You Want
├── Availability
├── Preview
└── Publish Confirmation

Inbox Tab:
├── Offers (Received/Sent tabs)
│   ├── Offer Cards with Status
│   └── Quick Actions (Accept/Counter/Decline)
├── Messages
│   ├── Thread List
│   └── Chat View with Offer Cards
└── Scheduled Trades

Profile Tab:
├── My Profile View
│   ├── Photo, Name, Neighborhood
│   ├── Trust Score Breakdown
│   ├── Verification Badges
│   ├── My Listings
│   └── My Reviews
├── Edit Profile
├── Traveler Mode Settings
├── Safety Center
│   ├── Blocked Users
│   ├── Report History
│   └── Safety Tips
├── Settings
│   ├── Notifications
│   ├── Privacy
│   ├── Location
│   └── Account
└── Help & Support

Detail Screens:
├── Listing Detail
│   ├── Photo Gallery
│   ├── Title, Description, Condition
│   ├── What They Want
│   ├── Owner Card (tap to profile)
│   ├── Trust Indicators
│   ├── Make Offer CTA
│   └── Report/Share
├── User Profile (Other)
│   ├── Trust Score & Breakdown
│   ├── Verification Badges
│   ├── Active Listings
│   ├── Reviews
│   └── Report/Block
├── Offer Detail
│   ├── Trade Summary
│   ├── Chat Thread
│   ├── Offer Card History
│   └── Actions
└── Review Form
    ├── Star Rating
    ├── Tags (Quick feedback)
    └── Written Review
```

### 4.2 Web App Screens

```
Navigation (Top Bar + Sidebar):
├── Logo/Home
├── Search Bar
├── Create Listing
├── Inbox (with badge)
└── Profile Menu

Main Sections:
├── Home/Browse
│   ├── Map View Toggle
│   ├── Listing Grid
│   ├── Sidebar Filters
│   └── Pagination
├── Search Results
│   ├── Advanced Filters (expanded)
│   ├── Sort Options
│   └── Results with Quick Preview
├── Listing Detail (Modal or Page)
│   ├── Large Photo Gallery
│   ├── Full Description
│   ├── Owner Sidebar
│   └── Make Offer Panel
├── Create/Edit Listing
│   ├── Multi-photo Upload
│   ├── Form Fields (all visible)
│   ├── Preview Pane
│   └── Save Draft / Publish
├── Inbox
│   ├── Offers Panel
│   ├── Messages Panel
│   └── Full Chat View
├── My Listings
│   ├── Active/Paused/Completed Tabs
│   └── Bulk Actions
├── Profile
│   ├── Public View Preview
│   ├── Edit Mode
│   └── Reviews
└── Moderation (Admin)
    ├── Report Queue
    ├── User Management
    ├── Flagged Listings
    └── Analytics Dashboard
```

---

## 5. Detailed Flows

### 5.1 Create Listing Flow

**Mobile (Camera-First):**

```
Step 1: Photos
┌─────────────────────────────────┐
│  [Camera Viewfinder]            │
│                                 │
│                                 │
│      📷 Tap to capture          │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │ + │ │img│ │img│ │   │       │
│  └───┘ └───┘ └───┘ └───┘       │
│                                 │
│  [Gallery] [Skip]    [Next →]   │
└─────────────────────────────────┘
- Minimum 1 photo required
- Maximum 8 photos
- Auto-enhance suggestion for dark photos
- Reorder by drag

Step 2: Basics
┌─────────────────────────────────┐
│  What are you swapping?         │
│  ┌─────────────────────────────┐│
│  │ e.g., "Kids bicycle, 20-in" ││
│  └─────────────────────────────┘│
│                                 │
│  Category                       │
│  ┌─────┐┌─────┐┌─────┐┌─────┐  │
│  │🏠   ││👶   ││🔧   ││📚   │  │
│  │Home ││Kids ││Tools││Books│  │
│  └─────┘└─────┘└─────┘└─────┘  │
│  [See all categories]           │
│                                 │
│  Condition                      │
│  ( ) New  (•) Like New  ( ) Good│
│  ( ) Fair  ( ) For Parts        │
│                                 │
│           [← Back]    [Next →]  │
└─────────────────────────────────┘

Step 3: Details (Optional)
┌─────────────────────────────────┐
│  Add description (optional)     │
│  ┌─────────────────────────────┐│
│  │ Tips: Include brand, size,  ││
│  │ age, any flaws...           ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  ☑ This is a service offering  │
│    (not a physical item)        │
│                                 │
│           [← Back]    [Next →]  │
└─────────────────────────────────┘

Step 4: What You Want
┌─────────────────────────────────┐
│  What would you like in return? │
│                                 │
│  (•) Open to offers             │
│  ( ) Specific categories:       │
│      ☑ Kids items               │
│      ☐ Electronics              │
│      ☑ Services                 │
│  ( ) Looking for something      │
│      specific:                  │
│      ┌─────────────────────────┐│
│      │ e.g., "Guitar lessons"  ││
│      └─────────────────────────┘│
│                                 │
│           [← Back]    [Next →]  │
└─────────────────────────────────┘

Step 5: Availability
┌─────────────────────────────────┐
│  When can you meet to trade?    │
│                                 │
│  ☑ Weekday evenings             │
│  ☑ Weekends                     │
│  ☐ Weekday mornings             │
│  ☐ Flexible                     │
│                                 │
│  Preferred area:                │
│  📍 Near [Downtown / My Area]   │
│     [Change]                    │
│                                 │
│           [← Back]  [Preview →] │
└─────────────────────────────────┘

Step 6: Preview & Publish
┌─────────────────────────────────┐
│  Preview your listing           │
│  ┌─────────────────────────────┐│
│  │ [Photo carousel]            ││
│  │ Kids bicycle, 20-inch       ││
│  │ Like New • Kids             ││
│  │ Open to offers              ││
│  │ Weekends • Downtown         ││
│  └─────────────────────────────┘│
│                                 │
│  Looks good?                    │
│                                 │
│  [← Edit]        [✓ Publish]    │
└─────────────────────────────────┘
```

**Empty State (No Photos):**
```
┌─────────────────────────────────┐
│                                 │
│         📷                      │
│                                 │
│  Add photos to get started      │
│                                 │
│  Good photos = faster trades!   │
│  Tip: Natural light works best  │
│                                 │
│  [Take Photo]  [Choose Existing]│
└─────────────────────────────────┘
```

**Error State (Photo Upload Failed):**
```
┌─────────────────────────────────┐
│  ⚠️ Couldn't upload photo       │
│                                 │
│  Check your connection and try  │
│  again. Your other photos are   │
│  saved.                         │
│                                 │
│  [Try Again]  [Continue Without]│
└─────────────────────────────────┘
```

---

### 5.2 Make Offer Flow

```
Step 1: Select What You're Offering
┌─────────────────────────────────┐
│  Make an offer for:             │
│  "Kids bicycle, 20-inch"        │
│                                 │
│  What are you offering?         │
│                                 │
│  YOUR LISTINGS                  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ☐  │ │ ☐  │ │ +  │        │
│  │img1│ │img2│ │Add │        │
│  │Item│ │Item│ │New │        │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
│  — or describe your offer —     │
│  ┌─────────────────────────────┐│
│  │ e.g., "2 hours of tutoring" ││
│  └─────────────────────────────┘│
│  [+ Add photo]                  │
│                                 │
│              [Cancel] [Next →]  │
└─────────────────────────────────┘

Step 2: Add Message (Optional)
┌─────────────────────────────────┐
│  Add a message (optional)       │
│  ┌─────────────────────────────┐│
│  │ "Hi! My daughter outgrew    ││
│  │ this scooter, thought it    ││
│  │ might be a fair trade?"     ││
│  └─────────────────────────────┘│
│                                 │
│  💡 Friendly messages get 2x    │
│     more responses              │
│                                 │
│           [← Back]  [Review →]  │
└─────────────────────────────────┘

Step 3: Review & Send
┌─────────────────────────────────┐
│  Review your offer              │
│  ┌─────────────────────────────┐│
│  │ YOU OFFER        FOR        ││
│  │ ┌─────┐         ┌─────┐    ││
│  │ │sctr │   →     │bike │    ││
│  │ └─────┘         └─────┘    ││
│  │ Kids scooter    Kids bike   ││
│  └─────────────────────────────┘│
│                                 │
│  "Hi! My daughter outgrew..."   │
│                                 │
│  [← Edit]        [Send Offer →] │
└─────────────────────────────────┘

Confirmation:
┌─────────────────────────────────┐
│                                 │
│         ✓                       │
│  Offer sent!                    │
│                                 │
│  You'll get notified when       │
│  Maria responds.                │
│                                 │
│  Average response time: 4 hours │
│                                 │
│  [View Offer]  [Keep Browsing]  │
└─────────────────────────────────┘
```

---

### 5.3 Negotiate via Chat with Offer Cards

```
┌─────────────────────────────────┐
│  ← Maria                   •••  │
│  ⭐ 4.8 • 12 swaps • Verified   │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ OFFER                       ││
│  │ You → Maria                 ││
│  │ ┌─────┐    ┌─────┐         ││
│  │ │sctr │ →  │bike │         ││
│  │ └─────┘    └─────┘         ││
│  │ [Accept] [Counter] [Decline]││
│  └─────────────────────────────┘│
│                     10:30 AM    │
│                                 │
│  Hi! My daughter outgrew        │
│  this scooter, thought it       │
│  might be a fair trade?         │
│                     10:30 AM    │
│                                 │
│         ┌─────────────────────┐ │
│         │ That looks great!   │ │
│         │ Would you throw in  │ │
│         │ the helmet too?     │ │
│         └─────────────────────┘ │
│                     10:45 AM    │
│                                 │
│  ┌─────────────────────────────┐│
│  │ COUNTER-OFFER               ││
│  │ Maria → You                 ││
│  │ ┌─────┐    ┌─────┐         ││
│  │ │sctr │ →  │bike │         ││
│  │ │+hlmt│    └─────┘         ││
│  │ └─────┘                     ││
│  │ [Accept] [Counter] [Decline]││
│  └─────────────────────────────┘│
│                     10:47 AM    │
│                                 │
├─────────────────────────────────┤
│ ┌─────────────────────────┐ 📷 │
│ │ Type a message...       │    │
│ └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Offer Card States:**
- **Pending:** Awaiting response (yellow border)
- **Countered:** Modified terms (blue border)
- **Accepted:** Both parties agreed (green border, actions become "Schedule Meetup")
- **Declined:** Rejected (gray, collapsed)
- **Expired:** No response in 72h (gray, "Offer expired")

---

### 5.4 Schedule Meetup Flow

```
After offer accepted:
┌─────────────────────────────────┐
│         🎉                      │
│  Trade agreed!                  │
│                                 │
│  Now let's schedule a safe      │
│  place to meet.                 │
│                                 │
│  [Schedule Meetup]              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Schedule meetup with Maria     │
│                                 │
│  SUGGESTED SAFE SPOTS           │
│  📍 Starbucks - Main St         │
│     0.3 mi • Well-lit • Busy    │
│  📍 Library - Downtown          │
│     0.5 mi • Public • Cameras   │
│  📍 Police Station Lobby        │
│     0.8 mi • Safest option      │
│  [📍 Suggest different spot]    │
│                                 │
│  WHEN                           │
│  ┌─────────────────────────────┐│
│  │ Sat, Jan 18 │ 2:00 PM      ││
│  └─────────────────────────────┘│
│  Maria is available: Weekends   │
│                                 │
│  🛡️ Safety tip: Meet in public, │
│  tell someone where you're      │
│  going, trust your instincts.   │
│                                 │
│              [Send to Maria →]  │
└─────────────────────────────────┘

Confirmation shown to both:
┌─────────────────────────────────┐
│  MEETUP SCHEDULED               │
│                                 │
│  📍 Starbucks - Main St         │
│  📅 Sat, Jan 18 at 2:00 PM      │
│                                 │
│  [Add to Calendar]              │
│  [Get Directions]               │
│  [Share Location During Meetup] │
│                                 │
│  After you meet:                │
│  [Mark Trade Complete]          │
└─────────────────────────────────┘
```

---

### 5.5 Complete Trade and Review Flow

```
After meetup time:
┌─────────────────────────────────┐
│  Did you complete your trade    │
│  with Maria?                    │
│                                 │
│  [✓ Yes, completed]             │
│  [✗ There was a problem]        │
│  [📅 We rescheduled]            │
└─────────────────────────────────┘

If completed:
┌─────────────────────────────────┐
│         🎉                      │
│  Congratulations!               │
│                                 │
│  You completed your swap        │
│  with Maria.                    │
│                                 │
│  Help others by leaving a       │
│  review.                        │
│                                 │
│  [Leave Review]                 │
└─────────────────────────────────┘

Review Form:
┌─────────────────────────────────┐
│  How was your swap with Maria?  │
│                                 │
│  ⭐⭐⭐⭐⭐                        │
│  [1] [2] [3] [4] [5]           │
│                                 │
│  Quick tags (select all that    │
│  apply):                        │
│  [On time] [Friendly]           │
│  [Item as described]            │
│  [Good communication]           │
│  [Would swap again]             │
│                                 │
│  Add details (optional):        │
│  ┌─────────────────────────────┐│
│  │ "Maria was great! Bike was  ││
│  │ exactly as shown..."        ││
│  └─────────────────────────────┘│
│                                 │
│  Note: Reviews are posted at    │
│  the same time to ensure        │
│  fairness.                      │
│                                 │
│           [Submit Review]       │
└─────────────────────────────────┘
```

---

### 5.6 Report Flow

```
┌─────────────────────────────────┐
│  Report this user               │
│                                 │
│  What happened?                 │
│                                 │
│  ○ Didn't show up               │
│  ○ Item not as described        │
│  ○ Scam or fraud attempt        │
│  ○ Harassment or threats        │
│  ○ Inappropriate content        │
│  ○ Other                        │
│                                 │
│              [Cancel] [Next →]  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Tell us more                   │
│  ┌─────────────────────────────┐│
│  │ Please describe what        ││
│  │ happened...                 ││
│  │                             ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  Add evidence (optional):       │
│  [+ Screenshot] [+ Photo]       │
│                                 │
│  ☑ Also block this user        │
│    (they won't be able to      │
│    contact you)                 │
│                                 │
│           [← Back] [Submit →]   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│         ✓                       │
│  Report submitted               │
│                                 │
│  Thank you for helping keep     │
│  LocalSwap safe.                │
│                                 │
│  Our team will review within    │
│  24 hours. We'll notify you     │
│  of the outcome.                │
│                                 │
│  [Done]                         │
└─────────────────────────────────┘
```

---

## 6. Data Model

### 6.1 Entity Relationship Diagram (Conceptual)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│   Listing   │────<│ListingPhoto │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │     ┌─────────────┤
       │     │             │
       ▼     ▼             ▼
┌─────────────┐     ┌─────────────┐
│   Profile   │     │    Offer    │────<┌─────────────┐
└─────────────┘     └─────────────┘     │  OfferItem  │
       │                   │            └─────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│Verification │     │ ChatThread  │────<┌─────────────┐
└─────────────┘     └─────────────┘     │   Message   │
       │                                └─────────────┘
       │            ┌─────────────┐
       │            │   Review    │
       │            └─────────────┘
       │
       ▼            ┌─────────────┐
┌─────────────┐     │   Report    │
│  Traveler   │     └─────────────┘
│  Profile    │
└─────────────┘     ┌─────────────┐
                    │    Block    │
┌─────────────┐     └─────────────┘
│  Location   │
└─────────────┘
```

### 6.2 Entity Definitions

#### User
```
User {
  id: UUID (PK)
  phone: String (unique, encrypted)
  email: String? (unique, encrypted)
  password_hash: String
  created_at: Timestamp
  updated_at: Timestamp
  last_active_at: Timestamp
  status: Enum [active, suspended, banned, deleted]
  role: Enum [user, moderator, admin]
}
Indexes: phone, email, status, last_active_at
```

#### Profile
```
Profile {
  id: UUID (PK)
  user_id: UUID (FK → User, unique)
  display_name: String (max 50)
  avatar_url: String?
  bio: String? (max 500)
  neighborhood: String

  // Computed trust metrics (cached, recalculated on events)
  trust_score: Decimal (0.00-5.00)
  completed_swaps: Integer
  response_rate: Decimal (0.00-1.00)
  response_time_avg_hours: Decimal?

  // Settings
  notifications_enabled: Boolean
  location_sharing_enabled: Boolean

  created_at: Timestamp
  updated_at: Timestamp
}
Indexes: user_id, neighborhood, trust_score
```

#### Verification
```
Verification {
  id: UUID (PK)
  user_id: UUID (FK → User)
  type: Enum [phone, email, id_document, social_facebook, social_google]
  status: Enum [pending, verified, failed, expired]
  verified_at: Timestamp?
  expires_at: Timestamp?
  metadata: JSONB (encrypted, verification-specific data)
  created_at: Timestamp
}
Indexes: user_id, type, status
Constraint: Unique(user_id, type)
```

#### Location
```
Location {
  id: UUID (PK)
  user_id: UUID (FK → User)
  type: Enum [home, traveler]
  latitude: Decimal
  longitude: Decimal
  geohash: String (for efficient geo queries)
  city: String
  neighborhood: String?
  radius_miles: Decimal (default: 10)
  is_active: Boolean
  created_at: Timestamp
  updated_at: Timestamp
}
Indexes: user_id, geohash, is_active, type
Spatial Index: (latitude, longitude)
```

#### TravelerProfile
```
TravelerProfile {
  id: UUID (PK)
  user_id: UUID (FK → User, unique when active)
  location_id: UUID (FK → Location)
  start_date: Date
  end_date: Date
  availability_windows: JSONB [{day: String, start: Time, end: Time}]
  is_active: Boolean
  created_at: Timestamp
  updated_at: Timestamp
}
Indexes: user_id, is_active, start_date, end_date
```

#### Listing
```
Listing {
  id: UUID (PK)
  user_id: UUID (FK → User)
  location_id: UUID (FK → Location)

  title: String (max 100)
  description: String? (max 2000)
  category: Enum [household, kids, electronics, clothing, books, sports, tools, garden, services, other]
  subcategory: String?
  condition: Enum [new, like_new, good, fair, for_parts]? (null for services)
  is_service: Boolean

  // What they want in return
  wants_type: Enum [open, categories, specific]
  wants_categories: String[]?
  wants_description: String?

  // Availability
  availability: JSONB [{day: String, time_of_day: String}]
  preferred_meetup_area: String?

  // Status
  status: Enum [draft, active, paused, traded, deleted]

  // Denormalized for search
  photo_count: Integer
  primary_photo_url: String?

  created_at: Timestamp
  updated_at: Timestamp
  expires_at: Timestamp? (for traveler listings)
}
Indexes: user_id, status, category, created_at
Spatial Index via location_id join
Full-text Index: title, description
```

#### ListingPhoto
```
ListingPhoto {
  id: UUID (PK)
  listing_id: UUID (FK → Listing)
  url: String
  thumbnail_url: String
  position: Integer (for ordering)
  created_at: Timestamp
}
Indexes: listing_id, position
```

#### Offer
```
Offer {
  id: UUID (PK)
  listing_id: UUID (FK → Listing) // What they want
  offerer_id: UUID (FK → User)
  owner_id: UUID (FK → User) // Listing owner

  status: Enum [pending, countered, accepted, declined, expired, completed, disputed, cancelled]

  // Offer details
  message: String? (max 500)

  // Scheduling (after acceptance)
  meetup_location: String?
  meetup_latitude: Decimal?
  meetup_longitude: Decimal?
  meetup_time: Timestamp?

  // Completion tracking
  offerer_completed: Boolean
  owner_completed: Boolean
  completed_at: Timestamp?

  parent_offer_id: UUID? (FK → Offer, for counter-offers)

  created_at: Timestamp
  updated_at: Timestamp
  expires_at: Timestamp
}
Indexes: listing_id, offerer_id, owner_id, status, created_at
```

#### OfferItem
```
OfferItem {
  id: UUID (PK)
  offer_id: UUID (FK → Offer)

  // Either a listing or a description
  listing_id: UUID? (FK → Listing)
  description: String? (max 500)
  photo_url: String?

  created_at: Timestamp
}
Indexes: offer_id, listing_id
```

#### ChatThread
```
ChatThread {
  id: UUID (PK)
  offer_id: UUID (FK → Offer, unique)
  participant_ids: UUID[] (exactly 2)

  last_message_at: Timestamp
  last_message_preview: String (max 100)

  // Unread tracking per participant
  unread_counts: JSONB {user_id: count}

  created_at: Timestamp
  updated_at: Timestamp
}
Indexes: offer_id, participant_ids (GIN), last_message_at
```

#### Message
```
Message {
  id: UUID (PK)
  thread_id: UUID (FK → ChatThread)
  sender_id: UUID (FK → User)

  type: Enum [text, offer_card, image, system]
  content: String (max 2000)
  metadata: JSONB? (for offer cards, images, etc.)

  read_at: Timestamp?

  created_at: Timestamp
}
Indexes: thread_id, sender_id, created_at
```

#### Review
```
Review {
  id: UUID (PK)
  offer_id: UUID (FK → Offer)
  reviewer_id: UUID (FK → User)
  reviewee_id: UUID (FK → User)

  rating: Integer (1-5)
  tags: String[] (e.g., ["on_time", "friendly", "as_described"])
  comment: String? (max 1000)

  // Visibility control
  is_visible: Boolean (both reviews must be submitted before visible)

  created_at: Timestamp
}
Indexes: reviewee_id, reviewer_id, offer_id, rating, created_at
Constraint: Unique(offer_id, reviewer_id)
```

#### Report
```
Report {
  id: UUID (PK)
  reporter_id: UUID (FK → User)
  reported_user_id: UUID (FK → User)
  reported_listing_id: UUID? (FK → Listing)
  offer_id: UUID? (FK → Offer)

  reason: Enum [no_show, not_as_described, scam, harassment, inappropriate_content, other]
  description: String (max 2000)
  evidence_urls: String[]?

  status: Enum [pending, reviewing, resolved_warning, resolved_suspension, resolved_ban, resolved_dismissed]
  moderator_id: UUID? (FK → User)
  resolution_notes: String?
  resolved_at: Timestamp?

  created_at: Timestamp
  updated_at: Timestamp
}
Indexes: reporter_id, reported_user_id, status, created_at
```

#### Block
```
Block {
  id: UUID (PK)
  blocker_id: UUID (FK → User)
  blocked_id: UUID (FK → User)
  created_at: Timestamp
}
Indexes: blocker_id, blocked_id
Constraint: Unique(blocker_id, blocked_id)
```

---

## 7. API and Backend Architecture

### 7.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│   │  iOS App    │  │ Android App │  │   Web App   │        │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
└──────────┼────────────────┼────────────────┼────────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                            │
│            (Rate Limiting, Auth, Routing)                   │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Auth     │  │  Listings   │  │   Offers    │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    Chat     │  │   Reviews   │  │   Trust     │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Location   │  │ Moderation  │  │Notification │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  PostgreSQL │  │    Redis    │  │     S3      │         │
│  │  (Primary)  │  │   (Cache)   │  │  (Images)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Tech Stack Recommendation

- **API:** Next.js API Routes (already scaffolded)
- **Database:** PostgreSQL with PostGIS extension
- **Cache:** Redis (session, rate limiting, real-time)
- **File Storage:** S3 or Cloudflare R2
- **Real-time:** WebSockets via Socket.io or Pusher
- **Push Notifications:** Firebase Cloud Messaging
- **SMS:** Twilio
- **Search:** PostgreSQL full-text (MVP), Elasticsearch (V2)

### 7.3 API Endpoints

#### Authentication
```
POST   /api/auth/send-code        # Send SMS verification code
POST   /api/auth/verify-code      # Verify code, create session
POST   /api/auth/refresh          # Refresh access token
POST   /api/auth/logout           # Invalidate session
DELETE /api/auth/account          # Delete account (soft delete)
```

#### Users & Profiles
```
GET    /api/users/me              # Current user profile
PATCH  /api/users/me              # Update profile
GET    /api/users/:id             # Public profile
GET    /api/users/:id/listings    # User's active listings
GET    /api/users/:id/reviews     # User's reviews
POST   /api/users/me/avatar       # Upload avatar
```

#### Verification
```
POST   /api/verification/phone/send    # Send phone verification
POST   /api/verification/phone/verify  # Verify phone
POST   /api/verification/email/send    # Send email verification
POST   /api/verification/email/verify  # Verify email
```

#### Location
```
GET    /api/location/current      # Get current active location
POST   /api/location              # Set/update location
DELETE /api/location/:id          # Remove location
```

#### Traveler Mode
```
GET    /api/traveler              # Get traveler profile
POST   /api/traveler              # Activate traveler mode
PATCH  /api/traveler              # Update traveler settings
DELETE /api/traveler              # Deactivate traveler mode
```

#### Listings
```
GET    /api/listings              # Search/browse listings
       ?lat=&lng=&radius=         # Geo filter
       &category=                 # Category filter
       &condition=                # Condition filter
       &is_service=               # Service filter
       &include_travelers=        # Include traveler listings
       &sort=                     # Sort: recent, distance, relevance
       &page=&limit=              # Pagination

GET    /api/listings/:id          # Listing detail
POST   /api/listings              # Create listing
PATCH  /api/listings/:id          # Update listing
DELETE /api/listings/:id          # Delete listing (soft)
POST   /api/listings/:id/photos   # Upload photos
DELETE /api/listings/:id/photos/:photoId  # Remove photo
PATCH  /api/listings/:id/status   # Change status (pause, activate)
```

#### Offers
```
GET    /api/offers                # My offers (sent and received)
       ?type=sent|received        # Filter by direction
       &status=                   # Filter by status

GET    /api/offers/:id            # Offer detail
POST   /api/offers                # Create offer
POST   /api/offers/:id/counter    # Counter-offer
POST   /api/offers/:id/accept     # Accept offer
POST   /api/offers/:id/decline    # Decline offer
POST   /api/offers/:id/cancel     # Cancel my offer
POST   /api/offers/:id/schedule   # Schedule meetup
POST   /api/offers/:id/complete   # Mark my side complete
```

#### Chat
```
GET    /api/threads               # My chat threads
GET    /api/threads/:id           # Thread with messages
POST   /api/threads/:id/messages  # Send message
PATCH  /api/threads/:id/read      # Mark as read
```

#### Reviews
```
GET    /api/reviews               # My reviews (given and received)
POST   /api/reviews               # Submit review
GET    /api/offers/:id/review     # Get review for offer
```

#### Reports & Blocks
```
POST   /api/reports               # Submit report
GET    /api/blocks                # My blocked users
POST   /api/blocks                # Block user
DELETE /api/blocks/:userId        # Unblock user
```

#### Moderation (Admin)
```
GET    /api/admin/reports         # Report queue
PATCH  /api/admin/reports/:id     # Update report status
GET    /api/admin/users/:id       # User details for moderation
POST   /api/admin/users/:id/warn  # Issue warning
POST   /api/admin/users/:id/suspend  # Suspend user
POST   /api/admin/users/:id/ban   # Ban user
GET    /api/admin/listings/flagged  # Flagged listings
```

### 7.4 Non-Functional Requirements

#### Rate Limiting
```
Unauthenticated:
- Auth endpoints: 5 req/min per IP
- Public reads: 60 req/min per IP

Authenticated:
- General: 120 req/min per user
- Messaging: 30 messages/min per user
- Listing creation: 10/hour per user
- Offer creation: 20/hour per user

New accounts (< 7 days):
- Messaging: 10 messages/day
- Offers: 5/day
```

#### Audit Logging
```
Log all:
- Authentication events
- Listing create/update/delete
- Offer state changes
- Messages (metadata only, not content)
- Reports and moderation actions
- Account changes

Retention: 2 years for disputes
```

#### Notification Events
```
Push/Email triggers:
- New offer received
- Offer accepted/declined/countered
- New message
- Meetup reminder (2h before)
- Review received
- Account verification status
- Moderation action on your account
- Listing expiring (travelers)
```

---

## 8. MVP Scope and Roadmap

### 8.1 MVP (Launch) — Must Have

**Core Functionality:**
- [ ] Phone-based signup and authentication
- [ ] Profile creation with photo and neighborhood
- [ ] Browse nearby listings (geo-filtered)
- [ ] Basic search with category and distance filters
- [ ] Create listing (photo, title, category, condition, wants)
- [ ] View listing detail with owner info
- [ ] Make structured offer (select own listings or describe)
- [ ] Offer inbox (received/sent)
- [ ] Accept, decline, or counter offers
- [ ] In-app messaging with offer cards
- [ ] Schedule meetup with location and time
- [ ] Mark trade complete (both parties)
- [ ] Two-sided reviews (simultaneous reveal)
- [ ] Basic trust score display
- [ ] Report user/listing
- [ ] Block user

**Traveler Mode:**
- [ ] Set temporary location with date range
- [ ] Traveler badge on profile and listings
- [ ] Filter travelers on/off in search

**Safety:**
- [ ] Phone verification required
- [ ] In-app messaging only (no exposed contact info)
- [ ] Public meetup spot suggestions
- [ ] Rate limiting for new accounts

**Platform:**
- [ ] Mobile app (React Native or Flutter) - iOS priority
- [ ] Web app (responsive, core flows)

### 8.2 V1 (Weeks 1-10 Post-Launch)

**Enhanced Discovery:**
- [ ] Saved searches with notifications
- [ ] "Wanted" listings (what you're looking for)
- [ ] Matching suggestions (your wants → their haves)
- [ ] Recently viewed
- [ ] Nearby activity feed

**Improved Trust:**
- [ ] Email verification option
- [ ] Response rate and time display
- [ ] Detailed trust score breakdown
- [ ] Badge system (Verified, Reliable, Top Swapper)

**Better Negotiation:**
- [ ] Multi-item offers (bundles)
- [ ] Offer templates
- [ ] Quick responses / suggested messages

**Scheduling:**
- [ ] Calendar integration
- [ ] Recurring availability settings
- [ ] Reschedule flow

**Safety Enhancements:**
- [ ] Optional live location sharing during meetup
- [ ] Safety check-in prompt after scheduled meetup time
- [ ] Enhanced moderation tools

**Android Launch**

### 8.3 V2 (Future)

**Explicitly Excluded from MVP:**
- Payments / monetary transactions
- Shipping / non-local trades
- Advanced ID verification (government ID)
- Escrow services
- Social features (following, public activity)
- Gamification (beyond basic badges)
- Business/merchant accounts
- Multi-city expansion
- API for third-party integrations

**V2 Features to Consider:**
- Community groups/circles
- Event-based swaps (neighborhood swap meets)
- Verified ID program
- Insurance/guarantee program
- Charitable donation option for unclaimed items
- Accessibility improvements (screen reader, high contrast)
- Localization/i18n

---

## 9. UI Style Direction

### 9.1 Design Principles

1. **Friendly & Approachable:** Warm, community-oriented feel
2. **Clear & Uncluttered:** Non-technical users should never feel lost
3. **Trust-Forward:** Trust signals visible but not overwhelming
4. **Safe & Secure:** Safety features integrated naturally, not scary

### 9.2 Color Palette

```
Primary:     #2D7D46 (Forest Green - trust, community, growth)
Secondary:   #F5A623 (Warm Amber - friendly, approachable)
Background:  #FAFAFA (Light gray - clean, easy on eyes)
Surface:     #FFFFFF (White - cards, inputs)
Text:        #1A1A1A (Near black - high contrast)
Text Muted:  #6B7280 (Gray - secondary info)
Success:     #10B981 (Green - completed, verified)
Warning:     #F59E0B (Amber - attention needed)
Error:       #EF4444 (Red - errors, urgent)
Trust:       #3B82F6 (Blue - verification badges)
```

### 9.3 Typography

```
Font Family: Inter (system fallback: -apple-system, SF Pro)
- Clean, highly legible at all sizes
- Excellent for mobile

Sizes:
- Display:   32px / 40px line-height (headings)
- Title:     24px / 32px (section headers)
- Body:      16px / 24px (primary content)
- Caption:   14px / 20px (secondary info)
- Small:     12px / 16px (badges, timestamps)

Weights:
- Regular (400): Body text
- Medium (500): Emphasis, buttons
- Semibold (600): Headings, important labels
```

### 9.4 Component Recommendations

**Mobile Navigation:**
- Bottom tab bar (5 tabs max)
- Floating action button for Create (+)
- Pull-to-refresh on feeds
- Swipe gestures for quick actions

**Cards:**
- Rounded corners (12px)
- Subtle shadow (elevation)
- Photo-forward layout
- Trust indicators in corner

**Buttons:**
- Primary: Filled, green
- Secondary: Outlined
- Large touch targets (min 44px)
- Clear loading states

**Forms:**
- Large inputs (48px height)
- Clear labels above fields
- Inline validation
- Progress indicators for wizards

**Trust Indicators:**
```
┌──────────────────┐
│ ⭐ 4.8 • 12 swaps │  Compact (cards)
└──────────────────┘

┌────────────────────────────┐
│ ⭐ 4.8  │  12   │  98%    │  Expanded (profile)
│ Rating │ Swaps │ Response │
│         │       │         │
│ ✓ Phone Verified          │
│ 🌍 Traveler (until Jan 20)│
└────────────────────────────┘
```

### 9.5 Web Layout

- Max content width: 1200px
- Sidebar filters on search (collapsible)
- Modal dialogs for quick actions
- Split view for messages (list + thread)

---

## 10. Analytics and Success Metrics

### 10.1 Key Events to Track

**Acquisition:**
- `app_open` - App launched
- `onboarding_started` - Begin onboarding
- `onboarding_completed` - Finish onboarding
- `signup_started` - Begin signup
- `signup_completed` - Account created
- `phone_verified` - Phone verification complete

**Activation:**
- `first_listing_created` - Created first listing
- `first_offer_sent` - Sent first offer
- `first_offer_received` - Received first offer
- `first_message_sent` - Sent first message
- `first_swap_completed` - Completed first trade

**Engagement:**
- `listing_viewed` - Viewed a listing
- `listing_created` - Created listing (with category, is_service)
- `search_performed` - Searched (with filters used)
- `offer_sent` - Sent offer
- `offer_received` - Received offer
- `offer_accepted` - Offer accepted
- `offer_declined` - Offer declined
- `offer_countered` - Counter-offer sent
- `message_sent` - Message sent
- `meetup_scheduled` - Scheduled meetup
- `swap_completed` - Trade completed
- `review_submitted` - Review submitted

**Trust & Safety:**
- `report_submitted` - Report filed
- `user_blocked` - User blocked
- `verification_completed` - Verification completed (type)

**Traveler:**
- `traveler_mode_activated` - Traveler mode on
- `traveler_mode_deactivated` - Traveler mode off
- `traveler_listing_created` - Listing created while in traveler mode

### 10.2 Key Performance Indicators (KPIs)

**Primary Metrics:**

| Metric | Definition | Target (MVP) |
|--------|------------|--------------|
| Offer-to-Swap Conversion | % of offers that result in completed swap | > 25% |
| Time to First Swap | Days from signup to first completed swap | < 14 days |
| Swap Completion Rate | % of accepted offers that complete | > 80% |
| Weekly Active Swappers | Users with ≥1 completed swap in week | Growth 10% WoW |

**Engagement Metrics:**

| Metric | Definition | Target |
|--------|------------|--------|
| D7 Retention | % of new users active on day 7 | > 30% |
| D30 Retention | % of new users active on day 30 | > 15% |
| Listings per Active User | Avg active listings per WAU | > 2 |
| Response Rate | % of offers responded to in 24h | > 70% |
| Messages per Thread | Avg messages before resolution | < 10 |

**Trust & Safety Metrics:**

| Metric | Definition | Target |
|--------|------------|--------|
| Reports per 1k Messages | Report rate | < 5 |
| No-Show Rate | % of scheduled meetups marked no-show | < 10% |
| Dispute Rate | % of completed swaps with disputes | < 2% |
| Block Rate | % of users who block someone | < 5% |

**Traveler Metrics:**

| Metric | Definition | Target |
|--------|------------|--------|
| Traveler Activation Rate | % of users who try traveler mode | > 5% |
| Traveler Swap Success | Swap completion rate for travelers | > 20% |

### 10.3 Dashboards

**Daily Operations:**
- New signups
- Listings created
- Offers sent/received
- Swaps completed
- Reports pending

**Weekly Business Review:**
- WAU trend
- Conversion funnel
- Retention cohorts
- Geographic heatmap
- Category distribution

**Trust & Safety:**
- Report queue depth
- Report resolution time
- Moderation actions taken
- High-risk user flags

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Swap | A completed trade between two users |
| Listing | An item or service posted for trade |
| Offer | A proposed trade from one user to another |
| Counter-offer | A modified offer in response to an offer |
| Trust Score | Composite reputation score (0-5) |
| Traveler Mode | Temporary location setting for visitors |
| Offer Card | Structured offer display in chat |

---

## Appendix B: Open Questions for Product Review

1. Should we allow "open" offers where someone can propose any trade, or require selecting from existing listings?
2. How do we handle services with unclear time boundaries?
3. Should reviews be mandatory for trust score calculation?
4. What's the minimum viable moderation team size for launch?
5. Should we launch iOS-only or iOS + Android simultaneously?
6. What metro area for initial launch?

---

*Document prepared for LocalSwap MVP development. Subject to iteration based on user research and technical feasibility review.*
