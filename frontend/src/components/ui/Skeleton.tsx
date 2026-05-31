interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

function Skeleton({ className = '', width, height }: SkeletonProps) {
  return (
    <div
      className={['animate-pulse bg-gray-200 rounded', className].join(' ')}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  )
}

export default Skeleton
export type { SkeletonProps }
