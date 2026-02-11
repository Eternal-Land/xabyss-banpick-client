import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableCell } from "../ui/table";
import { Input } from "../ui/input";
import type { WeaponCostResponseItem } from "@/apis/weapon-costs/types";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { useWeaponCostUnitOptions } from "@/hooks/use-weapon-cost-unit-label";
import { type WeaponCostUnitEnum } from "@/lib/constants";
import { getTranslationToken } from "@/i18n/namespaces";
import { weaponCostsLocaleKeys } from "@/i18n/keys";

export interface WeaponCostInputCellProps {
	data: WeaponCostResponseItem;
	onDataChange: (data: WeaponCostResponseItem) => void;
}

function WeaponCostInputCell({ data, onDataChange }: WeaponCostInputCellProps) {
	const [localInputValue, setLocalInputValue] = useState<string>(
		String(data.value),
	);
	const [localSelectValue, setLocalSelectValue] = useState<string>(
		String(data.unit),
	);
	const [dirty, setDirty] = useState(false);
	const options = useWeaponCostUnitOptions();
	const { t } = useTranslation();

	useEffect(() => {
		setLocalInputValue(String(data.value));
		setLocalSelectValue(String(data.unit));
		setDirty(false);
	}, [data]);

	const handleBlur = () => {
		if (!dirty) {
			return;
		}

		onDataChange({
			...data,
			value: Number(localInputValue) || 0,
		});
	};

	return (
		<TableCell>
			<div className="flex gap-1">
				<Input
					value={localInputValue}
					min={0}
					inputMode="decimal"
					className="w-15"
					onChange={(event) => {
						setLocalInputValue(event.target.value);
						setDirty(true);
					}}
					onBlur={handleBlur}
				/>

				<Select
					value={localSelectValue}
					onValueChange={(v) => {
						setLocalSelectValue(v);
						onDataChange({
							...data,
							unit: Number(v) as WeaponCostUnitEnum,
						});
					}}
				>
					<SelectTrigger>
						<SelectValue
							placeholder={t(
								getTranslationToken(
									"weapon-costs",
									weaponCostsLocaleKeys.weapon_costs_unit_placeholder,
								),
							)}
						/>
					</SelectTrigger>

					<SelectContent>
						<SelectGroup>
							{options.map((option) => (
								<SelectItem key={option.value} value={String(option.value)}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</TableCell>
	);
}

export default memo(WeaponCostInputCell);
