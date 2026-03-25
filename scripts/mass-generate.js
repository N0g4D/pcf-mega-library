#!/usr/bin/env node
/**
 * mass-generate.js
 * -----------------
 * Pure Node.js FS scaffold generator. Reads catalog.json and creates a full
 * PCF project for every component using the validated golden template.
 *
 * Supports a rich `properties` schema in catalog.json:
 *   - Enum properties → <property of-type="Enum"> with <value> children
 *   - dataset components → <data-set> binding
 *   - Typed ManifestTypes.d.ts with string unions for Enums
 *
 * Usage:
 *   node scripts/mass-generate.js
 *   node scripts/mass-generate.js --dry-run
 *   node scripts/mass-generate.js --force --only GlassPanelSlideOut,DataMatrix
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = path.join(__dirname, "..");
const COMPONENTS_DIR = path.join(ROOT, "components");
const CATALOG_PATH = path.join(ROOT, "catalog.json");
const NAMESPACE = "MegaPCF";
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const FORCE_ALL = process.argv.includes("--force-all"); // Also overwrite index.ts + Component.tsx

// Parse --only flag: comma-separated component names
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx >= 0 && process.argv[onlyIdx + 1]
  ? new Set(process.argv[onlyIdx + 1].split(","))
  : null;

// ---------------------------------------------------------------------------
// Load catalog
// ---------------------------------------------------------------------------

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
console.log(`Loaded catalog: ${catalog.length} components total.`);
if (ONLY) console.log(`Targeting only: ${[...ONLY].join(", ")}`);
if (FORCE) console.log(`Force mode: will overwrite existing source files.`);
console.log();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateGuid() {
  return crypto.randomUUID();
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeForJsx(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

// ---------------------------------------------------------------------------
// Property schema helpers
// ---------------------------------------------------------------------------

/** Map catalog property type to PCF ManifestTypes TypeScript type */
function propToTsType(prop) {
  if (prop.type === "Enum") {
    const union = prop.enum.map(e => `"${e.value}"`).join(" | ");
    return `ComponentFramework.PropertyTypes.EnumProperty<${union}>`;
  }
  switch (prop.type) {
    case "SingleLine.Text": return "ComponentFramework.PropertyTypes.StringProperty";
    case "Multiple":        return "ComponentFramework.PropertyTypes.StringProperty";
    case "TwoOptions":      return "ComponentFramework.PropertyTypes.TwoOptionsProperty";
    case "Whole.None":      return "ComponentFramework.PropertyTypes.WholeNumberProperty";
    case "Decimal":         return "ComponentFramework.PropertyTypes.DecimalNumberProperty";
    case "FP":              return "ComponentFramework.PropertyTypes.FloatingNumberProperty";
    case "Currency":        return "ComponentFramework.PropertyTypes.NumberProperty";
    default:                return "ComponentFramework.PropertyTypes.StringProperty";
  }
}

/** Map catalog property type to TypeScript output type */
function propToOutputTs(prop) {
  if (prop.type === "Enum") {
    return prop.enum.map(e => `"${e.value}"`).join(" | ");
  }
  switch (prop.type) {
    case "SingleLine.Text": return "string";
    case "Multiple":        return "string";
    case "TwoOptions":      return "boolean";
    case "Whole.None":      return "number";
    case "Decimal":         return "number";
    case "FP":              return "number";
    case "Currency":        return "number";
    default:                return "string";
  }
}

/** Check if a component has a properties schema */
function hasSchema(comp) {
  return Array.isArray(comp.properties) && comp.properties.length > 0;
}

/** Get input properties (non-output) */
function inputProps(comp) {
  if (!hasSchema(comp)) return [];
  return comp.properties.filter(p => p.usage !== "output");
}

/** Get output properties */
function outputProps(comp) {
  if (!hasSchema(comp)) return [];
  return comp.properties.filter(p => p.usage === "output");
}

// ---------------------------------------------------------------------------
// Template generators (Golden Template v2 — Schema-Aware)
// ---------------------------------------------------------------------------

