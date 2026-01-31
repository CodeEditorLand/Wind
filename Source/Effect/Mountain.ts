/**
 * @module Effect/Mountain
 * @description
 * Atomic Mountain backend service using Effect-TS.
 * Consolidates MountainIntegrationService and MountainWindSync into a single,
 * unified backend integration layer with proper error handling and resilience.
 */

import { 
  Context, Effect, Layer, Stream, SubscriptionRef, Schedule, 
  Fiber, Option, Exit, pipe 
} from "effect";
import { IPC, IPCService } from "./IPC.js";
import { Configuration, ConfigurationService } from "./Configuration.js";
import { Telemetry, TelemetryService, withSpan } from "./Telemetry.js";

// ============================================================================
// Mountain Error Types
// ============================================================================

export class MountainConnectionError extends Error {
  readonly _tag = "MountainConnectionError";
  constructor(readonly cause: unknown) {
    super(`Failed to connect to Mountain backend: ${String(cause)}`);
  }
}

export class MountainRPCError extends Error {
  readonly _tag = "MountainRPCError";
  constructor(readonly method: string, readonly cause: unknown) {
    super(`Mountain RPC '${method}' failed: ${String(cause)}`);
  }
}

export class MountainSyncError extends Error {
  readonly _tag = "MountainSyncError";
  constructor(readonly resource: string, readonly cause: unknown) {
    super(`Mountain sync for '${resource}' failed: ${String(cause)}`);
  }
}

export class MountainStateError extends Error {
  readonly _tag = "MountainStateError";
  constructor(readonly expected: string, readonly actual: string) {
    super(`Mountain state error: expected ${expected}, got ${actual}`);
  }
}

// ============================================================================
// Connection State
// ============================================================================

export type MountainConnectionState =
  | { readonly _tag: "Idle" }
  | { readonly _tag: "Connecting"; readonly attempt: number }
  | { readonly _tag: "Connected"; readonly version: string }
  | { readonly _tag: "Disconnected"; readonly reason: string }
  | { readonly _tag: "Error"; readonly error: Error };

// ============================================================================
// Sync Resource Types
// ============================================================================

export interface SyncResource {
  readonly type: 'configuration' | 'services' | 'state' | 'files';
  readonly id: string;
  readonly data: unknown;
  readonly timestamp: number;
  readonly hash: string;
}

export interface SyncResult {
  readonly success: boolean;
  readonly resourcesSynced: number;
  readonly errors: ReadonlyArray<string>;
  readonly duration: number;
}

// ============================================================================
// Mountain Service Interface
// ============================================================================

export interface MountainService {
  /** Current connection state */
  readonly connectionState: Effect.Effect<MountainConnectionState, never>;
  
  /** Stream of connection state changes */
  readonly connectionChanges: Stream.Stream<MountainConnectionState, never>;
  
  /** Connect to Mountain backend */
  readonly connect: Effect.Effect<void, MountainConnectionError>;
  
  /** Disconnect from Mountain backend */
  readonly disconnect: Effect.Effect<void, never>;
  
  /** Execute RPC method */
  readonly rpc: <T>(method: string) => (args?: Record<string, unknown>) => Effect.Effect<T, MountainRPCError>;
  
  /** Sync a specific resource type */
  readonly sync: (resourceType: SyncResource['type']) => Effect.Effect<SyncResult, MountainSyncError>;
  
  /** Stream of all sync events */
  readonly syncEvents: Stream.Stream<SyncResource, never>;
  
  /** Get Mountain version */
  readonly version: Effect.Effect<string, MountainConnectionError>;
  
  /** Health check */
  readonly healthCheck: Effect.Effect<boolean, MountainConnectionError>;
}

export const Mountain = Context.GenericTag<MountainService>("Mountain");

// ============================================================================
// Implementation
// ============================================================================

