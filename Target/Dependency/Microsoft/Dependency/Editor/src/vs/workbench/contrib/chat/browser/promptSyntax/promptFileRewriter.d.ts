import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { URI } from '../../../../../base/common/uri.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IToolAndToolSetEnablementMap } from '../../common/languageModelToolsService.js';
import { IPromptsService } from '../../common/promptSyntax/service/promptsService.js';
export declare class PromptFileRewriter {
    private readonly _codeEditorService;
    private readonly _promptsService;
    constructor(_codeEditorService: ICodeEditorService, _promptsService: IPromptsService);
    openAndRewriteTools(uri: URI, newTools: IToolAndToolSetEnablementMap | undefined, token: CancellationToken): Promise<void>;
    rewriteTools(model: ITextModel, newTools: IToolAndToolSetEnablementMap | undefined, range: Range): void;
}
