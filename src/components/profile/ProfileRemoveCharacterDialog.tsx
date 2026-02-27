import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { getTranslationToken } from "@/i18n/namespaces";
import { profileLocaleKeys } from "@/i18n/keys";

export interface ProfileRemoveCharacterDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	characterName?: string;
	onConfirm: () => void;
	isPending: boolean;
}

export default function ProfileRemoveCharacterDialog({
	open,
	onOpenChange,
	characterName,
	onConfirm,
	isPending,
}: ProfileRemoveCharacterDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t(
							getTranslationToken(
								"profile",
								profileLocaleKeys.profile_remove_character_title,
							),
						)}
					</DialogTitle>
					<DialogDescription>
						{t(
							getTranslationToken(
								"profile",
								profileLocaleKeys.profile_remove_character_description,
							),
							{
								name: characterName,
							},
						)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_remove_character_cancel,
								),
							)}
						</Button>
					</DialogClose>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_remove_character_pending,
									),
								)
							: t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_remove_character_submit,
									),
								)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
