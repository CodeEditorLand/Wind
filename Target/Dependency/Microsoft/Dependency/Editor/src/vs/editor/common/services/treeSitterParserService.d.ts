import type * as Parser from '@vscode/tree-sitter-wasm';
import { Event } from '../../../base/common/event.js';
import { ITextModel } from '../model.js';
import { Range } from '../core/range.js';
import { IModelContentChangedEvent } from '../textModelEvents.js';
export declare const EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";
export declare const TREESITTER_ALLOWED_SUPPORT: string[];
export declare const ITreeSitterParserService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITreeSitterParserService>;
export interface RangeWithOffsets {
    range: Range;
    startOffset: number;
    endOffset: number;
}
export interface RangeChange {
    newRange: Range;
    newRangeStartOffset: number;
    newRangeEndOffset: number;
}
export interface TreeParseUpdateEvent {
    ranges: RangeChange[] | undefined;
    language: string;
    versionId: number;
    tree: Parser.Tree;
    includedModelChanges: IModelContentChangedEvent[];
}
export interface ModelTreeUpdateEvent {
    ranges: RangeChange[];
    versionId: number;
    tree: ITextModelTreeSitter;
    languageId: string;
    hasInjections: boolean;
}
export interface TreeUpdateEvent extends ModelTreeUpdateEvent {
    textModel: ITextModel;
}
export interface ITreeSitterParserService {
    readonly _serviceBrand: undefined;
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    getLanguage(languageId: string): Promise<Parser.Language | undefined>;
    getParseResult(textModel: ITextModel): ITextModelTreeSitter | undefined;
    getTree(content: string, languageId: string): Promise<Parser.Tree | undefined>;
    getTreeSync(content: string, languageId: string): Parser.Tree | undefined;
    onDidUpdateTree: Event<TreeUpdateEvent>;
    /**
     * For testing purposes so that the time to parse can be measured.
    */
    getTextModelTreeSitter(model: ITextModel, parseImmediately?: boolean): Promise<ITextModelTreeSitter | undefined>;
}
export interface ITreeSitterParseResult {
    readonly tree: Parser.Tree | undefined;
    readonly language: Parser.Language;
    readonly languageId: string;
    readonly ranges: Parser.Range[] | undefined;
    versionId: number;
}
export interface ITextModelTreeSitter {
    /**
     * For testing purposes so that the time to parse can be measured.
     */
    parse(languageId?: string): Promise<ITreeSitterParseResult | undefined>;
    textModel: ITextModel;
    parseResult: ITreeSitterParseResult | undefined;
    getInjection(offset: number, parentLanguage: string): ITreeSitterParseResult | undefined;
    dispose(): void;
}
export declare const ITreeSitterImporter: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITreeSitterImporter>;
export interface ITreeSitterImporter {
    readonly _serviceBrand: undefined;
    getParserClass(): Promise<typeof Parser.Parser>;
    readonly parserClass: typeof Parser.Parser | undefined;
    getLanguageClass(): Promise<typeof Parser.Language>;
    getQueryClass(): Promise<typeof Parser.Query>;
}
export declare class TreeSitterImporter implements ITreeSitterImporter {
    readonly _serviceBrand: undefined;
    private _treeSitterImport;
    constructor();
    private _getTreeSitterImport;
    get parserClass(): typeof Parser.Parser | undefined;
    private _parserClass;
    getParserClass(): Promise<typeof Parser.Parser>;
    private _languageClass;
    getLanguageClass(): Promise<typeof Parser.Language>;
    private _queryClass;
    getQueryClass(): Promise<typeof Parser.Query>;
}
