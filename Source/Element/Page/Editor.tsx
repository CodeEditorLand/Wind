import { Suspense, lazy } from "solid-js";

const Action = lazy(() => import("@Context/Action.js"));
const Connection = lazy(() => import("@Context/Connection.js"));
const Editor = lazy(() => import("@Element/Editor.js"));
const Store = lazy(() => import("@Context/Store.js"));

export default () => (
	<Suspense>
		<Store
			Data={
				new Map([
					["Identifier", "Identifier"],
					["Key", "Key"],
				])
			}>
			<Suspense>
				<Connection>
					<Suspense>
						<div class="flex flex-col">
							<main class="flex grow justify-center">
								<div class="flex grow self-center">
									<div class="container">
										<div class="grid min-h-screen content-start gap-7 py-9">
											<div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10">
												<div class="order-last lg:order-first">
													<Suspense>
														<Action>
															<Suspense>
																<Editor Type="HTML" />
															</Suspense>
															<Suspense>
																<Editor Type="CSS" />
															</Suspense>
															<Suspense>
																<Editor Type="TypeScript" />
															</Suspense>
														</Action>
													</Suspense>
												</div>
											</div>
										</div>
									</div>
								</div>
							</main>
						</div>
					</Suspense>
				</Connection>
			</Suspense>
		</Store>
	</Suspense>
);
