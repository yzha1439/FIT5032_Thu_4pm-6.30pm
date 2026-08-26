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