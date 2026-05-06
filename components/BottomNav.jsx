'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV = [
  { href: '/',          icon: '🏠', label: 'Home' },
  { href: '/projects',  icon: '📋', label: 'Projects' },
  { href: '/earn',      icon: '⚡', label: 'Earn', primary: true },
  { href: '/maya',      icon: '🤖', label: 'Maya' },
  { href: '/stats',     icon: '📊', label: 'Stats' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/8">
      <div className="flex items-end justify-around max-w-[390px] mx-auto px-1 py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {NAV.map(({ href, icon, label, primary }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className="flex-1">
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`flex flex-col items-center gap-0.5 py-1 px-1 rounded-2xl transition-all ${
                  primary
                    ? 'bg-[#00E5FF] text-black mx-0.5 py-2.5'
                    : active
                    ? 'text-[#00E5FF]'
                    : 'text-white/30'
                }`}
              >
                <span className={primary ? 'text-xl' : 'text-lg leading-none'}>{icon}</span>
                <span className={`text-[9px] font-semibold leading-none mt-0.5 ${primary ? 'text-black' : ''}`}>
                  {label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
