import z from "zod";
import { type AccountRoleEnum } from "@/lib/constants";
import { commonLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export interface ProfileResponse {
	id: string;
	email: string;
	ingameUuid: string;
	displayName: string;
	role: AccountRoleEnum;
	staffRolename: string;
	permissions: string[];
	avatar?: string;
}

export const updateProfileSchema = z.object({
	ingameUuid: z.string().optional(),
	avatar: z
		.url({
			message: getTranslationToken("common", commonLocaleKeys.validation_url),
		})
		.optional(),
	displayName: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
