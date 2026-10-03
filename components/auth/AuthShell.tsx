import { Brand } from '@/components/common/Brand'

// The two-column frame shared by sign-in and registration: mockup screens 1 and 2.
// The blobs are decoration only, and stop for anyone who asked for reduced motion.
export function AuthShell({
  title,
  text,
  children,
}: {
  title: string
  text: string
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between gap-7 overflow-hidden bg-foreground p-11 text-white md:flex">
        <span
          aria-hidden
          className="absolute -top-16 -right-24 size-72 rounded-full bg-primary opacity-55 blur-[2px] motion-safe:animate-drift-1"
        />
        <span
          aria-hidden
          className="absolute -bottom-12 -left-16 size-48 rounded-full bg-teal opacity-45 blur-[2px] motion-safe:animate-drift-2"
        />
        <span
          aria-hidden
          className="absolute right-[22%] bottom-[18%] size-24 rounded-full bg-amber opacity-35 blur-[2px] motion-safe:animate-drift-3"
        />

        <Brand light />
        <div className="relative">
          <h2 className="max-w-[14ch] text-3xl leading-tight font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="mt-3 max-w-[34ch] text-[#b9bfdc]">{text}</p>
        </div>
      </aside>

      <div className="grid content-center bg-card px-6 py-12 sm:px-14">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 md:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </div>
    </main>
  )
}
