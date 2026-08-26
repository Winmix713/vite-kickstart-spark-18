```App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/themeContext'
import { SidebarProvider } from './contexts/sidebarContext'
import DashboardLayout from './components/layout/DashboardLayout'
import HomePage from './pages/HomePage'
import BrandBook from './pages/BrandBook'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminHealth from './pages/admin/AdminHealth'
import AdminJobs from './pages/admin/AdminJobs'
import AdminPredictions from './pages/admin/AdminPredictions'
import AdminStats from './pages/admin/AdminStats'
import AdminModels from './pages/admin/AdminModels'
import AdminPhase9 from './pages/admin/AdminPhase9'
import AdminFeedback from './pages/admin/AdminFeedback'

type HeroVariant = 'immersive' | 'compact'

interface AppProps {
  /** Match selector treatment: full-screen immersive selector or compact card grid */
  heroVariant?: HeroVariant
  /** Animated ambient layer (gradient mesh, glow orbs, grid lines) across the app */
  cinematicAtmosphere?: boolean
  /** Show the Deep Analysis section (BTTS chart + league table) on the dashboard */
  showDeepAnalysis?: boolean
}

function App({
  heroVariant = 'immersive',
  cinematicAtmosphere = true,
  showDeepAnalysis = true,
}: AppProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SidebarProvider>
          <Routes>
            <Route
              element={
                <DashboardLayout cinematicAtmosphere={cinematicAtmosphere} />
              }
            >
              <Route
                path="/"
                element={
                  <HomePage
                    heroVariant={heroVariant}
                    showDeepAnalysis={showDeepAnalysis}
                  />
                }
              />
              <Route path="/brand-book" element={<BrandBook />} />
              <Route
                path="/jobs"
                element={<div>Scheduled Jobs Page (Phase 3)</div>}
              />
              <Route
                path="/analytics"
                element={<div>Analytics Page (Phase 4)</div>}
              />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/health" element={<AdminHealth />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/predictions" element={<AdminPredictions />} />
              <Route path="/admin/stats" element={<AdminStats />} />
              <Route path="/admin/models" element={<AdminModels />} />
              <Route path="/admin/phase9" element={<AdminPhase9 />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
export default App

```
```components/dashboard/BTTSChart.tsx
import React, { useMemo, useState, useRef } from 'react'
import { BTTSData } from '../../types/matches'
import { TrendingUp, Info } from 'lucide-react'
import { colors, animations } from '../../constants/designTokens'
interface BttsChartProps {
  data: BTTSData[]
}
const BttsChart: React.FC<BttsChartProps> = ({ data }) => {
  const [hoverData, setHoverData] = useState<{
    x: number
    y: number
    value: number
    index: number
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = 100
  const height = 40
  const getPath = (
    points: {
      x: number
      y: number
    }[],
  ) => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const x0 = i > 0 ? points[i - 1].x : points[0].x
      const y0 = i > 0 ? points[i - 1].y : points[0].y
      const x1 = points[i].x
      const y1 = points[i].y
      const x2 = points[i + 1].x
      const y2 = points[i + 1].y
      const x3 = i !== points.length - 2 ? points[i + 2].x : x2
      const y3 = i !== points.length - 2 ? points[i + 2].y : y2
      const cp1x = x1 + (x2 - x0) / 6
      const cp1y = y1 + (y2 - y0) / 6
      const cp2x = x2 - (x3 - x1) / 6
      const cp2y = y2 - (y3 - y1) / 6
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`
    }
    return d
  }
  const { pathString, areaPath, points } = useMemo(() => {
    if (!data.length)
      return {
        pathString: '',
        areaPath: '',
        points: [],
      }
    const maxVal = Math.max(...data.map((d) => d.bttsCount), 1)
    const minVal = 0
    const normalizedPoints = data.map((d, i) => ({
      x: (i / (data.length - 1)) * width,
      y:
        height -
        ((d.bttsCount - minVal) / (maxVal - minVal)) * (height * 0.7) -
        5,
      value: d.bttsCount,
      originalIndex: i,
    }))
    const line = getPath(normalizedPoints)
    const area = `${line} L ${width},${height} L 0,${height} Z`
    return {
      pathString: line,
      areaPath: area,
      points: normalizedPoints,
    }
  }, [data])
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !points.length) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const relX = (x / rect.width) * width
    const closest = points.reduce((prev, curr) =>
      Math.abs(curr.x - relX) < Math.abs(prev.x - relX) ? curr : prev,
    )
    setHoverData({
      ...closest,
      index: closest.originalIndex,
    })
  }
  return (
    <div className="glass-card flex flex-col h-full relative group overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264]/5 blur-[80px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="p-6 md:p-8 relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              BTTS Momentum
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-zinc-400 font-mono uppercase tracking-wider">
              Last 30 Days
            </span>
          </div>
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            Both Teams To Score frequency analysis using smoothed goal data
            points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#BEF264]/10 border border-[#BEF264]/20 shadow-[0_0_15px_rgba(190,242,100,0.1)]">
            <TrendingUp className="w-4 h-4 text-[#BEF264]" />
            <span className="text-xs font-bold text-[#BEF264] uppercase tracking-wide">
              High Trend
            </span>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 w-full relative z-10 cursor-crosshair px-2 pb-4"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible filter drop-shadow-[0_0_20px_rgba(190,242,100,0.2)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
              <stop offset="50%" stopColor={colors.primary} stopOpacity="0.1" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Reference Line */}
          <line
            x1="0"
            y1={height * 0.5}
            x2={width}
            y2={height * 0.5}
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />

          {/* Area Fill */}
          <path
            d={areaPath}
            fill="url(#chartFill)"
            className="transition-opacity duration-300"
          />

          {/* Main Line */}
          <path
            d={pathString}
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.8"
            strokeLinecap="round"
            className="transition-all duration-300"
            filter="url(#glow)"
          />

          {/* Hover Effects */}
          {hoverData && (
            <g>
              <line
                x1={hoverData.x}
                y1="0"
                x2={hoverData.x}
                y2={height}
                stroke="white"
                strokeOpacity="0.2"
                strokeWidth="0.5"
                strokeDasharray="1 1"
              />
              <circle
                cx={hoverData.x}
                cy={hoverData.y}
                r="3"
                fill={colors.primary}
                className="animate-pulse"
                filter="url(#glow)"
              />
              <circle cx={hoverData.x} cy={hoverData.y} r="1.5" fill="white" />

              <foreignObject
                x={Math.min(hoverData.x - 12, width - 25)}
                y={hoverData.y - 15}
                width="50"
                height="30"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-zinc-900/90 border border-white/10 rounded-md px-2 py-1 text-[8px] text-center text-white font-mono shadow-xl backdrop-blur-md transform -translate-y-2">
                    <span className="text-[#BEF264] font-bold">
                      {hoverData.value}
                    </span>{' '}
                    Goals
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-zinc-900/90 transform -translate-y-2"></div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
export default BttsChart

```
```components/dashboard/HeroSection.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  lazy,
  memo,
  Component,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  BarChart2,
  History,
  Zap,
  Check,
  Search,
  ChevronDown,
  Sparkles,
  AlertCircle,
  X,
  Info,
  Trophy,
  Menu,
  Loader2,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useIsMobile } from '../../hooks/use-mobile'
import { colors, animations } from '../../constants/designTokens'
// =============================================================================
// TYPES & INTERFACES
// =============================================================================
type LeagueId = 'english' | 'spanish' | 'mixed'
interface Match {
  home: string | null
  away: string | null
}
interface NavItem {
  icon: ComponentType<{
    className?: string
  }>
  label: string
  path: string
  disabled?: boolean
}
interface LeagueOption {
  id: LeagueId
  label: string
  flag: string
  short: string
}
interface TeamDropdownProps {
  side: 'home' | 'away'
  label: string
  value: string | null
  onChange: (team: string) => void
  teams: string[]
  exclude: Set<string>
  isActive: boolean
}
interface MatchCardProps {
  index: number
  homeTeam: string | null
  awayTeam: string | null
  teams: string[]
  excludeTeams: Set<string>
  onHomeChange: (team: string) => void
  onAwayChange: (team: string) => void
}
interface ProgressRingProps {
  current: number
  total: number
  size?: number
  strokeWidth?: number
}
// =============================================================================
// CONSTANTS
// =============================================================================
const NAV_ITEMS: NavItem[] = [
  {
    icon: Layers,
    label: 'Match Selector',
    path: '/',
  },
  {
    icon: BarChart2,
    label: 'Statistics',
    path: '/stats',
    disabled: true,
  },
  {
    icon: History,
    label: 'History',
    path: '/history',
    disabled: true,
  },
]
const LEAGUE_OPTIONS: readonly LeagueOption[] = [
  {
    id: 'english',
    label: 'Premier League',
    flag: '🇬🇧',
    short: 'EPL',
  },
  {
    id: 'spanish',
    label: 'La Liga',
    flag: '🇪🇸',
    short: 'LIGA',
  },
  {
    id: 'mixed',
    label: 'Mixed League',
    flag: '🌍',
    short: 'MIX',
  },
] as const
const TEAM_LOGOS: Record<string, string> = {
  // English Premier League
  'Aston Lions':
    'https://resources.premierleague.com/premierleague/badges/50/t7.png',
  Brentford:
    'https://resources.premierleague.com/premierleague/badges/50/t94.png',
  Brighton:
    'https://resources.premierleague.com/premierleague/badges/50/t36.png',
  Chelsea: 'https://resources.premierleague.com/premierleague/badges/50/t8.png',
  'Crystal Palace':
    'https://resources.premierleague.com/premierleague/badges/50/t31.png',
  Everton:
    'https://resources.premierleague.com/premierleague/badges/50/t11.png',
  Fulham: 'https://resources.premierleague.com/premierleague/badges/50/t54.png',
  Liverpool:
    'https://resources.premierleague.com/premierleague/badges/50/t14.png',
  'London Gunners':
    'https://resources.premierleague.com/premierleague/badges/50/t3.png',
  'Manchester Blues':
    'https://resources.premierleague.com/premierleague/badges/50/t43.png',
  Newcastle:
    'https://resources.premierleague.com/premierleague/badges/50/t4.png',
  Nottingham:
    'https://resources.premierleague.com/premierleague/badges/50/t17.png',
  Tottenham:
    'https://resources.premierleague.com/premierleague/badges/50/t6.png',
  'Red Devils':
    'https://resources.premierleague.com/premierleague/badges/50/t1.png',
  'West Ham':
    'https://resources.premierleague.com/premierleague/badges/50/t21.png',
  Wolverhampton:
    'https://resources.premierleague.com/premierleague/badges/50/t39.png',
  // Spanish La Liga
  Alaves: 'https://assets.laliga.com/assets/2019/06/07/small/alaves.png',
  Barcelona: 'https://assets.laliga.com/assets/2019/06/07/small/barcelona.png',
  Bilbao: 'https://assets.laliga.com/assets/2019/06/07/small/athletic.png',
  Elche: 'https://assets.laliga.com/assets/2020/08/24/small/elche.png',
  Getafe: 'https://assets.laliga.com/assets/2019/06/07/small/getafe.png',
  Girona: 'https://assets.laliga.com/assets/2022/06/20/small/girona.png',
  'Real Madrid White':
    'https://assets.laliga.com/assets/2019/06/07/small/real-madrid.png',
  'Real Madrid Red':
    'https://assets.laliga.com/assets/2019/06/07/small/atletico.png',
  Mallorca: 'https://assets.laliga.com/assets/2019/06/07/small/mallorca.png',
  Osasuna: 'https://assets.laliga.com/assets/2019/06/07/small/osasuna.png',
  'San Sebastian':
    'https://assets.laliga.com/assets/2019/06/07/small/real-sociedad.png',
  'Sevilla Red':
    'https://assets.laliga.com/assets/2019/06/07/small/sevilla.png',
  'Sevilla Green':
    'https://assets.laliga.com/assets/2019/06/07/small/betis.png',
  Valencia: 'https://assets.laliga.com/assets/2019/06/07/small/valencia.png',
  Vigo: 'https://assets.laliga.com/assets/2019/06/07/small/celta.png',
  Villarreal:
    'https://assets.laliga.com/assets/2019/06/07/small/villarreal.png',
}
const LEAGUES_DATA = {
  ENGLISH: [
    'Aston Lions',
    'Brentford',
    'Brighton',
    'Chelsea',
    'Crystal Palace',
    'Everton',
    'Fulham',
    'Liverpool',
    'London Gunners',
    'Manchester Blues',
    'Newcastle',
    'Nottingham',
    'Tottenham',
    'Red Devils',
    'West Ham',
    'Wolverhampton',
  ],
  SPANISH: [
    'Alaves',
    'Barcelona',
    'Bilbao',
    'Elche',
    'Getafe',
    'Girona',
    'Real Madrid White',
    'Real Madrid Red',
    'Mallorca',
    'Osasuna',
    'San Sebastian',
    'Sevilla Red',
    'Sevilla Green',
    'Valencia',
    'Vigo',
    'Villarreal',
  ],
}
const TEAMS_BY_LEAGUE: Record<LeagueId, string[]> = {
  english: LEAGUES_DATA.ENGLISH,
  spanish: LEAGUES_DATA.SPANISH,
  mixed: [
    ...LEAGUES_DATA.ENGLISH.slice(0, 10),
    ...LEAGUES_DATA.SPANISH.slice(0, 10),
  ],
}
// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================
const getTeamLogo = (teamName: string): string | null =>
  TEAM_LOGOS[teamName] || null
// =============================================================================
// COMPONENT: PARTICLE CANVAS
// =============================================================================
const ParticleCanvas = memo(({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useIsMobile()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    let animationFrame: number
    // Optimize particle count for mobile
    const particleCount = isMobile ? 15 : 30
    const particles = Array.from(
      {
        length: particleCount,
      },
      () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3,
      }),
    )
    const render = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
        ctx.beginPath()
        ctx.fillStyle = `rgba(190, 242, 100, ${p.opacity})`
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      animationFrame = requestAnimationFrame(render)
    }
    render()
    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile])
  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 pointer-events-none opacity-30 -z-10',
        className,
      )}
      aria-hidden="true"
      style={{
        willChange: 'transform',
      }}
    />
  )
})
ParticleCanvas.displayName = 'ParticleCanvas'
// =============================================================================
// COMPONENT: PROGRESS RING
// =============================================================================
const ProgressRing = memo(
  ({ current, total, size = 40, strokeWidth = 3 }: ProgressRingProps) => {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    return (
      <div
        className="flex items-center gap-3 sm:gap-4 bg-zinc-900/50 rounded-xl p-2 pr-3 sm:pr-4 border border-white/5 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-label={`Selection progress: ${current} of ${total} teams selected`}
      >
        <div
          className="relative shrink-0"
          style={{
            width: size,
            height: size,
          }}
          aria-hidden="true"
        >
          <svg className="w-full h-full -rotate-90 transform">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-zinc-800"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[#BEF264] transition-all duration-700 ease-out shadow-[0_0_10px_#BEF264]"
              style={{
                willChange: 'stroke-dashoffset',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            {current === total ? (
              <motion.div
                initial={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
              >
                <Check
                  className="w-3.5 h-3.5 text-[#BEF264]"
                  aria-label="Complete"
                />
              </motion.div>
            ) : (
              current
            )}
          </div>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">
            Progress
          </div>
          <div className="text-xs font-mono tabular-nums text-[#BEF264]">
            <span className="font-bold">{current}</span>
            <span className="opacity-30 mx-1 text-white">/</span>
            <span className="text-zinc-500">{total}</span>
          </div>
        </div>
      </div>
    )
  },
)
ProgressRing.displayName = 'ProgressRing'
// =============================================================================
// COMPONENT: TEAM DROPDOWN
// =============================================================================
const TeamDropdown = memo(
  ({
    side,
    label,
    value,
    onChange,
    teams,
    exclude,
    isActive,
  }: TeamDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const containerRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const isMobile = useIsMobile()
    // Close dropdown on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    // Reset search when closing
    useEffect(() => {
      if (!isOpen) {
        setSearch('')
        setFocusedIndex(-1)
      } else {
        // Focus search input when opening
        setTimeout(() => {
          searchInputRef.current?.focus()
        }, 50)
      }
    }, [isOpen])
    // Filter available teams
    const availableTeams = useMemo(() => {
      return teams.filter((t: string) => {
        const isSelectedHere = t === value
        const isExcluded = exclude.has(t) && !isSelectedHere
        const matchesSearch = t.toLowerCase().includes(search.toLowerCase())
        return !isExcluded && matchesSearch
      })
    }, [teams, exclude, value, search])
    // Keyboard navigation
    const handleKeyDown = (
      e: KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
    ) => {
      if (!isOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        setIsOpen(true)
        return
      }
      if (!isOpen) return
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev < availableTeams.length - 1 ? prev + 1 : prev,
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0))
          break
        case 'Enter':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < availableTeams.length) {
            onChange(availableTeams[focusedIndex])
            setIsOpen(false)
          }
          break
        case 'Tab':
          // Trap focus within dropdown
          if (e.shiftKey) {
            // If shift+tab on search input, close or move to last item (simplified: close)
            if (document.activeElement === searchInputRef.current) {
              setIsOpen(false)
            }
          }
          break
      }
    }
    // Scroll focused item into view
    useEffect(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const items = listRef.current.children
        const focusedItem = items[focusedIndex + 1] as HTMLElement // +1 for search header
        if (focusedItem) {
          focusedItem.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
          })
        }
      }
    }, [focusedIndex])
    const selectedLogo = value ? getTeamLogo(value) : null
    return (
      <div className="flex-1 w-full relative group/input" ref={containerRef}>
        <label
          className={cn(
            'text-[9px] uppercase tracking-widest font-bold mb-2 block transition-colors ml-1',
            isActive ? 'text-zinc-300' : 'text-zinc-600',
          )}
          id={`${side}-label`}
        >
          {label}
        </label>

        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-labelledby={`${side}-label`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${side}-listbox`}
          className={cn(
            'relative w-full h-11 px-3 flex items-center justify-between gap-2 border rounded-xl transition-all duration-200 min-h-[44px]',
            isOpen
              ? 'border-[#BEF264] bg-zinc-900 shadow-[0_0_15px_-3px_rgba(190,242,100,0.3)]'
              : isActive
                ? 'bg-zinc-900/50 border-white/20 text-white shadow-inner'
                : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:bg-zinc-900 hover:border-white/10',
          )}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {value && selectedLogo ? (
              <>
                <motion.img
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  src={selectedLogo}
                  alt=""
                  className="w-6 h-6 object-contain drop-shadow-sm"
                />
                <span className="text-sm font-medium truncate text-white">
                  {value}
                </span>
              </>
            ) : (
              <span className="text-sm truncate opacity-50 pl-1">
                Select Team...
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-300 opacity-50 shrink-0',
              isOpen && 'rotate-180 text-[#BEF264] opacity-100',
            )}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Mobile backdrop */}
              {isMobile && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
              )}

              <motion.div
                initial={
                  isMobile
                    ? {
                        y: '100%',
                      }
                    : {
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                      }
                }
                animate={
                  isMobile
                    ? {
                        y: 0,
                      }
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }
                }
                exit={
                  isMobile
                    ? {
                        y: '100%',
                      }
                    : {
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                      }
                }
                transition={{
                  duration: 0.2,
                  ease: animations.easing.spring,
                }}
                className={cn(
                  'bg-[#111] border border-white/10 shadow-2xl z-[100] overflow-hidden flex flex-col ring-1 ring-black/50',
                  isMobile
                    ? 'fixed inset-x-0 bottom-0 rounded-t-2xl max-h-[70vh] pb-safe'
                    : 'absolute top-full left-0 right-0 mt-2 rounded-xl',
                )}
                id={`${side}-listbox`}
                role="listbox"
                aria-labelledby={`${side}-label`}
                ref={listRef}
              >
                {/* Mobile drag handle */}
                {isMobile && (
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3 shrink-0" />
                )}

                {/* Search Header */}
                <div className="p-2 border-b border-white/5 bg-[#111] sticky top-0 z-10 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search team..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-label="Search teams"
                      className="w-full h-10 pl-9 pr-3 bg-zinc-800/50 rounded-lg text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#BEF264]/50 border-none transition-all"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[240px] sm:max-h-[280px] overflow-y-auto p-1 custom-scrollbar">
                  {availableTeams.length > 0 ? (
                    availableTeams.map((team: string, index: number) => (
                      <button
                        key={team}
                        onClick={() => {
                          onChange(team)
                          setIsOpen(false)
                        }}
                        onMouseEnter={() => setFocusedIndex(index)}
                        role="option"
                        aria-selected={team === value}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all cursor-pointer group/item min-h-[44px]',
                          team === value
                            ? 'bg-[#BEF264]/10 text-[#BEF264]'
                            : focusedIndex === index
                              ? 'bg-white/10 text-white'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <img
                          src={getTeamLogo(team) || ''}
                          alt=""
                          className="w-6 h-6 object-contain opacity-70 group-hover/item:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                        <span className="text-sm font-medium">{team}</span>
                        {team === value && (
                          <motion.div
                            initial={{
                              scale: 0,
                            }}
                            animate={{
                              scale: 1,
                            }}
                          >
                            <Check className="ml-auto w-4 h-4" />
                          </motion.div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="py-6 text-center text-zinc-500 flex flex-col items-center gap-2">
                      <AlertCircle className="w-5 h-5 opacity-30" />
                      <span className="text-xs">No teams found</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
TeamDropdown.displayName = 'TeamDropdown'
// =============================================================================
// COMPONENT: MATCH CARD
// =============================================================================
const MatchCard = memo(
  ({
    index,
    homeTeam,
    awayTeam,
    teams,
    excludeTeams,
    onHomeChange,
    onAwayChange,
  }: MatchCardProps) => {
    const isComplete = homeTeam && awayTeam
    return (
      <motion.div
        whileHover={{
          scale: 1.01,
        }}
        className={cn(
          'relative flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border transition-all duration-300 group',
          isComplete
            ? 'bg-zinc-900/60 border-[#BEF264]/20 shadow-[inset_0_0_20px_-10px_rgba(190,242,100,0.1)]'
            : 'bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-zinc-900/30',
        )}
        role="group"
        aria-label={`Match ${index + 1}`}
      >
        {/* Index Badge */}
        <div className="shrink-0 flex flex-col items-center justify-center w-6 sm:w-8 h-full gap-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-zinc-500 font-bold group-hover:text-zinc-300 transition-colors">
            {index + 1}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          <TeamDropdown
            side="home"
            label="Home Team"
            value={homeTeam}
            onChange={onHomeChange}
            teams={teams}
            exclude={excludeTeams}
            isActive={!!homeTeam}
          />

          <div className="flex flex-col items-center pt-0 sm:pt-6 px-2 order-3 sm:order-2">
            <div
              className={cn(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border text-[9px] sm:text-[10px] font-black tracking-tighter transition-all duration-500 relative z-10',
                isComplete
                  ? 'bg-[#BEF264] border-[#BEF264] text-black scale-110 shadow-[0_0_20px_rgba(190,242,100,0.4)] rotate-0'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-600 rotate-45',
              )}
            >
              VS
            </div>
            {isComplete && (
              <motion.div
                initial={{
                  height: 0,
                }}
                animate={{
                  height: '100%',
                }}
                className="w-px bg-gradient-to-b from-[#BEF264]/50 to-transparent absolute top-1/2 left-1/2 -translate-x-1/2 -z-10 hidden sm:block"
              />
            )}
          </div>

          <TeamDropdown
            side="away"
            label="Away Team"
            value={awayTeam}
            onChange={onAwayChange}
            teams={teams}
            exclude={excludeTeams}
            isActive={!!awayTeam}
          />
        </div>
      </motion.div>
    )
  },
)
MatchCard.displayName = 'MatchCard'
// =============================================================================
// COMPONENT: SIDEBAR
// =============================================================================
const Sidebar = memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const location = useLocation()
    const isMobile = useIsMobile()
    const sidebarContent = (
      <>
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#BEF264]/5 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 mb-10 pl-1 relative z-10">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-[#BEF264] rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-6 h-6 text-[#BEF264] fill-current" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none tracking-tight">
              Neon<span className="text-[#BEF264]">Select</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mt-1.5 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#BEF264]" /> Pro
              Analytics
            </p>
          </div>
        </div>

        <nav className="space-y-2 flex-1 relative z-10">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden min-h-[44px]',
                location.pathname === item.path
                  ? 'text-[#BEF264] bg-[#BEF264]/5 shadow-[inset_0_0_0_1px_rgba(190,242,100,0.1)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5',
                item.disabled &&
                  'opacity-50 cursor-not-allowed pointer-events-none grayscale',
              )}
              aria-current={
                location.pathname === item.path ? 'page' : undefined
              }
            >
              {location.pathname === item.path && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#BEF264] rounded-r-full shadow-[0_0_15px_#BEF264]" />
              )}
              <item.icon
                className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  location.pathname === item.path && 'fill-current',
                )}
              />
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-white/5 uppercase tracking-wide">
                  Soon
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto relative z-10">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#BEF264]/5 rounded-full blur-2xl group-hover:bg-[#BEF264]/10 transition-colors duration-500" />

            <h4 className="text-[#BEF264] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BEF264]"></span>
              </span>
              How it works
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select 8 matches for the round. The{' '}
              <span className="text-white font-bold">Neon Engine™</span> will
              analyze historical data to optimize your predictions.
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 px-2 text-[10px] text-zinc-600 font-mono">
            <span>v2.4.0-stable</span>
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              System Online
            </span>
          </div>
        </div>
      </>
    )
    if (isMobile) {
      return (
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* Mobile Drawer */}
          <motion.aside
            initial={{
              x: -280,
            }}
            animate={{
              x: isOpen ? 0 : -280,
            }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
            }}
            className="fixed left-0 top-0 bottom-0 w-72 border-r border-white/5 bg-zinc-950/95 backdrop-blur-2xl p-6 z-50 flex flex-col overflow-hidden xl:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors min-w-[44px]"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>

            {sidebarContent}
          </motion.aside>
        </>
      )
    }
    return (
      <aside className="hidden xl:flex flex-col w-72 border-r border-white/5 bg-zinc-950/60 backdrop-blur-2xl p-6 z-20 h-full relative overflow-hidden">
        {sidebarContent}
      </aside>
    )
  },
)
Sidebar.displayName = 'Sidebar'
// =============================================================================
// MAIN: HERO SECTION
// =============================================================================
export default function HeroSection() {
  const [matches, setMatches] = useState<Match[]>(
    Array(8).fill({
      home: null,
      away: null,
    }),
  )
  const [league, setLeague] = useState<LeagueId>('english')
  const [isResetting, setIsResetting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const updateMatch = useCallback(
    (idx: number, field: keyof Match, val: string) => {
      setMatches((prev) => {
        const newMatches = [...prev]
        newMatches[idx] = {
          ...newMatches[idx],
          [field]: val,
        }
        return newMatches
      })
    },
    [],
  )
  const resetAll = useCallback(() => {
    setIsResetting(true)
    setMatches(
      Array(8).fill({
        home: null,
        away: null,
      }),
    )
    setTimeout(() => setIsResetting(false), 500)
  }, [])
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
    // Handle analysis result here
  }, [])
  // Calculate used teams to filter dropdowns
  const allSelectedTeams = useMemo(() => {
    const set = new Set<string>()
    matches.forEach((m) => {
      if (m.home) set.add(m.home)
      if (m.away) set.add(m.away)
    })
    return set
  }, [matches])
  const filledMatches = useMemo(
    () => matches.filter((m) => m.home && m.away).length,
    [matches],
  )
  const totalSlots = matches.length * 2
  const filledSlots = useMemo(
    () =>
      matches.reduce((acc, m) => acc + (m.home ? 1 : 0) + (m.away ? 1 : 0), 0),
    [matches],
  )
  const isComplete = filledMatches === 8
  return (
    <div className="relative w-full min-h-screen text-zinc-100 font-sans selection:bg-[#BEF264] selection:text-black py-4 sm:py-8 xl:py-12 px-4 sm:px-6">
      <ParticleCanvas />

      {/* Main Container */}
      <div className="flex items-center justify-center w-full">
        <main className="flex flex-col xl:flex-row bg-zinc-950/80 backdrop-blur-2xl rounded-2xl sm:rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5 w-full max-w-[1400px] h-screen xl:h-[780px]">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Content Area */}
          <section className="flex-1 flex flex-col relative min-w-0 bg-[#0A0A0A]/50">
            {/* Header */}
            <header className="min-h-16 xl:h-24 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md z-20 px-4 sm:px-6 xl:px-8 py-3 xl:py-0">
              <div className="h-full flex flex-col sm:flex-row gap-3 sm:gap-4 xl:gap-0 sm:items-center justify-between">
                {/* Title */}
                <div className="flex items-center gap-3">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="xl:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/50 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 min-w-[44px]"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0">
                    <h2 className="text-lg sm:text-xl xl:text-2xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
                      Round <span className="text-[#BEF264]">Selection</span>
                    </h2>
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5 sm:gap-2">
                      <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />{' '}
                      <span className="truncate">
                        Season 24/25 • Matchday 12
                      </span>
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 xl:gap-6">
                  {/* League Selector */}
                  <div className="flex bg-zinc-900/80 rounded-xl p-1 xl:p-1.5 border border-white/5 shadow-inner">
                    {LEAGUE_OPTIONS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => {
                          setLeague(l.id)
                          resetAll()
                        }}
                        className={cn(
                          'px-2 sm:px-3 xl:px-4 py-1.5 xl:py-2 rounded-lg text-[10px] xl:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 min-h-[32px]',
                          league === l.id
                            ? 'bg-zinc-800 text-white shadow-md border border-white/10'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5',
                        )}
                        aria-pressed={league === l.id}
                      >
                        <span className="text-sm xl:text-base">{l.flag}</span>
                        <span className="hidden md:inline uppercase tracking-wide">
                          {l.short}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="h-8 sm:h-10 w-px bg-white/5 hidden sm:block" />

                  {/* Progress */}
                  <ProgressRing
                    current={filledSlots}
                    total={totalSlots}
                    size={32}
                  />
                </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#09090b]/30">
              <div className="p-4 sm:p-6 xl:p-8 pb-24 sm:pb-28 xl:pb-32 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-4 xl:gap-5">
                <AnimatePresence mode="wait">
                  {matches.map((m, i) => (
                    <motion.div
                      key={`${league}-${i}`}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: i * 0.05,
                        duration: 0.4,
                      }}
                    >
                      <MatchCard
                        index={i}
                        homeTeam={m.home}
                        awayTeam={m.away}
                        teams={TEAMS_BY_LEAGUE[league]}
                        excludeTeams={allSelectedTeams}
                        onHomeChange={(t: string) => updateMatch(i, 'home', t)}
                        onAwayChange={(t: string) => updateMatch(i, 'away', t)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer Action Bar */}
            <footer className="absolute bottom-0 left-0 right-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4 xl:p-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-6 justify-between sm:justify-start">
                  <button
                    onClick={resetAll}
                    disabled={isResetting}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-[10px] sm:text-xs font-bold uppercase tracking-wide group disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    title="Clear All"
                    aria-label="Reset all selections"
                  >
                    <X
                      className={cn(
                        'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:rotate-90',
                        isResetting && 'animate-spin',
                      )}
                    />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <div className="hidden sm:block h-6 w-px bg-white/10" />
                  <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                    <Info className="w-3.5 h-3.5 text-zinc-600" />
                    <span>System automatically filters injured players.</span>
                  </div>
                </div>

                <motion.button
                  disabled={!isComplete || isAnalyzing}
                  onClick={handleAnalyze}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className={cn(
                    'w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 shadow-lg transform min-h-[48px]',
                    isComplete && !isAnalyzing
                      ? 'bg-[#BEF264] text-black hover:bg-[#a3d93d] shadow-[0_0_30px_rgba(190,242,100,0.3)] hover:shadow-[0_0_50px_rgba(190,242,100,0.5)]'
                      : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed',
                  )}
                  aria-label={isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                  aria-busy={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles
                      className={cn('w-4 h-4', isComplete && 'animate-pulse')}
                    />
                  )}
                  <span className="hidden sm:inline">
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                  </span>
                  <span className="sm:hidden">
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </span>
                </motion.button>
              </div>
            </footer>
          </section>
        </main>
      </div>

      {/* Global Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}

```
```components/dashboard/LeagueTable.tsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Target,
  TrendingUp,
  Filter,
  ChevronDown,
  Minus,
  ArrowUp,
  ArrowDown,
  Search,
} from 'lucide-react'
// =============================================================================
// UTILS & TYPES
// =============================================================================
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
export interface LeagueTeam {
  id: string
  position: number
  name: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  form: ('W' | 'D' | 'L')[]
  logo?: string
}
const TABS = [
  {
    id: 'table',
    label: 'Tabella',
    icon: Trophy,
  },
  {
    id: 'scorers',
    label: 'Góllövők',
    icon: Target,
  },
  {
    id: 'form',
    label: 'Forma',
    icon: TrendingUp,
  },
] as const
// =============================================================================
// SUB-COMPONENTS
// =============================================================================
const PositionBadge = ({ position }: { position: number }) => {
  let colorClass = 'bg-zinc-800/50 text-zinc-500 border-white/5'
  if (position === 1)
    colorClass =
      'bg-[#BEF264] text-black shadow-[0_0_15px_rgba(190,242,100,0.4)] border-[#BEF264]'
  else if (position <= 4)
    colorClass =
      'bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.2)]'
  else if (position === 5)
    colorClass = 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  else if (position > 17)
    colorClass = 'bg-red-500/10 text-red-500 border-red-500/20'
  return (
    <div
      className={cn(
        'w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono border transition-all duration-300',
        colorClass,
      )}
    >
      {position}
    </div>
  )
}
const TableHeader = () => (
  <div className="grid grid-cols-[3rem_1fr_repeat(4,3rem)] px-4 py-3 border-b border-white/5 bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase tracking-widest select-none sticky top-0 backdrop-blur-md z-10">
    <span className="text-center">Pos</span>
    <span className="pl-2">Club</span>
    <span className="text-center opacity-70">MP</span>
    <span className="text-center opacity-70">W</span>
    <span className="text-center opacity-70">D</span>
    <span className="text-center text-white font-black">Pts</span>
  </div>
)
const LeagueRow = ({ team, index }: { team: LeagueTeam; index: number }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -10,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: index * 0.03,
      }}
      className="
        group relative grid grid-cols-[3rem_1fr_repeat(4,3rem)] items-center px-4 py-3 text-xs 
        transition-all duration-200 hover:bg-white/[0.04] cursor-pointer 
        border-l-2 border-transparent hover:border-[#BEF264]
      "
    >
      {/* Position */}
      <div className="flex justify-center">
        <PositionBadge position={team.position} />
      </div>

      {/* Club Name */}
      <div className="pl-2 flex items-center gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-white/30 transition-colors shadow-sm">
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-bold text-zinc-400">
              {team.name.charAt(0)}
            </span>
          )}
        </div>
        <span className="font-semibold text-zinc-300 group-hover:text-white truncate transition-colors text-sm">
          {team.name}
        </span>
      </div>

      {/* Stats */}
      <span className="text-center font-mono text-zinc-500">{team.played}</span>
      <span className="text-center font-mono text-zinc-400 group-hover:text-emerald-400 transition-colors">
        {team.won}
      </span>
      <span className="text-center font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
        {team.drawn}
      </span>
      <span className="text-center font-mono font-bold text-white text-sm tracking-tight group-hover:text-[#BEF264] transition-colors shadow-black drop-shadow-md">
        {team.points}
      </span>
    </motion.div>
  )
}
const TopScorerCard = ({ rank, player, team, goals, xg }: any) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-[#BEF264]/30 hover:bg-zinc-900/60 transition-all group cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold font-mono border transition-all duration-300',
          rank === 1
            ? 'bg-[#BEF264]/10 text-[#BEF264] border-[#BEF264]/30 shadow-[0_0_15px_rgba(190,242,100,0.15)]'
            : 'bg-zinc-800/50 text-zinc-500 border-white/5',
        )}
      >
        {rank}
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
          {player}
        </p>
        <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
          {team} <span className="w-1 h-1 rounded-full bg-zinc-700" />{' '}
          <span className="font-mono text-zinc-400">xG: {xg}</span>
        </p>
      </div>
    </div>
    <div className="text-right">
      <span className="block text-2xl font-mono font-black text-white leading-none tracking-tighter group-hover:text-[#BEF264] transition-colors drop-shadow-md">
        {goals}
      </span>
      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-wider">
        Goals
      </span>
    </div>
  </div>
)
// =============================================================================
// MAIN COMPONENT
// =============================================================================
const LeagueTable = ({ teams }: { teams: LeagueTeam[] }) => {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]['id']>('table')
  // Example Scorers Data
  const topScorers = [
    {
      rank: 1,
      player: 'Erling Haaland',
      team: 'Man City',
      goals: 18,
      xg: 14.2,
    },
    {
      rank: 2,
      player: 'Mohamed Salah',
      team: 'Liverpool',
      goals: 14,
      xg: 11.5,
    },
    {
      rank: 3,
      player: 'Ollie Watkins',
      team: 'Aston Villa',
      goals: 11,
      xg: 8.9,
    },
    {
      rank: 4,
      player: 'Dominic Solanke',
      team: 'Bournemouth',
      goals: 10,
      xg: 9.1,
    },
  ]
  return (
    <div className="w-full h-full flex flex-col bg-zinc-950/40 backdrop-blur-2xl rounded-[32px] border border-white/10 overflow-hidden shadow-2xl relative group">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#BEF264]/5 blur-[100px] rounded-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="p-6 pb-4 relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-20 rounded-xl" />
              <div className="relative w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Trophy className="w-5 h-5 text-[#BEF264]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight tracking-tight">
                Premier <span className="text-[#BEF264]">League</span>
              </h3>
              <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                Live Standings
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hover:border-white/10">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors hover:border-white/10">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1.5 bg-zinc-900/60 rounded-xl border border-white/5 backdrop-blur-md shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-colors z-10 uppercase tracking-wide',
                activeTab === tab.id
                  ? 'text-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#BEF264] rounded-lg -z-10 shadow-[0_0_20px_rgba(190,242,100,0.4)]"
                  transition={{
                    type: 'spring',
                    bounce: 0.2,
                    duration: 0.6,
                  }}
                />
              )}
              <tab.icon
                className={cn(
                  'w-3.5 h-3.5',
                  activeTab === tab.id ? 'stroke-[2.5px]' : '',
                )}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative min-h-0 bg-zinc-950/20">
        <AnimatePresence mode="wait">
          {activeTab === 'table' && (
            <motion.div
              key="table"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="flex flex-col h-full"
            >
              <TableHeader />
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {teams.map((team, idx) => (
                  <LeagueRow key={team.id} team={team} index={idx} />
                ))}
              </div>

              {/* Legend */}
              <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/50 flex gap-6 text-[9px] text-zinc-500 font-bold uppercase tracking-wider overflow-x-auto no-scrollbar shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-[#BEF264] shadow-[0_0_8px_rgba(190,242,100,0.4)]" />{' '}
                  Champion
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]" />{' '}
                  UCL
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]" />{' '}
                  UEL
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />{' '}
                  Relegation
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'scorers' && (
            <motion.div
              key="scorers"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3"
            >
              {topScorers.map((scorer) => (
                <TopScorerCard key={scorer.rank} {...scorer} />
              ))}
            </motion.div>
          )}

          {activeTab === 'form' && (
            <motion.div
              key="form"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner">
                <TrendingUp className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">
                Form analysis coming soon...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Style for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
export default LeagueTable

```
```components/dashboard/MatchPicker.tsx
import React, { useCallback, useMemo, useState } from 'react'
import { X, Sparkles, ChevronDown } from 'lucide-react'
import { gridLayouts } from '../../constants/gridSystem'
interface Match {
  id: number
  home: string
  away: string
}
const SAMPLE_TEAMS = [
  'Liverpool',
  'Man City',
  'Arsenal',
  'Chelsea',
  'Man United',
  'Newcastle',
  'Brighton',
  'Tottenham',
  'Aston Villa',
  'West Ham',
  'Fulham',
  'Brentford',
  'Crystal Palace',
  'Everton',
  'Leicester',
  'Wolverhampton',
]
export default function MatchPicker() {
  const [matches, setMatches] = useState<Match[]>(
    Array.from(
      {
        length: 8,
      },
      (_, i) => ({
        id: i + 1,
        home: '',
        away: '',
      }),
    ),
  )
  const completedMatches = useMemo(
    () => matches.filter((m) => m.home && m.away).length,
    [matches],
  )
  const fillPercentage = (completedMatches / 8) * 100
  const updateMatch = useCallback(
    (id: number, field: 'home' | 'away', value: string) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                [field]: value,
              }
            : m,
        ),
      )
    },
    [],
  )
  const resetMatches = useCallback(() => {
    setMatches(
      Array.from(
        {
          length: 8,
        },
        (_, i) => ({
          id: i + 1,
          home: '',
          away: '',
        }),
      ),
    )
  }, [])
  return (
    <section
      className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 items-start"
      aria-labelledby="match-picker-heading"
    >
      {/* ===== MATCH PICKER CARD (Spans 2 columns on XL) ===== */}
      <div className="glass-card col-span-1 xl:col-span-2 min-h-[24rem] overflow-hidden flex flex-col">
        {/* Decorative gradient */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_#BEF26422,_transparent_55%)]" />
        </div>

        {/* ===== HEADER ===== */}
        <header className="relative z-10 flex h-14 md:h-16 lg:h-18 items-center justify-between border-b border-white/5 bg-[#090a0b]/80 px-3 md:px-4 lg:px-6 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <div className="min-w-0">
              <h2
                id="match-picker-heading"
                className="text-sm md:text-base lg:text-lg font-semibold tracking-tight text-white"
              >
                Round <span className="text-[#bef264]">Selection</span>
              </h2>
              <p className="mt-0.5 text-[10px] md:text-xs tracking-tight text-zinc-500 hidden sm:block">
                Season 24/25 • Matchday 12
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <button
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/10 bg-zinc-900/50 text-sm transition-all hover:border-white/20"
                type="button"
                aria-label="English"
              >
                🇬🇧
              </button>
              <button
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg border border-white/5 bg-transparent text-sm transition-all hover:border-white/10 hover:bg-zinc-900/30"
                type="button"
                aria-label="Spanish"
              >
                🇪🇸
              </button>
              <button
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg border border-white/5 bg-transparent text-sm transition-all hover:border-white/10 hover:bg-zinc-900/30"
                type="button"
                aria-label="International"
              >
                🌍
              </button>
            </div>

            {/* Progress summary - md+ only */}
            <div className="hidden md:flex flex-col items-center">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Ready
              </span>
              <span className="font-mono text-sm font-semibold text-[#bef264]">
                {completedMatches}
                <span className="mx-1 text-zinc-500">/</span>8
              </span>
            </div>
          </div>
        </header>

        {/* ===== BODY ===== */}
        <div className="flex-1 overflow-y-auto">
          <div className="relative z-10 space-y-4 md:space-y-5 lg:space-y-6 p-3 md:p-4 lg:p-6">
            {/* Fill level progress */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-1">
                <div className="mb-1.5 md:mb-2 flex items-center justify-between">
                  <span className="text-[10px] md:text-xs font-medium text-zinc-400">
                    Completion
                  </span>
                  <span className="font-mono text-[10px] md:text-xs font-semibold text-[#bef264]">
                    {Math.round(fillPercentage)}%
                  </span>
                </div>
                <div className="h-1.5 md:h-2 overflow-hidden rounded-full bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#bef264] to-[#bef264]/80 transition-all duration-500"
                    style={{
                      width: `${fillPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Match slots grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="glass-card relative p-3 md:p-4 transition-all duration-300 hover:border-white/10"
                >
                  {/* Match number badge */}
                  <div className="flex items-center gap-2 mb-2.5 md:mb-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800/80 text-[10px] font-bold font-mono text-zinc-400">
                      {match.id}
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Teams layout - vertical stack */}
                  <div className="flex flex-col gap-2">
                    {/* Home Team */}
                    <div className="w-full">
                      <label className="mb-1.5 block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Home Team
                      </label>
                      <button
                        className="group relative flex h-10 md:h-11 w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-zinc-900/50 px-3 text-zinc-400 transition-all duration-200 hover:border-white/20 hover:bg-white/5"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded="false"
                        aria-label="Select home team"
                      >
                        <span className="truncate text-xs sm:text-sm">
                          {match.home || 'Select Team...'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-300 shrink-0" />
                      </button>
                    </div>

                    {/* VS Badge */}
                    <div className="flex items-center justify-center -my-0.5">
                      <div className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/80 text-[9px] md:text-[10px] font-black tracking-tighter text-zinc-500">
                        VS
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="w-full">
                      <label className="mb-1.5 block text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Away Team
                      </label>
                      <button
                        className="group relative flex h-10 md:h-11 w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-zinc-900/50 px-3 text-zinc-400 transition-all duration-200 hover:border-white/20 hover:bg-white/5"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded="false"
                        aria-label="Select away team"
                      >
                        <span className="truncate text-xs sm:text-sm">
                          {match.away || 'Select Team...'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-300 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <footer className="relative z-10 shrink-0 border-t border-white/5 bg-[#090a0b]/80 p-3 md:p-4 lg:p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 md:gap-2 rounded-lg border border-white/5 bg-zinc-900/50 px-3.5 md:px-4 py-2.5 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-900 hover:text-rose-400"
                title="Clear all"
                aria-label="Clear all selections"
                onClick={resetMatches}
              >
                <X size={14} />
                <span>Clear</span>
              </button>
            </div>

            <button
              disabled={completedMatches === 0}
              className={`flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-xl px-5 md:px-6 py-2.5 text-xs md:text-sm font-semibold transition-all ${completedMatches === 0 ? 'cursor-not-allowed bg-zinc-800 text-zinc-500 opacity-50' : 'bg-[#bef264] text-black hover:bg-[#bef264]/90 shadow-[0_0_20px_rgba(190,242,100,0.3)]'}`}
              aria-disabled={completedMatches === 0}
            >
              <Sparkles size={14} />
              <span>Run Predictions</span>
            </button>
          </div>
        </footer>
      </div>

      {/* ===== SIDEBAR INFO CARD (1 column on XL) ===== */}
      <div className="glass-card col-span-1 p-4 md:p-5 lg:p-6 hidden xl:block">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Tips</h3>
        <ul className="space-y-3 text-xs text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-[#bef264] mt-0.5">•</span>
            <span>Select 8 matches for optimal prediction accuracy</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#bef264] mt-0.5">•</span>
            <span>Mix matches from different leagues for diversification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#bef264] mt-0.5">•</span>
            <span>AI analyzes form, H2H, and statistical patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#bef264] mt-0.5">•</span>
            <span>Predictions update in real-time as you select</span>
          </li>
        </ul>

        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              AI Confidence
            </span>
            <span className="text-xs font-mono text-[#bef264]">--</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-[#bef264] to-emerald-400 transition-all duration-500" />
          </div>
        </div>
      </div>
    </section>
  )
}

```
```components/dashboard/MatchVisualizerCard.tsx
import React, { useState } from 'react';
import { Home, Shield, Maximize2, Trophy } from 'lucide-react';
import TeamDisplay from '../match/TeamDisplay';
import MatchScore from '../match/MatchScore';
import MatchDialog from '../match/MatchDialog';
import { animations, colors, iconSizes } from '../../constants/designTokens';
interface MatchVisualizerCardProps {
  homeScore: number;
  awayScore: number;
}
const MatchVisualizerCard: React.FC<MatchVisualizerCardProps> = ({
  homeScore,
  awayScore
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return <>
      <div onClick={() => setIsDialogOpen(true)} className="glass-card lg:col-span-2 min-h-[340px] flex flex-col cursor-pointer group hover:border-[#BEF264]/30 relative overflow-hidden transition-all" style={{
      transitionDuration: animations.duration.slow
    }} role="button" tabIndex={0} aria-label="Open Match Details">
        {/* --- ATMOSPHERE LAYERS --- */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none z-0" />

        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#BEF264] blur-[120px] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity z-0 animate-pulse-slow" style={{
        transitionDuration: animations.duration.slow
      }} />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#6EE7B7] blur-[100px] opacity-[0.06] group-hover:opacity-[0.1] transition-opacity z-0" style={{
        transitionDuration: animations.duration.slow
      }} />

        {/* --- CONTENT --- */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-between">
          {/* Header Row */}
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md shadow-lg group-hover:border-[#BEF264]/20 transition-colors">
                <Trophy size={iconSizes.sm} className="text-[#BEF264]" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                  Champions League
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono ml-1">
                Group B • Round 4
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#BEF264]/30 shadow-[0_0_15px_rgba(190,242,100,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BEF264]"></span>
                </span>
                <span className="text-sm font-mono font-bold text-[#BEF264] tabular-nums tracking-wide drop-shadow-sm">
                  72:43
                </span>
              </div>

              <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all group/btn" style={{
              transitionDuration: animations.duration.normal
            }} aria-label="Expand match view">
                <Maximize2 size={iconSizes.sm} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Match Action Center */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 mt-6 lg:px-8">
            {/* Home Team */}
            <div className="transform transition-transform group-hover:translate-x-2" style={{
            transitionDuration: animations.duration.slow
          }}>
              <TeamDisplay name="LIV" icon={<Home className="w-16 h-16 lg:w-20 lg:h-20 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" strokeWidth={1.5} />} position="home" />
            </div>

            {/* Score Board */}
            <div className="relative z-20 transform group-hover:scale-105 transition-transform" style={{
            transitionDuration: animations.duration.slow
          }}>
              <MatchScore homeScore={homeScore} awayScore={awayScore} showStats />
              <div className="text-center mt-3">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  In Play
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="transform transition-transform group-hover:-translate-x-2" style={{
            transitionDuration: animations.duration.slow
          }}>
              <TeamDisplay name="RMA" icon={<Shield className="w-16 h-16 lg:w-20 lg:h-20 text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" strokeWidth={1.5} />} position="away" />
            </div>
          </div>
        </div>
      </div>

      <MatchDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} homeScore={homeScore} awayScore={awayScore} />
    </>;
};
export default MatchVisualizerCard;
```
```components/dashboard/StatCard.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useId,
  memo,
  Component,
} from 'react'
/**
 * StatCard Component - Premium Statistics Display Card
 *
 * A highly optimized, fully accessible statistics card component with:
 * - Animated value transitions
 * - Interactive sparkline charts
 * - Responsive design with mobile-first approach
 * - Comprehensive accessibility support
 * - Type-safe with TypeScript
 * - Performance optimized with memo and useMemo
 *
 * @example
 * <StatCard
 *   theme="lime"
 *   icon={<Activity />}
 *   title="Hit Rate"
 *   value={124}
 *   subValue="WINS"
 *   percentage={82}
 *   footerText="Above average in 10 rounds"
 *   sparklineData={[20, 15, 18, 10, 14, 8]}
 *   trend="up"
 *   animationDuration={1200}
 * />
 */

