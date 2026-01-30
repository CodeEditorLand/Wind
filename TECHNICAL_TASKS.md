# Wind Project - Detailed Technical Tasks

**Generated**: January 30, 2026  
**Project**: Wind 🍃 (VSCode Environment & Services for Tauri)  
**Scope**: Implementation-ready technical tasks  

---

## 🔴 EMERGENCY - BLOCKING COMPILATION (MUST FIX TODAY)

### Task 1: Fix Regex Syntax Errors in DesktopMain.ts
**File**: [Source/Desktop/DesktopMain.ts](Source/Desktop/DesktopMain.ts)  
**Severity**: 🔴 CRITICAL - Blocks all compilation  
**Estimated Time**: 15 minutes  

**Error 1 - Line 261**
```typescript
// CURRENT (WRONG):
const macosMatch = userAgent.match(/Mac OS X ([0-9_]+)\/);

// SHOULD BE:
const macosMatch = userAgent.match(/Mac OS X ([0-9_]+)/);
```

**Error 2 - Line 262**
```typescript
// CURRENT (WRONG):
const macosMatchAlt = userAgent.match(/Macintosh;.*Mac OS X ([0-9_.]+)/);

// SHOULD BE:
const macosMatchAlt = userAgent.match(/Macintosh;.*Mac OS X ([0-9_.]+)/);
```

**Error 3 - Line 263**
```typescript
// CURRENT (WRONG):
const macosMatchModern = userAgent.match(/Mac OS X ([0-9._]+)/);

// SHOULD BE:
const macosMatchModern = userAgent.match(/Mac OS X ([0-9._]+)/);
```

**Task Steps**:
1. Open [Source/Desktop/DesktopMain.ts](Source/Desktop/DesktopMain.ts)
2. Navigate to lines 261-263
3. Remove escaped forward slash from end of regex patterns
4. Save file
5. Run: `npm run type-check` to verify

**Verification**: `npm run type-check` should complete without errors

---

### Task 2: Fix Mismatched Parentheses in AdvancedSyncService.ts
**File**: [Source/Services/Desktop/AdvancedSyncService.ts](Source/Services/Desktop/AdvancedSyncService.ts)  
**Severity**: 🔴 CRITICAL - Blocks compilation  
**Estimated Time**: 10 minutes  

**Error - Line 504**
```typescript
// LOCATION: inside conflict resolution logic
// ISSUE: Extra closing parenthesis

// Find this pattern:
const resolutionResult = await this.executeWithTimeout(
    () => this.conflictResolutionService.resolveConflicts(...),
    5000,
    executionId
))); // ← THREE closing parentheses instead of one

// SHOULD BE:
);  // ← ONE closing parenthesis
```

**Task Steps**:
1. Open [Source/Services/Desktop/AdvancedSyncService.ts](Source/Services/Desktop/AdvancedSyncService.ts)
2. Navigate to line 504
3. Find the extra `));` and change to single `);`
4. Verify matching parentheses around conflict resolution call
5. Save file
6. Run: `npm run type-check`

**Verification**: Error should resolve

**Related Areas to Check**:
- Lines 490-510: Conflict resolution block
- Lines 500-520: Context resolution
- Lines 520-540: Result handling

---

### Task 3: Update biome.json Configuration
**File**: [biome.json](biome.json)  
**Severity**: 🟡 IMPORTANT - Prevents linting  
**Estimated Time**: 20 minutes  

**Issues to Fix**:

**Issue 1 - Line 2: Schema Version Mismatch**
```json
// CURRENT:
"$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",

// SHOULD BE:
"$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
```

**Issue 2 - Line 10: Unknown Key "ignore"**
```json
// CURRENT:
"files": {
  "ignoreUnknown": false,
  "ignore": ["Target/**", "node_modules/**", "dist/**", "build/**"],
  "maxSize": 4194304
},

// SHOULD BE:
"files": {
  "ignoreUnknown": false,
  "experimentalScannerIgnores": ["Target/**", "node_modules/**", "dist/**", "build/**"],
  "maxSize": 4194304
},
```

