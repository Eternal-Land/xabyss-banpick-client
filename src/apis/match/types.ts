import z from "zod";
import type { ProfileResponse } from "../self/types";
import { paginationQuerySchema } from "@/lib/types";
import { MatchType, type MatchTypeEnum } from "@/lib/constants";

export interface MatchInvitationResponse {
	invitationId: string;
	matchId: string;
	matchName: string;
	inviterDisplayName: string;
	inviterAvatarUrl: string;
}

export interface MatchResponse {
	id: string;
	name: string;
	host?: ProfileResponse;
	sessionCount: number;
	createdAt: string;
	participants?: ProfileResponse[];
	invitations?: MatchInvitationResponse[];
	type: MatchTypeEnum;
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
	type: z.enum(MatchType).default(MatchType.REALTIME),
});

export type CreateMatchInput = z.infer<typeof createMatchInputSchema>;

export const updateMatchInputSchema = z.object({
	sessionCount: z
		.number()
		.min(1, "Session count must be at least 1")
		.max(5, "Session count must be at most 5"),
	name: z.string(),
	type: z.enum(MatchType).default(MatchType.REALTIME),
});

export type UpdateMatchInput = z.infer<typeof updateMatchInputSchema>;

const inviteToMatchSchema = z.object({
	accountId: z.string(),
	matchId: z.string(),
});

export type InviteToMatchInput = z.infer<typeof inviteToMatchSchema>;
