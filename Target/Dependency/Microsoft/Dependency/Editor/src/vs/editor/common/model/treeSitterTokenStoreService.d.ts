import { Range } from '../core/range.js';
import { ITextModel } from '../model.js';
import { TokenQuality, TokenUpdate } from './tokenStore.js';
import { IModelContentChangedEvent } from '../textModelEvents.js';
export interface ITreeSitterTokenizationStoreService {
    readonly _serviceBrand: undefined;
    setTokens(model: ITextModel, tokens: TokenUpdate[], tokenQuality: TokenQuality): void;
    handleContentChanged(model: ITextModel, e: IModelContentChangedEvent): void;
    getTokens(model: ITextModel, line: number): Uint32Array | undefined;
    updateTokens(model: ITextModel, version: number, updates: {
        oldRangeLength?: number;
        newTokens: TokenUpdate[];
    }[], tokenQuality: TokenQuality): void;
    markForRefresh(model: ITextModel, range: Range): void;
    getNeedsRefresh(model: ITextModel): {
        range: Range;
        startOffset: number;
        endOffset: number;
    }[];
    hasTokens(model: ITextModel, accurateForRange?: Range): boolean;
    rangeHasTokens(model: ITextModel, range: Range, minimumTokenQuality: TokenQuality): boolean;
    delete(model: ITextModel): void;
}
export declare const ITreeSitterTokenizationStoreService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITreeSitterTokenizationStoreService>;
export interface TokenInformation {
    tokens: Uint32Array;
    needsRefresh?: boolean;
}