**Issue 3 - Line 20: Unsupported "organizeImports"**
```json
// CURRENT:
"organizeImports": {
  "enabled": true
}

// SOLUTION: Either remove entirely OR update to:
"linter": {
  "rules": {
    "nursery": {
      "useImportType": "error",
      "useExplicitLengthCheck": "error"
    }
  }
},

// OR simply delete the organizeImports block
```

**Task Steps**:
1. Open [biome.json](biome.json)
2. Update schema to version 2.3.11
3. Replace "ignore" key with "experimentalScannerIgnores"
4. Remove or reconfigure "organizeImports" block
5. Save file
6. Run: `npm run check` to verify no errors

**Alternative Approach**:
```bash
cd /Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Wind
biome migrate  # Auto-migrates configuration
```

**Verification**: `npm run check` should complete without deserialize errors

---

## 🟡 HIGH PRIORITY - CORE IMPLEMENTATIONS (WEEK 1)

### Task 4: Implement Real Maintain Build Integration
**Files**: 
- [Source/Services/Desktop/WindBuildSystem.ts](Source/Services/Desktop/WindBuildSystem.ts)
- [Source/Services/Desktop/WindBuildIntegration.ts](Source/Services/Desktop/WindBuildIntegration.ts)

**Severity**: 🟡 HIGH - Core functionality  
**Estimated Time**: 8-12 hours  
**Dependencies**: Complete Tasks 1-3 first  

**Current Implementation Status**: ❌ 100% Simulated

**What Needs Implementation**:

#### 4.1 Replace Simulation in `buildDebug()` (Line 98-130)
```typescript
// CURRENT - Returns fake result after 500ms delay:
async buildDebug(): Promise<IBuildResult> {
    if (this.isBuilding) throw new Error('Build already in progress');
    this.isBuilding = true;
    
    try {
        console.log('[WindBuildSystem] Starting debug build');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            artifacts: ['app.js', 'app.d.ts'],
            warnings: [],
            errors: []
        };
    // ...
}

// SHOULD: Call actual Maintain build script
```

**New Implementation Pattern**:
```typescript
async buildDebug(): Promise<IBuildResult> {
    if (this.isBuilding) throw new Error('Build already in progress');
    this.isBuilding = true;
    const startTime = Date.now();
    
    try {
        console.log('[WindBuildSystem] Starting debug build via Maintain');
        
        // Execute Maintain build script
        const scriptResult = await this.executeMaintainScript('build.sh debug');
        
        // Build Wind services with actual ESBuild
        const esbuildResult = await this.buildWithESBuild('debug');
        
        // Log performance metrics
        const duration = Date.now() - startTime;
        this.performanceMetrics.buildTimes.push(duration);
        
        return {
            success: scriptResult.success && esbuildResult.success,
            artifacts: esbuildResult.artifacts,
            warnings: [...scriptResult.warnings, ...esbuildResult.warnings],
            errors: [...scriptResult.errors, ...esbuildResult.errors],
            duration
        };
    } catch (error) {
        // ... error handling
    } finally {
        this.isBuilding = false;
    }
}
```

**Methods to Implement**:

#### 4.1a: `executeMaintainScript(scriptName: string)` (Line 255-280)
```typescript
private async executeMaintainScript(scriptName: string): Promise<IScriptExecutionResult> {
    try {
        // Use Tauri invoke to call backend Rust handler
        const result = await invoke<IScriptExecutionResult>('execute_maintain_script', {
            script: scriptName,
            cwd: process.env.WIND_PROJECT_ROOT || './'
        });
        
        console.log(`[WindBuildSystem] Script ${scriptName} completed in ${result.duration}ms`);
        return result;
    } catch (error) {
        console.error(`[WindBuildSystem] Failed to execute ${scriptName}:`, error);
        return {
            success: false,
            duration: 0,
            output: '',
            artifacts: [],
            warnings: [],
            errors: [error.message],
            exitCode: 1
        };
    }
}
```

**Required Interface**:
```typescript
interface IScriptExecutionResult {
    success: boolean;
    duration: number;
    output: string;
    artifacts: string[];
    warnings: string[];
    errors: string[];
    exitCode: number;
}
```

