import { template as s } from "solid-js/web";
import { setAttribute as t } from "solid-js/web";
import "solid-js/web";
import { createComponent as o } from "solid-js/web";
var i = s("<link>");
import { For as c, Show as l } from "solid-js";
var b = ({ Of: m, rel: a, type: n, crossorigin: p }) =>
	o(c, {
		each: m,
		children: (r) =>
			o(l, {
				when: r,
				get children() {
					return (
						r &&
						(() => {
							var e = i();
							return (
								t(e, "type", n ?? "text/css"),
								t(e, "rel", a ?? "preconnect"),
								t(e, "crossorigin", p ?? "anonymous"),
								t(e, "href", r),
								e
							);
						})()
					);
				},
			}),
	});
export { b as default };
