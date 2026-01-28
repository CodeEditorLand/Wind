# Bootstrap Development Documentation

**File:** `Wind/Source/Bootstrap.ts`  
**Status:** ⚠️ In Development  
**Last Updated:** January 28, 2026  

## Overview

This document tracks the development of the Wind Bootstrap system, which orchestrates the initialization of the VSCode workbench within the Land ecosystem. The bootstrap system provides atomic, debuggable initialization stages that bridge the gap between Tauri, Wind services, and VSCode's workbench.

## Core Mission

The Bootstrap system must:
1. **Atomically initialize** all components required for VSCode workbench
2. **Provide comprehensive debugging** capabilities via atomic stages
3. **Bridge Wind Effect-TS services** to VSCode's service collection
4. **Handle errors gracefully** with recovery strategies
5. **Provide visual feedback** during initialization
6. **Support both Tauri and Browser** environments

## Current Architecture Analysis

### Existing Implementation

The current bootstrap system is already well-structured with 7 atomic stages:

```
Stage 0: Environment Detection
Stage 1: Preload Initialization  
Stage 2: Configuration Loading
Stage 3: Service Layer Setup
Stage 4: Workbench Preparation
Stage 5: Workbench Initialization
Stage 6: Health Check
```

### VSCode Integration Gap

**Critical Issue Identified:** The current bootstrap does not properly integrate with VSCode's workbench initialization sequence as documented in `01-VSCode-Startup-Sequence.md`.

VSCode requires:
1. Configuration injection via `<meta>` tag with `data-settings`
2. Setting `_VSCODE_FILE_ROOT` global variable
3. Proper service registration in VSCode's `ServiceCollection`
4. Calling VSCode's `create()` function with proper options

## Implementation Plan

### Phase 1: Analyze VSCode Bootstrap Sequence

**Files to Analyze:**
- `vs/code/browser/workbench/workbench.html` - HTML entry point
- `vs/code/browser/workbench/workbench.ts` - Bootstrap script
- `vs/workbench/workbench.web.main.internal.ts` - Factory exports
- `vs/workbench/browser/web.factory.ts` - create() function
- `vs/workbench/browser/web.main.ts` - BrowserMain initialization

**Analysis Tasks:**
1. [ ] Document exact configuration structure VSCode expects
2. [ ] Map VSCode service dependencies to Wind services
3. [ ] Identify required providers (WorkspaceProvider, SecretStorageProvider, etc.)
4. [ ] Document VSCode's initialization error handling
5. [ ] Identify any missing configuration fields

### Phase 2: Create Service Adapter Layer

**New Files Required:**
- `Wind/Source/Bootstrap/Integration/ServiceAdapter.ts` - Bridge Effect-TS to VSCode
- `Wind/Source/Bootstrap/Integration/CoreServices.ts` - Core service implementations
- `Wind/Source/Bootstrap/Integration/VSCodeTypes.ts` - VSCode type definitions

**Implementation Tasks:**
1. [ ] Create adapter pattern for Effect-TS services
2. [ ] Implement core service adapters (Logger, Environment, Configuration)
3. [ ] Create proper TypeScript interfaces matching VSCode
4. [ ] Test service registration and dependency injection
5. [ ] Implement error handling for service failures

### Phase 3: Update Bootstrap Stages

**Files to Update:**
- `Wind/Source/Bootstrap/Stage2-Configuration.ts` - Proper VSCode config injection
- `Wind/Source/Bootstrap/Stage3-Services.ts` - Integrate service adapters
- `Wind/Source/Bootstrap/Stage5-Initialization.ts` - VSCode workbench initialization

**Implementation Tasks:**
1. [ ] Update Stage 2 to inject VSCode configuration via meta tag
2. [ ] Update Stage 3 to register Wind services with VSCode ServiceCollection
3. [ ] Update Stage 5 to call VSCode's `create()` function
4. [ ] Add proper error handling for VSCode initialization
5. [ ] Test complete bootstrap sequence

### Phase 4: Integration Testing

