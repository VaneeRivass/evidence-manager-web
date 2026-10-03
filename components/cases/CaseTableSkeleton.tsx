import { SkeletonBar } from '@/components/common/SkeletonBar'

// Loading: rows the height of the table's, so nothing jumps when the data arrives. The word
// "loading" is only for screen readers (RF-15 · mockup screen 4).
export function CaseTableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando casos"
      className="overflow-hidden rounded-[20px] border bg-card"
    >
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="grid gap-2 border-b px-4.5 py-4 last:border-b-0"
        >
          <SkeletonBar className="h-3 w-56 max-w-full" />
          <SkeletonBar className="h-2.5 w-80 max-w-full" />
        </div>
      ))}
    </div>
  )
}