import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
// ==================== TYPE DEFINITIONS ====================
/**
 * Available color themes for the StatCard
 */
export type StatCardTheme =
  | 'lime'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'purple'
  | 'emerald'
/**
 * Trend direction for the statistic
 */
export type TrendDirection = 'up' | 'down' | 'neutral'
/**
 * Theme color configuration
 */
interface ThemeColors {
  hex: string
  border: string
  iconColor: string
  iconBg: string
  text: string
  shadow: string
  glowBg: string
}
/**
 * Main component props
 */
export interface StatCardProps {
  /** Visual theme color */
  theme?: StatCardTheme
  /** Icon component to display */
  icon: React.ReactNode
  /** Card title/label */
  title: string
  /** Main value to display (can be number or string) */
  value: string | number
  /** Optional secondary value (e.g., unit or description) */
  subValue?: string
  /** Footer description text (legacy: subLabel) */
  footerText?: string
  /** Legacy prop name for footerText */
  subLabel?: string
  /** Percentage for progress ring (0-100) */
  percentage: number
  /** Optional sparkline data points */
  sparklineData?: number[]
  /** Trend direction (auto-detected from percentage if not provided) */
  trend?: TrendDirection
  /** Animation duration in milliseconds */
  animationDuration?: number
  /** Optional click handler */
  onClick?: () => void
  /** Optional additional CSS classes */
  className?: string
  /** Optional info popover content */
  infoContent?: React.ReactNode
  /** Accessibility label */
  ariaLabel?: string
}
// ==================== THEME CONFIGURATION ====================
/**
 * Comprehensive theme color definitions
 * Optimized for dark backgrounds with proper contrast ratios
 */
const THEME_COLORS: Record<StatCardTheme, ThemeColors> = {
  lime: {
    hex: '#BEF264',
    border: 'hover:border-lime-400/20',
    iconColor: 'text-zinc-400 group-hover:text-lime-300',
    iconBg: 'group-hover:bg-lime-400/10 group-hover:border-lime-400/20',
    text: 'text-lime-300',
    shadow: 'drop-shadow-[0_0_4px_rgba(190,242,100,0.6)]',
    glowBg: 'bg-lime-400/10',
  },
  amber: {
    hex: '#FBBF24',
    border: 'hover:border-amber-400/20',
    iconColor: 'text-zinc-400 group-hover:text-amber-300',
    iconBg: 'group-hover:bg-amber-400/10 group-hover:border-amber-400/20',
    text: 'text-amber-400',
    shadow: 'drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]',
    glowBg: 'bg-amber-400/10',
  },
  rose: {
    hex: '#FB7185',
    border: 'hover:border-rose-400/20',
    iconColor: 'text-zinc-400 group-hover:text-rose-300',
    iconBg: 'group-hover:bg-rose-400/10 group-hover:border-rose-400/20',
    text: 'text-rose-400',
    shadow: 'drop-shadow-[0_0_4px_rgba(251,113,133,0.6)]',
    glowBg: 'bg-rose-400/10',
  },
  sky: {
    hex: '#38BDF8',
    border: 'hover:border-sky-400/20',
    iconColor: 'text-zinc-400 group-hover:text-sky-300',
    iconBg: 'group-hover:bg-sky-400/10 group-hover:border-sky-400/20',
    text: 'text-sky-400',
    shadow: 'drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]',
    glowBg: 'bg-sky-400/10',
  },
  purple: {
    hex: '#C084FC',
    border: 'hover:border-purple-400/20',
    iconColor: 'text-zinc-400 group-hover:text-purple-300',
    iconBg: 'group-hover:bg-purple-400/10 group-hover:border-purple-400/20',
    text: 'text-purple-400',
    shadow: 'drop-shadow-[0_0_4px_rgba(192,132,252,0.6)]',
    glowBg: 'bg-purple-400/10',
  },
  emerald: {
    hex: '#34D399',
    border: 'hover:border-emerald-400/20',
    iconColor: 'text-zinc-400 group-hover:text-emerald-300',
    iconBg: 'group-hover:bg-emerald-400/10 group-hover:border-emerald-400/20',
    text: 'text-emerald-400',
    shadow: 'drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]',
    glowBg: 'bg-emerald-400/10',
  },
}
// ==================== UTILITY FUNCTIONS ====================
/**
 * Easing function for smooth animations
 * Uses cubic-bezier for spring-like motion
 */
const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4)
}
/**
 * Format number with locale-specific formatting
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('hu-HU')
}
/**
 * Clamp value between min and max
 */
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}
/**
 * Auto-detect theme based on percentage
 */
const getAutoTheme = (percentage: number): StatCardTheme => {
  if (percentage >= 70) return 'lime'
  if (percentage >= 40) return 'amber'
  return 'rose'
}
// ==================== SUB-COMPONENTS ====================
/**
 * Animated Progress Ring Component
 * Displays circular progress indicator with smooth animations
 */
interface ProgressRingProps {
  percentage: number
  color: string
  shadow: string
  textColor: string
}
const ProgressRing = memo<ProgressRingProps>(
  ({ percentage, color, shadow, textColor }) => {
    const clampedPercentage = clamp(percentage, 0, 100)
    const dashArray = `${clampedPercentage}, 100`
    return (
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
        role="img"
        aria-label={`${clampedPercentage}% complete`}
      >
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 36 36"
          aria-hidden="true"
        >
          {/* Background circle */}
          <path
            className="text-white/5"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            stroke={color}
            strokeDasharray={dashArray}
            className={`transition-all duration-1000 ease-out ${shadow}`}
          />
        </svg>
        <div
          className={`absolute inset-0 flex items-center justify-center text-[0.6rem] sm:text-[0.65rem] font-bold tabular-nums ${textColor}`}
        >
          {clampedPercentage}%
        </div>
      </div>
    )
  },
)
ProgressRing.displayName = 'ProgressRing'
/**
 * Sparkline Chart Component
 * Renders mini line chart with gradient fill
 */
interface SparklineProps {
  data: number[]
  color: string
  uniqueId: string
}
const Sparkline = memo<SparklineProps>(({ data, color, uniqueId }) => {
  const { polylinePoints, polygonPoints } = useMemo(() => {
    if (!data || data.length < 2) {
      return {
        polylinePoints: '',
        polygonPoints: '',
      }
    }
    const width = 100
    const height = 30
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 2)
      return `${x},${y}`
    })
    const polylinePoints = points.join(' ')
    const polygonPoints = `0,${height} ${polylinePoints} ${width},${height}`
    return {
      polylinePoints,
      polygonPoints,
    }
  }, [data])
  if (!polylinePoints) return null
  return (
    <div className="absolute bottom-0 right-0 w-full h-24 sm:h-32 opacity-15 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none">
      <svg
        viewBox="0 0 100 30"
        preserveAspectRatio="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={`gradient-${uniqueId}`}
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={polygonPoints} fill={`url(#gradient-${uniqueId})`} />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
})
Sparkline.displayName = 'Sparkline'
/**
 * Trend Indicator Component
 * Shows trend direction with appropriate icon
 */
interface TrendIndicatorProps {
  trend: TrendDirection
  theme: ThemeColors
}
const TrendIndicator = memo<TrendIndicatorProps>(({ trend, theme }) => {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const iconColor =
    trend === 'up'
      ? theme.text
      : trend === 'down'
        ? 'text-rose-400'
        : 'text-zinc-400'
  return (
    <div className={`flex-shrink-0 ${iconColor}`}>
      <TrendIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
    </div>
  )
})
TrendIndicator.displayName = 'TrendIndicator'
// ==================== MAIN COMPONENT ====================
/**
 * StatCard - Main Component
 *
 * High-performance statistics card with animations, sparklines, and accessibility
 */
