#!/usr/bin/env node
/**
 * generate-pcf-scaffold.js
 * -------------------------
 * Reads catalog.json and scaffolds every component using `pac pcf init`.
 * Then injects a standard React + Fluent UI v9 template into each component.
 *
 * Usage:
 *   node scripts/generate-pcf-scaffold.js                   # scaffold all
 *   node scripts/generate-pcf-scaffold.js --category Layout  # scaffold one category
 *   node scripts/generate-pcf-scaffold.js --name GlassPanel  # scaffold one component
 *   node scripts/generate-pcf-scaffold.js --dry-run          # preview without executing
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const categoryFilter = getArg("--category");
const nameFilter = getArg("--name");
const skipExisting = !args.includes("--force");

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

// ---------------------------------------------------------------------------
// Load catalog
// ---------------------------------------------------------------------------

const catalogPath = path.join(__dirname, "..", "catalog.json");
if (!fs.existsSync(catalogPath)) {
  console.error("ERROR: catalog.json not found. Run `npm run generate:catalog` first.");
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
console.log(`Loaded catalog with ${catalog.length} components.\n`);

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

let components = catalog;

if (categoryFilter) {
  components = components.filter(
    (c) => c.folder.toLowerCase() === categoryFilter.toLowerCase()
  );
  console.log(`Filtered to category "${categoryFilter}": ${components.length} components.\n`);
}

if (nameFilter) {
  components = components.filter(
    (c) => c.name.toLowerCase() === nameFilter.toLowerCase()
  );
  console.log(`Filtered to name "${nameFilter}": ${components.length} components.\n`);
}

if (components.length === 0) {
  console.log("No components matched the filter criteria.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function manifestXml(namespace, name, description) {
  return `<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="${namespace}" constructor="${name}" version="1.0.0" display-name-key="${name}" description-key="${description}" control-type="standard">
    <external-service-usage enabled="false">
    </external-service-usage>

    <property name="sampleProperty" display-name-key="Sample Property" description-key="A sample input property" of-type="SingleLine.Text" usage="bound" required="true" />

    <resources>
      <code path="index.ts" order="1" />
    </resources>

    <feature-usage>
      <uses-feature name="WebAPI" required="false" />
    </feature-usage>
  </control>
</manifest>
`;
}

function indexTs(name) {
  return `import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ${name}Component } from "./${name}Component";

export class ${name} implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _container: HTMLDivElement;
  private _root: Root;
  private _context: ComponentFramework.Context<IInputs>;
  private _notifyOutputChanged: () => void;

  constructor() {
    // Empty
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    _state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this._context = context;
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._root = createRoot(container);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this._context = context;

    const sampleValue = context.parameters.sampleProperty?.raw ?? "";

    this._root.render(
      React.createElement(${name}Component, {
        value: typeof sampleValue === "string" ? sampleValue : "",
        onValueChange: (newValue: string) => {
          // Handle output changes
          this._notifyOutputChanged();
        },
      })
    );
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    this._root.unmount();
  }
}
`;
}

function componentTsx(name, description) {
  return `import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  shorthands,
  Body1,
  Subtitle2,
} from "@fluentui/react-components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface I${name}Props {
  value: string;
  onValueChange: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    fontFamily: tokens.fontFamilyBase,
  },
  title: {
    marginBottom: tokens.spacingVerticalS,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ${name}Component: React.FC<I${name}Props> = ({ value }) => {
  const classes = useStyles();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Subtitle2 className={classes.title}>${name}</Subtitle2>
        <Body1>${description}</Body1>
        {value && <Body1>Current value: {value}</Body1>}
      </div>
    </FluentProvider>
  );
};
`;
}

// ---------------------------------------------------------------------------
// Scaffold
// ---------------------------------------------------------------------------

const componentsRoot = path.join(__dirname, "..", "components");
let scaffolded = 0;
let skipped = 0;
let errors = 0;

for (const comp of components) {
  const compDir = path.join(componentsRoot, comp.folder, comp.name);
  const label = `[${comp.folder}/${comp.name}]`;

  // Skip if already exists
  if (skipExisting && fs.existsSync(compDir)) {
    console.log(`  SKIP  ${label} (already exists)`);
    skipped++;
    continue;
  }

  if (dryRun) {
    console.log(`  DRY   ${label} -> ${compDir}`);
    scaffolded++;
    continue;
  }

  try {
    // Create directory
    fs.mkdirSync(compDir, { recursive: true });

    // Run pac pcf init
    try {
      execSync(
        `pac pcf init --namespace ${comp.namespace} --name ${comp.name} --template field --framework react --run-npm-install false`,
        { cwd: compDir, stdio: "pipe", timeout: 30000 }
      );
    } catch (pacError) {
      // pac pcf init may fail in some environments — fall back to manual scaffold
      console.log(`  WARN  ${label} pac pcf init failed, using manual scaffold`);
    }

    // Write our own files (overwriting pac's defaults)
    const manifestPath = path.join(compDir, "ControlManifest.Input.xml");
    const indexPath = path.join(compDir, "index.ts");
    const componentPath = path.join(compDir, `${comp.name}Component.tsx`);

    fs.writeFileSync(manifestPath, manifestXml(comp.namespace, comp.name, comp.description), "utf-8");
    fs.writeFileSync(indexPath, indexTs(comp.name), "utf-8");
    fs.writeFileSync(componentPath, componentTsx(comp.name, comp.description), "utf-8");

    // Create generated directory for ManifestTypes
    const generatedDir = path.join(compDir, "generated");
    fs.mkdirSync(generatedDir, { recursive: true });
    fs.writeFileSync(
      path.join(generatedDir, "ManifestTypes.d.ts"),
      `// Auto-generated manifest types for ${comp.name}
export interface IInputs {
  sampleProperty: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
  sampleProperty?: string;
}
`,
      "utf-8"
    );

    console.log(`  OK    ${label}`);
    scaffolded++;
  } catch (err) {
    console.error(`  FAIL  ${label}: ${err.message}`);
    errors++;
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`
${"=".repeat(50)}
Scaffold complete.
  Total:     ${components.length}
  Created:   ${scaffolded}
  Skipped:   ${skipped}
  Errors:    ${errors}
${dryRun ? "\n  (DRY RUN — no files were written)" : ""}
${"=".repeat(50)}
`);
