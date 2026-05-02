import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PlusIcon, RefreshCcwIcon } from "lucide-react";
import { charactersApi } from "@/apis/characters";
import type { CharacterResponse } from "@/apis/characters/types";
import { characterWeaponsApi } from "@/apis/character-weapons";
import type {
	CharacterWeaponResponse,
	CreateCharacterWeaponInput,
} from "@/apis/character-weapons/types";
import { weaponApis } from "@/apis/weapons";
import type { WeaponResponse } from "@/apis/weapons/types";
import type { BaseApiResponse } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import SearchSelect from "@/components/search-select";
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
import { useForm, useWatch } from "react-hook-form";
import { characterWeaponFormSchema } from "@/apis/character-weapons/types";
import z from "zod";

async function listAllCharacters() {
	const characters: CharacterResponse[] = [];
	let page = 1;
	let totalPage = 1;

	do {
		const response = await charactersApi.listCharacters({
			page,
			take: 100,
			showInactive: true,
		});
		characters.push(...(response.data ?? []));
		totalPage = response.pagination?.totalPage ?? 1;
		page += 1;
	} while (page <= totalPage);

	return characters;
}

async function listAllWeapons() {
	const weapons: WeaponResponse[] = [];
	let page = 1;
	let totalPage = 1;

	do {
		const response = await weaponApis.listWeapons({
			page,
			take: 100,
			showInactive: true,
		});
		weapons.push(...(response.data ?? []));
		totalPage = response.pagination?.totalPage ?? 1;
		page += 1;
	} while (page <= totalPage);

	return weapons;
}

