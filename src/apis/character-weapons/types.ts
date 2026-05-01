import z from "zod";
import { commonLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export interface CharacterWeaponResponse {
	id: number;
	characterId: number | null;
	characterKey?: string;
	characterName?: string;
	weaponId: number;
	weaponKey: string;
	weaponName: string;
	constellationCondition?: number | null;
}

const nullableNumber = z.preprocess(
	(value) => (value === "" ? null : value),
	z.number().int().nullable(),
);

export const createCharacterWeaponSchema = z.object({
	characterId: nullableNumber.optional(),
	characterKey: z.string().trim().min(1).optional(),
	weaponId: z.number().int().optional(),
	weaponKey: z.string().trim().min(1).optional(),
	constellationCondition: nullableNumber.optional(),
});

export type CreateCharacterWeaponInput = z.infer<
	typeof createCharacterWeaponSchema
>;

export const updateCharacterWeaponSchema = createCharacterWeaponSchema;

export type UpdateCharacterWeaponInput = z.infer<
	typeof updateCharacterWeaponSchema
>;

export const characterWeaponFormSchema = z.object({
	characterKey: z.string().optional(),
	weaponKey: z
		.string()
		.trim()
		.min(
			1,
			getTranslationToken("common", commonLocaleKeys.validation_required),
		),
	constellationCondition: z
		.union([z.literal(""), z.coerce.number().int().min(0)])
		.optional(),
	isGeneric: z.boolean().default(false),
});

export type CharacterWeaponFormInput = z.infer<
	typeof characterWeaponFormSchema
>;