function gitignore() {
  return `# dependencies
/node_modules

# generated directory
**/generated

# output directory
/out

# msbuild output directories
/bin
/obj

# MSBuild Binary and Structured Log
*.binlog

# Visual Studio cache/options directory
/.vs

# macos
.DS_Store
`;
}

function pcfconfig() {
  return `{
    "outDir": "./out/controls"
}
`;
}

function tsconfig() {
  return `{
    "extends": "../../../node_modules/pcf-scripts/tsconfig_base.json",
    "compilerOptions": {
        "typeRoots": ["node_modules/@types", "../../../node_modules/@types"]
    }
}
`;
}

function eslintConfig() {
  return `import eslintjs from "@eslint/js";
import microsoftPowerApps from "@microsoft/eslint-plugin-power-apps";
import pluginPromise from "eslint-plugin-promise";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["**/generated"],
  },
  eslintjs.configs.recommended,
  ...typescriptEslint.configs.recommendedTypeChecked,
  ...typescriptEslint.configs.stylisticTypeChecked,
  pluginPromise.configs["flat/recommended"],
  microsoftPowerApps.configs.paCheckerHosted,
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      "@microsoft/power-apps": microsoftPowerApps,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ComponentFramework: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
`;
}

function pcfproj(name) {
  const guid = generateGuid();
  return `<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="15.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <PowerAppsTargetsPath>$(MSBuildExtensionsPath)\\Microsoft\\VisualStudio\\v$(VisualStudioVersion)\\PowerApps</PowerAppsTargetsPath>
  </PropertyGroup>

  <Import Project="$(MSBuildExtensionsPath)\\$(MSBuildToolsVersion)\\Microsoft.Common.props" />
  <Import Project="$(PowerAppsTargetsPath)\\Microsoft.PowerApps.VisualStudio.Pcf.props" Condition="Exists('$(PowerAppsTargetsPath)\\Microsoft.PowerApps.VisualStudio.Pcf.props')" />

  <PropertyGroup>
    <Name>${name}</Name>
    <ProjectGuid>${guid}</ProjectGuid>
    <OutputPath>$(MSBuildThisFileDirectory)out\\controls</OutputPath>
    <RunNpmInstall>false</RunNpmInstall>
  </PropertyGroup>

  <PropertyGroup>
    <TargetFrameworkVersion>v4.6.2</TargetFrameworkVersion>
    <!--Remove TargetFramework when this is available in 16.1-->
    <TargetFramework>net462</TargetFramework>
    <RestoreProjectStyle>PackageReference</RestoreProjectStyle>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.PowerApps.MSBuild.Pcf" Version="1.*" />
    <PackageReference Include="Microsoft.NETFramework.ReferenceAssemblies" Version="1.0.0" PrivateAssets="All" />
  </ItemGroup>

  <ItemGroup>
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\.gitignore" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\bin\\**" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\obj\\**" />
    <ExcludeDirectories Include="$(OutputPath)\\**" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\*.pcfproj" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\*.pcfproj.user" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\*.sln" />
    <ExcludeDirectories Include="$(MSBuildThisFileDirectory)\\node_modules\\**" />
  </ItemGroup>

  <ItemGroup>
    <None Include="$(MSBuildThisFileDirectory)\\**" Exclude="@(ExcludeDirectories)" />
  </ItemGroup>

  <Import Project="$(MSBuildToolsPath)\\Microsoft.Common.targets" />
  <Import Project="$(PowerAppsTargetsPath)\\Microsoft.PowerApps.VisualStudio.Pcf.targets" Condition="Exists('$(PowerAppsTargetsPath)\\Microsoft.PowerApps.VisualStudio.Pcf.targets')" />

</Project>
`;
}