#### 4.1b: `buildWithESBuild(configuration: string)` (New method)
```typescript
private async buildWithESBuild(configuration: string): Promise<IWindBuildResult> {
    try {
        // Invoke Tauri command to run ESBuild
        const result = await invoke<IWindBuildResult>('run_esbuild', {
            configuration,
            entryPoint: 'Source/Bootstrap.ts',
            outfile: `Target/${configuration}/wind.js`,
            sourcemap: configuration === 'debug'
        });
        
        return result;
    } catch (error) {
        return {
            success: false,
            artifacts: [],
            warnings: [],
            errors: [String(error)],
            duration: 0
        };
    }
}
```

#### 4.2 Implement `runTests()` (Line 378-410)
```typescript
// CURRENT: Returns hardcoded success after 1s delay
async runTests(): Promise<ITestResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        success: true,
        testCount: 10,
        passedCount: 10,
        failedCount: 0
    };
}

// SHOULD: Run vitest
```

**New Implementation**:
```typescript
async runTests(): Promise<ITestResult> {
    const startTime = Date.now();
    try {
        // Invoke Tauri command to run vitest
        const result = await invoke<ITestResult>('run_vitest', {
            configuration: 'test',
            coverage: true,
            include: 'Test/**/*.test.ts'
        });
        
        return {
            success: result.testCount === result.passedCount,
            testCount: result.testCount,
            passedCount: result.passedCount,
            failedCount: result.failedCount,
            duration: Date.now() - startTime,
            coveragePercentage: result.coveragePercentage
        };
    } catch (error) {
        return {
            success: false,
            testCount: 0,
            passedCount: 0,
            failedCount: 0,
            duration: Date.now() - startTime,
            errors: [String(error)]
        };
    }
}
```

#### 4.3 Implement Cache Eviction (Line 49-85)
```typescript
// CURRENT: Unbounded map growth
private buildCache: Map<string, IBuildCache> = new Map();

// SHOULD: Implement LRU cache with size limit
private buildCache: LRUCache<string, IBuildCache>;
private readonly CACHE_MAX_SIZE = 100;

constructor() {
    this.buildCache = new LRUCache(this.CACHE_MAX_SIZE);
    this.initializeBuildCache();
}

private initializeBuildCache(): void {
    // Only initialize basic entries, LRU will handle eviction
    this.buildCache.set('debug', {
        configuration: 'debug',
        lastBuildTime: 0,
        buildArtifacts: [],
        success: false
    });
}
```

**Checklist for Task 4**:
- [ ] Replace all `setTimeout` delays with actual invocations
- [ ] Implement Tauri invoke calls for each build step
- [ ] Add error handling with retry logic
- [ ] Collect real performance metrics
- [ ] Implement cache eviction policy
- [ ] Test with actual Maintain scripts
- [ ] Verify artifacts are generated correctly

---

### Task 5: Implement Real Mountain Backend Integration
**Files**:
- [Source/Integration/MountainWindSync.ts](Source/Integration/MountainWindSync.ts)
- [Source/Services/MountainIntegrationService.ts](Source/Services/MountainIntegrationService.ts)
- [Source/Services/Desktop/ConflictResolutionService.ts](Source/Services/Desktop/ConflictResolutionService.ts)

**Severity**: 🟡 HIGH - Critical for data sync  
**Estimated Time**: 16-20 hours  
**Dependencies**: Complete Tasks 1-3 first  

**Current Implementation Status**: ❌ 100% Mock Data

**What Needs Implementation**:

#### 5.1 Create gRPC Client Interface
```typescript
// NEW FILE: Source/Integration/MountainGrpcClient.ts

import * as grpc from '@grpc/grpc-js';

interface IMountainGrpcClient {
    getConfiguration(): Promise<any>;
    syncDocument(docId: string, content: string): Promise<ISyncResult>;
    resolveConflict(docId: string, resolution: IConflictResolution): Promise<IResolutionResult>;
    subscribe(docId: string, callback: (update: IDocumentUpdate) => void): void;
    close(): Promise<void>;
}

export class MountainGrpcClient implements IMountainGrpcClient {
    private client?: any;
    private channel?: grpc.Channel;
    private subscriptions: Map<string, Function> = new Map();
    
    async connect(host: string, port: number): Promise<void> {
        // Implement actual gRPC connection
        this.channel = new grpc.ChannelCredentials();
        this.client = new SomeServiceClient(
            `${host}:${port}`,
            grpc.credentials.createInsecure()
        );
    }
    
    async getConfiguration(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.client.getConfig({}, (err: any, response: any) => {
                if (err) reject(err);
                else resolve(response);
            });
        });
    }
    
    // ... implement remaining methods
}
```

