# Veltrix SaaS - Complete User Flow

## Overview
Veltrix is now a full SaaS platform with multi-tier pricing, user authentication, and comprehensive onboarding.

## Pricing Tiers

### 1. Free Trial (7 Days)
- **Price:** R 0
- **Duration:** 7 days
- **Features:**
  - All core features
  - Up to 100 contacts
  - 2 connected platforms
  - Basic automation
  - Email support
  - Cancel anytime

### 2. Professional
- **Price:** R 17,000/month
- **Features:**
  - Everything in Free Trial
  - Unlimited contacts
  - All 6 platforms
  - Advanced automation
  - Priority support
  - Custom workflows
  - Analytics & reports
  - API access
  - White-label option

### 3. Scale
- **Price:** R 44,000/month
- **Features:**
  - Everything in Professional
  - Multi-tenant SaaS
  - Unlimited automations
  - Dedicated account manager
  - 24/7 premium support
  - Custom integrations
  - Advanced AI features
  - SLA guarantee
  - Training & onboarding

### 4. Enterprise
- **Price:** Custom
- **Contact:** Sales team
- **Features:**
  - Unlimited everything
  - 24/7 dedicated support
  - 100% custom built solutions

## User Journey

### 1. Landing Page (/)
- Updated with navigation header (Pricing, Log In, Sign Up)
- Hero section with "Start Free Trial" CTA
- Feature grid showcasing TikTok-native support, no vendor lock-in, etc.
- Platform badges
- Updated CTA: "Ready to Automate Your Business?"
- Links to /signup and /login

### 2. Pricing Page (/pricing)
- Three main tier cards (Free Trial, Professional, Scale)
- Enterprise section below
- FAQ section
- Each tier has "Start Free Trial" or "Get Started" button
- Clicking any plan stores selection in localStorage
- Redirects to /signup

### 3. Sign Up Page (/signup)
- Form fields:
  - Full Name (required)
  - Email Address (required)
  - Business Name (required)
  - Password (required, min 8 chars)
  - Confirm Password (required, must match)
  - Terms & Conditions checkbox (required)
- Shows selected plan from pricing page
- Form validation with error messages
- Password visibility toggle
- Link to /login for existing users
- On success: Stores user data in localStorage and redirects to onboarding

### 4. Login Page (/login)
- Form fields:
  - Email Address
  - Password
  - Remember me checkbox
- Password visibility toggle
- "Forgot password" link
- Link to /signup for new users
- On success: Checks if onboarding complete
  - If yes → /dashboard
  - If no → /onboarding/business-details

### 5. Onboarding Flow

#### Progress Indicator
All onboarding pages show a visual progress bar with 5 steps:
1. Business Details
2. Product Setup
3. Automation Preferences
4. Billing Info
5. Welcome Tour

#### Step 1: Business Details (/onboarding/business-details)
- Form fields:
  - Business Name (pre-filled from signup)
  - Industry (dropdown: E-commerce, Education, Healthcare, etc.)
  - Business Size (dropdown: 1-10, 11-50, 51-200, etc.)
  - Country (default: South Africa)
  - City
  - Phone Number
  - Website (optional)
  - Brief Description (optional)
- Navigation: Cancel or Continue →
- On continue: Saves to localStorage and goes to product-setup

#### Step 2: Product Setup (/onboarding/product-setup)
- "Add Product or Service" button opens modal
- Product form:
  - Product Name (required)
  - Category (dropdown: Physical Product, Digital Product, Service, etc.)
  - Price in ZAR (required)
  - Description (optional)
- Products display as cards with:
  - Icon, name, category
  - Description
  - Price
  - Edit and Delete buttons
- Navigation: ← Back or Skip for Now or Continue →
- Can continue with 0 products (skip) or with products added
- On continue: Saves to localStorage and goes to automation-preferences

#### Step 3: Automation Preferences (/onboarding/automation-preferences)
- **Platform Selection:**
  - TikTok (Lead forms & DM automation)
  - WhatsApp (Business messaging)
  - Facebook (Ads & messenger)
  - Instagram (DMs & comments)
  - LinkedIn (B2B messaging)
  - Website (Lead capture forms)
  - Multi-select cards with checkmarks when selected
  - Must select at least 1 platform to continue

- **Automation Features (checkboxes):**
  - Auto-Qualify Leads (AI scoring and prioritization)
  - Auto-Respond to Messages (Instant responses)
  - Auto-Schedule Content (Multi-platform posting)
  - Auto-Send Invoices (After sales)
  - Track Deliveries (Update notifications)
  - AI Assistant (GPT-4 for conversations and content)

- Navigation: ← Back or Continue →
- On continue: Saves to localStorage and goes to billing

