import { useState, useRef, useEffect } from 'react'
import { Sparkles, Check, Loader2, ArrowRight, Download, RotateCcw, AlertTriangle } from 'lucide-react'
import { SCENARIOS } from '../galleryData'

// ─── Loading Steps ─────────────────────────────────────────────────────────────
const LOAD_STEPS = [
  { label: 'Detecting body keypoints via DensePose…',      pct: 25 },
  { label: 'Generating segmentation mask (SCHP)…',         pct: 55 },
  { label: 'Running CatVTON diffusion inference…',         pct: 85 },
  { label: 'Compositing garment onto body region…',        pct: 100 },
]
const STEP_DURATION_MS = 1300

// ─── Scroll Reveal Hook ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

// ─── Scenario Card ─────────────────────────────────────────────────────────────
function ScenarioCard({ scenario, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`group relative rounded-2xl overflow-hidden border text-left w-full
                  transition-all duration-300 ease-out
                  ${isSelected
                    ? 'border-rose-500 ring-2 ring-rose-500/25 scale-[0.98]'
                    : 'border-white/10 hover:border-white/30 hover:scale-[1.02] hover:-translate-y-0.5'
                  }`}
    >
      {/* Split preview: left = model, right = garment */}
      <div className="relative flex aspect-[3/4] overflow-hidden bg-black">
        {/* Model – left half */}
        <div className="w-1/2 overflow-hidden">
          <img
            src={scenario.model}
            alt="Model"
            loading="lazy"
            crossOrigin="anonymous"
            className="w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-110"
            style={{ transformOrigin: 'center top' }}
          />
        </div>
        {/* Garment – right half */}
        <div className="w-1/2 overflow-hidden">
          <img
            src={scenario.garment}
            alt="Garment"
            loading="lazy"
            crossOrigin="anonymous"
            className="w-full h-full object-contain object-top transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Centre divider */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 z-10"
             style={{ background: 'rgba(255,255,255,0.35)' }} />
        {/* Centre icon */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center z-20">
          <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20
                          flex items-center justify-center shadow-lg">
            <ArrowRight size={10} className="text-white/70" />
          </div>
        </div>

        {/* Selected check */}
        {isSelected && (
          <div className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-rose-500
                          flex items-center justify-center shadow-[0_0_14px_rgba(244,63,94,0.6)] animate-scale-in">
            <Check size={14} className="text-white" />
          </div>
        )}

        {/* Gradient footer */}
        <div className="absolute bottom-0 inset-x-0 h-16 z-10 pointer-events-none"
             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }} />
      </div>

      {/* Label */}
      <div className="p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-sm font-semibold text-white/90 truncate">{scenario.label}</p>
        <p className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5 font-bold">
          {scenario.gender} · {scenario.category}
        </p>
      </div>
    </button>
  )
}

// ─── Loading Panel ─────────────────────────────────────────────────────────────
function LoadingPanel({ stepIdx }) {
  const current = LOAD_STEPS[stepIdx] ?? LOAD_STEPS[0]

  return (
    <div className="space-y-4 py-2">
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${current.pct}%`,
            background: 'linear-gradient(90deg, #f43f5e 0%, #c084fc 60%, #38bdf8 100%)',
            boxShadow: '0 0 10px rgba(244,63,94,0.5)',
          }}
        />
      </div>

      {/* Steps list */}
      <div className="space-y-2.5">
        {LOAD_STEPS.map((s, i) => {
          const done    = i < stepIdx
          const active  = i === stepIdx
          const pending = i > stepIdx
          return (
            <div key={i} className={`flex items-center gap-2.5 transition-opacity duration-300
                                     ${pending ? 'opacity-30' : 'opacity-100'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all
                               ${done   ? 'bg-emerald-500'
                               : active ? 'border border-rose-500'
                               : 'border border-white/20'}`}>
                {done   && <Check size={10} className="text-white" />}
                {active && <Loader2 size={10} className="text-rose-400 animate-spin" />}
              </div>
              <span className={`text-[11px] leading-tight
                                ${active ? 'text-white font-medium' : done ? 'text-white/50' : 'text-white/30'}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-[9px] text-white/25 uppercase tracking-widest text-center font-bold">
        CatVTON · 768×1024 · 40-step diffusion
      </p>
    </div>
  )
}

// ─── Result Panel ──────────────────────────────────────────────────────────────
function ResultPanel({ scenario, resultUrl, onReset }) {
  const imgSrc = resultUrl.startsWith('http') || resultUrl.startsWith('data:')
      ? resultUrl
      : `${window.location.origin}${resultUrl.startsWith('/') ? '' : '/'}${resultUrl}`

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = imgSrc
    a.download = `outfit-gen-${scenario.id}.png`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main result image */}
      <div className="relative rounded-2xl overflow-hidden">
        <img
          src={imgSrc}
          alt="AI Try-On Result"
          className="w-full object-cover rounded-2xl"
          style={{ maxHeight: '340px', objectPosition: 'top center' }}
        />
        {/* Success badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold
                           uppercase tracking-widest text-emerald-300"
                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)' }}>
            <Check size={10} /> AI Result
          </span>
        </div>
        {/* Accent glow */}
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
      </div>

      {/* Before → After comparison strip */}
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold text-center">Before</p>
          <img src={scenario.model} alt="Before"
               crossOrigin="anonymous"
               className="w-full rounded-xl object-contain object-top"
               style={{ height: '80px', backgroundColor: '#000' }} />
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0 px-1">
          <ArrowRight size={16} className="text-rose-400" />
          <Sparkles size={10} className="text-violet-400" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-bold text-center">After</p>
          <img src={imgSrc} alt="After"
               className="w-full rounded-xl object-contain object-top"
               style={{ height: '80px', backgroundColor: '#000' }} />
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full
                     text-xs font-semibold text-white/80 transition-all hover:text-white
                     hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Download size={12} /> Download
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full
                     text-xs font-semibold text-white/50 transition-all hover:text-white/80"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <RotateCcw size={12} /> Retry
        </button>
      </div>
    </div>
  )
}