#### 5.2 Replace Mock Data in MountainIntegrationService.ts (Line 945+)
```typescript
// CURRENT - Returns static mock:
private async getWindConfiguration(): Promise<any> {
    return {
        editor: { theme: 'dark', fontSize: 14, wordWrap: 'on' },
        extensions: { installed: [...], enabled: [...] },
        workspace: { autoSave: true, formatOnSave: true },
        security: { telemetry: true, errorReporting: true }
    };
}

// SHOULD: Call real Mountain gRPC:
private async getWindConfiguration(): Promise<any> {
    try {
        const grpcClient = await this.getGrpcClient();
        const config = await grpcClient.getConfiguration();
        
        // Validate configuration structure
        this.validateConfiguration(config);
        
        return config;
    } catch (error) {
        console.error('[MountainIntegrationService] Failed to fetch Mountain config:', error);
        throw new Error(`Configuration sync failed: ${error.message}`);
    }
}
```

#### 5.3 Implement Real Sync in MountainWindSync (Line 100-200)
```typescript
// CURRENT: 
async synchronize(state: IWindState): Promise<ISyncResult> {
    // Creates mock sync entries without real backend
    return { success: true, synced: [] };
}

// SHOULD:
async synchronize(state: IWindState): Promise<ISyncResult> {
    const startTime = Date.now();
    const synced: string[] = [];
    const conflicts: IConflict[] = [];
    
    try {
        // 1. Get current Mountain state
        const mountainState = await this.grpcClient.getState();
        
        // 2. Calculate diff
        const diff = this.calculateDiff(state, mountainState);
        
        // 3. Resolve conflicts
        if (diff.conflicts.length > 0) {
            const resolutions = await this.resolveConflicts(diff.conflicts);
            conflicts.push(...resolutions.unresolved);
        }
        
        // 4. Apply non-conflicting changes
        const applied = await this.applyChanges(diff.changes);
        synced.push(...applied);
        
        // 5. Update local state with Mountain version
        await this.updateLocalState(mountainState);
        
        return {
            success: conflicts.length === 0,
            synced,
            conflicts,
            duration: Date.now() - startTime
        };
    } catch (error) {
        console.error('[MountainWindSync] Synchronization failed:', error);
        return {
            success: false,
            synced: [],
            conflicts: [],
            duration: Date.now() - startTime,
            error: String(error)
        };
    }
}
```

#### 5.4 Implement Conflict Resolution Engine
```typescript
// FILE: Source/Services/Desktop/ConflictResolutionService.ts
// Lines 477+

async resolveConflicts(
    documentId: string, 
    conflicts: IConflict[]
): Promise<IConflictResolutionResult> {
    try {
        // 1. Attempt three-way merge
        const mergeResult = await this.threeWayMerge(conflicts);
        
        if (mergeResult.success) {
            return {
                success: true,
                resolved: mergeResult.resolved,
                unresolved: [],
                strategy: 'three-way-merge'
            };
        }
        
        // 2. Fall back to operational transformation
        const otResult = await this.operationalTransform(conflicts);
        
        if (otResult.success) {
            return {
                success: true,
                resolved: otResult.resolved,
                unresolved: [],
                strategy: 'operational-transform'
            };
        }
        
        // 3. Manual resolution required
        return {
            success: false,
            resolved: [],
            unresolved: conflicts,
            strategy: 'manual',
            error: 'Unable to automatically resolve conflicts'
        };
    } catch (error) {
        throw new Error(`Conflict resolution failed: ${error.message}`);
    }
}

private async threeWayMerge(conflicts: IConflict[]): Promise<IMergeResult> {
    // Implement proper three-way merge algorithm
    // Typically requires: base version, local version, remote version
}

private async operationalTransform(conflicts: IConflict[]): Promise<IMergeResult> {
    // Implement operational transformation for concurrent updates
}
```