**Testing Tasks:**
1. [ ] Test bootstrap in Tauri environment
2. [ ] Test bootstrap in Browser environment
3. [ ] Test error recovery scenarios
4. [ ] Test performance and memory usage
5. [ ] Validate VSCode workbench functionality

## VSCode Source Analysis

### Key Files Identified

From `01-VSCode-Startup-Sequence.md`, the critical VSCode files are:

```
vs/code/browser/workbench/workbench.html - HTML entry point
vs/code/browser/workbench/workbench.ts - Bootstrap script  
vs/workbench/workbench.web.main.internal.ts - Factory exports
vs/workbench/browser/web.factory.ts - create() function
vs/workbench/browser/web.main.ts - BrowserMain initialization
```

### Exact Bootstrap Sequence

**1. HTML Entry Point (`workbench.html`)**
- Sets `_VSCODE_FILE_ROOT` global
- Loads NLS messages
- Loads `workbench.js` (compiled from `workbench.ts`)

**2. Bootstrap Script (`workbench.ts`)**
- Reads configuration from `<meta id="vscode-workbench-web-configuration" data-settings="{...}">`
- Creates providers: `WorkspaceProvider`, `LocalStorageURLCallbackProvider`, `LocalStorageSecretStorageProvider`
- Calls `create()` from `web.factory.ts`

**3. Factory Function (`web.factory.ts`)**
- Registers commands from options
- Creates `BrowserMain` instance
- Calls `BrowserMain.open()`
- Returns `IWorkbench` API facade

**4. BrowserMain Initialization (`web.main.ts`)**
- `initServices()` - Registers 24+ core services
- Creates `Workbench` instance
- Calls `workbench.startup()`
- Returns `IWorkbench` API facade

### Configuration Structure

VSCode expects `IWorkbenchConstructionOptions` with fields:

```typescript
interface IWorkbenchConstructionOptions {
    // Connection
    remoteAuthority?: string;
    serverBasePath?: string;
    connectionToken?: string | Promise<string>;
    webviewEndpoint?: string;
    webSocketFactory?: IWebSocketFactory;
    resourceUriProvider?: IResourceUriProvider;
    resolveExternalUri?: IExternalUriResolver;
    tunnelProvider?: ITunnelProvider;
    codeExchangeProxyEndpoints?: { [providerId: string]: string };
    editSessionId?: string;
    remoteResourceProvider?: IRemoteResourceProvider;
    
    // Workbench
    workspaceProvider?: IWorkspaceProvider;
    settingsSyncOptions?: ISettingsSyncOptions;
    secretStorageProvider?: ISecretStorageProvider;
    additionalBuiltinExtensions?: readonly (MarketplaceExtension | UriComponents)[];
    enabledExtensions?: readonly ExtensionId[];
    additionalTrustedDomains?: string[];
    enableWorkspaceTrust?: boolean;
    openerAllowedExternalUrlPrefixes?: string[];
    urlCallbackProvider?: IURLCallbackProvider;
    resolveCommonTelemetryProperties?: ICommonTelemetryPropertiesResolver;
    commands?: readonly ICommand[];
    defaultLayout?: IDefaultLayout;
    configurationDefaults?: Record<string, unknown>;
    
    // Profile
    profile?: { readonly name: string; readonly contents?: string | UriComponents };
    profileToPreview?: UriComponents;
    
    // Update/Quality
    updateProvider?: IUpdateProvider;
    productQualityChangeHandler?: IProductQualityChangeHandler;
    
    // Branding
    welcomeBanner?: IWelcomeBanner;
    productConfiguration?: Partial<IProductConfiguration>;
    windowIndicator?: IWindowIndicator;
    initialColorTheme?: IInitialColorTheme;
    
    // IPC
    messagePorts?: ReadonlyMap<ExtensionId, MessagePort>;
    
    // Authentication
    authenticationProviders?: readonly IAuthenticationProvider[];
    
    // Development
    developmentOptions?: IDevelopmentOptions;
}
```

### Service Requirements

