/**
 * @module Define
 * @description
 * Defines the service for handling enterprise policies, conforming to the
 * `IPolicyService` contract from VS Code.
 */

import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { FilePolicyService } from "@codeeditorland/output/vs/platform/policy/common/filePolicyService.js";
import { IPolicyService } from "@codeeditorland/output/vs/platform/policy/common/policy.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IPolicyService`.
 *
 * This service implementation "lifts" the original `FilePolicyService` class
 * from VS Code. It is responsible for reading and providing access to
 * enterprise-level policies that can affect the workbench's behavior.
 *
 * It is registered with the identifier "policyService" for compatibility.
 */
export class PolicyService extends Effect.Service<IPolicyService>()(
	"policyService",
	{
		effect: Effect.gen(function* (Generator) {
			const EnvironmentService = yield* Generator(
				IBrowserWorkbenchEnvironmentService,
			);
			const FileService = yield* Generator(IFileService);
			const Logger = yield* Generator(ILogService);

			// The policies are read from a `policies.json` file whose location
			// is provided by the environment service.
			const PolicyFile = URI.file(EnvironmentService.policiesPath);

			const ServiceInstance = new FilePolicyService(
				PolicyFile,
				FileService,
				Logger,
			);

			return ServiceInstance;
		}),
	},
) {}
