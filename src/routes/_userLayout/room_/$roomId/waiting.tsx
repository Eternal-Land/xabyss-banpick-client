import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { IconAssets } from '@/lib/constants/icon-assets'
import { createFileRoute } from '@tanstack/react-router'
import { Copy } from 'lucide-react'

export const Route = createFileRoute('/_userLayout/room_/$roomId/waiting')({
  component: RouteComponent,
})

const SAMPLE_PLAYER = {
  name: 'Shirogane Toru',
  uid: '123456789',
  avatar:
    'https://res.cloudinary.com/dphtvhtvf/image/upload/v1770611732/genshin-impact-banpick/upload/avatars/euhhui4znfpssjw8laps.jpg',
}

const COPY_LINKS = ['Opponent invite link', 'Spectors link', 'Staff link'] as const

function CopyLinkButton() {
  return (
    <Button variant="ghost" onClick={() => navigator.clipboard.writeText(window.location.href)}>
      <Copy className="size-4" />
    </Button>
  )
}

function RouteComponent() {
  return (
    <div className="min-h-screen max-w-screen">
      <div className="grid grid-cols-4 gap-4 h-dvh p-4">
        <div className="flex flex-col h-full justify-center items-center gap-2">
          <h1 className="text-4xl font-bold text-sky-400 capitalize">Blue player</h1>

          <div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center overflow-hidden">
            <img src={SAMPLE_PLAYER.avatar} alt="Blue Player Avatar" className="w-full h-full" />
          </div>

          <span className="text-xl mt-2">{SAMPLE_PLAYER.name}</span>
          <span className="text-xl mt-2">UID: {SAMPLE_PLAYER.uid}</span>
        </div>

        <div className="col-span-2 flex flex-col h-full justify-between items-center py-4">
          <div className="host-area w-full flex justify-center items-center gap-4">
            <img src={SAMPLE_PLAYER.avatar} alt="Blue Player Avatar" className="w-20 h-20 rounded-full object-cover" />
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold">Mode: Realtime - BO1</h2>
              <p className="text-gray-500">Host: {SAMPLE_PLAYER.name}</p>
            </div>
          </div>

          <div className="waiting-indicator flex flex-col items-center gap-4">
            <div className="text-3xl flex items-center gap-2">
              Waiting 2 players <Spinner className="size-8" />
            </div>

            <div className="copy-area flex flex-col items-center gap-2">
              {COPY_LINKS.map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <h1 className="text-gray-400">{label}</h1>
                  <CopyLinkButton />
                </div>
              ))}
            </div>
          </div>

          <div className="button-area">
            <Button className="p-4 text-lg text-gray-700 rounded cursor-pointer">Start Game</Button>
          </div>
        </div>

        <div className="flex flex-col h-full justify-center items-center">
          <h1 className="text-4xl font-bold text-red-600 capitalize">Red player</h1>
          <div className="w-32 h-32 rounded-full object-cover mt-4 flex items-center justify-center border-2 border-dashed border-gray-400">
            <img src={IconAssets.EMPTY_CHARACTER_ICON} alt="Red Player Avatar" className="w-12 h-12" />
          </div>
          <span className="text-xl mt-2">Connecting...</span>
          <span className="text-xl mt-2" />
        </div>
      </div>
    </div>
  )
}