VSCode requires 24+ core services including:
- `IProductService` - Product configuration
- `IBrowserWorkbenchEnvironmentService` - Environment variables
- `IFileService` - File system abstraction
- `ILoggerService` - Logging infrastructure
- `IRemoteAuthorityResolverService` - Remote connection resolution
- `IWorkspaceContextService` - Workspace state
- `IWorkbenchConfigurationService` - Configuration management

## Development Approach

### Documentation-First Methodology

Each file will follow this pattern:

1. **Analysis Phase:** Document VSCode source code requirements
2. **Planning Phase:** Create implementation plan matching VSCode architecture
3. **Execution Phase:** Implement with proper typing and error handling
4. **Documentation Phase:** Update this document with progress

### Reorganized Module Structure

The Bootstrap system has been reorganized into a modular architecture:

```
Bootstrap/
├── Core/                    # Core bootstrap infrastructure
│   ├── BootstrapOrchestrator.ts
│   ├── StatusReporter.ts
│   ├── ErrorHandler.ts
│   └── index.ts
├── Stages/                  # Individual bootstrap stages
│   ├── Stage0-Environment.ts
│   ├── Stage1-Preload.ts
│   ├── Stage2-Configuration.ts
│   ├── Stage3-Services.ts
│   ├── Stage4-Preparation.ts
│   ├── Stage5-Initialization.ts
│   ├── Stage6-HealthCheck.ts
│   └── index.ts
├── Integration/             # VSCode integration layer
│   ├── ServiceAdapter.ts    # Wind → VSCode service bridge
│   ├── CoreServices.ts     # VSCode service implementations
│   └── index.ts
├── Types/                  # Type definitions
│   ├── BootstrapTypes.ts   # Bootstrap-specific types
│   ├── VSCodeTypes.ts      # VSCode-specific types
│   └── index.ts
├── Utils/                  # Utility functions
│   ├── Logger.ts           # Enhanced logging
│   ├── Performance.ts      # Performance tracking
│   └── index.ts
└── Documentation/          # Development tracking
    ├── Bootstrap.md        # Main development tracking
    ├── Core.md            # Core module documentation
    ├── Stages.md          # Stage development tracking
    ├── Integration.md     # Integration documentation
    └── LLM-SPECIFICATION.md
```

### File-by-File Implementation Status

#### ✅ Core Module (Complete)
- **BootstrapOrchestrator.ts** - Stage coordination (COMPLETE)
- **ErrorHandler.ts** - Centralized error handling (COMPLETE)
- **StatusReporter.ts** - Visual feedback system (COMPLETE)

#### 🟡 Stages Module (In Progress)
- **Stage0-Environment.ts** - Environment detection (COMPLETE)
- **Stage1-Preload.ts** - Preload validation (COMPLETE)
- **Stage2-Configuration.ts** - Configuration loading (COMPLETE)
- **Stage3-Services.ts** - Service layer setup (VSCode Integration Needed)
- **Stage4-Preparation.ts** - Workbench preparation (VSCode Integration Needed)
- **Stage5-Initialization.ts** - Workbench initialization (CRITICAL - Not Started)
- **Stage6-HealthCheck.ts** - Health checking (Not Started)

#### 🔴 Integration Module (Critical Development Needed)
- **ServiceAdapter.ts** - Wind → VSCode service bridge (Critical)
- **CoreServices.ts** - VSCode service implementations (Critical)

## Current Status

### ✅ Completed Components

#### Core Module (Fully Functional)
- **Bootstrap Orchestrator:** Stage coordination and error handling
- **Error Handler:** Centralized error management with recovery strategies
- **Status Reporter:** Real-time visual feedback system

#### Stages Module (Partially Complete)
- **Environment Stage:** Platform detection and validation (COMPLETE)
- **Preload Stage:** Window.vscode validation and IPC testing (COMPLETE)
- **Configuration Stage:** Configuration loading with basic validation (COMPLETE)

### 🟡 In Progress

#### Stages Module (VSCode Integration Needed)
- **Services Stage:** Service layer setup with Effect-TS integration (VSCode ServiceCollection integration needed)
- **Preparation Stage:** Workbench preparation with DOM setup (VSCode configuration injection needed)

### 🔴 Critical Development Needed