export const MountainLive = Layer.effect(
  Mountain,
  Effect.gen(function* () {
    const ipc = yield* IPC;
    const config = yield* Configuration;
    const telemetry = yield* Telemetry;
    
    // Connection state as reactive ref
    const stateRef = yield* SubscriptionRef.make<MountainConnectionState>({ _tag: "Idle" });
    
    // Sync events stream
    const syncEventsRef = yield* SubscriptionRef.make<ReadonlyArray<SyncResource>>([]);
    
    // Retry schedule: exponential backoff with max 30s
    const retrySchedule = Schedule.exponential("100 millis").pipe(
      Schedule.union(Schedule.spaced("5 seconds")),
      Schedule.intersect(Schedule.recurs(10))
    );
    
    // Atom: Update connection state
    const setState = (state: MountainConnectionState) =>
      stateRef.set(state).pipe(
        Effect.tap(() => telemetry.log('info', `Mountain state: ${state._tag}`))
      );
    
    // Atom: Get current state
    const connectionState = stateRef.get;
    const connectionChanges = Stream.fromSubscriptionRef(stateRef);
    
    // Atom: Connect to Mountain
    const connect = Effect.gen(function* () {
      yield* setState({ _tag: "Connecting", attempt: 1 });
      
      return yield* Effect.retry(
        Effect.gen(function* () {
          const status = yield* ipc.invoke("mountain_get_status")([]).pipe(
            Effect.mapError((error) => new MountainConnectionError(error))
          ) as { connected: boolean; version: string };
          
          if (!status.connected) {
            return yield* Effect.fail(new MountainConnectionError("Mountain not ready"));
          }
          
          yield* setState({ _tag: "Connected", version: status.version });
          yield* telemetry.log('info', `Connected to Mountain v${status.version}`);
          
        }).pipe(
          withSpan("mountain_connect")
        ),
        retrySchedule
      ).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* setState({ _tag: "Error", error });
            yield* telemetry.log('error', `Failed to connect: ${error.message}`);
            return yield* Effect.fail(error);
          })
        )
      );
    });
    
    // Atom: Disconnect
    const disconnect = Effect.gen(function* () {
      yield* setState({ _tag: "Disconnected", reason: "manual" });
      yield* telemetry.log('info', 'Disconnected from Mountain');
    });
    
    // Atom: RPC with telemetry
    const rpc = <T>(method: string) => (args?: Record<string, unknown>) =>
      Effect.gen(function* () {
        const currentState = yield* stateRef.get;
        
        if (currentState._tag !== "Connected") {
          // Auto-connect if not connected
          yield* connect;
        }
        
        const span = yield* telemetry.startSpan(`rpc_${method}`);
        
        return yield* ipc.invoke(method)(args ? [args] : []).pipe(
          Effect.mapError((error) => new MountainRPCError(method, error)),
          Effect.tap(() => span.end(true)),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* span.end(false, error.message);
              
              // Check if connection lost
              if (String(error).includes('connection') || String(error).includes('network')) {
                yield* setState({ _tag: "Disconnected", reason: "connection_lost" });
              }
              
              return yield* Effect.fail(error);
            })
          )
        ) as Effect.Effect<T, MountainRPCError>;
      });
    
    // Atom: Sync resource
    const sync = (resourceType: SyncResource['type']) =>
      Effect.gen(function* () {
        const span = yield* telemetry.startSpan(`sync_${resourceType}`);
        const startTime = Date.now();
        
        yield* telemetry.log('info', `Starting sync for ${resourceType}`);
        
        const result = yield* Effect.gen(function* () {
          switch (resourceType) {
            case 'configuration': {
              const mountainConfig = yield* rpc<Record<string, unknown>>("mountain_get_configuration")();
              const localConfig = yield* config.get;
              
              // Detect changes
              const mountainHash = JSON.stringify(mountainConfig);
              const localHash = JSON.stringify(localConfig);
              
              if (mountainHash !== localHash) {
                yield* config.apply(mountainConfig as any);
                
                const resource: SyncResource = {
                  type: 'configuration',
                  id: 'main',
                  data: mountainConfig,
                  timestamp: Date.now(),
                  hash: mountainHash
                };
                
                yield* syncEventsRef.update((events) => [...events, resource].slice(-1000));
              }
              
              return { success: true, resourcesSynced: 1, errors: [] };
            }
            
            case 'services': {
              const services = yield* rpc<Record<string, unknown>>("mountain_get_services_status")();
              
              const resource: SyncResource = {
                type: 'services',
                id: 'all',
                data: services,
                timestamp: Date.now(),
                hash: JSON.stringify(services)
              };
              
              yield* syncEventsRef.update((events) => [...events, resource].slice(-1000));
              
              return { success: true, resourcesSynced: Object.keys(services).length, errors: [] };
            }
            
            case 'state': {
              const state = yield* rpc<Record<string, unknown>>("mountain_get_state")();
              
              const resource: SyncResource = {
                type: 'state',
                id: 'main',
                data: state,
                timestamp: Date.now(),
                hash: JSON.stringify(state)
              };
              
              yield* syncEventsRef.update((events) => [...events, resource].slice(-1000));
              
              return { success: true, resourcesSynced: 1, errors: [] };
            }
            
            default:
              return { success: false, resourcesSynced: 0, errors: [`Unknown resource type: ${resourceType}`] };
          }
        }).pipe(
          Effect.tap((result) =>
            span.end(result.success, result.errors[0])
          ),
          Effect.catchAll((error) =>
            Effect.gen(function* () {
              yield* span.end(false, error.message);
              return yield* Effect.fail(new MountainSyncError(resourceType, error));
            })
          )
        );
        
        const duration = Date.now() - startTime;
        
        return {
          ...result,
          duration
        } as SyncResult;
      });
    
    // Stream of sync events
    const syncEvents = Stream.fromSubscriptionRef(syncEventsRef).pipe(
      Stream.flatMap((events) => Stream.fromIterable(events))
    );
    
    // Atom: Get version
    const version = Effect.gen(function* () {
      const status = yield* rpc<{ version: string }>("mountain_get_status")();
      return status.version;
    });
    
    // Atom: Health check
    const healthCheck = Effect.gen(function* () {
      return yield* Effect.orElse(
        rpc("mountain_get_status")().pipe(
          Effect.map((status: any) => status.connected === true)
        ),
        () => Effect.succeed(false)
      );
    });
    
    // Set up background sync on connection
    const setupBackgroundSync = Effect.gen(function* () {
      yield* Stream.runForEach(
        connectionChanges,
        (state) =>
          state._tag === "Connected"
            ? Effect.gen(function* () {
                yield* telemetry.log('info', 'Starting background sync');
                
                // Initial sync
                yield* sync('configuration').pipe(
                  Effect.catchAll((error) =>
                    telemetry.log('error', `Initial config sync failed: ${error.message}`)
                  )
                );
                
                // Periodic sync every 5 seconds
                const syncFiber = yield* Stream.fromSchedule(Schedule.spaced("5 seconds")).pipe(
                  Stream.runForEach(() =>
                    sync('configuration').pipe(
                      Effect.catchAll((error) =>
                        telemetry.log('error', `Periodic sync failed: ${error.message}`)
                      )
                    )
                  ),
                  Effect.fork
                );
                
                // Stop sync on disconnect
                yield* connectionChanges.pipe(
                  Stream.filter((s) => s._tag === "Disconnected" || s._tag === "Error"),
                  Stream.runForEach(() =>
                    Fiber.interrupt(syncFiber)
                  )
                );
              })
            : Effect.unit
      );
    }).pipe(Effect.fork);
    
    yield* setupBackgroundSync;
    
    yield* telemetry.log('info', 'Mountain service initialized');
    
    return {
      connectionState,
      connectionChanges,
      connect,
      disconnect,
      rpc,
      sync,
      syncEvents,
      version,
      healthCheck
    };
  })
);

// ============================================================================
// Mock Implementation
// ============================================================================

export const MountainMockLive = Layer.succeed(
  Mountain,
  {
    connectionState: Effect.succeed({ _tag: "Connected" as const, version: "mock" }),
    connectionChanges: Stream.empty,
    connect: Effect.unit,
    disconnect: Effect.unit,
    rpc: () => () => Effect.succeed({}),
    sync: () => Effect.succeed({ success: true, resourcesSynced: 0, errors: [], duration: 0 }),
    syncEvents: Stream.empty,
    version: Effect.succeed("mock"),
    healthCheck: Effect.succeed(true)
  }
);
