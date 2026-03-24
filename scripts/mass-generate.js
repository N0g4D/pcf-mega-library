#!/usr/bin/env node
/**
 * mass-generate.js
 * -----------------
 * Pure Node.js FS scaffold generator. Reads catalog.json and creates a full
 * PCF project for every component using the validated golden template.
 *
 * - No `pac pcf init` calls — pure file I/O for speed
 * - Skips the 3 already-built flagship components
 * - Generates Griffel-safe React boilerplate (shorthands.border, explicit casts)
 * - Logs progress every 100 components
 *
 * Usage:
 *   node scripts/mass-generate.js
 *   node scripts/mass-generate.js --dry-run
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

// Flagships already built — skip these
const SKIP_NAMES = new Set(["GlassPanelSlideOut", "MegaActionButton", "DataMatrix"]);

// ---------------------------------------------------------------------------
// Load catalog
// ---------------------------------------------------------------------------

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
console.log(`Loaded catalog: ${catalog.length} components total.`);
console.log(`Skipping ${SKIP_NAMES.size} flagship(s): ${[...SKIP_NAMES].join(", ")}\n`);

// ---------------------------------------------------------------------------
// Template generators (Golden Template)
// ---------------------------------------------------------------------------

function generateGuid() {
  return crypto.randomUUID();
}

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
    "extends": "./node_modules/pcf-scripts/tsconfig_base.json",
    "compilerOptions": {
        "typeRoots": ["node_modules/@types"]
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

function packageJson() {
  return `{
  "name": "pcf-project",
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

function manifestXml(name, description) {
  return `<?xml version="1.0" encoding="utf-8" ?>
<manifest>
  <control namespace="${NAMESPACE}" constructor="${name}" version="1.0.0" display-name-key="${name}" description-key="${escapeXml(description)}" control-type="standard">
    <external-service-usage enabled="false">
    </external-service-usage>

    <property name="sampleProperty" display-name-key="Sample Property" description-key="A sample input property for ${escapeXml(name)}." of-type="SingleLine.Text" usage="bound" required="true" />

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

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function manifestTypes(name) {
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

function indexTs(name) {
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

function componentTsx(name, description) {
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
            description={<Caption1>${escapeForJsx(description)}</Caption1>}
          />
          {value && <Body1>Current value: {value}</Body1>}
        </Card>
      </div>
    </FluentProvider>
  );
};
`;
}

function escapeForJsx(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let created = 0;
let skipped = 0;
let errors = 0;

for (let i = 0; i < catalog.length; i++) {
  const comp = catalog[i];

  // Skip flagships
  if (SKIP_NAMES.has(comp.name)) {
    skipped++;
    continue;
  }

  // Target: components/<Category>/<Name>/
  const projectDir = path.join(COMPONENTS_DIR, comp.folder, comp.name);
  const sourceDir = path.join(projectDir, comp.name);
  const generatedDir = path.join(sourceDir, "generated");

  // Skip if already exists
  if (fs.existsSync(sourceDir)) {
    skipped++;
    continue;
  }

  if (DRY_RUN) {
    created++;
    if (created % 100 === 0) {
      console.log(`  [DRY] ${created} components processed...`);
    }
    continue;
  }

  try {
    // Create directories
    fs.mkdirSync(generatedDir, { recursive: true });

    // Write project-level files
    fs.writeFileSync(path.join(projectDir, ".gitignore"), gitignore());
    fs.writeFileSync(path.join(projectDir, "pcfconfig.json"), pcfconfig());
    fs.writeFileSync(path.join(projectDir, "tsconfig.json"), tsconfig());
    fs.writeFileSync(path.join(projectDir, "eslint.config.mjs"), eslintConfig());
    fs.writeFileSync(path.join(projectDir, `${comp.name}.pcfproj`), pcfproj(comp.name));
    fs.writeFileSync(path.join(projectDir, "package.json"), packageJson());

    // Write source files inside <Name>/<Name>/
    fs.writeFileSync(path.join(sourceDir, "ControlManifest.Input.xml"), manifestXml(comp.name, comp.description));
    fs.writeFileSync(path.join(sourceDir, "index.ts"), indexTs(comp.name));
    fs.writeFileSync(path.join(sourceDir, `${comp.name}Component.tsx`), componentTsx(comp.name, comp.description));
    fs.writeFileSync(path.join(generatedDir, "ManifestTypes.d.ts"), manifestTypes(comp.name));

    created++;

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
  Created:   ${created}
  Skipped:   ${skipped} (flagships + already existing)
  Errors:    ${errors}
  Total:     ${catalog.length}
${DRY_RUN ? "\n  (DRY RUN — no files were written)\n" : ""}
${"=".repeat(60)}
`);
