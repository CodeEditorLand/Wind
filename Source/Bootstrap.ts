/**
 * @module Bootstrap
 * @description
 * Main entry point for the atomic bootstrap system.
 * Replaces the old bootstrap with the new highly atomic, debuggable system.
 */

declare global {
  /** Tauri invoke function for calling Rust backend */
  const TauriInvoke: {
    (command: string, payload?: any): Promise<any>;
  } | undefined;
}

import { bootstrap } from './Bootstrap/index.js';

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

console.log('[Wind Bootstrap] Atomic bootstrap system loaded');

// Start the bootstrap process
bootstrap({
  debugMode: (window as any).__BOOTSTRAP_DEBUG__ || false,
  verboseLogging: (window as any).__BOOTSTRAP_DEBUG__ || false,
  showStatusUI: true,
  pauseBetweenStages: (window as any).__BOOTSTRAP_DEBUG__ || false,
  enablePerformanceTracking: true
}).then((result) => {
  console.log('[Wind Bootstrap] Bootstrap process completed');
  console.log('[Wind Bootstrap] Success:', result.success);
  console.log('[Wind Bootstrap] Duration:', result.totalDuration.toFixed(0), 'ms');
  
  if (result.success) {
    console.log('[Wind Bootstrap] ✓ All stages completed successfully');
  } else {
    console.error('[Wind Bootstrap] ✗ Bootstrap failed');
  }
}).catch((error) => {
  console.error('[Wind Bootstrap] ✗ Fatal error:', error);
});
