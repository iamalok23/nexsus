import React from 'react'
import { ArrowRight, Navigation, ShieldAlert, Radio, DollarSign, Cpu } from 'lucide-react'

/**
 * 1. Financial Loop Thumbnail:
 * Interactive glowing node-link graph showing Hawala fund layering
 */
export const FinancialLoopThumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative w-full h-28 bg-[#040812]/90 rounded-xs border border-cyan-500/20 overflow-hidden p-2 select-none ${className || ''}`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff05_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff05_1px,transparent_1px)] bg-[size:12px_12px]" />
      
      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800/60 pb-1 mb-1">
        <span className="flex items-center gap-1 text-cyan-400">
          <DollarSign className="h-3 w-3" />
          <span>LAYERED FUND FLOW MAP</span>
        </span>
        <span className="text-emerald-400 font-semibold tabular-nums">₹12.5L TOTAL</span>
      </div>

      <svg viewBox="0 0 320 80" className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="flow-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="flow-return" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow-p" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Curved Flow Links with Animated Dashes */}
        <path
          d="M 40 40 C 70 15, 110 15, 140 40"
          fill="none"
          stroke="url(#flow-cyan)"
          strokeWidth="2"
          strokeDasharray="4 3"
          className="animate-[dash_15s_linear_infinite]"
        />
        <path
          d="M 140 40 C 175 65, 225 65, 260 40"
          fill="none"
          stroke="url(#flow-cyan)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <path
          d="M 260 40 C 200 -5, 100 -5, 40 40"
          fill="none"
          stroke="url(#flow-return)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Transfer amount tags */}
        <text x="85" y="24" fill="#00f0ff" fontSize="7" fontFamily="monospace" textAnchor="middle">₹5.2L</text>
        <text x="200" y="66" fill="#10b981" fontSize="7" fontFamily="monospace" textAnchor="middle">₹4.1L</text>
        <text x="150" y="8" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">LOOP CLOSURE</text>

        {/* Node 1: Bullion Source */}
        <g transform="translate(40, 40)">
          <circle r="9" fill="#0c1527" stroke="#00f0ff" strokeWidth="1.5" filter="url(#glow-p)" />
          <circle r="4" fill="#00f0ff" />
          <text y="17" fill="#cbd5e1" fontSize="7" fontFamily="monospace" textAnchor="middle">CHANDNI</text>
        </g>

        {/* Node 2: Amit Yadav (Mule) */}
        <g transform="translate(140, 40)">
          <circle r="9" fill="#0c1527" stroke="#f59e0b" strokeWidth="1.5" filter="url(#glow-p)" />
          <circle r="4" fill="#f59e0b" />
          <text y="17" fill="#cbd5e1" fontSize="7" fontFamily="monospace" textAnchor="middle">GHAZIABAD</text>
        </g>

        {/* Node 3: Priya Singh (Shell) */}
        <g transform="translate(260, 40)">
          <circle r="9" fill="#0c1527" stroke="#10b981" strokeWidth="1.5" filter="url(#glow-p)" />
          <circle r="4" fill="#10b981" />
          <text y="17" fill="#cbd5e1" fontSize="7" fontFamily="monospace" textAnchor="middle">LUCKNOW</text>
        </g>
      </svg>
    </div>
  )
}

/**
 * 2. Highway Transit Thumbnail:
 * Route waypoint indicator for Yamuna Expressway convoy transit
 */
