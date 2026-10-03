import { FileIcon } from './CaseBadges'

// The file's icon, its name and a line under it — the same row in every evidence state
export function EvidenceFileSummary({
  type,
  name,
  iconClass,
  aside,
  children,
}: {
  type: string | null
  name: string
  iconClass?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <FileIcon type={type} className={iconClass} />
      <div className="grid min-w-0 flex-1">
        {/* Up to two lines, the full name on pointing at it (mockup screen 13) */}
        <span
          title={name}
          className="line-clamp-2 text-[13.5px] font-semibold wrap-anywhere"
        >
          {name}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {children}
        </span>
      </div>
      {aside}
    </div>
  )
}
