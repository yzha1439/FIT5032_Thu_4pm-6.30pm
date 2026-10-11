# PlayPath Melbourne

PlayPath Melbourne is a Vue 3 web application developed for a
fictional Melbourne-based not-for-profit organisation.

The organisation promotes climate action through community sport
and active travel. The application helps residents find and compare
local walking, cycling, training and community sport activities.

## A1.2 Business Requirements

### BR A.1: Development Stack

The application is developed using Vue 3 with the Composition API.

The interface is divided into reusable Vue components, including:

- AppHeader
- ActivityDirectory
- ActivityFilters
- ActivityCard
- GetInvolvedForm

### BR A.2: Responsiveness

The application provides responsive layouts for mobile, tablet,
desktop and large desktop screens.

The activity directory displays cards on smaller devices and changes
to a comparison table on desktop screens.

Responsive breakpoints include:

- Less than 576px
- 576px and above
- 768px and above
- 992px and above
- 1200px and above
- 1400px and above

### BR B.1: Validations

The Get Involved form implements several types of validation:

- Required-field validation
- Minimum name-length validation
- Email-format validation
- Four-digit postcode validation
- Maximum message-length validation
- Consent validation

Validation messages are displayed beside the relevant fields.

### BR B.2: Dynamic Data

Activity information is stored in a JavaScript data structure and
dynamically displayed using Vue data binding.

Users can:

- Search by activity, club or suburb
- Filter by suburb
- Filter by activity type
- Filter by accessibility
- Filter by cost
- Clear all filters
- View the number of matching activities

Successful expressions of interest are saved in Local Storage under:

`playpathExpressionsOfInterest`

## Visual Design

The application uses an original Melbourne urban-route visual
identity.

The design includes:

- A purple, coral and lime colour palette
- Route lines and suburb stop markers
- Asymmetrical card and button shapes
- Responsive activity cards
- A Community Pass-inspired form
- Persistent form labels and visible keyboard focus states

## A3 BR D.1: External Authentication

Firebase Authentication provides:

- Email/password registration and sign-in
- Google sign-in
- Persistent browser sessions
- Email verification and resend
- Password reset
- Friendly authentication errors

Each authenticated user has a Firestore profile containing only name, email, role and creation
time. Public registration always creates the `member` role. Firestore Security Rules prevent users
from assigning themselves administrator access; only an existing administrator may change roles.

Before testing, enable Email/Password and Google in Firebase Authentication, create a Firestore
database, and publish the supplied `firestore.rules`.

## A3 BR D.2: Email with Attachment

After a signed-in user creates a Community Pass, the application can send a confirmation email
through the Resend API. The email contains an `.ics` calendar attachment for the selected
activity. Delivery is implemented as a second-generation Firebase callable function so that API
credentials are never included in the Vue bundle.

The backend applies the following safeguards:

- Firebase Authentication is required.
- The account email must be verified.
- The recipient must match the authenticated account email.
- Input is validated and escaped on the server.
- Each user is limited to one email per minute.
- The Resend API key is stored as a Firebase secret.

Create a Resend API key, then run:

```
firebase login
firebase functions:secrets:set RESEND_API_KEY
firebase deploy --only functions
```

The Firebase project must use the Blaze plan to deploy Cloud Functions. During testing, Resend's
`onboarding@resend.dev` sender can deliver to the email address associated with the Resend account.
Verify a custom domain before sending to other recipients in production.

## A3 BR D.3: Interactive Table Data

The application contains two interactive data tables:

- The Explore activity table supports sorting by activity, date, suburb, type, cost and access;
  searching and filtering by individual fields; and pagination limited to 10 rows per page.
- The administrator user table supports independent name, email and role searches, sortable
  columns and pagination limited to 10 rows per page.

Both tables use semantic captions, column headers, accessible sort state and live result counts.

## A3 BR D.4: Deployment to the Cloud

The production application is deployed with Firebase Hosting at:

- <https://playpath-melbourne.web.app>

The hosting configuration serves the Vite production build over HTTPS, rewrites client-side routes
to `index.html`, applies long-lived caching to hashed assets and sends security headers for content
type protection, referrer handling, frame blocking and browser permissions. A deployment can be
reproduced with:

```
npm run build
npx firebase-tools deploy --only hosting --project playpath-melbourne
```

## A3 BR E.1: Cloud Functions

The Community Pass email workflow runs in a second-generation Firebase callable Cloud Function.
Authentication, verified-recipient enforcement, server-side validation, rate limiting, calendar
generation and the Resend API request are performed on the server. The deployed function is located
in `australia-southeast2` and reads its API credential from Firebase Secret Manager.

## A3 BR E.2: Geo Location

The Explore page includes an interactive Leaflet and OpenStreetMap activity map with multiple
non-trivial location features:

- Filter-aware activity markers and activity search
- Browser geolocation with a privacy-friendly manual map selection fallback
- Nearest-activity discovery using the Haversine distance formula
- Direct-distance, walking-time and cycling-time estimates
- A route line and a Google Maps directions link

The map handles denied or unavailable location permission without preventing users from selecting a
starting point manually.

## A3 BR E.4: Export

Filtered activity data and administrator user data can be exported as CSV or PDF. Exported files use
the current sorted and filtered result set, include descriptive column headings and are generated in
the browser without exposing authentication credentials.

## A3 BR E.3: Accessibility

The application is designed toward WCAG 2.1 AA requirements. Accessibility support includes:

- A skip link and programmatic focus management after client-side navigation
- Semantic landmarks, heading hierarchy, form labels, fieldsets and table captions
- Keyboard-operable navigation, filters, forms, sortable columns, pagination and rating controls
- High-contrast two-layer focus indicators that remain visible on light and dark backgrounds
- `aria-current`, `aria-expanded`, `aria-pressed`, `aria-sort`, live status and alert announcements
- Error messages connected to their fields with `aria-describedby` and `aria-invalid`
- Text alternatives or hidden decorative content for non-text interface elements
- Reduced-motion support through `prefers-reduced-motion`
- Route-specific document titles and focused main content after single-page navigation
- Text-equivalent summaries for interactive Firestore charts
- A hash-router-safe skip link that moves keyboard focus directly to the active main landmark

## A3 BR F.1: Innovation

The application includes four extended UX innovations:

1. **Appointment booking using a calendar:** saved Community Passes appear in a personal schedule,
   and the form prevents conflicting bookings on the same date.
2. **Interactive Firestore charts:** administrators can switch between role distribution and monthly
   registration charts generated from Firestore user records.
3. **Offline application features:** a service worker caches the application shell, connection changes
   are announced, and Community Passes can be saved locally while offline.
4. **Admin dashboard:** a protected dashboard summarises registered users, roles and published
   activities and provides interactive account data tools.

The backend additionally exposes two read-only REST endpoints: `getActivities` supports optional
`type` and `suburb` filters, while `getActivityById` accepts an `id` query parameter. Both endpoints
return JSON, enable CORS and reject unsupported HTTP methods.

## Project Setup

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Create a production build:

```
npm run build
```

Format the source code:

```
npm run format
```

## Testing

The application should be tested at the following screen widths:

375px
576px
768px
992px
1200px
1440px

The browser console should contain no errors or warnings.
