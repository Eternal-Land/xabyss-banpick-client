import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CostMilestoneResponse } from "@/apis/cost-milestones/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { costMilestonesLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export interface CostMilestoneDeleteDialogProps {
	milestone: CostMilestoneResponse | null;
	isPending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function CostMilestoneDeleteDialog({
	milestone,
	isPending,
	onConfirm,
	onCancel,
}: CostMilestoneDeleteDialogProps) {
	const { t } = useTranslation();

	const rangeText = useMemo(() => {
		if (!milestone) return "";
		const maxText =
			milestone.costTo != undefined
				? milestone.costTo
				: t(
						getTranslationToken(
							"cost-milestones",
							costMilestonesLocaleKeys.cost_milestones_range_open,
						),
					);
		return `${milestone.costFrom} - ${maxText}`;
	}, [milestone, t]);

	return (
		<Dialog
			open={Boolean(milestone)}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t(
							getTranslationToken(
								"cost-milestones",
								costMilestonesLocaleKeys.cost_milestones_delete_title,
							),
						)}
					</DialogTitle>
					<DialogDescription>
						{t(
							getTranslationToken(
								"cost-milestones",
								costMilestonesLocaleKeys.cost_milestones_delete_description,
							),
							{
								range: rangeText,
							},
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						{t(
							getTranslationToken(
								"cost-milestones",
								costMilestonesLocaleKeys.cost_milestones_cancel,
							),
						)}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"cost-milestones",
										costMilestonesLocaleKeys.cost_milestones_delete_pending,
									),
								)
							: t(
									getTranslationToken(
										"cost-milestones",
										costMilestonesLocaleKeys.cost_milestones_delete_confirm_action,
									),
								)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
