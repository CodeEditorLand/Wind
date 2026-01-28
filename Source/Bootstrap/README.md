# Atomic Bootstrap System

**Version:** 1.0.0  
**Status:** ✅ Complete  
**Date:** January 28, 2026

---

## Overview

The Atomic Bootstrap System is a highly debuggable, defensive bootstrapping framework for VSCode workbench initialization. It provides maximum atomicity with 7 independent stages, comprehensive logging, visual feedback, and graceful error handling.

## Architecture

### Bootstrap Stages

```
Stage 0: Environment Detection
  ├─ Detect platform (Tauri/Browser)
  ├─ Detect mode (Development/Production)
  ├─ Validate runtime environment
  └─ Set up global flags

Stage 1: Preload Initialization
  ├─ Load Wind preload script
  ├─ Validate window.vscode exists
  ├─ Verify API shims are present
  └─ Test IPC communication

Stage 2: Configuration Loading
  ├─ Fetch from Mountain (Tauri) or meta tags (Browser)
  ├─ Validate configuration structure
  ├─ Apply defaults for missing fields
  └─ Persist to window.vscode.context

Stage 3: Service Layer Setup
  ├─ Initialize Effect-TS runtime
  ├─ Register core services
  ├─ Validate service dependencies
  └─ Create service collection

Stage 4: Workbench Preparation
  ├─ Wait for DOM ready
  ├─ Validate DOM structure
  ├─ Set up global variables
  └─ Load worker scripts

Stage 5: Workbench Initialization
  ├─ Create Workbench instance
  ├─ Register services
  ├─ Validate workbench state
  └─ Start workbench

Stage 6: Health Check
  ├─ Verify workbench is running
  ├─ Test core functionality
  ├─ Check for errors
  └─ Report status
```

## Features

### 1. Maximum Atomicity
- Each stage is independent and self-contained
- Stages can be executed in isolation for testing
- Clear separation of concerns
- Easy to debug and maintain

### 2. Comprehensive Logging
- Every step logged with timestamps
- Console output with color-coded messages
- Detailed error information
- Performance metrics

### 3. Visual Feedback
- Real-time status overlay
- Progress bar with stage indicators
- Detailed logs panel (toggleable)
- Error/warning notifications

### 4. Defensive Coding
- Multiple fallback mechanisms
- Graceful degradation
- Error recovery strategies
- First-run support

### 5. Debug Mode
- Verbose logging
- Step-by-step execution
- Pause between stages
- Inspect state at any point
- Export diagnostic data

## Usage

### Basic Usage

```typescript
import { bootstrap } from '@codeeditorland/wind/Bootstrap';

// Start bootstrap with default configuration
bootstrap().then((result) => {
  console.log('Bootstrap completed:', result.success);
});
```

### Advanced Usage

```typescript
import { bootstrap } from '@codeeditorland/wind/Bootstrap';

// Start bootstrap with custom configuration
bootstrap({
  debugMode: true,
  verboseLogging: true,
  showStatusUI: true,
  pauseBetweenStages: true,
  enablePerformanceTracking: true
}).then((result) => {
  console.log('Bootstrap completed:', result.success);
  console.log('Duration:', result.totalDuration, 'ms');
  
  // Check individual stage results
  result.results.forEach((stageResult) => {
    console.log(`${stageResult.stage}: ${stageResult.success ? '✓' : '✗'}`);
  });
});
```

### Using Individual Stages

```typescript
import { EnvironmentStage, PreloadStage, ConfigurationStage } from '@codeeditorland/wind/Bootstrap';

// Execute individual stages
const envResult = await EnvironmentStage.execute();
const preloadResult = await PreloadStage.execute();
const configResult = await ConfigurationStage.execute();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `debugMode` | boolean | `false` | Enable debug mode with verbose logging |
| `verboseLogging` | boolean | `false` | Enable verbose console logging |
| `showStatusUI` | boolean | `true` | Show visual status overlay |
| `pauseBetweenStages` | boolean | `false` | Pause between stages for debugging |
| `enablePerformanceTracking` | boolean | `true` | Track performance metrics |

## Status Reporter

The StatusReporter provides real-time visual feedback during bootstrap:

### Features
- **Progress Bar:** Shows overall progress (0-100%)
- **Stage List:** Shows status of each stage
- **Log Panel:** Detailed logs (toggleable)
- **Error Display:** Shows errors with stack traces
- **Performance Metrics:** Duration for each stage

### API

```typescript
import { StatusReporter } from '@codeeditorland/wind/Bootstrap';

// Initialize with configuration
const reporter = StatusReporter.initialize(config);

// Update status
reporter.update({
  stage: 'Environment',
  status: 'running',
  message: 'Detecting environment...',
  progress: 0
});

