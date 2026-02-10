import { useTranslation } from "react-i18next";

import { LocaleKeys } from "@/lib/constants";
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
      <DialogContent className="max-w-lg bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{t(LocaleKeys.profile_remove_character_title)}</DialogTitle>
          <DialogDescription>
            {t(LocaleKeys.profile_remove_character_description, {
              name: characterName,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {t(LocaleKeys.profile_remove_character_cancel)}
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending
              ? t(LocaleKeys.profile_remove_character_pending)
              : t(LocaleKeys.profile_remove_character_submit)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
