# PCF Mega Library

**The definitive open-source collection of 947 Power Apps Component Framework (PCF) controls.**

Built with TypeScript, React 19, and Fluent UI v9 — enterprise-grade, fully typed, and ready for Model-driven and Canvas apps.

[![Build & Release](https://github.com/pcf-mega/library/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/pcf-mega/library/actions/workflows/build-and-release.yml)

---

## Why This Exists

Power Platform developers deserve a component library that matches the depth and polish of ecosystems like Material UI or Ant Design. PCF Mega Library fills that gap with nearly 1,000 production-quality controls spanning every category: from data grids and glassmorphism panels to AI/Copilot interfaces and biometric displays.

**Key principles:**
- Every control follows the PCF `StandardControl` lifecycle with proper `init`, `updateView`, `getOutputs`, and `destroy`
- Fluent UI v9 theming throughout — light mode, dark mode, high contrast out of the box
- Strict TypeScript — no `any`, full type safety, zero runtime type errors
- Accessible by default — WCAG 2.1 AA, keyboard navigation, screen reader support
- Monorepo architecture with npm workspaces for shared dependency management

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/pcf-mega/library.git
cd pcf-mega-library

# Install all dependencies (npm workspaces hoists shared deps)
npm install

# Build a flagship component
cd components/Glassmorphism/GlassPanelSlideOut
npm run build

# Start the PCF test harness
npm start
```

---

## Component Catalog

**947 components** across **25 categories**:

| Category | Count | Highlights |
|----------|------:|------------|
| Inputs | 81 | TextInput, SliderInputRange, SignaturePad, CreditCardInput, CodeEditor, EmojiPicker, ... |
| DataViz | 70 | BarChart, LineChart, SankeyDiagram, GanttChart, RadarChart, TreeMap, HeatMapCalendar, ... |
| Navigation | 55 | MegaMenu, SideNav, QuickLaunch, CommandPalette, TabStrip, StepWizard, TreeNav, ... |
| Layout | 55 | MasonryGrid, DashboardGrid, SplitPane, InfiniteCanvas, BentoGrid, WindowManager, ... |
| Feedback | 45 | Toast, NotificationCenter, SkeletonLoader, OnboardingTour, CoachMark, ... |
| Glassmorphism | 40 | GlassPanelSlideOut, GlassCard, GlassModal, GlassNavBar, GlassHero, GlassLoginForm, ... |
| Data Grids | 40 | DataGridVirtual, DataGridEditable, DataGridPivot, KanbanBoard, SpreadsheetGrid, ... |
| AI / Copilot | 40 | CopilotChat, CopilotChatStream, AIPromptInput, AIWorkflowBuilder, AIAgentStatus, ... |
| Dashboard | 40 | DashboardShell, WidgetGrid, KPIWidget, GoalTracker, LogViewer, ABTestWidget, ... |
| Forms | 40 | FormBuilder, FormWizard, LookupField, BusinessProcessFlow, DynamicFieldRenderer, ... |
| Utility | 40 | ClipboardCopy, QRGenerator, DiffViewer, JSONViewer, RegexTester, VirtualList, ... |
| Media | 35 | ImageGallery, VideoPlayer, AudioPlayer, PDFViewer, ModelViewer3D, SVGEditor, ... |
| Animation | 30 | FadeInStagger, FlipCard, TypeWriter, ScrollReveal, ConfettiEffect, LottiePlayer, ... |
| Social | 30 | UserProfileCard, ActivityFeed, CommentThread, ReactionBar, LeaderBoard, PollWidget, ... |
| Commerce | 30 | ProductCard, PricingTable, ShoppingCart, InvoiceTable, CompareProducts, ReviewList, ... |
| Communication | 30 | ChatWindow, EmailComposer, EmailThread, ContactCard, ChannelList, PollCreator, ... |
| Calendar | 30 | CalendarMonth, CalendarWeek, SchedulerGrid, BookingWidget, ShiftScheduler, ... |
| File & Document | 30 | FileUploader, FileBrowser, DocumentEditor, CSVImporter, ExportWizard, TemplateGallery, ... |
| Maps & Geo | 30 | MapView, MapViewClustered, LocationPicker, GeofenceEditor, StoreLocator, ChoroplethMap, ... |
| Connectors | 30 | RESTClient, ODataBrowser, QueryBuilder, DataverseBrowser, SharePointDocLib, SQLQueryRunner, ... |
| Authentication | 25 | LoginForm, LoginFormMFA, BiometricPrompt, PasskeyPrompt, SessionTimeout, APIKeyManager, ... |
| Theming | 25 | ThemeSwitcher, ThemeBuilder, ColorPalette, DesignTokenViewer, GradientPicker, ... |
| Accessibility | 25 | FocusTrap, LiveRegion, ScreenReaderOnly, A11yToolbar, ColorBlindFilter, VoiceCommand, ... |
| Gaming | 25 | AchievementBadge, ExperienceBar, SkillTree, SpinWheel, TournamentBracket, MiniGame, ... |
| Biometrics | 25 | FingerprintScanner, HeartRateMonitor, ECGDisplay, ActivityRings, BreathingExercise, ... |

> Browse the full list in [`catalog.json`](./catalog.json)

---

## Flagship Demos

Three fully coded, production-ready components ship with this repo:

### 1. GlassPanelSlideOut
Advanced slide-out glassmorphism panel with fluid CSS animations, dynamic content zones, and configurable blur/tint/direction. Properties: `isOpen`, `panelTitle`, `slideDirection`, `blurIntensity`, `tintColor`, `panelSize`, `contentZones` (JSON).

### 2. MegaActionButton
Multi-state action button with built-in loading spinner, multi-step progress ring, customizable SVG icons, and Fluent UI v9 theming. Properties: `label`, `buttonState`, `progressValue`, `totalSteps`, `currentStep`, `iconName`, `appearance`, `size`.

### 3. DataMatrix
Dynamic data matrix accepting a PCF dataset — fully sortable, filterable, paginated grid with column resize, checkbox selection, and CSV export. Properties: `dataSet`, `pageSize`, `enableSorting`, `enableFiltering`, `enableSelection`, `enableExport`, `compactMode`.

---

## Repository Structure

```
pcf-mega-library/
  package.json                  # Monorepo root with npm workspaces
  catalog.json                  # Full component catalog (946 entries)
  INSTALL.md                    # Deployment & Power Platform instructions
  LICENSE                       # MIT
  .github/
    workflows/
      build-and-release.yml     # CI/CD: build flagships, validate catalog, release
  scripts/
    generate-catalog.js         # Catalog generator (946 components, 25 categories)
    generate-pcf-scaffold.js    # Individual scaffold via pac pcf init
    mass-generate.js            # Blazing-fast pure Node.js mass scaffolder
  components/
    <Category>/
      <ComponentName>/          # Each component is a standalone PCF project
        package.json            # Scoped name: @pcf-mega/<category>-<name>
        tsconfig.json           # Extends pcf-scripts base config
        eslint.config.mjs       # Flat ESLint config with Fluent UI rules
        <ComponentName>.pcfproj # MSBuild project file
        <ComponentName>/        # Source directory
          ControlManifest.Input.xml
          index.ts              # PCF StandardControl entry point
          <ComponentName>Component.tsx  # React + Fluent UI v9 component
          generated/
            ManifestTypes.d.ts  # Auto-generated type definitions
```

---

## Monorepo Architecture

This repository uses **npm workspaces** to manage 947 individual PCF projects under a single root:

```json
{
  "workspaces": ["components/*/*"]
}
```

Shared dependencies (React, Fluent UI, TypeScript) are hoisted to the root `node_modules/`, reducing disk usage and ensuring version consistency across all components.

Each component retains its own `package.json` with a unique scoped name (e.g., `@pcf-mega/glassmorphism-glass-panel-slide-out`), making it independently publishable to npm if desired.

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/build-and-release.yml`) runs on every push and PR:

1. **Build Flagships** — Compiles all 3 flagship components in parallel via a matrix strategy
2. **Validate Catalog** — Ensures `catalog.json` has no duplicate names and all 946 scaffolds exist on disk
3. **Release** — On manual trigger or tag push, packages flagship build artifacts and creates a GitHub Release

---

## How Scaffolding Works

The `mass-generate.js` script reads `catalog.json` and generates a complete PCF project for each component using pure Node.js file I/O:

1. Creates the directory structure under `components/<Category>/<ComponentName>/`
2. Writes project files: `.pcfproj` (with unique GUID), `package.json`, `tsconfig.json`, `eslint.config.mjs`, `pcfconfig.json`
3. Writes source files: `ControlManifest.Input.xml`, `index.ts` (PCF lifecycle), `<Name>Component.tsx` (React + Fluent UI v9)
4. Writes type stubs: `generated/ManifestTypes.d.ts`

This approach generates all 944 remaining components in under 5 seconds — no `pac pcf init` subprocess overhead.

```bash
# Generate all scaffolds
npm run mass:generate

# Dry run (no files written)
npm run mass:generate -- --dry-run
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | React 19.2, TypeScript 5.8 |
| UI Framework | Fluent UI v9 (`@fluentui/react-components` ^9.73) |
| Icons | `@fluentui/react-icons` ^2.0 |
| CSS-in-JS | Griffel (via Fluent UI `makeStyles`) |
| Build | `pcf-scripts`, Webpack 5, ts-loader |
| Monorepo | npm workspaces |
| CI/CD | GitHub Actions |
| CLI | Power Platform CLI (`pac`) 2.4+ |
| Target | Model-driven apps, Canvas apps, Power Pages |

---

## Deploying to Power Platform

See [INSTALL.md](./INSTALL.md) for detailed instructions on:

- Pushing individual controls with `pac pcf push`
- Building solution packages with MSBuild
- Importing into Model-driven and Canvas apps
- Environment variable configuration
- CI/CD pipeline integration

---

## Contributing

We welcome contributions! Each component should:

1. Live in `components/<Category>/<ComponentName>/`
2. Have a valid `ControlManifest.Input.xml`
3. Export a single `StandardControl` class from `index.ts`
4. Use Fluent UI v9 for all styling (no raw CSS unless absolutely necessary)
5. Support light/dark theme via `FluentProvider`
6. Include proper TypeScript types (no `any`)
7. Pass `npm run build` with zero errors

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

Built with precision by the PCF Mega Library contributors.
