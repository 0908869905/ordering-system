import { cn } from '@/lib/utils'

interface Props {
  className?: string
  size?: number
}

export default function RamenBowlIcon({ className, size = 24 }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      {/* 碗 */}
      <path d="M3 11h18" />
      <path d="M5 11c0 4.418 3.134 8 7 8s7-3.582 7-8" />
      {/* 碗底座 */}
      <path d="M9 19h6" />
      <path d="M10 19v1h4v-1" />
      {/* 蒸氣 */}
      <path d="M8 8c0-1 .5-2 1.5-2S11 7 11 8" opacity="0.6" />
      <path d="M13 6c0-1 .5-2 1.5-2S16 5 16 6" opacity="0.6" />
    </svg>
  )
}
