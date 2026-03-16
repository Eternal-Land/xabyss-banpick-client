import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface BanPickTimerInputsProps {
	isRealtimeMatch: boolean;
}

export default function BanPickTimerInputs({
	isRealtimeMatch,
}: BanPickTimerInputsProps) {
	if (isRealtimeMatch) {
		return (
			<Field>
				<FieldLabel>Time</FieldLabel>
				<Input placeholder="00:00" />
			</Field>
		);
	}

	return (
		<>
			<Field>
				<FieldLabel>Chamber 1</FieldLabel>
				<Input placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Chamber 2</FieldLabel>
				<Input placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Chamber 3</FieldLabel>
				<Input placeholder="00:00" />
			</Field>
			<Field>
				<FieldLabel>Reset</FieldLabel>
				<Input placeholder="00" />
			</Field>
		</>
	);
}
