import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IChatMode } from '../common/chatModes.js';
import { ILanguageModelToolsService, IToolAndToolSetEnablementMap, IToolData, ToolSet } from '../common/languageModelToolsService.js';
export declare enum ToolsScope {
    Global = 0,
    Session = 1,
    Mode = 2
}
export declare class ChatSelectedTools extends Disposable {
    private readonly _mode;
    private readonly _toolsService;
    private readonly _instantiationService;
    private readonly _selectedTools;
    private readonly _sessionStates;
    private readonly _allTools;
    /**
     * All enabled tools and tool sets.
     */
    readonly entries: IObservable<ReadonlySet<IToolData | ToolSet>>;
    constructor(_mode: IObservable<IChatMode>, _toolsService: ILanguageModelToolsService, _storageService: IStorageService, _instantiationService: IInstantiationService);
    /**
     * All tools and tool sets with their enabled state.
     */
    get entriesMap(): IObservable<IToolAndToolSetEnablementMap>;
    get entriesScope(): ToolsScope;
    get currentMode(): IChatMode;
    resetSessionEnablementState(): void;
    set(enablementMap: IToolAndToolSetEnablementMap, sessionOnly: boolean): void;
    updateCustomModeTools(uri: URI, enablementMap: IToolAndToolSetEnablementMap): Promise<void>;
    asEnablementMap(): Map<IToolData, boolean>;
}
