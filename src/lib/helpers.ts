export function buildSearchParams(query: Record<string, any>) {
	const searchParams = new URLSearchParams();
	for (const key in query) {
		if (query[key] !== undefined && query[key] !== null) {
			if (Array.isArray(query[key])) {
				query[key].forEach((value: any) => {
					searchParams.append(key, String(value));
				});
			} else {
				searchParams.append(key, String(query[key]));
			}
		}
	}
	return searchParams;
}