#### Step 4: Billing Information (/onboarding/billing)
- **Payment Details Collection:**
  - Cardholder Name (required)
  - Card Number (13-19 digits, formatted with spaces)
    * Validates card type (Visa, Mastercard, Amex)
    * Only stores last 4 digits for security
  - Expiry Date (MM/YYYY dropdowns)
    * Month: 01-12
    * Year: Current year + 14 years
  - CVV (3-4 digits, masked input)
  - Billing Address (required)
  - City (required)
  - Postal Code (required)
  - Country (dropdown: South Africa, Nigeria, Kenya, Ghana, Other)

- **Security Features:**
  - Shield icon with "Secure Payment" badge
  - Card number formatting (spaces every 4 digits)
  - Card type detection and icon display
  - Production note: "In production, card details will be tokenized and never stored"

- **Free Trial Accommodation:**
  - Free Trial users see "Skip for Now" button
  - Paid plan users must complete billing information
  - Note: "You're on a free trial. You can add billing information later."

- **Form Validation:**
  - Name validation (not empty)
  - Card number validation (13-19 digits)
  - Expiry validation (valid MM/YYYY format)
  - CVV validation (3-4 digits)
  - Address validation (all fields required)
  - Error messages displayed under each invalid field

- Navigation:
  - ← Back (to automation-preferences)
  - Skip for Now (Free Trial only)
  - Complete Setup →
- On continue: Saves billing data (last 4 digits only) to localStorage and goes to tour

#### Step 5: Welcome Tour (/onboarding/tour)
- Celebration screen: "Setup Complete! 🎉"
- Shows success icon with checkmark
- Offers interactive tour (2 minutes)
- Tour highlights:
  - Unified Inbox
  - Lead Management
  - Automations
  - Analytics
- Two options:
  1. "Start Tour (2 min)" → Goes to /dashboard/tour for interactive 7-step tour
  2. "Skip" or "Go to Dashboard" → Mark onboarding complete and go to /dashboard

### 6. Dashboard (/dashboard/*)
- After onboarding, users access the full dashboard
- 12 navigation items including new Scheduler
- All existing functionality
- User data and preferences stored in localStorage

## Authentication System (Demo)

### Current Implementation (localStorage-based)
- No backend/API yet
- User data stored in localStorage
- Authentication flag: `isAuthenticated`
- User data structure:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "businessName": "Acme Inc.",
  "plan": "Professional",
  "createdAt": "2026-02-13T...",
  "onboardingComplete": true,
  "businessDetails": {...},
  "products": [...],
  "selectedPlatforms": [...],
  "automationPreferences": {...}
}
```

### Protected Routes
- /onboarding/* - Requires authentication
- /dashboard/* - Requires authentication AND completed onboarding

## Key Files Created

### Pages
1. `/app/pricing/page.tsx` - Pricing tiers page
2. `/app/signup/page.tsx` - User registration
3. `/app/login/page.tsx` - User login
4. `/app/onboarding/layout.tsx` - Onboarding wrapper with progress bar
5. `/app/onboarding/business-details/page.tsx` - Step 1
6. `/app/onboarding/product-setup/page.tsx` - Step 2
7. `/app/onboarding/automation-preferences/page.tsx` - Step 3
8. `/app/onboarding/tour/page.tsx` - Step 4 (completion)

### Updated Files
- `/app/page.tsx` - Added navigation header, updated CTAs

## Testing the Flow

### Complete User Journey:
1. Visit http://localhost:3000
2. Click "Sign Up" or "Start Free Trial"
3. Or click "View Pricing" → Select a plan → "Get Started"
4. Fill signup form → "Create Account"
5. Complete business details → "Continue"
6. Add products (or skip) → "Continue"
7. Select platforms and automation features → "Continue"
8. Choose "Start Tour" or "Go to Dashboard"
9. Explore the dashboard with all features

### Direct URLs:
- Homepage: http://localhost:3000
- Pricing: http://localhost:3000/pricing
- Sign Up: http://localhost:3000/signup
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard (requires auth)
- Scheduler: http://localhost:3000/dashboard/scheduler

## Next Steps for Production

1. **Backend Integration:**
   - Replace localStorage with real API calls
   - User authentication with JWT or session tokens
   - Database for user data, products, automations

2. **Payment Integration:**
   - Stripe or PayFast for South African payments
   - Subscription management
   - Free trial countdown
   - Payment webhooks

3. **Email System:**
   - Welcome emails
   - Onboarding emails
   - Password reset
   - Transaction emails

4. **Interactive Tour:**
   - Implement actual product tour with tooltips
   - Highlight key features
   - Track tour completion

5. **Admin Panel:**
   - Manage users
   - View subscriptions
   - Analytics dashboard
   - Support tickets

6. **Security:**
   - Password hashing
   - Rate limiting
   - CSRF protection
   - Input validation

## Design System Consistency

All new pages follow the existing design patterns:
- Glass cards (glass-card, glass-button, glass-input)
- Dark mode support throughout
- Lucide React icons
- Gradient buttons (blue to purple)
- Hover effects and transitions
- Responsive design (mobile-first)
- Apple-inspired aesthetic

---

**Status:** All features implemented and ready for testing!
**Server:** Running on port 3000
**Date:** February 13, 2026
