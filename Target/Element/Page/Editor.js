import { template as n } from "solid-js/web";
import { insert as t } from "solid-js/web";
import { createComponent as r } from "solid-js/web";
var i = n("<div class=p-5>"),
	_ = n(
		'<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">',
	);
import { Suspense as l, lazy as a } from "solid-js";
const $ = a(() => import("../../Context/Action.js")),
	s = a(() => import("../Editor.js"));
var w = () =>
	r(l, {
		get children() {
			var o = _(),
				c = o.firstChild,
				d = c.firstChild,
				p = d.firstChild,
				f = p.firstChild,
				g = f.firstChild,
				m = g.firstChild;
			return (
				t(
					m,
					r(l, {
						get children() {
							return r($, {
								get children() {
									return [
										r(l, {
											get children() {
												var e = i();
												return (
													t(
														e,
														r(s, { Type: "HTML" }),
													),
													e
												);
											},
										}),
										r(l, {
											get children() {
												var e = i();
												return (
													t(e, r(s, { Type: "CSS" })),
													e
												);
											},
										}),
										r(l, {
											get children() {
												var e = i();
												return (
													t(
														e,
														r(s, {
															Type: "TypeScript",
														}),
													),
													e
												);
											},
										}),
									];
								},
							});
						},
					}),
				),
				o
			);
		},
	});
export { w as default };
