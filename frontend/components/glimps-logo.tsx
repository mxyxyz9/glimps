export function GlimpsLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rounded square frame */}
      <rect x="8" y="8" width="84" height="84" rx="16" ry="16" stroke="currentColor" strokeWidth="6" fill="none" />

      {/* Profile silhouette */}
      <path d="M25 35C25 28 30 23 37 23C44 23 49 28 49 35C49 42 44 47 37 47C30 47 25 42 25 35Z" fill="currentColor" />

      {/* Hair/head shape */}
      <path
        d="M30 23C30 18 33 15 37 15C41 15 44 18 44 23C44 25 43 27 42 28C45 30 47 33 47 37V50C47 55 45 60 42 64H32C29 60 27 55 27 50V37C27 33 29 30 32 28C31 27 30 25 30 23Z"
        fill="currentColor"
      />

      {/* Eye */}
      <circle cx="40" cy="35" r="2" fill="white" />

      {/* Circular arrow for transformation */}
      <path
        d="M70 25C75 25 80 30 80 35C80 40 75 45 70 45"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Arrow head */}
      <path
        d="M72 42L70 45L68 42"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
