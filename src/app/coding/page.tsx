'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Play, Pause, RefreshCw, Check, Code, Zap, GitBranch, Layers, Trophy, ArrowRight, BookOpen } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { QuizLauncher } from '@/components/QuizLauncher'
import { SearchParamSync, type SearchParamsLike } from '@/components/SearchParamSync'
import { CoveredToggle } from '@/components/CoveredToggle'
import { useProgressStore, useCoveredCount } from '@/store/progressStore'
import { codingQuestions } from '@/data/quizzes/coding'
import {
  patterns,
  dataStructures,
  complexityReference,
  COMPLEXITY_N,
  jsConcepts,
  tsConcepts,
  reactConcepts,
  codingItemIds,
  ALGOS,
  type Algo,
  type Pattern,
  type DS,
} from '@/data/tracks/coding'

// ── Types ────────────────────────────────────────────────────────────────────
type SortStep = { array: number[]; comparing: number[]; sorted: number[]; swapped: boolean }

// ── Sorting algorithm step generators ───────────────────────────────────────
function bubbleSortSteps(arr: number[]): SortStep[] {
  const a = [...arr]; const steps: SortStep[] = []
  const sorted: number[] = []
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      steps.push({ array: [...a], comparing: [j, j + 1], sorted: [...sorted], swapped: false })
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; steps.push({ array: [...a], comparing: [j, j + 1], sorted: [...sorted], swapped: true }) }
    }
    sorted.push(a.length - 1 - i)
  }
  sorted.push(0)
  steps.push({ array: [...a], comparing: [], sorted: [...sorted], swapped: false })
  return steps
}

function selectionSortSteps(arr: number[]): SortStep[] {
  const a = [...arr]; const steps: SortStep[] = []
  const sorted: number[] = []
  for (let i = 0; i < a.length - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ array: [...a], comparing: [minIdx, j], sorted: [...sorted], swapped: false })
      if (a[j] < a[minIdx]) minIdx = j
    }
    if (minIdx !== i) { [a[i], a[minIdx]] = [a[minIdx], a[i]]; steps.push({ array: [...a], comparing: [i, minIdx], sorted: [...sorted], swapped: true }) }
    sorted.push(i)
  }
  sorted.push(a.length - 1)
  steps.push({ array: [...a], comparing: [], sorted: [...sorted], swapped: false })
  return steps
}

function insertionSortSteps(arr: number[]): SortStep[] {
  const a = [...arr]; const steps: SortStep[] = []
  const sorted: number[] = [0]
  for (let i = 1; i < a.length; i++) {
    let j = i
    while (j > 0) {
      steps.push({ array: [...a], comparing: [j - 1, j], sorted: [...sorted], swapped: false })
      if (a[j] < a[j - 1]) { [a[j], a[j - 1]] = [a[j - 1], a[j]]; steps.push({ array: [...a], comparing: [j - 1, j], sorted: [...sorted], swapped: true }); j-- }
      else break
    }
    sorted.push(i)
  }
  steps.push({ array: [...a], comparing: [], sorted: [...sorted], swapped: false })
  return steps
}

// Fixed seed so server and client render the same bars on first paint. A
// hydration mismatch shows up as "Text content did not match" the moment
// this comes from Math.random() at module or state-initializer time.
const BASE_ARRAY = [42, 78, 19, 63, 91, 27, 54, 8, 71, 35, 96, 14, 59, 82, 23, 47]

// ── Component ────────────────────────────────────────────────────────────────
type MainTab = 'visualizer' | 'patterns' | 'complexity' | 'datastructs' | 'challenges' | 'frontend'

const algorithmSearchIds: Record<Algo, string> = {
  'Bubble Sort': 'bubble-sort',
  'Insertion Sort': 'insertion-sort',
  'Selection Sort': 'selection-sort',
}

function getAlgorithmSearchId(algo: Algo): string {
  return algorithmSearchIds[algo]
}

