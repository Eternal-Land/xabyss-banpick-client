import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import type { ProfileResponse } from "@/apis/self/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import SelectInput from "../select-input";

export interface MatchInviteDialogProps {
	matchId: string;
}

export default function MatchInviteDialog({ matchId }: MatchInviteDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>Invite</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invite Player</DialogTitle>
				</DialogHeader>

				<div>
					<SelectInput
						options={[
							{ label: "User 1", value: "1" },
							{ label: "User 2", value: "2" },
							{ label: "User 3", value: "3" },
						]}
					/>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button>Send</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
