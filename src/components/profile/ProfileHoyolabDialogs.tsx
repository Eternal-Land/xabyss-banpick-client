import { useMemo } from "react";
import type { ReactNode } from "react";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperTitle,
	StepperTrigger,
} from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CodeBlock } from "@/components/code-block";
import { getTranslationToken } from "@/i18n/namespaces";
import { profileLocaleKeys } from "@/i18n/keys";

export interface ProfileHoyolabDialogsProps {
	trigger: ReactNode;
	isDialogOpen: boolean;
	onDialogOpenChange: (open: boolean) => void;
	isConfirmOpen: boolean;
	onConfirmOpenChange: (open: boolean) => void;
	isResultOpen: boolean;
	onResultOpenChange: (open: boolean) => void;
	syncResult: "success" | "error" | null;
	isSyncPending: boolean;
	isSyncReady: boolean;
	hoyoUid: string;
	onHoyoUidChange: (value: string) => void;
	hoyoServer: string;
	onHoyoServerChange: (value: string) => void;
	generalCookie: string;
	onGeneralCookieChange: (value: string) => void;
	cookieTokenV2: string;
	onCookieTokenV2Change: (value: string) => void;
	ltokenV2: string;
	onLtokenV2Change: (value: string) => void;
	onOpenConfirm: () => void;
	onConfirmSync: () => void;
}

const code = `// Copy cookies to clipboard
script: (function() {
  if (document.cookie.includes("ltuid_v2")) {
    const input = document.createElement('input');
    input.value = document.cookie;
    document.body.appendChild(input);
    input.focus();
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    if (result) {
      alert('HoYoLAB cookie copied to clipboard');
    } else {
      prompt('Failed to copy cookie. Manually copy the cookie below:', input.value);
    }
  } else {
    alert('Please logout and log back in. Cookie is expired/invalid!');
  }
})();
`;

