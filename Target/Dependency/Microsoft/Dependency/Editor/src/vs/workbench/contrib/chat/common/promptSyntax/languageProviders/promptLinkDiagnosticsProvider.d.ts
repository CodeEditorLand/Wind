import { IPromptsService } from '../service/promptsService.js';
import { ProviderInstanceBase } from './providerInstanceBase.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { ProviderInstanceManagerBase, TProviderClass } from './providerInstanceManagerBase.js';
import { IMarkerService } from '../../../../../../platform/markers/common/markers.js';
import { IFileService } from '../../../../../../platform/files/common/files.js';
/**
 * Prompt links diagnostics provider for a single text model.
 */
declare class PromptLinkDiagnosticsProvider extends ProviderInstanceBase {
    private readonly markerService;
    private readonly fileService;
    constructor(model: ITextModel, promptsService: IPromptsService, markerService: IMarkerService, fileService: IFileService);
    /**
     * Update diagnostic markers for the current editor.
     */
    protected onPromptSettled(): Promise<void>;
    /**
     * Returns a string representation of this object.
     */
    toString(): string;
}
/**
 * The class that manages creation and disposal of {@link PromptLinkDiagnosticsProvider}
 * classes for each specific editor text model.
 */
export declare class PromptLinkDiagnosticsInstanceManager extends ProviderInstanceManagerBase<PromptLinkDiagnosticsProvider> {
    protected get InstanceClass(): TProviderClass<PromptLinkDiagnosticsProvider>;
}
export {};
