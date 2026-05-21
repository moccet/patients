# Patient portal — production readiness

Production URL: **`https://patients.thewellnesslondon.com`**
Repo (client): `moccet/patients`
Repo (backend): `moccet/TheWellness-next` (monorepo path: `apps/wellness/`)
Supabase project: `WellnessAI` (`hsktoueygvrxikkvekbv`)

The portal is feature-complete for v1. This file lists the items that
require **human action**, not engineering work.

---

## 1. What's live

| Surface | Where | What |
|---|---|---|
| Home | `/home` | Greeting, next visit card with intake CTA |
| Visits | `/visits` | Past + upcoming, sealed-summary inline |
| Profile | `/profile` | Self-input medications / conditions / allergies (CRUD) |
| Labs | `/labs` | Self-upload PDFs / images (25 MB), download, delete |
| Chat | `/chat` | RAG-grounded Claude Sonnet 4.6 with safety guardrails, realtime delivery |
| Intake | `/intake/[id]` | 5-question pre-consultation flow with auto-save |
| Settings | `/settings` | Account info, sign out (avatar in TopBar → here) |
| Auth | `/auth/sign-in`, `/auth/callback` | Magic-link via Supabase OTP |

## 2. Database (all applied to WellnessAI)

| Migration | What |
|---|---|
| `20260521_patient_portal.sql` | Core: patient_profiles, encounters, intake_*, patient_chat_messages, patient_chat_audit |
| `20260521_patient_portal_storage.sql` | `methodology` bucket (now unused — wellness scoring dropped) |
| `20260521_drop_wellness_scoring.sql` | Reverted the never-used wellness scoring system |
| `20260521_patient_self_input.sql` | patient_medications, patient_conditions, patient_allergies + RLS |
| `20260521_patient_documents.sql` | patient_documents + `patient-documents` storage bucket |
| `scripts/backfill-firebase-users-to-supabase.mjs` | One-shot: 415 of 421 Firebase users mirrored into auth.users |
| `scripts/backfill-firestore-bookings-to-encounters.mjs` | 961 encounters created from 1,068 Firestore bookings (88% match) |

## 3. Required env vars

**`apps/wellness/` (Vercel project for backend):**
- `ANTHROPIC_API_KEY` — patient agent uses Claude Sonnet 4.6
- `OPENAI_API_KEY` — clinical RAG embeddings (separate from chat)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (existing)
- `STRIPE_SECRET_KEY` (existing)

**`patients` (Vercel project for client):**
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same as backend)
- `NEXT_PUBLIC_API_BASE = https://www.thewellnesslondon.com`

## 4. Supabase Auth → URL Configuration

In **Authentication → URL Configuration → Redirect URLs**, the allowlist
must include:

```
https://patients.thewellnesslondon.com/**
http://localhost:3001/**
```

Site URL stays as `https://thewellnesslondon.com`.

## 5. Email template — Magic Link

**Authentication → Email Templates → Magic Link → Message body** must use
a plain `<a href="{{ .ConfirmationURL }}">` button — email clients strip
`<script>`. Subject line must NOT contain a newline (SMTP 550s).

## 6. Onboarding a patient

Three paths, all working:

1. **Existing customer (Firebase mirror, already done):** any of the
   415 backfilled accounts can sign in immediately at `patients.thewellnesslondon.com/auth/sign-in`.
2. **New customer via booking flow:** booking → Firebase user created →
   automatically mirrored into Supabase via `ensureSupabaseUser`
   (added 2026-05-21) → portal accessible immediately.
3. **Manual invite:** Supabase dashboard → Auth → Users → Invite User.

Optional: insert a `patient_profiles` row with first/last name so the
greeting reads "Good morning, Alice." instead of "Good morning."

## 7. Encounter sync — current state

- One-shot Firestore → encounters backfill applied (961 rows for 397 patients)
- All encounters have `clinician_id = NULL` (Firestore bookings don't carry
  clinician info; UI renders "Clinician TBC" for upcoming, omits the
  segment for past)
- Earlier triggers were rolled back (`20260521_rollback_encounter_sync.sql`)
  because they joined on the wrong field; the script is the source of truth
  for now, idempotent on `legacy_booking_ref`
- **Going forward:** the Stripe webhook fix (commit 5ed75a9) now always
  persists treatment fields from PI metadata on new booking_TIMESTAMP_
  records, so future bookings have proper labels. Re-run the script
  whenever you want to top up encounters from new bookings.

## 8. Known data-quality footnotes

- **441 of 961 encounters show as `"visit"`** — those bookings predate
  the Stripe webhook fix and Stripe itself had no description / metadata
  to recover from. New bookings will be labelled correctly. Historical
  ones cannot be re-labelled without manual mapping (price → treatment).
- **`medical_documents` (94 rows) still has user_id NULL** for all
  historical rows. The upload route fix (commit 5ed75a9) writes user_id
  for new uploads, but the 94 orphaned ones can only be attributed
  manually (their session_id is also NULL).
- **`methodology` storage bucket** still exists, empty. Delete via
  Supabase dashboard if you want a clean Storage tab.

## 9. Things deferred

- **Firebase → Supabase auth Scope B (server side).** Zero
  `verifyIdToken` callsites exist (confirmed) so there's nothing to
  swap in API routes. The browser-side `AuthContext` in the main
  thewellness app still uses Firebase JS SDK, but no API route trusts
  it for auth, so swapping it is UX work, not security work.
- **patient_treatments → encounters trigger.** Removed when we found
  the join field was wrong. If you ever want a treatment-system → portal
  sync, the right place is in the same admin tool that writes
  patient_treatments.
- **3 tables with RLS disabled** (`shop_copy_drafts`, `shop_product_drafts`,
  `openclaw_jobs`) — flagged by Supabase advisor, not portal-related,
  but enabling RLS without policies would break those admin flows. Decide
  whether to add policies + enable.

## 10. Pre-launch QA (run as `sofian@moccet.com`)

```
# 1. Sign in
#    Visit https://patients.thewellnesslondon.com/auth/sign-in (incognito)
#    Enter sofian@moccet.com, click the email link

# 2. Walk the surfaces
#    /home — greeting renders
#    /visits — 11 past visits show, no "Dr Elalfy"
#    /profile — add a medication, refresh, ensure it persists
#    /labs — upload a PDF, ensure it appears in the list, download it
#    /chat — type "should I increase my ramipril?" — must refuse + route to clinician
#    /settings — sign out → lands on /auth/sign-in

# 3. Auth boundary
curl https://www.thewellnesslondon.com/api/v1/me/profile          # → 401
curl -H "authorization: Bearer $TOKEN" https://.../api/v1/me/profile  # → 200
```

## 11. What this work added

**Backend** (`apps/wellness/`):
- 22 new `/api/v1/me/*` route handlers
- 7 new Supabase migrations
- 4 backfill scripts (Firebase users, Firestore bookings, encounters, safety eval)
- New libs: supabase/ (server, admin), auth/me-context, api/{cors,rate-limit},
  patient-agent/{system-prompt, audit-log, turn}, supabase/provision-user

**Client** (`moccet/patients`):
- 8 routes: /home /visits /labs /chat /profile /settings /intake/[id] /auth/*
- TanStack Query for all reads + mutations
- Supabase SSR auth gate (proxy.ts)
- Claude Sonnet 4.6 chat with Supabase Realtime delivery
- File upload with drag-drop, signed-URL downloads
