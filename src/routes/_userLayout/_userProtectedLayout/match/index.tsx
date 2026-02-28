import MatchContainer from '@/components/match/MatchContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_userLayout/_userProtectedLayout/match/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur sm:flex-row sm:items-center">
        <Input placeholder="Search matches" />
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="outline" onClick={() => navigate({ to: "/match/create" })}>Create Match</Button>
        </div>
      </div>

      {Array.from({ length: 5 }).map((_, index) => (
        <MatchContainer
          key={index}
          matchTitle="Epic Duel"
          player1={{
            name: "Tinh Luyện",
            uid: "123456789",
            avatarUrl: "https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
          }}
          player2={{
            name: "Tiếng Việt",
            uid: "987654321",
            avatarUrl: "https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg",
          }}
        />
      ))}
    </div>
  )
}
