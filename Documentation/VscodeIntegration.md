# VSCode Workbench Integration Guide

## Overview

This guide explains how to run the native VSCode workbench inside Tauri through
the Wind element.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Tauri Window                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Preload Script                           │  │
│  │  (Runs before page content)                           │  │
│  │  - Sets up window.vscode API                          │  │
│  │  - Shim Electron APIs (ipcRenderer, process)         │  │
│  │  - Loads Mountain configuration                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Bootstrap Script                          │  │
│  │  (Main page content)                                  │  │
│  │  - Waits for window.vscode to be ready               │  │
│  │  - Initializes VSCode Workbench                       │  │
│  │  - Registers services                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
Element/Wind/
├── Source/
│   ├── Preload.ts              # Preload script for Tauri
│   ├── Bootstrap.ts            # VSCode workbench bootstrap
│   ├── Archive/                # Legacy service implementations
│   │   ├── Bridge.ts           # DEPRECATED: Will be removed in future refactor
│   │   └── Application/        # Effect-TS service implementations
│   └── Configuration/
│       └── ESBuild/
│           └── Wind.ts        # Build configuration
└── Configuration/
    └── Preload.js              # Compiled preload script
```

## Build Steps

### 1. Build Wind Preload Script

```bash
cd Application/CodeEditorLand/Land/Element/Wind
pnpm install
NODE_ENV=development pnpm exec esbuild Source/Configuration/ESBuild/Wind.ts
```

This will generate:

- `Configuration/Preload.js` - The preload script for Tauri
- `Configuration/Bootstrap.js` - The workbench bootstrap script

### 2. Build Sky (Frontend)

```bash
cd Application/CodeEditorLand/Land/Element/Sky
pnpm install
pnpm run Run
```

This builds the frontend and includes the Bootstrap script.

### 3. Build Mountain (Tauri Backend)

```bash
cd Application/CodeEditorLand/Land/Element/Mountain
cargo build
```

### 4. Run the Application

```bash
cd Application/CodeEditorLand/Land
pnpm cross-env \
	Browser=false \
	Bundle=true \
	Clean=true \
	Compile=false \
	Dependency=Microsoft/VSCode \
	NODE_ENV=development \
	NODE_VERSION=22 \
	NODE_OPTIONS=--max-old-space-size=16384 \
	./Target/release/Maintain -- pnpm tauri dev
