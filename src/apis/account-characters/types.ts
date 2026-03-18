import z from "zod";
import type { CharacterResponse } from "@/apis/characters/types";

export interface AccountCharacterResponse {
	id: string;
	accountId: string;
	characterId: number;
	activatedConstellation: number;
	characterLevel: number;
	characterCost: number;
	notes?: string;
	createdAt: string;
	updatedAt: string;
	characters: CharacterResponse;
}

export const accountCharacterCreateSchema = z.object({
	characterId: z.number().int(),
	activatedConstellation: z.number().int().min(0).max(6).optional(),
	characterLevel: z.number().int().min(0).optional(),
	notes: z.string().optional(),
});

export type CreateAccountCharacterInput = z.infer<
	typeof accountCharacterCreateSchema
>;

export const accountCharacterUpdateSchema = z.object({
	characterId: z.number().int().optional(),
	activatedConstellation: z.number().int().min(0).max(6).optional(),
	characterLevel: z.number().int().min(0).optional(),
	notes: z.string().optional(),
});

export type UpdateAccountCharacterInput = z.infer<
	typeof accountCharacterUpdateSchema
>;

export const accountCharacterQuerySchema = z.object({
	characterId: z.number().int().optional(),
	accountId: z.string(),
});

export type AccountCharacterQuery = z.infer<typeof accountCharacterQuerySchema>;
