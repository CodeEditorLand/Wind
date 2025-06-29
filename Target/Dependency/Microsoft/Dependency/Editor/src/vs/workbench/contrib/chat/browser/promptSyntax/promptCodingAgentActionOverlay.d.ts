import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../../../editor/browser/editorBrowser.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IRemoteCodingAgentsService } from '../../../remoteCodingAgents/common/remoteCodingAgentsService.js';
export declare class PromptCodingAgentActionOverlayWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly _commandService;
    private readonly _contextKeyService;
    private readonly _remoteCodingAgentService;
    private static readonly ID;
    private readonly _domNode;
    private readonly _button;
    private _isVisible;
    constructor(_editor: ICodeEditor, _commandService: ICommandService, _contextKeyService: IContextKeyService, _remoteCodingAgentService: IRemoteCodingAgentsService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    private _updateVisibility;
    private _execute;
    dispose(): void;
}