// Get all updates
const updates = reporter.getUpdates();

// Export updates as JSON
const json = reporter.exportUpdates();

// Remove UI
reporter.removeUI();
```

## Error Handler

The ErrorHandler provides centralized error handling with recovery strategies:

### Features
- **Error Categorization:** Critical, Warning, Info
- **Recovery Strategies:** Automatic recovery with fallbacks
- **Error UI:** Full-screen error overlay with retry button
- **Error Export:** Copy error details to clipboard
- **Error History:** Track all errors during bootstrap

### API

```typescript
import { ErrorHandler } from '@codeeditorland/wind/Bootstrap';

// Get instance
const errorHandler = ErrorHandler.getInstance();

// Handle an error
await errorHandler.handle(
  'StageName',
  error,
  'critical',
  { additionalInfo: '...' }
);

// Register recovery strategy
errorHandler.registerRecoveryStrategy('StageName', {
  canRecover: true,
  action: async () => { /* recovery logic */ },
  fallback: async () => { /* fallback logic */ }
});

// Get errors
const errors = errorHandler.getErrors();
const criticalErrors = errorHandler.getErrorsBySeverity('critical');

// Export errors
const json = errorHandler.exportErrors();

// Clear errors
errorHandler.clearErrors();
```

## Debugging

### Enable Debug Mode

```typescript
// In Sky/Application.astro
<script is:inline type="module" slot="Head">
  globalThis.__BOOTSTRAP_DEBUG__ = 'true';
</script>
```

### Export Diagnostic Data

```typescript
import { BootstrapOrchestrator } from '@codeeditorland/wind/Bootstrap';

const orchestrator = BootstrapOrchestrator.getInstance();
const diagnostics = orchestrator.exportDiagnostics();

console.log(diagnostics);
// Or save to file
navigator.clipboard.writeText(diagnostics);
```

### Inspect Stage Results

```typescript
import { EnvironmentStage } from '@codeeditorland/wind/Bootstrap';

const result = await EnvironmentStage.execute();

console.log('Stage:', result.stage);
console.log('Success:', result.success);
console.log('Duration:', result.duration);
console.log('Data:', result.data);
console.log('Error:', result.error);
console.log('Warnings:', result.warnings);
```

## Error Recovery

### Automatic Recovery

The system automatically attempts recovery for non-critical errors:

```typescript
// Example: Configuration loading fails
errorHandler.registerRecoveryStrategy('Configuration', {
  canRecover: true,
  action: async () => {
    // Try to fetch from alternative source
    return await fetchFromAlternativeSource();
  },
  fallback: async () => {
    // Use fallback configuration
    return useFallbackConfiguration();
  }
});
```

### Manual Recovery

Users can retry failed operations via the error UI:

1. Error overlay appears
2. Click "Retry" button
3. Page reloads and bootstrap restarts
4. Or click "Copy Error" to get details

## Performance Metrics

The system tracks performance metrics for each stage:

```typescript
{
  bootstrapStartTime: 1706457600000,
  bootstrapDuration: 1234,
  platform: 'tauri',
  mode: 'development',
  debug: true,
  domReady: true,
  memoryUsage: {
    usedJSHeapSize: 12345678,
    totalJSHeapSize: 23456789,
    jsHeapSizeLimit: 2172649472
  },
  userAgent: 'Mozilla/5.0 ...',
  language: 'en-US',
  timezone: 'America/New_York',
  errorCount: 0,
  criticalErrorCount: 0,
  warningCount: 2
}
```

## First-Run Support

The system detects first runs and provides sensible defaults:

```typescript
// Stage 2: Configuration
- Detects missing machine ID
- Generates new UUID
- Persists to localStorage
- Creates default configuration

// Stage 3: Services
- Detects missing Effect-TS runtime
- Creates minimal runtime fallback
- Registers core services with defaults
```

## Integration with Sky

The bootstrap system integrates seamlessly with Sky:

```astro
<!-- Sky/Application.astro -->
<script is:inline type="module" defer>
  import { bootstrap } from '@codeeditorland/wind/Bootstrap';
  
  bootstrap({
    debugMode: ${On},
    verboseLogging: ${On},
    showStatusUI: true,
    pauseBetweenStages: ${On},
    enablePerformanceTracking: true
  }).then((result) => {
    console.log('[Sky] Bootstrap completed:', result.success);
  });
</script>
```

## Testing

### Unit Testing

```typescript
import { EnvironmentStage } from '@codeeditorland/wind/Bootstrap';

describe('EnvironmentStage', () => {
  it('should detect platform', async () => {
    const result = await EnvironmentStage.execute();
    expect(result.success).toBe(true);
    expect(result.data.platform).toBeDefined();
  });
});
```

### Integration Testing

```typescript
import { bootstrap } from '@codeeditorland/wind/Bootstrap';