function packageJson(comp) {
  const scopedName = `@pcf-mega/${toKebabCase(comp.folder)}-${toKebabCase(comp.name)}`;
  return `{
  "name": "${scopedName}",
  "version": "1.0.0",
  "description": "Project containing your PowerApps Component Framework (PCF) control.",
  "scripts": {
    "build": "pcf-scripts build",
    "clean": "pcf-scripts clean",
    "lint": "pcf-scripts lint",
    "lint:fix": "pcf-scripts lint fix",
    "rebuild": "pcf-scripts rebuild",
    "start": "pcf-scripts start",
    "start:watch": "pcf-scripts start watch",
    "refreshTypes": "pcf-scripts refreshTypes"
  },
  "dependencies": {
    "@fluentui/react-components": "^9.73.4",
    "@fluentui/react-icons": "^2.0.321",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.1",
    "@microsoft/eslint-plugin-power-apps": "^0.2.51",
    "@types/powerapps-component-framework": "^1.3.16",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint-plugin-promise": "^7.1.0",
    "eslint-plugin-react": "^7.37.2",
    "globals": "^15.15.0",
    "pcf-scripts": "^1",
    "pcf-start": "^1",
    "typescript": "^5.8.3",
    "typescript-eslint": "8.44.0"
  }
}
`;
}

// ---------------------------------------------------------------------------
// ControlManifest.Input.xml — Schema-Aware
// ---------------------------------------------------------------------------

function manifestXml(comp) {
  const name = comp.name;
  const desc = escapeXml(comp.description);
  const isDataset = comp.dataset === true;

  let propsXml = "";

  if (hasSchema(comp)) {
    for (const prop of comp.properties) {
      if (prop.type === "Enum") {
        // Enum property with <value> children; default="true" on the matching value node
        const defaultVal = prop.defaultValue || prop.enum[0].value;
        const valuesXml = prop.enum.map(e => {
          const isDefault = e.value === defaultVal;
          return `      <value name="${e.value}" display-name-key="${escapeXml(e.displayName)}"${isDefault ? ' default="true"' : ""}>${e.value}</value>`;
        }).join("\n");

        propsXml += `\n    <property name="${prop.name}" display-name-key="${escapeXml(prop.displayName)}" description-key="${escapeXml(prop.description)}" of-type="Enum" usage="${prop.usage}" required="${prop.required}">\n${valuesXml}\n    </property>\n`;
      } else {
        // Standard property
        propsXml += `\n    <property name="${prop.name}" display-name-key="${escapeXml(prop.displayName)}" description-key="${escapeXml(prop.description)}" of-type="${prop.type}" usage="${prop.usage}" required="${prop.required}" />\n`;
      }
    }
  } else {
    // Fallback: no schema → single sampleProperty
    propsXml = `\n    <property name="sampleProperty" display-name-key="Sample Property" description-key="A sample input property for ${escapeXml(name)}." of-type="SingleLine.Text" usage="bound" required="true" />\n`;
  }

  // Dataset binding
  let datasetXml = "";
  if (isDataset) {
    datasetXml = `\n    <data-set name="dataSet" display-name-key="Data Set" description-key="The dataset to display." />\n`;
  }

  return `<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="${NAMESPACE}" constructor="${name}" version="1.0.0" display-name-key="${name}" description-key="${desc}" control-type="standard">
    <external-service-usage enabled="false" />
${datasetXml}${propsXml}
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

// ---------------------------------------------------------------------------
// ManifestTypes.d.ts — Schema-Aware with strict Enum unions
// ---------------------------------------------------------------------------

function manifestTypes(comp) {
  const name = comp.name;
  const isDataset = comp.dataset === true;

  if (!hasSchema(comp)) {
    // Fallback: sampleProperty
    return `/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    sampleProperty: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    sampleProperty?: string;
}
`;
  }

  // Build IInputs
  const inputs = inputProps(comp);
  let inputLines = inputs.map(p => `    ${p.name}: ${propToTsType(p)};`).join("\n");

  // Add dataset if applicable
  if (isDataset) {
    inputLines = `    dataSet: ComponentFramework.PropertyTypes.DataSet;\n` + inputLines;
  }

  // Build IOutputs
  const outputs = outputProps(comp);
  let outputLines = outputs.map(p => `    ${p.name}?: ${propToOutputTs(p)};`).join("\n");

  // Bound input properties can also appear in outputs
  const boundInputs = inputs.filter(p => p.usage === "bound");
  const boundOutputLines = boundInputs.map(p => `    ${p.name}?: ${propToOutputTs(p)};`).join("\n");

  const allOutputLines = [boundOutputLines, outputLines].filter(Boolean).join("\n");

  return `/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
