import { Disposable } from '../../../../base/common/lifecycle.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare const ICoreExperimentationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICoreExperimentationService>;
export declare const startupExpContext: RawContextKey<string>;
interface IExperiment {
    cohort: number;
    subCohort: number;
    experimentGroup: StartupExperimentGroup;
    iteration: number;
    isInExperiment: boolean;
}
export interface ICoreExperimentationService {
    readonly _serviceBrand: undefined;
    getExperiment(): IExperiment | undefined;
}
export declare enum StartupExperimentGroup {
    Control = "control",
    MaximizedChat = "maximizedChat",
    SplitEmptyEditorChat = "splitEmptyEditorChat",
    SplitWelcomeChat = "splitWelcomeChat"
}
export declare const STARTUP_EXPERIMENT_NAME = "startup";
export declare class CoreExperimentationService extends Disposable implements ICoreExperimentationService {
    private readonly storageService;
    private readonly telemetryService;
    private readonly productService;
    private readonly contextKeyService;
    readonly _serviceBrand: undefined;
    private readonly experiments;
    constructor(storageService: IStorageService, telemetryService: ITelemetryService, productService: IProductService, contextKeyService: IContextKeyService);
    private initializeExperiments;
    private getExperimentConfiguration;
    private createStartupExperiment;
    private sendExperimentTelemetry;
    getExperiment(): IExperiment | undefined;
}
export {};