export const HighwayTransitThumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative w-full h-28 bg-[#040812]/90 rounded-xs border border-amber-500/20 overflow-hidden p-2 select-none ${className || ''}`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffb70305_1px,transparent_1px),linear-gradient(to_bottom,#ffb70305_1px,transparent_1px)] bg-[size:12px_12px]" />

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800/60 pb-1 mb-1">
        <span className="flex items-center gap-1 text-amber-400">
          <Navigation className="h-3 w-3" />
          <span>YAMUNA EXPRESSWAY CORRIDOR</span>
        </span>
        <span className="text-amber-300 font-semibold tabular-nums">18-MIN CONVOY GAP</span>
      </div>

      <svg viewBox="0 0 320 80" className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Highway Guideline */}
        <line x1="20" y1="36" x2="300" y2="36" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
        <line x1="20" y1="36" x2="300" y2="36" stroke="url(#route-gradient)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="36" x2="300" y2="36" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />

        {/* Waypoint 1: Noida Sec 62 */}
        <g transform="translate(30, 36)">
          <circle r="4" fill="#0c1527" stroke="#06b6d4" strokeWidth="1.5" />
          <text y="-8" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">NOIDA 62</text>
          <text y="14" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">KM 0</text>
        </g>

        {/* Waypoint 2: Jewar Toll (Interception Zone) */}
        <g transform="translate(135, 36)">
          <circle r="12" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" className="animate-pulse" />
          <circle r="6" fill="#f59e0b" stroke="#000" strokeWidth="1" />
          <text y="-10" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">JEWAR TOLL</text>
          <text y="18" fill="#f59e0b" fontSize="6" fontFamily="monospace" textAnchor="middle">UP14 AB 1234</text>
        </g>

        {/* Lag Blip: DL01 CA 9988 */}
        <g transform="translate(90, 36)">
          <circle r="5" fill="#00f0ff" stroke="#000" strokeWidth="1" />
          <text y="18" fill="#00f0ff" fontSize="6" fontFamily="monospace" textAnchor="middle">DL01 CA 9988</text>
          <line x1="90" y1="28" x2="135" y2="28" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
          <text x="112" y="24" fill="#f59e0b" fontSize="6" fontFamily="monospace" textAnchor="middle">18m</text>
        </g>

        {/* Waypoint 3: Mathura Bypass */}
        <g transform="translate(215, 36)">
          <circle r="3.5" fill="#0c1527" stroke="#64748b" strokeWidth="1.5" />
          <text y="-8" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">MATHURA</text>
          <text y="14" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">KM 140</text>
        </g>

        {/* Waypoint 4: Lucknow ORR */}
        <g transform="translate(290, 36)">
          <circle r="4" fill="#0c1527" stroke="#ef4444" strokeWidth="1.5" />
          <text y="-8" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">LUCKNOW</text>
          <text y="14" fill="#64748b" fontSize="6" fontFamily="monospace" textAnchor="middle">KM 302</text>
        </g>
      </svg>
    </div>
  )
}

/**
 * 3. Telecom Burst Thumbnail:
 * CDR noctural call burst frequency chart & cell tower triangulation
 */
export const TelecomBurstThumbnail: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative w-full h-28 bg-[#040812]/90 rounded-xs border border-purple-500/20 overflow-hidden p-2 select-none ${className || ''}`}>
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f705_1px,transparent_1px),linear-gradient(to_bottom,#a855f705_1px,transparent_1px)] bg-[size:12px_12px]" />

      {/* Header telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-400 border-b border-slate-800/60 pb-1 mb-1">
        <span className="flex items-center gap-1 text-purple-400">
          <Radio className="h-3 w-3" />
          <span>CDR NOCTURNAL BURST SPECTRUM</span>
        </span>
        <span className="text-purple-300 font-semibold tabular-nums">01:00 - 03:30 AM</span>
      </div>

      <svg viewBox="0 0 320 80" className="w-full h-16 overflow-visible">
        <defs>
          <linearGradient id="bar-purple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Baseline grid */}
        <line x1="20" y1="52" x2="300" y2="52" stroke="#1e293b" strokeWidth="1" />

        {/* Daytime quiet hours (bars 1-8) */}
        {[8, 5, 6, 4, 3, 7, 5, 6].map((h, i) => (
          <rect
            key={i}
            x={30 + i * 11}
            y={52 - h}
            width="6"
            height={h}
            fill="#334155"
            opacity="0.5"
            rx="1"
          />
        ))}

        {/* Peak nocturnal call burst (01:00 - 03:30 AM) */}
        {[28, 42, 38, 48, 44, 39, 45, 32].map((h, i) => (
          <rect
            key={`burst-${i}`}
            x={130 + i * 12}
            y={52 - h}
            width="7"
            height={h}
            fill="url(#bar-purple)"
            rx="1"
            className="hover:opacity-80"
          />
        ))}

        {/* Late night decay (bars) */}
        {[10, 7, 8, 4, 6].map((h, i) => (
          <rect
            key={`decay-${i}`}
            x={235 + i * 11}
            y={52 - h}
            width="6"
            height={h}
            fill="#334155"
            opacity="0.5"
            rx="1"
          />
        ))}

        {/* Highlight Burst Zone Marker */}
        <rect x="125" y="2" width="102" height="54" fill="#a855f7" opacity="0.08" rx="2" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x="176" y="10" fill="#e9d5ff" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          48 BURST CALLS
        </text>

        {/* Tower triangulation labels */}
        <text x="30" y="62" fill="#64748b" fontSize="6" fontFamily="monospace">GHAZIABAD BTS</text>
        <text x="155" y="62" fill="#c084fc" fontSize="6" fontFamily="monospace">PEAK ENCRYPTED BURST</text>
        <text x="240" y="62" fill="#64748b" fontSize="6" fontFamily="monospace">MIRZAPUR TOWER</text>
      </svg>
    </div>
  )
}
