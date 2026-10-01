import { cn } from '@/lib/utils'

// A grey bar standing in for text while it loads (RF-15). Its size comes from the caller;
// the pulse stops for anyone who asked for reduced motion.
export function SkeletonBar({ className }: { className: string }) {
  return (
    <span
      className={cn(
        'block max-w-full rounded-full bg-muted motion-safe:animate-pulse',
        className,
      )}
    />
  )
}
