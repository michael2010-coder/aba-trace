export function CraftsmanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="craft-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fafaf9" />
          <stop offset="100%" stopColor="#f4f4f5" />
        </linearGradient>
        <linearGradient id="craft-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="craft-accent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>
      </defs>

      <rect width="400" height="320" rx="24" fill="url(#craft-bg)" />

      {/* Workbench */}
      <rect x="20" y="240" width="360" height="16" rx="4" fill="#d6d3d1" />
      <rect x="40" y="256" width="16" height="48" fill="#a8a29e" />
      <rect x="344" y="256" width="16" height="48" fill="#a8a29e" />

      {/* Leather hide */}
      <path
        d="M70 230c-10-30 10-55 45-55 20 0 28 14 50 14 30 0 42-22 70-18 26 4 35 32 20 55-12 19-45 24-90 24-45 0-86-6-95-20Z"
        fill="url(#craft-leather)"
      />
      <path
        d="M95 205c12-8 28-10 42-4M180 195c14-4 30-2 42 6"
        stroke="#fde68a"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Shoe last / boot shape */}
      <path
        d="M210 235c0-28 8-52 26-66 12-9 28-9 34 4 5 11 0 22-9 30-10 9-13 20-13 32 0 10-6 18-19 18-12 0-19-8-19-18Z"
        fill="url(#craft-accent)"
      />
      <ellipse cx="232" cy="237" rx="34" ry="8" fill="#27272a" opacity="0.5" />

      {/* Needle & thread */}
      <path
        d="M120 150c30-20 70-30 110-22"
        stroke="#a16207"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <circle cx="120" cy="150" r="4" fill="#a16207" />
      <path d="M236 122 L256 102" stroke="#71717a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="256" cy="102" r="3" fill="#71717a" />

      {/* Hanging tools */}
      <rect x="300" y="40" width="3" height="70" fill="#d6d3d1" />
      <rect x="330" y="40" width="3" height="90" fill="#d6d3d1" />
      <path d="M290 108c0-6 6-10 13-10s13 4 13 10v6h-26Z" fill="#52525b" />
      <rect x="322" y="128" width="22" height="6" rx="2" fill="#52525b" />
      <rect x="330" y="128" width="6" height="26" rx="2" fill="#a8a29e" />

      {/* Sun / window glow */}
      <circle cx="60" cy="60" r="30" fill="#fef3c7" opacity="0.7" />
      <circle cx="60" cy="60" r="14" fill="#fde68a" opacity="0.9" />
    </svg>
  );
}

export function PassportIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pp-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>
        <linearGradient id="pp-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="#f0fdf4" />

      {/* Card */}
      <rect x="60" y="70" width="200" height="180" rx="16" fill="url(#pp-card)" />
      <rect x="60" y="70" width="200" height="44" rx="16" fill="#ffffff" opacity="0.05" />

      {/* Header line */}
      <rect x="84" y="92" width="90" height="10" rx="5" fill="#a1a1aa" />
      <rect x="84" y="110" width="60" height="6" rx="3" fill="#52525b" />

      {/* QR code */}
      <rect x="84" y="140" width="68" height="68" rx="6" fill="#ffffff" />
      <g fill="#18181b">
        <rect x="92" y="148" width="14" height="14" />
        <rect x="118" y="148" width="14" height="14" />
        <rect x="92" y="174" width="14" height="14" />
        <rect x="118" y="186" width="14" height="14" />
        <rect x="134" y="148" width="10" height="10" />
        <rect x="106" y="166" width="10" height="10" />
        <rect x="130" y="170" width="10" height="10" />
      </g>

      {/* Detail lines */}
      <rect x="168" y="146" width="76" height="8" rx="4" fill="#71717a" />
      <rect x="168" y="164" width="60" height="8" rx="4" fill="#71717a" />
      <rect x="168" y="182" width="68" height="8" rx="4" fill="#71717a" />
      <rect x="168" y="200" width="50" height="8" rx="4" fill="#71717a" />

      {/* Verified badge */}
      <circle cx="234" cy="226" r="26" fill="url(#pp-glow)" />
      <path
        d="M223 226l8 8 14-16"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function VerifyScanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vs-phone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="130" r="120" fill="#fffbeb" />

      {/* Phone */}
      <rect x="100" y="40" width="120" height="200" rx="18" fill="url(#vs-phone)" />
      <rect x="112" y="58" width="96" height="150" rx="6" fill="#fafafa" />
      <rect x="148" y="218" width="24" height="6" rx="3" fill="#52525b" />

      {/* QR on screen */}
      <g fill="#18181b">
        <rect x="128" y="78" width="60" height="60" rx="4" fill="#f4f4f4" />
        <rect x="136" y="86" width="12" height="12" />
        <rect x="160" y="86" width="12" height="12" />
        <rect x="136" y="110" width="12" height="12" />
        <rect x="160" y="118" width="12" height="12" />
        <rect x="148" y="100" width="10" height="10" />
      </g>

      <rect x="128" y="150" width="64" height="8" rx="4" fill="#d4d4d8" />
      <rect x="128" y="166" width="48" height="8" rx="4" fill="#d4d4d8" />
      <rect x="128" y="182" width="56" height="8" rx="4" fill="#d4d4d8" />

      {/* Scan corners */}
      <g stroke="#10b981" strokeWidth="4" strokeLinecap="round">
        <path d="M118 68v-8a4 4 0 0 1 4-4h8" />
        <path d="M198 56h8a4 4 0 0 1 4 4v8" />
        <path d="M210 148v8a4 4 0 0 1-4 4h-8" />
        <path d="M130 160h-8a4 4 0 0 1-4-4v-8" />
      </g>

      {/* Floating check badge */}
      <circle cx="248" cy="70" r="28" fill="#10b981" />
      <path
        d="M236 70l8 8 16-18"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="70" cy="60" r="4" fill="#fbbf24" />
      <circle cx="56" cy="100" r="3" fill="#fbbf24" />
      <circle cx="252" cy="190" r="4" fill="#fbbf24" />
    </svg>
  );
}
