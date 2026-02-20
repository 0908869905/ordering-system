import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function CloudDivider({ className }: Props) {
  return <div className={cn('cloud-divider-simple w-full', className)} />
}
