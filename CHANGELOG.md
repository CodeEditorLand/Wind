# Changelog - Wind

Wind is our UI service layer - the Effect-TS-driven re-implementation
of VS Code's workbench services that bridges the renderer to Mountain
through Tauri IPC. This file records what we built in our voice,
version by version. Format adapted from
[Keep a Changelog](https://keepachangelog.com/).

## [v2.1] - Full Workbench Lift, Tauri IPC Bridge

We finalised the substrate that lets the workbench talk to Mountain
through our Tauri IPC instead of Electron's. By the end of this cycle
we had 24 channel routes wired, 5 streaming subscriptions, and a clean
preload + bootstrap that brings the editor up against a live Cocoon.

### Added

- **Five streaming `listen()` subscriptions** for the renderer:
  `sky://vfs/fileChange`, `sky://configuration/changed`,
  `sky://terminal/data`, `sky://lifecycle/willShutdown`,
  `sky://lifecycle/phaseChanged`. Each gives the workbench a live
  feed without round-tripping invokes.
- **`Source/Service/TauriMainProcessService.ts`** (~232 lines) - our
  IPC routing surface with **24 routed channels** and **14 stub
  channels**:
  - **Routed**: `localFilesystem`, `storage`, `configuration`,
    `textFile`, `extensions`, `commands`, `terminal`, `output`,
    `notification`, `progress`, `quickInput`, `workspaces`,
    `themes`, `search`, `environment`, `decorations`,
    `workingCopy`, `keybinding`, `lifecycle`, `label`, `model`,
    `nativeHost`, `localPty`, `url`, `menubar`, `encryption`,
    `extensionHostStarter`, `extensionhostdebugservice`.
  - **Stubbed**: `update`, `sign`, `policy`, `userDataProfiles`,
    `keyboardLayout`, `sharedProcess`, `utilityProcessWorker`,
    `meteredConnection`, `webContentExtractor`, `browserElements`,
    `NativeMcpDiscoveryHelper`, `sandboxHelper`, `mcpGateway`,
    `browserViewGroup`, `externalTerminal`. Each stub returns the
    shape the workbench expects (mostly empty arrays / no-op
    disposables) so the bootstrap doesn't crash on a missing
    handler.
- **MessageChannel for extension-host IPC** in `Preload.ts`
  (~+58 lines): init data → Initialized byte (`[1]`) → Ready byte
  (`[2]`) after 50 ms.
- **Extension-host protocol message forwarding to Mountain**
  (~+85 lines).
- **`ResolveConfiguration`**: ~+111 lines covering
  `INativeWindowConfiguration`, profiles, `colorScheme`,
  `accessibilitySupport`; ~+94 lines for Mountain path resolution
  via RPC.
- **`Source/Function/DevLog.ts`** (~72 lines) - fire-and-forget dev
  logging with short-mode formatting, mirrored to Mountain so
  renderer-side logs land in the same trace stream.

### Changed

- **`Preload.ts` grew** from ~99 lines to 190+ lines with debugging
  instrumentation. We use it as the single bridge that mounts our
  Tauri IPC under the names the workbench expects (`window.vscode`,
  the channel proxy, etc.) before the workbench loads.
- **IPC naming convention**: `ipcMain` → `IPC` for our PascalCase
  rule.
- **Effect.either refactor** in the bootstrap path so fiber-level
  failures surface as proper `Either` results instead of getting
  buried.

### Removed

- **1,076 lines of legacy polyfills** deleted in one pass:
  `ChildProcessPolyfill.ts` (77), `FileProtocolShim.ts` (58),
  `FileSystemPolyfill.ts` (44), `NativeModulePolyfill.ts` (62),
  `ProcessPolyfill.ts` (36), `SharedProcessProxy.ts` (68). All
  superseded by Mountain-routed channels.

## [v2.0] - Editor Launch (Bootstrap + Preload Foundation)

We built the renderer-side shape the bundled workbench needs to boot.

### Added

- **`Source/Preload.ts`** (99 lines) - the Tauri/Electron bridge
  the workbench imports first.
- **`Source/Bootstrap/Types/`** - 30+ VS Code type mirror files:
  `BootstrapTypes.ts`, the `Type/` subtree
  (`BootstrapConfig`, `EnvironmentData`, `Mode`, `Platform`,
  `StageResult`, …), and `VSCode/` mirrors
  (`VSCodeConfigurationType`, `VSCodeLoggerType`,
  `VSCodeWorkbenchOptionsType`).

### Changed

- TypeScript 5.9.3 → 6.0.2.

## [v1.3] - Dependency Maintenance

Effect 3.18.0 → 3.19.14, `@effect/platform` 0.92.0 → 0.94.1,
`@effect/language-service` 0.60.x → 0.63.2. No major
`Application/` restructures; module count stable.

## [v1.2] - Full-Stack Integration (Application Layer)

We grew Wind from a UI shell into a 100+ module Effect-TS service
layer following our Define / Implement / Problem pattern.

### Added

- **100+ application service modules**, each shaped as
  `Source/Application/{Service}/{Define.ts, Implement.ts,
  Problem.ts}` (interface, Effect-TS implementation, error types).
  Coverage spans Command, Configuration, Dialog, Editor, EditorGroup,
  File, FileSystem, Host, IPC, LanguageFeature, Logger, Marker,
  Notification, Policy, UntitledTextEditor - and more.
- **300+ file infrastructure commit** to scaffold the template
  consistently across the surface.

### Changed

- Effect-TS 3.17.x → 3.18.x. SolidJS 1.9.x stable. `@types/node` 24.x.

## [v1.1] - Architecture Buildout (Effect-TS Pivot)

The pivot quarter. We adopted Effect-TS as our service composition
runtime and stood up the `Application/` layer that v1.2 would build
out.

### Added

- **`Source/Effect/`** directory - Effect-TS service composition.
- **`Source/Application/`** directory - 50+ initial service modules
  (Dialog, FileDialog, …) with Effect-TS-driven patterns.
- **`Source/Configuration/ESBuild/`** - build-config restructure.
- **Effect-TS dep set**: `effect`, `@effect/platform`,
  `@effect/experimental`, `@effect/language-service`.

### Removed

- `Source/Element/Preview.scss`.
- We concluded the SolidJS evaluation in this window - the bones we
  kept landed under `Source/Context/` and `Source/Element/`; the
  rest came out.

## [v1.0] - Integration Phase

`deepmerge-ts` 7.1.4 → 7.1.5. SolidJS 1.9.4 → 1.9.5. Refreshed
`CODE_OF_CONDUCT.md` and `CONTRIBUTING.md`. Routine `Target/`
gen/delete cycles for CI integration tests.

## [v0.2] - Architecture Solidification

We shipped the first generated `Target/` artefacts: 88 files across
`Context/*`, `Element/*`, `Function/*`, `Interface/*`,
`Script/Monaco/Theme/*.json`, `Stylesheet/*`. Monaco themes
`Active4D.json` (154 lines) and `Amoled.json` (219 lines) landed,
plus `Stylesheet/Tippy/{Dark.scss,Light.scss}`. SolidJS devtools
0.31.2 → 0.31.7. We adopted the CSS action-form convention
(`--Mute`, not `--Muted`).

## [v0.1] - Rapid Development

`Editor.scss` cleanup (42-line reduction); border/spacing mixins
refactored. SolidJS 1.8.19 → 1.9.1. `monaco-editor` 0.51.0-rc2 →
0.52.0. `@playform/build` 0.1.2 → 0.1.7. No new architectural
folders - refinement only.

## [v0.0] - Project Inception

We laid the SolidJS-era bones:

- **`Source/Context/`** - React-style context primitives (`Action`,
  `Connection`, `Environment`, `Session`, `Store`).
- **`Source/Element/`** - SolidJS components (`Editor.tsx`,
  `Button`, `Anchor`, `Tip`, `Footer`).
- **`Source/Library/`** - helpers (`Create`, `Pad`, `Persist`,
  `Environment`).
- **`Source/Function/`** - utilities (`Merge`).
- **`Source/Stylesheet/`** - SCSS (`Element/*`, `Mixin/*`).
- **`Source/Variable/`** - ESBuild config + `StringURL` constant.

### First-release dependencies

- SolidJS 1.8.x, `monaco-editor` 0.51.x, `@playform/build` 0.1.x,
  `@modular-forms/solid`.