export default function ProfileHoyolabDialogs({
	trigger,
	isDialogOpen,
	onDialogOpenChange,
	isConfirmOpen,
	onConfirmOpenChange,
	isResultOpen,
	onResultOpenChange,
	syncResult,
	isSyncPending,
	isSyncReady,
	hoyoUid,
	onHoyoUidChange,
	hoyoServer,
	onHoyoServerChange,
	generalCookie,
	onGeneralCookieChange,
	cookieTokenV2,
	onCookieTokenV2Change,
	ltokenV2,
	onLtokenV2Change,
	onOpenConfirm,
	onConfirmSync,
}: ProfileHoyolabDialogsProps) {
	const { t } = useTranslation();

	const hoyolabSteps = useMemo(
		() => [
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_1_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_1_desc,
					),
				),
			},
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_2_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_2_desc,
					),
				),
			},
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_3_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_3_desc,
					),
				),
				imageUrl:
					"https://res.cloudinary.com/dphtvhtvf/image/upload/v1770435183/Screenshot_2026-02-07_101347_hvv8y8.png",
			},
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_4_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_4_desc,
					),
				),
			},
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_5_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_5_desc,
					),
				),
				imageUrl:
					"https://res.cloudinary.com/dphtvhtvf/image/upload/v1770437128/Screenshot_2026-02-07_105034_frk4px.png",
			},
			{
				label: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_6_label,
					),
				),
				description: t(
					getTranslationToken(
						"profile",
						profileLocaleKeys.profile_hoyolab_step_6_desc,
					),
				),
			},
		],
		[t],
	);

	return (
		<>
			<Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
				<DialogTrigger asChild>{trigger}</DialogTrigger>
				<DialogContent className="max-h-[80vh] min-w-280 overflow-y-auto sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_dialog_title,
								),
							)}
						</DialogTitle>
						<DialogDescription>
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_dialog_description,
								),
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="no-scrollbar max-h-[60vh] overflow-y-auto py-6">
						<Stepper orientation="vertical" defaultValue={1}>
							<StepperNav className="gap-4">
								{hoyolabSteps.map((step, index) => {
									const stepNumber = index + 1;

									return (
										<StepperItem
											key={step.label}
											step={stepNumber}
											className="items-start"
										>
											<StepperTrigger className="items-start">
												<StepperIndicator>{stepNumber}</StepperIndicator>
												<div className="space-y-1 text-left">
													<StepperTitle>{step.label}</StepperTitle>
													<StepperDescription>
														{step.description}
													</StepperDescription>
												</div>
											</StepperTrigger>
											{stepNumber === 3 ? (
												<div className="mt-4 w-full space-y-2">
													<Label className="text-sm text-white/70">
														{t(
															getTranslationToken(
																"profile",
																profileLocaleKeys.profile_hoyolab_step_3_copy,
															),
														)}
													</Label>
													<CodeBlock code={code} language="javascript" />
												</div>
											) : null}
											{stepNumber === 4 ? (
												<div className="mt-4 w-full space-y-2">
													<Label className="text-sm text-white/70">
														{t(
															getTranslationToken(
																"profile",
																profileLocaleKeys.profile_hoyolab_step_4_input_label,
															),
														)}
													</Label>
													<Textarea
														placeholder={t(
															getTranslationToken(
																"profile",
																profileLocaleKeys.profile_hoyolab_step_4_input_placeholder,
															),
														)}
														className="min-h-28vh max-w-full"
														value={generalCookie}
														onChange={(event) =>
															onGeneralCookieChange(event.target.value)
														}
													/>
												</div>
											) : null}
											{stepNumber === 5 ? (
												<div className="mt-4 w-full space-y-2">
													<Label className="text-sm text-yellow-400">
														{t(
															getTranslationToken(
																"profile",
																profileLocaleKeys.profile_hoyolab_step_5_attention,
															),
														)}
													</Label>
												</div>
											) : null}
											{stepNumber === 6 ? (
												<div className="mt-4 w-full space-y-4">
													<div className="space-y-2">
														<Label className="text-sm text-white/70">
															{t(
																getTranslationToken(
																	"profile",
																	profileLocaleKeys.profile_hoyolab_step_6_ltoken_label,
																),
															)}
														</Label>
														<Input
															placeholder={t(
																getTranslationToken(
																	"profile",
																	profileLocaleKeys.profile_hoyolab_step_6_ltoken_placeholder,
																),
															)}
															value={ltokenV2}
															onChange={(event) =>
																onLtokenV2Change(event.target.value)
															}
														/>
													</div>
													<div className="space-y-2">
														<Label className="text-sm text-white/70">
															{t(
																getTranslationToken(
																	"profile",
																	profileLocaleKeys.profile_hoyolab_step_6_cookie_token_label,
																),
															)}
														</Label>
														<Input
															placeholder={t(
																getTranslationToken(
																	"profile",
																	profileLocaleKeys.profile_hoyolab_step_6_cookie_token_placeholder,
																),
															)}
															value={cookieTokenV2}
															onChange={(event) =>
																onCookieTokenV2Change(event.target.value)
															}
														/>
													</div>
												</div>
											) : null}
											{![1, 2, 4, 6].includes(stepNumber) ? (
												<div className="mt-4 flex w-full flex-col gap-3">
													<div className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-white/5 text-xs text-white/60">
														{step.imageUrl ? (
															<img
																src={step.imageUrl}
																alt="Step guide"
																className="w-full object-contain"
															/>
														) : (
															t(
																getTranslationToken(
																	"profile",
																	profileLocaleKeys.profile_hoyolab_step_image_placeholder,
																),
															)
														)}
													</div>
												</div>
											) : null}
										</StepperItem>
									);
								})}
							</StepperNav>
						</Stepper>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								{t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_cancel_button,
									),
								)}
							</Button>
						</DialogClose>
						<Button onClick={onOpenConfirm} disabled={isSyncPending}>
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_sync_submit_button,
								),
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isConfirmOpen} onOpenChange={onConfirmOpenChange}>
				<DialogContent className="max-w-lg bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md">
					<DialogHeader>
						<DialogTitle>
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_confirm_title,
								),
							)}
						</DialogTitle>
						<DialogDescription>
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_confirm_description,
								),
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label className="text-sm text-white/70" htmlFor="hoyolab-uid">
								{t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_uid_label,
									),
								)}
							</Label>
							<Input
								id="hoyolab-uid"
								placeholder={t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_uid_placeholder,
									),
								)}
								value={hoyoUid}
								onChange={(event) => onHoyoUidChange(event.target.value)}
								inputMode="numeric"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-sm text-white/70">
								{t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_server_label,
									),
								)}
							</Label>
							<Select value={hoyoServer} onValueChange={onHoyoServerChange}>
								<SelectTrigger className="w-full">
									<SelectValue
										placeholder={t(
											getTranslationToken(
												"profile",
												profileLocaleKeys.profile_hoyolab_server_placeholder,
											),
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="os_asia">
										{t(
											getTranslationToken(
												"profile",
												profileLocaleKeys.profile_hoyolab_server_asia,
											),
										)}
									</SelectItem>
									<SelectItem value="os_usa">
										{t(
											getTranslationToken(
												"profile",
												profileLocaleKeys.profile_hoyolab_server_america,
											),
										)}
									</SelectItem>
									<SelectItem value="os_euro">
										{t(
											getTranslationToken(
												"profile",
												profileLocaleKeys.profile_hoyolab_server_europe,
											),
										)}
									</SelectItem>
									<SelectItem value="os_cht">
										{t(
											getTranslationToken(
												"profile",
												profileLocaleKeys.profile_hoyolab_server_taiwan,
											),
										)}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-200">
							{t(
								getTranslationToken(
									"profile",
									profileLocaleKeys.profile_hoyolab_sync_warning,
								),
							)}
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								{t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_cancel_button,
									),
								)}
							</Button>
						</DialogClose>
						<Button
							onClick={onConfirmSync}
							disabled={!isSyncReady || isSyncPending}
						>
							{isSyncPending
								? t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_sync_submit_button,
										),
									)
								: t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_confirm_button,
										),
									)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isResultOpen} onOpenChange={onResultOpenChange}>
				<DialogContent className="max-w-lg bg-transparent bg-linear-45 from-white/5 to-white/10 backdrop-blur-md">
					<DialogHeader>
						<DialogTitle>
							{syncResult === "success"
								? t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_success_title,
										),
									)
								: t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_error_title,
										),
									)}
						</DialogTitle>
						<DialogDescription>
							{syncResult === "success"
								? t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_success_description,
										),
									)
								: t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_error_description,
										),
									)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="flex w-full items-center justify-center px-4 py-6">
							{syncResult === "success" ? (
								<img
									src="https://res.cloudinary.com/dphtvhtvf/image/upload/v1770617529/Icon_Emoji_Paimon_27s_Paintings_46_Alice_1_epibcc.webp"
									alt={t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_success_title,
										),
									)}
									className="max-h-48 w-full object-contain"
								/>
							) : (
								<img
									src="https://res.cloudinary.com/dphtvhtvf/image/upload/v1770617561/Icon_Emoji_Paimon_27s_Paintings_43_Ineffa_3_xjagif.webp"
									alt={t(
										getTranslationToken(
											"profile",
											profileLocaleKeys.profile_hoyolab_result_error_title,
										),
									)}
									className="max-h-48 w-full object-contain"
								/>
							)}
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">
								{t(
									getTranslationToken(
										"profile",
										profileLocaleKeys.profile_hoyolab_result_close,
									),
								)}
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
