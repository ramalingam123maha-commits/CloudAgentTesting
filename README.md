# 🏋️ FitTrack – Your Fitness Journey

> **Track. Analyse. Achieve.** — A clean, offline-first fitness tracker that lives entirely in your browser.

FitTrack is a fully static, single-page web application built with pure **HTML5, CSS3, and Vanilla JavaScript**. No frameworks, no build tools, no backend — just open `index.html` and start logging workouts immediately. All your data stays on your device via `localStorage`.

---

![FitTrack Dashboard Preview](https://via.placeholder.com/900x500?text=FitTrack+%E2%80%93+Dashboard+Preview+%28replace+with+real+screenshot%29)
*Screenshot placeholder — replace with an actual screenshot of the Dashboard once the app is running.*

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
  - [Dashboard](#dashboard)
  - [Workouts](#workouts)
  - [Goals](#goals)
  - [Progress](#progress)
  - [Log Workout Modal](#log-workout-modal)
  - [Dark Mode](#dark-mode)
- [Data Storage](#data-storage)
  - [localStorage Keys](#localstorage-keys)
  - [Workout Object Schema](#workout-object-schema)
- [Customisation](#customisation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Functionality
- 📊 **Live Dashboard** — At-a-glance stat cards for calories burned, total workouts, active minutes, and active days
- 🏃 **Workout Log** — Full history of every workout, sortable by date and filterable by type
- 🎯 **Weekly Goals** — Set personal targets for sessions, calories, and active minutes with real-time progress bars
- 📈 **Progress Charts** — 30-day calorie and duration trend lines, plus a 6-month monthly summary grid

### Charting (No Libraries)
- 📉 **Weekly Bar Chart** — Gradient bars with rounded tops, day labels, and per-bar calorie labels
- 🍩 **Workout Split Donut** — Color-coded donut chart with a legend, showing workout type distribution
- 📈 **Line Charts** — Smooth gradient-fill lines for calorie and duration trends over 30 days

### Workout Management
- ➕ **Log Workout Modal** — Full-featured form: name, type, date, duration, calories, intensity (Easy / Medium / Hard), and optional notes
- 🔍 **Live Search** — Filter the workout list in real time by name or type
- 🏷️ **Type Badges** — Color-coded tags (Cardio 🏃, Strength 🏋️, Flexibility 🧘, Sports ⚽)
- 🗑️ **Delete Workouts** — Remove individual entries with an instant toast confirmation

### UX & Accessibility
- 🌙 **Dark Mode** — One-click toggle; preference persisted across sessions
- 📱 **Fully Responsive** — Collapsible sidebar on mobile with a hamburger menu and quick-add button
- 🔔 **Toast Notifications** — Non-intrusive feedback for save, delete, and log actions
- 💾 **Offline-First** — 100 % `localStorage`-based; works without any internet connection after first load
- 🌱 **Demo Seed Data** — 20 randomised workouts pre-loaded on first visit so the app looks great immediately

---

## Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Markup       | HTML5 (semantic elements, ARIA labels)        |
| Styling      | CSS3 (Custom Properties, Flexbox, Grid)       |
| Scripting    | Vanilla JavaScript (ES6+, no dependencies)    |
| Charts       | HTML5 Canvas API (built-in, no library)       |
| Fonts        | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Persistence  | Web Storage API (`localStorage`)              |
| Hosting      | Any static file server, or simply `file://`   |

---

## Project Structure

```
FitTrack/
│
├── index.html              # Single entry point — entire app shell lives here
│
├── css/
│   └── styles.css          # All styles: design tokens, layout, components, dark mode
│
├── js/
│   └── script.js           # All logic: data layer, routing, charts, modal, seed data
│
├── docs/                   # Extended documentation (API docs, user guide, output format)
│   ├── api-documentation.md
│   ├── user-guide.md
│   └── output-format.md
│
├── Explanation your view/  # Agent documentation folder
│
└── README.md               # You are here
```

### Key File Responsibilities

| File | Responsibility |
|------|----------------|
| `index.html` | App shell, all four section panels, modal markup, sidebar & mobile header |
| `css/styles.css` | CSS custom properties (light + dark palettes), responsive layout, component styles |
| `js/script.js` | Data CRUD (`localStorage`), section routing, chart rendering, modal logic, demo seed |

---

## Getting Started

FitTrack is a **zero-dependency static application**. There is no build step, no `npm install`, and no server required.

### Option 1 — Open directly in a browser (simplest)

```bash
# Clone or download the repository
git clone https://github.com/your-org/fittrack.git
cd fittrack

# Open the app
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or simply double-click `index.html` in your file manager.

### Option 2 — Serve with a local HTTP server (recommended for development)

Using Python (built-in on most systems):

```bash
# Python 3
python -m http.server 8080

# Then visit:
# http://localhost:8080
```

Using Node.js `serve`:

```bash
npx serve .
# Then visit the URL printed in the terminal
```

Using VS Code **Live Server** extension:
1. Right-click `index.html` in the Explorer panel
2. Select **Open with Live Server**

### Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 80+            |
| Firefox | 75+            |
| Safari  | 13.1+          |
| Edge    | 80+            |

> **Note:** FitTrack uses the HTML5 Canvas API and `localStorage`. Both are universally supported in all modern browsers.

---

## Usage Guide

### Dashboard

The Dashboard is the **home screen**, shown by default when the app loads.

| Widget | Description |
|--------|-------------|
| 🔥 Calories Burned | Total kcal burned across all logged workouts |
| 🏃 Total Workouts | Count of every saved workout session |
| ⏱️ Minutes Active | Sum of all workout durations in minutes |
| 📅 Active Days | Number of distinct calendar days with at least one workout |
| Weekly Activity Bar Chart | Calorie totals for each of the past 7 days, rendered on Canvas |
| Workout Split Donut | Proportion of Cardio / Strength / Flexibility / Sports sessions |
| Recent Workouts | The 5 most recent entries; click **View All →** to jump to Workouts |

---

### Workouts

The Workouts section shows your **full workout history**.

#### Filtering
Use the filter bar at the top to show only a specific type:

```
[ All ]  [ Cardio ]  [ Strength ]  [ Flexibility ]  [ Sports ]
```

Click any button to toggle that view — only matching workouts are displayed.

#### Live Search
Type in the search box to instantly filter by **workout name** or **type**. Filtering and search stack together.

#### Workout Row Layout

```
🏃 Cardio  |  Morning Run  |  15 Nov 2024 · Cardio · Medium  |  45 min  |  320 kcal  |  🗑️
```

Click the **🗑️** delete button to permanently remove a workout. A toast notification confirms the deletion.

---

### Goals

Set three **weekly targets** to keep yourself accountable:

| Goal Card | Unit | Description |
|-----------|------|-------------|
| Weekly Workouts | sessions | Number of workout sessions per week |
| Weekly Calories | kcal | Total calories to burn per week |
| Weekly Minutes | min | Total active minutes per week |

Each card shows:
- A number input for your target value
- A progress bar that fills based on this week's actual data
- A percentage label (e.g., `72 %`)
- A status message (`On track! 🎉` / `Keep pushing! 💪`)

Click **Save Goals** to persist your targets. They are saved to `localStorage` and survive page refreshes.

---

### Progress

The Progress section provides **long-term trend analysis**.

#### 30-Day Line Charts

| Chart | Description |
|-------|-------------|
| Calories Burned | Daily calorie totals over the last 30 days (blue line + gradient fill) |
| Workout Duration Trend | Daily total duration in minutes over the last 30 days (green line + gradient fill) |

Dots appear on the line for every day that has at least one workout.

#### Monthly Summary Grid

A 6-month retrospective table showing, for each calendar month:
- **Workouts** — total number of sessions
- **Calories** — total kcal burned

---

### Log Workout Modal

Click the **＋ Log Workout** button (sidebar on desktop, or the **＋** button in the mobile header) to open the Log Workout form.

#### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Workout Name | Text input | ✅ Yes | e.g., `Morning Run` |
| Type | Select dropdown | ✅ Yes | Cardio / Strength / Flexibility / Sports |
| Date | Date picker | ✅ Yes | Defaults to today |
| Duration | Number input | ✅ Yes | In minutes |
| Calories Burned | Number input | ✅ Yes | In kcal |
| Intensity | Toggle buttons | ✅ Yes | Easy / Medium / Hard |
| Notes | Textarea | ❌ Optional | Free-form notes |

#### Closing the Modal

The modal can be dismissed in three ways:
- Click the **✕** button in the top-right corner
- Click the **Cancel** button
- Click anywhere on the **dark overlay backdrop**

A **toast notification** confirms the workout was saved successfully.

---

### Dark Mode

Click the **🌙 Dark Mode** toggle at the bottom of the sidebar to switch between light and dark themes.

- The preference is saved to `localStorage` (`ft_dark`) and restored on every page load.
- Dark mode is implemented using a `.dark` class on `<body>` that overrides all CSS custom properties — no JavaScript re-painting required.

---

## Data Storage

FitTrack uses the browser's **`localStorage` API** exclusively. No data ever leaves your device.

### localStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `ft_workouts` | `JSON string` → `Array<Workout>` | All saved workout objects |
| `ft_goals` | `JSON string` → `GoalsObject` | Current weekly goal targets |
| `ft_dark` | `JSON string` → `boolean` | Dark mode preference (`true` / `false`) |

#### Goals Object Shape

```json
{
  "workouts": 5,
  "calories": 2500,
  "minutes": 200
}
```

### Workout Object Schema

Each workout is stored as a plain JSON object:

```json
{
  "id": 1700000000000,
  "name": "Morning Run",
  "type": "cardio",
  "date": "2024-11-15",
  "duration": 45,
  "calories": 320,
  "intensity": 2,
  "notes": "Felt great today"
}
```

| Field | Type | Values / Notes |
|-------|------|----------------|
| `id` | `number` | `Date.now()` timestamp — used as a unique key |
| `name` | `string` | User-provided workout name |
| `type` | `string` | `"cardio"` \| `"strength"` \| `"flexibility"` \| `"sports"` |
| `date` | `string` | ISO 8601 date — `"YYYY-MM-DD"` |
| `duration` | `number` | Duration in **minutes** (integer) |
| `calories` | `number` | Calories burned in **kcal** (integer) |
| `intensity` | `number` | `1` = Easy · `2` = Medium · `3` = Hard |
| `notes` | `string` | Optional free-text notes (may be empty string `""`) |

### Workout Types & Display Colors

| Type | Icon | Hex Color | Usage |
|------|------|-----------|-------|
| `cardio` | 🏃 | `#4f7ef8` | Blue |
| `strength` | 🏋️ | `#f97316` | Orange |
| `flexibility` | 🧘 | `#a855f7` | Purple |
| `sports` | ⚽ | `#22c55e` | Green |

### Clearing All Data

To reset the application to its initial state (re-triggers demo seed on next load):

```javascript
// Run in the browser DevTools console
localStorage.removeItem('ft_workouts');
localStorage.removeItem('ft_goals');
localStorage.removeItem('ft_dark');
location.reload();
```

---

## Customisation

### Changing Goal Defaults

The default goal values are set inside `js/script.js`. Search for the `DEFAULT_GOALS` constant (or the `loadGoals` function) and update the fallback values:

```javascript
const DEFAULT_GOALS = {
  workouts: 5,    // sessions per week
  calories: 2500, // kcal per week
  minutes:  200   // minutes per week
};
```

### Changing Workout Type Colors

Colors are defined in `js/script.js` in the `TYPE_CONFIG` (or similar) map. Locate the hex values for each type and replace them:

```javascript
const TYPE_COLORS = {
  cardio:      '#4f7ef8',  // → change to any valid CSS color
  strength:    '#f97316',
  flexibility: '#a855f7',
  sports:      '#22c55e'
};
```

The same tokens should be kept in sync with `css/styles.css` if badge colors are declared there too.

### Modifying the CSS Design System

All design tokens live at the top of `css/styles.css` as CSS custom properties:

```css
/* Light theme */
:root {
  --color-primary:    #4f7ef8;
  --color-bg:         #f8fafc;
  --color-surface:    #ffffff;
  --color-text:       #1e293b;
  /* … */
}

/* Dark theme overrides */
body.dark {
  --color-bg:         #0f172a;
  --color-surface:    #1e293b;
  --color-text:       #f1f5f9;
  /* … */
}
```

Change any value here to restyle the entire application instantly.

### Modifying Demo Seed Data

The `seedDemo()` function in `js/script.js` generates 20 random workouts on first load. You can:
- **Change the count** — modify the loop limit (`for (let i = 0; i < 20; i++)`)
- **Adjust date range** — change the `30` in the random date offset calculation
- **Add fixed workouts** — push hardcoded workout objects into the seed array before saving

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** this repository and create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**, keeping the zero-dependency philosophy in mind — please do not add npm packages or build tooling unless absolutely necessary and discussed first.

3. **Test manually** across at least Chrome and Firefox, in both light and dark modes, at desktop (≥1024 px) and mobile (≤480 px) viewports.

4. **Commit** with a clear, descriptive message:
   ```bash
   git commit -m "feat: add export workouts to CSV"
   ```

5. **Push** your branch and **open a Pull Request** against `main`. Fill in the PR template with a description of what you changed and why.

### Reporting Bugs

Please open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behaviour
- Browser + OS version
- Any relevant `console` errors

### Code Style

- Use **2-space indentation**
- Prefer `const` / `let` over `var`
- Keep functions small and single-purpose
- Add a JSDoc comment to any new public function

---

## License

```
MIT License

Copyright (c) 2024 FitTrack Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  Made with ❤️ and <strong>zero dependencies</strong> · <a href="#-fittrack--your-fitness-journey">Back to top ↑</a>
</div>

---

*End of this Doc*
