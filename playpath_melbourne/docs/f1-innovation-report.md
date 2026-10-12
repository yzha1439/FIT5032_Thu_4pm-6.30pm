# F1 Innovation Research Report

## Purpose

PlayPath Melbourne implements four extended UX innovations for residents looking for accessible,
low-cost community activities. Each feature extends an existing application workflow rather than
appearing as an isolated demonstration.

## 1. Calendar booking and conflict prevention

### Research and design decision

Calendar systems commonly expose an overlap rule so that a booking can be rejected when it conflicts
with an existing event. FullCalendar documents both global and event-level overlap constraints. The
PlayPath implementation applies the same principle without adding a heavy calendar dependency:
saved registrations are compared by ISO date before a new pass is created.

### Implemented experience

- A Register action carries the selected activity into the Community Pass form.
- The form rejects a second activity on an already-booked date and identifies the conflicting event.
- Successful registrations appear in both a chronological agenda and a month calendar.
- Users can navigate calendar months and remove an existing booking.
- Each calendar cell has a complete accessible name, including its booked activity.

### Future upgrade

Store bookings in Firestore per user, add activity start/end times, and use transactional capacity
checks. A future drag-and-drop calendar could apply time-level overlap rules rather than the current
same-day constraint.

## 2. Interactive Firestore analytics

### Research and design decision

Firebase supports live document and query updates through snapshot listeners. The present dashboard
uses the current Firestore user records returned by the authenticated data service and transforms
them into role and monthly-registration summaries. The chart switcher lets administrators compare
two questions without displaying unnecessary personal data.

### Implemented experience

- Administrators can switch between role distribution and registrations by month.
- Charts are derived from Firestore user records rather than hard-coded chart values.
- Selected chart state is exposed with `aria-pressed`.
- Every visual chart has an equivalent text summary for screen-reader users.

### Future upgrade

Use a Firestore `onSnapshot` listener for live updates, add date-range controls and aggregate counts
on the server so the dashboard can scale without downloading every user profile.

## 3. Offline and resilient application features

### Research and design decision

MDN recommends a service worker and Cache API for returning cached responses when connectivity is
unavailable. PlayPath combines this application-shell strategy with local storage, giving the user
two distinct offline capabilities rather than only showing a connection badge.

### Implemented experience

- A service worker caches same-origin application resources and supplies the application shell when
  navigation fails offline.
- Online and offline changes are announced through an accessible status message.
- Community Pass data can be validated and saved locally while offline.
- Locally saved passes remain visible in the personal schedule after reload.

### Future upgrade

Add Background Sync to queue requested emails, version cached datasets, display pending-sync state,
and resolve conflicts when a locally saved pass is later written to Firestore.

## 4. Role-protected administration dashboard

### Research and design decision

Administrative UX should present high-value summaries first and support progressively deeper
inspection. The dashboard therefore combines overview cards, interactive charts, a filterable table
and export controls while reusing the application's Firebase role model.

### Implemented experience

- The route and navigation item are available only to users whose Firestore profile has the `admin`
  role.
- Summary cards show registered users, member/admin counts and published activities.
- User records can be searched, filtered, sorted, paginated and exported.
- Loading, empty and error states are communicated without exposing passwords or credentials.

### Future upgrade

Add audit logs, invitation and role-management workflows backed by privileged Cloud Functions,
activity publishing controls, and privacy-preserving trend metrics.

## Additional platform innovation: REST API

Two read-only HTTPS endpoints allow third parties to consume activity data:

- `getActivities` returns all activities and accepts optional `type` and `suburb` filters.
- `getActivityById` returns one activity selected by `id`.

Both endpoints return JSON, allow cross-origin GET requests and reject unsupported HTTP methods.
Future work should add API versioning, quotas, generated OpenAPI documentation and App Check or API
keys if non-public data is introduced.

## References

- FullCalendar. _eventOverlap_. <https://fullcalendar.io/docs/eventOverlap>
- MDN Web Docs. _Using Service Workers_. <https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers>
- Firebase. _Get realtime updates with Cloud Firestore_. <https://firebase.google.com/docs/firestore/query-data/listen>
- W3C Web Accessibility Initiative. _How to Meet WCAG_. <https://www.w3.org/WAI/WCAG21/quickref/>
