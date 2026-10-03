import { TopBar } from '@/components/app/TopBar'

// Every private page: the top bar, then the page. proxy.ts has already made sure there is
// a session cookie before any of this is served.
export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto grid max-w-5xl gap-5 px-5 py-7 sm:px-7">
        {children}
      </main>
    </div>
  )
}
