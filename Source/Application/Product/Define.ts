import type { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import { Effect } from "effect";

export class ProductService extends Effect.Service<IProductService>()(
	"productService",
	{ sync: () => ({}) as any },
) {}