```

Or use the debug script:

```bash
cd Application/CodeEditorLand/Land
bash Maintain/Debug.sh
```

## Configuration

### Tauri Configuration (`Element/Mountain/tauri.conf.json`)

Key settings for VSCode integration:

```json
{
	"app": {
		"windows": [
			{
				"webview": {
					"preload": "../Wind/Configuration/Preload.js"
				}
			}
		]
	},
	"build": {
		"frontendDist": "../Sky/Target",
		"beforeDevCommand": "pnpm run Run --filter=@codeeditorland/sky --force"
	}
}
```

### CSP (Content Security Policy)

The configuration includes VSCode-specific CSP directives:

```json
{
	"csp": {
		"script-src": "'self' 'unsafe-inline' 'unsafe-eval' blob: http://localhost:* https://tauri.localhost",
		"frame-src": "'self' vscode-webview: http://localhost:* https://tauri.localhost",
		"font-src": "'self' vscode-remote-resource: vscode-managed-remote-resource: http://localhost:* https://tauri.localhost",
		"img-src": "'self' data: blob: vscode-remote-resource: vscode-managed-remote-resource: http://localhost:* https://tauri.localhost https:"
	}
}
```

## Required Mountain Backend Commands

The following Tauri commands must be implemented in the Rust backend:

### `mountain_get_workbench_configuration`

Returns the VSCode sandbox configuration:

```rust
#[tauri::command]
async fn get_workbench_configuration() -> ISandboxConfiguration {
    // Return configuration with:
    // - windowId
    // - machineId
    // - sessionId
    // - appRoot
    // - userDataPath
    // - logLevel
    // - userEnv
    // - platform
    // - arch
    // - zoomLevel
    // - nls
    // - productConfiguration
}
```

### `mountain_ipc_send`

Sends IPC messages from renderer to backend:

```rust
#[tauri::command]
async fn ipc_send(channel: String, args: Vec<Value>) -> Result<(), Error> {
    // Handle IPC communication
    // Dispatch to appropriate service handlers
}
```

### `vscode_ipc:*`

Generic IPC invoke handler:

```rust
#[tauri::command]
async fn vscode_ipc_invoke(command: String, args: Vec<Value>) -> Result<Value, Error> {
    // Handle VSCode IPC commands
    // Map to appropriate backend services
}
```

### `mountain_fetch_shell_env`

Fetches shell environment variables:

```rust
#[tauri::command]
async fn fetch_shell_env() -> Result<HashMap<String, String>, Error> {
    // Return environment variables like PATH, HOME, etc.
}
```

## Debugging

### Enable DevTools

To debug the webview, enable devtools in Tauri configuration:

```json
{
	"app": {
		"windows": [
			{
				"webview": {
					"devtools": true
				}
			}
		]
	}
}
```

### Console Logging

The preload and bootstrap scripts include extensive logging:

```javascript
console.log("[Wind Preload] Initializing Wind environment...");
console.log("[Wind Bootstrap] VSCode Workbench initialized");
```

### Check window.vscode

Open DevTools console and verify:

```javascript
window.vscode;
// Should show: { ipcRenderer: {...}, process: {...}, context: {...}, ... }
```

## Current Status

###&#x2001;✅ Implemented

1. **Preload Script** (`Source/Preload.ts`)
    - IPC renderer shim with Tauri integration
    - Process shim with platform detection
    - Configuration resolution with fallback
    - Event listener management

2. **Bootstrap Script** (`Source/Bootstrap.ts`)
    - Workbench initialization framework
    - Configuration loading
    - Service collection setup (placeholder)
    - Debug UI status display

3. **Build Configuration** (`Source/Configuration/ESBuild/Wind.ts`)
    - ESBuild configuration for both scripts
    - Environment aware (dev vs production)
    - Automatic cleanup support

4. **Tauri Integration** (`Element/Mountain/tauri.conf.json`)
    - Preload script configured
    - Window configuration for VSCode
    - CSP policies for VSCode resources

###&#x2001;⚠️ DEPRECATED

1. **Complete Service Layer Integration**
    - Introduce Wind's Effect-TS services into Bootstrap.ts
    - Register ILogService, IFileDialogService, etc.
    - Connect to Mountain backend commands

2. **Implement Rust Backend Commands**
    - `mountain_get_workbench_configuration`
    - `mountain_ipc_send`
    - `mountain_fetch_shell_env`

3. **Full Workbench Loading**
    - Load actual VSCode workbench code
    - Register all required VSCode services
    - Initialize workbench with proper configuration

4. **Testing & Validation**
    - Test with real VSCode source code
    - Validate all Electron API shims
    - Performance optimization

## Troubleshooting

### Issue: Preload script not loading

**Symptoms**: `window.vscode` is undefined

**Solutions**:

1. Verify `Preload.js` exists at `Wind/Configuration/Preload.js`
2. Check Tauri configuration `preload` path is correct
3. Enable devtools to see preload errors
4. Check console for "[Wind Preload] Initializing Wind environment..."

### Issue: Configuration not loading

**Symptoms**: Configuration errors or fallback mode

**Solutions**:

1. Implement `mountain_get_workbench_configuration` in Rust
2. Check console for Mountain connection errors
3. Verify IPC communication is working
4. Check network requests in devtools

### Issue: Workbench not starting

**Symptoms**: No VSCode UI appears

**Solutions**:

1. Check Bootstrap.ts logs in console
2. Verify VSCode dependencies are available
3. Ensure all services are registered
4. Enable devtools for workbench errors

## Next Steps

1. **Build Wind**:

    ```bash
    cd Element/Wind
    pnpm install
    node -e "import('./Source/Configuration/ESBuild/Wind.js').then(m => m.default())"
    ```

2. **Verify Preload Output**: Check that `Element/Wind/Configuration/Preload.js`
   exists

3. **Test Tauri Integration**: Run `Maintain/Debug.sh` and check console logs

4. **Implement Backend Commands**: Add the required Rust commands in Mountain

5. **Introduce Services**: Connect Wind's Effect-TS services to the workbench

## Resources

- [VSCode Source Code](https://github.com/CodeEditorLand/Wind/tree/Current/Dependency/Microsoft/Dependency/Editor/src)
- [Wind README](https://github.com/CodeEditorLand/Wind/tree/Current/README.md)
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Effect-TS Documentation](https://effect.website/)
