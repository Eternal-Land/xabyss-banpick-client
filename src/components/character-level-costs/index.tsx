import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusIcon, SaveIcon, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { charactersApi } from "@/apis/characters";
import type { CharacterResponse } from "@/apis/characters/types";
import { characterLevelCostsApi } from "@/apis/character-level-costs";
import type {
	CharacterLevelCostResponse,
	CreateCharacterLevelCostInput,
	UpdateCharacterLevelCostInput,
} from "@/apis/character-level-costs/types";
import { characterCostsLocaleKeys, commonLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";
import type { BaseApiResponse } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";
import { Empty } from "../ui/empty";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import TablePagination from "../ui/table-pagination";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { useDebounce } from "@/hooks/use-debounce";

export default function CharacterLevelCostsTab() {
	const COST_MIN = 0;
	const COST_MAX = 99;
	const { t } = useTranslation();
	const [page, setPage] = useState(1);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
	const [levelFilter, setLevelFilter] = useState<"all" | "95" | "100">("all");
	const take = 20;
	const [creating, setCreating] = useState<CreateCharacterLevelCostInput>({
		characterId: 0,
		level: 95,
		cost: 0,
	});
	const [editingCosts, setEditingCosts] = useState<Record<number, number>>({});

	const listQuery = useQuery({
		queryKey: ["listCharacterLevelCosts", page, take, searchFilter, levelFilter],
		queryFn: () =>
			characterLevelCostsApi.listCharacterLevelCosts({
				page,
				take,
				search: searchFilter,
				level: levelFilter === "all" ? undefined : [Number(levelFilter)],
			}),
	});

	const charactersQuery = useQuery({
		queryKey: ["listCharactersForCharacterLevelCosts"],
		queryFn: async () => {
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
		},
	});

	const createOptionsSourceQuery = useQuery({
		queryKey: ["listAllCharacterLevelCostsForCreateFilter"],
		queryFn: async () => {
			const allCharacterIds = new Set<number>();
			let currentPage = 1;
			let totalPage = 1;

			do {
				const response = await characterLevelCostsApi.listCharacterLevelCosts({
					page: currentPage,
					take: 200,
				});

				for (const item of response.data ?? []) {
					allCharacterIds.add(item.characterId);
				}

				totalPage = response.pagination?.totalPage ?? 1;
				currentPage += 1;
			} while (currentPage <= totalPage);

			return allCharacterIds;
		},
	});

	const createMutation = useMutation<
		BaseApiResponse<CharacterLevelCostResponse>,
		AxiosError<BaseApiResponse>,
		CreateCharacterLevelCostInput
	>({
		mutationFn: (input) => characterLevelCostsApi.createCharacterLevelCost(input),
		onSuccess: () => {
			setIsCreateDialogOpen(false);
			toast.success(
				t(
					getTranslationToken(
						"character-costs",
						characterCostsLocaleKeys.character_level_costs_create_success,
					),
				),
			);
			listQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error.response?.data.message ||
					t(
						getTranslationToken(
							"character-costs",
							characterCostsLocaleKeys.character_level_costs_create_error,
						),
					),
			);
		},
	});

	const updateMutation = useMutation<
		BaseApiResponse<CharacterLevelCostResponse>,
		AxiosError<BaseApiResponse>,
		{ id: number; input: UpdateCharacterLevelCostInput }
	>({
		mutationFn: ({ id, input }) =>
			characterLevelCostsApi.updateCharacterLevelCost(id, input),
		onSuccess: (_, variables) => {
			toast.success(
				t(
					getTranslationToken(
						"character-costs",
						characterCostsLocaleKeys.character_level_costs_update_success,
					),
				),
			);
			setEditingCosts((prev) => {
				const next = { ...prev };
				delete next[variables.id];
				return next;
			});
			listQuery.refetch();
		},
		onError: (error) => {
			toast.error(
				error.response?.data.message ||
					t(
						getTranslationToken(
							"character-costs",
							characterCostsLocaleKeys.character_level_costs_update_error,
						),
					),
			);
		},
	});

	const rows = listQuery.data?.data ?? [];
	const pagination = listQuery.data?.pagination;
	const characterOptions = charactersQuery.data ?? [];
	const availableCharacterOptions = useMemo(() => {
		const existingCharacterIds = createOptionsSourceQuery.data ?? new Set<number>();
		return characterOptions.filter(
			(character) => !existingCharacterIds.has(character.id),
		);
	}, [characterOptions, createOptionsSourceQuery.data]);
	const characterMap = useMemo(() => {
		const map = new Map<number, CharacterResponse>();
		for (const character of charactersQuery.data ?? []) {
			map.set(character.id, character);
		}
		return map;
	}, [charactersQuery.data]);

	const groupedRows = useMemo(() => {
		const groups = new Map<number, CharacterLevelCostResponse[]>();

		for (const row of rows) {
			const existed = groups.get(row.characterId);
			if (existed) {
				existed.push(row);
			} else {
				groups.set(row.characterId, [row]);
			}
		}

		return Array.from(groups.entries())
			.sort((a, b) => a[0] - b[0])
			.map(([characterId, costs]) => ({
				characterId,
				character: characterMap.get(characterId),
				costs: costs.sort((a, b) => a.level - b.level),
			}));
	}, [rows, characterMap]);
	const targetLevels = [95, 100] as const;
	const isBusy = createMutation.isPending || updateMutation.isPending;

	const clampCostValue = (value: number) => {
		if (!Number.isFinite(value)) {
			return COST_MIN;
		}

		if (value < COST_MIN) {
			return COST_MIN;
		}

		if (value > COST_MAX) {
			return COST_MAX;
		}

		return value;
	};

	const getInitials = (name?: string) => {
		if (!name) {
			return "?";
		}
		return name
			.trim()
			.split(" ")
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase())
			.slice(0, 2)
			.join("");
	};

	const handleCreate = () => {
		if (!creating.characterId) {
			return;
		}
		createMutation.mutate({
			...creating,
			cost: clampCostValue(creating.cost),
		});
	};

	const handleOpenCreateDialog = () => {
		setIsCreateDialogOpen(true);
	};

	const handleEditCostChange = (id: number, value: number) => {
		setEditingCosts((prev) => ({
			...prev,
			[id]: clampCostValue(value),
		}));
	};

	const handleSave = (row: CharacterLevelCostResponse) => {
		const nextValue = editingCosts[row.id];
		if (nextValue === undefined || Number(nextValue) === Number(row.cost)) {
			return;
		}
		updateMutation.mutate({
			id: row.id,
			input: {
				characterId: row.characterId,
				level: row.level,
				cost: clampCostValue(Number(nextValue)),
			},
		});
	};

	const handlePageChange = (nextPage: number) => {
		setPage(nextPage);
	};

	const triggerSearchDebounce = useDebounce((value: string) => {
		setPage(1);
		setSearchFilter(value || undefined);
	}, 400);

	const handleSearchChange = (value: string) => {
		setSearch(value);
		triggerSearchDebounce(value);
	};

	const handleLevelFilterChange = (value: "all" | "95" | "100") => {
		setLevelFilter(value);
		setPage(1);
	};

	const getCostRowByLevel = (
		group: { costs: CharacterLevelCostResponse[] },
		level: (typeof targetLevels)[number],
	) => group.costs.find((item) => item.level === level);

	useEffect(() => {
		if (!creating.characterId && availableCharacterOptions.length > 0) {
			setCreating((prev) => ({
				...prev,
				characterId: availableCharacterOptions[0].id,
			}));
		}
	}, [availableCharacterOptions, creating.characterId]);

	useEffect(() => {
		if (
			creating.characterId &&
			availableCharacterOptions.length > 0 &&
			!availableCharacterOptions.some(
				(character) => character.id === creating.characterId,
			)
		) {
			setCreating((prev) => ({
				...prev,
				characterId: availableCharacterOptions[0].id,
			}));
		}
	}, [availableCharacterOptions, creating.characterId]);

	useEffect(() => {
		const totalPage = pagination?.totalPage;
		if (!totalPage) {
			return;
		}

		if (page > totalPage) {
			setPage(totalPage);
		}
	}, [pagination?.totalPage, page]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4">
				<h1>
					{t(
						getTranslationToken(
							"character-costs",
							characterCostsLocaleKeys.character_level_costs_title,
						),
					)}
				</h1>
				<Button onClick={handleOpenCreateDialog} disabled={isBusy}>
					<PlusIcon className="size-4" />
					{t(
						getTranslationToken(
							"character-costs",
							characterCostsLocaleKeys.character_level_costs_add,
						),
					)}
				</Button>
			</div>

			<div className="flex flex-col gap-3 md:flex-row md:items-center">
				<InputGroup className="w-full md:max-w-sm">
					<InputGroupInput
						value={search}
						onChange={(event) => handleSearchChange(event.target.value)}
						placeholder={t(
							getTranslationToken("common", commonLocaleKeys.search_placeholder),
						)}
					/>
					<InputGroupAddon>
						<Search className="size-4" />
					</InputGroupAddon>
				</InputGroup>

				<Select value={levelFilter} onValueChange={handleLevelFilterChange}>
					<SelectTrigger className="w-full md:w-56">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							{`${t(getTranslationToken("common", commonLocaleKeys.level))}: All`}
						</SelectItem>
						<SelectItem value="95">Level 95</SelectItem>
						<SelectItem value="100">Level 100</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-center">
							{t(
								getTranslationToken(
									"character-costs",
									characterCostsLocaleKeys.character_costs_table_character,
								),
							)}
						</TableHead>
						<TableHead className="text-center w-56">Cost Lv. 95</TableHead>
						<TableHead className="text-center w-56">Cost Lv. 100</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{listQuery.isLoading
						? Array.from({ length: 8 }).map((_, index) => (
								<TableRow key={`character-level-cost-skeleton-${index}`}>
									<TableCell className="text-center">
										<div className="flex items-center gap-3">
											<Skeleton className="h-10 w-10 rounded-full" />
											<Skeleton className="h-4 w-28" />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex justify-center gap-2 items-center">
											<Skeleton className="h-8 w-32" />
											<Skeleton className="h-8 w-8" />
										</div>
									</TableCell>
									<TableCell>
										<div className="flex justify-center gap-2 items-center">
											<Skeleton className="h-8 w-32" />
											<Skeleton className="h-8 w-8" />
										</div>
									</TableCell>
								</TableRow>
							))
						: groupedRows.map((group) => (
								<TableRow key={group.characterId}>
									<TableCell className="font-medium align-top">
										<div className="flex items-center gap-3">
											<Avatar size="lg">
												<AvatarImage src={group.character?.iconUrl} />
												<AvatarFallback>
													{getInitials(group.character?.name)}
												</AvatarFallback>
											</Avatar>
											<span>{group.character?.name ?? "-"}</span>
										</div>
									</TableCell>
									{targetLevels.map((level) => {
										const levelRow = getCostRowByLevel(group, level);

										if (!levelRow) {
											return (
												<TableCell key={`${group.characterId}-${level}`} className="text-center text-muted-foreground">
													-
												</TableCell>
											);
										}

										return (
											<TableCell key={levelRow.id}>
												<div className="flex items-center justify-center gap-2">
													<Input
														type="number"
														min={COST_MIN}
														max={COST_MAX}
														step="0.01"
														className="w-24"
														value={editingCosts[levelRow.id] ?? levelRow.cost}
														onChange={(event) =>
															handleEditCostChange(levelRow.id, Number(event.target.value))
														}
													/>
													<Button
														size="icon-sm"
														onClick={() => handleSave(levelRow)}
														disabled={isBusy}
													>
														<SaveIcon className="size-3" />
													</Button>
												</div>
											</TableCell>
										);
									})}
								</TableRow>
							))}
					{!listQuery.isLoading && groupedRows.length === 0 && (
						<TableRow>
							<TableCell colSpan={3}>
								<Empty>
									{t(
										getTranslationToken(
											"character-costs",
											characterCostsLocaleKeys.character_level_costs_empty,
										),
									)}
								</Empty>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{(pagination || listQuery.isLoading) && (
				<TablePagination
					page={page}
					pagination={pagination}
					isLoading={listQuery.isLoading || listQuery.isFetching}
					onPageChange={handlePageChange}
					className="w-full"
				/>
			)}

			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{t(
								getTranslationToken(
									"character-costs",
									characterCostsLocaleKeys.character_level_costs_add,
								),
							)}
						</DialogTitle>
						<DialogDescription>
							{t(
								getTranslationToken(
									"character-costs",
									characterCostsLocaleKeys.character_level_costs_title,
								),
							)}
						</DialogDescription>
					</DialogHeader>

					<FieldGroup>
						<Field>
							<FieldLabel>
								{t(
									getTranslationToken(
										"character-costs",
										characterCostsLocaleKeys.character_costs_table_character,
									),
								)}
							</FieldLabel>
							<Select
								value={
									creating.characterId
										? creating.characterId.toString()
										: undefined
								}
								onValueChange={(value) =>
									setCreating((prev) => ({
										...prev,
										characterId: Number(value),
									}))
								}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											getTranslationToken(
												"character-costs",
												characterCostsLocaleKeys.character_costs_table_character,
											),
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{availableCharacterOptions.map((character) => (
										<SelectItem
											key={character.id}
											value={character.id.toString()}
										>
											{character.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel>
								{t(
									getTranslationToken(
										"character-costs",
										characterCostsLocaleKeys.character_level_costs_table_level,
									),
								)}
							</FieldLabel>
							<Select
								value={creating.level.toString()}
								onValueChange={(value) =>
									setCreating((prev) => ({
										...prev,
										level: Number(value),
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="95">95</SelectItem>
									<SelectItem value="100">100</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel>
								{t(
									getTranslationToken(
										"character-costs",
										characterCostsLocaleKeys.character_level_costs_table_cost,
									),
								)}
							</FieldLabel>
							<Input
								type="number"
								min={COST_MIN}
								max={COST_MAX}
								step="0.01"
								value={creating.cost}
								onChange={(event) =>
									setCreating((prev) => ({
										...prev,
										cost: clampCostValue(Number(event.target.value)),
									}))
								}
								placeholder={t(
									getTranslationToken(
										"character-costs",
										characterCostsLocaleKeys.character_level_costs_table_cost,
									),
								)}
							/>
						</Field>
					</FieldGroup>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsCreateDialogOpen(false)}
							disabled={isBusy}
						>
							{t(getTranslationToken("common", commonLocaleKeys.cancel))}
						</Button>
						<Button
							onClick={handleCreate}
							disabled={
								isBusy ||
								!creating.characterId ||
								availableCharacterOptions.length === 0
							}
						>
							{t(
								getTranslationToken(
									"character-costs",
									characterCostsLocaleKeys.character_level_costs_add,
								),
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