#### 5.5 Implement Connection Health Monitoring
```typescript
// Add to MountainWindSync or new file: MonitoringService.ts

async monitorConnection(): Promise<void> {
    const checkInterval = setInterval(async () => {
        try {
            const health = await this.grpcClient.healthCheck();
            
            if (!health.isHealthy) {
                console.warn('[MonitoringService] Mountain connection unhealthy');
                await this.attemptReconnect();
            }
        } catch (error) {
            console.error('[MonitoringService] Health check failed:', error);
            await this.handleConnectionFailure();
        }
    }, 5000); // Check every 5 seconds
    
    this.activeIntervals.push(checkInterval);
}

private async attemptReconnect(maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await this.grpcClient.reconnect();
            console.log('[MonitoringService] Reconnected to Mountain');
            return;
        } catch (error) {
            const backoffTime = Math.pow(2, i) * 1000;
            console.warn(`[MonitoringService] Reconnect attempt ${i+1} failed, retrying in ${backoffTime}ms`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
    }
    console.error('[MonitoringService] Failed to reconnect after retries');
}
```

**Checklist for Task 5**:
- [ ] Create gRPC client wrapper
- [ ] Implement real Mountain configuration fetching
- [ ] Implement document synchronization protocol
- [ ] Implement three-way merge algorithm
- [ ] Implement operational transformation algorithm
- [ ] Add connection health monitoring
- [ ] Add circuit breaker for failures
- [ ] Implement retry logic with exponential backoff
- [ ] Add connection pool management
- [ ] Test with actual Mountain instance

---

### Task 6: Create Basic Test Infrastructure
**Files**:
- [Test/](Test/) (restructure)
- [vitest.config.ts](vitest.config.ts)
- New test files to create

**Severity**: 🟡 HIGH - Enables validation  
**Estimated Time**: 6-8 hours  
**Dependencies**: Complete Tasks 1-3 first  

**Current Status**: ⚠️ Empty test directory

#### 6.1 Set Up Test Directory Structure
```
Test/
├── Unit/
│   ├── Application/
│   │   ├── Clipboard.test.ts
│   │   ├── Dialog.test.ts
│   │   └── File.test.ts
│   ├── Services/
│   │   ├── WindBuildSystem.test.ts
│   │   ├── MountainIntegration.test.ts
│   │   └── ConflictResolution.test.ts
│   └── Integration/
│       └── Tauri.test.ts
├── Integration/
│   ├── MountainSync.test.ts
│   └── E2E.test.ts
├── Fixtures/
│   ├── mockData.ts
│   └── mockGrpcClient.ts
└── Utils/
    └── testHelpers.ts
```

#### 6.2 Create Mock Utilities
```typescript
// NEW FILE: Test/Fixtures/mockGrpcClient.ts

export interface IMockGrpcClient {
    getConfiguration(): Promise<any>;
    syncDocument(docId: string, content: string): Promise<ISyncResult>;
}

export const createMockGrpcClient = (): IMockGrpcClient => ({
    getConfiguration: async () => ({
        editor: { fontSize: 14, theme: 'dark' },
        extensions: []
    }),
    syncDocument: async (docId: string, content: string) => ({
        success: true,
        synced: [docId]
    })
});

export const createMockConflict = (override?: Partial<IConflict>): IConflict => ({
    documentId: 'test-doc',
    type: 'content',
    localVersion: '1.0',
    remoteVersion: '1.1',
    content: 'test content',
    ...override
});
```

#### 6.3 Create First Unit Tests
```typescript
// NEW FILE: Test/Unit/Services/windBuildSystem.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WindBuildSystem } from '../../../Source/Services/Desktop/windBuildSystem';

describe('WindBuildSystem', () => {
    let buildSystem: WindBuildSystem;
    
    beforeEach(() => {
        buildSystem = WindBuildSystem.getInstance();
    });
    
    afterEach(() => {
        // Cleanup
    });
    
    describe('buildDebug', () => {
        it('should complete successfully', async () => {
            const result = await buildSystem.buildDebug();
            expect(result.success).toBe(true);
        });
        
        it('should generate artifacts', async () => {
            const result = await buildSystem.buildDebug();
            expect(result.artifacts.length).toBeGreaterThan(0);
        });
        
        it('should not allow concurrent builds', async () => {
            const promise1 = buildSystem.buildDebug();
            expect(() => buildSystem.buildDebug()).toThrow('Build already in progress');
            await promise1;
        });
    });
    
    describe('runTests', () => {
        it('should run tests successfully', async () => {
            const result = await buildSystem.runTests();
            expect(result.success).toBe(true);
            expect(result.passedCount).toBeGreaterThan(0);
        });
    });
});
```

