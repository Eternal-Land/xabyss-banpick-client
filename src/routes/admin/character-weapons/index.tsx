import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { RefreshCcwIcon } from "lucide-react";
import { characterWeaponsApi } from "@/apis/character-weapons";
import type {
	CharacterWeaponResponse,
	CreateCharacterWeaponInput,
} from "@/apis/character-weapons/types";
import type { BaseApiResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { getTranslationToken } from "@/i18n/namespaces";
import { characterWeaponsLocaleKeys } from "@/i18n/keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { characterWeaponFormSchema } from "@/apis/character-weapons/types";
import z from "zod";

export const Route = createFileRoute("/admin/character-weapons/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const [editingTarget, setEditingTarget] =
		useState<CharacterWeaponResponse | null>(null);

	const listQuery = useQuery({
		queryKey: ["characterWeapons"],
		queryFn: characterWeaponsApi.listCharacterWeapons,
	});

	type CharacterWeaponFormSchema = z.input<typeof characterWeaponFormSchema>;
	const form = useForm<CharacterWeaponFormSchema>({
		resolver: zodResolver(characterWeaponFormSchema),
		defaultValues: {
			characterKey: "",
			weaponKey: "",
			constellationCondition: "",
			isGeneric: false,
		},
	});

	const createMutation = useMutation<
		BaseApiResponse<CharacterWeaponResponse>,
		AxiosError<BaseApiResponse>,
		CreateCharacterWeaponInput
	>({
		mutationFn: (payload) => characterWeaponsApi.createCharacterWeapon(payload),
		onSuccess: () => {
			toast.success(
				t(
					getTranslationToken(
						"character-weapons",
						characterWeaponsLocaleKeys.character_weapons_create_success,
					),
				),
			);
			setEditingTarget(null);
			form.reset({
				characterKey: "",
				weaponKey: "",
				constellationCondition: "",
				isGeneric: false,
			});
			listQuery.refetch();
		},
		onError: (mutationError) => {
			toast.error(
				mutationError.response?.data.message ||
					t(
						getTranslationToken(
							"character-weapons",
							characterWeaponsLocaleKeys.character_weapons_save_error,
						),
					),
			);
		},
	});

	const updateMutation = useMutation<
		BaseApiResponse<CharacterWeaponResponse>,
		AxiosError<BaseApiResponse>,
		{ id: number; payload: CreateCharacterWeaponInput }
	>({
		mutationFn: ({ id, payload }) =>
			characterWeaponsApi.updateCharacterWeapon(id, payload),
		onSuccess: () => {
			toast.success(
				t(
					getTranslationToken(
						"character-weapons",
						characterWeaponsLocaleKeys.character_weapons_update_success,
					),
				),
			);
			setEditingTarget(null);
			form.reset({
				characterKey: "",
				weaponKey: "",
				constellationCondition: "",
				isGeneric: false,
			});
			listQuery.refetch();
		},
		onError: (mutationError) => {
			toast.error(
				mutationError.response?.data.message ||
					t(
						getTranslationToken(
							"character-weapons",
							characterWeaponsLocaleKeys.character_weapons_save_error,
						),
					),
			);
		},
	});

	const deleteMutation = useMutation<
		BaseApiResponse<CharacterWeaponResponse>,
		AxiosError<BaseApiResponse>,
		number
	>({
		mutationFn: (id) => characterWeaponsApi.deleteCharacterWeapon(id),
		onSuccess: () => {
			toast.success(
				t(
					getTranslationToken(
						"character-weapons",
						characterWeaponsLocaleKeys.character_weapons_delete_success,
					),
				),
			);
			if (editingTarget) {
				setEditingTarget(null);
				form.reset({
					characterKey: "",
					weaponKey: "",
					constellationCondition: "",
					isGeneric: false,
				});
			}
			listQuery.refetch();
		},
		onError: (mutationError) => {
			toast.error(
				mutationError.response?.data.message ||
					t(
						getTranslationToken(
							"character-weapons",
							characterWeaponsLocaleKeys.character_weapons_save_error,
						),
					),
			);
		},
	});

	const items = listQuery.data?.data ?? [];
	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => b.id - a.id);
	}, [items]);

	const handleEdit = (item: CharacterWeaponResponse) => {
		setEditingTarget(item);
		form.reset({
			characterKey: item.characterKey || "",
			weaponKey: item.weaponKey,
			constellationCondition: item.constellationCondition ?? "",
			isGeneric: item.characterId === null,
		});
	};

	const clearForm = () => {
		setEditingTarget(null);
		form.reset({
			characterKey: "",
			weaponKey: "",
			constellationCondition: "",
			isGeneric: false,
		});
	};

	const onSubmit = form.handleSubmit((values) => {
		const payload: CreateCharacterWeaponInput = {
			characterId: values.isGeneric
				? null
				: values.characterKey?.trim()
					? undefined
					: undefined,
			characterKey: values.isGeneric
				? undefined
				: values.characterKey?.trim() || undefined,
			weaponKey: values.weaponKey.trim(),
			constellationCondition:
				values.constellationCondition === "" ||
				values.constellationCondition === undefined
					? null
					: Number(values.constellationCondition),
		};

		if (!values.isGeneric && !payload.characterKey) {
			form.setError("characterKey", {
				type: "manual",
				message: t(
					getTranslationToken(
						"common",
						"validation_required",
					),
				),
			});
			return;
		}

		if (editingTarget) {
			updateMutation.mutate({ id: editingTarget.id, payload });
			return;
		}

		createMutation.mutate(payload);
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<div>
							<CardTitle>
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_title,
									),
								)}
							</CardTitle>
							<CardDescription>
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_description,
									),
								)}
							</CardDescription>
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => listQuery.refetch()}
							disabled={listQuery.isFetching}
						>
							<RefreshCcwIcon className="size-4" />
						</Button>
					</div>
					{listQuery.error ? (
						<p className="text-sm text-destructive">
							{t(
								getTranslationToken(
									"character-weapons",
									characterWeaponsLocaleKeys.character_weapons_load_error,
								),
							)}
						</p>
					) : null}
				</CardHeader>

				<CardContent className="space-y-6">
					<form className="grid gap-3 md:grid-cols-4" onSubmit={onSubmit}>
						<div className="md:col-span-4 flex items-center gap-2">
							<Checkbox
								id="isGeneric"
								checked={form.watch("isGeneric")}
								onCheckedChange={(checked) =>
									form.setValue("isGeneric", checked === true)
								}
							/>
							<Label htmlFor="isGeneric">
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_generic_toggle,
									),
								)}
							</Label>
						</div>

						<div>
							<Label htmlFor="characterKey">
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_character_key,
									),
								)}
							</Label>
							<Input
								id="characterKey"
								disabled={form.watch("isGeneric")}
								placeholder={t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_character_key_placeholder,
									),
								)}
								{...form.register("characterKey")}
							/>
						</div>

						<div>
							<Label htmlFor="weaponKey">
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_weapon_key,
									),
								)}
							</Label>
							<Input
								id="weaponKey"
								placeholder={t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_weapon_key_placeholder,
									),
								)}
								{...form.register("weaponKey")}
							/>
						</div>

						<div>
							<Label htmlFor="constellationCondition">
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_constellation,
									),
								)}
							</Label>
							<Input
								id="constellationCondition"
								type="number"
								placeholder={t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_constellation_placeholder,
									),
								)}
								{...form.register("constellationCondition")}
							/>
						</div>

						<div className="flex items-end gap-2">
							<Button type="submit" disabled={isMutating}>
								{editingTarget
									? t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_update,
											),
									  )
									: t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_create,
											),
									  )}
							</Button>
							{editingTarget ? (
								<Button
									type="button"
									variant="outline"
									onClick={clearForm}
									disabled={isMutating}
								>
									{t(
										getTranslationToken(
											"character-weapons",
											characterWeaponsLocaleKeys.character_weapons_cancel,
										),
									)}
								</Button>
							) : null}
						</div>
					</form>

					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">
							{t(
								getTranslationToken(
									"character-weapons",
									characterWeaponsLocaleKeys.character_weapons_count,
								),
								{ count: sortedItems.length },
							)}
						</div>
						<div className="max-w-full overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											{t(
												getTranslationToken(
													"character-weapons",
													characterWeaponsLocaleKeys.character_weapons_column_character,
												),
											)}
										</TableHead>
										<TableHead>
											{t(
												getTranslationToken(
													"character-weapons",
													characterWeaponsLocaleKeys.character_weapons_column_weapon,
												),
											)}
										</TableHead>
										<TableHead>
											{t(
												getTranslationToken(
													"character-weapons",
													characterWeaponsLocaleKeys.character_weapons_column_constellation,
												),
											)}
										</TableHead>
										<TableHead className="w-40">
											{t(
												getTranslationToken(
													"character-weapons",
													characterWeaponsLocaleKeys.character_weapons_column_actions,
												),
											)}
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sortedItems.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												{item.characterKey ||
													t(
														getTranslationToken(
															"character-weapons",
															characterWeaponsLocaleKeys.character_weapons_none,
														),
													)}
											</TableCell>
											<TableCell>{item.weaponKey}</TableCell>
											<TableCell>
												{item.constellationCondition ??
													t(
														getTranslationToken(
															"character-weapons",
															characterWeaponsLocaleKeys.character_weapons_none,
														),
													)}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => handleEdit(item)}
														disabled={isMutating}
													>
														{t(
															getTranslationToken(
																"character-weapons",
																characterWeaponsLocaleKeys.character_weapons_action_edit,
															),
														)}
													</Button>
													<Button
														type="button"
														variant="destructive"
														size="sm"
														onClick={() => deleteMutation.mutate(item.id)}
														disabled={isMutating}
													>
														{t(
															getTranslationToken(
																"character-weapons",
																characterWeaponsLocaleKeys.character_weapons_action_delete,
															),
														)}
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
