import { FileQuestion, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/BackButton'
import { StatePanel } from '@/components/StatePanel'
import { Button } from '@/components/ui/button'

// RF-14 · mockup screen 19: an unknown address, or a case that is not there (RF-16)
export function NotFoundScreen({
  title = 'No encontramos esta página',
  text = 'Puede que la dirección esté mal escrita o que ya no exista. Tus casos siguen donde los dejaste.',
}: {
  title?: string
  text?: string
}) {
  return (
    <StatePanel
      icon={<FileQuestion />}
      tone="primary"
      title={title}
      text={text}
    >
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button asChild>
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