#### 6.4 Create Integration Test Template
```typescript
// NEW FILE: Test/Integration/MountainSync.test.ts

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MountainWindSync } from '../../../Source/Integration/MountainWindSync';
import { createMockGrpcClient } from '../../Fixtures/mockGrpcClient';

describe('MountainWindSync Integration', () => {
    let sync: MountainWindSync;
    
    beforeAll(async () => {
        sync = new MountainWindSync({
            grpcClient: createMockGrpcClient()
        });
        await sync.initialize();
    });
    
    afterAll(async () => {
        await sync.shutdown();
    });
    
    it('should synchronize state successfully', async () => {
        const state = {
            documents: [],
            configuration: {},
            extensions: []
        };
        
        const result = await sync.synchronize(state);
        expect(result.success).toBe(true);
    });
    
    it('should detect conflicts', async () => {
        // Test conflict detection logic
    });
});
```

**Checklist for Task 6**:
- [ ] Create test directory structure
- [ ] Create mock utilities and fixtures
- [ ] Write 20+ unit tests for core services
- [ ] Write 10+ integration tests
- [ ] Configure coverage reporting
- [ ] Set up CI/CD test pipeline
- [ ] Verify test coverage >= 50%
- [ ] Document test patterns

---

## 📋 MEDIUM PRIORITY - FEATURES & POLISH (WEEKS 2-3)

### Task 7: Implement Real Tauri File API Integration
**File**: [Source/Desktop/TauriFileService.ts](Source/Desktop/TauriFileService.ts)  
**Severity**: 🟡 MEDIUM  
**Estimated Time**: 6-8 hours  

**Current Status**: ⚠️ Placeholder stubs

**Methods to Implement** (Lines 100-270):
- [ ] `readFile(path: string)` - Real Tauri file read
- [ ] `readFileBinary(path: string)` - Binary read with BaseDirectory
- [ ] `writeFile(path: string, content: string)` - Real write with permissions
- [ ] `writeFileBinary(path: string, content: Uint8Array)` - Binary write
- [ ] `copy(source: string, target: string)` - Copy with error handling
- [ ] `move(source: string, target: string)` - Move/rename with conflicts
- [ ] `delete(path: string)` - Safe deletion
- [ ] `exists(path: string)` - Check path existence
- [ ] `stat(path: string)` - Get file metadata
- [ ] `createDirectory(path: string)` - Create directories recursively

