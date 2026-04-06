import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface BanPickTimerSideValues {
	chamber1: number;
	chamber2: number;
	chamber3: number;
	resetTimes: number;
}

export interface BanPickTimerInputsProps {
	isRealtimeMatch: boolean;
	side: "blue" | "red";
	onValuesChange?: (
		side: "blue" | "red",
		values: BanPickTimerSideValues,
	) => void;
}

const parseClockToSeconds = (value: string) => {
	const normalized = value.trim();
	if (!normalized) {
		return 0;
	}

	if (!normalized.includes(":")) {
		const rawSeconds = Number(normalized);
		return Number.isFinite(rawSeconds) && rawSeconds > 0
			? Math.floor(rawSeconds)
			: 0;
	}

	const [rawMinutes, rawSeconds] = normalized.split(":");
	const minutes = Number(rawMinutes);
	const seconds = Number(rawSeconds);

	if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
		return 0;
	}

	const normalizedMinutes = Math.max(0, Math.floor(minutes));
	const normalizedSeconds = Math.max(0, Math.floor(seconds));
	return normalizedMinutes * 60 + normalizedSeconds;
};

const parseNonNegativeInt = (value: string) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return 0;
	}

	return Math.floor(parsed);
};

export default function BanPickTimerInputs({
	isRealtimeMatch,
	side,
	onValuesChange,
}: BanPickTimerInputsProps) {
	const [chamber1Input, setChamber1Input] = useState("");
	const [chamber2Input, setChamber2Input] = useState("");
	const [chamber3Input, setChamber3Input] = useState("");
	const [resetInput, setResetInput] = useState("");

	useEffect(() => {
		if (!onValuesChange) {
			return;
		}

		onValuesChange(side, {
			chamber1: parseClockToSeconds(chamber1Input),
			chamber2: parseClockToSeconds(chamber2Input),
			chamber3: parseClockToSeconds(chamber3Input),
			resetTimes: parseNonNegativeInt(resetInput),
		});
	}, [
		chamber1Input,
		chamber2Input,
		chamber3Input,
		resetInput,
		side,
		onValuesChange,
	]);

	if (isRealtimeMatch) {
		return (
			<Field>
				<FieldLabel>Time</FieldLabel>
				<Input value={chamber1Input} onChange={(event) => setChamber1Input(event.target.value)} placeholder="00:00" />
			</Field>
		);
	}

	return (
		<>
			<Field>
				<FieldLabel>Chamber 1</FieldLabel>
				<Input value={chamber1Input} onChange={(event) => setChamber1Input(event.target.value)} placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Chamber 2</FieldLabel>
				<Input value={chamber2Input} onChange={(event) => setChamber2Input(event.target.value)} placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Chamber 3</FieldLabel>
				<Input value={chamber3Input} onChange={(event) => setChamber3Input(event.target.value)} placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Reset</FieldLabel>
				<Input value={resetInput} onChange={(event) => setResetInput(event.target.value)} placeholder="00" />
			</Field>
		</>
	);
}