export const Route = createFileRoute("/admin/character-weapons/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { t } = useTranslation();
	const [editingTarget, setEditingTarget] =
		useState<CharacterWeaponResponse | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const listQuery = useQuery({
		queryKey: ["characterWeapons"],
		queryFn: characterWeaponsApi.listCharacterWeapons,
	});

	const charactersQuery = useQuery({
		queryKey: ["adminCharacterWeaponsCharacters"],
		queryFn: listAllCharacters,
	});

	const weaponsQuery = useQuery({
		queryKey: ["adminCharacterWeaponsWeapons"],
		queryFn: listAllWeapons,
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
	const isGeneric = useWatch({
		control: form.control,
		name: "isGeneric",
	});
	const characterKey = useWatch({
		control: form.control,
		name: "characterKey",
	});
	const weaponKey = useWatch({
		control: form.control,
		name: "weaponKey",
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
				setIsDialogOpen(false);
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
				setIsDialogOpen(false);
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
				setIsDialogOpen(false);
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

	const items = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
	const characterOptions = useMemo(
		() =>
			(charactersQuery.data ?? []).map((character) => ({
				value: character.key,
				label: character.name,
			})),
		[charactersQuery.data],
	);
	const weaponOptions = useMemo(
		() =>
			(weaponsQuery.data ?? []).map((weapon) => ({
				value: weapon.key,
				label: weapon.name,
			})),
		[weaponsQuery.data],
	);
	const characterMap = useMemo(() => {
		return new Map(
			(charactersQuery.data ?? []).map((character) => [character.key, character]),
		);
	}, [charactersQuery.data]);
	const weaponMap = useMemo(() => {
		return new Map(
			(weaponsQuery.data ?? []).map((weapon) => [weapon.key, weapon]),
		);
	}, [weaponsQuery.data]);
	const isMutating =
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending;

	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => b.id - a.id);
	}, [items]);

	const resetForm = () => {
		form.reset({
			characterKey: "",
			weaponKey: "",
			constellationCondition: "",
			isGeneric: false,
		});
	};

	const openCreateDialog = () => {
		setEditingTarget(null);
		resetForm();
		setIsDialogOpen(true);
	};

	const handleEdit = (item: CharacterWeaponResponse) => {
		setEditingTarget(item);
		form.reset({
			characterKey: item.characterKey || "",
			weaponKey: item.weaponKey,
			constellationCondition: item.constellationCondition ?? "",
			isGeneric: item.characterId === null,
		});
		setIsDialogOpen(true);
	};

	const clearForm = () => {
		setEditingTarget(null);
		resetForm();
		setIsDialogOpen(false);
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

	const getInitials = (name: string) =>
		name
			.split(" ")
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join("");

	const renderEntity = (
		name: string,
		avatarUrl: string | undefined,
		fallbackLabel: string,
		secondaryLabel?: string,
	) => (
		<div className="flex min-w-0 items-center gap-3">
			<Avatar className="size-10">
				<AvatarImage src={avatarUrl} alt={name} />
				<AvatarFallback>{getInitials(name || fallbackLabel)}</AvatarFallback>
			</Avatar>
			<div className="min-w-0">
				<div className="truncate font-medium">{name || fallbackLabel}</div>
				{secondaryLabel ? (
					<div className="truncate text-sm text-muted-foreground">
						{secondaryLabel}
					</div>
				) : null}
			</div>
		</div>
	);

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
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={openCreateDialog}
								className="gap-2"
							>
								<PlusIcon className="size-4" />
								{t(
									getTranslationToken(
										"character-weapons",
										characterWeaponsLocaleKeys.character_weapons_create,
									),
								)}
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									void Promise.all([
										listQuery.refetch(),
										charactersQuery.refetch(),
										weaponsQuery.refetch(),
									]);
								}}
								disabled={
									listQuery.isFetching ||
									charactersQuery.isFetching ||
									weaponsQuery.isFetching
								}
							>
								<RefreshCcwIcon className="size-4" />
							</Button>
						</div>
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
					<Dialog
						open={isDialogOpen}
						onOpenChange={(open) => {
							setIsDialogOpen(open);
							if (!open) {
								setEditingTarget(null);
								resetForm();
							}
						}}
					>
						<DialogContent className="sm:max-w-2xl" onOpenAutoFocus={(event) => event.preventDefault()}>
							<DialogHeader>
								<DialogTitle>
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
								</DialogTitle>
								<DialogDescription>
									{t(
										getTranslationToken(
											"character-weapons",
											characterWeaponsLocaleKeys.character_weapons_description,
										),
									)}
								</DialogDescription>
							</DialogHeader>

							<form className="grid gap-8 md:grid-cols-2" onSubmit={onSubmit}>
								<div className="md:col-span-2 flex items-center gap-2">
									<Checkbox
										id="isGeneric"
										checked={isGeneric}
										onCheckedChange={(checked) => {
											form.setValue("isGeneric", checked === true);
											if (checked === true) {
												form.setValue("characterKey", "");
											}
										}}
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

								<div className="space-y-2">
									<Label htmlFor="characterKey">
										{t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_character_key,
											),
										)}
									</Label>
									<SearchSelect
										value={characterKey || undefined}
										onValueChange={(value) => form.setValue("characterKey", value)}
										options={characterOptions}
										placeholder={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_character_key_placeholder,
											),
										)}
										searchPlaceholder={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_character_key_placeholder,
											),
										)}
										emptyText={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_none,
											),
										)}
										ariaLabel={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_character_key,
											),
										)}
										disabled={isGeneric}
										className="w-full"
										triggerClassName="w-full"
										contentClassName="w-full"
									/>
									{!isGeneric && characterMap.get(characterKey || "") ? (
										<div className="rounded-md border bg-muted/40 p-3">
											{renderEntity(
												characterMap.get(characterKey || "")?.name ?? "",
												characterMap.get(characterKey || "")?.iconUrl,
												characterKey || "",
												characterKey || "",
											)}
										</div>
									) : null}
								</div>

								<div className="space-y-2">
									<Label htmlFor="weaponKey">
										{t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_weapon_key,
											),
										)}
									</Label>
									<SearchSelect
										value={weaponKey || undefined}
										onValueChange={(value) => form.setValue("weaponKey", value)}
										options={weaponOptions}
										placeholder={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_weapon_key_placeholder,
											),
										)}
										searchPlaceholder={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_weapon_key_placeholder,
											),
										)}
										emptyText={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_none,
											),
										)}
										ariaLabel={t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_weapon_key,
											),
										)}
										className="w-full"
										triggerClassName="w-full"
										contentClassName="w-full"
									/>
									{weaponMap.get(weaponKey || "") ? (
										<div className="rounded-md border bg-muted/40 p-3">
											{renderEntity(
												weaponMap.get(weaponKey || "")?.name ?? "",
												weaponMap.get(weaponKey || "")?.iconUrl,
												weaponKey || "",
												weaponKey || "",
											)}
										</div>
									) : null}
								</div>

								<div className="space-y-2">
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

								<div className="md:col-span-2 flex items-end justify-end gap-2">
									<p className="text-xs text-muted-foreground italic">
										{t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_weapon_refinement_note,
											),
										)}
									</p>
								</div>



								<div className="md:col-span-2 flex items-end justify-end gap-2">
									<Button type="button" variant="outline" onClick={clearForm} disabled={isMutating}>
										{t(
											getTranslationToken(
												"character-weapons",
												characterWeaponsLocaleKeys.character_weapons_cancel,
											),
										)}
									</Button>
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
									</div>
							</form>
						</DialogContent>
					</Dialog>

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
												{item.characterId === null
													? renderEntity(
															item.characterName ?? "",
															undefined,
															t(
																getTranslationToken(
																	"character-weapons",
																	characterWeaponsLocaleKeys.character_weapons_none,
																),
															),
													  )
													: (() => {
														const character =
															characterMap.get(item.characterKey ?? "") ?? undefined;
														const characterName =
															character?.name ?? item.characterName ?? item.characterKey ?? "";
														return renderEntity(
															characterName,
															character?.iconUrl,
															item.characterKey ?? characterName,
															item.characterKey,
														);
													})()}
											</TableCell>
											<TableCell>
												{(() => {
													const weapon = weaponMap.get(item.weaponKey) ?? undefined;
													const weaponName =
														weapon?.name ?? item.weaponName ?? item.weaponKey;
													return renderEntity(
														weaponName,
														weapon?.iconUrl,
														item.weaponKey,
														item.weaponKey,
													);
												})()}
											</TableCell>
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
