import z from "zod";
import { costMilestonesLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import type { ProfileResponse } from "../self/types";

export interface CostMilestoneResponse {
	id: number;
	costFrom: number;
	costTo?: number | null;
	secPerCost: number;
	createdAt: string;
	createdBy: ProfileResponse;
	updatedAt?: string;
	updatedBy?: ProfileResponse;
}

export const createCostMilestoneSchema = z.object({
	costFrom: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_cost_from_min,
			),
		),
	costTo: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_cost_to_min,
			),
		)
		.nullable()
		.optional(),
	secPerCost: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_sec_per_cost_min,
			),
		),
});

export type CreateCostMilestoneInput = z.infer<
	typeof createCostMilestoneSchema
>;

export const updateCostMilestoneSchema = z.object({
	costFrom: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_cost_from_min,
			),
		),
	costTo: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_cost_to_min,
			),
		)
		.nullable()
		.optional(),
	secPerCost: z
		.number()
		.min(
			0,
			getTranslationToken(
				"cost-milestones",
				costMilestonesLocaleKeys.cost_milestones_sec_per_cost_min,
			),
		),
});

export type UpdateCostMilestoneInput = z.infer<
	typeof updateCostMilestoneSchema
>;