// ─── Preview Panel (right sticky pane) ────────────────────────────────────────
function PreviewPanel({ scenario, phase, stepIdx, resultUrl, errorMsg, onGenerate, onReset }) {
  if (!scenario) {
    return (
      <div className="sticky top-24 rounded-3xl border border-white/08 p-6 flex flex-col items-center
                      justify-center gap-4 text-center"
           style={{ minHeight: '420px', background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
             style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
          <Sparkles size={22} className="text-rose-400" />
        </div>
        <div>
          <p className="text-white/70 font-semibold text-sm">Select a Scenario</p>
          <p className="text-white/30 text-xs mt-1 leading-relaxed max-w-[180px]">
            Pick a model + outfit combination from the grid to preview the AI try-on
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-24 rounded-3xl p-5 space-y-5 overflow-hidden"
         style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>

      {/* Decorative glows */}
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] pointer-events-none"
           style={{ background: `rgba(244,63,94,0.15)` }} />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full blur-[50px] pointer-events-none"
           style={{ background: `rgba(139,92,246,0.12)` }} />

      {/* Header */}
      <div className="flex items-center gap-2 relative z-10">
        <Sparkles size={16} className="text-rose-400" />
        <h3 className="text-base font-semibold text-white">Fitting Room</h3>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
          {scenario.gender}
        </span>
      </div>

      {/* Input pair */}
      <div className="relative z-10">
        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-2">Inputs</p>
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <img src={scenario.model} alt="Person"
                 crossOrigin="anonymous"
                 className="w-full rounded-xl object-contain object-top bg-black/40"
                 style={{ height: '120px' }} />
            <p className="text-[9px] text-white/30 uppercase tracking-widest text-center font-bold">Person</p>
          </div>
          <div className="flex items-center justify-center shrink-0 px-0.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.25)' }}>
              <ArrowRight size={12} className="text-rose-400" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <img src={scenario.garment} alt="Garment"
                 crossOrigin="anonymous"
                 className="w-full rounded-xl object-contain object-top bg-black/40"
                 style={{ height: '120px' }} />
            <p className="text-[9px] text-white/30 uppercase tracking-widest text-center font-bold">Garment</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Action area */}
      <div className="relative z-10">
        {phase === 'idle' && (
          <button
            onClick={onGenerate}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-white tracking-wide
                       flex items-center justify-center gap-2 transition-all duration-300
                       hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(244,63,94,0.3)]"
            style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #c026d3 50%, #7c3aed 100%)' }}>
            <Sparkles size={15} />
            Generate AI Try-On
          </button>
        )}
        {phase === 'loading' && <LoadingPanel stepIdx={stepIdx} />}
        {phase === 'done'    && <ResultPanel scenario={scenario} resultUrl={resultUrl} onReset={onReset} />}
        {phase === 'error'   && (
          <div className="text-center p-6 rounded-2xl space-y-3"
               style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={24} className="text-red-400 mx-auto" />
            <p className="text-white text-sm font-semibold">Inference Failed</p>
            <p className="text-white/50 text-[10px] break-all">{errorMsg}</p>
            <button onClick={onReset}
                    className="mt-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 border border-white/10 hover:bg-white/5">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Section ──────────────────────────────────────────────────────────────
export default function GallerySection() {
  const [gender,   setGender]   = useState('All')
  const [selected, setSelected] = useState(null)
  const [phase,     setPhase]     = useState('idle')   // idle | loading | done | error
  const [stepIdx,   setStepIdx]   = useState(0)
  const [resultUrl, setResultUrl] = useState(null)
  const [errorMsg,  setErrorMsg]  = useState(null)
  const timerRef = useRef(null)

  const [headerRef, headerVisible] = useReveal()

  const filtered = gender === 'All' ? SCENARIOS : SCENARIOS.filter(s => s.gender === gender)

  const handleSelect = (scenario) => {
    setSelected(scenario)
    setPhase('idle')
    setStepIdx(0)
    setResultUrl(null)
    setErrorMsg(null)
    clearInterval(timerRef.current)
  }

  const handleGenerate = async () => {
    if (!selected || phase === 'loading') return
    setPhase('loading')
    setStepIdx(0)
    setResultUrl(null)
    setErrorMsg(null)

    try {
      // Start the UI simulation timer
      let step = 0
      timerRef.current = setInterval(() => {
        if (step < LOAD_STEPS.length - 1) {
          step++
          setStepIdx(step)
        }
      }, STEP_DURATION_MS)

      // Fetch images as Blobs
      const [modelBlob, garmentBlob] = await Promise.all([
        fetch(selected.model, { cache: 'no-cache' }).then(r => r.blob()),
        fetch(selected.garment, { cache: 'no-cache' }).then(r => r.blob())
      ])

      const formData = new FormData()
      formData.append('person_image', modelBlob, 'person.jpg')
      formData.append('cloth_image', garmentBlob, 'cloth.jpg')

      // Enforce a minimum delay so the user sees all 4 steps (LOAD_STEPS.length * STEP_DURATION_MS)
      const minDelayMs = LOAD_STEPS.length * STEP_DURATION_MS;
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, minDelayMs));

      // Run inference and minimum delay in parallel
      const [res] = await Promise.all([
        fetch('/api/try-on', { method: 'POST', body: formData }),
        minDelayPromise
      ]);

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.error) {
        throw new Error(data.details || data.error || `HTTP ${res.status}`)
      }

      clearInterval(timerRef.current)
      setStepIdx(LOAD_STEPS.length - 1)
      setResultUrl(data.resultUrl)
      setPhase('done')

    } catch (err) {
      clearInterval(timerRef.current)
      setErrorMsg(err.message)
      setPhase('error')
    }
  }

  const handleReset = () => {
    setPhase('idle')
    setStepIdx(0)
    setResultUrl(null)
    setErrorMsg(null)
    clearInterval(timerRef.current)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  return (
    <section id="gallery" className="w-full py-16 sm:py-24 relative">

      {/* ── Section Header ── */}
      <div
        ref={headerRef}
        className="text-center mb-12 transition-all duration-700"
        style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest
                         px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
          <Sparkles size={11} />
          Studio Gallery
        </span>
        <h2 className="font-display text-3xl sm:text-5xl text-white font-semibold mt-2">
          Explore the <span className="gradient-text italic">Collection</span>
        </h2>
        <p className="text-white/45 text-sm mt-4 max-w-md mx-auto leading-relaxed">
          Select any model + outfit scenario. Our CatVTON engine generates the try-on result instantly.
        </p>
      </div>

      {/* ── Gender Filter ── */}
      <div className="flex gap-2 mb-8 justify-center">
        {['All', 'Women', 'Men'].map(g => (
          <button
            key={g}
            onClick={() => { setGender(g); setSelected(null); setPhase('idle') }}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200
                        ${gender === g
                          ? 'text-white shadow-[0_0_16px_rgba(244,63,94,0.3)]'
                          : 'text-white/40 hover:text-white/70'}`}
            style={gender === g
              ? { background: 'linear-gradient(135deg,#f43f5e,#7c3aed)', border: '1px solid transparent' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }
            }
          >
            {g === 'Women' ? '♀ Women' : g === 'Men' ? '♂ Men' : 'All'}
          </button>
        ))}
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Left: Scenario Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selected?.id === scenario.id}
                onSelect={() => handleSelect(scenario)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-20 text-white/30 text-sm">No scenarios match the selected filter.</p>
          )}
        </div>

        {/* Right: Sticky Preview */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0">
          <PreviewPanel
            scenario={selected}
            phase={phase}
            stepIdx={stepIdx}
            resultUrl={resultUrl}
            errorMsg={errorMsg}
            onGenerate={handleGenerate}
            onReset={handleReset}
          />
        </div>

      </div>
    </section>
  )
}
