import { memo, useEffect, useState } from "react";
import { TableCell } from "../ui/table";
import { Input } from "../ui/input";

export interface WeaponCostMilestoneInputCellProps {
	milestoneId: number;
	value: number;
	onCommit: (milestoneId: number, value: number) => void;
}

function WeaponCostMilestoneInputCell({
	milestoneId,
	value,
	onCommit,
}: WeaponCostMilestoneInputCellProps) {
	const [localValue, setLocalValue] = useState(String(value));

	useEffect(() => {
		setLocalValue(String(value));
	}, [value]);

	const handleBlur = () => {
		const trimmed = localValue.trim();
		const currentValue = value != null ? value : null;

		if (trimmed === "") {
			setLocalValue(currentValue != null ? String(currentValue) : "");
			return;
		}

		const parsed = Number(trimmed);
		if (Number.isNaN(parsed) || parsed < 0) {
			setLocalValue(currentValue != null ? String(currentValue) : "");
			return;
		}

		if (currentValue !== null && parsed === currentValue) {
			return;
		}

		onCommit(milestoneId, parsed);
	};

	return (
		<TableCell>
			<Input
				value={localValue}
				min={0}
				inputMode="decimal"
				className="w-15"
				onChange={(event) => setLocalValue(event.target.value)}
				onBlur={handleBlur}
			/>
		</TableCell>
	);
}

export default memo(WeaponCostMilestoneInputCell);
