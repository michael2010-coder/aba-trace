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

      {/* Seated artisan */}
      <g>
        <path d="M132 240c0-32 22-50 50-50s50 18 50 50v4h-100z" fill="#3f3f46" />
        <path d="M150 244c-2-22 4-40 14-50" stroke="#27272a" strokeWidth="10" strokeLinecap="round" fill="none" />
        <circle cx="182" cy="172" r="26" fill="#9a6a4a" />
        <path
          d="M157 170c0-18 11-30 25-30s25 12 25 30v-6c0-16-11-28-25-28s-25 12-25 28Z"
          fill="#241710"
        />
        {/* Working arm + awl toward the shoe last */}
        <path d="M222 226c14-2 26-8 36-18" stroke="#9a6a4a" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M255 210l14-10" stroke="#71717a" strokeWidth="4" strokeLinecap="round" />
      </g>

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


export function ArtisanPortraitIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ap-apron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="#fffbeb" />

      {/* Shoulders / apron */}
      <path d="M62 286c0-52 44-84 98-84s98 32 98 84v6H62Z" fill="url(#ap-apron)" />
      <path d="M118 214l8 78M202 214l-8 78" stroke="#fde68a" strokeWidth="3" opacity="0.4" strokeLinecap="round" />
      <rect x="138" y="236" width="44" height="36" rx="6" fill="#92400e" />
      <path d="M144 254h32M144 262h32" stroke="#fde68a" strokeWidth="2" opacity="0.5" strokeLinecap="round" />

      {/* Neck */}
      <rect x="146" y="186" width="28" height="28" rx="8" fill="#9a6a4a" />

      {/* Head */}
      <circle cx="160" cy="152" r="46" fill="#9a6a4a" />

      {/* Hair */}
      <path
        d="M114 152c0-26 20-46 46-46s46 20 46 46v-10c0-22-21-40-46-40s-46 18-46 40Z"
        fill="#241710"
      />
      <path d="M114 150c-6 4-8 12-6 22M206 150c6 4 8 12 6 22" stroke="#241710" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Tool (awl) held at the side */}
      <g transform="translate(228 220) rotate(35)">
        <rect x="0" y="0" width="48" height="8" rx="4" fill="#a8a29e" />
        <path d="M48 4l16 0" stroke="#71717a" strokeWidth="8" strokeLinecap="round" />
        <rect x="-22" y="-4" width="24" height="16" rx="4" fill="#78350f" />
      </g>

      {/* Verified badge */}
      <circle cx="240" cy="96" r="28" fill="#059669" />
      <path
        d="M228 96l8 8 16-18"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="70" cy="80" r="4" fill="#fde68a" />
      <circle cx="56" cy="200" r="3" fill="#fde68a" />
    </svg>
  );
}

export function ArtisanStitchingIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="as-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="#fffbeb" />

      {/* Small artisan bust, working */}
      <path d="M52 150c0-30 24-50 54-50s54 20 54 50v8H52Z" fill="#3f3f46" />
      <circle cx="106" cy="92" r="26" fill="#9a6a4a" />
      <path d="M82 92c0-15 11-26 24-26s24 11 24 26v-5c0-13-11-23-24-23s-24 10-24 23Z" fill="#241710" />

      {/* Leather piece being worked on */}
      <rect x="120" y="150" width="140" height="100" rx="14" fill="url(#as-leather)" transform="rotate(-6 190 200)" />
      <path
        d="M140 180c40-10 90-10 120 4"
        stroke="#fde68a"
        strokeWidth="3"
        strokeDasharray="6 6"
        strokeLinecap="round"
        opacity="0.7"
        transform="rotate(-6 190 200)"
      />

      {/* Hands gripping the leather */}
      <path d="M118 232c-6-10-4-22 6-28 10-6 22-2 26 8l4 10-30 16Z" fill="#9a6a4a" />
      <path d="M256 226c8-8 10-20 2-28-8-8-20-6-26 2l-6 10 24 22Z" fill="#9a6a4a" />

      {/* Needle and thread */}
      <path d="M214 152l30-26" stroke="#71717a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="244" cy="126" r="3" fill="#71717a" />
      <path
        d="M214 152c-20 6-44 6-64-2"
        stroke="#d97706"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="252" cy="78" r="4" fill="#fde68a" />
      <circle cx="62" cy="244" r="3" fill="#fde68a" />
    </svg>
  );
}

