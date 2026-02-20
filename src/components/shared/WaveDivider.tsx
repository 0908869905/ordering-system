import { cn } from '@/lib/utils'

interface Props {
  variant?: 'light' | 'dark' | 'subtle'
  className?: string
}

export default function WaveDivider({ variant = 'light', className }: Props) {
  return (
    <div
      className={cn(
        'seigaiha w-full h-[28px]',
        variant === 'dark' && 'seigaiha-dark',
        variant === 'subtle' && 'seigaiha-subtle',
        'seigaiha-animated',
        className
      )}
    />
  )
}
