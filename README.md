<table>
	<tr>
		<td align="left" valign="middle">
			<h3 align="left">
				<a href="https://editor.land" target="_blank">
					<picture>
						<source media="(prefers-color-scheme: dark)" srcset="https://editor.land/Dark/Image/GitHub/Land.svg" />
						<source media="(prefers-color-scheme: light)" srcset="https://editor.land/Image/GitHub/Land.svg" />
						<img width="28" alt="Land Logo" src="https://editor.land/Image/GitHub/Land.svg" />
					</picture>
				</a>
			</h3>
		</td>
		<td align="left" valign="middle">
			<h3 align="left">
				Wind
				🍃
			</h3>
		</td>
	</tr>
</table>

---

# **Wind**&#x2001;🍃

The Breath of `Land`: `VS Code` Environment & Services for `Tauri`.

`VS Code`'s `workbench` runs inside the `Chromium` renderer process, meaning
every panel interaction that touches files or state must cross the `Electron`
`IPC` bridge through untyped `JSON` serialization. `Wind` replaces that pipeline
with typed `Tauri` commands routed to `Rust` handlers in `Mountain`'s core,
eliminating the untyped serialization layer entirely while preserving full
`VS Code` `workbench` compatibility.

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/wind.svg)](https://www.npmjs.com/package/@codeeditorland/wind)
[![Tauri API Version](https://img.shields.io/badge/Tauri_API-v2.11.0-blue.svg)](https://www.npmjs.com/package/@tauri-apps/api)
[![Effect Version](https://img.shields.io/badge/Effect-v3.21.2-blueviolet.svg)](https://www.npmjs.com/package/effect)

Welcome to **Wind**&#x2001;🍃. This element provides the `Effect-TS` native
service layer that enables `Sky`, `Land`'s `VS Code`-based `UI`, to function
within the `Tauri` shell. `Wind` recreates the essential `VS Code` renderer
environment, implements core services through `Effect-TS`'s typed error and
dependency injection patterns, and connects the frontend to `Mountain`'s `Rust`
backend through `Tauri`'s `invoke` and `event` system.

`Wind` operates through three primary mechanisms. The `Preload.sh` script shims
`Electron` and `Node.js` `APIs` that the `VS Code` workbench expects,
establishing a compatible execution context inside the `Tauri` `WebView`. The
`Effect/` directory contains the service implementations, each organized as an
atomic module with `Tag`, `Interface`, `Implementation`, `Layer`, and `Type`
subdirectories that compose into `TauriLiveLayer`, `ElectronLiveLayer`, and
`TestLayer` stacks. The `Mountain` service maintains an `RPC` connection to the
`Rust` backend for configuration, state synchronization, and native operations.

---

## Key Features&#x2001;🔐

`Wind` exposes `Tauri`'s native `OS` file dialogs through an `Effect-TS` wrapper
that surfaces typed, tagged errors for every failure path, providing an
integrated dialog experience without the `Electron` `IPC` indirection. The
`Preload.ts` script establishes the `window.vscode` global object and shims
`ipcRenderer` and `process` so the `VS Code` `workbench` code interacts with a
familiar environment while actually communicating through `Tauri`'s `invoke`
system. Every asynchronous operation and service uses `Effect` for structured
concurrency, meaning all potential failures are explicitly typed rather than
thrown as untyped exceptions. Service composition relies on `Effect-TS`'s
`Layer` and `Context.Tag` primitives, enabling clean dependency injection where
individual services like `Clipboard`, `Terminal`, or `Configuration` can be
swapped between live, mock, and test implementations without modifying consuming
code. The abstraction layer isolates `Tauri`-specific details so application
code works against stable service interfaces rather than platform-specific
`APIs`.

---

## Core Architecture Principles&#x2001;🏗️

| Principle         | Description                                                                                                                     | Key Components                                      |
| :---------------- | :------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------- |
| **Compatibility** | High-fidelity VS Code renderer environment to maximize Sky's reusability and minimize changes needed for VS Code UI components. | `Preload.ts`, `Polyfills/`, `Types/`                |
| **Modularity**    | Each service follows an atomic directory structure with interface, implementation, tag, layer, and type subdirectories.         | `Effect/` services                                  |
| **Robustness**    | Effect-TS powers all service implementations, ensuring tagged error types and composable dependency injection via Layer.        | All `Effect/` services with Layer and Tag patterns  |
| **Abstraction**   | Clean layer over Tauri APIs replaces the untyped Electron IPC pipe with typed Tauri commands whose handlers live in Rust.       | `Preload.ts`, `Effect/IPC/`, `Effect/Mountain/`     |
| **Integration**   | Sky's frontend requests connect to Mountain's backend capabilities through Tauri's invoke and event system.                     | `Preload.ts` (ipcRenderer shim), `Effect/Mountain/` |

---

## Deep Dive & Component Breakdown&#x2001;🔬

The `Wind` architecture centers around the
[`Preload.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Preload.ts)
script which sets up the `VS Code` compatibility layer, and the
[`Effect/`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/)
directory which contains all `Effect-TS` based services. `Preload.ts` shims
`Electron` APIs, creates `window.vscode`, and prepares the environment that
`Sky`'s `VS Code` code relies on. The `Effect/` module exports all services and
composed layer stacks, with
[`TauriLiveLayer`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/Layers/Tauri.ts)
in `Effect/Layers/Tauri.ts` serving as the primary composition that merges
`sandbox`, `IPC`, `configuration`, `telemetry`, `Mountain`, and dozens of UI and
editor services into a single runnable layer. The code generator under
[`Codegen/`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Codegen/)
walks the `VS Code` service catalog, extracts decorator matches and interface
members, and emits bridge shape specifications that the `Workbench*` services
implement. See
[`Effect/index.ts`](https://github.com/CodeEditorLand/Wind/tree/Current/Source/Effect/index.ts)
for the complete module exports and layer compositions.

---

## `Wind`&#x2001;🍃 in the `Land`&#x2001;🏞️ Ecosystem&#x2001;🍃&#x2001;+&#x2001;🏞️

This diagram illustrates `Wind`'s central role between `Sky` (the UI) and
`Tauri` / `Mountain` (backend).

```mermaid
graph LR
    classDef sky      fill:#cce8ff,stroke:#2980b9,stroke-width:2px,color:#003050;
    classDef wind     fill:#fffde0,stroke:#f0b429,stroke-width:2px,color:#4a3500;
    classDef tauri    fill:#ffe0f0,stroke:#c0396a,stroke-width:2px,color:#4a0020;
    classDef mountain fill:#f0d0ff,stroke:#9b59b6,stroke-width:2px,color:#2c0050;
    classDef effectts fill:#d4f5d4,stroke:#27ae60,stroke-width:1px,color:#0a3a0a;
    classDef ipc      fill:#fff3c0,stroke:#f39c12,stroke-width:1px,stroke-dasharray:5 5,color:#5a3e00;

    subgraph SKY["Sky 🌌 - Astro UI (Tauri WebView)"]
        SkyApp["Sky Workbench Pages 🖼️"]:::sky
    end

    subgraph WIND["Wind 🍃 - VS Code Env + Effect-TS Service Layer (WebView)"]
        direction TB
        subgraph COMPAT["Compatibility Layer"]
            Preload["Preload.ts - window.vscode + ipcRenderer shim 🔌"]:::wind
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

## Project Structure&#x2001;🗺️

```
Wind/
└── Source/
    ├── Preload.ts              # VS Code environment emulation in Tauri WebView.
    ├── Effect/                 # Effect-TS services (atomic structure).
    │   ├── IPC/                # Inter-process communication via Tauri invoke.
    │   ├── Sandbox/            # Preload globals and environment service.
    │   ├── Configuration/      # Workbench configuration with sync.
    │   ├── Telemetry/          # Logging, spans, and metrics (PostHog/OTLP).
    │   ├── Mountain/           # Backend RPC connection service.
    │   ├── MountainSync/       # Background configuration sync.
    │   ├── Environment/        # System and platform detection.
    │   ├── Health/             # Service health checks.
    │   ├── Bootstrap/          # Multi-stage bootstrap orchestration.
    │   ├── Clipboard/          # System clipboard access.
    │   ├── Commands/           # VS Code command registry.
    │   ├── Editor/             # Editor service abstraction.
    │   ├── ActivityBar/        # Activity bar management.
    │   ├── Panel/              # Bottom panel management.
    │   ├── Sidebar/            # Sidebar management.
    │   ├── StatusBar/          # Status bar management.
    │   ├── Decorations/        # Editor decorations service.
    │   ├── Extensions/         # Extension management.
    │   ├── Files/              # File system operations.
    │   ├── History/            # Editor history service.
    │   ├── Keybinding/         # Keyboard shortcut binding.
    │   ├── Label/              # Label service.
    │   ├── Language/           # Language service.
    │   ├── Lifecycle/          # Application lifecycle.
    │   ├── Model/              # Text model service.
    │   ├── Notification/       # Notification service.
    │   ├── Output/             # Output panel service.
    │   ├── Progress/           # Progress indication.
    │   ├── QuickInput/         # Quick input UI.
    │   ├── Search/             # Search service.
    │   ├── Storage/            # Persistent storage.
    │   ├── Terminal/           # Terminal service.
    │   ├── TextFile/           # Text file service.
    │   ├── TextModelResolver/  # Text model resolver.
    │   ├── Themes/             # Theme management.
    │   ├── WorkingCopy/        # Working copy service.
    │   ├── Workspaces/         # Workspace management.
    │   ├── NetworkRestrictions/# Network access restrictions.
    │   ├── UserSettings/       # User settings bridge.
    │   ├── Vine/               # Notification stream.
    │   ├── LandWorkbench/      # Land workbench integration.
    │   ├── Generated/          # Auto-generated VS Code service interfaces.
    │   └── Layers/             # Layer compositions (Tauri, Electron, Test).
    ├── Bootstrap/             # Bootstrap type definitions for startup.
    ├── Codegen/               # VS Code service code generator.
    ├── Configuration/         # ESBuild and TypeScript configurations.
    ├── FileSystem/            # VS Code-like file system provider.
    ├── Function/              # Preload install helpers and IPC renderer creation.
    ├── IPC/                   # IPC channel and Sky event definitions.
    ├── Service/               # Tauri main process service.
    ├── Telemetry/             # PostHog telemetry bridge.
    ├── Types/                 # Sandbox, IPC, and error type definitions.
    ├── Utility/               # Shared utility functions.
    └── Workbench/             # Workbench integration service.
```

---

## Getting Started&#x2001;🚀

### Installation&#x2001;📥

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

### Usage&#x2001;🚀

`Wind` is primarily integrated via its `Preload.ts` script and its `Effect-TS`
layers.

1. **Integrate the Preload Script:** Configure your `tauri.config.json` to
   include the bundled `Preload.js` from `Wind` in your main window's preload
   scripts.

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

### Available Effect Services&#x2001;⚡

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

## See Also&#x2001;🔗

- [Wind Documentation](https://Editor.Land/Doc/wind)
- [Architecture Overview](https://Editor.Land/Doc/architecture)
- [Why Effect-TS](https://Editor.Land/Doc/why-effect-ts)
- [Why Tauri](https://Editor.Land/Doc/why-tauri)
- [`Mountain`](https://github.com/CodeEditorLand/Mountain)
- [`Sky`](https://github.com/CodeEditorLand/Sky)
- [`Cocoon`](https://github.com/CodeEditorLand/Cocoon)

---

## License&#x2001;⚖️

This project is released into the public domain under the **Creative Commons CC0
Universal** license. You are free to use, modify, distribute, and build upon
this work for any purpose, without any restrictions. For the full legal text,
see the [`LICENSE`](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE) file.

---

## Changelog&#x2001;📜

See [`CHANGELOG.md`](https://github.com/CodeEditorLand/Wind/tree/Current/CHANGELOG.md) for a
history of changes specific to **Wind**&#x2001;🍃.

---

## Funding & Acknowledgements&#x2001;🙏🏻

**Wind** is a core element of the **Land**&#x2001;🏞️ ecosystem.&#x2001;🍃
project is funded through [NGI0 Commons Fund](https://NLnet.NL/commonsfund), a
fund established by [NLnet](https://NLnet.NL) with financial support from the
European Commission's [Next Generation Internet](https://ngi.eu) program. Learn
more at the [NLnet project page](https://NLnet.NL/project/Land).

The project is operated by PlayForm, based in Sofia, Bulgaria.

PlayForm acts as the open-source steward for Code Editor Land under the NGI0
Commons Fund grant.

<table>
	<thead>
		<tr>
			<th align="left">
				<strong>
					Land
				</strong>
			</th>
			<th align="left">
				<strong>
					PlayForm
				</strong>
			</th>
			<th align="left">
				<strong>
					NLnet
				</strong>
			</th>
			<th align="left">
				<strong>
					NGI0 Commons Fund
				</strong>
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://editor.land">
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
