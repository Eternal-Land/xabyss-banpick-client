import HeaderNavigation from "@/components/header-navigation";
import { useAppSelector } from "@/hooks/use-app-selector";
import { store } from "@/lib/redux";
import { selectAuthProfile } from "@/lib/redux/auth.slice";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_userLayout/_userProtectedLayout")({
	component: RouteComponent,
	beforeLoad: async () => {
		const { profile } = store.getState().auth;
		if (!profile) {
			throw redirect({
				to: "/auth/login",
			});
		}
	},
});

function RouteComponent() {
	const profile = useAppSelector(selectAuthProfile);

	return (
		<div className="min-h-screen flex flex-col">
			<HeaderNavigation profile={profile} />
			<div className="flex-1 h-full w-full max-w-6xl px-6 py-8 mx-auto flex flex-col">
				<Outlet />
			</div>
		</div>
	);
}
