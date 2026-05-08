# Nepali BS Calendar React

A lightweight React Nepali Bikram Sambat calendar/date picker component.

## Installation

```bash
npm install nepali-bs-calendar-react
```

## Usage

```tsx
import { useState } from 'react'
import NepaliCalendar from 'nepali-bs-calendar-react'
import 'nepali-bs-calendar-react/styles.css'

export default function App() {
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

> The package also imports its CSS from the main entry. If your bundler does not automatically include library CSS, import `nepali-bs-calendar-react/styles.css` manually as shown above.

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
| `placeholder` | `string` | `Select date` | Placeholder when no date is selected. |
| `disabled` | `boolean` | `false` | Disables the picker. |
| `error` | `string` | - | Error message. |
| `touched` | `boolean` | `false` | Shows error only when touched is true. |
| `className` | `string` | `""` | Extra class name for the wrapper. |

## Utility exports

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

## Supported date range

The calendar currently supports dates from **2076 BS** to **2090 BS** based on the bundled calendar data.

## Development

```bash
npm install
npm run build
npm pack
```

## Publishing

1. Change the package name in `package.json` if `nepali-bs-calendar-react` is already taken.
2. Log in to npm:

```bash
npm login
```

3. Build and publish:

```bash
npm run build
npm publish --access public
```