export function ArtisanHandoffIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 280" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ah-apron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <circle cx="170" cy="140" r="135" fill="#f0fdf4" />

      {/* Artisan (left) */}
      <path d="M30 250c0-40 30-66 68-66s68 26 68 66v6H30Z" fill="url(#ah-apron)" />
      <rect x="86" y="158" width="24" height="24" rx="7" fill="#9a6a4a" />
      <circle cx="98" cy="128" r="36" fill="#9a6a4a" />
      <path d="M62 128c0-20 16-36 36-36s36 16 36 36v-8c0-17-16-31-36-31s-36 14-36 31Z" fill="#241710" />
      <path d="M134 196c14-2 26-10 34-22" stroke="#9a6a4a" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Customer (right) */}
      <path d="M204 250c0-38 28-62 64-62s64 24 64 62v6H204Z" fill="#3f3f46" />
      <rect x="256" y="160" width="22" height="22" rx="7" fill="#7c5234" />
      <circle cx="267" cy="132" r="34" fill="#7c5234" />
      <path d="M233 132c0-19 15-34 34-34s34 15 34 34v-7c0-16-15-29-34-29s-34 13-34 29Z" fill="#1c1410" />
      <path d="M204 192c-13-2-24-9-32-20" stroke="#7c5234" strokeWidth="10" strokeLinecap="round" fill="none" />

      {/* Passport tag exchanged between them */}
      <g transform="translate(150 150)">
        <path d="M16 0h36a8 8 0 0 1 8 8v34l-26 26-26-26V8a8 8 0 0 1 8-8Z" fill="#18181b" />
        <circle cx="34" cy="-4" r="5" fill="#fafafa" />
        <rect x="22" y="14" width="24" height="24" rx="3" fill="#ffffff" />
        <g fill="#18181b">
          <rect x="26" y="18" width="6" height="6" />
          <rect x="38" y="18" width="6" height="6" />
          <rect x="26" y="30" width="6" height="6" />
        </g>
      </g>

      {/* Verified badge */}
      <circle cx="194" cy="92" r="26" fill="#059669" />
      <path
        d="M183 92l7 7 14-16"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="60" cy="60" r="4" fill="#86efac" />
      <circle cx="288" cy="70" r="3" fill="#86efac" />
    </svg>
  );
}

export function AdminReviewIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ar-badge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="#f0fdf4" />

      {/* ID card with artisan portrait */}
      <rect x="56" y="92" width="160" height="120" rx="12" fill="#ffffff" stroke="#e4e4e7" strokeWidth="2" />
      <circle cx="92" cy="132" r="20" fill="#9a6a4a" />
      <path d="M72 132c0-12 9-21 20-21s20 9 20 21v-4c0-10-9-18-20-18s-20 8-20 18Z" fill="#241710" />
      <rect x="124" y="120" width="74" height="8" rx="4" fill="#a1a1aa" />
      <rect x="124" y="138" width="54" height="8" rx="4" fill="#d4d4d8" />
      <rect x="72" y="168" width="128" height="6" rx="3" fill="#e4e4e7" />
      <rect x="72" y="184" width="100" height="6" rx="3" fill="#e4e4e7" />

      {/* Admin figure reviewing */}
      <path d="M180 280c0-34 26-56 58-56s58 22 58 56v4H180Z" fill="#3f3f46" />
      <circle cx="238" cy="188" r="30" fill="#7c5234" />
      <path d="M210 188c0-16 13-29 28-29s28 13 28 29v-6c0-14-13-25-28-25s-28 11-28 25Z" fill="#1c1410" />

      {/* Magnifying glass over the ID */}
      <circle cx="178" cy="160" r="34" fill="#ffffff" opacity="0.35" stroke="#18181b" strokeWidth="6" />
      <line x1="200" y1="184" x2="222" y2="206" stroke="#18181b" strokeWidth="8" strokeLinecap="round" />

      {/* Approved badge */}
      <circle cx="240" cy="248" r="26" fill="url(#ar-badge)" />
      <path
        d="M229 248l7 7 14-16"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Sparkles */}
      <circle cx="60" cy="76" r="4" fill="#86efac" />
      <circle cx="56" cy="240" r="3" fill="#86efac" />
    </svg>
  );
}




export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 320" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nf-compass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="160" r="150" fill="#fef2f2" />

      {/* Dashed path */}
      <path
        d="M60 240c40-10 70-50 70-90s30-50 70-30"
        stroke="#fca5a5"
        strokeWidth="4"
        strokeDasharray="6 8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Compass body */}
      <circle cx="170" cy="150" r="70" fill="#ffffff" stroke="url(#nf-compass)" strokeWidth="8" />
      <circle cx="170" cy="150" r="54" fill="#fafafa" />

      {/* Needle */}
      <path d="M170 110l16 46-16 -6 -16 6Z" fill="#ef4444" />
      <path d="M170 190l-16-46 16 6 16-6Z" fill="#a1a1aa" />
      <circle cx="170" cy="150" r="6" fill="url(#nf-compass)" />

      {/* Question mark badge */}
      <circle cx="232" cy="226" r="28" fill="#ef4444" />
      <text x="232" y="237" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#ffffff" fontFamily="sans-serif">
        ?
      </text>

      {/* Sparkles */}
      <circle cx="70" cy="80" r="4" fill="#fca5a5" />
      <circle cx="248" cy="90" r="3" fill="#fca5a5" />
    </svg>
  );
}
