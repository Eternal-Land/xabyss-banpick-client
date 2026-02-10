import { useTranslation } from "react-i18next";
import type { CharacterResponse } from "@/apis/characters/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { charactersLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export interface CharacterToggleDialogProps {
	character: CharacterResponse | null;
	isPending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function CharacterToggleDialog({
	character,
	isPending,
	onConfirm,
	onCancel,
}: CharacterToggleDialogProps) {
	const { t } = useTranslation();

	return (
		<Dialog
			open={Boolean(character)}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{character?.isActive
							? t(
									getTranslationToken(
										"characters",
										charactersLocaleKeys.characters_confirm_deactivate_title,
									),
								)
							: t(
									getTranslationToken(
										"characters",
										charactersLocaleKeys.characters_confirm_activate_title,
									),
								)}
					</DialogTitle>
					<DialogDescription>
						{character?.isActive
							? t(
									getTranslationToken(
										"characters",
										charactersLocaleKeys.characters_confirm_deactivate_desc,
									),
									{
										name: character.name,
									},
								)
							: t(
									getTranslationToken(
										"characters",
										charactersLocaleKeys.characters_confirm_activate_desc,
									),
									{
										name: character?.name,
									},
								)}
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onCancel}>
						{t(
							getTranslationToken(
								"characters",
								charactersLocaleKeys.characters_cancel,
							),
						)}
					</Button>
					<Button
						type="button"
						variant={character?.isActive ? "destructive" : "secondary"}
						onClick={onConfirm}
						disabled={isPending}
					>
						{isPending
							? t(
									getTranslationToken(
										"characters",
										charactersLocaleKeys.characters_update_pending,
									),
								)
							: character?.isActive
								? t(
										getTranslationToken(
											"characters",
											charactersLocaleKeys.characters_deactivate,
										),
									)
								: t(
										getTranslationToken(
											"characters",
											charactersLocaleKeys.characters_activate,
										),
									)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
