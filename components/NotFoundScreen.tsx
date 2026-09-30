'use client'

import { ArrowLeft, FileQuestion, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// RF-14 · mockup screen 19. Rendered inside the private layout, so the top bar confirms the
// session is intact. Never a redirect without warning.
export function NotFoundScreen() {
  const router = useRouter()

  return (
    <section className="grid justify-items-center gap-3 rounded-[20px] border bg-card px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
        <FileQuestion className="size-7" />
      </span>
      <h1 className="text-lg font-bold">No encontramos esta página</h1>
      <p className="max-w-[44ch] text-sm text-muted-foreground">
        Puede que la dirección esté mal escrita o que ya no exista. Tus casos
        siguen donde los dejaste.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2.5">
        <Button asChild className="rounded-full">
          <Link href="/cases">
            <FolderOpen />
            Volver a mis casos
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft />
          Volver
        </Button>
      </div>
    </section>
  )
}
