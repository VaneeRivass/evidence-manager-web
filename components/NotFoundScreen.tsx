import { FileQuestion, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/BackButton'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/button'

// RF-14 · mockup screen 19. Rendered inside the private layout, so the top bar confirms
// the session is intact. Never a redirect without warning.
export function NotFoundScreen() {
  return (
    <StatePanel
      icon={<FileQuestion />}
      tone="primary"
      title="No encontramos esta página"
      text="Puede que la dirección esté mal escrita o que ya no exista. Tus casos siguen donde los dejaste."
    >
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button asChild className="rounded-full">
          <Link href="/cases">
            <FolderOpen />
            Volver a mis casos
          </Link>
        </Button>
        <BackButton />
      </div>
    </StatePanel>
  )
}
