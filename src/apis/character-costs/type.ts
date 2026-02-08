import { CharacterElement } from "@/lib/constants";
import z from "zod";

export interface CharacterCostResponse {
	id: number;
	constellation: number;
	cost: number;
}

export interface CharacterCostCharacterResponse {
	id: number;
	key: string;
	name: string;
	iconUrl: string;
	rarity: number;
	characterCosts?: CharacterCostResponse[];
}

export const characterCostQuerySchema = z.object({
	showInactive: z.boolean().optional().default(false),
	startId: z.number().min(1).optional(),
	element: z.array(z.enum(CharacterElement)).optional(),
	search: z.string().optional(),
	limit: z.number().min(1).max(50).default(50),
});

export type CharacterCostQuery = z.infer<typeof characterCostQuerySchema>;

export const updateCharacterCostSchema = z.object({
	cost: z.number().min(0),
});

export type UpdateCharacterCostInput = z.infer<
	typeof updateCharacterCostSchema
>;