export const StatCard: React.FC<StatCardProps> = memo(
  ({
    theme,
    icon,
    title,
    value,
    subValue,
    footerText,
    subLabel,
    percentage,
    sparklineData,
    trend,
    animationDuration = 1200,
    onClick,
    className = '',
    infoContent,
    ariaLabel,
  }) => {
    const [displayedValue, setDisplayedValue] = useState<number>(0)
    const uniqueId = useId()
    // Use footerText or fallback to subLabel for backwards compatibility
    const displayFooterText = footerText || subLabel || ''
    // Auto-detect theme if not provided
    const resolvedTheme = theme || getAutoTheme(percentage)
    const colors = THEME_COLORS[resolvedTheme]
    // Auto-detect trend if not provided
    const finalTrend = useMemo<TrendDirection>(() => {
      if (trend) return trend
      if (percentage >= 70) return 'up'
      if (percentage <= 30) return 'down'
      return 'neutral'
    }, [trend, percentage])
    // Animated counter effect for numeric values
    useEffect(() => {
      if (typeof value !== 'number') {
        setDisplayedValue(0)
        return
      }
      const startValue = 0
      const endValue = value
      const startTime = performance.now()
      let animationFrameId: number
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / animationDuration, 1)
        const easedProgress = easeOutQuart(progress)
        setDisplayedValue(
          Math.floor(startValue + (endValue - startValue) * easedProgress),
        )
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        } else {
          setDisplayedValue(endValue)
        }
      }
      animationFrameId = requestAnimationFrame(animate)
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
      }
    }, [value, animationDuration])
    // Memoized formatted value
    const formattedValue = useMemo(() => {
      if (typeof value === 'number') {
        return formatNumber(displayedValue)
      }
      return value
    }, [value, displayedValue])
    // Click handler with keyboard support
    const handleInteraction = useCallback(() => {
      if (onClick) {
        onClick()
      }
    }, [onClick])
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      },
      [onClick],
    )
    return (
      <article
        className={`
        relative overflow-hidden group
        border border-white/5 bg-zinc-900/40 backdrop-blur-sm
        rounded-2xl p-4 sm:p-5 md:p-6
        flex flex-col h-full
        transition-all duration-300 ease-out
        ${colors.border}
        hover:bg-zinc-900/60
        hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]
        hover:-translate-y-0.5
        ${onClick ? 'cursor-pointer focus-within:ring-2 focus-within:ring-white/20 focus-within:outline-none' : ''}
        ${className}
      `}
        onClick={onClick ? handleInteraction : undefined}
        onKeyDown={onClick ? handleKeyDown : undefined}
        tabIndex={onClick ? 0 : undefined}
        role={onClick ? 'button' : 'article'}
        aria-label={
          ariaLabel ||
          `${title}: ${formattedValue}${subValue ? ' ' + subValue : ''}, ${percentage}%`
        }
      >
        {/* Background Glow Effect */}
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: colors.hex,
          }}
          aria-hidden="true"
        />

        {/* Sparkline Background */}
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            color={colors.hex}
            uniqueId={uniqueId}
          />
        )}

        {/* Header Section */}
        <header className="flex items-start justify-between relative z-10 mb-4 sm:mb-5">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Icon Container */}
            <div
              className={`
              w-10 h-10 sm:w-12 sm:h-12 
              rounded-xl sm:rounded-2xl 
              flex items-center justify-center 
              border bg-white/5 border-white/10 
              transition-all duration-300 
              ${colors.iconColor} ${colors.iconBg}
              group-hover:scale-105
              flex-shrink-0
            `}
              aria-hidden="true"
            >
              {icon}
            </div>

            {/* Title */}
            <div className="min-w-0">
              <h3 className="text-[0.625rem] sm:text-[0.65rem] font-bold uppercase tracking-[0.15em] text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">
                {title}
              </h3>
              {infoContent && (
                <button
                  className="flex items-center gap-1 mt-1 text-[0.6rem] text-zinc-600 hover:text-zinc-400 transition-colors focus:outline-none focus:text-zinc-400"
                  aria-label={`More information about ${title}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="w-3 h-3" />
                  <span>Details</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Ring */}
          <ProgressRing
            percentage={percentage}
            color={colors.hex}
            shadow={colors.shadow}
            textColor={colors.text}
          />
        </header>

        {/* Value Section */}
        <div className="relative z-10 mb-auto">
          <div className="font-mono font-semibold text-white tracking-tight flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl md:text-4xl tabular-nums drop-shadow-lg">
              {formattedValue}
            </span>
            {subValue && (
              <span className="text-xs sm:text-sm text-zinc-500 font-sans font-medium uppercase tracking-wide">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {/* Footer Section */}
        {displayFooterText && (
          <footer className="mt-4 pt-3 sm:pt-4 flex items-center gap-2 border-t border-white/5 relative z-10">
            <TrendIndicator trend={finalTrend} theme={colors} />
            <p className="text-[0.65rem] sm:text-xs text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors leading-tight">
              {displayFooterText}
            </p>
          </footer>
        )}
      </article>
    )
  },
)
StatCard.displayName = 'StatCard'
// ==================== GRID CONTAINER ====================
/**
 * StatCardGrid - Responsive grid container for StatCards
 */
interface StatCardGridProps {
  children: React.ReactNode
  className?: string
}
export const StatCardGrid: React.FC<StatCardGridProps> = memo(
  ({ children, className = '' }) => {
    return (
      <div
        className={`w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 ${className}`}
      >
        {children}
      </div>
    )
  },
)
StatCardGrid.displayName = 'StatCardGrid'
export default StatCard

```
```components/dashboard/StatCardPopover.tsx
import React from 'react';
import { StatMetrics } from '../../hooks/useStatMetrics';
interface StatCardPopoverProps {
  title: string;
  metrics: StatMetrics;
}
const StatCardPopover: React.FC<StatCardPopoverProps> = ({
  title,
  metrics
}) => {
  return <div className="p-4">
      <h4 className="text-sm font-bold text-white mb-3">{title} Details</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Current</span>
          <span className="text-sm font-bold text-white">{metrics.current}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Season Average</span>
          <span className="text-sm font-bold text-white">{metrics.average}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Last Match</span>
          <span className="text-sm font-bold text-white">{metrics.lastMatch}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-k-borderLight">
          <span className="text-xs text-gray-400">Trend</span>
          <span className="text-xs font-bold text-k-lime">{metrics.trend}</span>
        </div>
        <div className="pt-2 border-t border-k-borderLight">
          <p className="text-xs text-gray-400 leading-relaxed">{metrics.insight}</p>
        </div>
      </div>
    </div>;
};
export default StatCardPopover;
```
```components/dashboard/WinProbabilityCard.tsx
import React, { useState } from 'react';
import { Sparkles, TrendingUp, ChevronRight, Target, Activity, Zap, TrendingDown, Info } from 'lucide-react';
import HeadlessDialog from '../ui/HeadlessDialog';

// --- Típusdefiníciók és Mock Adatok (Props-ba kiszervezhető) ---
interface WinProbabilityProps {
  homeWin: number;
  draw: number;
  awayWin: number;
  homeMomentum: string;
  awayMomentum: string;
  drawMomentum: string;
}
const mockData: WinProbabilityProps = {
  homeWin: 78,
  draw: 12,
  awayWin: 10,
  homeMomentum: "+4.2%",
  awayMomentum: "-2.7%",
  drawMomentum: "-1.5%"
};

// --- Segédkomponens: FactorBar ---
interface FactorBarProps {
  label: string;
  value: string;
  progress?: number; // Dedikált számérték a szélességhez
  color?: string;
}
const FactorBar = ({
  label,
  value,
  progress,
  color = 'bg-[#BEF264]'
}: FactorBarProps) => {
  // Ha nincs progress prop, megpróbáljuk a value-ból kinyerni, ha %-os, egyébként 50%
  const widthVal = progress !== undefined ? Math.min(100, Math.max(0, progress)) : value.includes('%') ? parseInt(value) : 50;
  return <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors">
          {label}
        </span>
        <span className="text-xs font-bold text-white font-mono">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5 relative">
        <div className={`h-full ${color} shadow-[0_0_8px_currentColor] opacity-90 transition-all duration-1000 ease-out`} style={{
        width: `${widthVal}%`
      }} />
      </div>
    </div>;
};
const WinProbabilityCard = ({
  data = mockData
}: {
  data?: WinProbabilityProps;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Számoljuk ki a progress bar szegmensek pontos szélességét
  // (A border radius miatt a "Draw" részt kicsit trükkösebb pozícionálni CSS-ben, 
  // itt most flexbox-szal vagy absolute pozícionálással oldjuk meg a tiszta layert)

  return <>
      {/* --- MAIN CARD --- */}
      <div className="h-full glass-card group relative flex flex-col justify-between p-6 md:p-8 cursor-default overflow-hidden">

        {/* Ambient Glow Effects (Background) */}
        <div className="absolute top-0 right-0 p-32 bg-[#BEF264] opacity-[0.02] blur-[80px] rounded-full pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500" />

        {/* HEADER SECTION */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            {/* Icon Box */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#BEF264]/20 to-[#BEF264]/5 border border-[#BEF264]/20 flex items-center justify-center shadow-[0_0_15px_rgba(190,242,100,0.15)] group-hover:shadow-[0_0_25px_rgba(190,242,100,0.25)] transition-all duration-300">
              <Sparkles className="w-6 h-6 text-[#BEF264] fill-[#BEF264]/20" />
            </div>

            {/* Live Indicator Badge */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 bg-[#BEF264]/10 px-2 py-1 rounded-full border border-[#BEF264]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BEF264]"></span>
                </span>
                <span className="text-[10px] font-bold text-[#BEF264] uppercase tracking-wider">AI Live</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">v2.1.0</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 leading-tight">Win Probability</h3>
          <p className="text-sm text-zinc-400 text-pretty leading-relaxed">
            Real-time outcome prediction based on xG momentum & field tilt.
          </p>
        </div>

        {/* DATA VISUALIZATION SECTION */}
        <div className="relative z-10 mt-8 space-y-5">

          {/* Main Percentage Display */}
          <div className="flex justify-between items-end">
            <div className="flex items-baseline gap-1.5">
              <span className="text-6xl font-bold text-white tracking-tighter font-mono shadow-black drop-shadow-lg">
                {data.homeWin}
              </span>
              <span className="text-2xl text-[#BEF264] font-bold">%</span>
            </div>

            {/* Trend Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#BEF264]/10 border border-[#BEF264]/20 text-[#BEF264]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold tabular-nums">{data.homeMomentum}</span>
            </div>
          </div>

          {/* Progress Bar (Accessibility included) */}
          <div className="space-y-3" role="progressbar" aria-label="Win Probability Distribution" aria-valuenow={data.homeWin} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-4 w-full bg-[#0A0A0A] rounded-full p-0.5 border border-white/10 shadow-inner relative overflow-hidden flex">

              {/* Home Segment */}
              <div className="h-full bg-gradient-to-r from-[#BEF264] to-[#aadd00] shadow-[0_0_15px_rgba(190,242,100,0.3)] transition-all duration-1000 ease-out relative z-30 first:rounded-l-full" style={{
              width: `${data.homeWin}%`
            }}>
                 <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/40 mix-blend-overlay"></div>
              </div>

              {/* Draw Segment */}
              <div className="h-full bg-zinc-700 transition-all duration-1000 ease-out relative z-20" style={{
              width: `${data.draw}%`
            }}>
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/20"></div>
              </div>

              {/* Away Segment */}
               <div className="h-full bg-zinc-800 transition-all duration-1000 ease-out relative z-10 last:rounded-r-full" style={{
              width: `${data.awayWin}%`
            }} />
            </div>

            {/* Legend Labels */}
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
              <span className="text-[#BEF264] drop-shadow-[0_0_8px_rgba(190,242,100,0.5)]">
                Home ({data.homeWin}%)
              </span>
              <span className="text-zinc-400">Draw ({data.draw}%)</span>
              <span className="text-zinc-600">Away ({data.awayWin}%)</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button onClick={() => setIsDialogOpen(true)} className="w-full mt-8 py-3.5 px-4 rounded-xl bg-white/[0.03] hover:bg-[#BEF264] hover:text-black text-zinc-300 text-sm font-semibold transition-all duration-300 flex items-center justify-between group/btn border border-white/10 hover:border-[#BEF264] hover:shadow-[0_0_20px_rgba(190,242,100,0.2)]">
          <span>View Detailed Model</span>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover/btn:text-black group-hover/btn:translate-x-1 transition-all" />
        </button>
      </div>

      {/* --- DETAILED DIALOG --- */}
      <HeadlessDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="AI Prediction Model" size="lg">
        <div className="space-y-8">

          {/* Top Cards: The 3 Outcomes (Grid fixed for mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Home Card */}
            <div className="bg-gradient-to-b from-[#BEF264]/10 to-transparent border border-[#BEF264]/30 rounded-2xl p-5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[#BEF264]/5 blur-xl"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-[#BEF264]" />
                    <span className="text-xs font-bold text-[#BEF264] uppercase tracking-wider">Home Win</span>
                  </div>
                  <div className="text-4xl font-mono font-bold text-white mb-1">{data.homeWin}%</div>
                  <div className="text-xs text-[#BEF264]/80 font-medium">{data.homeMomentum} momentum</div>
               </div>
            </div>

            {/* Draw Card */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Draw</span>
              </div>
              <div className="text-4xl font-mono font-bold text-zinc-300 mb-1">{data.draw}%</div>
              <div className="text-xs text-zinc-500 font-medium">{data.drawMomentum} stable</div>
            </div>

            {/* Away Card */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Away Win</span>
              </div>
              <div className="text-4xl font-mono font-bold text-zinc-300 mb-1">{data.awayWin}%</div>
              <div className="text-xs text-rose-500 font-medium flex items-center gap-1">
                 <TrendingDown className="w-3 h-3" /> {data.awayMomentum} drop
              </div>
            </div>
          </div>

          {/* Model Factors Section */}
          <div className="glass-card-sm p-6 rounded-2xl border border-white/5">
            <h4 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#BEF264]" />
              Dominant Factors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FactorBar label="Expected Goals (xG)" value="2.42 vs 0.87" progress={74} />
              <FactorBar label="Possession Control" value="64%" progress={64} />
              <FactorBar label="Shot Accuracy" value="89%" progress={89} />
              <FactorBar label="Field Tilt (Attacking 3rd)" value="71%" progress={71} />
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-500 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
             <div className="flex gap-6">
                <div>
                   <span className="block text-zinc-600 mb-0.5">Confidence</span>
                   <span className="text-[#BEF264] font-bold">High (94.7%)</span>
                </div>
                <div>
                   <span className="block text-zinc-600 mb-0.5">Model</span>
                   <span className="text-zinc-300 font-mono">Neural Net v2.1</span>
                </div>
                <div>
                   <span className="block text-zinc-600 mb-0.5">Features</span>
                   <span className="text-zinc-300 font-mono">1,247</span>
                </div>
             </div>
             <div className="flex items-center gap-1.5 text-zinc-400">
                <Info className="w-3.5 h-3.5" />
                <span>Updated real-time via WebSocket</span>
             </div>
          </div>

        </div>
      </HeadlessDialog>
    </>;
};
export default WinProbabilityCard;
```
```components/Header.tsx
import React, { useState } from 'react';
import { Search, Bell, Settings, Menu as MenuIcon } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import NotificationsSlideOver from './NotificationsSlideOver';
import { useSidebar } from '../contexts/sidebarContext';

const Header: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toggleSidebar } = useSidebar();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-5 h-5 text-white" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search matches, teams, stats..."
                className="search-input w-full"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/60">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white/60" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
            </button>

            {/* Settings Button */}
            <button
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Slide-over */}
      <NotificationsSlideOver
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
};

export default Header;
```
```components/LanguageSelector.tsx
import React, { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' }
];

const LanguageSelector: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    // TODO: Implement actual language change logic
    console.log('Language changed to:', language.code);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger Button */}
      <Menu.Button className="headlessui-menu-button flex items-center gap-2">
        <Globe className="w-5 h-5 text-white/60" />
        <span className="text-sm font-medium text-white/80">
          {selectedLanguage.flag} {selectedLanguage.code.toUpperCase()}
        </span>
      </Menu.Button>

      {/* Dropdown Menu */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="headlessui-menu-items absolute right-0 mt-2 w-56 origin-top-right">
          {/* Menu Items */}
          {languages.map((language) => (
            <Menu.Item key={language.code}>
              {({ active }) => (
                <button
                  onClick={() => handleLanguageChange(language)}
                  className={`
                    headlessui-menu-item
                    ${active ? 'bg-primary/20 text-primary' : 'text-white'}
                    group flex w-full items-center justify-between
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{language.flag}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium">
                        {language.nativeName}
                      </p>
                      <p className="text-xs text-white/50">
                        {language.name}
                      </p>
                    </div>
                  </div>
                  
                  {/* Checkmark for selected language */}
                  {selectedLanguage.code === language.code && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSelector;
```
```components/Layout.tsx
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
interface LayoutProps {
  children: ReactNode;
}
export default function Layout({
  children
}: LayoutProps) {
  return <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Content Area */}
        <div className="relative flex-1 overflow-y-auto scroll-smooth bg-[#090a0b]">
          {children}
        </div>
      </main>
    </div>;
}
```
```components/layout/DashboardLayout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import PageHeader from './PageHeader'

interface DashboardLayoutProps {
  /** Animated ambient layer: gradient mesh, glow orbs, and grid lines */
  cinematicAtmosphere?: boolean
}

const DashboardLayout = ({
  cinematicAtmosphere = true,
}: DashboardLayoutProps) => {
  return (
    <div className="bg-[#0A0A0A] text-white font-body min-h-screen flex overflow-hidden selection:bg-[#BEF264]/25 selection:text-[#BEF264] antialiased relative">
      {/* --- GLOBAL ATMOSPHERE LAYER --- */}

      {/* Static Noise Texture for "Film Grain" look */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {cinematicAtmosphere && (
        <>
          {/* Gradient Mesh Background (Cinematic Depth) */}
          <div
            className="fixed inset-0 pointer-events-none z-0 gradient-mesh-hero"
            aria-hidden="true"
          />

          {/* Ambient Glows — Animated for cinematic feel */}
          <div
            className="fixed top-[-20%] left-[-10%] w-[55vw] h-[55vw] bg-[#BEF264] rounded-full blur-[180px] pointer-events-none z-0 animate-glow-pulse"
            style={{
              animationDuration: '8s',
            }}
            aria-hidden="true"
          />
          <div
            className="fixed bottom-[-25%] right-[-15%] w-[45vw] h-[45vw] bg-[#6EE7B7] rounded-full blur-[160px] pointer-events-none z-0 animate-glow-pulse"
            style={{
              animationDuration: '12s',
              animationDelay: '2s',
            }}
            aria-hidden="true"
          />
          <div
            className="fixed top-[25%] right-[15%] w-[25vw] h-[25vw] bg-purple-500 rounded-full blur-[140px] pointer-events-none z-0 animate-glow-pulse"
            style={{
              animationDuration: '10s',
              animationDelay: '4s',
            }}
            aria-hidden="true"
          />
          {/* Subtle cyan accent glow */}
          <div
            className="fixed top-[60%] left-[30%] w-[20vw] h-[20vw] bg-cyan-400 rounded-full blur-[120px] opacity-[0.02] pointer-events-none z-0 animate-glow-pulse"
            style={{
              animationDuration: '14s',
              animationDelay: '6s',
            }}
            aria-hidden="true"
          />

          {/* Decorative grid lines (very subtle) */}
          <div
            className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(190, 242, 100, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(190, 242, 100, 0.3) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* --- LAYOUT STRUCTURE --- */}
      <Sidebar />

      <main className="flex-1 lg:ml-[270px] flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-300">
        <PageHeader />

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative">
          <div className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto space-y-8 pb-24 min-h-full">
            <Outlet />
          </div>

          {/* Bottom Fade Gradient for Scroll */}
          <div className="sticky bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none z-20" />
        </div>
      </main>
    </div>
  )
}
export default DashboardLayout

```
```components/layout/PageHeader.tsx
import React, { useState } from 'react'
import { Search, Bell, Settings, Menu as MenuIcon, Zap } from 'lucide-react'
import LanguageSelector from '../LanguageSelector'
import NotificationsSlideOver from '../NotificationsSlideOver'
import { useSidebar } from '../../contexts/sidebarContext'
const PageHeader: React.FC = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { toggleSidebar } = useSidebar()
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0A0A]/70 backdrop-blur-2xl transition-all duration-300">
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="flex h-[72px] items-center gap-4 px-4 md:px-6 lg:px-8 relative z-10">
          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 text-white/60 hover:text-white"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#BEF264] transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search matches, teams, stats..."
                className="
                  w-full pl-11 pr-20 py-2.5
                  bg-white/[0.03] backdrop-blur-xl
                  border border-white/[0.06]
                  rounded-2xl
                  text-sm text-white placeholder:text-white/25 font-body
                  focus:border-[#BEF264]/30 focus:ring-2 focus:ring-[#BEF264]/10
                  focus:bg-white/[0.06]
                  hover:bg-white/[0.05] hover:border-white/10
                  transition-all duration-300
                  outline-none
                "
              />
              <kbd
                className="
                absolute right-4 top-1/2 -translate-y-1/2 
                hidden sm:inline-flex items-center gap-1 
                rounded-lg border border-white/10 bg-white/5 
                px-2 py-1 text-[10px] font-bold text-white/30
                font-mono shadow-sm
              "
              >
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <div className="h-6 w-[1px] bg-white/[0.06] mx-1 hidden sm:block" />

            {/* Notifications Button */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="
                relative p-2.5 rounded-xl 
                hover:bg-white/5 active:bg-white/10
                border border-transparent hover:border-white/[0.06]
                transition-all duration-200
                group
              "
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px] text-white/50 group-hover:text-white/80 transition-colors" />
              {/* Notification Badge */}
              <span
                className="
                absolute top-2 right-2 
                w-2 h-2 bg-[#BEF264] rounded-full 
                ring-2 ring-[#0A0A0A]
                shadow-[0_0_8px_rgba(190,242,100,0.6)]
              "
              />
            </button>

            {/* Settings Button */}
            <button
              className="
                p-2.5 rounded-xl 
                hover:bg-white/5 active:bg-white/10
                border border-transparent hover:border-white/[0.06]
                transition-all duration-200
                group
              "
              aria-label="Settings"
            >
              <Settings className="w-[18px] h-[18px] text-white/50 group-hover:text-white/80 transition-colors" />
            </button>

            {/* User Avatar */}
            <div className="hidden md:flex items-center pl-1">
              <button
                className="
                flex items-center gap-3 
                pl-1.5 pr-4 py-1.5 rounded-2xl
                hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]
                transition-all duration-200
                group
              "
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BEF264] to-[#6EE7B7] p-[1.5px] shadow-[0_0_20px_rgba(190,242,100,0.15)] group-hover:shadow-[0_0_25px_rgba(190,242,100,0.25)] transition-shadow">
                  <div className="w-full h-full rounded-[10px] bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                    <img
                      src="https://ui-avatars.com/api/?name=Win+Mix&background=111&color=BEF264"
                      alt="User"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[13px] font-semibold text-white/90 group-hover:text-white transition-colors font-body">
                    WinMix User
                  </span>
                  <span className="text-[10px] font-bold text-[#BEF264]/80 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    Pro Plan
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications Slide-over */}
      <NotificationsSlideOver
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  )
}
export default PageHeader

```
```components/layout/Sidebar.tsx
import React from 'react'
import { useSidebar } from '../../contexts/sidebarContext'
import SidebarHeader from '../sidebar/SidebarHeader'
import SidebarNav from '../sidebar/SidebarNav'
import SidebarUserMenu from '../sidebar/SidebarUserMenu'
const Sidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar()
  return (
    <>
      {/* Mobile Backdrop - Smooth fade */}
      <div
        className={`
          fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden 
          transition-all duration-500 ease-in-out
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Main Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[270px] flex flex-col
          bg-[#0A0A0A]/95 backdrop-blur-2xl
          border-r border-white/5
          transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          shadow-[5px_0_30px_rgba(0,0,0,0.5)]
        `}
      >
        {/* Subtle Gradient Border on the right edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

        {/* Inner Glow for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Content */}
        <div className="flex-none relative z-10">
          <SidebarHeader />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1 relative z-10">
          <SidebarNav />
        </div>

        <div className="flex-none p-4 mt-auto border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent relative z-10">
          <SidebarUserMenu />
        </div>
      </aside>
    </>
  )
}
export default Sidebar

```
```components/match/MatchDialog.tsx
import React from 'react';
import { Home, Shield, Activity, Zap } from 'lucide-react';
import HeadlessDialog from '../ui/HeadlessDialog';
import MatchScore from './MatchScore';
import TeamDisplay from './TeamDisplay';
import MatchStats from './MatchStats';
interface MatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  homeScore: number;
  awayScore: number;
}
const MatchDialog: React.FC<MatchDialogProps> = ({
  isOpen,
  onClose,
  homeScore,
  awayScore
}) => {
  const matchStats = [{
    label: 'Possession',
    home: 64,
    away: 36,
    homeLabel: '64%',
    awayLabel: '36%'
  }, {
    label: 'Shots',
    home: 18,
    away: 7,
    homeLabel: '18',
    awayLabel: '7'
  }, {
    label: 'Shots on Target',
    home: 6,
    away: 3,
    homeLabel: '6',
    awayLabel: '3'
  }, {
    label: 'Pass Accuracy',
    home: 91,
    away: 78,
    homeLabel: '91%',
    awayLabel: '78%'
  }];
  const advancedMetrics = [{
    label: 'Expected Goals (xG)',
    value: '2.42 - 0.87'
  }, {
    label: 'Corners',
    value: '8 - 3'
  }, {
    label: 'Fouls',
    value: '9 - 14'
  }, {
    label: 'Offsides',
    value: '2 - 5'
  }, {
    label: 'Yellow Cards',
    value: '1 - 3'
  }, {
    label: 'Red Cards',
    value: '0 - 0'
  }];
  const timeline = [{
    time: '72:43',
    event: 'Liverpool attacking in final third',
    active: true
  }, {
    time: '65:12',
    event: 'M. Salah shot saved by goalkeeper',
    active: false
  }, {
    time: '58:34',
    event: 'Goal! M. Salah ⚽',
    active: false
  }, {
    time: '45:00',
    event: 'Second Half begins',
    active: false
  }];
  return <HeadlessDialog isOpen={isOpen} onClose={onClose} title="Match Analysis - Liverpool vs Real Madrid" size="xl">
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <TeamDisplay name="LIV" icon={<Home className="w-12 h-12 text-white" />} position="home" large />

          <div className="flex flex-col items-center justify-center">
            <MatchScore homeScore={homeScore} awayScore={awayScore} />
            <div className="mt-2 flex items-center gap-2 px-4 py-1 rounded-full bg-k-limeLight border border-k-limeBorder text-k-lime text-sm font-bold font-mono">
              <span className="animate-pulse">●</span> 72:43
            </div>
          </div>

          <TeamDisplay name="RMA" icon={<Shield className="w-12 h-12 text-white" />} position="away" large />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-k-surfaceHighlight border border-k-borderLight rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-k-lime" />
              Match Statistics
            </h4>
            <MatchStats stats={matchStats} />
          </div>

          <div className="bg-k-surfaceHighlight border border-k-borderLight rounded-xl p-5">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-k-lime" />
              Advanced Metrics
            </h4>
            <div className="space-y-3">
              {advancedMetrics.map((metric, index) => <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{metric.label}</span>
                  <span className="text-sm font-bold text-white">{metric.value}</span>
                </div>)}
            </div>
          </div>
        </div>

        <div className="bg-k-surfaceHighlight border border-k-borderLight rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-4">Match Timeline</h4>
          <div className="space-y-3">
            {timeline.map((item, index) => <div key={index} className="flex items-center gap-3">
                <div className={`w-12 text-xs font-mono font-bold ${item.active ? 'text-k-lime' : 'text-gray-400'}`}>
                  {item.time}
                </div>
                <div className={`flex-1 text-sm ${item.active ? 'text-white' : 'text-gray-400'}`}>
                  {item.event}
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </HeadlessDialog>;
};
export default MatchDialog;
```
```components/match/MatchScore.tsx
import React from 'react';
interface MatchScoreProps {
  homeScore: number;
  awayScore: number;
  showStats?: boolean;
}
const MatchScore: React.FC<MatchScoreProps> = ({
  homeScore,
  awayScore,
  showStats = false
}) => {
  return <div className="flex flex-col items-center justify-center flex-1">
      <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 px-8 py-4 rounded-2xl">
        <div className="flex items-center gap-6 md:gap-10 text-6xl md:text-8xl font-mono font-bold text-white leading-none tracking-tighter">
          <span className="w-[1ch] text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">{homeScore}</span>
          <span className="text-k-lime text-4xl md:text-5xl animate-pulse self-center mb-2">:</span>
          <span className="w-[1ch] text-center bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">{awayScore}</span>
        </div>
      </div>
      {showStats && <div className="mt-4 flex gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-k-textMuted uppercase font-bold">Possession</span>
            <span className="text-sm font-mono font-bold text-k-lime">64%</span>
          </div>
          <div className="w-px h-8 bg-k-borderDim"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-k-textMuted uppercase font-bold">Shots</span>
            <span className="text-sm font-mono font-bold text-white">12</span>
          </div>
        </div>}
    </div>;
};
export default MatchScore;
```
```components/match/MatchStats.tsx
import React from 'react';
interface StatBar {
  label: string;
  home: number;
  away: number;
  homeLabel: string;
  awayLabel: string;
}
interface MatchStatsProps {
  stats: StatBar[];
}
const MatchStats: React.FC<MatchStatsProps> = ({
  stats
}) => {
  return <div className="space-y-4">
      {stats.map((stat, index) => {
      const total = stat.home + stat.away;
      const homePercentage = stat.home / total * 100;
      const awayPercentage = stat.away / total * 100;
      return <div key={index}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">{stat.label}</span>
              <span className="text-white font-bold">{stat.homeLabel} - {stat.awayLabel}</span>
            </div>
            <div className="flex h-2 bg-black rounded-full overflow-hidden">
              <div className="bg-k-lime" style={{
            width: `${homePercentage}%`
          }}></div>
              <div className="bg-gray-600" style={{
            width: `${awayPercentage}%`
          }}></div>
            </div>
          </div>;
    })}
    </div>;
};
export default MatchStats;
```
```components/match/TeamDisplay.tsx
import React, { ReactNode } from 'react';
interface TeamDisplayProps {
  name: string;
  icon: ReactNode;
  position: 'home' | 'away';
  large?: boolean;
}
const TeamDisplay: React.FC<TeamDisplayProps> = ({
  name,
  icon,
  position,
  large = false
}) => {
  const iconSize = large ? 'w-24 h-24' : 'w-20 h-20 md:w-24 md:h-24';
  const fontSize = large ? 'text-4xl' : 'text-2xl md:text-4xl';
  const animationClass = position === 'home' ? 'group-hover:translate-x-2' : 'group-hover:-translate-x-2';
  return <div className={`flex flex-col items-center gap-4 w-1/3 ${animationClass} transition-transform duration-500`}>
      <div className={`${iconSize} rounded-full bg-gradient-to-br from-k-surfaceHighlight to-black border-2 border-k-borderDim flex items-center justify-center shadow-2xl relative transform hover:scale-110 transition-all duration-300`}>
        {icon}
        <div className="absolute -bottom-3 bg-k-surface border border-k-borderDim px-3 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
          {position}
        </div>
      </div>
      <h2 className={`${fontSize} font-extrabold text-white tracking-tight`}>{name}</h2>
    </div>;
};
export default TeamDisplay;
```
```components/NotificationsSlideOver.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface Notification {
  id: string;
  user: string;
  initials: string;
  color: string;
  action: string;
  item: string;
  time: string;
}

interface NotificationsSlidOverProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    user: 'conceptual_artist',
    initials: 'CA',
    color: 'bg-lime-500',
    action: 'megvásárolta',
    item: '3D Artistry Pack',
    time: '1ó 5p e.'
  },
  {
    id: '2',
    user: 'imaginative_vision',
    initials: 'IV',
    color: 'bg-blue-500',
    action: 'kedvelte',
    item: 'Interactive Design Assets',
    time: '1ó 12p e.'
  },
  {
    id: '3',
    user: 'aesthetic_explorer',
    initials: 'AE',
    color: 'bg-purple-500',
    action: 'kommentelt',
    item: 'CreativeSpace UI Kit',
    time: '5ó e.'
  },
  {
    id: '4',
    user: 'style_savant',
    initials: 'SS',
    color: 'bg-pink-500',
    action: 'kedvelte',
    item: 'GraphicGenius Fonts',
    time: '7ó e.'
  },
  {
    id: '5',
    user: 'visual_vortex',
    initials: 'VV',
    color: 'bg-amber-500',
    action: 'megvásárolta',
    item: 'DesignWave Toolkit',
    time: '12ó e.'
  }
];

const NotificationsSlideOver: React.FC<NotificationsSlidOverProps> = ({ 
  isOpen, 
  onClose 
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* Slide-over Panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-[#0A0A0A] shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-bold text-white">
                          Értesítések
                        </Dialog.Title>
                        <button
                          type="button"
                          className="rounded-full p-2 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                          onClick={onClose}
                        >
                          <span className="sr-only">Bezárás</span>
                          <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                      <div className="space-y-3">
                        {mockNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="leaderboard-item group"
                          >
                            <div className="flex items-center gap-4">
                              {/* Avatar */}
                              <div
                                className={`
                                  flex-shrink-0 
                                  w-12 h-12 
                                  rounded-full 
                                  ${notification.color} 
                                  flex items-center justify-center 
                                  text-white font-bold text-sm
                                  shadow-lg
                                `}
                              >
                                {notification.initials}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/90">
                                  <span className="font-semibold text-white">
                                    {notification.user}
                                  </span>{' '}
                                  <span className="text-white/60">
                                    {notification.action}
                                  </span>
                                </p>
                                <p className="text-sm font-medium text-white mt-0.5">
                                  {notification.item}
                                </p>
                                <p className="text-xs text-white/40 mt-1">
                                  {notification.time}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <button
                                className="
                                  flex-shrink-0 
                                  w-6 h-6 
                                  rounded-full 
                                  flex items-center justify-center
                                  text-white/40 
                                  hover:text-white 
                                  hover:bg-white/10
                                  transition-all duration-200
                                  opacity-0 group-hover:opacity-100
                                "
                                aria-label="Értesítés eltávolítása"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 px-6 py-4">
                      <button
                        type="button"
                        className="btn-glass w-full"
                        onClick={onClose}
                      >
                        Összes értesítés megtekintése
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NotificationsSlideOver;
```
```components/PropertyInspector.tsx
import React, { useState, Component } from 'react'
import {
  RotateCcw,
  MousePointer2,
  Save,
  MoreHorizontal,
  X,
  ChevronDown,
  Laptop,
  UnfoldHorizontal,
  UnfoldVertical,
  Scan,
  Square,
  Eye,
  Image,
  Move,
  Zap,
  RotateCw,
  Maximize,
  WandSparkles,
  Sparkles,
  Paperclip,
  Figma,
  Send,
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
type TabMode = 'EDIT' | 'PROMPT' | 'CODE'
interface PropertyInspectorProps {
  selectedElement?: {
    type: string
    id: string
    classes: string
    content?: string
  }
  onStyleChange?: (property: string, value: any) => void
  onClose?: () => void
}
export const PropertyInspector = ({
  selectedElement,
  onStyleChange,
  onClose,
}: PropertyInspectorProps) => {
  const [activeTab, setActiveTab] = useState<TabMode>('EDIT')
  const [opacity, setOpacity] = useState(100)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [skewX, setSkewX] = useState(0)
  const [skewY, setSkewY] = useState(0)
  const [rotate, setRotate] = useState(0)
  const [scale, setScale] = useState(100)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [rotateZ, setRotateZ] = useState(0)
  const [perspective, setPerspective] = useState(0)
  const [promptText, setPromptText] = useState('')
  const [codeText, setCodeText] = useState(selectedElement?.classes || '')
  const elementType = selectedElement?.type || 'div'
  const elementId = selectedElement?.id || 'element'
  return (
    <div className="bg-card border-border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-80 max-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border py-2 px-4 bg-secondary/50 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xs uppercase font-medium text-muted-foreground">
            {elementType}
          </h3>
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setActiveTab('EDIT')}
              className={`px-2 py-1 text-[8px] font-medium transition-colors cursor-pointer ${activeTab === 'EDIT' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
            >
              EDIT
            </button>
            <button
              onClick={() => setActiveTab('PROMPT')}
              className={`px-2 py-1 text-[8px] font-medium transition-colors border-l border-border cursor-pointer ${activeTab === 'PROMPT' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
            >
              PROMPT
            </button>
            <button
              onClick={() => setActiveTab('CODE')}
              className={`px-2 py-1 text-[8px] font-medium transition-colors border-l border-border cursor-pointer ${activeTab === 'CODE' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
            >
              CODE
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <MousePointer2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <Save className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'PROMPT' ? (
          <form className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Describe what you want to change:
              </label>
              <div className="relative">
                <Textarea
                  placeholder="Adapt to dark mode, add details, make adaptive, change text to..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full resize-none min-h-[100px] max-h-[200px] overflow-y-auto text-xs hover:bg-secondary/50 pb-[40px] rounded-2xl"
                />
                <div className="absolute bottom-[16px] left-[9px] z-10 flex gap-1">
                  <button
                    type="button"
                    className="flex p-2 py-1 gap-2 items-center text-[10px] rounded-lg bg-card hover:bg-secondary border border-border hover:border-primary/50 shadow-sm"
                    title="Open Prompt Builder"
                  >
                    <WandSparkles className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="flex items-center rounded-lg bg-card border border-border hover:border-primary/50 shadow-sm p-2 py-1 gap-2 text-[10px] flex-shrink-0 hover:bg-secondary"
                    title="Select AI Model"
                  >
                    <Sparkles className="h-3 w-3" />
                    GPT-5
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </button>
                  <button
                    type="button"
                    className="flex p-2 py-1 gap-2 items-center text-[10px] rounded-lg bg-card hover:bg-secondary border border-border hover:border-primary/50 shadow-sm"
                    title="Attach Files (Max 2)"
                  >
                    <Paperclip className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    className="flex p-2 py-1 items-center text-[10px] rounded-lg bg-card hover:bg-secondary border border-border hover:border-primary/50 shadow-sm"
                    title="Import from Figma"
                  >
                    <Figma className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <div>
                  Selected:{' '}
                  <span className="font-medium font-mono text-xs uppercase text-foreground">
                    {elementType}
                  </span>
                </div>
                <span className="text-[10px]">#{elementId}</span>
              </div>
              <div className="font-mono text-[10px] bg-secondary/50 border border-border rounded-lg px-2 py-2">
                {codeText || 'No classes'}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 mt-2">
                <Button
                  type="submit"
                  disabled={!promptText.trim()}
                  className="flex p-2 px-3 gap-2 items-center"
                >
                  <Send className="w-3 h-3" />
                  Apply Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPromptText('')}
                  className="p-2 px-3"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Costs 1 prompt. Don't forget to save changes.
              </p>
            </div>
          </form>
        ) : activeTab === 'CODE' ? (
          <div className="flex flex-col h-full gap-3">
            <Textarea
              value={codeText}
              onChange={(e) => {
                setCodeText(e.target.value)
                if (onStyleChange) onStyleChange('classes', e.target.value)
              }}
              className="flex-1 font-mono text-xs resize-none bg-secondary/50 border-border rounded-lg p-3 min-h-[400px]"
              spellCheck={false}
            />
            <div className="flex items-center justify-between border-t border-border py-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  Live editing
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCodeText(selectedElement?.classes || '')}
                  className="text-[10px] h-7 px-2"
                >
                  Reset
                </Button>
                <Button
                  onClick={() =>
                    onStyleChange && onStyleChange('classes', codeText)
                  }
                  className="text-[10px] h-7 px-2"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Breakpoint Selector */}
            <div className="flex items-center justify-between">
              <div className="flex border border-border rounded-md overflow-hidden h-6">
                <button className="px-2 text-[9px] transition-[var(--transition-smooth)] bg-primary text-primary-foreground">
                  AUTO
                </button>
                <button className="px-2 text-[9px] transition-[var(--transition-smooth)] bg-card text-muted-foreground border-l border-border hover:bg-secondary">
                  *
                </button>
                <button className="px-2 text-[9px] transition-[var(--transition-smooth)] bg-accent/20 text-accent-foreground border-l border-border">
                  MD
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground ml-2 flex items-center gap-1">
                <Laptop className="w-3 h-3" />
                <span>Auto Breakpoint</span>
              </span>
            </div>

            {/* Text Content */}
            {selectedElement?.content !== undefined && (
              <PropertySection title="Text Content">
                <Textarea
                  placeholder="Enter text content..."
                  rows={1}
                  className="resize-none text-xs"
                  defaultValue={selectedElement.content}
                  onChange={(e) =>
                    onStyleChange && onStyleChange('content', e.target.value)
                  }
                />
              </PropertySection>
            )}

            {/* Tailwind Classes */}
            <PropertySection title="Tailwind Classes">
              <Textarea
                placeholder="Enter Tailwind classes..."
                rows={2}
                className="resize-none text-xs"
                value={codeText}
                onChange={(e) => {
                  setCodeText(e.target.value)
                  onStyleChange && onStyleChange('classes', e.target.value)
                }}
              />
            </PropertySection>

            {/* Margin */}
            <PropertySection title="Margin" icon={<Scan className="w-3 h-3" />}>
              <div className="grid grid-cols-2 gap-2">
                <IconInput
                  icon={<UnfoldHorizontal className="w-3 h-3" />}
                  placeholder="X"
                />
                <IconInput
                  icon={<UnfoldVertical className="w-3 h-3" />}
                  placeholder="Y"
                />
              </div>
            </PropertySection>

            {/* Padding */}
            <PropertySection
              title="Padding"
              icon={<Square className="w-3 h-3" />}
            >
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <LabeledInput label="L" placeholder="0" />
                  <LabeledInput label="T" placeholder="0" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LabeledInput label="R" placeholder="0" />
                  <LabeledInput label="B" placeholder="0" />
                </div>
              </div>
            </PropertySection>

            {/* Size */}
            <PropertySection title="Size">
              <div className="grid grid-cols-2 gap-2">
                <IconInput
                  icon={<UnfoldHorizontal className="w-3 h-3" />}
                  placeholder="Width"
                />
                <IconInput
                  icon={<UnfoldVertical className="w-3 h-3" />}
                  placeholder="Height"
                />
              </div>
            </PropertySection>

            {/* Typography */}
            <PropertySection title="Typography">
              <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="jakarta">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jakarta">Jakarta Sans</SelectItem>
                    <SelectItem value="mono">JetBrains Mono</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="default">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="xs">XS</SelectItem>
                    <SelectItem value="sm">SM</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="lg">LG</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Select defaultValue="semibold">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="semibold">Semibold</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="tight">
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tight">Tight</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PropertySection>

            {/* Appearance */}
            <PropertySection
              title="Appearance"
              icon={<Eye className="w-3 h-3" />}
            >
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground">
                    Opacity
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="h-7 text-xs"
                  />
                </div>
                <Select defaultValue="normal">
                  <SelectTrigger className="h-7 text-xs mt-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="multiply">Multiply</SelectItem>
                    <SelectItem value="screen">Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PropertySection>

            {/* Background */}
            <PropertySection title="Background">
              <div className="grid grid-cols-2 gap-2">
                <button className="h-7 flex items-center gap-2 px-2 py-1 text-xs rounded-md border border-border bg-card hover:bg-secondary transition-colors">
                  <div className="w-4 h-4 rounded-full border border-border bg-muted"></div>
                  <span className="text-xs truncate">Color</span>
                </button>
                <button className="h-7 flex items-center gap-2 px-2 py-1 text-xs rounded-md border border-border bg-card hover:bg-secondary transition-colors">
                  <div className="w-4 h-4 rounded border border-border bg-muted flex items-center justify-center">
                    <Image className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs truncate">Image</span>
                </button>
              </div>
            </PropertySection>

            {/* Transforms */}
            <div className="border-t border-border pt-4 pb-2">
              <PropertySection title="Transforms">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Slider
                      icon={<Move className="w-2.5 h-2.5" />}
                      label="Translate X"
                      value={translateX}
                      onChange={setTranslateX}
                      min={-200}
                      max={200}
                      unit="px"
                    />
                    <Slider
                      icon={<Move className="w-2.5 h-2.5" />}
                      label="Translate Y"
                      value={translateY}
                      onChange={setTranslateY}
                      min={-200}
                      max={200}
                      unit="px"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Slider
                      icon={<Zap className="w-2.5 h-2.5" />}
                      label="Skew X"
                      value={skewX}
                      onChange={setSkewX}
                      min={-45}
                      max={45}
                      unit="°"
                    />
                    <Slider
                      icon={<Zap className="w-2.5 h-2.5" />}
                      label="Skew Y"
                      value={skewY}
                      onChange={setSkewY}
                      min={-45}
                      max={45}
                      unit="°"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Slider
                      icon={<RotateCw className="w-2.5 h-2.5" />}
                      label="Rotate"
                      value={rotate}
                      onChange={setRotate}
                      min={-180}
                      max={180}
                      unit="°"
                    />
                    <Slider
                      icon={<Maximize className="w-2.5 h-2.5" />}
                      label="Scale"
                      value={scale}
                      onChange={setScale}
                      min={0}
                      max={200}
                      unit="%"
                    />
                  </div>
                </div>
              </PropertySection>
            </div>

            {/* 3D Transform */}
            <div className="border-t border-border pt-4 pb-2">
              <PropertySection title="3D Transform">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Slider
                      icon={<RotateCw className="w-2.5 h-2.5" />}
                      label="Rotate X"
                      value={rotateX}
                      onChange={setRotateX}
                      min={-180}
                      max={180}
                      unit="°"
                    />
                    <Slider
                      icon={<RotateCw className="w-2.5 h-2.5" />}
                      label="Rotate Y"
                      value={rotateY}
                      onChange={setRotateY}
                      min={-180}
                      max={180}
                      unit="°"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Slider
                      icon={<RotateCw className="w-2.5 h-2.5" />}
                      label="Rotate Z"
                      value={rotateZ}
                      onChange={setRotateZ}
                      min={-180}
                      max={180}
                      unit="°"
                    />
                    <Slider
                      icon={<Maximize className="w-2.5 h-2.5" />}
                      label="Perspective"
                      value={perspective}
                      onChange={setPerspective}
                      min={0}
                      max={6}
                      unit=""
                      valueLabel={
                        perspective === 0 ? 'Default' : perspective.toString()
                      }
                    />
                  </div>
                </div>
              </PropertySection>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
// Helper Components
const PropertySection = ({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-xs font-medium text-muted-foreground">
        {title}
      </label>
      {icon && (
        <button className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors">
          {icon}
        </button>
      )}
    </div>
    {children}
  </div>
)
const IconInput = ({
  icon,
  placeholder,
}: {
  icon: React.ReactNode
  placeholder?: string
}) => (
  <div className="relative">
    <div className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
      {icon}
    </div>
    <Input type="text" placeholder={placeholder} className="h-8 text-xs pl-8" />
  </div>
)
const LabeledInput = ({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xs font-light text-foreground pointer-events-none">
      {label}
    </span>
    <Input type="text" placeholder={placeholder} className="h-8 text-xs pl-8" />
  </div>
)
const Slider = ({
  icon,
  label,
  value,
  onChange,
  min,
  max,
  unit,
  valueLabel,
}: {
  icon: React.ReactNode
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit: string
  valueLabel?: string
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[10px] font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground">
        {valueLabel || `${value}${unit}`}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer 
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary 
        [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
        [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full 
        [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
    />
  </div>
)

```
```components/sidebar/SidebarHeader.tsx
import React from 'react'
import { Sparkles, Zap } from 'lucide-react'
const SidebarHeader = () => {
  return (
    <div className="px-6 py-6 pb-3 relative group cursor-default">
      {/* Ambient Glow behind logo */}
      <div className="absolute top-4 left-5 w-14 h-14 bg-[#BEF264] opacity-15 blur-[25px] group-hover:opacity-25 transition-opacity duration-700 rounded-full pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        {/* Logo Icon — More dramatic with inner glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#BEF264] rounded-xl blur-md opacity-20 group-hover:opacity-35 transition-opacity duration-500" />
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[#BEF264] via-[#d4f97e] to-[#aadd00] flex items-center justify-center shadow-[0_0_20px_rgba(190,242,100,0.3)] border border-white/20 group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-5 h-5 text-black fill-current drop-shadow-sm" />
          </div>
        </div>

        {/* Brand Name & Badge */}
        <div className="flex flex-col">
          <h1 className="text-white font-display font-bold text-[1.15rem] tracking-tight leading-none mb-1.5 group-hover:text-[#BEF264] transition-colors duration-300">
            WinMix
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-[#BEF264] uppercase tracking-[0.15em] bg-[#BEF264]/10 px-2 py-0.5 rounded-md border border-[#BEF264]/20 shadow-[0_0_10px_rgba(190,242,100,0.05)] flex items-center gap-1 font-body">
              <Sparkles className="w-2 h-2 fill-current" />
              Pro Tipster
            </span>
          </div>
        </div>
      </div>

      {/* Subtle separator */}
      <div className="mt-5 h-[1px] bg-gradient-to-r from-white/[0.06] via-white/[0.03] to-transparent" />
    </div>
  )
}
export default SidebarHeader

```
```components/sidebar/SidebarMenuGroup.tsx
import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
interface SidebarMenuGroupProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}
const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  title,
  children,
  defaultOpen = true,
  collapsible = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return <div className="mb-6">
      {/* Group Header */}
      <button onClick={collapsible ? () => setIsOpen(!isOpen) : undefined} className={`
          w-full flex items-center justify-between px-4 py-2 mb-1 
          text-[10px] font-bold uppercase tracking-widest transition-all duration-300
          ${collapsible ? 'cursor-pointer hover:bg-white/5 rounded-lg group' : 'cursor-default'}
          ${isOpen ? 'text-zinc-500' : 'text-zinc-600'}
        `} aria-expanded={isOpen}>
        <span className={`transition-colors ${collapsible ? 'group-hover:text-[#BEF264]' : ''}`}>
          {title}
        </span>

        {collapsible && <ChevronDown className={`
              w-3 h-3 text-zinc-600 transition-all duration-300 
              group-hover:text-zinc-300
              ${isOpen ? 'rotate-180' : 'rotate-0'}
            `} />}
      </button>

      {/* Children Container with smooth height transition possibility (CSS Grid trick or simple conditional) */}
      <div className={`
          space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'}
        `}>
        {children}
      </div>
    </div>;
};
export default SidebarMenuGroup;
```
```components/sidebar/SidebarMenuItem.tsx
import React, { memo } from 'react'
import { Link } from 'react-router-dom'
interface SidebarMenuItemProps {
  icon: ReactNode
  label: string
  isActive?: boolean
  onClick?: () => void
  badge?: ReactNode
  size?: 'normal' | 'small'
  className?: string
  href?: string // Link support
}
const SidebarMenuItem: React.FC<SidebarMenuItemProps> = memo(
  ({
    icon,
    label,
    isActive = false,
    onClick,
    badge,
    size = 'normal',
    className = '',
    href,
  }) => {
    // Méretezés logika
    const isSmall = size === 'small'
    const paddingClass = isSmall ? 'py-2 px-3' : 'py-3 px-4'
    const iconSizeClass = isSmall ? 'w-5 h-5' : 'w-5 h-5'
    const textSizeClass = isSmall ? 'text-xs' : 'text-[0.9rem]'
    const baseClasses = `
    group relative w-full flex items-center outline-none select-none
    rounded-xl transition-all duration-300 ease-out
    ${paddingClass} ${className}
    focus-visible:ring-2 focus-visible:ring-[#BEF264]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]
  `
    const content = (
      <>
        {/* 1. RÉTEG: Háttér és Hover State (Glass hatás) */}
        <div
          className={`
        absolute inset-0 rounded-xl transition-all duration-300
        ${isActive ? 'bg-gradient-to-r from-[#BEF264]/10 to-transparent opacity-100' : 'bg-white/0 group-hover:bg-white/[0.03] opacity-0 group-hover:opacity-100'}
      `}
        />

        {/* 2. RÉTEG: Aktív Indikátor (A "Fénycsík") */}
        <div
          className={`
        absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] rounded-r-full
        bg-[#BEF264] shadow-[0_0_12px_rgba(190,242,100,0.6)]
        transition-all duration-300 ease-spring
        ${isActive ? 'opacity-100 scale-y-100 translate-x-0' : 'opacity-0 scale-y-50 -translate-x-2'}
      `}
        />

        {/* 3. RÉTEG: Tartalom (Ikon és Szöveg) */}
        <div className="relative z-10 flex items-center w-full overflow-hidden">
          {/* Ikon Konténer */}
          <span
            className={`
          flex items-center justify-center transition-all duration-300 mr-3
          ${iconSizeClass}
          ${isActive ? 'text-[#BEF264] drop-shadow-[0_0_8px_rgba(190,242,100,0.5)] scale-110' : 'text-zinc-400 group-hover:text-zinc-200 group-hover:scale-105'}
        `}
          >
            {icon}
          </span>

          {/* Szöveg */}
          <span
            className={`
          font-medium tracking-wide truncate flex-1 text-left transition-colors duration-300
          ${textSizeClass}
          ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}
        `}
          >
            {label}
          </span>

          {/* Badge / Értesítés */}
          {badge && (
            <div
              className={`
            ml-auto pl-2 transition-all duration-300 transform
            ${isActive ? 'opacity-100 translate-x-0' : 'opacity-70 group-hover:opacity-100 group-hover:translate-x-0'}
          `}
            >
              {typeof badge === 'string' || typeof badge === 'number' ? (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#BEF264]/10 text-[#BEF264] border border-[#BEF264]/20 tabular-nums shadow-[0_0_10px_rgba(190,242,100,0.1)]">
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}
        </div>

        {/* 4. RÉTEG: Finom élfény hoverkor (Border light) */}
        <div
          className={`
        absolute inset-0 rounded-xl border border-transparent pointer-events-none transition-colors duration-300
        ${isActive ? 'border-[#BEF264]/10' : 'group-hover:border-white/5'}
      `}
        />
      </>
    )
    // Ha van href, Link-ként rendereljük, különben button-ként
    if (href) {
      return (
        <Link
          to={href}
          onClick={onClick}
          aria-current={isActive ? 'page' : undefined}
          className={baseClasses}
        >
          {content}
        </Link>
      )
    }
    return (
      <button
        onClick={onClick}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        className={baseClasses}
      >
        {content}
      </button>
    )
  },
)
SidebarMenuItem.displayName = 'SidebarMenuItem'
export default SidebarMenuItem

```
```components/sidebar/SidebarNav.tsx
import React, { useState } from 'react'
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Sparkles,
  Calendar,
  Star,
  ChevronRight,
  Target,
  Trophy,
  Globe,
  Palette,
} from 'lucide-react'
import SidebarMenuGroup from './SidebarMenuGroup'
import SidebarMenuItem from './SidebarMenuItem'
const SidebarNav = () => {
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [analyticsOpen, setAnalyticsOpen] = useState(true)
  // Helper a Live badge-hez
  const LiveBadge = (
    <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
      </span>
      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wide">
        Live
      </span>
    </div>
  )
  return (
    <div className="flex-1 space-y-6 py-2">
      {/* --- MAIN MENU --- */}
      <SidebarMenuGroup title="Overview">
        <SidebarMenuItem
          icon={<LayoutDashboard />}
          label="Dashboard"
          isActive={activeItem === 'Dashboard'}
          onClick={() => setActiveItem('Dashboard')}
          href="/"
        />
        <SidebarMenuItem
          icon={<Activity />}
          label="Live Odds"
          isActive={activeItem === 'Live Odds'}
          onClick={() => setActiveItem('Live Odds')}
          badge={LiveBadge}
        />
        <SidebarMenuItem
          icon={<Palette />}
          label="Brand Book"
          isActive={activeItem === 'Brand Book'}
          onClick={() => setActiveItem('Brand Book')}
          href="/brand-book"
          badge={
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#BEF264]/10 text-[#BEF264] border border-[#BEF264]/20">
              NEW
            </span>
          }
        />
      </SidebarMenuGroup>

      {/* --- ANALYTICS (Custom Accordion) --- */}
      <SidebarMenuGroup title="Intelligence">
        <div className="relative group">
          {/* Parent Item that acts as a Trigger */}
          <SidebarMenuItem
            icon={<BarChart3 />}
            label="Stats Hub"
            isActive={activeItem === 'Stats Hub' || analyticsOpen}
            onClick={() => setAnalyticsOpen(!analyticsOpen)}
            // Trükk: A badge helyére tesszük a nyilat
            badge={
              <ChevronRight
                className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${analyticsOpen ? 'rotate-90 text-white' : ''}`}
              />
            }
          />

          {/* Submenu Items - Indented & Connected */}
          <div
            className={`
               overflow-hidden transition-all duration-300 ease-in-out
               ${analyticsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
             `}
          >
            <div className="relative ml-4 pl-4 border-l border-white/5 my-1 space-y-1">
              <SidebarMenuItem
                icon={<Sparkles />}
                label="AI Models"
                size="small"
                isActive={activeItem === 'AI Models'}
                onClick={() => setActiveItem('AI Models')}
              />
              <SidebarMenuItem
                icon={<Target />}
                label="Predictions"
                size="small"
                isActive={activeItem === 'Predictions'}
                onClick={() => setActiveItem('Predictions')}
              />
            </div>
          </div>
        </div>

        <SidebarMenuItem
          icon={<Calendar />}
          label="Schedule"
          isActive={activeItem === 'Schedule'}
          onClick={() => setActiveItem('Schedule')}
        />
      </SidebarMenuGroup>

      {/* --- LEAGUES --- */}
      <SidebarMenuGroup title="Competitions" collapsible>
        <SidebarMenuItem
          icon={
            <div className="w-5 h-5 rounded-[6px] bg-gradient-to-br from-[#38003c] to-[#111] border border-white/10 flex items-center justify-center text-[8px] font-bold text-[#00ff85] shadow-sm">
              PL
            </div>
          }
          label="Premier League"
          isActive={activeItem === 'Premier League'}
          onClick={() => setActiveItem('Premier League')}
        />
        <SidebarMenuItem
          icon={
            <div className="w-5 h-5 rounded-[6px] bg-gradient-to-br from-[#111] to-black border border-white/10 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
              LL
            </div>
          }
          label="La Liga"
          isActive={activeItem === 'La Liga'}
          onClick={() => setActiveItem('La Liga')}
        />
        <SidebarMenuItem
          icon={<Star className="fill-[#FBBF24]/20 text-[#FBBF24]" />}
          label="Favorites"
          isActive={activeItem === 'Favorites'}
          onClick={() => setActiveItem('Favorites')}
          badge="12"
        />
      </SidebarMenuGroup>
    </div>
  )
}
export default SidebarNav

```
```components/sidebar/SidebarUserMenu.tsx
import React from 'react'
import { LogOut, Settings, User, ChevronUp } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
const SidebarUserMenu = () => {
  return (
    <Menu as="div" className="relative w-full">
      <Menu.Button className="group flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-left outline-none transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#BEF264] to-transparent p-[1px] shadow-[0_0_15px_rgba(190,242,100,0.15)] group-hover:shadow-[0_0_20px_rgba(190,242,100,0.3)] transition-shadow duration-300">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-black bg-zinc-900">
              <img
                src="https://ui-avatars.com/api/?name=Win+Mix&background=111&color=BEF264"
                alt="WinMix User Avatar"
                className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="truncate text-sm font-semibold text-white transition-colors group-hover:text-[#BEF264]">
            WinMix User
          </div>
          <div className="flex items-center gap-1.5 truncate text-[10px] font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-[#BEF264] animate-pulse"></span>
            Premium Plan
          </div>
        </div>

        <ChevronUp className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
      </Menu.Button>

      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left divide-y divide-white/5 rounded-xl bg-[#111] border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden backdrop-blur-xl">
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-white/10 text-white' : 'text-zinc-400'} group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-white/10 text-white' : 'text-zinc-400'} group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all`}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-red-500/10 text-red-400' : 'text-zinc-400'} group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-all hover:bg-red-500/10 hover:text-red-400`}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
export default SidebarUserMenu

```
```components/ui/accordion.tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({
  className,
  ...props
}, ref) => <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />);
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```
```components/ui/alert-dialog.tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({
  className,
  ...props
}, ref) => <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props} />
  </AlertDialogPortal>);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Action>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Cancel>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({
  variant: "outline"
}), "mt-2 sm:mt-0", className)} {...props} />);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
```
```components/ui/alert.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const alertVariants = cva("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(({
  className,
  variant,
  ...props
}, ref) => <div ref={ref} role="alert" className={cn(alertVariants({
  variant
}), className)} {...props} />);
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />);
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />);
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertTitle, AlertDescription };
```
```components/ui/aspect-ratio.tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
const AspectRatio = AspectRatioPrimitive.Root;
export { AspectRatio };
```
```components/ui/avatar.tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />);
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarImage, AvatarFallback };
```
```components/ui/Badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return <div className={cn(badgeVariants({
    variant
  }), className)} {...props} />;
}
export { Badge, badgeVariants };
```
```components/ui/breadcrumb.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav"> & {
  separator?: React.ReactNode;
}>(({
  ...props
}, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";
const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(({
  className,
  ...props
}, ref) => <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props} />);
BreadcrumbList.displayName = "BreadcrumbList";
const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />);
BreadcrumbItem.displayName = "BreadcrumbItem";
const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a"> & {
  asChild?: boolean;
}>(({
  asChild,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(({
  className,
  ...props
}, ref) => <span ref={ref} role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />);
BreadcrumbPage.displayName = "BreadcrumbPage";
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>;
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => <span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>;
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
```
```components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
```
```components/ui/calendar.tsx
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return <DayPicker showOutsideDays={showOutsideDays} className={cn("p-3", className)} classNames={{
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(buttonVariants({
      variant: "outline"
    }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: cn(buttonVariants({
      variant: "ghost"
    }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
    day_range_end: "day-range-end",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames
  }} components={{
    Chevron: props => {
      if (props.orientation === "left") {
        return <ChevronLeft className="h-4 w-4" />;
      }
      return <ChevronRight className="h-4 w-4" />;
    }
  }} {...props} />;
}
Calendar.displayName = "Calendar";
export { Calendar };
```
```components/ui/Card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />);
Card.displayName = "Card";
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />);
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```
```components/ui/carousel.tsx
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;
const CarouselContext = React.createContext<CarouselContextProps | null>(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}, ref) => {
  const [carouselRef, api] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y"
  }, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  }, [scrollPrev, scrollNext]);
  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }
    setApi(api);
  }, [api, setApi]);
  React.useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);
  return <CarouselContext.Provider value={{
    carouselRef,
    api: api,
    opts,
    orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext
  }}>
        <div ref={ref} onKeyDownCapture={handleKeyDown} className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props}>
          {children}
        </div>
      </CarouselContext.Provider>;
});
Carousel.displayName = "Carousel";
const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const {
    carouselRef,
    orientation
  } = useCarousel();
  return <div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>;
});
CarouselContent.displayName = "CarouselContent";
const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const {
    orientation
  } = useCarousel();
  return <div ref={ref} role="group" aria-roledescription="slide" className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)} {...props} />;
});
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(({
  className,
  variant = "outline",
  size = "icon",
  ...props
}, ref) => {
  const {
    orientation,
    scrollPrev,
    canScrollPrev
  } = useCarousel();
  return <Button ref={ref} variant={variant} size={size} className={cn("absolute  h-8 w-8 rounded-full", orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>;
});
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(({
  className,
  variant = "outline",
  size = "icon",
  ...props
}, ref) => {
  const {
    orientation,
    scrollNext,
    canScrollNext
  } = useCarousel();
  return <Button ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full", orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollNext} onClick={scrollNext} {...props}>
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>;
});
CarouselNext.displayName = "CarouselNext";
export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
```
```components/ui/chart.tsx
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
} as const;
export type ChartConfig = { [k in string]: {
  label?: React.ReactNode;
  icon?: React.ComponentType;
} & ({
  color?: string;
  theme?: never;
} | {
  color?: never;
  theme: Record<keyof typeof THEMES, string>;
}) };
type ChartContextProps = {
  config: ChartConfig;
};
const ChartContext = React.createContext<ChartContextProps | null>(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
const ChartContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}>(({
  id,
  className,
  children,
  config,
  ...props
}, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return <ChartContext.Provider value={{
    config
  }}>
      <div data-chart={chartId} ref={ref} className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>;
});
ChartContainer.displayName = "Chart";
const ChartStyle = ({
  id,
  config
}: {
  id: string;
  config: ChartConfig;
}) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);
  if (!colorConfig.length) {
    return null;
  }
  return <style dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
      return color ? `  --color-${key}: ${color};` : null;
    }).join("\n")}
}
`).join("\n")
  }} />;
};
const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}>(({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}, ref) => {
  const {
    config
  } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey || item.dataKey || item.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label as keyof typeof config]?.label || label : itemConfig?.label;
    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>;
    }
    if (!value) {
      return null;
    }
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return <div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
        const key = `${nameKey || item.name || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const indicatorColor = color || item.payload.fill || item.color;
        return <div key={item.dataKey} className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}>
                {formatter && item?.value !== undefined && item.name ? formatter(item.value, item.name, item, index, item.payload) : <>
                    {itemConfig?.icon ? <itemConfig.icon /> : !hideIndicator && <div className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
              "h-2.5 w-2.5": indicator === "dot",
              "w-1": indicator === "line",
              "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
              "my-0.5": nestLabel && indicator === "dashed"
            })} style={{
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor
            } as React.CSSProperties} />}
                    <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>}
                    </div>
                  </>}
              </div>;
      })}
        </div>
      </div>;
});
ChartTooltipContent.displayName = "ChartTooltip";
const ChartLegend = RechartsPrimitive.Legend;
const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
  hideIcon?: boolean;
  nameKey?: string;
}>(({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}, ref) => {
  const {
    config
  } = useChart();
  if (!payload?.length) {
    return null;
  }
  return <div ref={ref} className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
        {payload.map(item => {
      const key = `${nameKey || item.dataKey || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      return <div key={item.value} className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}>
              {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{
          backgroundColor: item.color
        }} />}
              {itemConfig?.label}
            </div>;
    })}
      </div>;
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined;
  let configLabelKey: string = key;
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }
  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
```
```components/ui/checkbox.tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(({
  className,
  ...props
}, ref) => <CheckboxPrimitive.Root ref={ref} className={cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
export { Checkbox };
```
```components/ui/collapsible.tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```
```components/ui/command.tsx
import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(({
  className,
  ...props
}, ref) => <CommandPrimitive ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />);
Command.displayName = CommandPrimitive.displayName;
interface CommandDialogProps extends DialogProps {}
const CommandDialog = ({
  children,
  ...props
}: CommandDialogProps) => {
  return <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>;
};
const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>(({
  className,
  ...props
}, ref) => <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input ref={ref} className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
  </div>);
CommandInput.displayName = CommandPrimitive.Input.displayName;
const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.List ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />);
CommandList.displayName = CommandPrimitive.List.displayName;
const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Group ref={ref} className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...props} />);
CommandGroup.displayName = CommandPrimitive.Group.displayName;
const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50", className)} {...props} />);
CommandItem.displayName = CommandPrimitive.Item.displayName;
const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
```
```components/ui/context-menu.tsx
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
const ContextMenuSubTrigger = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <ContextMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>);
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;
const ContextMenuSubContent = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;
const ContextMenuContent = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </ContextMenuPrimitive.Portal>);
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;
const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <ContextMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;
const ContextMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <ContextMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>);
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;
const ContextMenuRadioItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <ContextMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>);
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;
const ContextMenuLabel = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <ContextMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props} />);
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;
const ContextMenuSeparator = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />);
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;
const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup };
```
```components/ui/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>);
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />);
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
```
```components/ui/drawer.tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
Drawer.displayName = "Drawer";
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;
const DrawerOverlay = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;
const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content ref={ref} className={cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className)} {...props}>
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>);
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
DrawerHeader.displayName = "DrawerHeader";
const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
DrawerFooter.displayName = "DrawerFooter";
const DrawerTitle = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />);
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;
const DrawerDescription = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
```
```components/ui/dropdown-menu.tsx
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({
  className,
  sideOffset = 4,
  ...props
}, ref) => <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </DropdownMenuPrimitive.Portal>);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <DropdownMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup };
```
```components/ui/form.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
const Form = FormProvider;
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <FormFieldContext.Provider value={{
    name: props.name
  }}>
      <Controller {...props} />
    </FormFieldContext.Provider>;
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const {
    getFieldState,
    formState
  } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const {
    id
  } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
type FormItemContextValue = {
  id: string;
};
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const id = React.useId();
  return <FormItemContext.Provider value={{
    id
  }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>;
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({
  className,
  ...props
}, ref) => {
  const {
    error,
    formItemId
  } = useFormField();
  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({
  ...props
}, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId
  } = useFormField();
  return <Slot ref={ref} id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => {
  const {
    formDescriptionId
  } = useFormField();
  return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  children,
  ...props
}, ref) => {
  const {
    error,
    formMessageId
  } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) {
    return null;
  }
  return <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>;
});
FormMessage.displayName = "FormMessage";
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
```
```components/ui/HeadlessDialog.tsx
import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
interface HeadlessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}
const HeadlessDialog: React.FC<HeadlessDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  return <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-gradient-to-b from-k-card/60 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/30 dark:border-b-0 backdrop-blur-xl shadow-2xl transition-all`}>
                <div className="flex items-center justify-between p-6 border-b border-k-borderLight/20 backdrop-blur-sm">
                  <Dialog.Title className="text-xl font-bold text-white">
                    {title}
                  </Dialog.Title>
                  {showCloseButton && <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-k-lime" aria-label="Close dialog">
                      <X className="w-5 h-5" />
                    </button>}
                </div>
                <div className="p-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>;
};
export default HeadlessDialog;
```
```components/ui/HeadlessMenu.tsx
import React, { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}
interface HeadlessMenuProps {
  button: ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right' | 'top';
}
const HeadlessMenu: React.FC<HeadlessMenuProps> = ({
  button,
  items,
  align = 'right'
}) => {
  const positionClass = align === 'top' ? 'bottom-full mb-2' : 'mt-2';
  const horizontalAlign = align === 'right' || align === 'top' ? 'right-0' : 'left-0';
  const originClass = align === 'top' ? 'origin-bottom-right' : `origin-top-${align === 'right' ? 'right' : 'left'}`;
  return <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={Fragment}>{button}</Menu.Button>

      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className={`absolute ${horizontalAlign} ${positionClass} w-56 ${originClass} rounded-xl bg-gradient-to-b from-k-card/30 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 dark:border-b-k-border/5 backdrop-blur-xl shadow-2xl ring-1 ring-black/10 focus:outline-none z-50 overflow-hidden`}>
          <div className="py-1">
            {items.map((item, index) => <Menu.Item key={index} disabled={item.disabled}>
                {({
              active
            }) => <button onClick={item.onClick} disabled={item.disabled} className={`${active ? 'bg-white/5 text-white backdrop-blur-sm' : 'text-gray-400'} ${item.danger ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center px-4 py-3 text-sm font-medium transition-all duration-200`}>
                    {item.icon && <span className="mr-3 w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>}
                    {item.label}
                  </button>}
              </Menu.Item>)}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>;
};
export default HeadlessMenu;
```
```components/ui/HeadlessPopover.tsx
import React, { Fragment, ReactNode } from 'react';
import { Popover, Transition } from '@headlessui/react';
interface HeadlessPopoverProps {
  button: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}
const HeadlessPopover: React.FC<HeadlessPopoverProps> = ({
  button,
  children,
  align = 'center',
  className = ''
}) => {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };
  return <Popover className="relative">
      <Popover.Button as={Fragment}>{button}</Popover.Button>

      <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className={`absolute ${alignClasses[align]} z-50 mt-3 ${className}`}>
          <div className="overflow-hidden rounded-xl bg-gradient-to-b from-k-card/30 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 dark:border-b-k-border/5 backdrop-blur-xl shadow-2xl ring-1 ring-black/10">
            {children}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>;
};
export default HeadlessPopover;
```
```components/ui/HeadlessSwitch.tsx
import React from 'react';
import { Switch } from '@headlessui/react';
interface HeadlessSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
}
const HeadlessSwitch: React.FC<HeadlessSwitchProps> = ({
  enabled,
  onChange,
  label,
  description
}) => {
  return <Switch.Group>
      <div className="flex items-center justify-between">
        <span className="flex flex-col flex-grow">
          {label && <Switch.Label className="text-sm font-medium text-white cursor-pointer">
              {label}
            </Switch.Label>}
          {description && <Switch.Description className="text-xs text-gray-400 mt-1">
              {description}
            </Switch.Description>}
        </span>
        <Switch checked={enabled} onChange={onChange} className={`${enabled ? 'bg-k-lime shadow-lg shadow-k-lime/30' : 'bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 border border-k-borderLight/20 backdrop-blur-sm'} relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface`}>
          <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-black transition-transform`} />
        </Switch>
      </div>
    </Switch.Group>;
};
export default HeadlessSwitch;
```
```components/ui/HeadlessTabs.tsx
import React, { Fragment, ReactNode } from 'react';
import { Tab } from '@headlessui/react';
interface TabItem {
  name: string;
  icon?: ReactNode;
  content: ReactNode;
}
interface HeadlessTabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
}
const HeadlessTabs: React.FC<HeadlessTabsProps> = ({
  tabs,
  defaultIndex = 0
}) => {
  return <Tab.Group defaultIndex={defaultIndex}>
      <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm p-1 border border-k-borderLight dark:border-k-border/10">
        {tabs.map(tab => <Tab key={tab.name} as={Fragment}>
            {({
          selected
        }) => <button className={`w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface ${selected ? 'bg-k-lime text-black shadow-lg shadow-k-lime/20' : 'text-gray-400 hover:bg-white/5 hover:text-white backdrop-blur-sm'}`}>
                <span className="flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.name}
                </span>
              </button>}
          </Tab>)}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((tab, idx) => <Tab.Panel key={idx} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface">
            {tab.content}
          </Tab.Panel>)}
      </Tab.Panels>
    </Tab.Group>;
};
export default HeadlessTabs;
```
```components/ui/hover-card.tsx
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";
const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>>(({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}, ref) => <HoverCardPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
export { HoverCard, HoverCardTrigger, HoverCardContent };
```
```components/ui/input-otp.tsx
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";
const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(({
  className,
  containerClassName,
  ...props
}, ref) => <OTPInput ref={ref} containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)} className={cn("disabled:cursor-not-allowed", className)} {...props} />);
InputOTP.displayName = "InputOTP";
const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />);
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {
  index: number;
}>(({
  index,
  className,
  ...props
}, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const {
    char,
    hasFakeCaret,
    isActive
  } = inputOTPContext.slots[index];
  return <div ref={ref} className={cn("relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-2 ring-ring ring-offset-background", className)} {...props}>
      {char}
      {hasFakeCaret && <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>}
    </div>;
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(({
  ...props
}, ref) => <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>);
InputOTPSeparator.displayName = "InputOTPSeparator";
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
```
```components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({
  className,
  type,
  ...props
}, ref) => {
  return <input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";
export { Input };
```
```components/ui/label.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(({
  className,
  ...props
}, ref) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />);
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
```
```components/ui/LiveIndicator.tsx
import React from 'react';
interface LiveIndicatorProps {
  time?: string;
  label?: string;
  variant?: 'default' | 'small';
}
const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  time,
  label = 'LIVE',
  variant = 'default'
}) => {
  if (variant === 'small') {
    return <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
      </div>;
  }
  return <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-k-limeLight border border-k-limeBorder text-k-lime text-sm font-bold font-mono">
      <span className="animate-pulse">●</span>
      {time || label}
    </div>;
};
export default LiveIndicator;
```
```components/ui/menubar.tsx
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const MenubarMenu = MenubarPrimitive.Menu;
const MenubarGroup = MenubarPrimitive.Group;
const MenubarPortal = MenubarPrimitive.Portal;
const MenubarSub = MenubarPrimitive.Sub;
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
const Menubar = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Root ref={ref} className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)} {...props} />);
Menubar.displayName = MenubarPrimitive.Root.displayName;
const MenubarTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Trigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", className)} {...props} />);
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;
const MenubarSubTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <MenubarPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>);
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;
const MenubarSubContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;
const MenubarContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Content>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>>(({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}, ref) => <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content ref={ref} align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={cn("z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
    </MenubarPrimitive.Portal>);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;
const MenubarItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Item>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <MenubarPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
MenubarItem.displayName = MenubarPrimitive.Item.displayName;
const MenubarCheckboxItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <MenubarPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>);
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;
const MenubarRadioItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <MenubarPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>);
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;
const MenubarLabel = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Label>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <MenubarPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />);
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;
const MenubarSeparator = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;
const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayname = "MenubarShortcut";
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarPortal, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarSub, MenubarShortcut };
```
```components/ui/navigation-menu.tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const NavigationMenu = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Root>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>>(({
  className,
  children,
  ...props
}, ref) => <NavigationMenuPrimitive.Root ref={ref} className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...props}>
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;
const NavigationMenuList = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.List>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.List ref={ref} className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...props} />);
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;
const NavigationMenuItem = NavigationMenuPrimitive.Item;
const navigationMenuTriggerStyle = cva("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50");
const NavigationMenuTrigger = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), "group", className)} {...props}>
    {children}{" "}
    <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
  </NavigationMenuPrimitive.Trigger>);
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;
const NavigationMenuContent = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.Content ref={ref} className={cn("left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ", className)} {...props} />);
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;
const NavigationMenuLink = NavigationMenuPrimitive.Link;
const NavigationMenuViewport = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>>(({
  className,
  ...props
}, ref) => <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport className={cn("origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]", className)} ref={ref} {...props} />
  </div>);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;
const NavigationMenuIndicator = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Indicator>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.Indicator ref={ref} className={cn("top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in", className)} {...props}>
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>);
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
export { navigationMenuTriggerStyle, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport };
```
```components/ui/NotificationDrawer.tsx
import React, { useCallback, useEffect, useState, Fragment, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
// Notification interfész
export interface Notification {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  isRead?: boolean;
}
interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}
// NotificationItem - memo-val
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = memo(({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  }, [notification.id, onDelete]);
  return <div className="group relative flex items-center p-5 cursor-pointer rounded-2xl hover:bg-white/5 transition-all duration-200">
      {/* Gradient Card Background on Hover */}
      <div className="absolute inset-0 rounded-2xl invisible opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 bg-gradient-to-br from-k-lime/20 via-k-lime/10 to-transparent backdrop-blur-sm">
        <div className="absolute inset-[1.5px] bg-gradient-to-b from-k-surface/90 to-k-surface/80 rounded-[14.5px]"></div>
      </div>

      {/* User Avatar */}
      <button onClick={handleMarkAsRead} className="relative z-10 shrink-0 w-12 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface">
        <img alt={notification.user} className="w-full h-full object-cover" src={notification.avatar} />
      </button>

      {/* Notification Content */}
      <div className="relative z-10 flex-1 pl-4 pr-8">
        <div className={`text-sm leading-relaxed ${!notification.isRead ? 'font-semibold text-white' : 'text-gray-400'}`}>
          <button onClick={handleMarkAsRead} className="font-semibold hover:text-k-lime transition-colors focus:outline-none focus:underline">
            {notification.user}
          </button>{' '}
          {notification.action}{' '}
          <button onClick={handleMarkAsRead} className="font-semibold hover:text-k-lime transition-colors focus:outline-none focus:underline">
            {notification.target}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">{notification.time}</div>
      </div>

      {/* Delete button */}
      <button onClick={handleDelete} className="relative z-20 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Törölni ${notification.user} értesítést`}>
        <X className="w-4 h-4" />
      </button>
    </div>;
});
NotificationItem.displayName = 'NotificationItem';
const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications: externalNotifications,
  onMarkAsRead: externalOnMarkAsRead,
  onDelete: externalOnDelete
}) => {
  const [internalNotifications, setInternalNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mock adatok
  const mockNotifications: Notification[] = [{
    id: '1',
    user: 'conceptual_artist',
    avatar: 'https://ui-avatars.com/api/?name=CA&background=CCFF00&color=000&bold=true',
    action: 'megvásárolta',
    target: '3D Artistry Pack',
    time: '1ó 5p e.'
  }, {
    id: '2',
    user: 'imaginative_vision',
    avatar: 'https://ui-avatars.com/api/?name=IV&background=3b82f6&color=fff',
    action: 'kedvelte',
    target: 'Interactive Design Assets',
    time: '1ó 12p e.',
    isRead: true
  }, {
    id: '3',
    user: 'aesthetic_explorer',
    avatar: 'https://ui-avatars.com/api/?name=AE&background=8b5cf6&color=fff',
    action: 'kommentelt',
    target: 'CreativeSpace UI Kit',
    time: '5ó e.'
  }, {
    id: '4',
    user: 'style_savant',
    avatar: 'https://ui-avatars.com/api/?name=SS&background=ec4899&color=fff',
    action: 'kedvelte',
    target: 'GraphicGenius Fonts',
    time: '7ó e.'
  }, {
    id: '5',
    user: 'visual_vortex',
    avatar: 'https://ui-avatars.com/api/?name=VV&background=f59e0b&color=fff',
    action: 'megvásárolta',
    target: 'DesignWave Toolkit',
    time: '12ó e.'
  }];
  // API szimuláció
  useEffect(() => {
    if (!externalNotifications?.length) {
      setLoading(true);
      const fetchNotifications = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          setInternalNotifications(mockNotifications);
        } catch (err) {
          setError('Nem sikerült betölteni az értesítéseket.');
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, []);
  const notifications = externalNotifications || internalNotifications;
  const markAsRead = useCallback((id: string) => {
    if (externalOnMarkAsRead) {
      externalOnMarkAsRead(id);
    } else {
      setInternalNotifications(prev => prev.map(n => n.id === id ? {
        ...n,
        isRead: true
      } : n));
    }
  }, [externalOnMarkAsRead]);
  const deleteNotification = useCallback((id: string) => {
    if (externalOnDelete) {
      externalOnDelete(id);
    } else {
      setInternalNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [externalOnDelete]);
  return <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        {/* Headless UI Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer Panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300 sm:duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-gradient-to-b from-k-card/100 to-k-card/80 border-l border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 backdrop-blur-xl shadow-2xl">
                    {/* Header */}
                    <div className="flex-shrink-0 px-10 pt-10 pb-5">
                      <div className="flex h-12 items-center justify-between">
                        <Dialog.Title className="text-xl font-semibold text-white">
                          Értesítések
                        </Dialog.Title>
                        <div className="ml-2 flex h-12 items-center">
                          <button type="button" className="group inline-flex items-center justify-center rounded-full bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm border border-k-borderLight/20 p-2 text-gray-400 hover:border-k-lime hover:text-white hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] focus:outline-none focus:ring-2 focus:ring-k-lime transition-all duration-200" onClick={onClose}>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-5 pb-20" aria-live="polite">
                      {loading && <div className="flex items-center justify-center h-32 text-gray-400">
                          Értesítések betöltése...
                        </div>}

                      {error && <div className="flex items-center justify-center h-32 text-red-400 p-8 text-center">
                          {error}
                          <button onClick={() => window.location.reload()} className="ml-2 text-k-lime hover:underline focus:outline-none focus:ring-2 focus:ring-k-lime">
                            Újratöltés
                          </button>
                        </div>}

                      {!loading && !error && notifications.length === 0 && <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                          <div className="text-2xl mb-4">🔔</div>
                          <div className="text-lg mb-2">Nincs értesítés</div>
                          <div className="text-sm">
                            Később értesülhetsz az új tevékenységekről
                          </div>
                        </div>}

                      {!loading && !error && notifications.map(notification => <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} onDelete={deleteNotification} />)}
                    </div>

                    {/* Footer Button */}
                    <div className="flex-shrink-0 border-t border-k-borderLight/20 backdrop-blur-sm px-6 pb-6 pt-6">
                      <button className="w-full inline-flex items-center justify-center h-12 rounded-full text-sm font-semibold transition-all duration-200 bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm text-white border border-k-borderLight/20 hover:border-k-lime hover:text-k-lime hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] focus:outline-none focus:ring-2 focus:ring-k-lime">
                        Összes értesítés megtekintése
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>;
};
export default NotificationDrawer;
```
```components/ui/pagination.tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
Pagination.displayName = "Pagination";
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />);
PaginationContent.displayName = "PaginationContent";
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} className={cn("", className)} {...props} />);
PaginationItem.displayName = "PaginationItem";
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> & React.ComponentProps<"a">;
const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => <a aria-current={isActive ? "page" : undefined} className={cn(buttonVariants({
  variant: isActive ? "outline" : "ghost",
  size
}), className)} {...props} />;
PaginationLink.displayName = "PaginationLink";
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>;
PaginationPrevious.displayName = "PaginationPrevious";
const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>;
PaginationNext.displayName = "PaginationNext";
const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>;
PaginationEllipsis.displayName = "PaginationEllipsis";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
```
```components/ui/popover.tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}, ref) => <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </PopoverPrimitive.Portal>);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
export { Popover, PopoverTrigger, PopoverContent };
```
```components/ui/progress.tsx
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({
  className,
  value,
  ...props
}, ref) => <ProgressPrimitive.Root ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{
    transform: `translateX(-${100 - (value || 0)}%)`
  }} />
  </ProgressPrimitive.Root>);
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
```
```components/ui/ProgressBar.tsx
import React from 'react';
interface ProgressBarProps {
  percentage: number;
  color?: 'lime' | 'white' | 'success' | 'danger';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}
