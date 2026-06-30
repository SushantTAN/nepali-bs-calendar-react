# Nepali BS Calendar React

A lightweight, responsive React Nepali Bikram Sambat calendar/date picker component.

This package provides a Nepali BS date picker with support for:

- Dynamic calendar data via React Context
- Static calendar component (non-popup)
- Nepali Bikram Sambat calendar dates
- Controlled date value
- Minimum and maximum date limits
- Disabled dates
- Custom date disabling logic
- Error message support
- Responsive popup positioning
- Portal-based dropdown rendering
- CSS variable based styling overrides
- Custom calendar component

## Example

[View the example here](https://nepali-bs-calendar-website.vercel.app/)

---

## Installation

```bash
npm install nepali-bs-calendar-react
```

---

## Setup (Required)

You must wrap your application (or the part using the calendar) with the `NepaliCalendarProvider`. This allows you to provide the calendar data dynamically.

```tsx
import { NepaliCalendarProvider, defaultCalendarData } from 'nepali-bs-calendar-react'

function App() {
  return (
    <NepaliCalendarProvider data={defaultCalendarData}>
      {/* Your components */}
    </NepaliCalendarProvider>
  )
}
```

Note: Data can be extracted from the scraper as well: [nepali-calendar-scraper](https://github.com/SushantTAN/nepali-calendar-scrapper) 

---

## New In version 1.0.1 

- New prop [calendarComponent](#custom-calendar-component)

---

## Basic Usage (Popup Picker)

```tsx
import { useState } from 'react'
import { NepaliCalendar } from 'nepali-bs-calendar-react'
import 'nepali-bs-calendar-react/styles.css'

export default function MyComponent() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <NepaliCalendar
      label="Select Transaction Date"
      value={date}
      onChange={(value) => setDate(value)}
      minDate="2080-01-01"
      maxDate="2081-12-30"
    />
  )
}
```

---

## Static Calendar Usage

If you want to display the calendar directly on the page without a popup, use `StaticNepaliCalendar`.

```tsx
import { useState } from 'react'
import { StaticNepaliCalendar } from 'nepali-bs-calendar-react'

export default function MyComponent() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <StaticNepaliCalendar
      value={date}
      onChange={(value) => setDate(value)}
    />
  )
}
```

You can also use `calendarComponent` with `StaticNepaliCalendar` to customize the static calendar UI.

```tsx
import { useState } from 'react'
import {
  StaticNepaliCalendar,
  NepaliCalendarViewRenderProps,
} from 'nepali-bs-calendar-react'

function CustomCalendar({
  viewYear,
  viewMonth,
  calendarCells,
  handleDayChange,
  isDisabled,
  BS_MONTHS,
  toNepaliNumber,
}: NepaliCalendarViewRenderProps) {
  return (
    <div>
      <h3>{BS_MONTHS[viewMonth - 1]} {viewYear}</h3>

      {calendarCells.map((date, index) => (
        <button
          key={date ? `${date.year}-${date.month}-${date.day}` : `empty-${index}`}
          type="button"
          disabled={!date || isDisabled(date)}
          onClick={() => date && handleDayChange(date.day)}
        >
          {date ? toNepaliNumber(date.day) : ''}
        </button>
      ))}
    </div>
  )
}

export default function MyComponent() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <StaticNepaliCalendar
      value={date}
      onChange={(value) => setDate(value)}
      calendarComponent={CustomCalendar}
    />
  )
}
```

---

## Dynamic Calendar Data

You can provide your own calendar data if you need to support more years or custom month lengths.

```tsx
import { NepaliCalendarProvider, CalendarData } from 'nepali-bs-calendar-react'

const customData: CalendarData = {
  ref_ad: '2019-12-17',
  ref_bs: '2076-09-01',
  years: {
    2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
    // ... add more years
  },
}

function App() {
  return (
    <NepaliCalendarProvider data={customData}>
      <NepaliCalendar />
    </NepaliCalendarProvider>
  )
}
```


> If your bundler does not automatically include library CSS, import it manually:
>
> ```tsx
> import 'nepali-bs-calendar-react/styles.css'
> ```

---

## Provider-backed Date Utilities

If you want to use the date helpers outside the calendar UI, you can use the `useNepaliDateUtils` hook. It exposes the same utility functions as the package exports, but they are bound to the calendar data provided through `NepaliCalendarProvider`.

```tsx
import {
  NepaliCalendarProvider,
  defaultCalendarData,
  useNepaliDateUtils,
} from 'nepali-bs-calendar-react'

function DateInfo() {
  const utils = useNepaliDateUtils()

  const firstDate = utils.getFirstValidDate()
  const formatted = utils.formatBSDate(firstDate)
  const weekday = utils.getWeekdayOfBSDate(firstDate)

  return (
    <div>
      <p>First valid BS date: {formatted}</p>
      <p>Weekday: {weekday}</p>
    </div>
  )
}

function App() {
  return (
    <NepaliCalendarProvider data={defaultCalendarData}>
      <DateInfo />
    </NepaliCalendarProvider>
  )
}
```

---

## Date Format

The component expects and returns BS dates in this format:

```txt
YYYY-MM-DD
```

Example:

```txt
2081-05-12
```

---

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string \| null` | `null` | Current selected BS date in `YYYY-MM-DD` format. |
| `onChange` | `(value: string, date: NepaliDateValue) => void` | - | Callback triggered when a date is selected. |
| `minDate` | `string` | - | Minimum selectable BS date in `YYYY-MM-DD` format. |
| `maxDate` | `string` | - | Maximum selectable BS date in `YYYY-MM-DD` format. |
| `disabledDates` | `string[]` | `[]` | Specific disabled BS dates in `YYYY-MM-DD` format. |
| `isDateDisabled` | `(date: NepaliDateValue) => boolean` | - | Custom function to disable a date. |
| `label` | `string` | - | Label displayed above the picker. |
| `placeholder` | `string` | `Select date` | Placeholder text when no date is selected. |
| `calendarComponent` | `React.ComponentType<NepaliCalendarViewRenderProps>` | `-` | Custom calendar component that receives internal calendar state, actions, and helper values. |
| `renderCalendar` | `(props: NepaliCalendarViewRenderProps) => React.ReactNode` | `-` | Render prop alternative for custom calendar markup. |
| `disabled` | `boolean` | `false` | Disables the picker. |
| `error` | `string` | - | Error message shown below the picker. |
| `touched` | `boolean` | `false` | Shows error only when `touched` is true. |
| `className` | `string` | `""` | Extra class name added to the main wrapper. |

---

## Type Reference

```ts
type NepaliDateValue = {
  year: number
  month: number
  day: number
}
```

---

## onChange Example

```tsx
<NepaliCalendar
  value={date}
  onChange={(value, dateObject) => {
    console.log(value)
    console.log(dateObject)
  }}
/>
```

Output:

```ts
"2081-05-12"

{
  year: 2081,
  month: 5,
  day: 12
}
```

---

## Disable Specific Dates

```tsx
<NepaliCalendar
  value={date}
  onChange={setDate}
  disabledDates={[
    '2081-01-01',
    '2081-01-15',
    '2081-02-10',
  ]}
/>
```

---

## Custom Calendar Component

You can render your own calendar UI while still using the library's calendar data and helpers.

```tsx
import { useState } from 'react'
import {
  NepaliCalendar,
  NepaliCalendarViewRenderProps,
} from 'nepali-bs-calendar-react'

function MyStaticCalendarComponent({
  value,
  viewYear,
  viewMonth,
  calendarCells,
  goToPreviousMonth,
  goToNextMonth,
  handleYearChange,
  handleMonthChange,
  handleDayChange,
  availableYears,
  validMonthsForYear,
  isDisabled,
  formatBSDate,
  toNepaliNumber,
  BS_MONTHS,
  WEEK_DAYS,
}: NepaliCalendarViewRenderProps) {
  return (
    <div className="my-static-calendar">
      

      <div className="my-static-calendar__filters">
        <select
          value={viewYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={viewMonth}
          onChange={(e) => handleMonthChange(Number(e.target.value))}
        >
          {validMonthsForYear.map((monthItem) => (
            <option
              key={monthItem.month}
              value={monthItem.month}
              disabled={monthItem.disabled}
            >
              {monthItem.label}
            </option>
          ))}
        </select>
      </div>

      <div className="my-static-calendar__weekdays">
        {WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="my-static-calendar__grid">
        {calendarCells.map((date, index) => {

            console.log("date", date, calendarCells)
          if (!date) {
            return <div key={`empty-${index}`} />
          }

          const formattedDate = formatBSDate(date)
          const selected = value === formattedDate
          const disabled = isDisabled(date)

          return (
            <button
              key={formattedDate}
              type="button"
              disabled={disabled}
              onClick={() => handleDayChange(date.day)}
              className={[
                'my-static-calendar__day',
                selected ? 'my-static-calendar__day--selected' : '',
                disabled ? 'my-static-calendar__day--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {toNepaliNumber(date.day)}
            </button>
          )
        })}
      </div>

      <div className="my-static-calendar__header">
        <button type="button" onClick={goToPreviousMonth}>
          Prev
        </button>

        <strong>
          {BS_MONTHS[viewMonth - 1]} {viewYear}
        </strong>

        <button type="button" onClick={goToNextMonth}>
          Next
        </button>
      </div>
    </div>
  )
}

export default MyStaticCalendarComponent

function MyComponent() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <NepaliCalendar
      value={date}
      onChange={setDate}
      calendarComponent={CustomCalendar}
    />
  )
}
```

```css
/* Styles */

.my-static-calendar {
  width: 340px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}

.my-static-calendar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.my-static-calendar__filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.my-static-calendar__filters select {
  flex: 1;
  padding: 8px;
}

.my-static-calendar__weekdays,
.my-static-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.my-static-calendar__weekdays {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.my-static-calendar__day {
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  cursor: pointer;
}

.my-static-calendar__day--selected {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.my-static-calendar__day--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

```

---

## Minimum and Maximum Date

```tsx
<NepaliCalendar
  value={date}
  onChange={setDate}
  minDate="2080-01-01"
  maxDate="2081-12-30"
/>
```

---

## Custom Disabled Date Logic

You can disable dates using your own logic.

```tsx
<NepaliCalendar
  value={date}
  onChange={setDate}
  isDateDisabled={(date) => {
    return date.day === 1
  }}
/>
```

---

## Error Message

```tsx
<NepaliCalendar
  label="Transaction Date"
  value={date}
  onChange={setDate}
  error="Transaction date is required"
  touched={true}
/>
```

The error only appears when both `error` and `touched` are provided.

---

## Disabled Picker

```tsx
<NepaliCalendar
  value={date}
  onChange={setDate}
  disabled
/>
```

---

## Responsive Popup Behavior

The calendar popup is rendered using React Portal.

It automatically:

- Opens below the trigger when there is enough space
- Opens above the trigger when the trigger is near the bottom of the screen
- Stays inside the viewport
- Adjusts its width on small screens
- Repositions on scroll and resize
- Uses throttled positioning for better performance

This makes it suitable for desktop, tablet, and mobile layouts.

---

## Styling

Import the default styles:

```tsx
import 'nepali-bs-calendar-react/styles.css'
```

The component uses CSS variables, so you can customize the design without editing the package source code.

Because the popup uses `createPortal`, the safest way to override styles is by defining variables globally in your app CSS using `:root`.

Example:

```css
:root {
  --ndp-trigger-border: #22c55e;
  --ndp-trigger-border-hover: #16a34a;
  --ndp-trigger-radius: 12px;
  --ndp-trigger-focus-shadow: 0 0 0 2px rgba(22, 163, 74, 0.16);

  --nc-bg: #f0fdf4;
  --nc-border-color: #bbf7d0;
  --nc-border-radius: 18px;
  --nc-title-color: #14532d;
  --nc-weekday-color: #15803d;
  --nc-cell-hover-bg: #dcfce7;
  --nc-cell-selected-bg: #16a34a;
  --nc-cell-selected-hover-bg: #15803d;
  --nc-cell-selected-color: #ffffff;
  --nc-shadow: 0 16px 40px rgba(20, 83, 45, 0.18);
}
```

---

## Scoped Styling Note

You can pass a custom class name:

```tsx
<NepaliCalendar
  className="my-nepali-calendar"
  value={date}
  onChange={setDate}
/>
```

However, because the popup is rendered through `createPortal`, wrapper-scoped CSS variables may only affect the trigger, not the popup.

For example, this may not fully style the popup:

```css
.my-nepali-calendar {
  --nc-bg: #f0fdf4;
}
```

Recommended approach:

```css
:root {
  --nc-bg: #f0fdf4;
}
```

or apply variables to `body`:

```css
body {
  --nc-bg: #f0fdf4;
}
```

---

## Available CSS Variables

### Date Picker Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--ndp-width` | `100%` | Main picker width. |
| `--ndp-gap` | `6px` | Gap between label, trigger, and error. |
| `--ndp-label-font-size` | `14px` | Label font size. |
| `--ndp-label-font-weight` | `500` | Label font weight. |
| `--ndp-label-color` | `#222` | Label color. |
| `--ndp-trigger-min-height` | `40px` | Trigger button minimum height. |
| `--ndp-trigger-border` | `#d9d9d9` | Trigger border color. |
| `--ndp-trigger-border-hover` | `#4096ff` | Trigger hover/open border color. |
| `--ndp-trigger-radius` | `8px` | Trigger border radius. |
| `--ndp-trigger-bg` | `#fff` | Trigger background. |
| `--ndp-trigger-padding` | `8px 12px` | Trigger padding. |
| `--ndp-trigger-focus-shadow` | `0 0 0 2px rgba(5, 145, 255, 0.12)` | Focus shadow. |
| `--ndp-trigger-disabled-bg` | `#f5f5f5` | Disabled trigger background. |
| `--ndp-trigger-disabled-color` | `rgba(0, 0, 0, 0.25)` | Disabled trigger text color. |
| `--ndp-value-color` | `rgba(0, 0, 0, 0.88)` | Selected value text color. |
| `--ndp-placeholder-color` | `rgba(0, 0, 0, 0.4)` | Placeholder color. |
| `--ndp-error-color` | `#ff4d4f` | Error color. |
| `--ndp-error-font-size` | `13px` | Error font size. |
| `--ndp-popover-min-width` | `280px` | Minimum popup width. |

---

### Calendar Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `--nc-border-color` | `#e5e7eb` | Calendar border color. |
| `--nc-border-radius` | `12px` | Calendar border radius. |
| `--nc-bg` | `#fff` | Calendar background. |
| `--nc-shadow` | `0 12px 32px rgba(15, 23, 42, 0.18)` | Calendar shadow. |
| `--nc-padding` | `14px` | Calendar padding. |
| `--nc-font-family` | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | Calendar font family. |
| `--nc-header-gap` | `8px` | Header gap. |
| `--nc-header-margin-bottom` | `12px` | Header bottom margin. |
| `--nc-title-font-size` | `16px` | Calendar title font size. |
| `--nc-title-font-weight` | `600` | Calendar title font weight. |
| `--nc-title-color` | `#111827` | Calendar title color. |
| `--nc-nav-btn-size` | `32px` | Previous/next button size. |
| `--nc-nav-btn-border-color` | `#e5e7eb` | Previous/next button border color. |
| `--nc-nav-btn-radius` | `8px` | Previous/next button radius. |
| `--nc-nav-btn-bg` | `#fff` | Previous/next button background. |
| `--nc-nav-btn-color` | `#111827` | Previous/next button text color. |
| `--nc-nav-btn-hover-bg` | `#f9fafb` | Previous/next hover background. |
| `--nc-nav-btn-font-size` | `22px` | Previous/next arrow font size. |
| `--nc-controls-gap` | `8px` | Gap between year, month, and day selects. |
| `--nc-controls-margin-bottom` | `12px` | Controls bottom margin. |
| `--nc-select-height` | `34px` | Select input height. |
| `--nc-select-border-color` | `#d1d5db` | Select input border color. |
| `--nc-select-radius` | `8px` | Select input border radius. |
| `--nc-select-bg` | `#fff` | Select input background. |
| `--nc-select-color` | `#111827` | Select input text color. |
| `--nc-select-padding` | `0 8px` | Select input padding. |
| `--nc-grid-gap` | `4px` | Gap between date cells. |
| `--nc-weekdays-margin-bottom` | `6px` | Weekday row bottom margin. |
| `--nc-weekday-font-size` | `12px` | Weekday font size. |
| `--nc-weekday-font-weight` | `600` | Weekday font weight. |
| `--nc-weekday-color` | `#6b7280` | Weekday text color. |
| `--nc-cell-min-height` | `36px` | Date cell minimum height. |
| `--nc-cell-radius` | `8px` | Date cell border radius. |
| `--nc-cell-bg` | `transparent` | Date cell background. |
| `--nc-cell-color` | `#111827` | Date cell text color. |
| `--nc-cell-hover-bg` | `#f3f4f6` | Date cell hover background. |
| `--nc-cell-selected-bg` | `#1677ff` | Selected date background. |
| `--nc-cell-selected-color` | `#fff` | Selected date text color. |
| `--nc-cell-selected-hover-bg` | `#1677ff` | Selected date hover background. |
| `--nc-cell-disabled-color` | `#bdbdbd` | Disabled date text color. |
| `--nc-cell-disabled-bg` | `transparent` | Disabled date background. |

---

## Mobile Styling Variables

You can also customize mobile-specific values.

```css
:root {
  --nc-mobile-padding: 12px;
  --nc-mobile-title-font-size: 15px;
  --nc-mobile-nav-btn-size: 30px;
  --nc-mobile-cell-min-height: 34px;
  --nc-mobile-cell-font-size: 13px;

  --nc-small-padding: 10px;
  --nc-small-title-font-size: 14px;
  --nc-small-cell-min-height: 32px;
  --nc-small-cell-font-size: 12px;

  --nc-tiny-padding: 8px;
  --nc-tiny-cell-min-height: 30px;
  --nc-tiny-cell-font-size: 11px;
}
```

---

## Utility Exports

```ts
import {
  adToBs,
  bsToAd,
  adStringToBs,
  bsStringToAd,
  formatBSDate,
  parseBSDate,
  isValidBSDate,
  getAvailableYears,
  getMonthDays,
  toNepaliNumber,
} from 'nepali-bs-calendar-react'
```

---

## Supported Date Range

The calendar currently supports dates from **2076 BS** to **2090 BS** based on the bundled calendar data.

---
<!-- 
## Development

Clone the project and install dependencies:

```bash
npm install
```

Build the package:

```bash
npm run build
```

Create a local npm package file:

```bash
npm pack
```

--- -->

<!-- ## Local Testing With a Demo App

From your library folder:

```bash
npm install
npm run build
```

Create a separate Vite React app:

```bash
cd ..
npm create vite@latest nepali-calendar-demo -- --template react-ts
cd nepali-calendar-demo
npm install
```

Install your local package:

```bash
npm install ../nepali-calendar-package
```

Use it in `src/App.tsx`:

```tsx
import { useState } from 'react'
import NepaliCalendar from 'nepali-bs-calendar-react'
import 'nepali-bs-calendar-react/styles.css'

export default function App() {
  const [date, setDate] = useState<string | null>(null)

  return (
    <div style={{ padding: 40 }}>
      <NepaliCalendar
        label="Select Date"
        value={date}
        onChange={setDate}
      />
    </div>
  )
}
```

Run the demo app:

```bash
npm run dev
``` -->

<!-- ---

## Publishing

1. Make sure the package name in `package.json` is available on npm.

```json
{
  "name": "nepali-bs-calendar-react"
}
```

2. Log in to npm:

```bash
npm login
```

3. Build the package:

```bash
npm run build
```

4. Publish:

```bash
npm publish --access public
```

--- -->

## License

MIT
