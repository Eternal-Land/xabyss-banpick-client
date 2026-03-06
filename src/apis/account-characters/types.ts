import z from "zod";
import { paginationQuerySchema } from "@/lib/types";
import type { CharacterResponse } from "@/apis/characters/types";

export interface AccountCharacterResponse {
	id: string;
	accountId: string;
	characterId: number;
	activatedConstellation: number;
	characterLevel: number;
	characterCost: number;
	isOwned: boolean;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	characters: CharacterResponse;
}

export const accountCharacterCreateSchema = z.object({
	characterId: z.number().int(),
	activatedConstellation: z.number().int().min(0).max(6).optional(),
	characterLevel: z.number().int().min(0).optional(),
	isOwned: z.boolean().optional(),
	notes: z.string().optional(),
});

export type CreateAccountCharacterInput = z.infer<
	typeof accountCharacterCreateSchema
>;

export const accountCharacterUpdateSchema = z.object({
	characterId: z.number().int().optional(),
	activatedConstellation: z.number().int().min(0).max(6).optional(),
	characterLevel: z.number().int().min(0).optional(),
	isOwned: z.boolean().optional(),
	notes: z.string().optional(),
});

export type UpdateAccountCharacterInput = z.infer<
	typeof accountCharacterUpdateSchema
>;

export const accountCharacterQuerySchema = z.object({
	...paginationQuerySchema.shape,
	characterId: z.number().int().optional(),
	isOwned: z.boolean().optional(),
});

export type AccountCharacterQuery = z.infer<typeof accountCharacterQuerySchema>;
