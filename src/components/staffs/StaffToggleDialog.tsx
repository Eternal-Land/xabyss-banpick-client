import { useTranslation } from "react-i18next";
import type { StaffResponse } from "@/apis/staffs/types";
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
import { staffsLocaleKeys } from "@/i18n/keys";

export interface StaffToggleDialogProps {
	staff: StaffResponse | null;
	isPending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function StaffToggleDialog({
	staff,
	isPending,
	onConfirm,
	onCancel,
}: StaffToggleDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog
			open={Boolean(staff)}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{staff?.isActive
							? t(
									getTranslationToken(
										"staffs",
										staffsLocaleKeys.staffs_confirm_deactivate_title,
									),
								)
							: t(
									getTranslationToken(
										"staffs",
										staffsLocaleKeys.staffs_confirm_activate_title,
									),
								)}
					</DialogTitle>
					<DialogDescription>
						{staff?.isActive
							? t(
									getTranslationToken(
										"staffs",
										staffsLocaleKeys.staffs_confirm_deactivate_desc,
									),
									{
										name: staff.displayName,
									},
								)
							: t(
									getTranslationToken(
										"staffs",
										staffsLocaleKeys.staffs_confirm_activate_desc,
									),
									{
										name: staff?.displayName,
									},
								)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						{t(getTranslationToken("staffs", staffsLocaleKeys.staffs_cancel))}
					</Button>
					<Button
						type="button"
						variant={staff?.isActive ? "destructive" : "secondary"}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"staffs",
										staffsLocaleKeys.staffs_update_pending,
									),
								)
							: staff?.isActive
								? t(
										getTranslationToken(
											"staffs",
											staffsLocaleKeys.staffs_deactivate,
										),
									)
								: t(
										getTranslationToken(
											"staffs",
											staffsLocaleKeys.staffs_activate,
										),
									)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
