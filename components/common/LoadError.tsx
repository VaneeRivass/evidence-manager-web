import { CloudOff, RotateCw } from 'lucide-react'
import { StatePanel } from '@/components/common/StatePanel'
import { Button } from '@/components/ui/button'
import { CODE_LABEL, message } from '@/lib/messages.es'

// Error: what happened, a way to try again, and the API's code (mockup screens 6 and 22).
// The list and the case page each say what could not be loaded.
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
      {/* Secondary on purpose: the message and the retry lead; the code is there to ask
          for help with (mockup screen 24) */}
      <p className="text-xs text-muted-foreground">
        {CODE_LABEL}: <b className="font-semibold">{code}</b>
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-2">
        <RotateCw />
        Reintentar
      </Button>
    </StatePanel>
  )
}
