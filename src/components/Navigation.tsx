'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Menu, X, Moon, Sun, Home, BookOpen, Code, Users, Layers, Target, Brain, Search, CalendarDays } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { DonateButton } from '@/components/DonateButton'
import { Mark } from '@/components/brand/Mark'
import { SearchModal } from '@/components/SearchModal'
import { useSearch } from '@/hooks/useSearch'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Behavioral', href: '/behavioral', icon: BookOpen },
  { name: 'System Design', href: '/system-design', icon: Layers },
  { name: 'Coding', href: '/coding', icon: Code },
  { name: 'Leadership', href: '/technical-leadership', icon: Target },
  { name: 'Team', href: '/team-management', icon: Users },
  { name: 'AI Prep', href: '/ai-interview', icon: Brain },
  { name: 'Plan', href: '/roadmap', icon: CalendarDays },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const openedAt = useRef(0)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { isSearchOpen, openSearch, closeSearch } = useSearch()
  const reduceMotion = useReducedMotion()

  const handleMenuToggle = () => {
    if (!isOpen) openedAt.current = Date.now()
    setIsOpen(prev => !prev)
  }

  const handleBackdropClose = () => {
    // Guard against the iOS ghost-click that fires 300ms after the hamburger tap
    if (Date.now() - openedAt.current > 350) setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-ink-200 bg-ink-50/95 backdrop-blur-[2px] dark:border-ink-800 dark:bg-ink-900/95">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex min-h-[44px] items-center gap-2">
              <Mark size={28} className="shrink-0" />
              <span className="flex items-baseline gap-[0.2em] text-lg font-semibold leading-none tracking-tight text-ink-900 dark:text-ink-50">
                <span>Loop</span>
                <span className="font-display font-semibold italic leading-none tracking-[-0.02em] text-clay-700 dark:text-clay-400">Ready</span>
              </span>
            </Link>

            {/* Desktop Navigation - Scrollable */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150 ease-out
                        ${isActive
                          ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950'
                          : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="hidden xl:inline">{item.name}</span>
                      <span className="xl:hidden">{item.name.split(' ')[0]}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={openSearch}
              className="hidden min-h-[44px] items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-600 transition-colors duration-150 ease-out hover:border-ink-300 hover:text-ink-800 dark:border-ink-800 dark:bg-ink-950/50 dark:text-ink-300 dark:hover:text-ink-100 sm:flex"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="chip hidden font-mono lg:flex">
                <span>⌘</span>K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Donate Button */}
            <DonateButton className="hidden sm:inline-flex" />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={handleMenuToggle}
              aria-label="Toggle navigation menu"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 lg:hidden"
              style={{ touchAction: 'manipulation' }}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClose}
              className="fixed inset-0 z-30 touch-none bg-ink-950/20 md:hidden"
            />
            {/* Menu */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div
                className="flex w-full flex-col overflow-y-auto bg-white pt-16 dark:bg-ink-900"
                style={{ minHeight: '100dvh', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
              >
              {/* Mobile menu header */}
              <div className="flex items-center justify-between border-b border-ink-200 px-4 py-4 dark:border-ink-800">
                <span className="text-lg font-semibold text-ink-900 dark:text-ink-50">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search button in mobile menu */}
              <div className="border-b border-ink-200 px-4 py-3 dark:border-ink-800">
                <button
                  onClick={() => { setIsOpen(false); openSearch(); }}
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-lg bg-ink-100 px-4 py-3 text-left text-ink-600 transition-colors duration-150 ease-out hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
                >
                  <Search className="h-5 w-5" />
                  <span className="text-base font-medium">Search</span>
                </button>
              </div>

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex min-h-[44px] items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-150 ease-out ${
                          isActive
                            ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950'
                            : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Footer actions */}
              <div className="border-t border-ink-200 px-4 py-4 dark:border-ink-800">
                <DonateButton className="w-full justify-center" />
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={closeSearch} />
    </nav>
  )
}