#### Integration Module
- **ServiceAdapter.ts:** Wind → VSCode service bridge (CRITICAL)
- **CoreServices.ts:** VSCode service implementations (CRITICAL)

#### Stages Module
- **Initialization Stage:** VSCode workbench creation (CRITICAL)
- **Health Check Stage:** VSCode functionality testing (HIGH PRIORITY)

1. **Analyze VSCode's `workbench.ts`** - Understand exact initialization sequence
2. **Create ServiceAdapter.ts** - Bridge Wind services to VSCode
3. **Update Stage2-Configuration.ts** - Implement VSCode config injection

### Medium Priority (Week 2)

1. **Update Stage3-Services.ts** - Integrate service adapter layer
2. **Update Stage5-Initialization.ts** - Implement VSCode workbench creation
3. **Test bootstrap sequence** - Validate VSCode workbench starts

### Long Term (Week 3-4)

1. **Implement all VSCode services** - Complete service integration
2. **Add comprehensive testing** - Ensure reliability
3. **Performance optimization** - Reduce bootstrap time

## Technical Challenges

### Challenge 1: Service Bridge Complexity

**Problem:** VSCode expects synchronous service interfaces, but Wind uses Effect-TS async patterns.

**Solution:** Create adapter layer that wraps Effect-TS services with synchronous VSCode interfaces, handling async operations internally.

### Challenge 2: Configuration Validation

**Problem:** VSCode has strict configuration requirements that must be met.

**Solution:** Implement comprehensive validation with sensible defaults and graceful degradation.

### Challenge 3: Error Recovery

**Problem:** VSCode initialization failures can be complex to recover from.

**Solution:** Implement staged recovery with fallback configurations and service implementations.

## Related Files

### VSCode Source Files (To Analyze)

- `Application/CodeEditorLand/Land/Dependency/Microsoft/Dependency/Editor/src/vs/code/browser/workbench/workbench.ts`
- `Application/CodeEditorLand/Land/Dependency/Microsoft/Dependency/Editor/src/vs/workbench/browser/web.factory.ts`
- `Application/CodeEditorLand/Land/Dependency/Microsoft/Dependency/Editor/src/vs/workbench/browser/web.main.ts`

### Wind Service Files (To Integrate)

- `Wind/Source/Archive/Application/` - 50+ Effect-TS services
- `Wind/Source/Preload.ts` - Preload script with window.vscode setup
- `Wind/Source/Bootstrap/` - Bootstrap system components

### Sky Integration Files

- `Sky/Source/pages/Application.astro` - Main entry point
- `Sky/Source/Workbench/Browser.astro` - Browser workbench loader
- `Sky/Source/Workbench/Default.astro` - Electron workbench loader

## Testing Strategy

### Unit Testing

- Test each bootstrap stage independently
- Mock VSCode dependencies
- Validate error handling

### Integration Testing

- Test complete bootstrap sequence
- Validate VSCode workbench functionality
- Test error recovery scenarios

### Performance Testing

- Measure bootstrap time
- Monitor memory usage
- Identify performance bottlenecks

## Success Criteria

### Phase 1 Complete
- [ ] VSCode configuration properly injected
- [ ] Wind preload script validated
- [ ] Bootstrap stages execute without critical errors

### Phase 2 Complete  
- [ ] VSCode workbench starts successfully
- [ ] Core services (Logger, Environment, Configuration) functional
- [ ] Basic editor functionality works

### Phase 3 Complete
- [ ] All VSCode services integrated
- [ ] Full workbench functionality available
- [ ] Error recovery working correctly

## References

1. **VSCode Startup Sequence:** `Application/CodeEditorLand/Documentation/Plan/01-VSCode-Startup-Sequence.md`
2. **Land Architecture:** `Application/CodeEditorLand/Documentation/Plan/03-Land-Architecture-Overview.md`
3. **Mountain Integration:** `Application/CodeEditorLand/Documentation/Plan/04-Mountain-Integration-Plan.md`
4. **Effect-TS Documentation:** https://effect.website/
5. **Tauri API Documentation:** https://tauri.app/

---

*This document will be updated as development progresses.*