const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'lime',
  height = 'md',
  showLabel = false,
  label
}) => {
  const colorClasses = {
    lime: 'bg-k-lime',
    white: 'bg-white',
    success: 'bg-success',
    danger: 'bg-danger'
  };
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  return <div className="w-full">
      {showLabel && label && <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-bold">{percentage}%</span>
        </div>}
      <div className={`w-full bg-black rounded-full overflow-hidden border border-white/10 ${heightClasses[height]}`}>
        <div className={`${colorClasses[color]} ${heightClasses[height]} transition-all duration-1000 ease-out`} style={{
        width: `${percentage}%`
      }} />
      </div>
    </div>;
};
export default ProgressBar;
```
```components/ui/radio-group.tsx
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(({
  className,
  ...props
}, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(({
  className,
  ...props
}, ref) => {
  return <RadioGroupPrimitive.Item ref={ref} className={cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>;
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
export { RadioGroup, RadioGroupItem };
```
```components/ui/resizable.tsx
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => <ResizablePrimitive.PanelGroup className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)} {...props} />;
const ResizablePanel = ResizablePrimitive.Panel;
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => <ResizablePrimitive.PanelResizeHandle className={cn("relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90", className)} {...props}>
    {withHandle && <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>}
  </ResizablePrimitive.PanelResizeHandle>;
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
```
```components/ui/scroll-area.tsx
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({
  className,
  children,
  ...props
}, ref) => <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({
  className,
  orientation = "vertical",
  ...props
}, ref) => <ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
export { ScrollArea, ScrollBar };
```
```components/ui/select.tsx
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({
  className,
  children,
  position = "popper",
  ...props
}, ref) => <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>);
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />);
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>);
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton };
```
```components/ui/separator.tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}, ref) => <SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />);
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };
```
```components/ui/sheet.tsx
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500", {
  variants: {
    side: {
      top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
    }
  },
  defaultVariants: {
    side: "right"
  }
});
interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {}
const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(({
  side = "right",
  className,
  children,
  ...props
}, ref) => <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({
    side
  }), className)} {...props}>
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
SheetFooter.displayName = "SheetFooter";
const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />);
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
SheetDescription.displayName = SheetPrimitive.Description.displayName;
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
```
```components/ui/sidebar.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};
const SidebarContext = React.createContext<SidebarContext | null>(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>(({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [setOpenProp, open]);

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo<SidebarContext>(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
  return <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      } as React.CSSProperties} className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)} ref={ref} {...props}>
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>;
});
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}>(({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}, ref) => {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile
  } = useSidebar();
  if (collapsible === "none") {
    return <div className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)} ref={ref} {...props}>
          {children}
        </div>;
  }
  if (isMobile) {
    return <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent data-sidebar="sidebar" data-mobile="true" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" style={{
        "--sidebar-width": SIDEBAR_WIDTH_MOBILE
      } as React.CSSProperties} side={side}>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>;
  }
  return <div ref={ref} className="group peer hidden md:block text-sidebar-foreground" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
        {/* This is what handles the sidebar gap on desktop */}
        <div className={cn("duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]")} />
        <div className={cn("duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
    // Adjust the padding for floating and inset variants.
    variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            {children}
          </div>
        </div>
      </div>;
});
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(({
  className,
  onClick,
  ...props
}, ref) => {
  const {
    toggleSidebar
  } = useSidebar();
  return <Button ref={ref} data-sidebar="trigger" variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={event => {
    onClick?.(event);
    toggleSidebar();
  }} {...props}>
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>;
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(({
  className,
  ...props
}, ref) => {
  const {
    toggleSidebar
  } = useSidebar();
  return <button ref={ref} data-sidebar="rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props} />;
});
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(({
  className,
  ...props
}, ref) => {
  return <main ref={ref} className={cn("relative flex min-h-svh flex-1 flex-col bg-background", "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className)} {...props} />;
});
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(({
  className,
  ...props
}, ref) => {
  return <Input ref={ref} data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props} />;
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(({
  className,
  ...props
}, ref) => {
  return <Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />;
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />;
});
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />;
});
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  asChild?: boolean;
}>(({
  className,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} data-sidebar="group-label" className={cn("duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props} />;
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
}>(({
  className,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-sidebar="group-action" className={cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props} />;
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
    },
    size: {
      default: "h-8 text-sm",
      sm: "h-7 text-xs",
      lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>>(({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  const {
    isMobile,
    state
  } = useSidebar();
  const button = <Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({
    variant,
    size
  }), className)} {...props} />;
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
      </Tooltip>;
});
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}>(({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-sidebar="menu-action" className={cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} {...props} />;
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} data-sidebar="menu-badge" className={cn("absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  showIcon?: boolean;
}>(({
  className,
  showIcon = false,
  ...props
}, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return <div ref={ref} data-sidebar="menu-skeleton" className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-4 flex-1 max-w-[--skeleton-width]" data-sidebar="menu-skeleton-text" style={{
      "--skeleton-width": width
    } as React.CSSProperties} />
    </div>;
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} data-sidebar="menu-sub" className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  ...props
}, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}>(({
  asChild = false,
  size = "md",
  isActive,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} {...props} />;
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar };
```
```components/ui/skeleton.tsx
import { cn } from "@/lib/utils";
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
export { Skeleton };
```
```components/ui/SkeletonLoader.tsx
import React from 'react';
const SkeletonLoader = () => <div className="p-6 space-y-6 w-full animate-pulse">
    <div className="h-24 w-full bg-[#1a1a1a] rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-[#1a1a1a] rounded-3xl"></div>
      <div className="h-80 bg-[#1a1a1a] rounded-3xl"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#1a1a1a] rounded-2xl"></div>)}
    </div>
  </div>;
export default SkeletonLoader;
```
```components/ui/slider.tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({
  className,
  ...props
}, ref) => <SliderPrimitive.Root ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>);
Slider.displayName = SliderPrimitive.Root.displayName;
export { Slider };
```
```components/ui/sonner.tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
type ToasterProps = React.ComponentProps<typeof Sonner>;
const Toaster = ({
  ...props
}: ToasterProps) => {
  const {
    theme = "system"
  } = useTheme();
  return <Sonner theme={theme as ToasterProps["theme"]} className="toaster group" toastOptions={{
    classNames: {
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
    }
  }} {...props} />;
};
export { Toaster };
```
```components/ui/StatusDot.tsx
import React from 'react';
interface StatusDotProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}
const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  animate = true
}) => {
  const statusColors = {
    online: 'bg-success',
    offline: 'bg-gray-500',
    away: 'bg-warning',
    busy: 'bg-danger'
  };
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };
  const animateClass = animate && status === 'online' ? 'animate-pulse' : '';
  return <span className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]} ${animateClass}`} />;
};
export default StatusDot;
```
```components/ui/switch.tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({
  className,
  ...props
}, ref) => <SwitchPrimitives.Root className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")} />
  </SwitchPrimitives.Root>);
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
```
```components/ui/table.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({
  className,
  ...props
}, ref) => <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>);
Table.displayName = "Table";
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />);
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />);
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />);
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({
  className,
  ...props
}, ref) => <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />);
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />);
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />);
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({
  className,
  ...props
}, ref) => <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />);
TableCaption.displayName = "TableCaption";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
```
```components/ui/tabs.tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />);
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />);
TabsContent.displayName = TabsPrimitive.Content.displayName;
export { Tabs, TabsList, TabsTrigger, TabsContent };
```
```components/ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  ...props
}, ref) => {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
export { Textarea };
```
```components/ui/toast.tsx
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Viewport ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
  variants: {
    variant: {
      default: "border bg-background text-foreground",
      destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>>(({
  className,
  variant,
  ...props
}, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({
    variant
  }), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Action ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className)} {...props} />);
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Close ref={ref} className={cn("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className)} toast-close="" {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>);
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
```
```components/ui/toaster.tsx
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
  const {
    toasts
  } = useToast();
  return <ToastProvider>
      {toasts.map(function ({
      id,
      title,
      description,
      action,
      ...props
    }) {
      return <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>;
    })}
      <ToastViewport />
    </ToastProvider>;
}
```
```components/ui/toggle-group.tsx
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default"
});
const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>>(({
  className,
  variant,
  size,
  children,
  ...props
}, ref) => <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{
    variant,
    size
  }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>>(({
  className,
  children,
  variant,
  size,
  ...props
}, ref) => {
  const context = React.useContext(ToggleGroupContext);
  return <ToggleGroupPrimitive.Item ref={ref} className={cn(toggleVariants({
    variant: context.variant || variant,
    size: context.size || size
  }), className)} {...props}>
      {children}
    </ToggleGroupPrimitive.Item>;
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
export { ToggleGroup, ToggleGroupItem };
```
```components/ui/toggle.tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const toggleVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground", {
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
    },
    size: {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>>(({
  className,
  variant,
  size,
  ...props
}, ref) => <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({
  variant,
  size,
  className
}))} {...props} />);
Toggle.displayName = TogglePrimitive.Root.displayName;
export { Toggle, toggleVariants };
```
```components/ui/tooltip.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({
  className,
  sideOffset = 4,
  ...props
}, ref) => <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```
```components/ui/use-toast.ts
import { useToast, toast } from "@/hooks/use-toast";
export { useToast, toast };
```
```constants/animations.css
/* Extracted Hero Section Animations */
@keyframes float {
  0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  33% { transform: translateY(-8px) translateX(8px) rotate(3deg); }
  66% { transform: translateY(-4px) translateX(-8px) rotate(-3deg); }
  100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
}
@keyframes pulse-subtle {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
}
@keyframes floatUp {
  0% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) scale(1); opacity: 0; }
}
.animate-float { animation: float 10s ease-in-out infinite alternate; }
.animate-pulse-subtle { animation: pulse-subtle 4s ease-in-out infinite; }
.animate-floatUp { animation: floatUp linear infinite; }
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #333; border-radius: 99px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #CCFF00; }

```
```constants/designTokens.ts
/**
 * Design Tokens for the Application
 * Defines the core visual language including spacing, typography, colors, radius, and animations.
 * Synchronized with index.css CSS variables and Tailwind config.
 */

// ============================================================================
// SPACING SYSTEM
// ============================================================================
export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '80px',
} as const

// ============================================================================
// BORDER RADIUS (Rounded Design System)
// ============================================================================
export const radius = {
  none: '0',
  sm: '0.75rem', // 12px - Small elements
  md: '1rem', // 16px - Buttons, inputs
  lg: '1.5rem', // 24px - Cards
  xl: '2rem', // 32px - Large modals
  '2xl': '2.5rem', // 40px - Extra large
  full: '9999px', // Pills, badges, circular
} as const

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  xs: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1rem',
    fontWeight: 400,
  },
  sm: {
    fontSize: '0.875rem', // 14px
    lineHeight: '1.25rem',
    fontWeight: 400,
  },
  base: {
    fontSize: '1rem', // 16px
    lineHeight: '1.5rem',
    fontWeight: 400,
  },
  lg: {
    fontSize: '1.125rem', // 18px
    lineHeight: '1.75rem',
    fontWeight: 500,
  },
  xl: {
    fontSize: '1.25rem', // 20px
    lineHeight: '1.75rem',
    fontWeight: 600,
  },
  '2xl': {
    fontSize: '1.5rem', // 24px
    lineHeight: '2rem',
    fontWeight: 700,
  },
  '3xl': {
    fontSize: '1.875rem', // 30px
    lineHeight: '2.25rem',
    fontWeight: 700,
  },
  '4xl': {
    fontSize: '2.25rem', // 36px
    lineHeight: '2.5rem',
    fontWeight: 800,
  },
  '5xl': {
    fontSize: '3rem', // 48px
    lineHeight: '1',
    fontWeight: 800,
  },
  '6xl': {
    fontSize: '3.75rem', // 60px
    lineHeight: '1',
    fontWeight: 800,
  },
  mono: {
    fontFamily:
      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  sans: {
    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
  },
  display: {
    fontFamily: "'Syne', system-ui, sans-serif",
  },
} as const

// ============================================================================
// ICON SIZES
// ============================================================================
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================
export const animations = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    ease: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
} as const

// ============================================================================
// COLOR SYSTEM (Synchronized with CSS variables)
// ============================================================================
export const colors = {
  // Primary Colors
  primary: '#BEF264', // Lime (Main accent)
  primarySoft: '#BEF264',
  primaryNeon: '#CCFF00',

  // Secondary Colors
  secondary: '#22D3EE', // Cyan
  accent: '#F97316', // Orange

  // Semantic Colors
  danger: '#EF4444', // Red
  success: '#22C55E', // Emerald
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue

  // Additional Accents
  emerald: '#6EE7B7',
  rose: '#FB7185',
  amber: '#FBBF24',
  purple: '#8B5CF6',

  // Background & Surfaces
  background: '#0A0A0A', // Main background
  surface: '#111111', // Card background
  surfaceElevated: '#141414', // Elevated elements

  // Borders & Overlays
  border: 'rgba(255, 255, 255, 0.1)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  borderMedium: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',

  // Glass Effect
  glass: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassStrong: 'rgba(255, 255, 255, 0.12)',

  // Text Colors
  foreground: '#FFFFFF',
  muted: 'rgba(255, 255, 255, 0.6)',
  subtle: 'rgba(255, 255, 255, 0.4)',
} as const

// ============================================================================
// SHADOWS & EFFECTS
// ============================================================================
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 30px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 50px rgba(0, 0, 0, 0.6)',
  '2xl': '0 25px 60px rgba(0, 0, 0, 0.8)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
  innerLg: 'inset 0 4px 16px rgba(0, 0, 0, 0.5)',
  glow: '0 0 30px rgba(190, 242, 100, 0.4)',
  glowLg: '0 0 50px rgba(190, 242, 100, 0.5)',
} as const

// ============================================================================
// BLUR VALUES
// ============================================================================
export const blur = {
  none: '0',
  sm: '4px',
  md: '12px',
  lg: '20px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
} as const

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const

// ============================================================================
// BREAKPOINTS (Match Tailwind config)
// ============================================================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================================================
// COMPONENT SPECIFIC TOKENS
// ============================================================================
export const components = {
  sidebar: {
    width: '280px',
    widthCollapsed: '80px',
  },
  header: {
    height: '64px',
  },
  card: {
    padding: {
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    },
    radius: radius.lg,
    borderWidth: '1px',
  },
  button: {
    padding: {
      sm: '8px 16px',
      md: '12px 24px',
      lg: '16px 32px',
    },
    radius: radius.md,
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
    },
  },
  input: {
    padding: '12px 16px',
    radius: radius.md,
    height: '44px',
  },
  badge: {
    padding: '4px 12px',
    radius: radius.full,
  },
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Spacing = keyof typeof spacing
export type Radius = keyof typeof radius
export type Typography = keyof typeof typography
export type IconSize = keyof typeof iconSizes
export type Color = keyof typeof colors
export type Shadow = keyof typeof shadows
export type Blur = keyof typeof blur
export type ZIndex = keyof typeof zIndex
export type Breakpoint = keyof typeof breakpoints

```
```constants/gridSystem.ts
/**
 * Grid System Configuration
 * Defines layout constants and utility classes for the 12-column responsive grid system.
 * Synchronized with Tailwind breakpoints and design tokens.
 */

// ============================================================================
// GRID CONFIGURATION
// ============================================================================
export const gridConfig = {
  columns: 12,
  gap: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
    wide: '40px'
  },
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    desktop: '1280px',
    wide: '1536px'
  },
  maxWidth: {
    mobile: '100%',
    tablet: '768px',
    desktop: '1280px',
    wide: '1536px'
  }
} as const;

// ============================================================================
// GRID AREAS (Named Grid Regions)
// ============================================================================
export const gridAreas = {
  hero: 'hero',
  stats: 'stats',
  charts: 'charts',
  tables: 'tables',
  sidebar: 'sidebar',
  main: 'main',
  header: 'header',
  footer: 'footer'
} as const;

// ============================================================================
// TAILWIND UTILITY CLASS COMPOSITIONS
// ============================================================================
export const gridLayouts = {
  // ===== MAIN DASHBOARD CONTAINER =====
  dashboard: [
    'grid',
    'grid-cols-1 md:grid-cols-2 xl:grid-cols-12',
    'gap-4 md:gap-6 xl:gap-8',
    'auto-rows-[minmax(0,auto)]',
    'p-4 md:p-6 xl:p-8'
  ].join(' '),

  // ===== STATS ROW (4 Cards Horizontal) =====
  statsRow: [
    'col-span-1 md:col-span-2 xl:col-span-12',
    'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
    'gap-4 md:gap-6'
  ].join(' '),

  // ===== SPLIT VIEW (Chart + Table or 2 Panels) =====
  splitView: [
    'col-span-1 md:col-span-2 xl:col-span-12',
    'grid grid-cols-1 xl:grid-cols-2',
    'gap-6 xl:gap-8'
  ].join(' '),

  // ===== 3-COLUMN LAYOUT =====
  threeColumn: [
    'col-span-1 md:col-span-2 xl:col-span-12',
    'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    'gap-4 md:gap-6'
  ].join(' '),

  // ===== FULL WIDTH CARD =====
  fullWidth: 'col-span-1 md:col-span-2 xl:col-span-12',

  // ===== HALF WIDTH CARD =====
  halfWidth: 'col-span-1 md:col-span-1 xl:col-span-6',

  // ===== 2/3 WIDTH CARD =====
  twoThirdsWidth: 'col-span-1 md:col-span-2 xl:col-span-8',

  // ===== 1/3 WIDTH CARD =====
  oneThirdWidth: 'col-span-1 md:col-span-2 xl:col-span-4',

  // ===== 3/4 WIDTH CARD =====
  threeQuartersWidth: 'col-span-1 md:col-span-2 xl:col-span-9',

  // ===== 1/4 WIDTH CARD =====
  oneQuarterWidth: 'col-span-1 md:col-span-2 xl:col-span-3',

  // ===== SIDEBAR + MAIN LAYOUT =====
  sidebarLayout: [
    'grid',
    'grid-cols-1 lg:grid-cols-[280px_1fr]',
    'gap-0',
    'min-h-screen'
  ].join(' '),

  // ===== MASONRY-LIKE GRID =====
  masonry: [
    'grid',
    'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    'gap-6',
    'auto-rows-min'
  ].join(' ')
} as const;

// ============================================================================
// RESPONSIVE GRID HELPERS
// ============================================================================
export const responsiveHelpers = {
  // Hide on specific breakpoints
  hideOnMobile: 'hidden md:block',
  hideOnTablet: 'md:hidden xl:block',
  hideOnDesktop: 'xl:hidden',
  
  // Show only on specific breakpoints
  showOnMobile: 'block md:hidden',
  showOnTablet: 'hidden md:block xl:hidden',
  showOnDesktop: 'hidden xl:block',
  
  // Responsive flex directions
  flexColMobile: 'flex flex-col md:flex-row',
  flexRowMobile: 'flex flex-row md:flex-col',
  
  // Responsive text alignment
  textCenterMobile: 'text-center md:text-left',
  textLeftMobile: 'text-left md:text-center',
  
  // Responsive padding
  responsivePadding: 'p-4 md:p-6 xl:p-8',
  responsivePaddingX: 'px-4 md:px-6 xl:px-8',
  responsivePaddingY: 'py-4 md:py-6 xl:py-8',
  
  // Responsive gap
  responsiveGap: 'gap-4 md:gap-6 xl:gap-8'
} as const;

// ============================================================================
// CARD GRID VARIANTS
// ============================================================================
export const cardGrids = {
  // 2x2 Stats Grid
  stats2x2: [
    'grid',
    'grid-cols-1 md:grid-cols-2',
    'gap-4 md:gap-6',
    'auto-rows-fr'
  ].join(' '),
  
  // 4 Cards Horizontal
  stats4Horizontal: [
    'grid',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    'gap-4 md:gap-6'
  ].join(' '),
  
  // 3 Cards + 1 Wide
  asymmetric3Plus1: [
    'grid',
    'grid-cols-1 md:grid-cols-3',
    'gap-4 md:gap-6',
    '[&>*:last-child]:md:col-span-3'
  ].join(' '),
  
  // Featured + Grid (1 large + 4 small)
  featuredGrid: [
    'grid',
    'grid-cols-1 lg:grid-cols-12',
    'gap-4 md:gap-6',
    '[&>*:first-child]:lg:col-span-8',
    '[&>*:nth-child(n+2)]:lg:col-span-4'
  ].join(' ')
} as const;

// ============================================================================
// CONTAINER UTILITIES
// ============================================================================
export const containers = {
  // Max width centered container
  centered: [
    'mx-auto',
    'w-full',
    'max-w-[1536px]',
    'px-4 md:px-6 xl:px-8'
  ].join(' '),
  
  // Narrow content container
  narrow: [
    'mx-auto',
    'w-full',
    'max-w-4xl',
    'px-4 md:px-6'
  ].join(' '),
  
  // Wide content container
  wide: [
    'mx-auto',
    'w-full',
    'max-w-7xl',
    'px-4 md:px-6 xl:px-8'
  ].join(' '),
  
  // Full bleed (no padding)
  fullBleed: 'w-full'
} as const;

// ============================================================================
// FLEX LAYOUTS
// ============================================================================
export const flexLayouts = {
  // Horizontal stack with gap
  hStack: 'flex flex-row items-center gap-4',
  hStackSm: 'flex flex-row items-center gap-2',
  hStackLg: 'flex flex-row items-center gap-6',
  
  // Vertical stack with gap
  vStack: 'flex flex-col gap-4',
  vStackSm: 'flex flex-col gap-2',
  vStackLg: 'flex flex-col gap-6',
  
  // Space between
  spaceBetween: 'flex flex-row items-center justify-between',
  
  // Centered
  centered: 'flex items-center justify-center',
  
  // Wrap
  wrap: 'flex flex-wrap gap-4',
  
  // Responsive flex
  responsiveFlex: 'flex flex-col md:flex-row gap-4 md:gap-6'
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type GridLayout = keyof typeof gridLayouts;
export type CardGrid = keyof typeof cardGrids;
export type Container = keyof typeof containers;
export type FlexLayout = keyof typeof flexLayouts;
export type ResponsiveHelper = keyof typeof responsiveHelpers;
```
```contexts/sidebarContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);
export const SidebarProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(prev => !prev);
  const closeSidebar = () => setIsOpen(false);
  return <SidebarContext.Provider value={{
    isOpen,
    toggleSidebar,
    closeSidebar
  }}>
      {children}
    </SidebarContext.Provider>;
};
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
};
```
```contexts/themeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider = ({
  children
}: {
  children: ReactNode;
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  return <ThemeContext.Provider value={{
    theme,
    toggleTheme
  }}>
      {children}
    </ThemeContext.Provider>;
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```
```hooks/use-mobile.tsx
import * as React from "react";
const MOBILE_BREAKPOINT = 768;
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
```
```hooks/use-toast.ts
import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
} as const;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
type ActionType = typeof actionTypes;
type Action = {
  type: ActionType["ADD_TOAST"];
  toast: ToasterToast;
} | {
  type: ActionType["UPDATE_TOAST"];
  toast: Partial<ToasterToast>;
} | {
  type: ActionType["DISMISS_TOAST"];
  toastId?: ToasterToast["id"];
} | {
  type: ActionType["REMOVE_TOAST"];
  toastId?: ToasterToast["id"];
};
interface State {
  toasts: ToasterToast[];
}
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(t => t.id === action.toast.id ? {
          ...t,
          ...action.toast
        } : t)
      };
    case "DISMISS_TOAST":
      {
        const {
          toastId
        } = action;

        // ! Side effects ! - This could be extracted into a dismissToast() action,
        // but I'll keep it here for simplicity
        if (toastId) {
          addToRemoveQueue(toastId);
        } else {
          state.toasts.forEach(toast => {
            addToRemoveQueue(toast.id);
          });
        }
        return {
          ...state,
          toasts: state.toasts.map(t => t.id === toastId || toastId === undefined ? {
            ...t,
            open: false
          } : t)
        };
      }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId)
      };
  }
};
const listeners: Array<(state: State) => void> = [];
let memoryState: State = {
  toasts: []
};
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
}
type Toast = Omit<ToasterToast, "id">;
function toast({
  ...props
}: Toast) {
  const id = genId();
  const update = (props: ToasterToast) => dispatch({
    type: "UPDATE_TOAST",
    toast: {
      ...props,
      id
    }
  });
  const dismiss = () => dispatch({
    type: "DISMISS_TOAST",
    toastId: id
  });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: open => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id: id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({
      type: "DISMISS_TOAST",
      toastId
    })
  };
}
export { useToast, toast };
```
```hooks/useCounter.ts
import { useState, useEffect } from 'react';
export const useCounter = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(start + (end - start) * ease));
      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);
  return count;
};
```
```hooks/useMatchData.ts
import { useState, useEffect } from 'react';
import { BTTSData, LeagueTeam } from '../types/matches';
export const useMatchData = () => {
  const [loading, setLoading] = useState(true);
  const bttsData: BTTSData[] = Array.from({
    length: 30
  }, (_, i) => ({
    round: i + 1,
    bttsCount: Math.min(Math.floor(Math.random() * 9), 8)
  }));
  const leagueTable: LeagueTeam[] = [{
    position: 1,
    name: 'Liverpool',
    wins: 8,
    draws: 0,
    losses: 0,
    points: 24,
    form: ['W', 'W', 'W', 'W', 'W']
  }, {
    position: 2,
    name: 'Man City',
    wins: 5,
    draws: 1,
    losses: 2,
    points: 16,
    form: ['W', 'L', 'W', 'D', 'W']
  }, {
    position: 3,
    name: 'Arsenal',
    wins: 4,
    draws: 3,
    losses: 1,
    points: 15,
    form: ['D', 'W', 'D', 'W', 'L']
  }, {
    position: 4,
    name: 'Leicester',
    wins: 4,
    draws: 2,
    losses: 2,
    points: 14,
    form: ['L', 'W', 'W', 'L', 'D']
  }, {
    position: 5,
    name: 'Chelsea',
    wins: 4,
    draws: 2,
    losses: 2,
    points: 14,
    form: ['W', 'W', 'L', 'D', 'W']
  }, {
    position: 6,
    name: 'C. Palace',
    wins: 4,
    draws: 2,
    losses: 2,
    points: 14,
    form: ['D', 'L', 'W', 'W', 'L']
  }, {
    position: 7,
    name: 'Burnley',
    wins: 3,
    draws: 3,
    losses: 2,
    points: 12,
    form: ['L', 'D', 'D', 'W', 'W']
  }, {
    position: 8,
    name: 'West Ham',
    wins: 3,
    draws: 2,
    losses: 3,
    points: 11,
    form: ['W', 'L', 'L', 'D', 'W']
  }];
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  return {
    loading,
    bttsData,
    leagueTable
  };
};
```
```hooks/useStatMetrics.ts
export interface StatMetrics {
  current: string;
  average: string;
  lastMatch: string;
  trend: string;
  insight: string;
}
export const useStatMetrics = (title: string, value: string | number): StatMetrics => {
  const metricsMap: Record<string, StatMetrics> = {
    'Possession': {
      current: '64%',
      average: '58%',
      lastMatch: '61%',
      trend: '+6% vs season avg',
      insight: 'Team is controlling the game effectively with strong midfield presence'
    },
    'Expected Goals (xG)': {
      current: '2.42',
      average: '1.85',
      lastMatch: '1.98',
      trend: '+0.57 above average',
      insight: 'Creating high-quality scoring opportunities, especially from inside the box'
    },
    'Pass Accuracy': {
      current: '91%',
      average: '87%',
      lastMatch: '89%',
      trend: '+4% improvement',
      insight: 'Exceptional ball retention and progressive passing in the final third'
    },
    'Total Shots': {
      current: '18',
      average: '14',
      lastMatch: '16',
      trend: '+4 shots above avg',
      insight: 'Aggressive attacking play with sustained pressure on opposition defense'
    }
  };
  return metricsMap[title] || {
    current: value.toString(),
    average: 'N/A',
    lastMatch: 'N/A',
    trend: 'N/A',
    insight: 'No additional data available'
  };
};
```
```index.css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@tailwind base;
@tailwind components;
@tailwind utilities;
/* -------------------------------------------------------------------------- */
/* DESIGN TOKENS & VARIABLES (Tailwind + Custom Unified) */
/* -------------------------------------------------------------------------- */
@layer base {
  :root {
    /* ===== TAILWIND DESIGN TOKENS ===== */
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 7%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 7%;
    --popover-foreground: 0 0% 98%;
    --primary: 84 81% 44%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 63%;
    --accent: 0 0% 14%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14%;
    --input: 0 0% 14%;
    --ring: 84 81% 44%;
    /* ===== LEKEREKÍTÉSEK ===== */
    --radius: 1.25rem;
    --radius-sm: 0.75rem;
    --radius-md: 1rem;
    --radius-lg: 1.5rem;
    --radius-xl: 2rem;
    --radius-full: 9999px;
    /* ===== WINMIX CUSTOM COLORS ===== */
    --color-bg: #0A0A0A;
    --color-surface: #111111;
    --color-surface-elevated: #141414;
    --color-lime-neon: #CCFF00;
    --color-lime-soft: #BEF264;
    --color-lime: #BEF264;
    --color-emerald: #6EE7B7;
    --color-rose: #FB7185;
    --color-amber: #FBBF24;
    --color-success: #22c55e;
    --color-danger: #ef4444;
    --color-warning: #f59e0b;
    --color-info: #3b82f6;
    /* ===== GLASS & EFFECTS ===== */
    --blur-glass: 24px;
    --border-subtle: rgba(255, 255, 255, 0.06);
    --border-medium: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.18);
    --border-glow: rgba(190, 242, 100, 0.35);
    /* ===== TRANSITIONS ===== */
    --transition-fast: 150ms;
    --transition-base: 250ms;
    --transition-slow: 350ms;
    --easing: cubic-bezier(0.4, 0, 0.2, 1);
    --easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  * {
    @apply border-border;
  }
  html, body { 
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    @apply bg-background text-foreground;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum', 'rlig' 1, 'calt' 1;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }
  /* Typography — Syne for headings, Outfit for body, JetBrains Mono for data */
  h1, h2, h3, h4, h5, h6 { 
    font-family: 'Syne', system-ui, sans-serif; 
    text-wrap: balance;
    letter-spacing: -0.02em;
  }
  p, div, span { text-wrap: pretty; }
  .font-mono { font-family: 'JetBrains Mono', monospace; }
  /* Selection styling */
  ::selection {
    background: rgba(190, 242, 100, 0.25);
    color: #BEF264;
  }
}
/* -------------------------------------------------------------------------- */
/* CUSTOM SCROLLBAR (Lekerekített) */
/* -------------------------------------------------------------------------- */
::-webkit-scrollbar { 
  width: 10px; 
  height: 10px; 
}
::-webkit-scrollbar-track { 
  background: transparent; 
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb { 
  background: rgba(255,255,255,0.12); 
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background 0.2s;
}
::-webkit-scrollbar-thumb:hover { 
  background: rgba(255,255,255,0.25);
  background-clip: padding-box;
}
/* -------------------------------------------------------------------------- */
/* FOCUS ACCESSIBILITY (Lekerekített) */
/* -------------------------------------------------------------------------- */
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 3px;
  border-radius: var(--radius-md);
}
/* -------------------------------------------------------------------------- */
/* GLASSMORPHISM SYSTEM - TELJESEN LEKEREKÍTETT VERZIÓ */
/* -------------------------------------------------------------------------- */
@layer components {
  /* ===== BASE GLASS CARD ===== */
  .glass-card {
    @apply relative overflow-hidden;
    background: linear-gradient(135deg, rgba(17,17,17,0.95) 0%, rgba(10,10,10,0.98) 100%);
    backdrop-filter: blur(var(--blur-glass));
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 20px 50px rgba(0,0,0,0.8),
      0 0 0 1px rgba(255,255,255,0.03);
    transition: all var(--transition-slow) var(--easing);
    transform-style: preserve-3d;
  }
  .glass-card:hover {
    transform: translateY(-6px) scale(1.015);
    border-color: rgba(190, 242, 100, 0.3);
    box-shadow: 
      inset 0 1px 0 rgba(255,255,255,0.15),
      0 0 60px rgba(190, 242, 100, 0.15),
      0 30px 60px rgba(0,0,0,0.7),
      0 0 0 1px rgba(190, 242, 100, 0.08);
  }
  /* ===== AI CARD VARIANT ===== */
  .glass-card-ai {
    @apply relative overflow-hidden;
    background: linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(190,242,100,0.08) 50%, rgba(10,10,10,0.95) 100%);
    backdrop-filter: blur(var(--blur-glass));
    border: 1px solid rgba(190, 242, 100, 0.2);
    border-radius: var(--radius-xl);
    transition: all var(--transition-slow) var(--easing);
  }
  .glass-card-ai:hover {
    transform: translate3d(0, -4px, 0) scale(1.01);
    box-shadow: 
      0 0 60px rgba(139,92,246,0.25), 
      inset 0 0 30px rgba(190,242,100,0.08);
  }
  /* ===== STAT CARD (Dashboard Metrics) ===== */
  .stat-card {
    @apply glass-card p-6 transition-all duration-300;
    border-radius: var(--radius-lg);
  }
  .stat-card:hover {
    @apply border-primary/40;
    box-shadow: 0 0 30px rgba(190, 242, 100, 0.15);
  }
  /* ===== CHART CONTAINER ===== */
  .chart-container {
    @apply glass-card p-6;
    border-radius: var(--radius-lg);
  }
  /* ===== SIDEBAR MENU ITEMS ===== */
  .menu-item {
    @apply px-4 py-3 transition-all duration-200;
    border-radius: var(--radius-md);
    @apply hover:bg-white/[0.08] hover:shadow-lg;
  }
  .menu-item-active {
    @apply bg-gradient-to-r from-primary/25 to-primary/10;
    border-radius: var(--radius-md);
    border-left: 4px solid hsl(var(--primary));
    box-shadow: 0 0 20px rgba(190, 242, 100, 0.2);
  }
  /* ===== BUTTONS ===== */
  .btn-glass {
    @apply px-6 py-3 font-medium;
    @apply bg-white/[0.08] backdrop-blur-xl;
    @apply border border-white/[0.15];
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    @apply transition-all duration-300;
    @apply hover:bg-white/[0.15] hover:border-white/[0.25];
    @apply hover:shadow-xl hover:scale-[1.02];
  }
  .btn-primary {
    @apply px-6 py-3 font-semibold;
    @apply bg-primary text-primary-foreground;
    border-radius: var(--radius-md);
    box-shadow: 0 0 25px rgba(190, 242, 100, 0.4);
    @apply transition-all duration-300;
    @apply hover:shadow-[0_0_40px_rgba(190,242,100,0.6)];
    @apply hover:scale-[1.03];
  }
  .btn-secondary {
    @apply px-6 py-3 font-medium;
    @apply bg-secondary text-secondary-foreground;
    @apply border border-white/10;
    border-radius: var(--radius-md);
    @apply transition-all duration-300;
    @apply hover:bg-white/10 hover:border-white/20;
  }
  /* ===== INPUT FIELDS ===== */
  .input-glass {
    @apply px-4 py-3;
    @apply bg-white/5 backdrop-blur-xl;
    @apply border border-white/15;
    border-radius: var(--radius-md);
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
    @apply transition-all duration-200;
    @apply focus:border-primary/60 focus:ring-2 focus:ring-primary/30;
    @apply focus:bg-white/[0.08];
  }
  /* ===== SEARCH BAR ===== */
  .search-input {
    @apply input-glass;
    border-radius: var(--radius-full);
    @apply pl-12 pr-4;
  }
  /* ===== BADGES & PILLS ===== */
  .badge {
    @apply inline-flex items-center px-3 py-1 text-xs font-semibold;
    border-radius: var(--radius-full);
    @apply bg-white/10 border border-white/20;
  }
  .badge-primary {
    @apply badge;
    @apply bg-primary/20 border-primary/40 text-primary;
  }
  .badge-success {
    @apply badge;
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.4);
    color: #22c55e;
  }
  .badge-danger {
    @apply badge;
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }
  /* ===== PROGRESS RINGS ===== */
  .progress-ring {
    @apply p-1;
    border-radius: var(--radius-full);
    @apply bg-gradient-to-br from-white/15 to-transparent;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
  }
  /* ===== LEADERBOARD ITEMS ===== */
  .leaderboard-item {
    @apply p-4;
    @apply bg-gradient-to-r from-white/[0.08] to-transparent;
    @apply border border-white/10;
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    @apply backdrop-blur-sm;
    @apply transition-all duration-300;
    @apply hover:from-white/[0.15] hover:border-white/20;
    @apply hover:shadow-xl hover:scale-[1.02];
  }
  /* ===== LIVE PULSE BADGE ===== */
  .live-pulse {
    @apply inline-flex items-center gap-2 px-3 py-1.5;
    border-radius: var(--radius-full);
    @apply bg-primary/15 border border-primary/40;
    @apply text-xs font-bold uppercase tracking-wider;
    color: var(--color-lime-soft);
  }
  .live-pulse::before {
    content: '';
    @apply w-2 h-2;
    border-radius: var(--radius-full);
    background: var(--color-lime-soft);
    box-shadow: 0 0 12px var(--color-lime-soft);
    animation: pulse-fast 1.5s infinite;
  }
  /* ===== DROPDOWN MENU ===== */
  .dropdown-menu {
    @apply bg-card backdrop-blur-xl;
    @apply border border-white/15;
    border-radius: var(--radius-lg);
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
    @apply p-2;
  }
  .dropdown-item {
    @apply px-4 py-2.5;
    border-radius: var(--radius-md);
    @apply transition-all duration-150;
    @apply hover:bg-white/10;
  }
  /* ===== MODAL / DIALOG ===== */
  .modal-overlay {
    @apply fixed inset-0 z-50;
    @apply bg-black/80 backdrop-blur-sm;
  }
  .modal-content {
    @apply bg-card;
    @apply border border-white/15;
    border-radius: var(--radius-xl);
    box-shadow: 0 25px 60px rgba(0,0,0,0.9);
    @apply backdrop-blur-2xl;
  }
  /* ===== TABS ===== */
  .tab-button {
    @apply px-4 py-2.5 font-medium;
    border-radius: var(--radius-md);
    @apply transition-all duration-200;
    @apply hover:bg-white/8;
  }
  .tab-button-active {
    @apply bg-primary/20 text-primary;
    border-radius: var(--radius-md);
    box-shadow: 0 0 15px rgba(190, 242, 100, 0.3);
  }
  /* ===== TOOLTIP ===== */
  .tooltip {
    @apply bg-card text-foreground;
    @apply border border-white/20;
    border-radius: var(--radius-md);
    @apply px-3 py-2 text-sm;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
  }
  /* ===== SECTION HEADER (Editorial Typography) ===== */
  .section-header {
    font-family: 'Syne', system-ui, sans-serif;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
}
/* -------------------------------------------------------------------------- */
/* NOISE TEXTURE OVERLAY */
/* -------------------------------------------------------------------------- */
.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.02 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  mix-blend-mode: soft-light;
  z-index: 1;
}
/* -------------------------------------------------------------------------- */
/* DATA VISUALIZATION */
/* -------------------------------------------------------------------------- */
.btts-chart .grid-line { 
  stroke: #1F1F1F; 
  stroke-width: 0.5; 
  stroke-dasharray: 2, 4; 
}
.btts-chart .data-line {
  fill: none;
  stroke: var(--color-lime-soft);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 10px rgba(190, 242, 100, 0.5));
}
.btts-chart .data-point {
  fill: var(--color-bg);
  stroke: var(--color-lime-soft);
  stroke-width: 2.5;
  transition: all 0.2s var(--easing);
  cursor: pointer;
}
.btts-chart .data-point:hover { 
  transform: scale(1.4); 
  fill: var(--color-lime-soft); 
  stroke: white;
  filter: drop-shadow(0 0 8px var(--color-lime-soft));
}
/* Circular Progress (Lekerekített) */
.circle-bg { 
  fill: none; 
  stroke: #1F1F1F; 
  stroke-width: 3.5;
  stroke-linecap: round;
}
.circle {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  filter: drop-shadow(0 0 10px rgba(190, 242, 100, 0.5));
  animation: dash 1.2s var(--easing) forwards;
}
/* -------------------------------------------------------------------------- */
/* ANIMATIONS */
/* -------------------------------------------------------------------------- */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  30%, 100% { transform: translateX(120%); }
}
@keyframes pulse-fast {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.6; 
    transform: scale(1.2); 
  }
}
@keyframes float-glow {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(0, -10px); }
}
@keyframes highlight-flash {
  0% { background-color: rgba(190, 242, 100, 0.25); }
  100% { background-color: transparent; }
}
@keyframes dash {
  to { stroke-dashoffset: 0; }
}
/* ===== NEW CINEMATIC ANIMATIONS ===== */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.04; transform: scale(1); }
  50% { opacity: 0.08; transform: scale(1.1); }
}
@keyframes float-subtle {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes border-glow {
  0%, 100% { border-color: rgba(190, 242, 100, 0.1); }
  50% { border-color: rgba(190, 242, 100, 0.25); }
}
@keyframes reveal-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes text-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes orbit {
  from { transform: rotate(0deg) translateX(var(--orbit-radius, 120px)) rotate(0deg); }
  to { transform: rotate(360deg) translateX(var(--orbit-radius, 120px)) rotate(-360deg); }
}
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  50% { transform: scale(1); opacity: 0.3; }
  100% { transform: scale(1.2); opacity: 0; }
}
.shimmer-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.12) 40%, transparent 80%);
  transform: translateX(-100%);
  animation: shimmer 4s infinite linear;
  pointer-events: none;
}
/* -------------------------------------------------------------------------- */
/* UTILITY CLASSES */
/* -------------------------------------------------------------------------- */
@layer utilities {
  /* ===== TEXT EFFECTS ===== */
  .text-shadow {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
  }
  .text-glow {
    text-shadow: 0 0 25px rgba(190, 242, 100, 0.7);
  }
  .text-glow-strong {
    text-shadow: 0 0 40px rgba(190, 242, 100, 0.5), 0 0 80px rgba(190, 242, 100, 0.2);
  }
  /* ===== FONT FAMILIES ===== */
  .font-display {
    font-family: 'Syne', system-ui, sans-serif;
    letter-spacing: -0.02em;
  }
  .font-body {
    font-family: 'Outfit', system-ui, sans-serif;
  }
  /* ===== GRADIENT TEXT ===== */
  .text-gradient-lime {
    background: linear-gradient(135deg, #BEF264, #CCFF00, #6EE7B7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-gradient-premium {
    background: linear-gradient(135deg, #ffffff 0%, #BEF264 40%, #CCFF00 60%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .text-shimmer {
    background: linear-gradient(90deg, #BEF264 0%, #CCFF00 25%, #fff 50%, #CCFF00 75%, #BEF264 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: text-shimmer 3s linear infinite;
  }
  /* ===== BOX EFFECTS ===== */
  .glow-primary {
    box-shadow: 0 0 35px rgba(190, 242, 100, 0.4);
  }
  .glow-primary-lg {
    box-shadow: 0 0 60px rgba(190, 242, 100, 0.3), 0 0 120px rgba(190, 242, 100, 0.1);
  }
  .inner-shadow {
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
  }
  .inner-shadow-lg {
    box-shadow: inset 0 4px 16px rgba(0, 0, 0, 0.5);
  }
  /* ===== ANIMATION UTILITIES ===== */
  .animate-gradient-shift {
    animation: gradient-shift 8s ease infinite;
    background-size: 200% 200%;
  }
  .animate-glow-pulse {
    animation: glow-pulse 6s ease-in-out infinite;
  }
  .animate-float-subtle {
    animation: float-subtle 6s ease-in-out infinite;
  }
  .animate-border-glow {
    animation: border-glow 3s ease-in-out infinite;
  }
  .animate-reveal-up {
    animation: reveal-up 0.6s ease-out forwards;
    opacity: 0;
  }
  .animate-orbit {
    animation: orbit 20s linear infinite;
  }
  .animate-pulse-ring {
    animation: pulse-ring 2s ease-out infinite;
  }
  /* ===== STAGGER DELAYS ===== */
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
  .stagger-5 { animation-delay: 0.5s; }
  .stagger-6 { animation-delay: 0.6s; }
  .stagger-7 { animation-delay: 0.7s; }
  .stagger-8 { animation-delay: 0.8s; }
  /* ===== GRADIENT MESH BACKGROUNDS ===== */
  .gradient-mesh {
    background: 
      radial-gradient(at 20% 80%, rgba(190, 242, 100, 0.06) 0%, transparent 50%),
      radial-gradient(at 80% 20%, rgba(110, 231, 183, 0.04) 0%, transparent 50%),
      radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  }
  .gradient-mesh-animated {
    background: 
      radial-gradient(at 20% 80%, rgba(190, 242, 100, 0.06) 0%, transparent 50%),
      radial-gradient(at 80% 20%, rgba(110, 231, 183, 0.04) 0%, transparent 50%),
      radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
    animation: gradient-shift 15s ease infinite;
    background-size: 200% 200%;
  }
  .gradient-mesh-hero {
    background: 
      radial-gradient(ellipse at 10% 90%, rgba(190, 242, 100, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 90% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 70% 80%, rgba(251, 113, 133, 0.03) 0%, transparent 40%);
    animation: gradient-shift 20s ease infinite;
    background-size: 200% 200%;
  }
  /* ===== ROUNDED UTILITIES ===== */
  .rounded-card { border-radius: var(--radius-lg); }
  .rounded-button { border-radius: var(--radius-md); }
  .rounded-pill { border-radius: var(--radius-full); }
  /* ===== CINEMATIC DEPTH ===== */
  .depth-1 {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
  }
  .depth-2 {
    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2);
  }
  .depth-3 {
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3);
  }
  .depth-4 {
    box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
  }
}
/* -------------------------------------------------------------------------- */
/* RESPONSIVE & MOBILE */
/* -------------------------------------------------------------------------- */
@media (max-width: 1024px) {
  .glass-card:hover, 
  .glass-card-ai:hover { 
    transform: none;
  }
}
@media (max-width: 768px) {
  :root {
    --radius: 1rem;
    --radius-lg: 1.25rem;
    --radius-xl: 1.5rem;
  }
  body { 
    padding-bottom: 80px; 
  }
  .touch-target { 
    @apply min-w-[44px] min-h-[44px] flex items-center justify-center; 
  }
  .stat-card {
    @apply p-4;
  }
  .chart-container {
    @apply p-4;
  }
}

```
```index.html

<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="WinMix - Advanced Sports Analytics & Predictions Dashboard" />
    <meta name="theme-color" content="#0A0A0A" />
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="WinMix Dashboard" />
    <meta property="og:description" content="Advanced Sports Analytics Platform" />
    
    <!-- Preload Critical Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
    
    <title>WinMix Dashboard - Sports Analytics</title>
    
    <!-- Prevent FOUC (Flash of Unstyled Content) -->
    <style>
      #root {
        min-height: 100vh;
        background: #0A0A0A;
      }
      
      /* Loading State */
      .app-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #0A0A0A;
      }
      
      .app-loading-spinner {
        width: 48px;
        height: 48px;
        border: 3px solid rgba(190, 242, 100, 0.1);
        border-top-color: #BEF264;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <!-- App Root -->
    <div id="root">
      <!-- Loading Spinner (shown until React loads) -->
      <div class="app-loading">
        <div class="app-loading-spinner"></div>
      </div>
    </div>
    
    <!-- React Entry Point - CRITICAL: Must point to /src/main.tsx -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```
```index.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById('root')!).render(<StrictMode>
    <App />
  </StrictMode>);
```
```index.tsxx

```
```lib/utils.spec.ts
import { describe, it, expect } from "vitest";
import { cn } from "./utils";
describe("cn function", () => {
  it("should merge classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });
  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base-class", isActive && "active-class")).toBe("base-class active-class");
  });
  it("should handle false and null conditions", () => {
    const isActive = false;
    expect(cn("base-class", isActive && "active-class", null)).toBe("base-class");
  });
  it("should merge tailwind classes properly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
  it("should work with object notation", () => {
    expect(cn("base", {
      conditional: true,
      "not-included": false
    })).toBe("base conditional");
  });
});
```
```lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
```main.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById('root')!).render(<StrictMode>
    <App />
  </StrictMode>);
