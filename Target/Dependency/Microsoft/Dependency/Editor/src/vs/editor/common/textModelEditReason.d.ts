export declare class TextModelEditReason {
    readonly metadata: ITextModelEditReasonMetadata;
    static readonly EolChange: TextModelEditReason;
    static readonly SetValue: TextModelEditReason;
    static readonly ApplyEdits: TextModelEditReason;
    static readonly Unknown: TextModelEditReason;
    static readonly Type: TextModelEditReason;
    constructor(metadata: ITextModelEditReasonMetadata);
    toString(): string;
}
export type ITextModelEditReasonMetadata = {
    source: 'unknown' | 'Chat.applyEdits' | 'inlineChat.applyEdit' | 'reloadFromDisk' | 'eolChange' | 'setValue' | 'applyEdits' | string;
} | {
    source: 'inlineCompletionAccept';
    nes: boolean;
    type: 'word' | 'line' | undefined;
    requestUuid: string;
    extensionId: string | undefined;
} | {
    source: 'cursor';
    kind: 'compositionType' | 'compositionEnd' | 'type' | 'paste' | 'cut' | 'executeCommands' | 'executeCommand';
    detailedSource?: string | null | undefined;
};
