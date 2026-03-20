import z from "zod";
import type { ProfileResponse } from "../self/types";
import { paginationQuerySchema } from "@/lib/types";

export interface CharacterLevelCostResponse {
	id: number;
	characterId: number;
	level: number;
	cost: number;
	updatedAt?: string;
	updatedBy?: ProfileResponse;
}

export const characterLevelCostQuerySchema = z.object({
	...paginationQuerySchema.shape,
	search: z.string().optional(),
	level: z.array(z.number().int()).optional(),
});

export type CharacterLevelCostQuery = z.infer<
	typeof characterLevelCostQuerySchema
>;

export const createCharacterLevelCostSchema = z.object({
	characterId: z.number().int().min(1),
	level: z.number().int().min(1),
	cost: z.number().min(0),
});

export type CreateCharacterLevelCostInput = z.infer<
	typeof createCharacterLevelCostSchema
>;

export const updateCharacterLevelCostSchema = z.object({
	characterId: z.number().int().min(1).optional(),
	level: z.number().int().min(1).optional(),
	cost: z.number().min(0).optional(),
});

export type UpdateCharacterLevelCostInput = z.infer<
	typeof updateCharacterLevelCostSchema
>;