**Implementation Pattern**:
```typescript
async readFile(path: string): Promise<string> {
    try {
        // Use Tauri file operations
        const BaseDirectory = await import('@tauri-apps/api/path');
        const fs = await import('@tauri-apps/plugin-fs');
        
        const content = await fs.readTextFile(path, {
            dir: BaseDirectory.BaseDirectory.AppData
        });
        
        console.log(`[TauriFileService] Read file: ${path}`);
        return content;
    } catch (error) {
        console.error(`[TauriFileService] Failed to read ${path}:`, error);
        
        // Proper error handling with recovery suggestions
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${path}`);
        } else if (error.code === 'EACCES') {
            throw new Error(`Permission denied: ${path}`);
        } else {
            throw new Error(`Failed to read file: ${path}`);
        }
    }
}
```

---

### Task 8: Implement Tauri Dialog Service
**File**: [Source/Services/Desktop/DialogService.ts](Source/Services/Desktop/DialogService.ts)  
**Severity**: 🟡 MEDIUM  
**Estimated Time**: 4-6 hours  

**Methods to Implement**:
- [ ] `showOpenDialog(options)` - File picker
- [ ] `showSaveDialog(options)` - Save dialog
- [ ] `showMessageDialog(options)` - Message box
- [ ] `showConfirmDialog(options)` - Confirm dialog

**Implementation**:
```typescript
async showOpenDialog(options: IOpenDialogOptions): Promise<string[]> {
    try {
        const dialog = await import('@tauri-apps/plugin-dialog');
        
        const result = await dialog.open({
            title: options.title || 'Open File',
            multiple: options.canSelectFiles ? true : false,
            directory: options.canSelectFolders,
            filters: options.filters?.map(f => ({
                name: f.name,
                extensions: f.extensions
            }))
        });
        
        return Array.isArray(result) ? result : (result ? [result] : []);
    } catch (error) {
        console.error('[DialogService] Open dialog failed:', error);
        return [];
    }
}
```

---

### Task 9: Complete VSCode Preload Bridge
**File**: [Source/Preload.ts](Source/Preload.ts)  
**Severity**: 🟡 MEDIUM  
**Estimated Time**: 4-6 hours  

**Methods to Complete** (Lines 250-350):

- [ ] `window.vscode.ipcRenderer.on()` - Event listeners
- [ ] `window.vscode.ipcRenderer.once()` - One-time listeners
- [ ] `window.vscode.ipcRenderer.removeListener()` - Remove handlers
- [ ] `window.vscode.webFrame.setZoomLevel()` - Zoom control
- [ ] `window.vscode.webUtils.getPathForFile()` - File path resolution
- [ ] `window.vscode.ipcMessagePort` - Message port communication

**Implementation Pattern**:
```typescript
const createIpcRenderer = () => {
    const listeners: Map<string, Function[]> = new Map();
    
    return {
        send: (channel: string, ...args: any[]) => {
            console.log(`[IPC] Send: ${channel}`, args);
            window.parent.postMessage({ channel, args }, '*');
        },
        
        on: (channel: string, handler: Function) => {
            if (!listeners.has(channel)) {
                listeners.set(channel, []);
            }
            listeners.get(channel)!.push(handler);
            
            return {
                dispose: () => {
                    const handlers = listeners.get(channel);
                    if (handlers) {
                        const idx = handlers.indexOf(handler);
                        if (idx >= 0) handlers.splice(idx, 1);
                    }
                }
            };
        },
        
        once: (channel: string, handler: Function) => {
            const wrappedHandler = (...args: any[]) => {
                handler(...args);
                const handlers = listeners.get(channel);
                if (handlers) {
                    const idx = handlers.indexOf(wrappedHandler);
                    if (idx >= 0) handlers.splice(idx, 1);
                }
            };
            
            return this.on(channel, wrappedHandler);
        }
    };
};
```

---

### Task 10: Implement Error Handling Framework
**Files**:
- [Source/Services/Desktop/](Source/Services/Desktop/) (all services)
- New file: `Source/Utils/ErrorHandling.ts`

**Severity**: 🟡 MEDIUM  
**Estimated Time**: 6-8 hours  

**What to Implement**:

#### 10.1 Create Error Types
```typescript
// NEW FILE: Source/Utils/WindError.ts

export enum ErrorCategory {
    COMPILATION = 'compilation',
    INTEGRATION = 'integration',
    CONFIGURATION = 'configuration',
    IO = 'io',
    NETWORK = 'network',
    VALIDATION = 'validation',
    STATE = 'state'
}

export class WindError extends Error {
    constructor(
        public category: ErrorCategory,
        public code: string,
        message: string,
        public context?: Record<string, any>,
        public recoverySteps?: string[]
    ) {
        super(message);
        this.name = 'WindError';
    }
}

export const createError = (
    category: ErrorCategory,
    code: string,
    message: string,
    context?: Record<string, any>,
    recoverySteps?: string[]
): WindError => {
    return new WindError(category, code, message, context, recoverySteps);
};
```

#### 10.2 Replace Generic Error Messages
```typescript
// CURRENT:
throw new Error('Failed to read file');

// SHOULD BE:
throw createError(
    ErrorCategory.IO,
    'FILE_READ_FAILED',
    `Failed to read file at ${path}`,
    { path, fileSize: stat?.size },
    [
        'Verify file exists and is readable',
        'Check file permissions',
        'Ensure sufficient disk space'
    ]
);
```

#### 10.3 Create Error Recovery Strategies
```typescript
// NEW FILE: Source/Utils/RecoveryStrategies.ts

export interface IRecoveryStrategy {
    canRecover(error: WindError): boolean;
    recover(): Promise<void>;
}

export class CircuitBreakerStrategy implements IRecoveryStrategy {
    private failureCount = 0;
    private lastFailureTime = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';
    
