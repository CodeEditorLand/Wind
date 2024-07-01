/**
 * @module Environment
 *
 */
export declare const StringURL: z.ZodString;
export declare const _Function: z.ZodObject<{
    API: z.ZodString;
    Socket: z.ZodString;
}, "strip", z.ZodTypeAny, {
    API: string;
    Socket: string;
}, {
    API: string;
    Socket: string;
}>;
export type Type = z.infer<Exclude<typeof _Function, boolean>>;
import { z } from "zod";
