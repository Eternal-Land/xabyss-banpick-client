import { useTranslation } from "react-i18next";
import type { StaffRoleResonse } from "@/apis/staff-roles/types";
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
import { staffRolesLocaleKeys } from "@/i18n/keys";

export interface StaffRoleToggleDialogProps {
	staffRole: StaffRoleResonse | null;
	isPending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function StaffRoleToggleDialog({
	staffRole,
	isPending,
	onConfirm,
	onCancel,
}: StaffRoleToggleDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog
			open={Boolean(staffRole)}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{staffRole?.isActive
							? t(
									getTranslationToken(
										"staff-roles",
										staffRolesLocaleKeys.staff_roles_confirm_deactivate_title,
									),
								)
							: t(
									getTranslationToken(
										"staff-roles",
										staffRolesLocaleKeys.staff_roles_confirm_activate_title,
									),
								)}
					</DialogTitle>
					<DialogDescription>
						{staffRole?.isActive
							? t(
									getTranslationToken(
										"staff-roles",
										staffRolesLocaleKeys.staff_roles_confirm_deactivate_desc,
									),
									{
										name: staffRole.name,
									},
								)
							: t(
									getTranslationToken(
										"staff-roles",
										staffRolesLocaleKeys.staff_roles_confirm_activate_desc,
									),
									{
										name: staffRole?.name,
									},
								)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						{t(
							getTranslationToken(
								"staff-roles",
								staffRolesLocaleKeys.staff_roles_cancel,
							),
						)}
					</Button>
					<Button
						type="button"
						variant={staffRole?.isActive ? "destructive" : "secondary"}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"staff-roles",
										staffRolesLocaleKeys.staff_roles_update_pending,
									),
								)
							: staffRole?.isActive
								? t(
										getTranslationToken(
											"staff-roles",
											staffRolesLocaleKeys.staff_roles_deactivate,
										),
									)
								: t(
										getTranslationToken(
											"staff-roles",
											staffRolesLocaleKeys.staff_roles_activate,
										),
									)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
