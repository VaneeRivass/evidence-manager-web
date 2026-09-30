import { FileCheck2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// The application's name and mark: the sign-in panel (light on navy), the sign-in form on
// phones and the top bar (dark on white)
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span
      className={cn(
        'relative flex items-center gap-2.5 font-bold tracking-tight',
        light ? 'text-white' : 'text-foreground',
      )}
    >
      <span className="grid size-8 place-items-center rounded-[10px] bg-primary">
        <FileCheck2 className="size-4 text-white" />
      </span>
      Gestor de evidencias
    </span>
  )
}
