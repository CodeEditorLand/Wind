/**
 * @module Provider (TypeConverter/SourceControlManagement)
 * @description Implements the type converter for SCM Provider DTOs.
 */
import type { ISCMProvider } from "vs/workbench/contrib/scm/common/scm.js";
/**
 * The Data Transfer Object for an SCM Provider.
 * This should be kept in sync with the DTO from Mountain.
 */
export interface SourceControlManagementProviderDTO {
    readonly Handle: number;
    readonly Label: string;
    readonly RootUri?: string;
}
/**
 * Converts a provider DTO from the host into the `ISCMProvider` interface
 * expected by the workbench.
 *
 * @param DTO - The SCM Provider DTO received from the host.
 * @returns An object conforming to the `ISCMProvider` interface.
 */
export declare const FromDTO: (DTO: SourceControlManagementProviderDTO) => ISCMProvider;
