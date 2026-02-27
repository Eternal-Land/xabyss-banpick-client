import PlayerSideBackground from "@/components/player-side/background";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_userLayout/_userProtectedLayout/match")(
	{
		component: RouteComponent,
	},
);

function RouteComponent() {  
  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        <PlayerSideBackground />
        <div className="mx-auto relative z-10 flex flex-col max-w-6xl w-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}
