import { IPromptsService } from '../service/promptsService.js';
import { ITextModel } from '../../../../../../editor/common/model.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Position } from '../../../../../../editor/common/core/position.js';
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
import { CompletionContext, CompletionItemProvider, CompletionList } from '../../../../../../editor/common/languages.js';
export declare class PromptHeaderAutocompletion extends Disposable implements CompletionItemProvider {
    private readonly promptsService;
    private readonly languageService;
    /**
     * Debug display name for this provider.
     */
    readonly _debugDisplayName: string;
    /**
     * List of trigger characters handled by this provider.
     */
    readonly triggerCharacters: string[];
    constructor(promptsService: IPromptsService, languageService: ILanguageFeaturesService);
    /**
     * The main function of this provider that calculates
     * completion items based on the provided arguments.
     */
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): Promise<CompletionList | undefined>;
    private providePropertyCompletions;
    private provideValueCompletions;
    private getSupportedProperties;
    private removeUsedProperties;
    private getValueSuggestions;
}
