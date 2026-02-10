import z from "zod";
import {
	CharacterElement,
	WeaponType,
	type CharacterElementEnum,
	type WeaponTypeEnum,
} from "@/lib/constants";
import { commonLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import type { ProfileResponse } from "../self/types";
import { paginationQuerySchema } from "@/lib/types";

export interface CharacterResponse {
	id: number;
	key: string;
	name: string;
	element: CharacterElementEnum;
	weaponType: WeaponTypeEnum;
	iconUrl: string;
	rarity: number;
	isActive: boolean;
	createdAt: string;
	createdBy?: ProfileResponse;
	updatedAt: string;
	updatedBy?: ProfileResponse;
}

export const createCharacterSchema = z.object({
	key: z
		.string()
		.min(
			1,
			getTranslationToken("common", commonLocaleKeys.validation_required),
		),
	name: z
		.string()
		.min(
			1,
			getTranslationToken("common", commonLocaleKeys.validation_required),
		),
	element: z.enum(CharacterElement, {
		message: getTranslationToken(
			"common",
			commonLocaleKeys.validation_required,
		),
	}),
	weaponType: z.enum(WeaponType, {
		message: getTranslationToken(
			"common",
			commonLocaleKeys.validation_required,
		),
	}),
	iconUrl: z.string().optional(),
	rarity: z.number().int({
		message: getTranslationToken(
			"common",
			commonLocaleKeys.validation_required,
		),
	}),
});

export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;

export const updateCharacterSchema = z.object({
	key: z
		.string()
		.min(1, getTranslationToken("common", commonLocaleKeys.validation_required))
		.optional(),
	name: z
		.string()
		.min(1, getTranslationToken("common", commonLocaleKeys.validation_required))
		.optional(),
	element: z
		.enum(CharacterElement, {
			message: getTranslationToken(
				"common",
				commonLocaleKeys.validation_required,
			),
		})
		.optional(),
	weaponType: z
		.enum(WeaponType, {
			message: getTranslationToken(
				"common",
				commonLocaleKeys.validation_required,
			),
		})
		.optional(),
	iconUrl: z
		.url({
			message: getTranslationToken("common", commonLocaleKeys.validation_url),
		})
		.optional(),
	rarity: z
		.number()
		.int({
			message: getTranslationToken(
				"common",
				commonLocaleKeys.validation_required,
			),
		})
		.optional(),
});

export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;

export const characterQuerySchema = z.object({
	...paginationQuerySchema.shape,
	search: z.string().optional(),
	element: z.array(z.enum(CharacterElement)).optional(),
	weaponType: z.array(z.enum(WeaponType)).optional(),
	rarity: z.array(z.int()).optional(),
	showInactive: z.boolean().optional(),
});

export type CharacterQuery = z.infer<typeof characterQuerySchema>;
