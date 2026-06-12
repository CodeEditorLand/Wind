# **Wind** 🌬️

<table>
	<tr>
		<td>
			<a href="https://GitHub.Com/CodeEditorLand/Wind" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/last-commit/CodeEditorLand/Wind?label=Last-commit&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/last-commit/CodeEditorLand/Wind?label=Last-commit&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/last-commit/CodeEditorLand/Wind?label=Last-commit&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Last-commit" title="Last-commit" />
				</picture>
			</a>
			<br />
			<a href="https://GitHub.Com/CodeEditorLand/Wind" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/issues/CodeEditorLand/Wind?label=Issues&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/issues/CodeEditorLand/Wind?label=Issues&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/issues/CodeEditorLand/Wind?label=Issues&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Issues" title="Issues" />
				</picture>
			</a>
		</td>
		<td>
			<a href="https://github.com/CodeEditorLand/Wind" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/stars/CodeEditorLand/Wind?style=flat&label=Star&logo=github&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/stars/CodeEditorLand/Wind?style=flat&label=Star&logo=github&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/stars/CodeEditorLand/Wind?style=flat&label=Star&logo=github&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Star" />
				</picture>
			</a>
			<br />
			<a href="https://GitHub.Com/CodeEditorLand/Wind" target="_blank">
				<picture>
					<source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/github/downloads/CodeEditorLand/Wind?label=Downloads&color=black&labelColor=black&logoColor=white&logoWidth=0" />
					<source media="(prefers-color-scheme: light)" srcset="https://img.shields.io/github/downloads/CodeEditorLand/Wind?label=Downloads&color=white&labelColor=white&logoColor=black&logoWidth=0" />
					<img src="https://img.shields.io/github/downloads/CodeEditorLand/Wind?label=Downloads&color=black&labelColor=black&logoColor=white&logoWidth=0" alt="Downloads" title="Downloads" />
				</picture>
			</a>
		</td>
	</tr>
</table>

