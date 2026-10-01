import { CloudOff, RotateCw } from 'lucide-react'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/button'
import { message } from '@/lib/messages.es'

// Error: the API's code in view and a way to try again (mockup screen 6). The list and the
// case page each say what could not be loaded.
export function LoadError({
  title,
  code,
  onRetry,
}: {
  title: string
  code: string
  onRetry: () => void
}) {
  return (
    <StatePanel
      icon={<CloudOff />}
      tone="destructive"
      title={title}
      text={message(code)}
    >
      <code className="rounded-md bg-muted px-2 py-0.5 text-[11.5px] text-slate">
        {code}
      </code>
      <Button variant="outline" onClick={onRetry} className="mt-2">
        <RotateCw />
        Reintentar
      </Button>
    </StatePanel>
  )
}
