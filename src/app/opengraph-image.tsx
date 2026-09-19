import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const alt = `${SITE_NAME}: free Engineering Manager interview prep`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const tracks = [
  ['Behavioral', 100],
  ['System Design', 78],
  ['Coding', 62],
  ['Technical Leadership', 48],
  ['Team Management', 36],
  ['AI Interview', 22],
] as const

async function loadFont(css: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://fonts.googleapis.com/css2?family=${css}&text=${encodeURIComponent(text)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const url = (await res.text()).match(/src: url\((.+?)\) format\('(?:truetype|opentype|woff)'\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpenGraphImage() {
  const headline = 'Engineering Manager interview prep, in order.'
  const [serif, serifItalic] = await Promise.all([
    loadFont('Source+Serif+4:wght@600', headline),
    loadFont('Source+Serif+4:ital,wght@1,600', headline),
  ])
  const fonts = [
    serif && { name: 'Serif', data: serif, weight: 600 as const, style: 'normal' as const },
    serifItalic && { name: 'Serif', data: serifItalic, weight: 600 as const, style: 'italic' as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600; style: 'normal' | 'italic' }[]

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          background: '#17191c',
          color: '#e8ebee',
          padding: 64,
          fontFamily: 'Serif, Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: '#a5592e', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3, padding: '0 10px' }}>
              <div style={{ height: 5, width: 24, borderRadius: 2, background: '#fff' }} />
              <div style={{ height: 5, width: 16, borderRadius: 2, background: '#fff', opacity: 0.85 }} />
              <div style={{ height: 5, width: 8, borderRadius: 2, background: '#fff', opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: 28, fontFamily: 'sans-serif', fontWeight: 600 }}>EM Mastery</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              Engineering Manager interview prep,
            </div>
            <div style={{ fontSize: 64, lineHeight: 1.05, letterSpacing: '-0.02em', fontStyle: 'italic', color: '#d2895d' }}>
              in order.
            </div>
            <div style={{ marginTop: 28, fontSize: 24, fontFamily: 'sans-serif', color: '#9aa0a6' }}>
              Meta, Amazon, Apple, Netflix, Google, Microsoft. Free and open source.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, marginLeft: 'auto', width: 400, fontFamily: 'sans-serif' }}>
          {tracks.map(([name, pct]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 18, color: '#c8ccd1' }}>{name}</div>
              <div style={{ display: 'flex', height: 18, width: 400, background: '#222528', borderRadius: 3 }}>
                <div style={{ width: (pct / 100) * 400, background: '#bb6f42', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