function getAlgorithmFromSearchId(searchId: string): Algo | null {
  return ALGOS.find((algo) => getAlgorithmSearchId(algo) === searchId) ?? null
}

function isMainTab(value: string | null): value is MainTab {
  return value === 'visualizer' || value === 'patterns' || value === 'complexity' || value === 'datastructs' || value === 'challenges' || value === 'frontend'
}

const mainTabs = [
  ['visualizer', Zap, 'Algorithm visualizer'],
  ['patterns', GitBranch, 'DSA patterns'],
  ['complexity', Layers, 'Big O reference'],
  ['datastructs', BookOpen, 'Data structures'],
  ['challenges', Trophy, 'Challenges'],
  ['frontend', Code, 'JS / TS / React'],
] as const

export default function CodingPage() {
  const [mainTab, setMainTab] = useState<MainTab>('visualizer')
  const [algo, setAlgo] = useState<Algo>('Bubble Sort')
  const [steps, setSteps] = useState<SortStep[]>([])
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(120)
  const [selectedPattern, setSelectedPattern] = useState<Pattern>(patterns[0])
  const [selectedDS, setSelectedDS] = useState<DS>(dataStructures[0])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reduceMotion = useReducedMotion()

  const covered = useCoveredCount('coding', codingItemIds)
  const coveredIds = useProgressStore((s) => s.covered['coding'] ?? [])

  const generateSteps = useCallback((a: Algo, arr: number[]) => {
    if (a === 'Bubble Sort') return bubbleSortSteps(arr)
    if (a === 'Selection Sort') return selectionSortSteps(arr)
    return insertionSortSteps(arr)
  }, [])

  const syncSearchParams = useCallback((searchParams: SearchParamsLike) => {
    const tabParam = searchParams.get('tab')
    if (isMainTab(tabParam)) {
      setMainTab(tabParam)
    }

    const algorithmParam = searchParams.get('algorithm')
    if (algorithmParam) {
      const nextAlgo = getAlgorithmFromSearchId(algorithmParam)
      if (nextAlgo) {
        setMainTab('visualizer')
        setAlgo(nextAlgo)
      }
    }

    const patternParam = searchParams.get('pattern')
    if (patternParam) {
      const nextPattern = patterns.find((pattern) => pattern.id === patternParam)
      if (nextPattern) {
        setMainTab('patterns')
        setSelectedPattern(nextPattern)
      }
    }

    const dsParam = searchParams.get('ds')
    if (dsParam) {
      const nextDataStructure = dataStructures.find((ds) => ds.id === dsParam)
      if (nextDataStructure) {
        setMainTab('datastructs')
        setSelectedDS(nextDataStructure)
      }
    }
  }, [])

  useEffect(() => {
    const s = generateSteps(algo, BASE_ARRAY)
    setSteps(s)
    setStepIdx(0)
    setPlaying(false)
  }, [algo, generateSteps])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStepIdx(prev => {
          if (prev >= steps.length - 1) { setPlaying(false); return prev }
          return prev + 1
        })
      }, speed)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, steps.length, speed])

  const currentStep = steps[stepIdx] ?? { array: BASE_ARRAY, comparing: [], sorted: [], swapped: false }
  const maxVal = Math.max(...currentStep.array)

  const reset = () => { setStepIdx(0); setPlaying(false) }

  const barColor = (i: number) => {
    if (currentStep.sorted.includes(i)) return 'bg-moss-500'
    if (currentStep.comparing.includes(i)) return currentStep.swapped ? 'bg-rust-500' : 'bg-amber-400'
    return 'bg-teal-500'
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <SearchParamSync onChange={syncSearchParams} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-ink-200 pb-8 dark:border-ink-800">
          <h1 className="text-4xl text-ink-900 dark:text-ink-50">Coding interview prep, in order</h1>
          <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-700 dark:text-ink-200">
            An interactive visualizer, ten essential patterns, and a Big O reference.
          </p>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
            <span className="font-mono tabular-nums">{covered}/{codingItemIds.length}</span> covered
          </p>
        </div>

        <QuizLauncher sectionId="coding" title="Coding" questions={codingQuestions} />

        {/* Main Tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto scrollbar-hide rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-800 dark:bg-ink-900" role="tablist">
          {mainTabs.map(([t, Icon, label]) => (
            <button
              key={t}
              role="tab"
              aria-selected={mainTab === t}
              onClick={() => setMainTab(t)}
              className={clsx(
                'flex min-h-[44px] flex-none shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out sm:flex-1',
                mainTab === t
                  ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-ink-50'
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Sorting Visualizer ── */}
          {mainTab === 'visualizer' && (
            <motion.div key="vis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              id="sorting-algorithms">
              <div className="surface-card p-6">
                {/* Algorithm selector */}
                <div className="mb-6 flex flex-wrap gap-3">
                  {ALGOS.map(a => (
                    <button key={a} onClick={() => setAlgo(a)}
                      className={clsx(
                        'min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out',
                        algo === a
                          ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950'
                          : 'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700'
                      )}>
                      {a}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-ink-700 dark:text-ink-200">
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-teal-500" />Unsorted</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-400" />Comparing</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-rust-500" />Swapping</span>
                  <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-moss-500" />Sorted</span>
                </div>

                {/* Bars */}
                <div className="surface-sunken flex h-48 items-end gap-1 p-4">
                  {currentStep.array.map((val, i) => (
                    <motion.div key={i} className={clsx('flex-1 rounded-t transition-colors duration-150', barColor(i))}
                      animate={{ height: `${(val / maxVal) * 100}%` }} transition={{ duration: reduceMotion ? 0 : 0.15 }}>
                      {currentStep.array.length <= 20 && (
                        <span className="flex justify-center pt-0.5 font-mono text-[10px] font-semibold text-ink-950">{val}</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs text-ink-600 dark:text-ink-300">
                    <span>Step {stepIdx + 1} / {steps.length}</span>
                    <span>{Math.round((stepIdx / Math.max(steps.length - 1, 1)) * 100)}% complete</span>
                  </div>
                  <div className="h-2 w-full rounded-lg bg-ink-100 dark:bg-ink-800">
                    <motion.div className="h-2 rounded-lg bg-clay-600 dark:bg-clay-500"
                      animate={{ width: `${(stepIdx / Math.max(steps.length - 1, 1)) * 100}%` }} transition={{ duration: reduceMotion ? 0 : 0.2 }} />
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button onClick={reset} aria-label="Reset" className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-100 text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} disabled={stepIdx === 0}
                    className="min-h-[44px] rounded-lg bg-ink-100 px-3 text-sm text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-200 disabled:opacity-40 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700">
                    Previous step
                  </button>
                  <button onClick={() => setPlaying(p => !p)}
                    className="btn-primary">
                    {playing ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Play</>}
                  </button>
                  <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))} disabled={stepIdx >= steps.length - 1}
                    className="min-h-[44px] rounded-lg bg-ink-100 px-3 text-sm text-ink-700 transition-colors duration-150 ease-out hover:bg-ink-200 disabled:opacity-40 dark:bg-ink-800 dark:text-ink-200 dark:hover:bg-ink-700">
                    Next step
                  </button>
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    <span className="text-ink-600 dark:text-ink-300">Speed</span>
                    {[300, 150, 80, 30].map(s => (
                      <button key={s} onClick={() => setSpeed(s)}
                        className={clsx(
                          'min-h-[44px] rounded-lg px-2 text-xs transition-colors duration-150 ease-out',
                          speed === s ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'bg-ink-100 text-ink-700 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-200'
                        )}>
                        {s === 300 ? '0.5x' : s === 150 ? '1x' : s === 80 ? '2x' : '4x'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info cards */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', note: 'Simple and stable. A good teaching tool, but bad in practice.' },
                    { label: 'Selection Sort', time: 'O(n²)', space: 'O(1)', note: 'Minimizes swaps. Not stable. Slightly better than bubble sort.' },
                    { label: 'Insertion Sort', time: 'O(n²) worst, O(n) best', space: 'O(1)', note: 'Excellent for nearly-sorted data. Used inside Timsort.' },
                  ].map(info => (
                    <div
                      key={info.label}
                      className={clsx('surface-sunken p-4', algo === info.label && 'border border-clay-300 dark:border-clay-700')}
                      id={getAlgorithmSearchId(info.label as Algo)}
                    >
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{info.label}</p>
                      <p className="mt-1 text-xs text-ink-600 dark:text-ink-300">Time: {info.time}</p>
                      <p className="text-xs text-ink-600 dark:text-ink-300">Space: {info.space}</p>
                      <p className="mt-2 text-xs text-ink-700 dark:text-ink-200">{info.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── DSA Patterns ── */}
          {mainTab === 'patterns' && (
            <motion.div key="patterns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Pattern list */}
                <div className="space-y-2">
                  {patterns.map(p => {
                    const isCovered = coveredIds.includes(p.id)
                    return (
                      <button key={p.id} onClick={() => setSelectedPattern(p)}
                        className={clsx(
                          'card-hover w-full min-h-[44px] rounded-xl px-4 py-3 text-left transition-colors duration-150 ease-out',
                          selectedPattern.id === p.id ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'surface-card text-ink-700 dark:text-ink-200'
                        )}
                        id={`${p.id}-pattern`}>
                        <span className="flex items-center gap-1.5">
                          <span className="font-semibold">{p.name}</span>
                          {isCovered && <Check className="h-4 w-4 text-moss-600 dark:text-moss-400" aria-label="Covered" />}
                        </span>
                        <p className={clsx('mt-0.5 text-xs', selectedPattern.id === p.id ? 'text-clay-100 dark:text-ink-900' : 'text-ink-600 dark:text-ink-300')}>{p.complexity}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Pattern detail */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={selectedPattern.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="surface-card p-6"
                      id={selectedPattern.id}>
                      <h2 className="mb-1 text-2xl text-ink-900 dark:text-ink-50">{selectedPattern.name}</h2>
                      <p className="mb-4 text-sm font-medium text-clay-700 dark:text-clay-400">{selectedPattern.complexity}</p>

                      <div className="mb-4 surface-sunken p-4">
                        <h3 className="mb-1 text-sm font-semibold text-ink-600 dark:text-ink-300">When to use</h3>
                        <p className="text-sm text-ink-800 dark:text-ink-100">{selectedPattern.when}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">Code template</h3>
                        <pre className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 p-4 font-mono text-[13px] leading-[1.6] text-ink-100">
                          <code>{selectedPattern.template}</code>
                        </pre>
                      </div>

                      <div className="surface-sunken mb-4 p-4">
                        <h3 className="mb-1 text-sm font-semibold text-ink-600 dark:text-ink-300">What the manager loop listens for</h3>
                        <p className="text-sm leading-relaxed text-ink-800 dark:text-ink-100">{selectedPattern.managerAngle}</p>
                      </div>

                      <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
                        <h3 className="mb-1 text-sm font-semibold text-teal-700 dark:text-teal-400">Classic examples</h3>
                        <p className="text-sm text-teal-900 dark:text-teal-200">{selectedPattern.example}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">Practice problems</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.problems.map(prob => (
                            <span key={prob} className="chip">{prob}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <CoveredToggle track="coding" itemId={selectedPattern.id} />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Big O Reference ── */}
          {mainTab === 'complexity' && (
            <motion.div key="complexity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              id="big-o">
              <div className="surface-card p-6">
                <h2 className="mb-6 text-2xl text-ink-900 dark:text-ink-50">Big O complexity reference</h2>

                {/* Visual scale */}
                <div className="mb-8">
                  <h3 className="mb-3 text-sm font-semibold text-ink-600 dark:text-ink-300">
                    Log scale, operations for n = {COMPLEXITY_N.toLocaleString('en-US')}
                  </h3>
                  <div className="space-y-3">
                    {complexityReference.map(c => (
                      <div key={c.notation} className="flex items-center gap-3">
                        <span className="w-24 text-right font-mono text-sm font-bold text-ink-700 dark:text-ink-200">{c.notation}</span>
                        <div className="h-6 flex-1 overflow-hidden rounded-lg bg-ink-100 dark:bg-ink-800">
                          <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${c.barWidth}%` }}
                            transition={{ duration: reduceMotion ? 0 : 0.3 }}
                            className={clsx('flex h-6 items-center justify-between gap-2 rounded-lg px-3', c.color)}>
                            <span className="whitespace-nowrap text-xs font-medium text-white">{c.name}</span>
                            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-white">{c.operationsLabel}</span>
                          </motion.div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink-600 dark:text-ink-300">
                    Each bar is log10 of the operation count, so equal bar length means an equal number of digits. O(2
                    <sup>n</sup>) and O(n!) at this n are larger than the number of atoms in the observable universe, so they
                    are drawn full width and labelled instead of scaled.
                  </p>
                </div>

                {/* Data structure complexity table */}
                <h3 className="mb-4 text-lg font-semibold text-ink-900 dark:text-ink-50">Data structure operations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="rule border-b">
                        <th className="py-2 text-left font-semibold text-ink-700 dark:text-ink-200">Structure</th>
                        <th className="py-2 text-center font-semibold text-ink-700 dark:text-ink-200">Access</th>
                        <th className="py-2 text-center font-semibold text-ink-700 dark:text-ink-200">Search</th>
                        <th className="py-2 text-center font-semibold text-ink-700 dark:text-ink-200">Insert</th>
                        <th className="py-2 text-center font-semibold text-ink-700 dark:text-ink-200">Delete</th>
                        <th className="py-2 text-center font-semibold text-ink-700 dark:text-ink-200">Space</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                      {[
                        { name: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', del: 'O(n)', space: 'O(n)' },
                        { name: 'Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)\u2020', del: 'O(1)\u2020', space: 'O(n)' },
                        { name: 'Hash Table', access: 'N/A', search: 'O(1)*', insert: 'O(1)*', del: 'O(1)*', space: 'O(n)' },
                        { name: 'Binary Search Tree', access: 'O(log n)*', search: 'O(log n)*', insert: 'O(log n)*', del: 'O(log n)*', space: 'O(n)' },
                        { name: 'Heap (Binary)', access: 'N/A', search: 'O(n)', insert: 'O(log n)', del: 'O(log n)', space: 'O(n)' },
                        { name: 'Stack / Queue', access: 'O(n)', search: 'O(n)', insert: 'O(1)', del: 'O(1)', space: 'O(n)' },
                        { name: 'Trie', access: 'O(k)', search: 'O(k)', insert: 'O(k)', del: 'O(k)', space: 'O(n·k)' },
                      ].map(row => (
                        <tr key={row.name}>
                          <td className="py-2.5 font-medium text-ink-900 dark:text-ink-50">{row.name}</td>
                          {[row.access, row.search, row.insert, row.del, row.space].map((val, j) => (
                            <td key={j} className={clsx(
                              'py-2.5 text-center font-mono text-xs',
                              val.includes('1)') ? 'font-bold text-moss-600 dark:text-moss-400' : val.includes('log') ? 'text-amber-600 dark:text-amber-400' : val.startsWith('O(n') ? 'text-rust-500' : 'text-ink-600 dark:text-ink-300'
                            )}>{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-ink-600 dark:text-ink-300">* Average case</p>
                  <p className="text-xs text-ink-600 dark:text-ink-300">
                    &#8224; Insert at the head, and delete given a reference to the node. If you still have to walk the list to
                    find the position, both become O(n).
                  </p>
                </div>

                {/* Quick tips */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-moss-200 bg-moss-50 p-4 dark:border-moss-900 dark:bg-moss-950/40">
                    <h4 className="mb-2 text-sm font-semibold text-moss-800 dark:text-moss-300">Signs of a good solution</h4>
                    <ul className="space-y-1 text-sm text-moss-700 dark:text-moss-400">
                      <li>Uses a hash map to reduce nested loops to O(n)</li>
                      <li>Recognizes sorted data as a binary search opportunity</li>
                      <li>Swaps recursion for iteration with an explicit stack</li>
                      <li>Identifies overlapping subproblems and reaches for DP</li>
                      <li>Uses two pointers on sorted arrays instead of O(n²)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-rust-200 bg-rust-50 p-4 dark:border-rust-900 dark:bg-rust-950/40">
                    <h4 className="mb-2 text-sm font-semibold text-rust-800 dark:text-rust-300">Common interview mistakes</h4>
                    <ul className="space-y-1 text-sm text-rust-700 dark:text-rust-400">
                      <li>Jumping to code before clarifying constraints</li>
                      <li>Not considering edge cases: empty, single element, negatives</li>
                      <li>Missing the O(n log n) versus O(n²) opportunity</li>
                      <li>Not explaining trade-offs when asked for optimization</li>
                      <li>Confusing worst-case with average-case complexity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Data Structures ── */}
          {mainTab === 'datastructs' && (
            <motion.div key="datastructs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: DS list grouped by category */}
                <div className="space-y-5">
                  {(['Linear', 'Hash-Based', 'Tree', 'Graph'] as const).map(cat => (
                    <div key={cat}>
                      <h3 className="mb-2 px-1 text-sm font-semibold text-ink-600 dark:text-ink-300">{cat}</h3>
                      <div className="space-y-1">
                        {dataStructures.filter(ds => ds.category === cat).map(ds => {
                          const isCovered = coveredIds.includes(ds.id)
                          return (
                            <button key={ds.id} onClick={() => setSelectedDS(ds)}
                              className={clsx(
                                'card-hover w-full min-h-[44px] rounded-xl px-4 py-3 text-left transition-colors duration-150 ease-out',
                                selectedDS.id === ds.id ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'surface-card text-ink-700 dark:text-ink-200'
                              )}
                              id={`${ds.id}-ds`}>
                              <span className="flex items-center gap-1.5 text-sm font-semibold">
                                {ds.name}
                                {isCovered && <Check className="h-4 w-4 text-moss-600 dark:text-moss-400" aria-label="Covered" />}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Detail panel */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    <motion.div key={selectedDS.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="surface-card p-6"
                      id={selectedDS.id}>

                      <h2 className="mb-3 text-2xl text-ink-900 dark:text-ink-50">{selectedDS.name}</h2>

                      {/* Description */}
                      <div className="mb-4 surface-sunken p-4">
                        <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{selectedDS.description}</p>
                      </div>

                      {/* Operations Table */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">Operations</h3>
                        <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-ink-200 bg-ink-50 dark:border-ink-800 dark:bg-ink-900">
                                <th className="py-2 pl-4 text-left text-xs font-semibold text-ink-600 dark:text-ink-300">Operation</th>
                                <th className="py-2 text-center text-xs font-semibold text-ink-600 dark:text-ink-300">Average</th>
                                <th className="py-2 pr-4 text-center text-xs font-semibold text-ink-600 dark:text-ink-300">Worst</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                              {selectedDS.ops.map((row, i) => (
                                <tr key={i}>
                                  <td className="py-2 pl-4 text-sm text-ink-800 dark:text-ink-100">{row.op}</td>
                                  <td className={clsx('py-2 text-center font-mono text-xs font-bold', row.avg.includes('(1)') ? 'text-moss-600 dark:text-moss-400' : row.avg.includes('log') ? 'text-amber-600 dark:text-amber-400' : 'text-rust-500')}>{row.avg}</td>
                                  <td className={clsx('py-2 pr-4 text-center font-mono text-xs', row.worst.includes('(1)') ? 'text-moss-600 dark:text-moss-400' : row.worst.includes('log') ? 'text-amber-600 dark:text-amber-400' : 'text-rust-500')}>{row.worst}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Code Template */}
                      <div className="mb-4">
                        <h3 className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">Code template</h3>
                        <pre className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 p-4 font-mono text-[13px] leading-[1.6] text-ink-100">
                          <code>{selectedDS.template}</code>
                        </pre>
                      </div>

                      {/* Use When + Interview Note */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                          <h3 className="mb-1 text-sm font-semibold text-amber-700 dark:text-amber-400">Use when</h3>
                          <p className="text-sm text-amber-900 dark:text-amber-200">{selectedDS.useWhen}</p>
                        </div>
                        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/40">
                          <h3 className="mb-1 text-sm font-semibold text-teal-700 dark:text-teal-400">Interview insight</h3>
                          <p className="text-sm text-teal-900 dark:text-teal-200">{selectedDS.interviewNote}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <CoveredToggle track="coding" itemId={selectedDS.id} />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Challenges Tab ── */}
          {mainTab === 'challenges' && (
            <motion.div key="challenges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              {/* Hero */}
              <div className="surface-card mb-6 p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-ink-900 dark:text-ink-50">16 curated TypeScript challenges</h2>
                    <p className="mt-1 text-ink-700 dark:text-ink-200">Full solutions, step-by-step Q&A, time and space complexity, common mistakes.</p>
                  </div>
                </div>
              </div>

              {/* Why SDMs need to code */}
              <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-6 dark:border-teal-900 dark:bg-teal-950/40">
                <h3 className="mb-3 text-sm font-semibold text-teal-700 dark:text-teal-400">Why FAANG asks SDMs and EMs to code</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Validates you can have credible technical conversations with your team',
                    'Demonstrates you understand what you are asking engineers to build',
                    'Shows you can break down problems, a core leadership skill',
                    'Typically one to two rounds at easy-medium difficulty, not IC-level hard',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-teal-900 dark:text-teal-200">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty cards */}
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Easy', count: 5, tone: 'moss', problems: ['Two Sum', 'Valid Parentheses', 'Max Subarray', 'Buy/Sell Stock', 'Climbing Stairs'] },
                  { label: 'Medium', count: 7, tone: 'amber', problems: ['Longest Substring', '3Sum', 'Coin Change', 'Number of Islands', 'LRU Cache', '+2 more'] },
                  { label: 'Hard', count: 4, tone: 'rust', problems: ['Trapping Rain Water', 'Merge K Sorted Lists', 'Min Window Substring', 'Word Ladder'] },
                ].map(card => (
                  <div key={card.label} className="surface-card p-5">
                    <div className={clsx(
                      'mb-3 inline-block rounded-lg px-3 py-1 text-sm font-semibold text-white',
                      card.tone === 'moss' && 'bg-moss-600',
                      card.tone === 'amber' && 'bg-amber-600',
                      card.tone === 'rust' && 'bg-rust-600'
                    )}>
                      {card.label}: {card.count} problems
                    </div>
                    <ul className="mb-4 space-y-1">
                      {card.problems.map((p, i) => (
                        <li key={i} className="text-xs text-ink-600 dark:text-ink-300">{p}</li>
                      ))}
                    </ul>
                    <Link href="/coding/challenges" className="btn-secondary w-full justify-center">
                      Practice {card.label.toLowerCase()}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Top patterns */}
              <div className="surface-card p-6">
                <h3 className="mb-4 text-sm font-semibold text-ink-600 dark:text-ink-300">Top patterns asked at FAANG (SDM level)</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'HashMap / Set', freq: 'Very high', desc: 'Two Sum, Group Anagrams, LRU Cache: O(1) lookup is always the goal.' },
                    { name: 'Sliding Window', freq: 'High', desc: 'Subarray and substring problems: the classic expand right, shrink left.' },
                    { name: 'Two Pointers', freq: 'High', desc: 'Sorted arrays and pair problems: eliminates nested loops.' },
                    { name: 'BFS / DFS', freq: 'High', desc: 'Graph traversal, trees, Number of Islands, Word Ladder.' },
                    { name: 'Dynamic Programming', freq: 'Medium', desc: 'Coin Change, Climbing Stairs: recognize overlapping subproblems.' },
                    { name: 'Monotonic Stack', freq: 'Medium', desc: 'Next greater element, histograms, temperature problems.' },
                  ].map(p => (
                    <div key={p.name} className="surface-sunken flex items-start gap-3 p-4">
                      <span className={clsx(
                        'chip shrink-0',
                        p.freq === 'Very high' && 'border-rust-300 bg-rust-50 text-rust-800 dark:border-rust-800 dark:bg-rust-950/50 dark:text-rust-200'
                      )}>
                        {p.freq}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{p.name}</p>
                        <p className="text-xs text-ink-600 dark:text-ink-300">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href="/coding/challenges" className="btn-primary">
                    <Trophy className="h-4 w-4" />
                    Open all 16 challenges
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Frontend JS/TS/React ── */}
          {mainTab === 'frontend' && (
            <motion.div key="frontend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <div className="surface-card p-6">
                <h2 className="mb-2 text-2xl text-ink-900 dark:text-ink-50">Frontend interview: JS, TypeScript, React</h2>
                <p className="mb-6 text-ink-700 dark:text-ink-200">Core frontend concepts frequently tested in FAANG interviews for full-stack and frontend-leaning roles.</p>

                <div className="mb-8">
                  <h3 className="mb-4 text-sm font-semibold text-ink-600 dark:text-ink-300">JavaScript core concepts</h3>
                  <div className="space-y-4">
                    {jsConcepts.map(item => (
                      <div key={item.id} id={item.id} className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800">
                        <div className="flex items-center gap-3 bg-ink-50 p-4 dark:bg-ink-900">
                          <h4 className="font-semibold text-ink-900 dark:text-ink-50">{item.title}</h4>
                          <span className="chip">{item.tag}</span>
                        </div>
                        <div className="p-4">
                          <p className="mb-3 text-sm text-ink-700 dark:text-ink-200">{item.explanation}</p>
                          <pre className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 p-4 font-mono text-[13px] leading-[1.6] text-ink-100">
                            <code>{item.code}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="mb-4 text-sm font-semibold text-ink-600 dark:text-ink-300">TypeScript key concepts</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {tsConcepts.map(item => (
                      <div key={item.id} id={item.id} className="surface-sunken p-4">
                        <h4 className="mb-2 text-sm font-semibold text-ink-900 dark:text-ink-50">{item.title}</h4>
                        <pre className="mb-2 overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 p-3 font-mono text-[13px] leading-[1.6] text-ink-100">
                          <code>{item.code}</code>
                        </pre>
                        <p className="text-xs text-ink-600 dark:text-ink-300">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-ink-600 dark:text-ink-300">React and Next.js core concepts</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {reactConcepts.map(item => (
                      <div key={item.id} id={item.id} className="surface-sunken p-4">
                        <h4 className="mb-2 text-sm font-semibold text-ink-900 dark:text-ink-50">{item.title}</h4>
                        <pre className="mb-2 overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 p-3 font-mono text-[13px] leading-[1.6] text-ink-100">
                          <code>{item.code}</code>
                        </pre>
                        <p className="text-xs text-ink-600 dark:text-ink-300">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
