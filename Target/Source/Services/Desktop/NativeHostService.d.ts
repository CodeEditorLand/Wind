/**
 * @module TauriNativeHostService
 * @description
 * Tauri implementation of VSCode's INativeHostService.
 * Provides native operating system integration using Tauri APIs.
 *
 * Architecture:
 * 1. Window management (minimize, maximize, close)
 * 2. File system operations (dialogs, file access)
 * 3. System integration (notifications, menus)
 * 4. Platform-specific features
 *
 * TODOs:
 * - Implement Tauri window management APIs
 * - Create Tauri file dialog integration
 * - Add Tauri menu system integration
 * - Implement Tauri notification APIs
 * - Handle platform-specific features
 */
import { Disposable } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/base/common/lifecycle.js';
import { INativeHostService } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/platform/native/common/native.js';
import { URI } from '../../../../Dependency/Microsoft/Dependency/Editor/src/vs/base/common/uri.js';
export declare class TauriNativeHostService extends Disposable implements INativeHostService {
    readonly _serviceBrand: undefined;
    private readonly _onDidMaximizeWindow;
    readonly onDidMaximizeWindow: any;
    private readonly _onDidUnmaximizeWindow;
    readonly onDidUnmaximizeWindow: any;
    private readonly _onDidFocusWindow;
    readonly onDidFocusWindow: any;
    private readonly _onDidBlurWindow;
    readonly onDidBlurWindow: any;
    constructor();
    private registerEventListeners;
    closeWindow(targetWindowId?: number): Promise<void>;
    minimizeWindow(targetWindowId?: number): Promise<void>;
    maximizeWindow(targetWindowId?: number): Promise<void>;
    unmaximizeWindow(targetWindowId?: number): Promise<void>;
    setFullScreen(fullscreen: boolean, targetWindowId?: number): Promise<void>;
    showItemInFolder(path: string): Promise<void>;
    openExternal(url: string): Promise<boolean>;
    showOpenDialog(options: any): Promise<URI[] | undefined>;
    showSaveDialog(options: any): Promise<URI | undefined>;
    setDocumentEdited(edited: boolean, targetWindowId?: number): Promise<void>;
    setRepresentedFilename(path: string, targetWindowId?: number): Promise<void>;
    isAdmin(): Promise<boolean>;
    getWindowCount(): Promise<number>;
    relaunch(): Promise<void>;
    exit(): Promise<void>;
    get windowId(): number;
}
//# sourceMappingURL=NativeHostService.d.ts.map