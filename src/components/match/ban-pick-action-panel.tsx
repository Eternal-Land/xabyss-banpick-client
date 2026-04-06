import type { DraftAction } from "@/components/match/ban-pick.types";
import { Button } from "@/components/ui/button";

interface BanPickActionPanelProps {
	formattedTurnCountdown: string;
	isDraftCompleted: boolean;
	draftStep: number;
	draftSequenceLength: number;
	currentAction?: DraftAction;
	isSubmittingTurnAction: boolean;
	isButtonDisabled: boolean;
	onSubmit: () => Promise<void> | void;
}

export default function BanPickActionPanel({
	formattedTurnCountdown,
	isDraftCompleted,
	draftStep,
	draftSequenceLength,
	currentAction,
	isSubmittingTurnAction,
	isButtonDisabled,
	onSubmit,
}: BanPickActionPanelProps) {
	return (
		<div className="col-span-1 flex flex-col items-center justify-between p-4">
			<div className="w-full mt-4 rounded-md border border-white/30 bg-white/5 p-3 text-center">
				<h1 className="text-2xl">{formattedTurnCountdown}</h1>
				<p className="mt-3 text-xs text-white/80">
					{isDraftCompleted
						? "Draft completed"
						: `Step ${draftStep + 1}/${draftSequenceLength}: ${currentAction?.side.toUpperCase()} ${currentAction?.type.toUpperCase()}`}
				</p>
			</div>

			<div className="flex flex-col gap-2 w-full">
				<Button
					onClick={onSubmit}
					disabled={isButtonDisabled}
					className={
						isDraftCompleted
							? "w-full border shadow-[0_0_10px_rgba(255,255,255,0.2)]"
							: "w-full"
					}
					variant={isDraftCompleted ? "secondary" : "default"}
				>
					{isSubmittingTurnAction
						? "Submitting..."
						: isDraftCompleted
							? "Complete Session"
							: "Confirm"}
				</Button>
			</div>
		</div>
	);
}
