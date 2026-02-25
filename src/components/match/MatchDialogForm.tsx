import z from "zod";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { commonLocaleKeys } from "@/i18n/keys";
import { Checkbox } from "../ui/checkbox";

const matchDialogFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	sessionCount: z.number().min(1, "Session count must be at least 1"),
	isParticipant: z.boolean().optional(),
});

export interface MatchDialogFormValues extends z.infer<
	typeof matchDialogFormSchema
> {}

export interface MatchDialogFormProps {
	mode: "create" | "update";
	values?: MatchDialogFormValues;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isLoading?: boolean;
	onSubmit?: (values: MatchDialogFormValues) => void;
}

const matchDialogFormId = "match-dialog-form";

export default function MatchDialogForm({
	mode,
	values,
	open,
	onOpenChange,
	isLoading,
	onSubmit,
}: MatchDialogFormProps) {
	const { t } = useTranslation();

	const form = useForm<MatchDialogFormValues>({
		resolver: zodResolver(matchDialogFormSchema),
		defaultValues: {
			name: values?.name || "New Match",
			sessionCount: values?.sessionCount || 1,
			isParticipant: values?.isParticipant || false,
		},
	});

	useEffect(() => {
		if (values) {
			form.reset(values);
		}
	}, [form, values]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "New Match" : "Update Match"}
					</DialogTitle>
				</DialogHeader>

				<form
					id={matchDialogFormId}
					onSubmit={form.handleSubmit((data) => onSubmit?.(data))}
				>
					<FieldGroup>
						<Controller
							name="name"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="match-name-input">Name</FieldLabel>
									<Input
										{...field}
										type="text"
										id="match-name-input"
										placeholder="Enter match name..."
										aria-invalid={fieldState.invalid}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<Controller
							name="sessionCount"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="match-session-count-input">
										Session Count
									</FieldLabel>
									<Input
										{...field}
										type="number"
										min={1}
										max={5}
										id="match-session-count-input"
										aria-invalid={fieldState.invalid}
										placeholder="Enter session count..."
										value={field.value}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						{mode === "create" && (
							<Controller
								name="isParticipant"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										orientation="horizontal"
									>
										<Checkbox
											id="is-participant-check"
											name={field.name}
											aria-invalid={fieldState.invalid}
											checked={field.value}
											onCheckedChange={(checked) => field.onChange(checked)}
										/>
										<FieldLabel htmlFor="is-participant-check">
											Join match as participant
										</FieldLabel>
									</Field>
								)}
							/>
						)}
					</FieldGroup>
				</form>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isLoading}
					>
						{t(commonLocaleKeys.cancel)}
					</Button>

					<Button type="submit" form={matchDialogFormId} disabled={isLoading}>
						{t(commonLocaleKeys.save)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
