<table>
<tr>
<td align="left" valign="middle">
<h3 align="left"> Wind</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
🍃
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left"> + </h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://PlayForm.Cloud/Dark/Image/GitHub/Land.svg">
<source media="(prefers-color-scheme: light)" srcset="https://PlayForm.Cloud/Image/GitHub/Land.svg">
<img width="28" alt="Land Logo" src="https://PlayForm.Cloud/Image/GitHub/Land.svg">
</picture>
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
<a href="https://Editor.Land" target="_blank">
Land
</a>
</h3>
</td>
<td align="left" valign="middle">
<h3 align="left">
🏞️
</h3>
</td>
</tr>
</table>


---

# **Wind**&#x2001;🍃

> **VS Code's workbench lives in the Chromium renderer. Every panel interaction that touches files or state crosses the Electron IPC bridge twice: serialize to JSON, send over a pipe, deserialize on the other side.**

_"No Electron IPC proxy. Workbench actions hit the OS directly."_

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg)](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@codeeditorland/wind.svg)](https://www.npmjs.com/package/@codeeditorland/wind)
[<img src="https://editor.land/Image/Tauri.svg" width="14" alt="Tauri" />](https://tauri.app/)&#x2001;[![Tauri API Version](https://img.shields.io/badge/Tauri_API-v2.10.1-blue.svg)](https://www.npmjs.com/package/@tauri-apps/api)
[<img src="https://editor.land/Image/EffectTS.svg" width="14" alt="Effect-TS" />](https://effect.website/)&#x2001;[![Effect Version](https://img.shields.io/badge/Effect-v3.19.18-blueviolet.svg)](https://www.npmjs.com/package/effect)

Wind re-implements the VS Code Workbench as composable Effect-TS Layers. Each workbench service (file dialogs, clipboard, configuration, output channels, status bar) is a typed Layer that can be provided, mocked, or replaced without touching other services. OS calls go directly through Mountain's Tauri bindings. No JSON serialization. The workbench can be tested in isolation by providing mock layers instead of a running Tauri instance.

---

## What It Does&#x2001;🔐

- **Direct OS access.** File dialogs, clipboard, and configuration hit the OS through Tauri bindings. No IPC proxy.
- **Composable Effect-TS Layers.** Each workbench service is independently providable, mockable, and replaceable.
- **Compile-time safety.** Refactoring a service breaks its consumers at compile time, not silently at runtime.
- **Full testability.** Provide mock layers and test the workbench without a running Tauri instance.

---

## In the Ecosystem&#x2001;🍃 + 🏞️

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

## Project Structure&#x2001;🗺️

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

## Development&#x2001;🛠️

Wind is a component of the Land workspace. Follow the
[Land Repository](https://github.com/CodeEditorLand/Land) instructions to
build and run.

---

## License&#x2001;⚖️

CC0 1.0 Universal. Public domain. No restrictions.
[LICENSE](https://github.com/CodeEditorLand/Wind/tree/Current/LICENSE)

---

## See Also

- [Wind Documentation](https://editor.land/Doc/wind)
- [Architecture Overview](https://editor.land/Doc/architecture)
- [Why Effect-TS](https://editor.land/Doc/why-effect-ts)
- [Why Tauri](https://editor.land/Doc/why-tauri)
- [Mountain](https://github.com/CodeEditorLand/Mountain)
- [Sky](https://github.com/CodeEditorLand/Sky)
- [Cocoon](https://github.com/CodeEditorLand/Cocoon)


## Funding & Acknowledgements 🙏🏻

**Wind** is a core element of the **Land** ecosystem. This project is funded
through [NGI0 Commons Fund](https://NLnet.NL/commonsfund), a fund established by
[NLnet](https://NLnet.NL) with financial support from the European Commission's
[Next Generation Internet](https://ngi.eu) program. Learn more at the
[NLnet project page](https://NLnet.NL/project/Land).

The project is operated by PlayForm, based in Sofia, Bulgaria.

PlayForm acts as the open-source steward for Code Editor Land under the NGI0
Commons Fund grant.

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
