import z from "zod";
import type { ProfileResponse } from "../self/types";
import { paginationQuerySchema } from "@/lib/types";

export interface MatchResponse {
	id: string;
	name: string;
	host?: ProfileResponse;
	sessionCount: number;
	createdAt: string;
	participants?: ProfileResponse[];
}

export const listMatchesQuerySchema = z.object({
	...paginationQuerySchema.shape,
	accountId: z.string().optional(),
	search: z.string().optional(),
});

export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;

export const createMatchInputSchema = z.object({
	isParticipant: z.boolean(),
	sessionCount: z
		.number()
		.min(1, "Session count must be at least 1")
		.max(5, "Session count must be at most 5"),
	name: z.string(),
});

export type CreateMatchInput = z.infer<typeof createMatchInputSchema>;

export const updateMatchInputSchema = z.object({
	sessionCount: z
		.number()
		.min(1, "Session count must be at least 1")
		.max(5, "Session count must be at most 5"),
	name: z.string(),
});

export interface UpdateMatchInput extends z.infer<
	typeof updateMatchInputSchema
> {}
