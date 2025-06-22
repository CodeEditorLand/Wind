/*
 * File: Wind/Source/Application/QuickInput/Definition.ts
 * Role: Provides the live implementation of the IQuickInputService.
 * Responsibilities:
 *   - Implements the `IQuickInputService` interface with a custom class that
 *     proxies requests to the native host (`Mountain`).
 *   - Enables use of native (or custom web-based) UI for quick picks and input
 *     boxes, rather than the default in-editor HTML widgets.
 *   - Translates arguments and results between the VS Code API objects and
 *     serializable DTOs for IPC.
 */

import type {
	InputBoxOptionsDTO,
	QuickPickItemDTO,
	QuickPickOptionsDTO,
} from "Common/Source/UserInterface/DTO/mod.js";
import { Effect } from "effect";
import { CancellationToken } from "vs/base/common/cancellation.js";
import { Emitter, type Event } from "vs/base/common/event.js";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { INotificationService } from "vs/platform/notification/common/notification.js";
import type {
	IInputBox,
	IInputOptions,
	IPickOptions,
	IQuickInput,
	IQuickInputButton,
	IQuickInputService,
	IQuickNavigateConfiguration,
	IQuickPick,
	IQuickPickDidAcceptEvent,
	IQuickPickItem,
	IQuickPickItemButtonEvent,
	IQuickPickWillAcceptEvent,
} from "vs/platform/quickinput/common/quickInput.js";

// Fictional, but correct path.
import { HostService } from "../Host/mod.js";
import { InstantiationService } from "../Instantiation/mod.js";

/**
 * A custom implementation of `IQuickInputService` that proxies UI requests
 * to the native `Mountain` host. This allows for native-feeling UI elements
 * instead of the default HTML-based ones.
 */
class WindQuickInputService implements IQuickInputService {
	public _serviceBrand: undefined;

	constructor(
		@InstantiationService.Tag
		private readonly instantiationService: IInstantiationService,

		@HostService.Tag private readonly hostService: HostService["Type"],

		@INotificationService
		private readonly notificationService: INotificationService,
	) {}

	// The `pick` method for dropdown-style selection lists.
	public async pick<T extends IQuickPickItem>(
		picks: Promise<Array<T>> | Array<T>,

		options: IPickOptions<T> & { canPickMany: true },

		token: CancellationToken,
	): Promise<T[] | undefined>;

	public async pick<T extends IQuickPickItem>(
		picks: Promise<Array<T>> | Array<T>,

		options?: IPickOptions<T>,

		token?: CancellationToken,
	): Promise<T | undefined>;

	public async pick<T extends IQuickPickItem>(
		picks: Promise<Array<T>> | Array<T>,

		options: IPickOptions<T> = {},

		token: CancellationToken = CancellationToken.None,
	): Promise<T | T[] | undefined> {
		const resolvedPicks = await Promise.resolve(picks);

		if (token.isCancellationRequested) {
			return undefined;
		}

		// Convert VS Code QuickPickItems to our DTOs for IPC.
		const itemsDTO: QuickPickItemDTO[] = resolvedPicks.map((p) => ({
			label: p.label,

			description: p.description,

			detail: p.detail,

			picked: p.picked,

			alwaysShow: p.alwaysShow,
		}));

		const optionsDTO: QuickPickOptionsDTO = {
			canPickMany: options.canPickMany,

			placeHolder: options.placeHolder,

			matchOnDescription: options.matchOnDescription,

			matchOnDetail: options.matchOnDetail,

			title: options.title,
		};

		// Use the HostService to invoke the native quick pick.
		const resultLabels = await Effect.runPromise(
			this.hostService.showQuickPick(itemsDTO, optionsDTO),
		);

		if (token.isCancellationRequested || !resultLabels) {
			return undefined;
		}

		// Map the returned labels back to the original QuickPickItem objects.
		if (options.canPickMany) {
			const selectedLabels = new Set(resultLabels);

			return resolvedPicks.filter((p) => selectedLabels.has(p.label));
		}

		return resolvedPicks.find((p) => p.label === resultLabels[0]);
	}

	// The `input` method for free-text input boxes.
	public async input(
		options?: IInputOptions,

		token: CancellationToken = CancellationToken.None,
	): Promise<string | undefined> {
		const result = await Effect.runPromise(
			this.hostService.showInputBox(options as InputBoxOptionsDTO),
		);

		if (token.isCancellationRequested) {
			return undefined;
		}

		return result ?? undefined;
	}

	// --- Stubbed Methods and Properties ---
	// A full implementation would require a more complex controller that
	// manages the state of a custom quick input UI component.
	public readonly quickAccess: IQuickInput = {} as IQuickInput;

	public get onDidAccept(): Event<IQuickPickDidAcceptEvent> {
		return new Emitter<IQuickPickDidAcceptEvent>().event;
	}

	public get onDidChangeValue(): Event<string> {
		return new Emitter<string>().event;
	}

	public get onDidTriggerButton(): Event<IQuickInputButton> {
		return new Emitter<IQuickInputButton>().event;
	}

	public get onDidTriggerItemButton(): Event<
		IQuickPickItemButtonEvent<IQuickPickItem>
	> {
		return new Emitter<IQuickPickItemButtonEvent<IQuickPickItem>>().event;
	}

	public get onWillAccept(): Event<IQuickPickWillAcceptEvent> {
		return new Emitter<IQuickPickWillAcceptEvent>().event;
	}

	public createQuickPick<T extends IQuickPickItem>(): IQuickPick<T> {
		throw new Error("Method not implemented: createQuickPick.");
	}

	public createInputBox(): IInputBox {
		throw new Error("Method not implemented: createInputBox.");
	}

	public navigate(
		next: boolean,

		quickNavigate?: IQuickNavigateConfiguration,
	): void {}

	public focus(): void {}

	public toggle(): void {}

	public layout(): void {}

	public show(): void {}

	public hide(): void {}
}

/**
 * An Effect that builds the live implementation of the QuickInput service.
 * It instantiates our custom proxy `WindQuickInputService`, which forwards
 * UI requests to the native host.
 */
const Definition = Effect.gen(function* (_) {
	const InstantiationService = yield* _(IInstantiationService);

	return InstantiationService.createInstance(WindQuickInputService);
});

export default Definition;
