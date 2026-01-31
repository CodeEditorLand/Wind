# Desktop Workbench Implementation Plan

## Overview

This document outlines the comprehensive plan for implementing VSCode's desktop
workbench using Wind services for Tauri integration, based on detailed analysis
of VSCode source code.

## VSCode Workbench Architecture Analysis

### Core Workbench Structure (`vs/workbench/browser/workbench.ts`)

The VSCode Workbench class extends Layout and manages:

1. **Lifecycle Management**: Shutdown events, error handling, phase transitions
2. **Service Infrastructure**: InstantiationService with dependency injection
3. **UI Components**: Workbench parts layout and rendering
4. **Event System**: Configuration changes, focus events, lifecycle events

### Key Implementation Details from Source Analysis

#### Service Initialization Sequence

```typescript
private initServices(serviceCollection: ServiceCollection): IInstantiationService {
    // Layout Service registration
    serviceCollection.set(IWorkbenchLayoutService, this);

    // Contributed services from registry
    const contributedServices = getSingletonServiceDescriptors();
    for (const [id, descriptor] of contributedServices) {
        serviceCollection.set(id, descriptor);
    }

    const instantiationService = new InstantiationService(serviceCollection, true);
    // ... lifecycle phase transitions
}
```

#### Workbench Parts Creation

```typescript
// Parts definition from workbench.ts
const parts = [
    { id: Parts.TITLEBAR_PART, role: 'none', classes: ['titlebar'] },
    { id: Parts.BANNER_PART, role: 'banner', classes: ['banner'] },
    { id: Parts.ACTIVITYBAR_PART, role: 'none', classes: ['activitybar', 'left/right'] },
    { id: Parts.SIDEBAR_PART, role: 'none', classes: ['sidebar', 'left/right'] },
    { id: Parts.EDITOR_PART, role: 'main', classes: ['editor'] },
    { id: Parts.PANEL_PART, role: 'none', classes: ['panel', 'basepanel'] },
    { id: Parts.AUXILIARYBAR_PART, role: 'none', classes: ['auxiliarybar', 'basepanel'] },
    { id: Parts.STATUSBAR_PART, role: 'status', classes: ['statusbar'] }
];
```

#### Factory Pattern (`vs/workbench/browser/web.factory.ts`)

- Uses `create()` function to instantiate workbench
- Registers commands and menus
- Manages workbench lifecycle through BrowserMain

## Required VSCode Services for Wind Integration

### Critical Services (Must Implement)

1. **InstantiationService**
   (`vs/platform/instantiation/common/instantiationService.ts`)
    - Dependency injection container
    - Service lifecycle management
    - TODO: Implement Wind-compatible instantiation service

2. **StorageService** (`vs/platform/storage/common/storage.ts`)
    - Persistent data storage
    - Scope-based storage (APPLICATION, WORKSPACE, PROFILE)
    - TODO: Complete TauriStorageService implementation

3. **ConfigurationService**
   (`vs/platform/configuration/common/configuration.ts`)
    - Configuration management and validation
    - Change event propagation
    - TODO: Implement TauriConfigurationService

4. **LifecycleService** (`vs/workbench/services/lifecycle/common/lifecycle.ts`)
    - Lifecycle phase management (Ready, Restored, Eventually)
    - Shutdown event handling
    - TODO: Implement WindLifecycleService

5. **HostService** (`vs/workbench/services/host/browser/host.ts`)
    - Window management and focus events
    - Multi-window support
    - TODO: Implement TauriHostService

### UI Services

6. **NotificationService**
   (`vs/workbench/services/notification/common/notificationService.ts`)
    - Notification center, toasts, alerts
    - TODO: Implement WindNotificationService

7. **DialogService** (`vs/platform/dialogs/common/dialogs.ts`)
    - Modal dialog management
    - TODO: Implement TauriDialogService

8. **HoverService** (`vs/platform/hover/browser/hover.ts`)
    - Hover delegate management
    - TODO: Implement WindHoverService

## Wind/Tauri Implementation Strategy

### Phase 1: Core Service Infrastructure ✅ COMPLETED

- [x] TauriIPCServer - Basic IPC implementation
- [x] TauriStorageService - Basic storage implementation
- [x] ServiceMapping Registry - Service mapping infrastructure
- [x] TauriWorkbenchBootstrap - Bootstrap framework

### Phase 2: Critical Service Implementation 🔄 IN PROGRESS

#### 2.1 TauriFileService Implementation

**Source Reference**: `vs/platform/files/common/files.ts` **Wind Equivalent**:
`Source/Desktop/TauriFileService.ts` **TODO**:

