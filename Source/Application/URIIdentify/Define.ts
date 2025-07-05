import type { IUriIdentityService } from "@codeeditorland/output/vs/platform/uriIdentity/common/uriIdentity.js";
import { Effect } from "effect";

export class UriIdentityService extends Effect.Service<IUriIdentityService>()(
	"uriIdentityService",
	{ sync: () => ({}) as any },
) {}
