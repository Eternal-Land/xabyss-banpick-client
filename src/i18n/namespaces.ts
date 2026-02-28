export const i18nNamespaces = [
	"common",
	"admin",
	"auth",
	"character-costs",
	"characters",
	"cost-milestones",
	"header",
	"match",
	"permissions",
	"profile",
	"staff-roles",
	"staffs",
	"users",
	"weapons",
	"weapon-costs",
] as const;

export function getTranslationToken(
	namespace: (typeof i18nNamespaces)[number],
	key: string,
) {
	return `${namespace}:${key}`;
}
