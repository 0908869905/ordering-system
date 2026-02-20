import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function LanternIcon({ className }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
    >
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 1;5 12 1;0 12 1;-5 12 1;0 12 1"
          dur="3s"
          repeatCount="indefinite"
        />
        {/* 吊繩 */}
        <line x1="12" y1="1" x2="12" y2="4" />
        {/* 上木框 */}
        <line x1="9" y1="4" x2="15" y2="4" strokeWidth="2.5" />
        {/* 燈籠身體（桶型鼓起 + 半透明填充） */}
        <path
          d="M9 4C4 7 4 17 9 20H15C20 17 20 7 15 4"
          fill="currentColor"
          fillOpacity="0.15"
        />
        {/* 竹骨橫肋 */}
        <line x1="5" y1="9" x2="19" y2="9" opacity="0.4" />
        <line x1="4.5" y1="12" x2="19.5" y2="12" opacity="0.4" />
        <line x1="5" y1="15" x2="19" y2="15" opacity="0.4" />
        {/* 下木框 */}
        <line x1="9" y1="20" x2="15" y2="20" strokeWidth="2.5" />
        {/* 底部流蘇 */}
        <line x1="12" y1="20" x2="12" y2="23" />
      </g>
    </svg>
  )
}
