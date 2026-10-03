import { cn } from '@/lib/utils'

// The card for a screen with nothing to show: empty, error or not found. One component, so
// those screens look alike by construction (mockup screens 5, 6 and 19).
export function StatePanel({
  icon,
  tone,
  title,
  text,
  children,
}: {
  icon: React.ReactNode
  tone: 'primary' | 'destructive'
  title: string
  text: string
  children?: React.ReactNode
}) {
  return (
    <section className="grid justify-items-center gap-2.5 rounded-[20px] border bg-card px-6 py-14 text-center">
      <span
        className={cn(
          'mb-1.5 grid size-16 place-items-center rounded-[20px] [&_svg]:size-7',
          tone === 'primary'
            ? 'bg-secondary text-primary'
            : 'bg-destructive/10 text-destructive',
        )}
      >
        {icon}
      </span>
      <h2 className="text-[17px] font-bold">{title}</h2>
      <p className="max-w-[46ch] text-sm text-muted-foreground">{text}</p>
      {children}
    </section>
  )
}
