import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_userLayout/_userProtectedLayout/match/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-center">CREATE MATCH</h1>
      <Select>
        <SelectTrigger className="w-full max-w-[20vw]">
          <SelectValue placeholder="Select match type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1v1">Turn based</SelectItem>
          <SelectItem value="2v2">Real time</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex justify-between">
        
      </div>
    </div>
  )
}
