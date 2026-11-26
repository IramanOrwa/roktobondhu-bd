# RoktoBondhu BD (রক্তবন্ধু বিডি)

A production-ready, bilingual (**English & বাংলা**) Blood Donation and Emergency Request Web Application tailored for Bangladesh.

## Core Architecture

1. **Unified Single Account Model (`prisma/schema.prisma`, `src/context/AppStateContext.tsx`)**
   - Every user has one account acting as both **Donor** and **Requester**.
   - Profile includes Bangladesh mobile (with simulated 6-digit OTP verification), WhatsApp/secondary phone, blood group, 5-tier location, manual availability toggle, last donation timestamp, `"Hide Phone Number"` privacy toggle, and Hero Badge tiers (`Bronze`: 1+, `Silver`: 3+, `Gold`: 5+, `LifeSaver`: 10+).

2. **90-Day Auto Cooldown Algorithm (`src/lib/cooldown.ts`)**
   - Computes `DaysElapsed = CurrentDate - LastDonationDate`.
   - Automatically locks donor status to `ON_COOLDOWN` when `< 90` days, excluding them from public donor search results while displaying `"Eligible in X days"` countdown progress on the Unified Dashboard.

3. **5-Tier Bangladesh Location Hierarchy & Donor Ranking (`src/data/bangladesh-locations.ts`, `src/lib/donor-ranking.ts`)**
   - Cascading selectors: `Division → District → Upazila/Thana → Post Office (Post Code) → Village/Area` across all 8 divisions of Bangladesh.
   - Priority Match Ranking:
     - **Score 1**: Exact match on Thana/Upazila and District.
     - **Score 2**: Same District, different Thana.
     - **Score 3**: Same Division, different District.
   - Optional Emergency Compatibility Mode (includes clinically safe compatible RBC groups).

4. **Emergency Request Lifecycle & One-Click Social Share (`src/lib/request-lifecycle.ts`, `src/components/request/`)**
   - Status flow: `ACTIVE → IN_PROGRESS → FULFILLED / CANCELLED` with **48-hour auto-expiry** and manual `+48h` extension.
   - One-click Social Share Card generates bilingual EN/BN formatted alert text, downloadable `1080×1080` PNG poster via HTML5 Canvas, and direct WhatsApp / Facebook / Messenger share links.

## Local Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
