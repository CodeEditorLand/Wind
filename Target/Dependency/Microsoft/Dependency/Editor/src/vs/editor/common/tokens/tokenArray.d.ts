import { OffsetRange } from '../core/offsetRange.js';
import { ILanguageIdCodec } from '../languages.js';
import { LineTokens } from './lineTokens.js';
/**
 * This class represents a sequence of tokens.
 * Conceptually, each token has a length and a metadata number.
 * A token array might be used to annotate a string with metadata.
 * Use {@link TokenArrayBuilder} to efficiently create a token array.
 *
 * TODO: Make this class more efficient (e.g. by using a Int32Array).
*/
export declare class TokenArray {
    private readonly _tokenInfo;
    static fromLineTokens(lineTokens: LineTokens): TokenArray;
    static create(tokenInfo: TokenInfo[]): TokenArray;
    private constructor();
    toLineTokens(lineContent: string, decoder: ILanguageIdCodec): LineTokens;
    forEach(cb: (range: OffsetRange, tokenInfo: TokenInfo) => void): void;
    map<T>(cb: (range: OffsetRange, tokenInfo: TokenInfo) => T): T[];
    slice(range: OffsetRange): TokenArray;
    append(other: TokenArray): TokenArray;
}
export type TokenMetadata = number;
export declare class TokenInfo {
    readonly length: number;
    readonly metadata: TokenMetadata;
    constructor(length: number, metadata: TokenMetadata);
}
/**
 * TODO: Make this class more efficient (e.g. by using a Int32Array).
*/
export declare class TokenArrayBuilder {
    private readonly _tokens;
    add(length: number, metadata: TokenMetadata): void;
    build(): TokenArray;
}
