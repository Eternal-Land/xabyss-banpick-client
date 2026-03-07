import { matchApi } from '@/apis/match'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_userLayout/room/$roomId')({
  component: RouteComponent,
  loader: async ({ context, params }) => context.queryClient.ensureQueryData({
    queryKey: ['room', params.roomId],
    queryFn: () => matchApi.getMatch(params.roomId),
  })
})

function RouteComponent() {
  return <Outlet/>
}