- [ ] Implement file system operations
- [ ] Add file watching capabilities
- [ ] Implement file event handling
- [ ] Add error recovery mechanisms

#### 2.2 TauriConfigurationService Implementation

**Source Reference**: `vs/platform/configuration/common/configuration.ts` **Wind
Equivalent**: `Source/Desktop/TauriConfigurationService.ts` **TODO**:

- [ ] Implement configuration storage
- [ ] Add configuration validation
- [ ] Implement change event system
- [ ] Add migration support

#### 2.3 WindInstantiationService Implementation

**Source Reference**: `vs/platform/instantiation/common/instantiationService.ts`
**Wind Equivalent**: `Source/Services/WindInstantiationService.ts` **TODO**:

- [ ] Implement service descriptor registry
- [ ] Add dependency injection
- [ ] Implement service lifecycle
- [ ] Add error handling

### Phase 3: Workbench Creation ❌ NOT STARTED

#### 3.1 Workbench Class Implementation

**Source Reference**: `vs/workbench/browser/workbench.ts` **Wind Equivalent**:
`Source/Desktop/TauriWorkbench.ts` **TODO**:

- [ ] Extend Layout class
- [ ] Implement service initialization
- [ ] Create workbench parts
- [ ] Implement rendering pipeline

#### 3.2 Workbench Factory Implementation

**Source Reference**: `vs/workbench/browser/web.factory.ts` **Wind Equivalent**:
`Source/Desktop/TauriWorkbenchFactory.ts` **TODO**:

- [ ] Implement create() function
- [ ] Register commands and menus
- [ ] Manage workbench lifecycle

### Phase 4: UI Components ❌ NOT STARTED

#### 4.1 Workbench Parts Implementation

**TODO**:

- [ ] Titlebar part
- [ ] Activitybar part
- [ ] Sidebar part
- [ ] Editor part
- [ ] Panel part
- [ ] Statusbar part

#### 4.2 Notification System

**TODO**:

- [ ] Notification center
- [ ] Toast notifications
- [ ] Alert system
- [ ] Accessible notifications

## Implementation Details

### Service Dependency Resolution

Based on VSCode's service initialization pattern:

```typescript
// VSCode pattern
instantiationService.invokeFunction(accessor => {
    const lifecycleService = accessor.get(ILifecycleService);
    const storageService = accessor.get(IStorageService);
    // ... service resolution
});
```

**Wind Implementation Strategy**:

- Use ServiceMappingRegistry for service resolution
- Implement dependency injection through accessor pattern
- Handle service lifecycle transitions

### Error Handling Strategy

VSCode uses comprehensive error handling:

- Global unhandled rejection handler
- Unexpected error handler with deduplication
- Graceful degradation for non-critical services

**Wind Implementation**:

- Implement similar error handling patterns
- Add service-specific error recovery
- Ensure graceful degradation

### Performance Optimization

VSCode uses performance marks:

- `mark('code/willStartWorkbench')`
- `mark('code/didStartWorkbench')`
- Performance measurement for workbench creation

**Wind Implementation**:

- Add performance tracking
- Implement lazy loading for services
- Optimize bootstrap sequence

## VSCode Source Files for Reference

### Core Files

- `vs/workbench/browser/workbench.ts` - Main workbench implementation
- `vs/workbench/browser/web.factory.ts` - Workbench factory
- `vs/workbench/browser/web.main.ts` - Browser main entry
- `vs/workbench/electron-browser/desktop.main.ts` - Desktop main entry

### Service Files

- `vs/platform/instantiation/common/instantiationService.ts` - Service container
- `vs/platform/storage/common/storage.ts` - Storage service
- `vs/platform/configuration/common/configuration.ts` - Configuration service
- `vs/workbench/services/lifecycle/common/lifecycle.ts` - Lifecycle service

### UI Component Files

- `vs/workbench/browser/parts/notifications/` - Notification system
- `vs/workbench/browser/parts/editor/editorPart.ts` - Editor part
- `vs/workbench/browser/parts/activitybar/activitybarPart.ts` - Activitybar

## Next Implementation Steps

### Immediate (Next Session)

1. **Complete TauriFileService** - Implement file system operations
2. **Implement TauriConfigurationService** - Configuration management
3. **Create WindInstantiationService** - Dependency injection

### Short-term (1-2 Sessions)

1. **Implement Workbench class** - Core workbench functionality
2. **Create workbench parts** - UI components implementation
3. **Integrate service mapping** - Complete service adaptation

### Testing Strategy

