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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ProfileEditCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterLevel: string;
  onCharacterLevelChange: (value: string) => void;
  constellation: string;
  onConstellationChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export default function ProfileEditCharacterDialog({
  open,
  onOpenChange,
  characterLevel,
  onCharacterLevelChange,
  constellation,
  onConstellationChange,
  onSubmit,
  isPending,
}: ProfileEditCharacterDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{t(LocaleKeys.profile_edit_character_title)}</DialogTitle>
          <DialogDescription>
            {t(LocaleKeys.profile_edit_character_description)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-white/70" htmlFor="edit-character-level">
              {t(LocaleKeys.profile_edit_character_level_label)}
            </Label>
            <Input
              id="edit-character-level"
              type="number"
              min={0}
              placeholder={t(LocaleKeys.profile_edit_character_level_placeholder)}
              value={characterLevel}
              onChange={(event) => onCharacterLevelChange(event.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-sm text-white/70"
              htmlFor="edit-character-constellation"
            >
              {t(LocaleKeys.profile_edit_character_constellation_label)}
            </Label>
            <Input
              id="edit-character-constellation"
              type="number"
              min={0}
              max={6}
              placeholder={t(
                LocaleKeys.profile_edit_character_constellation_placeholder,
              )}
              value={constellation}
              onChange={(event) => onConstellationChange(event.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              {t(LocaleKeys.profile_edit_character_cancel)}
            </Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending
              ? t(LocaleKeys.profile_edit_character_pending)
              : t(LocaleKeys.profile_edit_character_submit)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
