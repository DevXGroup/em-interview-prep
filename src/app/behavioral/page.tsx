'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ChevronDown, ChevronUp, Star, Building, Search,
  Eye, EyeOff, Lightbulb, AlertTriangle, CheckCircle,
  Target, Brain, MessageSquare, Filter, BookOpen, Award, X, Check,
} from 'lucide-react'
import { QuizLauncher } from '@/components/QuizLauncher'
import { PriorityBadge } from '@/components/PriorityBadge'
import { PriorityFilter } from '@/components/PriorityFilter'
import { SearchParamSync, type SearchParamsLike } from '@/components/SearchParamSync'
import { CoveredToggle } from '@/components/CoveredToggle'
import { useIsCovered, useCoveredCount } from '@/store/progressStore'
import { behavioralQuestions as quizQuestions } from '@/data/quizzes/behavioral'
import type { Priority } from '@/data/quizzes/types'
import {
  companies, questions, questionPriorities, behavioralItemIds,
  CATEGORIES, DIFFICULTIES, COMPANY_NAMES,
} from '@/data/tracks/behavioral'

const difficultyColor = {
  Starter: 'bg-moss-100 text-moss-700 dark:bg-moss-900/30 dark:text-moss-400',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Advanced: 'bg-rust-100 text-rust-700 dark:bg-rust-900/30 dark:text-rust-400',
}

const TIER_ORDER = [
  ['weak', 'Weak', 'text-rust-700 dark:text-rust-400'],
  ['borderline', 'Borderline', 'text-amber-700 dark:text-amber-400'],
  ['strong', 'Strong', 'text-moss-700 dark:text-moss-400'],
] as const satisfies readonly (readonly ['weak' | 'borderline' | 'strong', string, string])[]

type Tab = 'principles' | 'questions' | 'practice'