    canRecover(error: WindError): boolean {
        return error.category === ErrorCategory.NETWORK;
    }
    
    async recover(): Promise<void> {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount > 3) {
            this.state = 'open';
            
            // Attempt recovery after 30 seconds
            setTimeout(() => {
                this.state = 'half-open';
                this.failureCount = 0;
            }, 30000);
        }
    }
}
```

---

## 🎯 LOWER PRIORITY - OPTIMIZATION (WEEKS 4+)

### Task 11: Implement Real Performance Monitoring
**File**: [Source/Services/Desktop/WindServiceCoverage.ts](Source/Services/Desktop/WindServiceCoverage.ts)  
**Severity**: 🟢 LOW  
**Estimated Time**: 8-10 hours  

**Replace Hardcoded Metrics** (Lines 261-350):
- [ ] Remove `coveragePercentage: 80` hardcode
- [ ] Implement actual service instantiation measurement
- [ ] Track real memory usage
- [ ] Measure sync latency from Mountain
- [ ] Track build performance metrics

---

### Task 12: Memory Management & Cache Eviction
**Files**:
- [Source/Services/Desktop/WindBuildSystem.ts](Source/Services/Desktop/WindBuildSystem.ts) (Line 49)
- [Source/Services/Desktop/WindBuildIntegration.ts](Source/Services/Desktop/WindBuildIntegration.ts) (Line 46)

**Severity**: 🟢 LOW  
**Estimated Time**: 4-6 hours  

**Implement LRU Cache**:
```typescript
// NEW FILE: Source/Utils/LRUCache.ts

export class LRUCache<K, V> {
    private cache: Map<K, V> = new Map();
    private accessOrder: K[] = [];
    
    constructor(private maxSize: number) {}
    
    get(key: K): V | undefined {
        if (this.cache.has(key)) {
            // Move to end (most recently used)
            const idx = this.accessOrder.indexOf(key);
            if (idx >= 0) {
                this.accessOrder.splice(idx, 1);
            }
            this.accessOrder.push(key);
            return this.cache.get(key);
        }
        return undefined;
    }
    
    set(key: K, value: V): void {
        if (this.cache.has(key)) {
            // Remove from access order
            const idx = this.accessOrder.indexOf(key);
            if (idx >= 0) this.accessOrder.splice(idx, 1);
        }
        
        // Add to cache and access order
        this.cache.set(key, value);
        this.accessOrder.push(key);
        
        // Evict oldest if over limit
        if (this.cache.size > this.maxSize) {
            const oldestKey = this.accessOrder.shift();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
    }
}
```

---

## Summary Table

| Task | Priority | Files | Hours | Status |
|------|----------|-------|-------|--------|
| 1. Fix Regex Syntax | 🔴 TODAY | DesktopMain.ts | 0.25 | Ready |
| 2. Fix Parentheses | 🔴 TODAY | AdvancedSyncService.ts | 0.25 | Ready |
| 3. Update biome.json | 🔴 TODAY | biome.json | 0.33 | Ready |
| 4. Maintain Integration | 🟡 Week 1 | WindBuildSystem.ts | 12 | Planned |
| 5. Mountain Integration | 🟡 Week 1 | MountainWindSync.ts | 20 | Planned |
| 6. Test Infrastructure | 🟡 Week 1 | Test/ | 8 | Planned |
| 7. Tauri File Service | 🟡 Week 2 | TauriFileService.ts | 8 | Planned |
| 8. Tauri Dialogs | 🟡 Week 2 | DialogService.ts | 6 | Planned |
| 9. Preload Bridge | 🟡 Week 2 | Preload.ts | 6 | Planned |
| 10. Error Framework | 🟡 Week 2 | Services/ | 8 | Planned |
| 11. Performance Monitor | 🟢 Week 4 | WindServiceCoverage.ts | 10 | Planned |
| 12. Memory Management | 🟢 Week 4 | Build Services | 6 | Planned |

**Total Estimated Effort**: ~98 hours  
**Recommended Team Size**: 2-3 developers  
**Estimated Timeline**: 4-6 weeks for feature-complete readiness

---

**Document Created**: January 30, 2026  
**Last Updated**: January 30, 2026  
**Status**: Ready for implementation  
**Contact**: Source/Open@Editor.Land
