interface Props {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SteamAnimation({ size = 'md', className = '' }: Props) {
  const sizeClass =
    size === 'sm'
      ? 'steam-animation-sm'
      : size === 'lg'
        ? 'steam-animation-lg'
        : 'w-[48px] h-[64px]'

  return (
    <svg
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`steam-animation ${sizeClass} ${className}`}
    >
      <path
        className="steam-line steam-1"
        d="M15 70 Q10 55 18 45 Q26 35 14 20 Q8 12 16 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        className="steam-line steam-2"
        d="M30 72 Q25 58 33 48 Q41 38 29 22 Q23 14 31 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        className="steam-line steam-3"
        d="M45 70 Q40 55 48 45 Q56 35 44 20 Q38 12 46 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}