1. Unit tests for each service
2. Integration tests for service interactions
3. End-to-end tests for workbench creation

## Service Mapping Details

### Main Process Service (IMainProcessService)

```typescript
// VSCode Electron Implementation
class ElectronIPCMainProcessService {
  getChannel(name: string): IChannel
  invoke<T>(command: string, ...args: any[]): Promise<T>
}

// Tauri Implementation
class TauriMainProcessService {
  async invoke<T>(command: string, ...args: any[]): Promise<T> {
    return await invoke<T>(command, ...args);
  }
}
```

### Native Host Service (INativeHostService)

```typescript
// VSCode Electron Implementation
class ElectronNativeHostService {
  showItemInFolder(path: string): Promise<void>
  openExternal(url: string): Promise<boolean>
  setDocumentEdited(edited: boolean): void
}

// Tauri Implementation
class TauriNativeHostService {
  async showItemInFolder(path: string): Promise<void> {
    await invoke('show_item_in_folder', { path });
  }

  async openExternal(url: string): Promise<boolean> {
    return await invoke('open_external', { url });
  }
}
```

### File Service (IFileService)

```typescript
// VSCode Electron Implementation
class DiskFileSystemProvider {
  readFile(resource: URI): Promise<Uint8Array>
  writeFile(resource: URI, content: Uint8Array): Promise<void>
}

// Tauri Implementation
class TauriFileSystemProvider {
  async readFile(resource: URI): Promise<Uint8Array> {
    const fs = await import('@tauri-apps/api/fs');
    return await fs.readBinaryFile(resource.fsPath);
  }
}
```

## Bootstrap Sequence for Desktop

### Stage 1: Preload Setup

- Initialize Tauri API shims
- Set up window.vscode global
- Load desktop configuration

### Stage 2: Service Registration

- Register desktop-specific services
- Set up Tauri IPC channels
- Initialize file system providers

### Stage 3: Workbench Creation

- Create desktop workbench instance
- Set up window management
- Initialize editor components

### Stage 4: Desktop Features

- Set up menu bar integration
- Configure window controls
- Initialize extension host

## Critical TODOs and Missing Components

### High Priority TODOs

1. **Tauri IPC Bridge** - Missing implementation
2. **File System Integration** - Needs Tauri FS APIs
3. **Window Management** - Tauri window controls
4. **Menu Bar Integration** - Tauri menu system

### Medium Priority TODOs

1. **Extension Host** - Running extensions in Tauri
2. **Debug Integration** - Debug adapter protocol
3. **Terminal Integration** - Tauri terminal APIs
4. **Search Integration** - File search functionality

### Low Priority TODOs

1. **Theme Integration** - Custom titlebar theming
2. **Accessibility** - Screen reader support
3. **Performance** - Optimizations for Tauri
4. **Testing** - Desktop-specific tests

## Integration Points with Sky

### Webview Configuration

```typescript
// Sky webview needs desktop-specific configuration
const desktopConfig = {
  enableDesktopFeatures: true,
  useTauriAPIs: true,
  windowManagement: true,
  fileSystemAccess: true
};
```

### Wind Services Integration

```typescript
// Desktop services extend Wind services
class DesktopWindService extends WindService {
  // Add desktop-specific functionality
  async openFileDialog(): Promise<URI> {
    // Use Tauri file dialogs
  }
}
```

## Performance Considerations

### Startup Optimization

- Preload critical services
- Lazy load desktop features
- Optimize Tauri IPC calls

### Memory Management

- Proper service disposal
- Window state management
- Resource cleanup

## Testing Strategy

### Unit Tests

- Service adapter layers
- IPC communication
- Window management

### Integration Tests

- Desktop workbench startup
- File system operations
- Extension loading

### End-to-End Tests

- Complete desktop workflow
- Multi-window scenarios
- Performance benchmarks

## Next Steps

1. **Create DesktopMain.ts** - Implement desktop entry point
2. **Implement TauriNativeWindow.ts** - Window management
3. **Create service adapters** - Bridge VSCode services to Wind
4. **Implement IPC bridge** - Tauri communication layer
5. **Test desktop bootstrap** - Verify startup sequence

## References

- [VSCode Desktop Main Source](src/vs/workbench/electron-browser/desktop.main.ts)
- [VSCode NativeWindow Source](src/vs/workbench/electron-browser/window.ts)
- [VSCode Workbench Source](src/vs/workbench/browser/workbench.ts)
- [Tauri API Documentation](https://tauri.app/v1/api/)
- [Tauri File System API](https://tauri.app/v1/api/js/fs/)
