import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function JapaneseFrame({ children, className }: Props) {
  return (
    <div className={cn('relative p-6', className)}>
      {/* 四角裝飾 */}
      <span className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary-400/40" />
      <span className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary-400/40" />
      <span className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary-400/40" />
      <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary-400/40" />
      {children}
    </div>
  )
}
