<table><tr>
<td colspan="1"> <h3 align="center"> <picture>
<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg">
<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg">
<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg">
</picture> </h3> </td> <td colspan="3" valign="top"> <h3 align="center"> Wind 🍃
</h3> </td>
</tr></table>

---

# **Wind** 🍃 The Breath of Land: VSCode Environment & Services for Tauri

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/wind.svg)](https://www.npmjs.com/package/@codeeditorland/wind)
[![Tauri API Version](https://img.shields.io/badge/Tauri_API-v2.10.1-blue.svg)](https://www.npmjs.com/package/@tauri-apps/api)
[![Effect Version](https://img.shields.io/badge/Effect-v3.19.18-blueviolet.svg)](https://www.npmjs.com/package/effect)

Welcome to **Wind**! This element is the vital **Effect-TS native service
layer** that allows `Sky` (Land's VSCode-based UI) to breathe and function
within the **Tauri** shell. **Wind** meticulously recreates essential parts of
the VSCode renderer environment, provides robust implementations of core
services (like file dialogs and configuration), and integrates seamlessly with
the `Mountain` backend via Tauri APIs. It replaces Electron-based
implementations with high-performance, OS-native equivalents, all underpinned by
**Effect-TS** for resilience and type safety.

**Wind** is engineered to:

1. **Emulate the VSCode Sandbox:** Through a sophisticated
   [`Preload.ts`](Source/Preload.ts) script, it shims critical Electron and
   Node.js APIs that VSCode's workbench code expects, creating a compatible
   execution context.
2. **Implement Core VSCode Services:** It provides frontend implementations for
   key VSCode services via
   [`Polyfills/NativeModulePolyfill.ts`](Source/Polyfills/NativeModulePolyfill.ts),
   leveraging `Effect-TS` for highly reliable, composable, and maintainable
   logic.
3. **Integrate with Tauri & Native Capabilities:** It offers a clean abstraction
   layer over Tauri APIs for file operations, dialogs, and OS information,
   making them accessible in a type-safe way through Effect-based wrappers.

---

## Key Features 🔐

- **Native Dialog Experience:** Implements dialog services for File Open/Save
  dialogs using Tauri's native OS dialogs via
  [`Polyfills/NativeModulePolyfill.ts`](Source/Polyfills/NativeModulePolyfill.ts).
- **VSCode Environment Compliance:** A sophisticated
  [`Preload.ts`](Source/Preload.ts) script establishes the crucial
  `window.vscode` global object, shimming `ipcRenderer` and `process` to bridge
  the gap between the VSCode workbench code and the Tauri runtime.
- **Effect-TS Powered Architecture:** Employs `Effect` for all asynchronous
  operations and service logic, ensuring that all potential failures are
  explicitly handled as typed, tagged errors for maximum robustness.
- **Declarative Dependency Management:** Uses `Layer` and `Context.Tag` from
  `Effect-TS` for clean dependency injection and composable service
  construction.
- **Clean Integration Layer:** Provides a clear abstraction layer over Tauri
  APIs, isolating platform specifics and simplifying their usage within the
  application.

---

## Core Architecture Principles 🏗️

| Principle         | Description                                                                                                                               | Key Components Involved                                                                                               |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Compatibility** | Provide a high-fidelity VSCode renderer environment to maximize `Sky`'s reusability and minimize changes needed for VSCode UI components. | [`Preload.ts`](Source/Preload.ts), [`Polyfills/`](Source/Polyfills/)                                                  |
| **Modularity**    | Components (preload, services, integrations) are organized into distinct, cohesive modules for clarity and maintainability.               | [`Effect/`](Source/Effect/), [`Types/`](Source/Types/), [`Bootstrap/`](Source/Bootstrap/)                             |
| **Robustness**    | Leverage `Effect-TS` for all service implementations and asynchronous operations, ensuring predictable error handling and composability.  | All [`Effect/`](Source/Effect/) services with `Layer` and `Tag` patterns                                              |
| **Abstraction**   | Create a clean layer over Tauri APIs, isolating platform specifics and simplifying their usage within the application.                    | [`Preload.ts`](Source/Preload.ts), [`Effect/IPC/`](Source/Effect/IPC/), [`Effect/Mountain/`](Source/Effect/Mountain/) |
| **Integration**   | Seamlessly connect `Sky`'s frontend requests with `Mountain`'s backend capabilities through Tauri's `invoke`/event system.                | [`Preload.ts`](Source/Preload.ts) (ipcRenderer shim), [`Effect/Mountain/`](Source/Effect/Mountain/)                   |

---

## Deep Dive & Component Breakdown 🔬

The `Wind` architecture centers around the [`Preload.ts`](Source/Preload.ts)
script which sets up the VSCode compatibility layer, and the
[`Effect/`](Source/Effect/) directory which contains all Effect-TS based
services. See the [`Effect/index.ts`](Source/Effect/index.ts) for the complete
module exports and layer compositions.

---

## `Wind` in the Land Ecosystem 🍃 + 🏞️

This diagram illustrates `Wind`'s central role between `Sky` (the UI) and the
Tauri/`Mountain` (backend) environment.

```mermaid
graph LR
classDef sky fill:#9cf,stroke:#333,stroke-width:2px;
classDef wind fill:#ffc,stroke:#333,stroke-width:2px;
classDef tauri fill:#f9d,stroke:#333,stroke-width:2px;
classDef mountain fill:#f9f,stroke:#333,stroke-width:2px;
classDef effectts fill:#cfc,stroke:#333,stroke-width:1px;


subgraph "Sky (Frontend UI - Tauri Webview)"
SkyApp["Sky Application Code (VSCode UI Components)"]:::sky
end

subgraph "Wind (VSCode Env & Services Layer - Runs in Webview)"
PreloadJS["Preload.js (Environment Shim)"]:::wind
WindEffectTSRuntime["Wind Effect-TS Runtime & Service Layers"]:::effectts
TauriIntegrations["Wind Effect Services (Tauri API Wrappers)"]:::wind

SkyApp -- Consumes services from --> WindEffectTSRuntime;
WindEffectTSRuntime -- Executes side-effects via --> TauriIntegrations;
end

subgraph "Tauri Core & Mountain (Rust Backend)"
TauriAPIs["Tauri JS API & Plugins"]:::tauri
MountainBackend["Mountain Rust Core (Command Handlers)"]:::mountain
end

TauriWindow["Tauri Window"] -- Loads --> PreloadJS
PreloadJS -- Prepares environment for --> SkyApp

TauriIntegrations -- Calls --> TauriAPIs;
TauriAPIs -- Communicates with --> MountainBackend;
```

---

## Project Structure Overview 🗺️

The `Wind` repository is organized to clearly separate concerns:

```
Wind/
└── Source/
    ├── Preload.ts              # Core script for VSCode environment emulation in Tauri.
    ├── Effect/                 # Effect-TS services (atomic structure).
    │   ├── IPC/                # Inter-process communication service.
    │   ├── Sandbox/            # Preload globals service.
    │   ├── Configuration/      # Configuration service.
    │   ├── Telemetry/          # Logging, spans, metrics service.
    │   ├── Mountain/           # Backend connection & RPC service.
    │   ├── MountainSync/       # Background synchronization service.
    │   ├── Environment/        # System detection service.
    │   ├── Health/             # Service health checks.
    │   ├── Bootstrap/          # Orchestration of all stages.
    │   ├── Clipboard/          # System clipboard service.
    │   ├── ActivityBar/        # VSCode activity bar management.
    │   ├── Panel/              # VSCode bottom panel management.
    │   ├── Sidebar/            # VSCode sidebar management.
    │   ├── StatusBar/          # VSCode status bar management.
    │   └── Layers/             # Layer compositions (Tauri, Electron).
    ├── Bootstrap/              # Bootstrap type definitions.
    ├── Configuration/          # ESBuild bundling configurations.
    │   └── ESBuild/
    ├── FileSystem/             # VSCode-like file system provider.
    ├── Function/               # Install helper functions.
    ├── Polyfills/              # Polyfills for Electron/Node APIs.
    ├── Types/                  # Shared type definitions.
    └── Workbench/              # VSCode workbench integration.
```

---

## Getting Started 🚀

### Installation

```sh
pnpm add @codeeditorland/wind
```

**Key Dependencies:**

- `@tauri-apps/api`: `2.10.1`
- `@tauri-apps/plugin-dialog`: `2.6.0`
- `effect`: `3.19.18`
- `@effect/platform`: `0.94.5`
- VSCode platform code (e.g., `vs/base`, `vs/platform`), typically sourced from
  the `Land/Dependency` submodule.

### Usage

`Wind` is primarily integrated via its [`Preload.ts`](Source/Preload.ts) script
and its `Effect-TS` layers.

1. **Integrate the Preload Script:** Configure your `tauri.config.json` to
   include the bundled `Preload.js` from `Wind` in your main window's preload
   scripts. This is essential for setting up the `window.vscode` environment.

2. **Use Services with Effect-TS:** If your `Sky` frontend uses `Effect-TS`, you
   can provide and use `Wind`'s services in your application's main entry point.

```ts
// In your main UI startup file (e.g., DesktopMain.ts)

import { IPC } from "@codeeditorland/wind/Effect";
import { TauriLiveLayer } from "@codeeditorland/wind/Effect/Layers/Tauri";
import { Effect, Layer, Runtime } from "effect";

// Build the application runtime with Tauri live layer
const AppRuntime = Layer.toRuntime(TauriLiveLayer).pipe(
	Effect.scoped,
	Effect.runSync,
);

// Example of using IPC within an Effect
const invokeEffect = Effect.gen(function* (_) {
	const ipcService = yield* _(IPC);

	const result = yield* _(
		ipcService.invoke("mountain_get_workbench_configuration"),
	);

	yield* _(Effect.log(`Configuration received: ${JSON.stringify(result)}`));
});

// Run the effect using the configured runtime
Runtime.runPromise(AppRuntime, invokeEffect);
```

3. **Available Effect Services:**

| Service         | Import Path                                                                       | Description                           |
| --------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| `IPC`           | [`@codeeditorland/wind/Effect`](Source/Effect/index.ts)                           | Inter-process communication via Tauri |
| `Sandbox`       | [`@codeeditorland/wind/Effect/Sandbox`](Source/Effect/Sandbox/index.ts)           | Preload globals and environment       |
| `Configuration` | [`@codeeditorland/wind/Effect/Configuration`](Source/Effect/Configuration.ts)     | Workbench configuration management    |
| `Telemetry`     | [`@codeeditorland/wind/Effect/Telemetry`](Source/Effect/Telemetry/index.ts)       | Logging, spans, and metrics           |
| `Mountain`      | [`@codeeditorland/wind/Effect/Mountain`](Source/Effect/Mountain/index.ts)         | Backend RPC connection                |
| `MountainSync`  | [`@codeeditorland/wind/Effect/MountainSync`](Source/Effect/MountainSync/index.ts) | Background synchronization            |
| `Environment`   | [`@codeeditorland/wind/Effect/Environment`](Source/Effect/Environment/index.ts)   | System/platform detection             |
| `Health`        | [`@codeeditorland/wind/Effect/Health`](Source/Effect/Health/index.ts)             | Service health checks                 |
| `Bootstrap`     | [`@codeeditorland/wind/Effect/Bootstrap`](Source/Effect/Bootstrap/index.ts)       | Multi-stage bootstrap orchestration   |
| `Clipboard`     | [`@codeeditorland/wind/Effect/Clipboard`](Source/Effect/Clipboard.ts)             | System clipboard access               |
| `ActivityBar`   | [`@codeeditorland/wind/Effect/ActivityBar`](Source/Effect/ActivityBar/index.ts)   | VSCode activity bar management        |
| `Panel`         | [`@codeeditorland/wind/Effect/Panel`](Source/Effect/Panel/index.ts)               | VSCode panel management               |
| `Sidebar`       | [`@codeeditorland/wind/Effect/Sidebar`](Source/Effect/Sidebar/index.ts)           | VSCode sidebar management             |
| `StatusBar`     | [`@codeeditorland/wind/Effect/StatusBar`](Source/Effect/StatusBar/index.ts)       | VSCode status bar management          |

---

## License ⚖️

This project is released into the public domain under the **Creative Commons CC0
Universal** license. You are free to use, modify, distribute, and build upon
this work for any purpose, without any restrictions. For the full legal text,
see the [`LICENSE`](https://github.com/CodeEditorLand/Wind/tree/Current/) file.

---

## Changelog 📜

Stay updated with our progress! See
[`CHANGELOG.md`](https://github.com/CodeEditorLand/Wind/tree/Current/) for a
history of changes specific to **Wind**.

---

## Funding & Acknowledgements 🙏🏻

**Wind** is a core element of the **Land** ecosystem. This project is funded
through [NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://NLnet.NL/project/Land).

<table>
	<thead>
		<tr>
			<th align="left"><strong>Land</strong></th>
			<th align="left"><strong>PlayForm</strong></th>
			<th align="left"><strong>NLnet</strong></th>
			<th align="left"><strong>NGI0 Commons Fund</strong></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td align="left" valign="middle">
				<a href="https://Editor.Land">
					<img width="60" src="https://raw.githubusercontent.com/CodeEditorLand/Asset/refs/heads/Current/Logo/Land.svg" alt="Land">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://PlayForm.Cloud">
					<img width="76" src="https://raw.githubusercontent.com/PlayForm/Asset/refs/heads/Current/Logo/PlayForm.svg" alt="PlayForm">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL">
					<img width="240" src="https://NLnet.NL/logo/banner.svg" alt="NLnet">
				</a>
			</td>
			<td align="left" valign="middle">
				<a href="https://NLnet.NL/commonsfund">
					<img width="240" src="https://NLnet.NL/image/logos/NGI0CommonsFund_tag_black_mono.svg" alt="NGI0 Commons Fund">
				</a>
			</td>
		</tr>
	</tbody>
</table>

---

**Project Maintainers**: Source Open
([Source/Open@Editor.Land](mailto:Source/Open@Editor.Land)) |
[GitHub Repository](https://github.com/CodeEditorLand/Wind) |
[Report an Issue](https://github.com/CodeEditorLand/Wind/issues) |
[Security Policy](https://github.com/CodeEditorLand/Wind/security/policy)
