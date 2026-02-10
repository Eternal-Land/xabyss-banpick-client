import { useTranslation } from "react-i18next";

import type { CharacterResponse } from "@/apis/characters/types";
import { LocaleKeys } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfileAddCharacterDialogContentProps {
  selectedCharacterId: string;
  onSelectedCharacterIdChange: (value: string) => void;
  isCharacterListLoading: boolean;
  availableCharacters: CharacterResponse[];
  characterLevel: string;
  onCharacterLevelChange: (value: string) => void;
  constellation: string;
  onConstellationChange: (value: string) => void;
  onAddCharacter: () => void;
  isPending: boolean;
}

export default function ProfileAddCharacterDialogContent({
  selectedCharacterId,
  onSelectedCharacterIdChange,
  isCharacterListLoading,
  availableCharacters,
  characterLevel,
  onCharacterLevelChange,
  constellation,
  onConstellationChange,
  onAddCharacter,
  isPending,
}: ProfileAddCharacterDialogContentProps) {
  const { t } = useTranslation();

  return (
    <DialogContent className="max-w-lg bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md">
      <DialogHeader>
        <DialogTitle>{t(LocaleKeys.profile_add_character_title)}</DialogTitle>
        <DialogDescription>
          {t(LocaleKeys.profile_add_character_description)}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-white/70">
            {t(LocaleKeys.profile_add_character_select_label)}
          </Label>
          <Select
            value={selectedCharacterId}
            onValueChange={onSelectedCharacterIdChange}
            disabled={isCharacterListLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t(
                  LocaleKeys.profile_add_character_select_placeholder,
                )}
              />
            </SelectTrigger>
            <SelectContent className="max-h-[20vh]">
              <SelectGroup>
                {availableCharacters.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    {t(LocaleKeys.profile_add_character_empty)}
                  </SelectItem>
                ) : (
                  availableCharacters.map((character) => (
                    <SelectItem
                      key={character.id}
                      value={character.id.toString()}
                    >
                      {character.name}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-white/70" htmlFor="character-level">
              {t(LocaleKeys.profile_add_character_level_label)}
            </Label>
            <Input
              id="character-level"
              type="number"
              min={0}
              placeholder={t(LocaleKeys.profile_add_character_level_placeholder)}
              value={characterLevel}
              onChange={(event) => onCharacterLevelChange(event.target.value)}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-sm text-white/70"
              htmlFor="character-constellation"
            >
              {t(LocaleKeys.profile_add_character_constellation_label)}
            </Label>
            <Input
              id="character-constellation"
              type="number"
              min={0}
              max={6}
              placeholder={t(
                LocaleKeys.profile_add_character_constellation_placeholder,
              )}
              value={constellation}
              onChange={(event) => onConstellationChange(event.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">
            {t(LocaleKeys.profile_add_character_cancel)}
          </Button>
        </DialogClose>
        <Button
          onClick={onAddCharacter}
          disabled={!selectedCharacterId || isPending}
        >
          {isPending
            ? t(LocaleKeys.profile_add_character_pending)
            : t(LocaleKeys.profile_add_character_submit)}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