export default function BehavioralPage() {
  const [tab, setTab] = useState<Tab>('principles')
  const [selectedCompany, setSelectedCompany] = useState(companies[0])
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [practiceVisible, setPracticeVisible] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [companyFilter, setCompanyFilter] = useState('All')
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all')
  const reduceMotion = useReducedMotion()

  const covered = useCoveredCount('behavioral', behavioralItemIds)

  const syncSearchParams = useCallback((searchParams: SearchParamsLike) => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'principles' || tabParam === 'questions' || tabParam === 'practice') {
      setTab(tabParam)
    }

    const companyParam = searchParams.get('company')
    if (companyParam) {
      const company = companies.find((candidate) => candidate.name.toLowerCase() === companyParam)
      if (company) {
        setSelectedCompany(company)
      }
    }

    if (tabParam === 'questions') {
      const hash = window.location.hash
      if (hash.startsWith('#question-')) {
        setExpandedQuestion(hash.replace('#question-', ''))
      }
    }
  }, [])

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.question.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'All' || q.categories.includes(categoryFilter)
      const matchDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter
      const matchCompany = companyFilter === 'All' || q.companies.includes(companyFilter)
      const matchPriority = priorityFilter === 'all' || questionPriorities[q.id] === priorityFilter
      return matchSearch && matchCategory && matchDifficulty && matchCompany && matchPriority
    })
  }, [search, categoryFilter, difficultyFilter, companyFilter, priorityFilter])

  const togglePracticeVisible = (id: string) => {
    setPracticeVisible(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <SearchParamSync onChange={syncSearchParams} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 border-b border-ink-200 pb-8 dark:border-ink-800">
          <h1 className="text-4xl text-ink-900 dark:text-ink-50">Behavioral interview prep, in order</h1>
          <p className="mt-3 max-w-prose text-lg leading-relaxed text-ink-700 dark:text-ink-200">Company leadership frameworks, {questions.length} full STAR answers with weak, borderline and strong versions of each, and practice mode.</p>
          <p className="mt-3 text-sm text-ink-600 dark:text-ink-300">
            <span className="font-mono tabular-nums">{covered}/{behavioralItemIds.length}</span> covered
          </p>
        </div>

        <QuizLauncher sectionId="behavioral" title="Behavioral" questions={quizQuestions} />

        {/* Tabs */}
        <div
          className="mb-8 flex gap-1 overflow-x-auto scrollbar-hide rounded-xl border border-ink-200 bg-white p-1 dark:border-ink-800 dark:bg-ink-900"
          role="tablist"
        >
          {([['principles', BookOpen, 'Company principles'], ['questions', Star, 'STAR questions'], ['practice', Brain, 'Practice mode']] as const).map(([t, Icon, label]) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`flex min-h-[44px] flex-none shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium sm:flex-1 transition-colors duration-150 ease-out ${tab === t ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Company Principles Tab ── */}
          {tab === 'principles' && (
            <motion.div key="principles" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <div className="mb-6 flex flex-wrap gap-3">
                {companies.map(c => (
                  <button key={c.name} onClick={() => setSelectedCompany(c)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ease-out ${selectedCompany.name === c.name ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'bg-white text-ink-700 card-hover dark:bg-ink-900 dark:text-ink-200'}`}>
                    <Building className="h-4 w-4" />
                    {c.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={selectedCompany.name} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="surface-card p-6"
                  id={`${selectedCompany.name.toLowerCase()}-principles`}>
                  <h2 className="text-2xl text-ink-900 dark:text-ink-50">{selectedCompany.name} {(selectedCompany.principlesLabel ?? 'Leadership principles').toLowerCase()}</h2>
                  <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{selectedCompany.principles.length} entries, {selectedCompany.topQuestions.length} top questions</p>
                  <p className="mt-4 max-w-prose border-l-2 border-clay-300 pl-3 text-sm leading-relaxed text-ink-700 dark:border-clay-700 dark:text-ink-200">{selectedCompany.exampleFraming}</p>

                  <div className="mb-6 mt-6 grid gap-3 sm:grid-cols-2">
                    {selectedCompany.principles.map((p) => (
                      <div key={p.name}
                        className="surface-sunken cursor-pointer p-4 transition-colors duration-150 ease-out hover:bg-ink-100 dark:hover:bg-ink-900"
                        onClick={() => setExpandedPrinciple(expandedPrinciple === p.name ? null : p.name)}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-moss-600 dark:text-moss-400" />
                            <span className="font-semibold text-ink-900 dark:text-ink-50">{p.name}</span>
                          </div>
                          {expandedPrinciple === p.name ? <ChevronUp className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-300" /> : <ChevronDown className="h-4 w-4 shrink-0 text-ink-600 dark:text-ink-300" />}
                        </div>
                        <AnimatePresence>
                          {expandedPrinciple === p.name && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <p className="mt-3 text-sm text-ink-700 dark:text-ink-200">{p.description}</p>
                              <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-900/20">
                                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">Example answer hook</p>
                                <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">{p.example}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="surface-sunken p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-300">
                        <Lightbulb className="h-4 w-4" /> Interview tips for {selectedCompany.name}
                      </h3>
                      <ul className="space-y-2">
                        {selectedCompany.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-400 dark:bg-ink-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="surface-sunken p-4">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-300">
                        <MessageSquare className="h-4 w-4" /> Top {selectedCompany.name} questions
                      </h3>
                      <ul className="space-y-3">
                        {selectedCompany.topQuestions.map((q, i) => (
                          <li key={i} className="text-sm text-ink-700 dark:text-ink-200">
                            <span className="mr-2 font-semibold">{i + 1}.</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── STAR Questions Tab ── */}
          {tab === 'questions' && (
            <motion.div key="questions" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              {/* Filters */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
                    className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:outline-none dark:border-ink-800 dark:bg-ink-900 dark:text-ink-50"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-ink-500" /></button>}
                </div>
                <PriorityFilter value={priorityFilter} onChange={setPriorityFilter} />
                <div className="flex flex-wrap gap-2">
                  <Filter className="h-4 w-4 mt-1.5 text-ink-500 shrink-0" />
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => setDifficultyFilter(d)}
                      className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-xs font-medium transition-colors duration-150 ease-out ${difficultyFilter === d ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'bg-white text-ink-600 card-hover dark:bg-ink-900 dark:text-ink-300'}`}>
                      {d}
                    </button>
                  ))}
                  <span className="h-4 w-px bg-ink-200 dark:bg-ink-800 mt-1.5" />
                  {COMPANY_NAMES.map(c => (
                    <button key={c} onClick={() => setCompanyFilter(c)}
                      className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-xs font-medium transition-colors duration-150 ease-out ${companyFilter === c ? 'bg-clay-600 text-white dark:bg-clay-500 dark:text-ink-950' : 'bg-white text-ink-600 card-hover dark:bg-ink-900 dark:text-ink-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mb-4 text-sm text-ink-600 dark:text-ink-300">{filteredQuestions.length} questions</p>

              <div className="space-y-4">
                {filteredQuestions.map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    expanded={expandedQuestion === q.id}
                    onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                    priority={questionPriorities[q.id]}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Practice Mode Tab ── */}
          {tab === 'practice' && (
            <motion.div key="practice" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <div className="mb-6 rounded-xl bg-clay-600 p-6 text-white dark:bg-clay-500 dark:text-ink-950">
                <h2 className="text-xl font-semibold">Practice mode</h2>
                <p className="mt-1 opacity-90">Read each question. Think through your STAR answer. Then reveal to compare.</p>
              </div>
              <div className="space-y-6">
                {questions.map((q) => (
                  <PracticeRow
                    key={q.id}
                    question={q}
                    visible={!!practiceVisible[q.id]}
                    onToggle={() => togglePracticeVisible(q.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function QuestionRow({
  question: q,
  expanded,
  onToggle,
  priority,
}: {
  question: (typeof questions)[number]
  expanded: boolean
  onToggle: () => void
  priority: Priority | undefined
}) {
  const isCovered = useIsCovered('behavioral', q.id)

  return (
    <div className="surface-card" id={`question-${q.id}`}>
      <div className="cursor-pointer p-6" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
              {q.companies.map(c => <span key={c} className="chip">{c}</span>)}
            </div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-ink-900 dark:text-ink-50">
              {q.title}
              {priority && <PriorityBadge priority={priority} />}
              {isCovered && <Check className="h-4 w-4 text-moss-600 dark:text-moss-400" aria-label="Covered" />}
            </h3>
            <p className="mt-1 text-sm text-ink-700 dark:text-ink-200">{q.question}</p>
          </div>
          {expanded ? <ChevronUp className="h-5 w-5 shrink-0 text-ink-600 dark:text-ink-300" /> : <ChevronDown className="h-5 w-5 shrink-0 text-ink-600 dark:text-ink-300" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {q.categories.map(c => <span key={c} className="chip">{c}</span>)}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-ink-200 dark:border-ink-800">
            <div className="space-y-4 p-6">
              {([['Situation', q.star.situation], ['Task', q.star.task], ['Action', q.star.action], ['Result', q.star.result]] as const).map(([label, content]) => (
                <div key={label} className="surface-sunken p-4">
                  <p className="mb-2 text-sm font-semibold text-ink-600 dark:text-ink-300">{label}</p>
                  <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{content}</p>
                </div>
              ))}

              <div>
                <p className="mb-3 text-sm font-semibold text-ink-600 dark:text-ink-300">Three versions of this answer</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {TIER_ORDER.map(([key, label, tone]) => (
                    <div key={key} className="surface-sunken p-4">
                      <p className={`mb-2 text-xs font-semibold ${tone}`}>{label}</p>
                      <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{q.tiers[key]}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  <span className="font-semibold">What moved it up: </span>{q.tiers.whatMoved}
                </p>
              </div>

              <div className="grid gap-4 divide-y divide-ink-200 md:grid-cols-3 md:divide-y-0 md:divide-x dark:divide-ink-800">
                <div className="pt-4 first:pt-0 md:pt-0 md:pr-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300"><Lightbulb className="h-4 w-4" /> Key insights</p>
                  <ul className="space-y-1.5">{q.insights.map((ins, j) => <li key={j} className="text-xs text-ink-700 dark:text-ink-200">{ins}</li>)}</ul>
                </div>
                <div className="pt-4 md:pt-0 md:px-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300"><MessageSquare className="h-4 w-4" /> Likely follow-ups</p>
                  <ul className="space-y-1.5">{q.followUps.map((f, j) => <li key={j} className="text-xs text-ink-700 dark:text-ink-200">{f}</li>)}</ul>
                </div>
                <div className="pt-4 md:pt-0 md:pl-4">
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300"><AlertTriangle className="h-4 w-4" /> Red flags to avoid</p>
                  <ul className="space-y-1.5">{q.redFlags.map((r, j) => <li key={j} className="text-xs text-ink-700 dark:text-ink-200">{r}</li>)}</ul>
                </div>
              </div>

              <div className="flex justify-end">
                <CoveredToggle track="behavioral" itemId={q.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PracticeRow({
  question: q,
  visible,
  onToggle,
}: {
  question: (typeof questions)[number]
  visible: boolean
  onToggle: () => void
}) {
  const isCovered = useIsCovered('behavioral', q.id)

  return (
    <div className="surface-card">
      <div className="p-6">
        <div className="mb-2 flex items-center gap-2">
          <Award className="h-5 w-5 text-clay-600 dark:text-clay-400" />
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${difficultyColor[q.difficulty]}`}>{q.difficulty}</span>
          {isCovered && <Check className="h-4 w-4 text-moss-600 dark:text-moss-400" aria-label="Covered" />}
        </div>
        <p className="text-lg font-semibold text-ink-900 dark:text-ink-50">{q.question}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {q.categories.map(c => <span key={c} className="chip">{c}</span>)}
        </div>

        <div className="mt-4">
          {!visible ? (
            <button onClick={onToggle} className="btn-primary">
              <Eye className="h-4 w-4" /> Reveal model answer
            </button>
          ) : (
            <div>
              <button onClick={onToggle}
                className="mb-4 flex min-h-[44px] items-center gap-2 text-sm text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-ink-50">
                <EyeOff className="h-4 w-4" /> Hide answer
              </button>
              <div className="space-y-3">
                {([['S', q.star.situation], ['T', q.star.task], ['A', q.star.action], ['R', q.star.result]] as const).map(([label, content]) => (
                  <div key={label} className="surface-sunken p-4">
                    <span className="mr-2 font-semibold text-ink-500 dark:text-ink-400">{label}</span>
                    <span className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{content}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <CoveredToggle track="behavioral" itemId={q.id} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
