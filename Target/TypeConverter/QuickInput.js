const a = (e, o) => ({
		Items: e.map((t) => ({
			label: t.label,
			description: t.description,
			detail: t.detail,
			picked: t.picked,
			alwaysShow: t.alwaysShow,
		})),
		Options: {
			canPickMany: o.canPickMany,
			placeHolder: o.placeHolder,
			matchOnDescription: o.matchOnDescription,
			matchOnDetail: o.matchOnDetail,
			title: o.title,
		},
	}),
	n = (e) => ({
		placeHolder: e.placeHolder,
		prompt: e.prompt,
		value: e.value,
		password: e.password,
		title: e.title,
	});
export { a as ToDTO, n as ToDTOFromInput };
