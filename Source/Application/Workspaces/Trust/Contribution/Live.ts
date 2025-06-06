// Source/Application/Workspaces/Trust/Contribution/Live.ts
import { Effect, Layer, Option, Schedule, Stream } from "effect";
import { Codicon } from "vs/base/common/codicons.js";
import { MarkdownString } from "vs/base/common/htmlContent.js";
import { localize } from "vs/nls.js";
import { Severity } from "vs/platform/notification/common/notification.js";
import { WorkspaceTrustUriResponse } from "vs/platform/workspace/common/workspaceTrust.js";
import { MANAGE_TRUST_COMMAND_ID } from "vs/workbench/contrib/workspace/common/workspace.js";
import {
	StatusbarAlignment,
	type IStatusbarEntry,
} from "vs/workbench/services/statusbar/browser/statusbar.js";

import {
	BannerServiceTag,
	CommandServiceTag,
	ConfigurationServiceTag,
	DialogServiceTag,
	HostServiceTag,
	LabelServiceTag,
	StatusbarServiceTag,
	WorkspaceContextServiceTag,
} from "../../../Platform/VSCode/Provide.js";
import { TrustProblem } from "../Error/TrustProblem.js";
import WorkspaceTrustRequestServiceTag, {
	type WorkspaceTrustRequestOptions,
} from "../RequestTag.js";
// Aggregator for VS Code service tags
import WorkspaceTrustManagementServiceTag from "../Tag.js";

// This is our new Workbench Contribution. It's a Layer that provides nothing (`Layer<never>`)
// but contains the setup logic for all the UI interactions.
const LiveWorkspaceTrustContribution = Layer.scopedDiscard(
	Effect.gen(function* (_) {
		// 1. All dependencies are cleanly injected via `yield*`.
		const CommandService = yield* _(CommandServiceTag);
		const ConfigService = yield* _(ConfigurationServiceTag);
		const DialogService = yield* _(DialogServiceTag);
		const HostService = yield* _(HostServiceTag);
		const LabelService = yield* _(LabelServiceTag);
		const StatusbarService = yield* _(StatusbarServiceTag);
		const BannerService = yield* _(BannerServiceTag);
		const TrustManagementService = yield* _(
			WorkspaceTrustManagementServiceTag,
		);
		const TrustRequestService = yield* _(WorkspaceTrustRequestServiceTag);
		const WorkspaceContextService = yield* _(WorkspaceContextServiceTag);

		const IsTrusted = TrustManagementService.IsTrusted; // A Ref<boolean>

		// 2. Logic is broken down into small, composable Effects.
		const showTrustDialog = (options?: WorkspaceTrustRequestOptions) =>
			DialogService.prompt({
				type: Severity.Info,
				message:
					"Do you trust the authors of the files in this workspace?",
				custom: {
					icon: Codicon.shield,
					markdownDetails: [
						{
							markdown: new MarkdownString(
								options?.message ?? "...",
							),
						},
					],
				},
				buttons: [
					{
						label: "Trust Workspace & Continue",
						run: () =>
							TrustManagementService.setWorkspaceTrust(true),
					},
					{
						label: "Manage",
						run: () =>
							CommandService.executeCommand(
								MANAGE_TRUST_COMMAND_ID,
							),
					},
				],
				cancelButton: { run: () => Effect.void },
			});

		const updateStatusbarEntry = (isTrusted: boolean) =>
			Effect.gen(function* (_) {
				if (isTrusted) {
					// In a real implementation, we'd store the accessor and dispose it.
					// For now, this demonstrates the principle.
					StatusbarService.overrideEntry("status.workspaceTrust", {
						text: "",
					});
				} else {
					const entry: IStatusbarEntry = {
						name: localize(
							"status.WorkspaceTrust",
							"Workspace Trust",
						),
						text: `$(shield) ${localize("untrusted", "Restricted Mode")}`,
						ariaLabel: "...",
						tooltip: "...",
						command: MANAGE_TRUST_COMMAND_ID,
						kind: "prominent",
					};
					StatusbarService.addEntry(
						entry,
						"status.workspaceTrust",
						StatusbarAlignment.LEFT,
					);
				}
			});

		// 3. The main logic is a reactive stream pipeline.
		const mainLogic = Stream.mergeAll([
			// Stream 1: React to trust changes
			TrustManagementService.OnDidChangeTrust.pipe(
				Stream.flatMap((isTrusted) =>
					Effect.all(
						[
							updateStatusbarEntry(isTrusted),
							// BannerService.show/hide would also be Effects
						],
						{ discard: true },
					),
				),
			),

			// Stream 2: React to requests to show the trust dialog
			Stream.fromPubSub(
				TrustRequestService.WorkspaceTrustRequestSink,
			).pipe(
				// Debounce to avoid showing multiple dialogs in quick succession
				Stream.debounce("50ms"),
				Stream.flatMap(
					(options) =>
						showTrustDialog(options).pipe(
							Effect.catchAll(() => Effect.void),
						), // Ignore dialog errors
				),
			),

			// Stream 3: React to file open requests
			Stream.fromPubSub(
				TrustRequestService.OpenFilesTrustRequestSink,
			).pipe(
				Stream.flatMap(() =>
					DialogService.prompt({
						/* ... open files dialog ... */
					})
						.pipe(
							Effect.flatMap((result) =>
								TrustRequestService.completeOpenFilesTrustRequest(
									result,
								),
							),
						)
						.pipe(Effect.catchAll(() => Effect.void)),
				),
			),
		]).pipe(
			Stream.runDrain, // Run this stream pipeline forever
		);

		// 4. Fork the main logic to run in the background for the lifetime of the scope.
		yield* _(Effect.forkDaemon(mainLogic));

		// 5. Initial setup
		yield* _(TrustManagementService.WorkspaceTrustInitialized); // Wait for trust to be initialized
		const initialTrustState = yield* _(Ref.get(IsTrusted));
		yield* _(updateStatusbarEntry(initialTrustState));
		yield* _(Effect.log("Workspace Trust UX Contribution Initialized."));
	}),
);

export default LiveWorkspaceTrustContribution;
