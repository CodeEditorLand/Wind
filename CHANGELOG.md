# Changelog

All notable changes to Wind (UI Service Layer) are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/).

## [v2.1] — Q2 2026: Full Workbench Lift

### Added

- 5 listen() event subscriptions: fileChange (`sky://vfs/fileChange`),
  configuration (`sky://configuration/changed`), terminal
  (`sky://terminal/data`), lifecycle willShutdown
  (`sky://lifecycle/willShutdown`), lifecycle phaseChanged
  (`sky://lifecycle/phaseChanged`)

### Changed

- TauriMainProcessService verified: 24 VS Code IPC channels routed to Mountain
- ResolveConfiguration confirmed loading real Mountain paths

## [v2.0] — Q1 2026: Editor Launch Sprint

### April 8-16: Tauri IPC Bridge Sprint

#### Added

- `Source/Service/TauriMainProcessService.ts` (232 lines, April 8) — IPC
  routing with 24 channel routes and 14 stub channels:
  - Routed: localFilesystem, storage, configuration, textFile, extensions,
    commands, terminal, output, notification, progress, quickInput, workspaces,
    themes, search, environment, decorations, workingCopy, keybinding,
    lifecycle, label, model, nativeHost, localPty, url, menubar, encryption,
    extensionHostStarter, extensionhostdebugservice
  - Stubbed: update, sign, policy, userDataProfiles, keyboardLayout,
    sharedProcess, utilityProcessWorker, meteredConnection, webContentExtractor,
    browserElements, NativeMcpDiscoveryHelper, sandboxHelper, mcpGateway,
    browserViewGroup, externalTerminal
- `Source/Polyfills/IPCRendererShim.ts` (373 lines) — binary IPC protocol
  (created then consolidated)
- `Source/Function/DevLog.ts` (72 lines, April 9) — development logging with
  short mode and fire-and-forget semantics
- MessageChannel for extension host IPC: Preload.ts +58 lines, init data →
  Initialized byte ([1]) → Ready byte ([2]) after 50ms
- Extension host protocol message forwarding to Mountain (+85 lines)
- ResolveConfiguration: +111 lines for INativeWindowConfiguration, profiles,
  colorScheme, accessibilitySupport; +94 lines for Mountain path resolution via
  RPC

#### Changed

- Preload.ts grew from 99 lines (March) to 190+ lines with debugging
  instrumentation
- IPC naming: ipcMain → IPC (PascalCase convention)
- Effect.either refactor for proper fiber-level failure handling in bootstrap

#### Removed

- 1,076 lines of legacy polyfills deleted (April 11):
  ChildProcessPolyfill.ts (77), FileProtocolShim.ts (58),
  FileSystemPolyfill.ts (44), NativeModulePolyfill.ts (62),
  ProcessPolyfill.ts (36), SharedProcessProxy.ts (68)

### January-March: Bootstrap + Preload Foundation

#### Added

- `Source/Preload.ts` (99 lines) — Tauri/Electron bridge
- `Source/Bootstrap/Types/` — 30+ VS Code type mirror files:
  BootstrapTypes.ts, Type/ subtree (BootstrapConfig, EnvironmentData, Mode,
  Platform, StageResult, etc.)
- `Source/Bootstrap/Types/VSCode/` — VSCodeConfigurationType,
  VSCodeLoggerType, VSCodeWorkbenchOptionsType
- TypeScript 5.9.3 → 6.0.2 upgrade (March 24)

## [v1.3] — Q4 2025: Dependency Maintenance

### Changed

- effect: 3.18.0 → 3.19.14
- @effect/platform: 0.92.0 → 0.94.1
- @effect/language-service: 0.60.x → 0.63.2
- No major Application/ restructures; module count stable

## [v1.2] — Q3 2025: Full Stack Integration

### Added

- 100+ Application service modules following Define/Implement/Problem pattern:
  - `Source/Application/{Service}/Define.ts` — interface
  - `Source/Application/{Service}/Implement.ts` — Effect-TS implementation
  - `Source/Application/{Service}/Problem.ts` — error types
- Services: Command, Configuration, Dialog, Editor, EditorGroup, File,
  FileSystem, Host, IPC, LanguageFeature, Logger, Marker, Notification,
  Policy, UntitledTextEditor, and more
- 300+ file infrastructure commit (September 12): template preparation

### Changed

- Effect-TS 3.17.x → 3.18.x
- solid-js 1.9.x stable
- @types/node 24.x

## [v1.1] — Q2 2025: Architecture Buildout

**May 30, 2025: the pivot point — Effect-TS + Application layer born.**

### Added

- `Source/Effect/` directory — Effect-TS service composition layer
- `Source/Application/` directory — 50+ service modules (Dialog, FileDialog,
  etc.) with Effect-TS-driven patterns
- `Source/Configuration/ESBuild/` — build config restructure
- effect, @effect/platform, @effect/experimental, @effect/language-service
  dependencies

### Removed

- Source/Element/Preview.scss
- SolidJS evaluation concluded

## [v1.0] — Q1 2025: Integration Phase

### Changed

- deepmerge-ts: 7.1.4 → 7.1.5
- solid-js: 1.9.4 → 1.9.5
- CODE_OF_CONDUCT.md, CONTRIBUTING.md governance refresh
- Target gen/delete cycles (CI/CD integration testing)

## [v0.2] — Q4 2024: Architecture Solidification

### Added

- Target/ artifacts: 88 files generated (Context/*, Element/*, Function/*,
  Interface/*, Script/Monaco/Theme/*.json, Stylesheet/*)
- Monaco themes: Active4D.json (154 lines), Amoled.json (219 lines)
- Stylesheet: Tippy/Dark.scss (132 lines), Tippy/Light.scss (41 lines)

### Changed

- solid-devtools: 0.31.2 → 0.31.7
- CSS custom properties: `--Mute` action-form convention

## [v0.1] — Q3 2024: Rapid Development

### Changed

- SCSS cleanup: Editor.scss reduced 42 lines; mixin borders/spacing refactored
- solid-js: 1.8.19 → 1.9.1
- monaco-editor: 0.51.0-rc2 → 0.52.0
- @playform/build: 0.1.2 → 0.1.7
- No new architectural folders; pure refinement

## [v0.0] — Q2 2024: Project Inception

### Added

- `Source/Context/` — React-style context primitives (Action, Connection,
  Environment, Session, Store)
- `Source/Element/` — SolidJS components (Editor.tsx, Button, Anchor, Tip,
  Footer)
- `Source/Library/` — helper functions (Create, Pad, Persist, Environment)
- `Source/Function/` — utilities (Merge)
- `Source/Stylesheet/` — SCSS (Element/*, Mixin/*)
- `Source/Variable/` — ESBuild config, StringURL constant

### Dependencies (First Release)

- solid-js 1.8.x, monaco-editor 0.51.x, @playform/build 0.1.x,
  @modular-forms/solid