```
```package.json
{
  "name": "winmix-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "WinMix Dashboard Application",
  "author": "WinMix Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite --host",
    "build": "tsc && vite build",
    "build:client": "tsc && vite build",
    "preview": "vite preview --host",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "clean": "rm -rf dist node_modules",
    "reinstall": "npm run clean && npm install"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "lucide-react": "^0.539.0",
    "@headlessui/react": "^2.2.9",
    "@heroicons/react": "^2.2.0",
    "framer-motion": "^11.11.17",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.0",
    "embla-carousel-react": "^8.5.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "date-fns": "^4.1.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@typescript-eslint/eslint-plugin": "^8.18.2",
    "@typescript-eslint/parser": "^8.18.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "@headlessui/tailwindcss": "^0.2.1",
    "eslint": "^9.18.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "prettier": "^3.4.2",
    "prettier-plugin-tailwindcss": "^0.6.9"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```
```pages/admin/AdminDashboard.tsx
import React from 'react';
import { Activity, Server, Database, Cpu } from 'lucide-react';
const AdminDashboard = () => {
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">System overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-k-lime" />
            </div>
            <h3 className="text-sm font-bold text-white">System Status</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">Operational</div>
          <div className="text-xs text-gray-400">All systems running</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-white">Active Services</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">24</div>
          <div className="text-xs text-gray-400">Running smoothly</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-sm font-bold text-white">Database</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">Connected</div>
          <div className="text-xs text-gray-400">Response: 12ms</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-sm font-bold text-white">CPU Usage</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">42%</div>
          <div className="text-xs text-gray-400">Normal load</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-k-borderLight">
            <span className="text-sm text-gray-300">System backup completed</span>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-k-borderLight">
            <span className="text-sm text-gray-300">ML model updated</span>
            <span className="text-xs text-gray-500">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-300">Prediction batch processed</span>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>;
};
export default AdminDashboard;
```
```pages/admin/AdminFeedback.tsx
import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
const AdminFeedback = () => {
  const feedbackItems = [{
    id: 1,
    user: 'User#1247',
    match: 'Liverpool vs Real Madrid',
    prediction: 'Home Win (78%)',
    feedback: 'positive',
    comment: 'Accurate prediction, great confidence level!',
    date: '2 hours ago'
  }, {
    id: 2,
    user: 'User#0892',
    match: 'Man City vs Arsenal',
    prediction: 'Draw (65%)',
    feedback: 'negative',
    comment: 'Prediction was incorrect, need better model.',
    date: '5 hours ago'
  }, {
    id: 3,
    user: 'User#2156',
    match: 'Chelsea vs Leicester',
    prediction: 'Home Win (82%)',
    feedback: 'positive',
    comment: 'High confidence and correct outcome!',
    date: '1 day ago'
  }, {
    id: 4,
    user: 'User#3421',
    match: 'West Ham vs Burnley',
    prediction: 'Home Win (71%)',
    feedback: 'neutral',
    comment: 'Close call, could improve confidence calculation.',
    date: '1 day ago'
  }];
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Prediction Feedback</h1>
          <p className="text-gray-400">User feedback and prediction reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-5 h-5 text-k-lime" />
            <h3 className="text-sm font-bold text-white">Avg Rating</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">4.2/5</div>
          <div className="text-xs text-gray-400">From 847 reviews</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-white">Positive</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-500 mb-1">672</div>
          <div className="text-xs text-gray-400">79.3%</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <ThumbsDown className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-white">Negative</h3>
          </div>
          <div className="text-3xl font-bold text-red-500 mb-1">124</div>
          <div className="text-xs text-gray-400">14.6%</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold text-white">Neutral</h3>
          </div>
          <div className="text-3xl font-bold text-gray-400 mb-1">51</div>
          <div className="text-xs text-gray-400">6.1%</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Feedback</h3>
        <div className="space-y-3">
          {feedbackItems.map(item => <div key={item.id} className="p-4 bg-k-surfaceHighlight rounded-xl border border-k-borderLight hover:border-k-lime/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-sm font-bold text-white">{item.match}</div>
                  <div className="text-xs text-gray-400">{item.prediction}</div>
                </div>
                <div className="flex items-center gap-2">
                  {item.feedback === 'positive' && <ThumbsUp className="w-4 h-4 text-emerald-500" />}
                  {item.feedback === 'negative' && <ThumbsDown className="w-4 h-4 text-red-500" />}
                  {item.feedback === 'neutral' && <MessageSquare className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{item.comment}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{item.user}</span>
                <span>{item.date}</span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default AdminFeedback;
```
```pages/admin/AdminHealth.tsx
import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Server, Database, Wifi } from 'lucide-react';
const AdminHealth = () => {
  const healthChecks = [{
    name: 'API Gateway',
    status: 'healthy',
    latency: '45ms',
    icon: Server,
    color: 'emerald'
  }, {
    name: 'Database Cluster',
    status: 'healthy',
    latency: '12ms',
    icon: Database,
    color: 'emerald'
  }, {
    name: 'ML Inference Service',
    status: 'healthy',
    latency: '89ms',
    icon: Wifi,
    color: 'emerald'
  }, {
    name: 'Cache Layer',
    status: 'warning',
    latency: '156ms',
    icon: Server,
    color: 'warning'
  }];
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Health & Monitoring</h1>
          <p className="text-gray-400">Real-time system health checks</p>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">System Health Overview</h3>
          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
            All Systems Operational
          </span>
        </div>

        <div className="space-y-4">
          {healthChecks.map((check, index) => {
          const Icon = check.icon;
          const isHealthy = check.status === 'healthy';
          const statusColor = isHealthy ? 'emerald' : 'warning';
          return <div key={index} className="flex items-center justify-between p-4 bg-k-surfaceHighlight rounded-xl border border-k-borderLight">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${statusColor}-500/10 border border-${statusColor}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${statusColor}-500`} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{check.name}</div>
                    <div className="text-xs text-gray-400">Latency: {check.latency}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isHealthy ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                  <span className={`text-sm font-bold text-${statusColor}-500 capitalize`}>
                    {check.status}
                  </span>
                </div>
              </div>;
        })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Uptime (30d)</h3>
          <div className="text-3xl font-bold text-k-lime mb-1">99.98%</div>
          <div className="text-xs text-gray-400">Target: 99.90%</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Avg Response Time</h3>
          <div className="text-3xl font-bold text-white mb-1">76ms</div>
          <div className="text-xs text-gray-400">Target: &lt;100ms</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-3">Error Rate</h3>
          <div className="text-3xl font-bold text-white mb-1">0.02%</div>
          <div className="text-xs text-gray-400">Target: &lt;0.1%</div>
        </div>
      </div>
    </div>;
};
export default AdminHealth;
```
```pages/admin/AdminJobs.tsx
import React from 'react';
import { Clock, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
const AdminJobs = () => {
  const jobs = [{
    name: 'Daily Predictions Update',
    schedule: 'Every day at 06:00',
    status: 'completed',
    lastRun: '2 hours ago',
    duration: '3m 24s'
  }, {
    name: 'ML Model Retraining',
    schedule: 'Every Sunday at 02:00',
    status: 'scheduled',
    lastRun: '4 days ago',
    duration: '45m 12s'
  }, {
    name: 'Database Backup',
    schedule: 'Every 6 hours',
    status: 'running',
    lastRun: 'In progress',
    duration: '2m 15s'
  }, {
    name: 'Stats Aggregation',
    schedule: 'Every hour',
    status: 'completed',
    lastRun: '12 minutes ago',
    duration: '45s'
  }, {
    name: 'Cache Cleanup',
    schedule: 'Every day at 03:00',
    status: 'failed',
    lastRun: '5 hours ago',
    duration: 'Failed after 1m 23s'
  }];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'emerald';
      case 'running':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'running':
        return <Play className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <Clock className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Jobs & Schedules</h1>
          <p className="text-gray-400">Manage automated tasks and cron jobs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-1">Total Jobs</div>
          <div className="text-2xl font-bold text-white">5</div>
        </div>
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-1">Running</div>
          <div className="text-2xl font-bold text-blue-500">1</div>
        </div>
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-emerald-500">3</div>
        </div>
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-500">1</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Scheduled Jobs</h3>
        <div className="space-y-3">
          {jobs.map((job, index) => {
          const statusColor = getStatusColor(job.status);
          return <div key={index} className="flex items-center justify-between p-4 bg-k-surfaceHighlight rounded-xl border border-k-borderLight hover:border-k-lime/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${statusColor}-500/10 border border-${statusColor}-500/20 flex items-center justify-center text-${statusColor}-500`}>
                    {getStatusIcon(job.status)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{job.name}</div>
                    <div className="text-xs text-gray-400">{job.schedule}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Last Run</div>
                    <div className="text-sm font-bold text-white">{job.lastRun}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Duration</div>
                    <div className="text-sm font-bold text-white">{job.duration}</div>
                  </div>
                  <span className={`text-xs bg-${statusColor}-500/10 text-${statusColor}-500 px-3 py-1 rounded-full border border-${statusColor}-500/20 capitalize`}>
                    {job.status}
                  </span>
                </div>
              </div>;
        })}
        </div>
      </div>
    </div>;
};
export default AdminJobs;
```
```pages/admin/AdminModels.tsx
import React from 'react';
import { Cpu, Zap, Activity, CheckCircle } from 'lucide-react';
const AdminModels = () => {
  const models = [{
    name: 'Neural Network v2.1',
    type: 'Deep Learning',
    accuracy: 78.4,
    status: 'active',
    lastTrained: '2 days ago'
  }, {
    name: 'XGBoost Ensemble',
    type: 'Gradient Boosting',
    accuracy: 74.2,
    status: 'active',
    lastTrained: '5 days ago'
  }, {
    name: 'Random Forest Classifier',
    type: 'Ensemble',
    accuracy: 71.8,
    status: 'testing',
    lastTrained: '1 day ago'
  }];
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <Cpu className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">ML Models</h1>
          <p className="text-gray-400">Manage machine learning models</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-k-lime" />
            <h3 className="text-sm font-bold text-white">Active Models</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">2</div>
          <div className="text-xs text-gray-400">In production</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-white">Best Accuracy</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">78.4%</div>
          <div className="text-xs text-gray-400">Neural Network v2.1</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-white">Training Status</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">Idle</div>
          <div className="text-xs text-gray-400">No active training</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Model Registry</h3>
        <div className="space-y-3">
          {models.map((model, index) => <div key={index} className="flex items-center justify-between p-4 bg-k-surfaceHighlight rounded-xl border border-k-borderLight hover:border-k-lime/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-k-lime" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{model.name}</div>
                  <div className="text-xs text-gray-400">{model.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Accuracy</div>
                  <div className="text-sm font-bold text-white">{model.accuracy}%</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Last Trained</div>
                  <div className="text-sm font-bold text-white">{model.lastTrained}</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border capitalize ${model.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                  {model.status}
                </span>
              </div>
            </div>)}
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Training History</h3>
        <div className="space-y-3">
          {[{
          model: 'Neural Network v2.1',
          date: '2 days ago',
          duration: '4h 23m',
          improvement: '+2.1%'
        }, {
          model: 'Random Forest Classifier',
          date: '1 day ago',
          duration: '1h 45m',
          improvement: '+0.8%'
        }, {
          model: 'XGBoost Ensemble',
          date: '5 days ago',
          duration: '2h 12m',
          improvement: '+1.5%'
        }].map((training, index) => <div key={index} className="flex items-center justify-between p-3 bg-k-surfaceHighlight rounded-lg">
              <span className="text-sm text-white">{training.model}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">{training.date}</span>
                <span className="text-xs text-gray-400">{training.duration}</span>
                <span className="text-xs text-k-lime font-bold">{training.improvement}</span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default AdminModels;
```
```pages/admin/AdminPhase9.tsx
import React from 'react';
import { Zap, Code, Database, Sparkles } from 'lucide-react';
const AdminPhase9 = () => {
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <Zap className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Phase 9 Features</h1>
          <p className="text-gray-400">Advanced experimental features</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6 hover:border-k-lime/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Enhancement</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Next-generation AI models with improved prediction accuracy and real-time learning capabilities.
          </p>
          <span className="text-xs bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full border border-purple-500/20">
            In Development
          </span>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6 hover:border-k-lime/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-white">API v3</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            RESTful API with GraphQL support, real-time subscriptions, and enhanced authentication.
          </p>
          <span className="text-xs bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
            Planning
          </span>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6 hover:border-k-lime/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Lake</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Centralized data repository for historical match data, player statistics, and performance metrics.
          </p>
          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
            Research
          </span>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6 hover:border-k-lime/30 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-time Streaming</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Live match data streaming with instant predictions and dynamic odds updates.
          </p>
          <span className="text-xs bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full border border-orange-500/20">
            Prototype
          </span>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Development Roadmap</h3>
        <div className="space-y-4">
          {[{
          phase: 'Q1 2025',
          title: 'AI Model v3.0',
          status: 'In Progress',
          progress: 65
        }, {
          phase: 'Q2 2025',
          title: 'API Gateway Upgrade',
          status: 'Planning',
          progress: 20
        }, {
          phase: 'Q3 2025',
          title: 'Data Lake Implementation',
          status: 'Research',
          progress: 10
        }, {
          phase: 'Q4 2025',
          title: 'Real-time Streaming',
          status: 'Planned',
          progress: 5
        }].map((item, index) => <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">{item.phase}</span>
                  <div className="text-sm font-bold text-white">{item.title}</div>
                </div>
                <span className="text-xs text-gray-400">{item.status}</span>
              </div>
              <div className="h-2 bg-k-surfaceHighlight rounded-full overflow-hidden">
                <div className="h-full bg-k-lime" style={{
              width: `${item.progress}%`
            }}></div>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default AdminPhase9;
```
```pages/admin/AdminPredictions.tsx
import React from 'react';
import { TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';
const AdminPredictions = () => {
  const predictions = [{
    match: 'Liverpool vs Real Madrid',
    prediction: 'Home Win',
    confidence: 78,
    actual: 'Home Win',
    correct: true
  }, {
    match: 'Man City vs Arsenal',
    prediction: 'Draw',
    confidence: 65,
    actual: 'Home Win',
    correct: false
  }, {
    match: 'Chelsea vs Leicester',
    prediction: 'Home Win',
    confidence: 82,
    actual: 'Home Win',
    correct: true
  }, {
    match: 'West Ham vs Burnley',
    prediction: 'Home Win',
    confidence: 71,
    actual: 'Draw',
    correct: false
  }];
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Predictions Management</h1>
          <p className="text-gray-400">Monitor and analyze prediction performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-k-lime" />
            <h3 className="text-sm font-bold text-white">Accuracy</h3>
          </div>
          <div className="text-3xl font-bold text-k-lime mb-1">72.4%</div>
          <div className="text-xs text-gray-400">Last 30 days</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-white">Total Predictions</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">1,247</div>
          <div className="text-xs text-gray-400">All time</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-white">Active Models</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">3</div>
          <div className="text-xs text-gray-400">Running</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-white">Avg Confidence</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">74.2%</div>
          <div className="text-xs text-gray-400">This week</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Predictions</h3>
        <div className="space-y-3">
          {predictions.map((pred, index) => <div key={index} className="flex items-center justify-between p-4 bg-k-surfaceHighlight rounded-xl border border-k-borderLight">
              <div className="flex-1">
                <div className="text-sm font-bold text-white mb-1">{pred.match}</div>
                <div className="text-xs text-gray-400">
                  Predicted: {pred.prediction} | Actual: {pred.actual}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="text-sm font-bold text-white">{pred.confidence}%</div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${pred.correct ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {pred.correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default AdminPredictions;
```
```pages/admin/AdminStats.tsx
import React from 'react';
import { BarChart3, Activity, TrendingUp, Zap } from 'lucide-react';
const AdminStats = () => {
  return <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-k-lime/10 border border-k-lime/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-k-lime" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Stats Analyzer</h1>
          <p className="text-gray-400">Advanced statistical analysis tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-k-lime" />
            <h3 className="text-sm font-bold text-white">Matches Analyzed</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">3,842</div>
          <div className="text-xs text-gray-400">All time</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-white">Data Points</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">2.4M</div>
          <div className="text-xs text-gray-400">Processed</div>
        </div>

        <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-white">Processing Speed</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">142ms</div>
          <div className="text-xs text-gray-400">Avg per match</div>
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Analysis Metrics</h3>
        <div className="space-y-4">
          {[{
          label: 'Expected Goals (xG)',
          value: '95.2%',
          description: 'Model accuracy'
        }, {
          label: 'Possession Analysis',
          value: '89.7%',
          description: 'Data coverage'
        }, {
          label: 'Shot Quality Index',
          value: '92.4%',
          description: 'Prediction rate'
        }, {
          label: 'Defensive Metrics',
          value: '88.1%',
          description: 'Tracking accuracy'
        }].map((metric, index) => <div key={index} className="flex items-center justify-between py-3 border-b border-k-borderLight last:border-0">
              <div>
                <div className="text-sm font-bold text-white">{metric.label}</div>
                <div className="text-xs text-gray-400">{metric.description}</div>
              </div>
              <div className="text-lg font-bold text-k-lime">{metric.value}</div>
            </div>)}
        </div>
      </div>

      <div className="bg-k-surface border border-k-borderLight rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Analysis Jobs</h3>
        <div className="space-y-3">
          {[{
          name: 'Premier League Round 8',
          status: 'Completed',
          time: '5 minutes ago'
        }, {
          name: 'La Liga Round 10',
          status: 'Processing',
          time: 'In progress'
        }, {
          name: 'Champions League MD4',
          status: 'Completed',
          time: '2 hours ago'
        }].map((job, index) => <div key={index} className="flex items-center justify-between p-3 bg-k-surfaceHighlight rounded-lg">
              <span className="text-sm text-white">{job.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{job.time}</span>
                <span className={`text-xs px-2 py-1 rounded ${job.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {job.status}
                </span>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
};
export default AdminStats;
```
```pages/BrandBook.tsx
import React, { useState, useCallback, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Type,
  Layout,
  Layers,
  Zap,
  Grid3x3,
  Sparkles,
  Eye,
  ChevronRight,
  Copy,
  Check,
  Activity,
  Target,
  BarChart2,
  Search,
  TrendingUp,
  Info,
  Play,
  Pause,
  Edit3,
  BoxIcon,
} from 'lucide-react'
import {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  animations,
  iconSizes,
} from '../constants/designTokens'
import StatCard from '../components/dashboard/StatCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/Card'
import { PropertyInspector } from '../components/PropertyInspector'

// ============================================================================
// TYPES
// ============================================================================

type TabType = 'overview' | 'colors' | 'typography' | 'components' | 'patterns'

type ElementType = {
  type: 'ColorSwatch' | 'Typography' | 'Component'
  id: string
  classes: string
  content?: string
}

type CustomStyle = {
  classes?: string
  content?: string
  [key: string]: any
}

type BrandBookState = {
  copiedColor: string | null
  activeTab: TabType
  animationPlaying: boolean
  inspectorOpen: boolean
  selectedElement: ElementType | null
  customStyles: Record<string, CustomStyle>
  searchQuery: string
}

type BrandBookAction =
  | { type: 'SET_COPIED_COLOR'; payload: string | null }
  | { type: 'SET_ACTIVE_TAB'; payload: TabType }
  | { type: 'TOGGLE_ANIMATION' }
  | { type: 'TOGGLE_INSPECTOR' }
  | { type: 'SET_SELECTED_ELEMENT'; payload: ElementType | null }
  | { type: 'UPDATE_CUSTOM_STYLE'; payload: { elementId: string; property: string; value: any } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }

// ============================================================================
// CONSTANTS
// ============================================================================

const MODIFIER_KEYS = {
  EDIT: 'shiftKey',
  COPY: 'ctrlKey',
} as const

const CARD_CLASSES = {
  GLASS: 'glass-card',
  PADDING_SM: 'p-4 sm:p-5',
  PADDING_MD: 'p-4 sm:p-6',
  PADDING_LG: 'p-4 sm:p-6 lg:p-8',
} as const

const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
}

// ============================================================================
// REDUCER
// ============================================================================

const brandBookReducer = (state: BrandBookState, action: BrandBookAction): BrandBookState => {
  switch (action.type) {
    case 'SET_COPIED_COLOR':
      return { ...state, copiedColor: action.payload }
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload }
    case 'TOGGLE_ANIMATION':
      return { ...state, animationPlaying: !state.animationPlaying }
    case 'TOGGLE_INSPECTOR':
      return { ...state, inspectorOpen: !state.inspectorOpen }
    case 'SET_SELECTED_ELEMENT':
      return { ...state, selectedElement: action.payload, inspectorOpen: action.payload !== null }
    case 'UPDATE_CUSTOM_STYLE':
      return {
        ...state,
        customStyles: {
          ...state.customStyles,
          [action.payload.elementId]: {
            ...state.customStyles[action.payload.elementId],
            [action.payload.property]: action.payload.value,
          },
        },
      }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    default:
      return state
  }
}

const initialState: BrandBookState = {
  copiedColor: null,
  activeTab: 'overview',
  animationPlaying: true,
  inspectorOpen: false,
  selectedElement: null,
  customStyles: {},
  searchQuery: '',
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }, [])

  return { copiedText, copy }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BrandBook = () => {
  const [state, dispatch] = useReducer(brandBookReducer, initialState)
  const { copiedText, copy } = useCopyToClipboard()

  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      copy(text, label)
      dispatch({ type: 'SET_COPIED_COLOR', payload: label })
    },
    [copy]
  )

  const handleElementClick = useCallback(
    (e: React.MouseEvent, element: ElementType) => {
      e.stopPropagation()
      dispatch({ type: 'SET_SELECTED_ELEMENT', payload: element })
    },
    []
  )

  const handleStyleChange = useCallback((elementId: string, property: string, value: any) => {
    dispatch({ type: 'UPDATE_CUSTOM_STYLE', payload: { elementId, property, value } })
  }, [])

  const getElementStyle = useCallback(
    (elementId: string): CustomStyle => {
      return state.customStyles[elementId] || {}
    },
    [state.customStyles]
  )

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent, tabId: TabType) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId })
      }
      
      const tabs: TabType[] = ['overview', 'colors', 'typography', 'components', 'patterns']
      const currentIndex = tabs.findIndex((t) => t === state.activeTab)
      
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex = (currentIndex + 1) % tabs.length
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tabs[nextIndex] })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
        dispatch({ type: 'SET_ACTIVE_TAB', payload: tabs[nextIndex] })
      }
    },
    [state.activeTab]
  )

  // Filter colors based on search
  const filteredColors = useMemo(() => {
    if (!state.searchQuery) return colors
    const query = state.searchQuery.toLowerCase()
    return Object.fromEntries(
      Object.entries(colors).filter(([name]) => name.toLowerCase().includes(query))
    )
  }, [state.searchQuery])

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  const ColorSwatch = React.memo(
    ({ name, value, description }: { name: string; value: string; description?: string }) => {
      const elementId = `color-${name.toLowerCase().replace(/\s+/g, '-')}`
      const customStyle = getElementStyle(elementId)

      return (
        <motion.div
          {...ANIMATION_VARIANTS.scaleIn}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`${CARD_CLASSES.GLASS} ${CARD_CLASSES.PADDING_SM} cursor-pointer group relative overflow-hidden ${customStyle.classes || ''}`}
          onClick={(e) => {
            if (e.shiftKey) {
              handleElementClick(e, {
                type: 'ColorSwatch',
                id: elementId,
                classes: `${CARD_CLASSES.GLASS} ${CARD_CLASSES.PADDING_SM}`,
                content: name,
              })
            } else {
              copyToClipboard(value, name)
            }
          }}
          style={{ willChange: 'transform, opacity' }}
          role="button"
          tabIndex={0}
          aria-label={`${name} color: ${value}. Click to copy, Shift+Click to edit`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              copyToClipboard(value, name)
            }
          }}
        >
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 className="w-3 h-3 text-[#BEF264]" aria-hidden="true" />
          </div>

          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at center, ${value}15, transparent 70%)`,
            }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <motion.div
              className="w-full h-20 sm:h-24 rounded-xl mb-3 border border-white/10 shadow-inner relative overflow-hidden"
              style={{ backgroundColor: value }}
              whileHover={{ boxShadow: `0 0 20px ${value}80` }}
              aria-hidden="true"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.div>

            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white">{customStyle.content || name}</h4>
              <motion.div
                initial={false}
                animate={{ scale: state.copiedColor === name ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
                aria-live="polite"
                aria-atomic="true"
              >
                {state.copiedColor === name ? (
                  <Check className="w-4 h-4 text-[#BEF264]" aria-label="Copied" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                )}
              </motion.div>
            </div>
            <p className="text-xs font-mono text-zinc-400">{value}</p>
            {description && <p className="text-xs text-zinc-500 mt-1">{description}</p>}
          </div>

          <div className="absolute bottom-2 left-2 text-[8px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
            Shift+Click to edit
          </div>
        </motion.div>
      )
    }
  )

  ColorSwatch.displayName = 'ColorSwatch'

  const TypographyExample = React.memo(
    ({ level, example }: { level: string; example: string }) => {
      const styles = typography[level as keyof typeof typography]
      const elementId = `typo-${level}`
      const customStyle = getElementStyle(elementId)

      return (
        <motion.div
          {...ANIMATION_VARIANTS.fadeInLeft}
          transition={{ duration: 0.4 }}
          className={`${CARD_CLASSES.GLASS} ${CARD_CLASSES.PADDING_MD} mb-4 hover:border-white/20 transition-all group ${customStyle.classes || ''}`}
          onClick={(e) =>
            e.shiftKey &&
            handleElementClick(e, {
              type: 'Typography',
              id: elementId,
              classes: `${CARD_CLASSES.GLASS} ${CARD_CLASSES.PADDING_MD} mb-4`,
              content: example,
            })
          }
          role="article"
          aria-label={`${level.toUpperCase()} typography example`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
            <div>
              <h4 className="text-sm font-bold text-[#BEF264] mb-1">{level.toUpperCase()}</h4>
              <p className="text-xs text-zinc-500 font-mono">
                {typeof styles === 'object' && 'fontSize' in styles
                  ? `${styles.fontSize} / ${styles.lineHeight} / ${styles.fontWeight}`
                  : 'Font Family'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                copyToClipboard(
                  typeof styles === 'object' && 'fontSize' in styles ? styles.fontSize : styles.fontFamily,
                  level
                )
              }}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={`Copy ${level} font size`}
            >
              <Copy className="w-4 h-4 text-zinc-500" />
            </motion.button>
          </div>
          <p
            className="text-white group-hover:text-[#BEF264] transition-colors duration-300"
            style={
              typeof styles === 'object' && 'fontSize' in styles
                ? {
                    fontSize: styles.fontSize,
                    lineHeight: styles.lineHeight,
                    fontWeight: styles.fontWeight,
                  }
                : { fontFamily: styles.fontFamily }
            }
          >
            {customStyle.content || example}
          </p>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 className="w-3 h-3 text-[#BEF264]" aria-hidden="true" />
          </div>
          <div className="absolute bottom-2 right-2 text-[8px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
            Shift+Click to edit
          </div>
        </motion.div>
      )
    }
  )

  TypographyExample.displayName = 'TypographyExample'

  const ComponentShowcase = React.memo(
    ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
      <motion.div
        {...ANIMATION_VARIANTS.fadeInUp}
        transition={{ duration: 0.5 }}
        className={`${CARD_CLASSES.GLASS} ${CARD_CLASSES.PADDING_LG} mb-6`}
        role="region"
        aria-label={title}
      >
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
        <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/5">{children}</div>
      </motion.div>
    )
  )

  ComponentShowcase.displayName = 'ComponentShowcase'

  const tabs = useMemo(
    () => [
      { id: 'overview' as TabType, label: 'Overview', icon: Eye },
      { id: 'colors' as TabType, label: 'Colors', icon: Palette },
      { id: 'typography' as TabType, label: 'Typography', icon: Type },
      { id: 'components' as TabType, label: 'Components', icon: BoxIcon },
      { id: 'patterns' as TabType, label: 'Patterns', icon: Grid3x3 },
    ],
    []
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Property Inspector */}
      <AnimatePresence>
        {state.inspectorOpen && state.selectedElement && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-20 right-4 z-50"
            role="dialog"
            aria-label="Style Inspector"
            aria-modal="true"
          >
            <PropertyInspector
              selectedElement={state.selectedElement}
              onStyleChange={(property, value) => {
                if (state.selectedElement) {
                  handleStyleChange(state.selectedElement.id, property, value)
                }
              }}
              onClose={() => dispatch({ type: 'SET_SELECTED_ELEMENT', payload: null })}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A] to-transparent">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" aria-hidden="true" />

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#BEF264] blur-[120px] sm:blur-[150px]"
          aria-hidden="true"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#22D3EE] blur-[100px] sm:blur-[120px]"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#BEF264]/20 to-[#BEF264]/5 border border-[#BEF264]/20 flex items-center justify-center"
                aria-hidden="true"
              >
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#BEF264]" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  WinMix Pro <span className="text-[#BEF264]">Brand Book</span>
                </h1>
                <p className="text-zinc-400 text-base sm:text-lg mt-2">Design System & Component Library v2.4.0</p>
              </div>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-zinc-300 max-w-3xl leading-relaxed">
              A comprehensive guide to the WinMix Pro VUX Dashboard design language, featuring glassmorphism aesthetics, neon accents, and production-ready React components.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'TOGGLE_INSPECTOR' })}
              className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                state.inspectorOpen ? 'bg-[#BEF264]/10 text-[#BEF264] border border-[#BEF264]/20' : 'bg-white/5 text-white hover:bg-white/10'
              }`}
              aria-label={state.inspectorOpen ? 'Close Style Inspector' : 'Open Style Inspector'}
              aria-pressed={state.inspectorOpen}
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
              {state.inspectorOpen ? 'Close Inspector' : 'Open Style Inspector'}
            </motion.button>

            <p className="text-xs text-zinc-500 mt-2" role="note">
              💡 Tip: Shift+Click on any element to edit its styles
            </p>
          </motion.div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/10" role="navigation" aria-label="Design system sections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 sm:gap-2 py-3 sm:py-4 overflow-x-auto scrollbar-hide" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                  onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap
                    ${state.activeTab === tab.id ? 'bg-[#BEF264]/10 text-[#BEF264] border border-[#BEF264]/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                  `}
                  role="tab"
                  aria-selected={state.activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  tabIndex={state.activeTab === tab.id ? 0 : -1}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {state.activeTab === 'overview' && (
            <motion.div
              key="overview"
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ duration: 0.4 }}
              role="tabpanel"
              id="overview-panel"
              aria-labelledby="overview-tab"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Design Principles</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
                {[
                  {
                    icon: Zap,
                    title: 'Glassmorphism',
                    description: 'Translucent surfaces with backdrop blur create depth and modern aesthetics',
                    color: '#BEF264',
                  },
                  {
                    icon: Layers,
                    title: 'Neon Accents',
                    description: 'Vibrant lime green (#BEF264) primary color with glowing effects',
                    color: '#22D3EE',
                  },
                  {
                    icon: Activity,
                    title: 'Data Visualization',
                    description: 'Real-time charts, sparklines, and interactive data displays',
                    color: '#8B5CF6',
                  },
                ].map((principle, index) => (
                  <motion.article
                    key={principle.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`${CARD_CLASSES.GLASS} p-5 sm:p-6 group hover:border-white/20 transition-all cursor-pointer`}
                  >
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        backgroundColor: `${principle.color}20`,
                        border: `1px solid ${principle.color}40`,
                      }}
                      aria-hidden="true"
                    >
                      <principle.icon className="w-6 h-6" style={{ color: principle.color }} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#BEF264] transition-colors">{principle.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{principle.description}</p>
                  </motion.article>
                ))}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Key Features</h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8 mb-12`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { label: 'Design Tokens', value: 'Centralized design system' },
                    { label: 'Grid System', value: '12-column responsive layout' },
                    { label: 'Components', value: '50+ production-ready components' },
                    { label: 'Animations', value: 'Framer Motion powered' },
                    { label: 'Accessibility', value: 'WCAG 2.1 AA compliant' },
                    { label: 'Dark Mode', value: 'Optimized for dark interfaces' },
                    { label: 'TypeScript', value: 'Fully typed components' },
                    { label: 'Responsive', value: 'Mobile-first approach' },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group"
                    >
                      <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{feature.label}</span>
                      <span className="text-sm font-bold text-white">{feature.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* COLORS TAB */}
          {state.activeTab === 'colors' && (
            <motion.div
              key="colors"
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ duration: 0.4 }}
              role="tabpanel"
              id="colors-panel"
              aria-labelledby="colors-tab"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Color Palette</h2>

              {/* Search Bar */}
              <div className="mb-8">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#BEF264]/50 transition-colors"
                    aria-label="Search colors"
                  />
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Primary Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorSwatch name="Primary" value={colors.primary} description="Main accent color" />
                  <ColorSwatch name="Primary Neon" value={colors.primaryNeon} description="Bright variant" />
                  <ColorSwatch name="Primary Soft" value={colors.primarySoft} description="Softer variant" />
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Secondary Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorSwatch name="Secondary" value={colors.secondary} description="Cyan accent" />
                  <ColorSwatch name="Accent" value={colors.accent} description="Orange accent" />
                  <ColorSwatch name="Emerald" value={colors.emerald} description="Success variant" />
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Semantic Colors</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <ColorSwatch name="Success" value={colors.success} description="Positive states" />
                  <ColorSwatch name="Warning" value={colors.warning} description="Caution states" />
                  <ColorSwatch name="Danger" value={colors.danger} description="Error states" />
                  <ColorSwatch name="Info" value={colors.info} description="Information" />
                </div>
              </div>

              <div className="mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Background & Surfaces</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ColorSwatch name="Background" value={colors.background} description="Main background" />
                  <ColorSwatch name="Surface" value={colors.surface} description="Card background" />
                  <ColorSwatch name="Surface Elevated" value={colors.surfaceElevated} description="Elevated elements" />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Usage Guidelines</h3>
                <div className="space-y-4">
                  {[
                    {
                      color: '#BEF264',
                      title: 'Primary (#BEF264)',
                      desc: 'Use for primary actions, highlights, active states, and key UI elements. Provides high contrast against dark backgrounds.',
                    },
                    {
                      color: '#22D3EE',
                      title: 'Secondary (#22D3EE)',
                      desc: 'Use for secondary actions, informational elements, and complementary accents.',
                    },
                    {
                      color: 'rgba(255, 255, 255, 0.1)',
                      title: 'Glass Effects',
                      desc: 'Use rgba(255, 255, 255, 0.05-0.12) for glassmorphism effects with backdrop-blur.',
                    },
                  ].map((guideline, index) => (
                    <motion.div
                      key={guideline.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.5 }}
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: guideline.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-white mb-1 group-hover:text-[#BEF264] transition-colors">{guideline.title}</p>
                        <p className="text-sm text-zinc-400">{guideline.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* TYPOGRAPHY TAB */}
          {state.activeTab === 'typography' && (
            <motion.div
              key="typography"
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ duration: 0.4 }}
              role="tabpanel"
              id="typography-panel"
              aria-labelledby="typography-tab"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Typography System</h2>

              <div className="mb-12">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Font Families</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                  {[
                    {
                      label: 'Sans Serif (Primary)',
                      name: 'Plus Jakarta Sans',
                      family: typography.sans.fontFamily,
                      usage: 'Used for headings, body text, and UI elements',
                    },
                    {
                      label: 'Monospace (Data)',
                      name: 'JetBrains Mono',
                      family: typography.mono.fontFamily,
                      usage: 'Used for numbers, code, and data display',
                    },
                  ].map((font, index) => (
                    <motion.div
                      key={font.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`${CARD_CLASSES.GLASS} p-5 sm:p-6 cursor-pointer`}
                    >
                      <h4 className="text-sm font-bold text-[#BEF264] mb-3">{font.label}</h4>
                      <p className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: font.family }}>
                        {font.name}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-400 font-mono mb-2">{font.family}</p>
                      <p className="text-xs sm:text-sm text-zinc-500">{font.usage}</p>
                    </motion.div>
                  ))}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Type Scale</h3>
                <TypographyExample level="4xl" example="Display Heading - 36px" />
                <TypographyExample level="3xl" example="Large Heading - 30px" />
                <TypographyExample level="2xl" example="Section Heading - 24px" />
                <TypographyExample level="xl" example="Subsection Heading - 20px" />
                <TypographyExample level="lg" example="Large Body Text - 18px" />
                <TypographyExample level="base" example="Body Text - 16px" />
                <TypographyExample level="sm" example="Small Text - 14px" />
                <TypographyExample level="xs" example="Caption Text - 12px" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-6">Typography Best Practices</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Hierarchy', desc: 'Use size, weight, and color to establish clear visual hierarchy' },
                    { title: 'Contrast', desc: 'Maintain 4.5:1 contrast ratio for body text, 3:1 for large text' },
                    { title: 'Line Height', desc: 'Use 1.5-1.75 line height for body text for optimal readability' },
                    { title: 'Letter Spacing', desc: 'Tighten tracking for large headings, increase for small caps' },
                    { title: 'Tabular Nums', desc: 'Use monospace font for numbers and data to maintain alignment' },
                  ].map((practice, index) => (
                    <motion.div
                      key={practice.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-3 pb-4 border-b border-white/5 last:border-0 group"
                    >
                      <ChevronRight className="w-5 h-5 text-[#BEF264] flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                      <div>
                        <p className="text-sm font-bold text-white mb-1 group-hover:text-[#BEF264] transition-colors">{practice.title}</p>
                        <p className="text-sm text-zinc-400">{practice.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* COMPONENTS TAB */}
          {state.activeTab === 'components' && (
            <motion.div
              key="components"
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ duration: 0.4 }}
              role="tabpanel"
              id="components-panel"
              aria-labelledby="components-tab"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Component Library</h2>

              <ComponentShowcase title="Buttons" description="Primary, secondary, and ghost button variants with multiple sizes">
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <Button variant="default" size="lg">
                    Primary Button
                  </Button>
                  <Button variant="secondary" size="lg">
                    Secondary Button
                  </Button>
                  <Button variant="outline" size="lg">
                    Outline Button
                  </Button>
                  <Button variant="ghost" size="lg">
                    Ghost Button
                  </Button>
                  <Button variant="default" size="default">
                    Default Size
                  </Button>
                  <Button variant="default" size="sm">
                    Small Size
                  </Button>
                  <Button variant="default" size="icon">
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </ComponentShowcase>

              <ComponentShowcase title="Badges" description="Status indicators and labels with semantic colors">
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default Badge</Badge>
                  <Badge variant="secondary">Secondary Badge</Badge>
                  <Badge variant="outline">Outline Badge</Badge>
                  <Badge variant="destructive">Destructive Badge</Badge>
                  <div className="badge-primary">Primary Badge</div>
                  <div className="badge-success">Success Badge</div>
                  <div className="badge-danger">Danger Badge</div>
                </div>
              </ComponentShowcase>

              <ComponentShowcase title="Cards" description="Glass-effect cards with various layouts and content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Title</CardTitle>
                      <CardDescription>Card description with supporting text</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-400">This is a standard card component with header, title, description, and content sections.</p>
                    </CardContent>
                  </Card>

                  <div className={`${CARD_CLASSES.GLASS} p-5 sm:p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#BEF264]/10 border border-[#BEF264]/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-[#BEF264]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Glass Card</h4>
                        <p className="text-xs text-zinc-500">With icon and content</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400">Custom glass-effect card with glassmorphism styling and backdrop blur.</p>
                  </div>
                </div>
              </ComponentShowcase>

              <ComponentShowcase title="Stat Cards" description="Analytics cards with sparklines and progress indicators">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <StatCard
                    title="Possession"
                    value="64"
                    subValue="%"
                    subLabel="Dominating Midfield"
                    percentage={64}
                    icon={<Activity size={20} />}
                    sparklineData={[45, 48, 52, 55, 60, 58, 62, 64, 61, 64]}
                  />
                  <StatCard
                    title="Expected Goals"
                    value="2.42"
                    subLabel="+0.8 vs Avg"
                    percentage={82}
                    icon={<Target size={20} />}
                    sparklineData={[0.5, 0.8, 1.2, 0.9, 1.5, 1.8, 2.1, 1.9, 2.3, 2.42]}
                  />
                </div>
              </ComponentShowcase>

              <ComponentShowcase title="Input Fields" description="Form inputs with glass styling and validation states">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block" htmlFor="default-input">
                      Default Input
                    </label>
                    <input id="default-input" type="text" placeholder="Enter text..." className="input-glass w-full" aria-label="Default input field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block" htmlFor="search-input">
                      Search Input
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" aria-hidden="true" />
                      <input id="search-input" type="text" placeholder="Search..." className="search-input w-full" aria-label="Search input field" />
                    </div>
                  </div>
                </div>
              </ComponentShowcase>

              <ComponentShowcase title="Live Indicators" description="Real-time status indicators with pulse animations">
                <div className="flex flex-wrap gap-4 sm:gap-6">
                  <div className="live-pulse">
                    <span>Live</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#BEF264]/10 border border-[#BEF264]/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BEF264] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BEF264]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#BEF264]">AI LIVE</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    System Online
                  </div>
                </div>
              </ComponentShowcase>
            </motion.div>
          )}

          {/* PATTERNS TAB */}
          {state.activeTab === 'patterns' && (
            <motion.div
              key="patterns"
              {...ANIMATION_VARIANTS.fadeInUp}
              transition={{ duration: 0.4 }}
              role="tabpanel"
              id="patterns-panel"
              aria-labelledby="patterns-tab"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Design Patterns</h2>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${CARD_CLASSES.GLASS} p-6 sm:p-8 mb-6`}>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Spacing System</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(spacing).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 cursor-pointer"
                    >
                      <div className="text-xs font-bold text-[#BEF264] mb-2">{key.toUpperCase()}</div>
                      <div className="text-xs sm:text-sm font-mono text-white mb-2">{value}</div>
                      <motion.div whileHover={{ width: '100%' }} className="bg-[#BEF264] rounded" style={{ height: '4px', width: value }} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8 mb-6`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Border Radius</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(radius).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="bg-white/5 p-3 sm:p-4 border border-white/10 cursor-pointer"
                      style={{ borderRadius: value }}
                    >
                      <div className="text-xs font-bold text-[#BEF264] mb-1">{key.toUpperCase()}</div>
                      <div className="text-xs sm:text-sm font-mono text-white">{value}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8 mb-6`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Shadows & Effects</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Object.entries(shadows).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 cursor-pointer"
                      style={{ boxShadow: value }}
                    >
                      <div className="text-xs font-bold text-[#BEF264] mb-2">{key.toUpperCase()}</div>
                      <div className="text-xs font-mono text-zinc-400 break-all">{value}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8 mb-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Animation Durations</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: 'TOGGLE_ANIMATION' })}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    aria-label={state.animationPlaying ? 'Pause animations' : 'Play animations'}
                    aria-pressed={state.animationPlaying}
                  >
                    {state.animationPlaying ? <Pause className="w-4 h-4 text-[#BEF264]" /> : <Play className="w-4 h-4 text-[#BEF264]" />}
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {Object.entries(animations.duration).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                    >
                      <div className="w-full sm:w-32 text-sm font-bold text-white">{key.toUpperCase()}</div>
                      <div className="w-full sm:w-24 text-xs sm:text-sm font-mono text-zinc-400">{value}</div>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#BEF264]"
                          initial={{ width: 0 }}
                          animate={state.animationPlaying ? { width: '100%' } : { width: 0 }}
                          transition={{
                            duration: parseInt(value) / 1000,
                            ease: 'easeOut',
                            repeat: state.animationPlaying ? Infinity : 0,
                            repeatDelay: 1,
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${CARD_CLASSES.GLASS} p-6 sm:p-8`}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Grid Layouts</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#BEF264] mb-3">Dashboard Grid (12 columns)</h4>
                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          whileHover={{ scale: 1.1, y: -4 }}
                          className="h-10 sm:h-12 bg-[#BEF264]/20 rounded border border-[#BEF264]/40 flex items-center justify-center text-xs font-bold text-[#BEF264] cursor-pointer"
                        >
                          {i + 1}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#BEF264] mb-3">Stats Row (4 columns)</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className="h-20 sm:h-24 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer"
                        >
                          <span className="text-xs sm:text-sm text-zinc-400">Stat Card {i + 1}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-white/10 bg-[#0A0A0A] mt-12 sm:mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">WinMix Pro Design System</h3>
              <p className="text-xs sm:text-sm text-zinc-400">Version 2.4.0 • Last updated December 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500 font-mono text-center md:text-right">Built with React + TypeScript + Tailwind CSS</div>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default BrandBook
```
```pages/HomePage.tsx
import React from 'react'
import { Target, Activity, Zap, BarChart2 } from 'lucide-react'
import { useMatchData } from '../hooks/useMatchData'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import HeroSection from '../components/dashboard/HeroSection'
import MatchPicker from '../components/dashboard/MatchPicker'
import { StatCard } from '../components/dashboard/StatCard'
import BTTSChart from '../components/dashboard/BTTSChart'
import LeagueTable from '../components/dashboard/LeagueTable'
import { gridLayouts } from '../constants/gridSystem'
import { iconSizes } from '../constants/designTokens'
import { motion } from 'framer-motion'
const mockSparklines = {
  possession: [45, 48, 52, 55, 60, 58, 62, 64, 61, 64],
  xg: [0.5, 0.8, 1.2, 0.9, 1.5, 1.8, 2.1, 1.9, 2.3, 2.42],
  pass: [82, 85, 84, 88, 89, 90, 88, 91, 92, 91],
  shots: [5, 8, 7, 12, 10, 14, 15, 12, 16, 18],
}
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}
interface HomePageProps {
  /** Match selector treatment: full-screen immersive selector or compact card grid */
  heroVariant?: 'immersive' | 'compact'
  /** Show the Deep Analysis section (BTTS chart + league table) */
  showDeepAnalysis?: boolean
}

const HomePage = ({
  heroVariant = 'immersive',
  showDeepAnalysis = true,
}: HomePageProps) => {
  const { loading, bttsData, leagueTable } = useMatchData()
  if (loading) {
    return <SkeletonLoader />
  }
  return (
    <div className="space-y-2">
      {/* Hero Section */}
      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {heroVariant === 'immersive' ? <HeroSection /> : <MatchPicker />}
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-0 pb-12">
        <div className={gridLayouts.dashboard}>
          {/* ===== SECTION HEADER: Stats ===== */}
          <motion.div
            initial={{
              opacity: 0,
              x: -12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.5,
            }}
            className="col-span-1 md:col-span-2 xl:col-span-12 flex items-center gap-4 pt-2"
          >
            <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
              Match <span className="text-gradient-lime">Intelligence</span>
            </h2>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              Live Data
            </span>
          </motion.div>

          {/* ===== STATS ROW ===== */}
          <motion.div
            className={gridLayouts.statsRow}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="h-full">
              <StatCard
                theme="lime"
                title="Possession"
                value={64}
                subValue="%"
                footerText="Dominating Midfield"
                percentage={64}
                icon={<Activity size={iconSizes.md} strokeWidth={1.5} />}
                sparklineData={mockSparklines.possession}
                trend="up"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <StatCard
                theme="sky"
                title="Expected Goals (xG)"
                value="2.42"
                footerText="+0.8 vs Avg"
                percentage={82}
                icon={<Target size={iconSizes.md} strokeWidth={1.5} />}
                sparklineData={mockSparklines.xg}
                trend="up"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <StatCard
                theme="emerald"
                title="Pass Accuracy"
                value={91}
                subValue="%"
                footerText="428 Completed"
                percentage={91}
                icon={<Zap size={iconSizes.md} strokeWidth={1.5} />}
                sparklineData={mockSparklines.pass}
                trend="up"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="h-full">
              <StatCard
                theme="amber"
                title="Total Shots"
                value={18}
                footerText="6 On Target"
                percentage={45}
                icon={<BarChart2 size={iconSizes.md} strokeWidth={1.5} />}
                sparklineData={mockSparklines.shots}
                trend="neutral"
              />
            </motion.div>
          </motion.div>

          {showDeepAnalysis && (
            <>
              {/* ===== SECTION HEADER: Deep Dive ===== */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: -12,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.7,
                  duration: 0.5,
                }}
                className="col-span-1 md:col-span-2 xl:col-span-12 flex items-center gap-4 pt-4"
              >
                <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
                  Deep <span className="text-gradient-lime">Analysis</span>
                </h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  Season 24/25
                </span>
              </motion.div>

              {/* ===== DEEP DIVE SECTION (Chart + Table) ===== */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={gridLayouts.twoThirdsWidth + ' h-[600px]'}
              >
                <BTTSChart data={bttsData} />
              </motion.div>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.9,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={gridLayouts.oneThirdWidth + ' h-[600px]'}
              >
                <LeagueTable teams={leagueTable} />
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default HomePage

```
```pages/NotFound.tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>;
};
export default NotFound;
```
```tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    '!./node_modules/**',
    '!./dist/**'
  ],
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 15px 45px 0 rgba(0, 0, 0, 0.5)',
        'inner-lg': 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 20px rgba(139, 195, 74, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
```
```types/matches.ts
export interface BTTSData {
  round: number;
  bttsCount: number;
}
export interface LeagueTeam {
  position: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  form: string[];
}
```
```types/notifications.ts
export interface Notification {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}
```
```ui/accordion.tsx
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({
  className,
  ...props
}, ref) => <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />);
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```
```ui/alert-dialog.tsx
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />);
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>>(({
  className,
  ...props
}, ref) => <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props} />
  </AlertDialogPortal>);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />);
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Action>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />);
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef<React.ElementRef<typeof AlertDialogPrimitive.Cancel>, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(({
  className,
  ...props
}, ref) => <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({
  variant: "outline"
}), "mt-2 sm:mt-0", className)} {...props} />);
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
export { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
```
```ui/alert.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const alertVariants = cva("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>>(({
  className,
  variant,
  ...props
}, ref) => <div ref={ref} role="alert" className={cn(alertVariants({
  variant
}), className)} {...props} />);
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />);
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />);
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertTitle, AlertDescription };
```
```ui/aspect-ratio.tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
const AspectRatio = AspectRatioPrimitive.Root;
export { AspectRatio };
```
```ui/avatar.tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />);
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({
  className,
  ...props
}, ref) => <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarImage, AvatarFallback };
```
```ui/Badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
  variants: {
    variant: {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({
  className,
  variant,
  ...props
}: BadgeProps) {
  return <div className={cn(badgeVariants({
    variant
  }), className)} {...props} />;
}
export { Badge, badgeVariants };
```
```ui/breadcrumb.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav"> & {
  separator?: React.ReactNode;
}>(({
  ...props
}, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = "Breadcrumb";
const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<"ol">>(({
  className,
  ...props
}, ref) => <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props} />);
BreadcrumbList.displayName = "BreadcrumbList";
const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />);
BreadcrumbItem.displayName = "BreadcrumbItem";
const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<"a"> & {
  asChild?: boolean;
}>(({
  asChild,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} className={cn("transition-colors hover:text-foreground", className)} {...props} />;
});
BreadcrumbLink.displayName = "BreadcrumbLink";
const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(({
  className,
  ...props
}, ref) => <span ref={ref} role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-foreground", className)} {...props} />);
BreadcrumbPage.displayName = "BreadcrumbPage";
const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>;
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => <span role="presentation" aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>;
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis";
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis };
```
```ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline"
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant,
  size,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({
    variant,
    size,
    className
  }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
export { Button, buttonVariants };
```
```ui/calendar.tsx
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return <DayPicker showOutsideDays={showOutsideDays} className={cn("p-3", className)} classNames={{
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium",
    nav: "space-x-1 flex items-center",
    nav_button: cn(buttonVariants({
      variant: "outline"
    }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
    day: cn(buttonVariants({
      variant: "ghost"
    }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
    day_range_end: "day-range-end",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames
  }} components={{
    Chevron: props => {
      if (props.orientation === "left") {
        return <ChevronLeft className="h-4 w-4" />;
      }
      return <ChevronRight className="h-4 w-4" />;
    }
  }} {...props} />;
}
Calendar.displayName = "Calendar";
export { Calendar };
```
```ui/Card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />);
Card.displayName = "Card";
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />);
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```
```ui/carousel.tsx
import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};
type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;
const CarouselContext = React.createContext<CarouselContextProps | null>(null);
function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}, ref) => {
  const [carouselRef, api] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y"
  }, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);
  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);
  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  }, [scrollPrev, scrollNext]);
  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }
    setApi(api);
  }, [api, setApi]);
  React.useEffect(() => {
    if (!api) {
      return;
    }
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);
  return <CarouselContext.Provider value={{
    carouselRef,
    api: api,
    opts,
    orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext
  }}>
        <div ref={ref} onKeyDownCapture={handleKeyDown} className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props}>
          {children}
        </div>
      </CarouselContext.Provider>;
});
Carousel.displayName = "Carousel";
const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const {
    carouselRef,
    orientation
  } = useCarousel();
  return <div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)} {...props} />
    </div>;
});
CarouselContent.displayName = "CarouselContent";
const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const {
    orientation
  } = useCarousel();
  return <div ref={ref} role="group" aria-roledescription="slide" className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)} {...props} />;
});
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(({
  className,
  variant = "outline",
  size = "icon",
  ...props
}, ref) => {
  const {
    orientation,
    scrollPrev,
    canScrollPrev
  } = useCarousel();
  return <Button ref={ref} variant={variant} size={size} className={cn("absolute  h-8 w-8 rounded-full", orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>;
});
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(({
  className,
  variant = "outline",
  size = "icon",
  ...props
}, ref) => {
  const {
    orientation,
    scrollNext,
    canScrollNext
  } = useCarousel();
  return <Button ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full", orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)} disabled={!canScrollNext} onClick={scrollNext} {...props}>
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>;
});
CarouselNext.displayName = "CarouselNext";
export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
```
```ui/chart.tsx
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
} as const;
export type ChartConfig = { [k in string]: {
  label?: React.ReactNode;
  icon?: React.ComponentType;
} & ({
  color?: string;
  theme?: never;
} | {
  color?: never;
  theme: Record<keyof typeof THEMES, string>;
}) };
type ChartContextProps = {
  config: ChartConfig;
};
const ChartContext = React.createContext<ChartContextProps | null>(null);
function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
const ChartContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}>(({
  id,
  className,
  children,
  config,
  ...props
}, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return <ChartContext.Provider value={{
    config
  }}>
      <div data-chart={chartId} ref={ref} className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>;
});
ChartContainer.displayName = "Chart";
const ChartStyle = ({
  id,
  config
}: {
  id: string;
  config: ChartConfig;
}) => {
  const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);
  if (!colorConfig.length) {
    return null;
  }
  return <style dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
      return color ? `  --color-${key}: ${color};` : null;
    }).join("\n")}
}
`).join("\n")
  }} />;
};
const ChartTooltip = RechartsPrimitive.Tooltip;
const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & {
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}>(({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}, ref) => {
  const {
    config
  } = useChart();
  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey || item.dataKey || item.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label as keyof typeof config]?.label || label : itemConfig?.label;
    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>;
    }
    if (!value) {
      return null;
    }
    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return <div ref={ref} className={cn("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
        const key = `${nameKey || item.name || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const indicatorColor = color || item.payload.fill || item.color;
        return <div key={item.dataKey} className={cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center")}>
                {formatter && item?.value !== undefined && item.name ? formatter(item.value, item.name, item, index, item.payload) : <>
                    {itemConfig?.icon ? <itemConfig.icon /> : !hideIndicator && <div className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
              "h-2.5 w-2.5": indicator === "dot",
              "w-1": indicator === "line",
              "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
              "my-0.5": nestLabel && indicator === "dashed"
            })} style={{
              "--color-bg": indicatorColor,
              "--color-border": indicatorColor
            } as React.CSSProperties} />}
                    <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>}
                    </div>
                  </>}
              </div>;
      })}
        </div>
      </div>;
});
ChartTooltipContent.displayName = "ChartTooltip";
const ChartLegend = RechartsPrimitive.Legend;
const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
  hideIcon?: boolean;
  nameKey?: string;
}>(({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}, ref) => {
  const {
    config
  } = useChart();
  if (!payload?.length) {
    return null;
  }
  return <div ref={ref} className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
        {payload.map(item => {
      const key = `${nameKey || item.dataKey || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      return <div key={item.value} className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}>
              {itemConfig?.icon && !hideIcon ? <itemConfig.icon /> : <div className="h-2 w-2 shrink-0 rounded-[2px]" style={{
          backgroundColor: item.color
        }} />}
              {itemConfig?.label}
            </div>;
    })}
      </div>;
});
ChartLegendContent.displayName = "ChartLegend";

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : undefined;
  let configLabelKey: string = key;
  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }
  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
```
```ui/checkbox.tsx
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>>(({
  className,
  ...props
}, ref) => <CheckboxPrimitive.Root ref={ref} className={cn("peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className)} {...props}>
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
export { Checkbox };
```
```ui/collapsible.tsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```
```ui/command.tsx
import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(({
  className,
  ...props
}, ref) => <CommandPrimitive ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />);
Command.displayName = CommandPrimitive.displayName;
interface CommandDialogProps extends DialogProps {}
const CommandDialog = ({
  children,
  ...props
}: CommandDialogProps) => {
  return <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>;
};
const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>>(({
  className,
  ...props
}, ref) => <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input ref={ref} className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
  </div>);
CommandInput.displayName = CommandPrimitive.Input.displayName;
const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.List ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />);
CommandList.displayName = CommandPrimitive.List.displayName;
const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>((props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />);
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Group ref={ref} className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...props} />);
CommandGroup.displayName = CommandPrimitive.Group.displayName;
const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(({
  className,
  ...props
}, ref) => <CommandPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50", className)} {...props} />);
CommandItem.displayName = CommandPrimitive.Item.displayName;
const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator };
```
```ui/context-menu.tsx
import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
const ContextMenuSubTrigger = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <ContextMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>);
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;
const ContextMenuSubContent = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;
const ContextMenuContent = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </ContextMenuPrimitive.Portal>);
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;
const ContextMenuItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <ContextMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;
const ContextMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <ContextMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>);
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;
const ContextMenuRadioItem = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <ContextMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>);
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;
const ContextMenuLabel = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <ContextMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", inset && "pl-8", className)} {...props} />);
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;
const ContextMenuSeparator = React.forwardRef<React.ElementRef<typeof ContextMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />);
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;
const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup };
```
```ui/dialog.tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>);
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />);
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({
  className,
  ...props
}, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DialogDescription.displayName = DialogPrimitive.Description.displayName;
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
```
```ui/drawer.tsx
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
Drawer.displayName = "Drawer";
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerClose = DrawerPrimitive.Close;
const DrawerOverlay = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;
const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>>(({
  className,
  children,
  ...props
}, ref) => <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content ref={ref} className={cn("fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background", className)} {...props}>
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>);
DrawerContent.displayName = "DrawerContent";
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />;
DrawerHeader.displayName = "DrawerHeader";
const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
DrawerFooter.displayName = "DrawerFooter";
const DrawerTitle = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />);
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;
const DrawerDescription = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>>(({
  className,
  ...props
}, ref) => <DrawerPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;
export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
```
```ui/dropdown-menu.tsx
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>);
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({
  className,
  sideOffset = 4,
  ...props
}, ref) => <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </DropdownMenuPrimitive.Portal>);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>);
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <DropdownMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>);
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />);
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup };
```
```ui/form.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
const Form = FormProvider;
type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};
const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);
const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return <FormFieldContext.Provider value={{
    name: props.name
  }}>
      <Controller {...props} />
    </FormFieldContext.Provider>;
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const {
    getFieldState,
    formState
  } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const {
    id
  } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
type FormItemContextValue = {
  id: string;
};
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => {
  const id = React.useId();
  return <FormItemContext.Provider value={{
    id
  }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>;
});
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({
  className,
  ...props
}, ref) => {
  const {
    error,
    formItemId
  } = useFormField();
  return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({
  ...props
}, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formMessageId
  } = useFormField();
  return <Slot ref={ref} id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
});
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => {
  const {
    formDescriptionId
  } = useFormField();
  return <p ref={ref} id={formDescriptionId} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  children,
  ...props
}, ref) => {
  const {
    error,
    formMessageId
  } = useFormField();
  const body = error ? String(error?.message) : children;
  if (!body) {
    return null;
  }
  return <p ref={ref} id={formMessageId} className={cn("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>;
});
FormMessage.displayName = "FormMessage";
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
```
```ui/HeadlessDialog.tsx
import React, { Fragment, ReactNode } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
interface HeadlessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}
const HeadlessDialog: React.FC<HeadlessDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  return <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className={`w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-gradient-to-b from-k-card/60 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/30 dark:border-b-0 backdrop-blur-xl shadow-2xl transition-all`}>
                <div className="flex items-center justify-between p-6 border-b border-k-borderLight/20 backdrop-blur-sm">
                  <Dialog.Title className="text-xl font-bold text-white">
                    {title}
                  </Dialog.Title>
                  {showCloseButton && <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-k-lime" aria-label="Close dialog">
                      <X className="w-5 h-5" />
                    </button>}
                </div>
                <div className="p-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>;
};
export default HeadlessDialog;
```
```ui/HeadlessMenu.tsx
import React, { Fragment, ReactNode } from 'react';
import { Menu, Transition } from '@headlessui/react';
interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}
interface HeadlessMenuProps {
  button: ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right' | 'top';
}
const HeadlessMenu: React.FC<HeadlessMenuProps> = ({
  button,
  items,
  align = 'right'
}) => {
  const positionClass = align === 'top' ? 'bottom-full mb-2' : 'mt-2';
  const horizontalAlign = align === 'right' || align === 'top' ? 'right-0' : 'left-0';
  const originClass = align === 'top' ? 'origin-bottom-right' : `origin-top-${align === 'right' ? 'right' : 'left'}`;
  return <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={Fragment}>{button}</Menu.Button>

      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className={`absolute ${horizontalAlign} ${positionClass} w-56 ${originClass} rounded-xl bg-gradient-to-b from-k-card/30 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 dark:border-b-k-border/5 backdrop-blur-xl shadow-2xl ring-1 ring-black/10 focus:outline-none z-50 overflow-hidden`}>
          <div className="py-1">
            {items.map((item, index) => <Menu.Item key={index} disabled={item.disabled}>
                {({
              active
            }) => <button onClick={item.onClick} disabled={item.disabled} className={`${active ? 'bg-white/5 text-white backdrop-blur-sm' : 'text-gray-400'} ${item.danger ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : ''} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex w-full items-center px-4 py-3 text-sm font-medium transition-all duration-200`}>
                    {item.icon && <span className="mr-3 w-5 h-5 flex items-center justify-center">
                        {item.icon}
                      </span>}
                    {item.label}
                  </button>}
              </Menu.Item>)}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>;
};
export default HeadlessMenu;
```
```ui/HeadlessPopover.tsx
import React, { Fragment, ReactNode } from 'react';
import { Popover, Transition } from '@headlessui/react';
interface HeadlessPopoverProps {
  button: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}
const HeadlessPopover: React.FC<HeadlessPopoverProps> = ({
  button,
  children,
  align = 'center',
  className = ''
}) => {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };
  return <Popover className="relative">
      <Popover.Button as={Fragment}>{button}</Popover.Button>

      <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
        <Popover.Panel className={`absolute ${alignClasses[align]} z-50 mt-3 ${className}`}>
          <div className="overflow-hidden rounded-xl bg-gradient-to-b from-k-card/30 to-k-card/20 border border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 dark:border-b-k-border/5 backdrop-blur-xl shadow-2xl ring-1 ring-black/10">
            {children}
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>;
};
export default HeadlessPopover;
```
```ui/HeadlessSwitch.tsx
import React from 'react';
import { Switch } from '@headlessui/react';
interface HeadlessSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
}
const HeadlessSwitch: React.FC<HeadlessSwitchProps> = ({
  enabled,
  onChange,
  label,
  description
}) => {
  return <Switch.Group>
      <div className="flex items-center justify-between">
        <span className="flex flex-col flex-grow">
          {label && <Switch.Label className="text-sm font-medium text-white cursor-pointer">
              {label}
            </Switch.Label>}
          {description && <Switch.Description className="text-xs text-gray-400 mt-1">
              {description}
            </Switch.Description>}
        </span>
        <Switch checked={enabled} onChange={onChange} className={`${enabled ? 'bg-k-lime shadow-lg shadow-k-lime/30' : 'bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 border border-k-borderLight/20 backdrop-blur-sm'} relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface`}>
          <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-black transition-transform`} />
        </Switch>
      </div>
    </Switch.Group>;
};
export default HeadlessSwitch;
```
```ui/HeadlessTabs.tsx
import React, { Fragment, ReactNode } from 'react';
import { Tab } from '@headlessui/react';
interface TabItem {
  name: string;
  icon?: ReactNode;
  content: ReactNode;
}
interface HeadlessTabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
}
const HeadlessTabs: React.FC<HeadlessTabsProps> = ({
  tabs,
  defaultIndex = 0
}) => {
  return <Tab.Group defaultIndex={defaultIndex}>
      <Tab.List className="flex space-x-1 rounded-xl bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm p-1 border border-k-borderLight dark:border-k-border/10">
        {tabs.map(tab => <Tab key={tab.name} as={Fragment}>
            {({
          selected
        }) => <button className={`w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface ${selected ? 'bg-k-lime text-black shadow-lg shadow-k-lime/20' : 'text-gray-400 hover:bg-white/5 hover:text-white backdrop-blur-sm'}`}>
                <span className="flex items-center justify-center gap-2">
                  {tab.icon}
                  {tab.name}
                </span>
              </button>}
          </Tab>)}
      </Tab.List>
      <Tab.Panels className="mt-4">
        {tabs.map((tab, idx) => <Tab.Panel key={idx} className="rounded-xl focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface">
            {tab.content}
          </Tab.Panel>)}
      </Tab.Panels>
    </Tab.Group>;
};
export default HeadlessTabs;
```
```ui/hover-card.tsx
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";
const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>>(({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}, ref) => <HoverCardPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;
export { HoverCard, HoverCardTrigger, HoverCardContent };
```
```ui/input-otp.tsx
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";
const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(({
  className,
  containerClassName,
  ...props
}, ref) => <OTPInput ref={ref} containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)} className={cn("disabled:cursor-not-allowed", className)} {...props} />);
InputOTP.displayName = "InputOTP";
const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />);
InputOTPGroup.displayName = "InputOTPGroup";
const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div"> & {
  index: number;
}>(({
  index,
  className,
  ...props
}, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const {
    char,
    hasFakeCaret,
    isActive
  } = inputOTPContext.slots[index];
  return <div ref={ref} className={cn("relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-2 ring-ring ring-offset-background", className)} {...props}>
      {char}
      {hasFakeCaret && <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>}
    </div>;
});
InputOTPSlot.displayName = "InputOTPSlot";
const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(({
  ...props
}, ref) => <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>);
InputOTPSeparator.displayName = "InputOTPSeparator";
export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
```
```ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({
  className,
  type,
  ...props
}, ref) => {
  return <input type={type} className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props} />;
});
Input.displayName = "Input";
export { Input };
```
```ui/label.tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>>(({
  className,
  ...props
}, ref) => <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />);
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
```
```ui/LiveIndicator.tsx
import React from 'react';
interface LiveIndicatorProps {
  time?: string;
  label?: string;
  variant?: 'default' | 'small';
}
const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  time,
  label = 'LIVE',
  variant = 'default'
}) => {
  if (variant === 'small') {
    return <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
      </div>;
  }
  return <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-k-limeLight border border-k-limeBorder text-k-lime text-sm font-bold font-mono">
      <span className="animate-pulse">●</span>
      {time || label}
    </div>;
};
export default LiveIndicator;
```
```ui/menubar.tsx
import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const MenubarMenu = MenubarPrimitive.Menu;
const MenubarGroup = MenubarPrimitive.Group;
const MenubarPortal = MenubarPrimitive.Portal;
const MenubarSub = MenubarPrimitive.Sub;
const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
const Menubar = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Root ref={ref} className={cn("flex h-10 items-center space-x-1 rounded-md border bg-background p-1", className)} {...props} />);
Menubar.displayName = MenubarPrimitive.Root.displayName;
const MenubarTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Trigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", className)} {...props} />);
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;
const MenubarSubTrigger = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}>(({
  className,
  inset,
  children,
  ...props
}, ref) => <MenubarPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>);
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;
const MenubarSubContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;
const MenubarContent = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Content>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>>(({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}, ref) => <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content ref={ref} align={align} alignOffset={alignOffset} sideOffset={sideOffset} className={cn("z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
    </MenubarPrimitive.Portal>);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;
const MenubarItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Item>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <MenubarPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", inset && "pl-8", className)} {...props} />);
MenubarItem.displayName = MenubarPrimitive.Item.displayName;
const MenubarCheckboxItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.CheckboxItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>>(({
  className,
  children,
  checked,
  ...props
}, ref) => <MenubarPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>);
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;
const MenubarRadioItem = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>>(({
  className,
  children,
  ...props
}, ref) => <MenubarPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>);
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;
const MenubarLabel = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Label>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}>(({
  className,
  inset,
  ...props
}, ref) => <MenubarPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />);
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;
const MenubarSeparator = React.forwardRef<React.ElementRef<typeof MenubarPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <MenubarPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;
const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayname = "MenubarShortcut";
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarLabel, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarPortal, MenubarSubContent, MenubarSubTrigger, MenubarGroup, MenubarSub, MenubarShortcut };
```
```ui/navigation-menu.tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
const NavigationMenu = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Root>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>>(({
  className,
  children,
  ...props
}, ref) => <NavigationMenuPrimitive.Root ref={ref} className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)} {...props}>
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>);
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;
const NavigationMenuList = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.List>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.List ref={ref} className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)} {...props} />);
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;
const NavigationMenuItem = NavigationMenuPrimitive.Item;
const navigationMenuTriggerStyle = cva("group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50");
const NavigationMenuTrigger = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), "group", className)} {...props}>
    {children}{" "}
    <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
  </NavigationMenuPrimitive.Trigger>);
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;
const NavigationMenuContent = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.Content ref={ref} className={cn("left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ", className)} {...props} />);
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;
const NavigationMenuLink = NavigationMenuPrimitive.Link;
const NavigationMenuViewport = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>>(({
  className,
  ...props
}, ref) => <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport className={cn("origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]", className)} ref={ref} {...props} />
  </div>);
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;
const NavigationMenuIndicator = React.forwardRef<React.ElementRef<typeof NavigationMenuPrimitive.Indicator>, React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>>(({
  className,
  ...props
}, ref) => <NavigationMenuPrimitive.Indicator ref={ref} className={cn("top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in", className)} {...props}>
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>);
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;
export { navigationMenuTriggerStyle, NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport };
```
```ui/NotificationDrawer.tsx
import React, { useCallback, useEffect, useState, Fragment, memo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
// Notification interfész
export interface Notification {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
  isRead?: boolean;
}
interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}
// NotificationItem - memo-val
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = memo(({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const handleMarkAsRead = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(notification.id);
  }, [notification.id, onDelete]);
  return <div className="group relative flex items-center p-5 cursor-pointer rounded-2xl hover:bg-white/5 transition-all duration-200">
      {/* Gradient Card Background on Hover */}
      <div className="absolute inset-0 rounded-2xl invisible opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 bg-gradient-to-br from-k-lime/20 via-k-lime/10 to-transparent backdrop-blur-sm">
        <div className="absolute inset-[1.5px] bg-gradient-to-b from-k-surface/90 to-k-surface/80 rounded-[14.5px]"></div>
      </div>

      {/* User Avatar */}
      <button onClick={handleMarkAsRead} className="relative z-10 shrink-0 w-12 h-12 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-k-lime focus:ring-offset-2 focus:ring-offset-k-surface">
        <img alt={notification.user} className="w-full h-full object-cover" src={notification.avatar} />
      </button>

      {/* Notification Content */}
      <div className="relative z-10 flex-1 pl-4 pr-8">
        <div className={`text-sm leading-relaxed ${!notification.isRead ? 'font-semibold text-white' : 'text-gray-400'}`}>
          <button onClick={handleMarkAsRead} className="font-semibold hover:text-k-lime transition-colors focus:outline-none focus:underline">
            {notification.user}
          </button>{' '}
          {notification.action}{' '}
          <button onClick={handleMarkAsRead} className="font-semibold hover:text-k-lime transition-colors focus:outline-none focus:underline">
            {notification.target}
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">{notification.time}</div>
      </div>

      {/* Delete button */}
      <button onClick={handleDelete} className="relative z-20 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label={`Törölni ${notification.user} értesítést`}>
        <X className="w-4 h-4" />
      </button>
    </div>;
});
NotificationItem.displayName = 'NotificationItem';
const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications: externalNotifications,
  onMarkAsRead: externalOnMarkAsRead,
  onDelete: externalOnDelete
}) => {
  const [internalNotifications, setInternalNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mock adatok
  const mockNotifications: Notification[] = [{
    id: '1',
    user: 'conceptual_artist',
    avatar: 'https://ui-avatars.com/api/?name=CA&background=CCFF00&color=000&bold=true',
    action: 'megvásárolta',
    target: '3D Artistry Pack',
    time: '1ó 5p e.'
  }, {
    id: '2',
    user: 'imaginative_vision',
    avatar: 'https://ui-avatars.com/api/?name=IV&background=3b82f6&color=fff',
    action: 'kedvelte',
    target: 'Interactive Design Assets',
    time: '1ó 12p e.',
    isRead: true
  }, {
    id: '3',
    user: 'aesthetic_explorer',
    avatar: 'https://ui-avatars.com/api/?name=AE&background=8b5cf6&color=fff',
    action: 'kommentelt',
    target: 'CreativeSpace UI Kit',
    time: '5ó e.'
  }, {
    id: '4',
    user: 'style_savant',
    avatar: 'https://ui-avatars.com/api/?name=SS&background=ec4899&color=fff',
    action: 'kedvelte',
    target: 'GraphicGenius Fonts',
    time: '7ó e.'
  }, {
    id: '5',
    user: 'visual_vortex',
    avatar: 'https://ui-avatars.com/api/?name=VV&background=f59e0b&color=fff',
    action: 'megvásárolta',
    target: 'DesignWave Toolkit',
    time: '12ó e.'
  }];
  // API szimuláció
  useEffect(() => {
    if (!externalNotifications?.length) {
      setLoading(true);
      const fetchNotifications = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          setInternalNotifications(mockNotifications);
        } catch (err) {
          setError('Nem sikerült betölteni az értesítéseket.');
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, []);
  const notifications = externalNotifications || internalNotifications;
  const markAsRead = useCallback((id: string) => {
    if (externalOnMarkAsRead) {
      externalOnMarkAsRead(id);
    } else {
      setInternalNotifications(prev => prev.map(n => n.id === id ? {
        ...n,
        isRead: true
      } : n));
    }
  }, [externalOnMarkAsRead]);
  const deleteNotification = useCallback((id: string) => {
    if (externalOnDelete) {
      externalOnDelete(id);
    } else {
      setInternalNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [externalOnDelete]);
  return <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        {/* Headless UI Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 transition-opacity" aria-hidden="true" />
        </Transition.Child>

        {/* Drawer Panel */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-300 sm:duration-300" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-300 sm:duration-300" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-gradient-to-b from-k-card/100 to-k-card/80 border-l border-k-borderLight dark:border-k-border/10 dark:border-t-k-borderLight/20 backdrop-blur-xl shadow-2xl">
                    {/* Header */}
                    <div className="flex-shrink-0 px-10 pt-10 pb-5">
                      <div className="flex h-12 items-center justify-between">
                        <Dialog.Title className="text-xl font-semibold text-white">
                          Értesítések
                        </Dialog.Title>
                        <div className="ml-2 flex h-12 items-center">
                          <button type="button" className="group inline-flex items-center justify-center rounded-full bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm border border-k-borderLight/20 p-2 text-gray-400 hover:border-k-lime hover:text-white hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] focus:outline-none focus:ring-2 focus:ring-k-lime transition-all duration-200" onClick={onClose}>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-5 pb-20" aria-live="polite">
                      {loading && <div className="flex items-center justify-center h-32 text-gray-400">
                          Értesítések betöltése...
                        </div>}

                      {error && <div className="flex items-center justify-center h-32 text-red-400 p-8 text-center">
                          {error}
                          <button onClick={() => window.location.reload()} className="ml-2 text-k-lime hover:underline focus:outline-none focus:ring-2 focus:ring-k-lime">
                            Újratöltés
                          </button>
                        </div>}

                      {!loading && !error && notifications.length === 0 && <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                          <div className="text-2xl mb-4">🔔</div>
                          <div className="text-lg mb-2">Nincs értesítés</div>
                          <div className="text-sm">
                            Később értesülhetsz az új tevékenységekről
                          </div>
                        </div>}

                      {!loading && !error && notifications.map(notification => <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} onDelete={deleteNotification} />)}
                    </div>

                    {/* Footer Button */}
                    <div className="flex-shrink-0 border-t border-k-borderLight/20 backdrop-blur-sm px-6 pb-6 pt-6">
                      <button className="w-full inline-flex items-center justify-center h-12 rounded-full text-sm font-semibold transition-all duration-200 bg-gradient-to-b from-k-surfaceHighlight/60 to-k-surfaceHighlight/40 backdrop-blur-sm text-white border border-k-borderLight/20 hover:border-k-lime hover:text-k-lime hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] focus:outline-none focus:ring-2 focus:ring-k-lime">
                        Összes értesítés megtekintése
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>;
};
export default NotificationDrawer;
```
```ui/pagination.tsx
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";
const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => <nav role="navigation" aria-label="pagination" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
Pagination.displayName = "Pagination";
const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />);
PaginationContent.displayName = "PaginationContent";
const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} className={cn("", className)} {...props} />);
PaginationItem.displayName = "PaginationItem";
type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> & React.ComponentProps<"a">;
const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => <a aria-current={isActive ? "page" : undefined} className={cn(buttonVariants({
  variant: isActive ? "outline" : "ghost",
  size
}), className)} {...props} />;
PaginationLink.displayName = "PaginationLink";
const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>;
PaginationPrevious.displayName = "PaginationPrevious";
const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>;
PaginationNext.displayName = "PaginationNext";
const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>;
PaginationEllipsis.displayName = "PaginationEllipsis";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
```
```ui/popover.tsx
import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>>(({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}, ref) => <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />
  </PopoverPrimitive.Portal>);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
export { Popover, PopoverTrigger, PopoverContent };
```
```ui/progress.tsx
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({
  className,
  value,
  ...props
}, ref) => <ProgressPrimitive.Root ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{
    transform: `translateX(-${100 - (value || 0)}%)`
  }} />
  </ProgressPrimitive.Root>);
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
```
```ui/ProgressBar.tsx
import React from 'react';
interface ProgressBarProps {
  percentage: number;
  color?: 'lime' | 'white' | 'success' | 'danger';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}