describe('Bootstrap Integration', () => {
  it('should complete all stages', async () => {
    const result = await bootstrap({ showStatusUI: false });
    expect(result.success).toBe(true);
    expect(result.results.length).toBe(7);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Preload Script Not Loading

**Symptom:** Stage 1 fails with "Preload script not ready after timeout"

**Solution:** 
- Check that Wind preload script is loaded before bootstrap
- Verify `window.vscode` is available
- Check for JavaScript errors in console

#### 2. Configuration Not Available

**Symptom:** Stage 2 fails with "Configuration not available"

**Solution:**
- Check Mountain backend is running (Tauri mode)
- Verify meta tags are present (Browser mode)
- Check network requests in DevTools

#### 3. Services Not Registering

**Symptom:** Stage 3 shows warnings about failed services

**Solution:**
- This is non-critical - workbench can still start
- Check Effect-TS is available
- Verify service imports are correct

#### 4. Workbench Not Starting

**Symptom:** Stage 5 fails with "Workbench initialization failed"

**Solution:**
- Check VSCode workbench scripts are loaded
- Verify configuration is valid
- Check for JavaScript errors in console

## Best Practices

### 1. Always Use Status Reporter

```typescript
const reporter = StatusReporter.getInstance();
reporter.update({
  stage: 'MyStage',
  status: 'running',
  message: 'Starting...',
  progress: 0
});
```

### 2. Handle Errors Gracefully

```typescript
try {
  // Do work
  reporter.update({
    stage: 'MyStage',
    status: 'success',
    message: 'Completed',
    progress: 100,
    duration
  });
} catch (error) {
  await errorHandler.handle('MyStage', error, 'warning');
}
```

### 3. Validate Pre-conditions

```typescript
if (!window.vscode) {
  throw new Error('window.vscode not available');
}
```

### 4. Provide Fallbacks

```typescript
try {
  return await fetchFromPrimary();
} catch (error) {
  console.warn('Primary failed, trying fallback');
  return await fetchFromFallback();
}
```

### 5. Log Everything

```typescript
console.log('[Stage] Starting...');
console.log('[Stage] ✓ Step 1 complete');
console.log('[Stage] ✓ Step 2 complete');
console.log('[Stage] ✓ Stage complete');
```

## Migration Guide

### From Old Bootstrap

**Old:**
```typescript
// Wind/Source/Bootstrap.ts
async function initializeWorkbench() {
  // Monolithic initialization
  await domContentLoaded(window);
  const config = getVSCodeConfiguration();
  const serviceCollection = new ServiceCollection();
  // ... more code
}
```

**New:**
```typescript
// Wind/Source/Bootstrap.ts
import { bootstrap } from './Bootstrap/index.js';

bootstrap({
  debugMode: (window as any).__BOOTSTRAP_DEBUG__ || false,
  verboseLogging: (window as any).__BOOTSTRAP_DEBUG__ || false,
  showStatusUI: true,
  pauseBetweenStages: (window as any).__BOOTSTRAP_DEBUG__ || false,
  enablePerformanceTracking: true
});
```

## Performance

### Typical Durations

| Stage | Duration (ms) |
|-------|---------------|
| Environment | 5-10 |
| Preload | 10-50 |
| Configuration | 50-200 |
| Services | 100-500 |
| Preparation | 50-100 |
| Initialization | 500-2000 |
| Health Check | 10-50 |
| **Total** | **725-2910** |

### Optimization Tips

1. **Bundle Mode:** Use `Bundle=true` for production
2. **Disable Status UI:** Set `showStatusUI=false` in production
3. **Disable Verbose Logging:** Set `verboseLogging=false` in production
4. **Preload Scripts:** Load scripts in parallel where possible
5. **Cache Configuration:** Cache configuration in localStorage

## Future Enhancements

- [ ] Add more detailed performance profiling
- [ ] Implement stage retry logic
- [ ] Add stage skip functionality
- [ ] Create stage dependency graph
- [ ] Add stage timeout configuration
- [ ] Implement stage result caching
- [ ] Add stage rollback capability
- [ ] Create stage performance benchmarks
- [ ] Add stage health monitoring
- [ ] Implement stage telemetry

## References

- **VSCode Workbench:** `Application/CodeEditorLand/Land/Element/Wind/Source/@codeeditorland/output/`
- **Wind Source:** `Application/CodeEditorLand/Land/Element/Wind/Source/`
- **Sky Source:** `Application/CodeEditorLand/Land/Element/Sky/Source/`
- **Effect-TS:** https://effect.website/
- **Tauri:** https://tauri.app/

## License

MIT License - See project LICENSE file for details.