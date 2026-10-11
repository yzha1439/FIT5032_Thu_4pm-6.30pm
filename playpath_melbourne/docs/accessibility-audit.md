# WCAG 2.1 AA Accessibility Audit

Audit date: 11 October 2026  
Production URL: <https://playpath-melbourne.web.app>

## Scope

The Home, Explore, Ratings, Get involved and Account routes were checked in the deployed
application. The review covered keyboard navigation, accessible names, document structure, form
errors, status announcements, colour contrast, reduced motion and responsive overflow.

## Results

The public routes passed the following structural checks:

- The document language is declared as English.
- Every route has a unique, descriptive document title.
- Each route exposes exactly one main landmark.
- No duplicate element IDs were found.
- No unlabelled links, buttons, inputs, selects or text areas were found.
- No images without text alternatives were found.
- No skipped heading levels were found.
- No horizontal document overflow was detected at the tested desktop viewport.
- Client-side navigation moves focus to the active main landmark.
- The skip link moves focus directly to the main landmark without changing the hash route.
- Invalid form submission moves focus to the first invalid field.
- Invalid fields expose `aria-invalid` and associated error text through `aria-describedby`.
- Dynamic connection, submission, filtering and location messages use live status semantics.
- Interactive chart values have equivalent screen-reader summaries.

## Colour contrast

Representative interface colour pairs were calculated using the WCAG relative luminance formula.
All tested normal-text combinations exceed the AA requirement of 4.5:1:

| Foreground and background | Ratio |
| --- | ---: |
| White on primary purple | 6.04:1 |
| Ink on paper | 15.19:1 |
| Muted ink on paper | 5.75:1 |
| Primary purple on paper | 5.94:1 |
| White on error red | 5.84:1 |
| Success green on success background | 5.20:1 |
| Error red on error background | 5.32:1 |

## Keyboard and motion support

- All application actions use native links, buttons and form controls.
- Sort, pagination, rating, export, map, authentication and form controls are keyboard operable.
- A visible two-layer focus indicator is applied to links, buttons and form controls.
- `prefers-reduced-motion: reduce` disables non-essential animation and smooth scrolling.

## Screen-reader support

- Landmarks, labelled regions, table captions and scoped table headers communicate structure.
- Sort direction, selected navigation, toggle state and button state use ARIA attributes.
- Decorative route graphics and symbols are hidden from assistive technology.
- The map and Firestore charts include concise text alternatives.

## Future verification

Before the final interview, repeat a short manual test with VoiceOver and at 200% browser zoom. Any
future content or colour changes should be retested because accessibility compliance can regress.