const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = 'lime',
  height = 'md',
  showLabel = false,
  label
}) => {
  const colorClasses = {
    lime: 'bg-k-lime',
    white: 'bg-white',
    success: 'bg-success',
    danger: 'bg-danger'
  };
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  return <div className="w-full">
      {showLabel && label && <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{label}</span>
          <span className="text-white font-bold">{percentage}%</span>
        </div>}
      <div className={`w-full bg-black rounded-full overflow-hidden border border-white/10 ${heightClasses[height]}`}>
        <div className={`${colorClasses[color]} ${heightClasses[height]} transition-all duration-1000 ease-out`} style={{
        width: `${percentage}%`
      }} />
      </div>
    </div>;
};
export default ProgressBar;
```
```ui/radio-group.tsx
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(({
  className,
  ...props
}, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(({
  className,
  ...props
}, ref) => {
  return <RadioGroupPrimitive.Item ref={ref} className={cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>;
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
export { RadioGroup, RadioGroupItem };
```
```ui/resizable.tsx
import { GripVertical } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => <ResizablePrimitive.PanelGroup className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)} {...props} />;
const ResizablePanel = ResizablePrimitive.Panel;
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => <ResizablePrimitive.PanelResizeHandle className={cn("relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90", className)} {...props}>
    {withHandle && <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>}
  </ResizablePrimitive.PanelResizeHandle>;
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
```
```ui/scroll-area.tsx
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(({
  className,
  children,
  ...props
}, ref) => <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>(({
  className,
  orientation = "vertical",
  ...props
}, ref) => <ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
export { ScrollArea, ScrollBar };
```
```ui/select.tsx
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>);
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({
  className,
  children,
  position = "popper",
  ...props
}, ref) => <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>);
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.Label ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />);
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({
  className,
  children,
  ...props
}, ref) => <SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>);
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(({
  className,
  ...props
}, ref) => <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton };
```
```ui/separator.tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}, ref) => <SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props} />);
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };
```
```ui/sheet.tsx
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref} />);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500", {
  variants: {
    side: {
      top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
    }
  },
  defaultVariants: {
    side: "right"
  }
});
interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {}
const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, SheetContentProps>(({
  side = "right",
  className,
  children,
  ...props
}, ref) => <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({
    side
  }), className)} {...props}>
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />;
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
SheetFooter.displayName = "SheetFooter";
const SheetTitle = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />);
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(({
  className,
  ...props
}, ref) => <SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
SheetDescription.displayName = SheetPrimitive.Description.displayName;
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, SheetTitle, SheetTrigger };
```
```ui/sidebar.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};
const SidebarContext = React.createContext<SidebarContext | null>(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>(({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(open) : value;
    if (setOpenProp) {
      setOpenProp(openState);
    } else {
      _setOpen(openState);
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }, [setOpenProp, open]);

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo<SidebarContext>(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
  return <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div style={{
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      } as React.CSSProperties} className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)} ref={ref} {...props}>
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>;
});
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}>(({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}, ref) => {
  const {
    isMobile,
    state,
    openMobile,
    setOpenMobile
  } = useSidebar();
  if (collapsible === "none") {
    return <div className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)} ref={ref} {...props}>
          {children}
        </div>;
  }
  if (isMobile) {
    return <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent data-sidebar="sidebar" data-mobile="true" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" style={{
        "--sidebar-width": SIDEBAR_WIDTH_MOBILE
      } as React.CSSProperties} side={side}>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>;
  }
  return <div ref={ref} className="group peer hidden md:block text-sidebar-foreground" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
        {/* This is what handles the sidebar gap on desktop */}
        <div className={cn("duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]")} />
        <div className={cn("duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex", side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
    // Adjust the padding for floating and inset variants.
    variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            {children}
          </div>
        </div>
      </div>;
});
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(({
  className,
  onClick,
  ...props
}, ref) => {
  const {
    toggleSidebar
  } = useSidebar();
  return <Button ref={ref} data-sidebar="trigger" variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={event => {
    onClick?.(event);
    toggleSidebar();
  }} {...props}>
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>;
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(({
  className,
  ...props
}, ref) => {
  const {
    toggleSidebar
  } = useSidebar();
  return <button ref={ref} data-sidebar="rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props} />;
});
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<"main">>(({
  className,
  ...props
}, ref) => {
  return <main ref={ref} className={cn("relative flex min-h-svh flex-1 flex-col bg-background", "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className)} {...props} />;
});
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(({
  className,
  ...props
}, ref) => {
  return <Input ref={ref} data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props} />;
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
});
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(({
  className,
  ...props
}, ref) => {
  return <Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />;
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />;
});
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => {
  return <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />;
});
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  asChild?: boolean;
}>(({
  className,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} data-sidebar="group-label" className={cn("duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props} />;
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
}>(({
  className,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-sidebar="group-action" className={cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props} />;
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />);
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  className,
  ...props
}, ref) => <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />);
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    variant: {
      default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
    },
    size: {
      default: "h-8 text-sm",
      sm: "h-7 text-xs",
      lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>>(({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  const {
    isMobile,
    state
  } = useSidebar();
  const button = <Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({
    variant,
    size
  }), className)} {...props} />;
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip} />
      </Tooltip>;
});
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}>(({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp ref={ref} data-sidebar="menu-action" className={cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0",
  // Increases the hit area of the button on mobile.
  "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} {...props} />;
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({
  className,
  ...props
}, ref) => <div ref={ref} data-sidebar="menu-badge" className={cn("absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  showIcon?: boolean;
}>(({
  className,
  showIcon = false,
  ...props
}, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return <div ref={ref} data-sidebar="menu-skeleton" className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton className="h-4 flex-1 max-w-[--skeleton-width]" data-sidebar="menu-skeleton-text" style={{
      "--skeleton-width": width
    } as React.CSSProperties} />
    </div>;
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(({
  className,
  ...props
}, ref) => <ul ref={ref} data-sidebar="menu-sub" className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props} />);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({
  ...props
}, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}>(({
  asChild = false,
  size = "md",
  isActive,
  className,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} {...props} />;
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar };
```
```ui/skeleton.tsx
import { cn } from "@/lib/utils";
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
export { Skeleton };
```
```ui/SkeletonLoader.tsx
import React from 'react';
const SkeletonLoader = () => <div className="p-6 space-y-6 w-full animate-pulse">
    <div className="h-24 w-full bg-[#1a1a1a] rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-[#1a1a1a] rounded-3xl"></div>
      <div className="h-80 bg-[#1a1a1a] rounded-3xl"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#1a1a1a] rounded-2xl"></div>)}
    </div>
  </div>;
export default SkeletonLoader;
```
```ui/slider.tsx
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({
  className,
  ...props
}, ref) => <SliderPrimitive.Root ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>);
Slider.displayName = SliderPrimitive.Root.displayName;
export { Slider };
```
```ui/sonner.tsx
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
type ToasterProps = React.ComponentProps<typeof Sonner>;
const Toaster = ({
  ...props
}: ToasterProps) => {
  const {
    theme = "system"
  } = useTheme();
  return <Sonner theme={theme as ToasterProps["theme"]} className="toaster group" toastOptions={{
    classNames: {
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
      actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
      cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
    }
  }} {...props} />;
};
export { Toaster };
```
```ui/StatusDot.tsx
import React from 'react';
interface StatusDotProps {
  status: 'online' | 'offline' | 'away' | 'busy';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}
const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  animate = true
}) => {
  const statusColors = {
    online: 'bg-success',
    offline: 'bg-gray-500',
    away: 'bg-warning',
    busy: 'bg-danger'
  };
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };
  const animateClass = animate && status === 'online' ? 'animate-pulse' : '';
  return <span className={`inline-block rounded-full ${statusColors[status]} ${sizeClasses[size]} ${animateClass}`} />;
};
export default StatusDot;
```
```ui/switch.tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({
  className,
  ...props
}, ref) => <SwitchPrimitives.Root className={cn("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className)} {...props} ref={ref}>
    <SwitchPrimitives.Thumb className={cn("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")} />
  </SwitchPrimitives.Root>);
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
```
```ui/table.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({
  className,
  ...props
}, ref) => <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>);
Table.displayName = "Table";
const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />);
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />);
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />);
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({
  className,
  ...props
}, ref) => <tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />);
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />);
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />);
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({
  className,
  ...props
}, ref) => <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />);
TableCaption.displayName = "TableCaption";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
```
```ui/tabs.tsx
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)} {...props} />);
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({
  className,
  ...props
}, ref) => <TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)} {...props} />);
TabsContent.displayName = TabsPrimitive.Content.displayName;
export { Tabs, TabsList, TabsTrigger, TabsContent };
```
```ui/textarea.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  ...props
}, ref) => {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} ref={ref} {...props} />;
});
Textarea.displayName = "Textarea";
export { Textarea };
```
```ui/toast.tsx
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Viewport ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props} />);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
  variants: {
    variant: {
      default: "border bg-background text-foreground",
      destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>>(({
  className,
  variant,
  ...props
}, ref) => {
  return <ToastPrimitives.Root ref={ref} className={cn(toastVariants({
    variant
  }), className)} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Action ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className)} {...props} />);
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Close ref={ref} className={cn("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className)} toast-close="" {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>);
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold", className)} {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };
```
```ui/toaster.tsx
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
  const {
    toasts
  } = useToast();
  return <ToastProvider>
      {toasts.map(function ({
      id,
      title,
      description,
      action,
      ...props
    }) {
      return <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>;
    })}
      <ToastViewport />
    </ToastProvider>;
}
```
```ui/toggle-group.tsx
import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";
const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default"
});
const ToggleGroup = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>>(({
  className,
  variant,
  size,
  children,
  ...props
}, ref) => <ToggleGroupPrimitive.Root ref={ref} className={cn("flex items-center justify-center gap-1", className)} {...props}>
    <ToggleGroupContext.Provider value={{
    variant,
    size
  }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>);
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>>(({
  className,
  children,
  variant,
  size,
  ...props
}, ref) => {
  const context = React.useContext(ToggleGroupContext);
  return <ToggleGroupPrimitive.Item ref={ref} className={cn(toggleVariants({
    variant: context.variant || variant,
    size: context.size || size
  }), className)} {...props}>
      {children}
    </ToggleGroupPrimitive.Item>;
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
export { ToggleGroup, ToggleGroupItem };
```
```ui/toggle.tsx
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const toggleVariants = cva("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground", {
  variants: {
    variant: {
      default: "bg-transparent",
      outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
    },
    size: {
      default: "h-10 px-3",
      sm: "h-9 px-2.5",
      lg: "h-11 px-5"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>>(({
  className,
  variant,
  size,
  ...props
}, ref) => <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({
  variant,
  size,
  className
}))} {...props} />);
Toggle.displayName = TogglePrimitive.Root.displayName;
export { Toggle, toggleVariants };
```
```ui/tooltip.tsx
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({
  className,
  sideOffset = 4,
  ...props
}, ref) => <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className)} {...props} />);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```
```ui/use-toast.ts
import { useToast, toast } from "@/hooks/use-toast";
export { useToast, toast };
```
```vite-env.d.ts
/// <reference types="vite/client" />
```
```vite.config.ts
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Fast Refresh optimalizáció
      fastRefresh: true,
      // JSX runtime automatikus importálása
      jsxRuntime: 'automatic',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  // Development szerver beállítások
  server: {
    port: 5173,
    open: true, // Automatikusan megnyitja a böngészőt
    host: true, // Hálózati hozzáférés engedélyezése
  },

  // Build optimalizálás
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor csomagok szétválasztása (jobb cache)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'ui-vendor': ['@headlessui/react', 'framer-motion', 'lucide-react'],
        },
      },
    },
    // Chunk size warning limit növelése
    chunkSizeWarningLimit: 1000,
  },

  // Optimalizálás
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      'lucide-react',
      'recharts',
    ],
  },

  // CSS konfiguráció
  css: {
    devSourcemap: true,
  },
})

```
