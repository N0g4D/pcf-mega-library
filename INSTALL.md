# Installation & Deployment Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 18.x | [nodejs.org](https://nodejs.org) |
| npm | >= 9.x | Ships with Node.js |
| Power Platform CLI (`pac`) | >= 1.30 | `dotnet tool install --global Microsoft.PowerApps.CLI.Tool` |
| .NET SDK | >= 6.0 | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| MSBuild | >= 15.0 | Included with Visual Studio or .NET SDK |

Verify your tools:

```bash
node -v          # v18+
npm -v           # 9+
pac help         # Should print CLI version
dotnet --version # 6.0+
```

---

## 1. Clone & Install

```bash
git clone https://github.com/pcf-mega/library.git
cd pcf-mega-library
npm install
```

---

## 2. Scaffold Components from Catalog

The repository ships with a `catalog.json` containing 946 component definitions. To scaffold all of them:

```bash
# Preview what will be created (no files written)
npm run generate:scaffold -- --dry-run

# Scaffold all components
npm run generate:scaffold

# Scaffold a single category
npm run generate:scaffold -- --category Glassmorphism

# Scaffold a single component
npm run generate:scaffold -- --name GlassPanelSlideOut
```

Each scaffolded component gets:
- `ControlManifest.Input.xml`
- `index.ts` (PCF lifecycle class)
- `<Name>Component.tsx` (React + Fluent UI v9 template)
- `generated/ManifestTypes.d.ts`

---

## 3. Build a Single Component

Navigate to the component directory and build:

```bash
cd components/Glassmorphism/GlassPanelSlideOut

# Install dependencies (first time only)
npm install

# Build
npm run build

# Start the PCF test harness
npm start
```

The test harness launches at `http://localhost:8181`.

---

## 4. Create a Solution Package

### Option A: Using `pac` CLI (recommended)

```bash
# Create a solution project (one time)
mkdir -p solution && cd solution
pac solution init --publisher-name PcfMega --publisher-prefix pcfm

# Add a component reference
pac solution add-reference --path ../components/Glassmorphism/GlassPanelSlideOut

# Build the managed solution (.zip)
dotnet build --configuration Release
```

The solution `.zip` is output to `solution/bin/Release/`.

### Option B: Using MSBuild directly

```bash
cd components/Glassmorphism/GlassPanelSlideOut

# Restore NuGet packages
msbuild /t:restore

# Build the solution
msbuild /p:Configuration=Release
```

---

## 5. Deploy to Power Platform

### Option A: Push directly to a development environment

```bash
# Authenticate to your environment
pac auth create --url https://YOUR-ORG.crm.dynamics.com

# Push the component (dev environments only)
cd components/Glassmorphism/GlassPanelSlideOut
pac pcf push --publisher-prefix pcfm
```

### Option B: Import the solution package

```bash
# Import the solution .zip
pac solution import --path solution/bin/Release/PcfMega.zip --activate-plugins

# For managed solutions
pac solution import --path solution/bin/Release/PcfMega_managed.zip
```

### Option C: Via Power Platform Admin Center

1. Go to [make.powerapps.com](https://make.powerapps.com)
2. Navigate to **Solutions** > **Import solution**
3. Upload the `.zip` from `solution/bin/Release/`
4. Click **Import**

---

## 6. Use in Model-Driven Apps

1. Open your Model-driven app in the form editor
2. Select a field on the form
3. Click **Change control** > **Add control**
4. Find the PCF Mega Library control (e.g., `GlassPanelSlideOut`)
5. Configure the properties in the property panel
6. Save and Publish

---

## 7. Use in Canvas Apps

1. Open your Canvas app in Power Apps Studio
2. Go to **Insert** > **Get more components** > **Code**
3. Select the PCF Mega Library component
4. Drag it onto the canvas
5. Configure properties in the right panel

> **Note:** Canvas app support requires the component's `control-type` to be set to `standard` and the admin must enable **Code components for canvas apps** in the Power Platform admin center.

---

## 8. Batch Build All Components

For CI/CD or bulk builds:

```bash
# Build every scaffolded component
npm run build:all

# Or build a specific category
npm run build:component -- --category DataGrids
```

---

## 9. Solution Packaging for Multiple Components

To package multiple components into a single solution:

```bash
mkdir -p solution && cd solution
pac solution init --publisher-name PcfMega --publisher-prefix pcfm

# Add each component you want in the solution
pac solution add-reference --path ../components/Glassmorphism/GlassPanelSlideOut
pac solution add-reference --path ../components/Inputs/MegaActionButton
pac solution add-reference --path ../components/DataGrids/DataMatrix

# Build
dotnet build --configuration Release
```

---

## Troubleshooting

### `pac pcf push` fails with authentication error
```bash
pac auth clear
pac auth create --url https://YOUR-ORG.crm.dynamics.com
```

### MSBuild not found
Install the .NET SDK or Visual Studio Build Tools:
```bash
# macOS/Linux
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Windows (with Visual Studio)
# MSBuild is at: C:\Program Files\Microsoft Visual Studio\2022\...\MSBuild\Current\Bin\MSBuild.exe
```

### Component not showing in Canvas app
1. Ensure `control-type="standard"` in the manifest
2. Enable **Code components for canvas apps** in the admin center under **Settings > Features**
3. Republish the solution

### TypeScript compilation errors
```bash
# Regenerate manifest types
npm run refreshTypes

# Or manually
pcf-scripts refreshTypes
```

---

## CI/CD Integration

Example GitHub Actions workflow (`.github/workflows/build.yml`):

```yaml
name: Build PCF Components
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 8.0.x
      - run: dotnet tool install --global Microsoft.PowerApps.CLI.Tool
      - run: npm ci
      - run: npm run build:all
```

---

## Environment Matrix

| Environment | Deployment Method | Recommended |
|-------------|------------------|:-----------:|
| Development | `pac pcf push` | Yes |
| Testing | Solution import (unmanaged) | Yes |
| UAT | Solution import (managed) | Yes |
| Production | Solution import (managed) via pipeline | Yes |

---

Built with the Power Platform CLI and Fluent UI v9. For issues, open a ticket on GitHub.
