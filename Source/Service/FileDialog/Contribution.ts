import { IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import {
	InstantiationType,
	registerSingleton,
} from "vs/platform/instantiation/common/extensions";

import { TauriFileDialogService } from "../FileDialog.js";

registerSingleton(
	IFileDialogService,
	TauriFileDialogService,
	InstantiationType.Delayed,
);
