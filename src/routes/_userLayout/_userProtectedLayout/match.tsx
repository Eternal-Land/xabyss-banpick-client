import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_userLayout/_userProtectedLayout/match")(
	{
		component: RouteComponent,
	},
);

function RouteComponent() {
	return (
		<div className="flex-1 flex items-center justify-center">
			<div className="fade-in text-center text-white">
				<h1 className="text-3xl font-semibold">Match Lobby</h1>
				<p className="mt-2 text-sm text-white/75">
					Match setup is coming soon.
				</p>
			</div>
		</div>
	);
}
