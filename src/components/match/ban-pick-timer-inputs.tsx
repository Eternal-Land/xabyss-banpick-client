import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { matchLocaleKeys } from "@/i18n/keys";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export interface BanPickTimerInputValues {
	chamber1: string;
	chamber2: string;
	chamber3: string;
	reset: string;
}

export interface BanPickTimerInputsProps {
	isRealtimeMatch: boolean;
	side: "blue" | "red";
	values?: BanPickTimerInputValues;
	onValuesChange?: (
		side: "blue" | "red",
		values: BanPickTimerInputValues,
	) => void;
}

export default function BanPickTimerInputs({
	isRealtimeMatch,
	side,
	values,
	onValuesChange,
}: BanPickTimerInputsProps) {
	const { t } = useTranslation("match");
	const resolvedValues = useMemo<BanPickTimerInputValues>(
		() =>
			values ?? {
				chamber1: "",
				chamber2: "",
				chamber3: "",
				reset: "",
			},
		[values],
	);

	const updateField = (field: keyof BanPickTimerInputValues, value: string) => {
		if (!onValuesChange) {
			return;
		}

		onValuesChange(side, {
			...resolvedValues,
			[field]: value,
		});
	};

	if (isRealtimeMatch) {
		return (
			<Field>
				<FieldLabel>{t(matchLocaleKeys.ban_pick_timer_time)}</FieldLabel>
				<Input
					value={resolvedValues.chamber1}
					onChange={(event) => updateField("chamber1", event.target.value)}
					placeholder="00:00"
				/>
			</Field>
		);
	}

	return (
		<>
			<Field>
				<FieldLabel>{t(matchLocaleKeys.ban_pick_timer_chamber_1)}</FieldLabel>
				<Input
					value={resolvedValues.chamber1}
					onChange={(event) => updateField("chamber1", event.target.value)}
					placeholder="00:00"
				/>
			</Field>
			<Field>
				<FieldLabel>{t(matchLocaleKeys.ban_pick_timer_chamber_2)}</FieldLabel>
				<Input
					value={resolvedValues.chamber2}
					onChange={(event) => updateField("chamber2", event.target.value)}
					placeholder="00:00"
				/>
			</Field>
			<Field>
				<FieldLabel>{t(matchLocaleKeys.ban_pick_timer_chamber_3)}</FieldLabel>
				<Input
					value={resolvedValues.chamber3}
					onChange={(event) => updateField("chamber3", event.target.value)}
					placeholder="00:00"
				/>
			</Field>
			<Field>
				<FieldLabel>{t(matchLocaleKeys.ban_pick_timer_reset)}</FieldLabel>
				<Input
					value={resolvedValues.reset}
					onChange={(event) => updateField("reset", event.target.value)}
					placeholder="00"
				/>
			</Field>
		</>
	);
}