The VS Code Environment & Services Layer for Land - Effect-TS powered Tauri
service layer.

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/wind.svg)](https://www.npmjs.com/package/@codeeditorland/wind)
[![Tauri API Version](https://img.shields.io/badge/Tauri_API-v2.11.0-blue.svg)](https://www.npmjs.com/package/@tauri-apps/api)
[![Effect Version](https://img.shields.io/badge/Effect-v3.21.2-blueviolet.svg)](https://www.npmjs.com/package/effect)

---

## Overview

`Wind` replaces `VS Code`'s `Electron` `IPC` bridge - which forces every panel
interaction through untyped `JSON` serialization - with typed `Tauri` commands
routed to `Rust` handlers in `Mountain`'s core. It provides the `Effect-TS`
native service layer that enables `Sky` (Land's VS Code-based UI) to function
within the `Tauri` shell.

`Wind` recreates the essential VS Code renderer environment, implements core
services through `Effect-TS`'s typed error and dependency injection patterns,
and connects the frontend to `Mountain`'s Rust backend through `Tauri`'s
`invoke` and `event` system. It exposes Tauri's native OS file dialogs through
`Effect-TS` wrappers that surface typed, tagged errors. The `Preload.ts` script
establishes `window.vscode` and shims `ipcRenderer` and `process` so VS Code
workbench code communicates through Tauri's `invoke` system instead of
Electron's IPC.

---

## Architecture

`Wind` operates through three primary mechanisms:

1. **Preload Shim** - `Preload.ts` shims Electron and Node.js APIs that the VS
   Code workbench expects, establishing a compatible execution context inside
   the `Tauri` WebView.
2. **Effect-TS Services** - The `Effect/` directory contains service
   implementations, each organized as atomic modules with `Tag`, `Interface`,
   `Implementation`, `Layer`, and `Type` subdirectories that compose into
   `TauriLiveLayer`, `ElectronLiveLayer`, and `TestLayer` stacks.
3. **Mountain RPC** - The `Mountain` service maintains an RPC connection to the
   Rust backend for configuration, state synchronization, and native operations.

```mermaid
graph LR
    classDef sky      fill:#cce8ff,stroke:#2980b9,stroke-width:2px,color:#003050;
    classDef wind     fill:#fffde0,stroke:#f0b429,stroke-width:2px,color:#4a3500;
    classDef tauri    fill:#ffe0f0,stroke:#c0396a,stroke-width:2px,color:#4a0020;
    classDef mountain fill:#f0d0ff,stroke:#9b59b6,stroke-width:2px,color:#2c0050;
    classDef effectts fill:#d4f5d4,stroke:#27ae60,stroke-width:1px,color:#0a3a0a;
    classDef ipc      fill:#fff3c0,stroke:#f39c12,stroke-width:1px,stroke-dasharray:5 5,color:#5a3e00;

    subgraph SKY["Sky ☀️ - Astro UI (Tauri WebView)"]
        SkyApp["Sky Workbench Pages 🖼️"]:::sky
    end

    subgraph WIND["Wind 🌬️ - VS Code Env + Effect-TS Service Layer (WebView)"]
        direction TB
        subgraph COMPAT["Compatibility Layer"]
            Preload["Preload.ts - window.vscode + ipcRenderer shim"]:::wind
            Sandbox["Effect/Sandbox - globals service"]:::wind
        end
        subgraph EFFECTLAYERS["Effect/ - 40+ Service Modules"]
            TauriLayer["Effect/Layers/Tauri.ts - TauriLiveLayer ⚡"]:::effectts
            ElectronLayer["Effect/Layers/Electron.ts"]:::effectts
            CoreServices["IPC · Mountain · MountainSync · Bootstrap\nConfiguration · Lifecycle · Storage · Telemetry"]:::effectts
            UIServices["Clipboard · Commands · Editor · Terminal\nStatusBar · Sidebar · ActivityBar · Panel\nSearch · Notifications · QuickInput…"]:::effectts
            WorkbenchServices["Workbench* generated bridge services"]:::wind
        end
        subgraph IPCBRIDGE["Service/TauriMainProcessService.ts"]
            TauriSvc["IPC channel router + event bridge 📡"]:::ipc
        end

        Preload --> Sandbox
        Preload --> TauriLayer
        TauriLayer --> CoreServices
        TauriLayer --> UIServices
        TauriLayer --> WorkbenchServices
        CoreServices --> TauriSvc
    end

    subgraph BACKEND["Tauri Shell + Mountain ⛰️ - Rust Backend"]
        TauriAPI["Tauri JS API / @tauri-apps/api ⚙️"]:::tauri
        MountainCore["Mountain - WindServiceHandlers 🦀"]:::mountain
    end

    SkyApp -- imports TauriLiveLayer --> TauriLayer
    SkyApp -- consumes services via __CEL_SERVICES__ --> UIServices
    TauriSvc -- tauri::invoke --> TauriAPI
    TauriAPI -- Rust command handlers --> MountainCore
    MountainCore -- sky:// Tauri events --> TauriSvc
    TauriSvc -- event bridge --> SkyApp
```

---

## Key Components

| Component       | Path                               | Description                                                                                   |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Preload Shim    | `Source/Preload.ts`                | VS Code environment emulation in Tauri WebView - shims Electron APIs, creates `window.vscode` |
| IPC Service     | `Source/Effect/IPC/`               | Inter-process communication via Tauri `invoke` with typed, tagged errors                      |
| Mountain RPC    | `Source/Effect/Mountain/`          | Backend RPC connection service for configuration, state, and native operations                |
| Configuration   | `Source/Effect/Configuration/`     | Workbench configuration with sync and change detection                                        |
| Bootstrap       | `Source/Effect/Bootstrap/`         | Multi-stage bootstrap orchestration for service initialization                                |
| Codegen         | `Source/Codegen/`                  | VS Code service code generator - walks service catalog, emits bridge shapes                   |
| Layers/Tauri    | `Source/Effect/Layers/Tauri.ts`    | Primary composed layer merging 40+ services into `TauriLiveLayer`                             |
| Layers/Electron | `Source/Effect/Layers/Electron.ts` | Electron compatibility layer stack                                                            |
| Layers/Test     | `Source/Effect/Layers/Test.ts`     | Test/mock layer stack for isolated testing                                                    |

### Project Structure

```
Wind/
└── Source/
    ├── Preload.ts              # VS Code environment emulation in Tauri WebView
    ├── Effect/                 # Effect-TS services (atomic structure)
    │   ├── IPC/                # Inter-process communication via Tauri invoke
    │   ├── Sandbox/            # Preload globals and environment service
    │   ├── Configuration/      # Workbench configuration with sync
    │   ├── Telemetry/          # Logging, spans, and metrics (PostHog/OTLP)
    │   ├── Mountain/           # Backend RPC connection service
    │   ├── MountainSync/       # Background configuration sync
    │   ├── Environment/        # System and platform detection
    │   ├── Health/             # Service health checks
    │   ├── Bootstrap/          # Multi-stage bootstrap orchestration
    │   ├── Clipboard/          # System clipboard access
    │   ├── Commands/           # VS Code command registry
    │   ├── Editor/             # Editor service abstraction
    │   ├── ActivityBar/        # Activity bar management
    │   ├── Panel/              # Bottom panel management
    │   ├── Sidebar/            # Sidebar management
    │   ├── StatusBar/          # Status bar management
    │   ├── Decorations/        # Editor decorations service
    │   ├── Extensions/         # Extension management
    │   ├── Files/              # File system operations
    │   ├── History/            # Editor history service
    │   ├── Keybinding/         # Keyboard shortcut binding
    │   ├── Label/              # Label service
    │   ├── Language/           # Language service
    │   ├── Lifecycle/          # Application lifecycle
    │   ├── Model/              # Text model service
    │   ├── Notification/       # Notification service
    │   ├── Output/             # Output panel service
    │   ├── Progress/           # Progress indication
    │   ├── QuickInput/         # Quick input UI
    │   ├── Search/             # Search service
    │   ├── Storage/            # Persistent storage
    │   ├── Terminal/           # Terminal service
    │   ├── TextFile/           # Text file service
    │   ├── TextModelResolver/  # Text model resolver
    │   ├── Themes/             # Theme management
    │   ├── WorkingCopy/        # Working copy service
    │   ├── Workspaces/         # Workspace management
    │   ├── NetworkRestrictions/# Network access restrictions
    │   ├── UserSettings/       # User settings bridge
    │   ├── Vine/               # Notification stream
    │   ├── LandWorkbench/      # Land workbench integration
    │   ├── Generated/          # Auto-generated VS Code service interfaces
    │   └── Layers/             # Layer compositions (Tauri, Electron, Test)
    ├── Bootstrap/              # Bootstrap type definitions for startup
    ├── Codegen/                # VS Code service code generator
    ├── Configuration/          # ESBuild and TypeScript configurations
    ├── FileSystem/             # VS Code-like file system provider
    ├── Function/               # Preload install helpers and IPC renderer creation
    ├── IPC/                    # IPC channel and Sky event definitions
    ├── Service/                # Tauri main process service
    ├── Telemetry/              # PostHog telemetry bridge
    ├── Types/                  # Sandbox, IPC, and error type definitions
    ├── Utility/                # Shared utility functions
    └── Workbench/              # Workbench integration service
```

### Core Architecture Principles

| Principle         | Description                                                                                                            | Key Components                                      |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------- |
| **Compatibility** | High-fidelity VS Code renderer environment to maximize Sky's reusability                                               | `Preload.ts`, `Polyfills/`, `Types/`                |
| **Modularity**    | Each service follows an atomic directory structure with interface, implementation, tag, layer, and type subdirectories | `Effect/` services                                  |
| **Robustness**    | Effect-TS powers all service implementations, ensuring tagged error types and composable DI via Layer                  | All `Effect/` services with Layer and Tag patterns  |
| **Abstraction**   | Clean layer over Tauri APIs replaces untyped Electron IPC with typed Tauri commands                                    | `Preload.ts`, `Effect/IPC/`, `Effect/Mountain/`     |
| **Integration**   | Sky's frontend requests connect to Mountain's backend through Tauri's invoke and event system                          | `Preload.ts` (ipcRenderer shim), `Effect/Mountain/` |

---

## In the Land Project

`Wind` is the middle layer between `Sky` (the UI) and `Tauri` / `Mountain` (the
backend). It provides the service abstraction that `Sky` consumes to perform
file operations, dialogs, configuration, and state management - all through
typed, tagged `Effect` services rather than untyped IPC. Communication flows
through Tauri's `invoke` (request) and `event` (notification) channels.

- **Depends on:** `Mountain` (Rust backend handlers), `Tauri` (invoke/event
  system)
- **Consumed by:** `Sky` (Astro UI layer), `Cocoon` (extension host), `Worker`
  (service worker)
- **Protocol:** Tauri IPC (`invoke` + `listen`)

---

## Getting Started

```sh
pnpm add @codeeditorland/wind
```

**Key Dependencies:**

| Package                     | Version  | Purpose                          |
| :-------------------------- | :------- | :------------------------------- |
| `@tauri-apps/api`           | `2.11.0` | Tauri JS bridge                  |
| `@tauri-apps/plugin-dialog` | `2.7.1`  | Native OS file dialogs           |
| `@codeeditorland/output`    | `0.0.1`  | Shared output utilities          |
| `effect`                    | `3.21.2` | Structured concurrency & DI      |
| `@effect/platform`          | `0.96.1` | Platform abstractions for Effect |

### Usage

`Wind` is integrated via its `Preload.ts` script and `Effect-TS` layers.

1. **Integrate the Preload Script:** Configure `tauri.config.json` to include
   the bundled `Preload.js` from Wind in your main window's preload scripts.

2. **Use Services with `Effect-TS`:**

```ts
import { IPC } from "@codeeditorland/wind/Effect";
import { TauriLiveLayer } from "@codeeditorland/wind/Effect/Layers/Tauri";
import { Effect, Layer, Runtime } from "effect";

// Build the application runtime with Tauri live layer
const AppRuntime = Layer.toRuntime(TauriLiveLayer).pipe(
	Effect.scoped,
	Effect.runSync,
);

// Example: invoke a Tauri command through the typed IPC service
const InvokeEffect = Effect.gen(function* (_) {
	const IPCService = yield* _(IPC);
	const Result = yield* _(
		IPCService.invoke("mountain_get_workbench_configuration"),
	);
	yield* _(Effect.log(`Configuration received: ${JSON.stringify(Result)}`));
});

Runtime.runPromise(AppRuntime, InvokeEffect);
```

### Available Effect Services

| Service               | Import Path                                   | Description                           |
| :-------------------- | :-------------------------------------------- | :------------------------------------ |
| `IPC`                 | `@codeeditorland/wind/Effect`                 | Inter-process communication via Tauri |
| `Sandbox`             | `@codeeditorland/wind/Effect`                 | Preload globals and environment       |
| `Configuration`       | `@codeeditorland/wind/Effect`                 | Workbench configuration with sync     |
| `Telemetry`           | `@codeeditorland/wind/Effect`                 | Logging, spans, and metrics           |
| `Mountain`            | `@codeeditorland/wind/Effect`                 | Backend RPC connection                |
| `MountainSync`        | `@codeeditorland/wind/Effect`                 | Background configuration sync         |
| `Environment`         | `@codeeditorland/wind/Effect`                 | System and platform detection         |
| `Health`              | `@codeeditorland/wind/Effect`                 | Service health checks                 |
| `Bootstrap`           | `@codeeditorland/wind/Effect`                 | Multi-stage bootstrap orchestration   |
| `Clipboard`           | `@codeeditorland/wind/Effect`                 | System clipboard access               |
| `Commands`            | `@codeeditorland/wind/Effect`                 | VS Code command registry              |
| `Editor`              | `@codeeditorland/wind/Effect`                 | Editor service abstraction            |
| `ActivityBar`         | `@codeeditorland/wind/Effect`                 | Activity bar management               |
| `Panel`               | `@codeeditorland/wind/Effect`                 | Bottom panel management               |
| `Sidebar`             | `@codeeditorland/wind/Effect`                 | Sidebar management                    |
| `StatusBar`           | `@codeeditorland/wind/Effect`                 | Status bar management                 |
| `Decorations`         | `@codeeditorland/wind/Effect`                 | Editor decoration service             |
| `Extensions`          | `@codeeditorland/wind/Effect`                 | Extension management                  |
| `Files`               | `@codeeditorland/wind/Effect`                 | File system operations                |
| `History`             | `@codeeditorland/wind/Effect`                 | Editor history                        |
| `Keybinding`          | `@codeeditorland/wind/Effect`                 | Keyboard shortcut binding             |
| `Label`               | `@codeeditorland/wind/Effect`                 | Label service                         |
| `Language`            | `@codeeditorland/wind/Effect`                 | Language service                      |
| `Lifecycle`           | `@codeeditorland/wind/Effect`                 | Application lifecycle                 |
| `Model`               | `@codeeditorland/wind/Effect`                 | Text model service                    |
| `Notification`        | `@codeeditorland/wind/Effect`                 | Notification service                  |
| `Output`              | `@codeeditorland/wind/Effect`                 | Output panel service                  |
| `Progress`            | `@codeeditorland/wind/Effect`                 | Progress indication                   |
| `QuickInput`          | `@codeeditorland/wind/Effect`                 | Quick input UI                        |
| `Search`              | `@codeeditorland/wind/Effect`                 | Search service                        |
| `Storage`             | `@codeeditorland/wind/Effect`                 | Persistent storage                    |
| `Terminal`            | `@codeeditorland/wind/Effect`                 | Terminal service                      |
| `TextFile`            | `@codeeditorland/wind/Effect`                 | Text file service                     |
| `TextModelResolver`   | `@codeeditorland/wind/Effect`                 | Text model resolver                   |
| `Themes`              | `@codeeditorland/wind/Effect`                 | Theme management                      |
| `WorkingCopy`         | `@codeeditorland/wind/Effect`                 | Working copy service                  |
| `Workspaces`          | `@codeeditorland/wind/Effect`                 | Workspace management                  |
| `NetworkRestrictions` | `@codeeditorland/wind/Effect`                 | Network access restrictions           |
| `UserSettings`        | `@codeeditorland/wind/Effect`                 | User settings bridge                  |
| `Vine`                | `@codeeditorland/wind/Effect`                 | Notification stream                   |
| `LandWorkbench`       | `@codeeditorland/wind/Effect`                 | Land workbench integration            |
| `Layers/Tauri`        | `@codeeditorland/wind/Effect/Layers/Tauri`    | Complete Tauri layer stack            |
| `Layers/Electron`     | `@codeeditorland/wind/Effect/Layers/Electron` | Electron compatibility layer stack    |
| `Layers/Test`         | `@codeeditorland/wind/Effect/Layers/Test`     | Test/mock layer stack                 |
| `FileSystem`          | `@codeeditorland/wind/FileSystem`             | VS Code-like file system provider     |
| `Workbench`           | `@codeeditorland/wind/Workbench`              | Workbench integration service         |

---

## API Reference

- [Effect Service Interfaces](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/)
    - All Effect-TS service tags, interfaces, and implementations
- [Preload API](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Preload.ts)
    - Environment shim and window.vscode globals
- [Layer Compositions](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/Layers/)
    - Tauri, Electron, and Test layer stacks

---

## Related Documentation

- [Architecture Overview](https://Editor.Land/Doc/architecture) - Internal
  module structure
- [Why Effect-TS](https://Editor.Land/Doc/why-effect-ts) - Design rationale for
  Effect-TS
- [Why Tauri](https://Editor.Land/Doc/why-tauri) - Design rationale for Tauri
- [Land Documentation](../../Documentation/GitHub/README.md) - Complete
  documentation index
- [Sky ☀️](https://github.com/CodeEditorLand/Sky) - UI component layer that
  consumes Wind services
- [Cocoon 🦋](https://github.com/CodeEditorLand/Cocoon) - Extension host sidecar
  (correlated frontend element)
- [Worker ⚙️](https://github.com/CodeEditorLand/Worker) - Service worker for
  caching and offline support

---

## License

This project is released into the public domain under the **Creative Commons CC0
Universal** license. You are free to use, modify, distribute, and build upon
this work for any purpose, without any restrictions. For the full legal text,
see the [`LICENSE`](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)
file.

---

## Changelog

See
[`CHANGELOG.md`](https://github.com/CodeEditorLand/Wind/tree/Current/CHANGELOG.md)
for a history of changes specific to **Wind** 🌬️.

---

## Funding

This project is funded through
[NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
Next Generation Internet program, under grant agreement No 101135429.

<table>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Editor.Land">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet" />
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund" />
				</a>
			</td>
		</tr>
	</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@editor.land](mailto:Source/Open@editor.land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Wind) |
[Report an Issue](https://github.com/CodeEditorLand/Wind/issues) |
[Security Policy](https://github.com/CodeEditorLand/Wind/security/policy)