${inputLines}
}
export interface IOutputs {
${allOutputLines}
}
`;
}

// ---------------------------------------------------------------------------
// index.ts — Schema-Aware
// ---------------------------------------------------------------------------

function indexTs(comp) {
  const name = comp.name;

  if (!hasSchema(comp)) {
    // Fallback: sampleProperty-based template
    return `import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ${name}Component } from "./${name}Component";

export class ${name}
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
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
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._root = createRoot(container);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const rawValue = context.parameters.sampleProperty?.raw ?? "";

    this._root.render(
      React.createElement(${name}Component, {
        value: typeof rawValue === "string" ? rawValue : "",
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

  // Schema-aware: extract each property from context.parameters
  const inputs = inputProps(comp);
  const propExtractions = inputs.map(p => {
    if (p.type === "Enum") {
      const defaultVal = p.defaultValue || p.enum[0].value;
      return `    const ${p.name} = context.parameters.${p.name}?.raw ?? "${defaultVal}";`;
    } else if (p.type === "TwoOptions") {
      return `    const ${p.name} = context.parameters.${p.name}?.raw ?? false;`;
    } else if (p.type === "Whole.None" || p.type === "Decimal" || p.type === "FP") {
      return `    const ${p.name} = context.parameters.${p.name}?.raw ?? 0;`;
    } else if (p.type === "Multiple") {
      return `    const ${p.name} = context.parameters.${p.name}?.raw ?? "";`;
    } else {
      return `    const ${p.name} = context.parameters.${p.name}?.raw ?? "";`;
    }
  });

  const propPassthrough = inputs.map(p => `        ${p.name},`).join("\n");

  return `import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { ${name}Component } from "./${name}Component";

export class ${name}
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  private _container: HTMLDivElement;
  private _root: Root;
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
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._root = createRoot(container);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
${propExtractions.join("\n")}

    this._root.render(
      React.createElement(${name}Component, {
${propPassthrough}
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

// ---------------------------------------------------------------------------
// Component.tsx — Schema-Aware
// ---------------------------------------------------------------------------

function componentTsx(comp) {
  const name = comp.name;
  const desc = comp.description;

  if (!hasSchema(comp)) {
    // Fallback: generic card template
    return `import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Card,
  CardHeader,
  Body1,
  Subtitle2,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface I${name}Props {
  value: string;
}

// ---------------------------------------------------------------------------
// Styles (Griffel — using shorthands for border to satisfy strict typing)
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamilyBase,
  },
  card: {
    width: "100%",
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  header: {
    marginBottom: tokens.spacingVerticalS,
  },
  badge: {
    marginLeft: tokens.spacingHorizontalS,
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
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            header={
              <Subtitle2>
                ${name}
                <Badge className={classes.badge} appearance="outline" color="informative" size="small">
                  PCF
                </Badge>
              </Subtitle2>
            }
            description={<Caption1>${escapeForJsx(desc)}</Caption1>}
          />
          {value && <Body1>Current value: {value}</Body1>}
        </Card>
      </div>
    </FluentProvider>
  );
};
`;
  }

  // Schema-aware: generate typed props interface
  const inputs = inputProps(comp);
  const propsInterface = inputs.map(p => {
    if (p.type === "Enum") {
      const union = p.enum.map(e => `"${e.value}"`).join(" | ");
      return `  ${p.name}: ${union};`;
    } else if (p.type === "TwoOptions") {
      return `  ${p.name}: boolean;`;
    } else if (p.type === "Whole.None" || p.type === "Decimal" || p.type === "FP") {
      return `  ${p.name}: number;`;
    } else {
      return `  ${p.name}: string;`;
    }
  });

  const destructured = inputs.map(p => p.name).join(", ");

  return `import * as React from "react";
import {
  FluentProvider,
  webLightTheme,
  Card,
  CardHeader,
  Body1,
  Subtitle2,
  Caption1,
  Badge,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface I${name}Props {
${propsInterface.join("\n")}
}

// ---------------------------------------------------------------------------
// Styles (Griffel — using shorthands for border to satisfy strict typing)
// ---------------------------------------------------------------------------

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    fontFamily: tokens.fontFamilyBase,
  },
  card: {
    width: "100%",
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  header: {
    marginBottom: tokens.spacingVerticalS,
  },
  badge: {
    marginLeft: tokens.spacingHorizontalS,
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ${name}Component: React.FC<I${name}Props> = ({ ${destructured} }) => {
  const classes = useStyles();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardHeader
            className={classes.header}
            header={
              <Subtitle2>
                ${name}
                <Badge className={classes.badge} appearance="outline" color="informative" size="small">
                  PCF
                </Badge>
              </Subtitle2>
            }
            description={<Caption1>${escapeForJsx(desc)}</Caption1>}
          />
        </Card>
      </div>
    </FluentProvider>
  );
};
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let created = 0;
let skipped = 0;
let errors = 0;
let overwritten = 0;

for (let i = 0; i < catalog.length; i++) {
  const comp = catalog[i];

  // --only filter
  if (ONLY && !ONLY.has(comp.name)) {
    skipped++;
    continue;
  }

  // Target: components/<Category>/<Name>/
  const projectDir = path.join(COMPONENTS_DIR, comp.folder, comp.name);
  const sourceDir = path.join(projectDir, comp.name);
  const generatedDir = path.join(sourceDir, "generated");

  // Skip if already exists (unless --force or --force-all)
  if (fs.existsSync(sourceDir) && !FORCE && !FORCE_ALL) {
    skipped++;
    continue;
  }

  const isOverwrite = fs.existsSync(sourceDir);

  if (DRY_RUN) {
    created++;
    if (isOverwrite) overwritten++;
    if (created % 100 === 0) {
      console.log(`  [DRY] ${created} components processed...`);
    }
    continue;
  }

  try {
    // Create directories
    fs.mkdirSync(generatedDir, { recursive: true });

    // Write project-level files (only if new, don't clobber existing pcfproj GUIDs)
    if (!isOverwrite) {
      fs.writeFileSync(path.join(projectDir, ".gitignore"), gitignore());
      fs.writeFileSync(path.join(projectDir, "pcfconfig.json"), pcfconfig());
      fs.writeFileSync(path.join(projectDir, "tsconfig.json"), tsconfig());
      fs.writeFileSync(path.join(projectDir, "eslint.config.mjs"), eslintConfig());
      fs.writeFileSync(path.join(projectDir, `${comp.name}.pcfproj`), pcfproj(comp.name));
      fs.writeFileSync(path.join(projectDir, "package.json"), packageJson(comp));
    }

    // Symlink local node_modules → root node_modules (workspace hoisting)
    const localNm = path.join(projectDir, "node_modules");
    try {
      if (!fs.existsSync(localNm)) {
        fs.symlinkSync(path.join(ROOT, "node_modules"), localNm, "junction");
      }
    } catch (_) {
      // Symlink may already exist or lack permissions — non-fatal
    }

    // Write/overwrite source files inside <Name>/<Name>/
    fs.writeFileSync(path.join(sourceDir, "ControlManifest.Input.xml"), manifestXml(comp));
    fs.writeFileSync(path.join(generatedDir, "ManifestTypes.d.ts"), manifestTypes(comp));

    // Only write index.ts and Component.tsx for NEW scaffolds or --force-all
    // (--force alone preserves hand-coded flagship .ts/.tsx files)
    if (!isOverwrite || FORCE_ALL) {
      fs.writeFileSync(path.join(sourceDir, "index.ts"), indexTs(comp));
      fs.writeFileSync(path.join(sourceDir, `${comp.name}Component.tsx`), componentTsx(comp));
    }

    created++;
    if (isOverwrite) overwritten++;

    if (created % 100 === 0) {
      console.log(`  [OK] ${created} components generated...`);
    }
  } catch (err) {
    console.error(`  [FAIL] ${comp.folder}/${comp.name}: ${err.message}`);
    errors++;
  }
}

console.log(`
${"=".repeat(60)}
  MASS GENERATION COMPLETE
${"=".repeat(60)}
  Created:     ${created}
  Overwritten: ${overwritten}
  Skipped:     ${skipped}
  Errors:      ${errors}
  Total:       ${catalog.length}
${DRY_RUN ? "\n  (DRY RUN — no files were written)\n" : ""}
${"=".repeat(60)}
`);
