import { useTranslation } from "react-i18next";
import type { WeaponResponse } from "@/apis/weapons/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getTranslationToken } from "@/i18n/namespaces";
import { weaponsLocaleKeys } from "@/i18n/keys";

export interface WeaponToggleDialogProps {
	weapon: WeaponResponse | null;
	isPending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function WeaponToggleDialog({
	weapon,
	isPending,
	onConfirm,
	onCancel,
}: WeaponToggleDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog
			open={Boolean(weapon)}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{weapon?.isActive
							? t(
									getTranslationToken(
										"weapons",
										weaponsLocaleKeys.weapons_confirm_deactivate_title,
									),
								)
							: t(
									getTranslationToken(
										"weapons",
										weaponsLocaleKeys.weapons_confirm_activate_title,
									),
								)}
					</DialogTitle>
					<DialogDescription>
						{weapon?.isActive
							? t(
									getTranslationToken(
										"weapons",
										weaponsLocaleKeys.weapons_confirm_deactivate_desc,
									),
									{
										name: weapon.name,
									},
								)
							: t(
									getTranslationToken(
										"weapons",
										weaponsLocaleKeys.weapons_confirm_activate_desc,
									),
									{
										name: weapon?.name,
									},
								)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						{t(
							getTranslationToken("weapons", weaponsLocaleKeys.weapons_cancel),
						)}
					</Button>
					<Button
						type="button"
						variant={weapon?.isActive ? "destructive" : "secondary"}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"weapons",
										weaponsLocaleKeys.weapons_update_pending,
									),
								)
							: weapon?.isActive
								? t(
										getTranslationToken(
											"weapons",
											weaponsLocaleKeys.weapons_deactivate,
										),
									)
								: t(
										getTranslationToken(
											"weapons",
											weaponsLocaleKeys.weapons_activate,
										),
									)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
