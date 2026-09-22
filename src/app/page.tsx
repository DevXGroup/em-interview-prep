'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProgressTracker } from '@/components/ProgressTracker'
import { TrackRow } from '@/components/TrackRow'
import { tracks } from '@/data/tracks'
import { Timer, Handshake, ClipboardList, FileCode2 } from 'lucide-react'

const companies = [
  { name: 'Meta', slug: 'meta', rounds: '4 to 5 rounds' },
  { name: 'Amazon', slug: 'amazon', rounds: '6 to 7 rounds' },
  { name: 'Apple', slug: 'apple', rounds: '5 rounds' },
  { name: 'Netflix', slug: 'netflix', rounds: '5 rounds' },
  { name: 'Google', slug: 'google', rounds: '6 to 7 rounds' },
  { name: 'Microsoft', slug: 'microsoft', rounds: '5 to 6 rounds' },
]

const loopPages = [
  { href: '/mock-loop', icon: Timer, title: 'Mock loop day', description: 'Six timed rounds, a break schedule, and a self-score sheet that names your weakest round.' },
  { href: '/coding/sdm-guide', icon: FileCode2, title: 'SDM coding guide', description: 'What the coding round actually scores for a manager, from the interviewer side of the table.' },
  { href: '/negotiation', icon: Handshake, title: 'Offer and negotiation', description: 'How levelling is decided, what is negotiable where, and the scripts for the call.' },
  { href: '/debrief', icon: ClipboardList, title: 'After the loop', description: 'A debrief template that turns a rejection or a mock into a concrete study list.' },
]

export default function HomePage() {
  return (
    <div className="pb-24">
      {/* What this is */}
      <section className="page-shell pb-14 pt-14 sm:pt-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl leading-[1.05] text-ink-900 dark:text-ink-50 sm:text-5xl lg:text-6xl">
            The software engineering
            <br />
            interview class, <em className="font-normal italic text-clay-700 dark:text-clay-400">in order</em>.
          </h1>

          <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-700 dark:text-ink-200">
            System design, coding, behavioral and leadership, taught the way interviewers grade them.
            Six tracks, an eight-week plan, and loop breakdowns for Meta, Amazon, Apple, Netflix,
            Google and Microsoft. Built for engineers and engineering managers. Free, open source,
            nothing to sign up for. Your progress stays in this browser.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/roadmap" className="btn-primary">
              Open the 8-week plan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/behavioral" className="btn-secondary">
              Jump into behavioral
            </Link>
          </div>
        </div>
      </section>

      <div className="page-shell">
        <div className="rule" />
      </div>

      {/* Where you are */}
      <section className="page-shell py-14">
        <ProgressTracker />
      </section>

      <div className="page-shell">
        <div className="rule" />
      </div>

      {/* Where to go */}
      <section className="page-shell py-14">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl">The tracks</h2>
          <p className="text-sm text-ink-600 dark:text-ink-300">Ordered by how often it decides the loop</p>
        </div>

        <TrackRow {...tracks[0]} title={tracks[0].name} lead />

        <ul className="mt-3 space-y-3">
          {tracks.slice(1).map((track) => (
            <li key={track.href}>
              <TrackRow {...track} title={track.name} />
            </li>
          ))}
        </ul>
      </section>

      <div className="page-shell">
        <div className="rule" />
      </div>

      <div className="page-shell">
        <div className="rule" />
      </div>

      {/* Around the loop */}
      <section className="page-shell py-14">
        <h2 className="text-2xl">Around the loop</h2>
        <p className="mt-2 max-w-prose text-ink-700 dark:text-ink-200">
          The tracks cover the rounds. These cover the week before, the day itself, and the call after.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loopPages.map((page) => (
            <li key={page.href}>
              <Link href={page.href} className="surface-card card-hover flex h-full min-h-[44px] flex-col gap-2 p-5">
                <page.icon className="h-5 w-5 text-ink-600 dark:text-ink-300" aria-hidden="true" />
                <span className="font-semibold text-ink-900 dark:text-ink-50">{page.title}</span>
                <span className="text-sm text-ink-700 dark:text-ink-200">{page.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Company specifics */}
      <section className="page-shell py-14">
        <h2 className="text-2xl">By company</h2>
        <p className="mt-2 max-w-prose text-ink-700 dark:text-ink-200">
          Loop structure, the questions that recur, what each bar actually rewards, and comp bands.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((company) => (
            <li key={company.slug}>
              <Link
                href={`/companies/${company.slug}`}
                className="surface-card card-hover flex min-h-[44px] flex-col items-center gap-2 p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/logos/${company.slug}.svg`}
                  alt=""
                  aria-hidden="true"
                  className={`h-8 w-8 object-contain ${company.slug === 'apple' ? 'dark:invert' : ''}`}
                />
                <span className="text-sm font-semibold text-ink-900 dark:text-ink-50">{company.name}</span>
                <span className="text-xs text-ink-600 dark:text-ink-300">{company.rounds}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
