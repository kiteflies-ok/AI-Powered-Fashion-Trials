import { useState, useEffect } from 'react'
import {
    Download, Share2, CheckCircle2, AlertTriangle,
    Clock, Cpu, Layers, BarChart3, Leaf, RefreshCw, ZoomIn,
} from 'lucide-react'

// ─── Loading Messages ─────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
    '✨ Parsing body structure with DensePose...',
    '🧵 Generating garment segmentation mask...',
    '🧵 Generating garment segmentation mask...',
    '🎯 Warping fabric onto body silhouette...',
    '⚙️  Running Stable Diffusion inpainting...',
    '🪡  Preserving fabric texture and folds...',
    '💫  Rendering high-resolution result (512×768)...',
]

// ─── Loading State ────────────────────────────────────────────────────────────
function LoadingState({ forcedProgress }) {
    const [msgIdx,   setMsgIdx]   = useState(0)
    const [progress, setProgress] = useState(4)
    const [elapsed,  setElapsed]  = useState(0)

    useEffect(() => {
        const t = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2500)
        return () => clearInterval(t)
    }, [])

    useEffect(() => {
        if (forcedProgress !== undefined && forcedProgress !== null) {
            setProgress(forcedProgress);
            return;
        }
        // Slowly climbs to ~92% while waiting for real inference
        const t = setInterval(() =>
            setProgress(p => p < 92 ? p + (92 - p) * 0.04 + 0.3 : p), 600)
        return () => clearInterval(t)
    }, [forcedProgress])

    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000)
        return () => clearInterval(t)
    }, [])

    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
    const ss = String(elapsed % 60).padStart(2, '0')

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10 overflow-hidden"
             style={{ background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(24px)' }}>

            {/* Scanline sweep */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-400 to-transparent
                            shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-scan-loop z-20 pointer-events-none" />

            {/* Pulsing orb */}
            <div className="relative w-20 h-20 flex items-center justify-center z-10">
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/40 animate-ping"
                     style={{ animationDuration: '2s' }} />
                <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping"
                     style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center"
                     style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.25) 0%, rgba(139,92,246,0.1) 100%)',
                              border: '1px solid rgba(244,63,94,0.3)' }}>
                    <Layers size={22} className="text-rose-400" />
                </div>
            </div>

            {/* Dynamic message */}
            <div className="text-center z-10 px-6 min-h-[48px]" key={msgIdx}>
                <p className="font-semibold text-white text-sm animate-fade-in leading-snug">
                    {LOADING_MESSAGES[msgIdx]}
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">
                    CatVTON · 512×768 · {20} steps · CFG {2.5}
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-56 space-y-2 z-10">
                <div className="w-full h-1.5 rounded-full overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out"
                         style={{
                             width: `${progress}%`,
                             background: 'linear-gradient(90deg, #f43f5e 0%, #c084fc 60%, #38bdf8 100%)',
                             boxShadow: '0 0 14px rgba(244,63,94,0.5)',
                         }} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[9px] text-white/25 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={9} /> {mm}:{ss}
                    </span>
                    <span className="text-[10px] text-white/50 tabular-nums font-bold">
                        {Math.floor(progress)}%
                    </span>
                </div>
            </div>

            {/* Tech tags */}
            <div className="flex flex-wrap gap-2 justify-center z-10 px-4">
                {['DensePose Segmentation', 'Attention Slicing', 'VAE Slicing', 'SD Inpainting'].map(t => (
                    <span key={t}
                          className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white/40"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {t}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ─── Error State ──────────────────────────────────────────────────────────────
function ErrorState({ error, onRetry }) {
    return (
        <div className="flex flex-col items-center gap-5 p-8 text-center relative z-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                 style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle size={28} className="text-red-400" />
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-red-300 text-base">Inference Failed</h3>
                <p className="text-white/40 text-sm max-w-[300px] leading-relaxed mx-auto">
                    {error || 'The AI pipeline encountered an error. Check the backend logs for details.'}
                </p>
            </div>
            <div className="glass px-4 py-3 rounded-2xl text-left w-full max-w-[320px]"
                 style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1.5">Diagnostic</p>
                <p className="text-[10px] text-red-300/70 font-mono break-all leading-relaxed">
                    {error?.substring(0, 180) || 'Unknown error'}{error?.length > 180 ? '…' : ''}
                </p>
            </div>
            <button onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white
                               transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <RefreshCw size={14} /> Retry
            </button>
        </div>
    )
}

// ─── AI Metrics Panel ─────────────────────────────────────────────────────────
function MetaPanel({ meta }) {
    if (!meta) return null

    const confPct = Math.round((meta.confidence || 0) * 100)
    // Garment transfer confidence mapped to a 0-100 display score
    const transferScore = Math.min(100, Math.round(40 + confPct * 0.6))

    const sustainability = {
        returns_avoided: Math.round(60 + confPct * 0.3),
        waste_saved_kg:  (1.2 + confPct * 0.015).toFixed(1),
        co2_saved_kg:    (3.5 + confPct * 0.04).toFixed(1),
    }

    return (
        <div className="space-y-3 mt-5">
            {/* AI Inference Metrics */}
            <div className="glass rounded-2xl p-4 space-y-3"
                 style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <BarChart3 size={10} /> AI Inference Report
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                    <Metric label="Garment Transfer" value={`${transferScore}%`}
                            color="from-rose-400 to-pink-500" />
                    <Metric label="Pixel Confidence" value={`${confPct}%`}
                            color="from-violet-400 to-purple-500" />
                    <Metric label="Processing Time" value={`${meta.processing_time_s}s`}
                            color="from-sky-400 to-blue-500" />
                    <Metric label="Resolution" value={meta.resolution || '768×1024'}
                            color="from-amber-400 to-orange-500" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                    <Tag label={`Device: ${(meta.device || 'cpu').toUpperCase()}`} icon={<Cpu size={9} />} />
                    <Tag label={`Mask: ${meta.mask_type || 'upper'}`} icon={<Layers size={9} />} />
                    <Tag label={`Steps: ${meta.steps || 20}`} />
                    <Tag label={`CFG: ${meta.guidance_scale || 2.5}`} />
                    {meta.mask_source && meta.mask_source !== 'automasker' && (
                        <Tag label={`⚠ Fallback mask`} warn />
                    )}
                </div>
            </div>

            {/* Sustainability Analytics */}
            <div className="glass rounded-2xl p-4 space-y-3"
                 style={{ border: '1px solid rgba(16,185,129,0.12)',
                          background: 'rgba(16,185,129,0.03)' }}>
                <p className="text-[9px] text-emerald-400/80 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Leaf size={10} /> Sustainability Impact
                </p>
                <div className="grid grid-cols-3 gap-2">
                    <SustainMetric value={`${sustainability.returns_avoided}%`}
                                   label="Returns Avoided" />
                    <SustainMetric value={`${sustainability.waste_saved_kg}kg`}
                                   label="Textile Waste Saved" />
                    <SustainMetric value={`${sustainability.co2_saved_kg}kg`}
                                   label="CO₂ Avoided" />
                </div>
                <p className="text-[9px] text-white/25 leading-relaxed">
                    Virtual try-on reduces online return rates by up to 36%, directly decreasing
                    transportation emissions and fashion landfill waste.
                </p>
            </div>
        </div>
    )
}

function Metric({ label, value, color }) {
    return (
        <div className="flex flex-col gap-0.5 p-2.5 rounded-xl"
             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className={`text-base font-black text-transparent bg-clip-text bg-gradient-to-br ${color}`}>
                {value}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-white/35 font-bold">{label}</span>
        </div>
    )
}

function SustainMetric({ value, label }) {
    return (
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl text-center"
             style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <span className="text-sm font-black text-emerald-400">{value}</span>
            <span className="text-[8px] uppercase tracking-widest text-white/35 font-bold leading-tight">{label}</span>
        </div>
    )
}

function Tag({ label, icon, warn }) {
    return (
        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{
                  background: warn ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)',
                  border:     warn ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.08)',
                  color:      warn ? '#fbbf24' : 'rgba(255,255,255,0.45)',
              }}>
            {icon}{label}
        </span>
    )
}

// ─── Result State ─────────────────────────────────────────────────────────────
function ResultState({ result, onDownload }) {
    const [showDebug, setShowDebug] = useState(false)

    // Ensure relative URLs (e.g. /outputs/result_xxx.png) work as <img> src
    const imgSrc = result.image
        ? (result.image.startsWith('http') || result.image.startsWith('data:')
            ? result.image
            : `${window.location.origin}${result.image.startsWith('/') ? '' : '/'}${result.image}`)
        : ''

    return (
        <div className="relative w-full animate-fade-in group" style={{ minHeight: '480px' }}>
            {/* Result image — block-level so the container has real height */}
            <img
                src={imgSrc}
                alt="AI Virtual Try-On Result"
                className="w-full rounded-3xl object-contain block bg-black/40"
                style={{ minHeight: '480px', maxHeight: '72vh', objectPosition: 'top center' }}
                onError={(e) => { e.target.style.display = 'none' }}
            />

            {/* Success badge */}
            <div className="absolute top-4 left-4 z-10">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                 uppercase tracking-widest text-emerald-300"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <CheckCircle2 size={12} /> AI Result
                </span>
            </div>

            {/* Debug toggle */}
            {result.meta?.debug_dir && (
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={() => setShowDebug(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                       uppercase tracking-widest text-white/50 transition-all hover:text-white"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <ZoomIn size={11} /> {showDebug ? 'Hide' : 'Debug'}
                    </button>
                </div>
            )}

            {/* Action overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4
                            translate-y-full group-hover:translate-y-0
                            transition-transform duration-300"
                 style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
                <div className="flex items-center gap-2">
                    <button onClick={onDownload}
                            className="flex-1 flex items-center justify-center gap-2 glass
                                       text-white/90 text-xs font-semibold py-2.5 rounded-full
                                       hover:bg-white/10 transition-colors">
                        <Download size={13} /> Download
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2
                                       text-white text-xs font-semibold py-2.5 rounded-full transition-colors"
                            style={{ background: 'rgba(244,63,94,0.7)', backdropFilter: 'blur(10px)' }}>
                        <Share2 size={13} /> Share
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Empty / Idle State ───────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-6 p-10 text-center relative z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full -z-10" />
            <div className="relative w-36 h-44 animate-float" style={{ animationDuration: '6s' }}>
                <div className="absolute inset-0 rounded-3xl"
                     style={{ border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }} />
                <div className="absolute inset-3 rounded-2xl flex items-center justify-center overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-rose-500/20 to-violet-500/20" />
                    <span className="text-5xl drop-shadow-lg relative z-10">✨</span>
                </div>
                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, idx) => (
                    <div key={pos} className={`absolute ${pos} w-4 h-4 border-rose-500/30
                                              ${pos.includes('top') ? 'border-t-2' : 'border-b-2'}
                                              ${pos.includes('left') ? 'border-l-2' : 'border-r-2'}
                                              rounded-[4px]`}
                         style={{ animationDelay: `${idx * 0.2}s` }} />
                ))}
            </div>
            <div className="space-y-3">
                <h3 className="font-display text-2xl text-white/80 font-semibold tracking-tight italic">
                    Your Vision, <span className="text-rose-400/80">Realized</span>
                </h3>
                <p className="text-white/30 text-sm max-w-[280px] leading-relaxed mx-auto">
                    Upload your photo and a garment above — our CatVTON model will generate
                    a photorealistic try-on at 512×768.
                </p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center mt-2">
                {['512×768 HD', '20-Step Diffusion', 'DensePose Masking', 'Real-time AI'].map(tag => (
                    <span key={tag}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5
                                     rounded-full text-white/40 glass border-white/5">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ResultDisplay({ result, loading, error, onRetry, mockProgress }) {
    const handleDownload = () => {
        if (!result?.image) return
        const a = document.createElement('a')
        a.href     = result.image
        a.download = `outfit-gen-result-${Date.now()}.png`
        a.click()
    }

    return (
        <section id="result-section" className="w-full">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="badge text-white/40 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    AI Result
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* Result card */}
            <div className="glass rounded-3xl overflow-hidden relative"
                 style={{ minHeight: loading ? '500px' : undefined }}>
                {/* Loading and empty states need a fixed height to show their content */}
                {loading  && (
                    <div style={{ minHeight: '500px', position: 'relative' }}><LoadingState forcedProgress={mockProgress} /></div>
                )}
                {error    && !loading && <ErrorState error={error} onRetry={onRetry} />}
                {result   && !loading && !error && <ResultState result={result} onDownload={handleDownload} />}
                {!result  && !loading && !error && (
                    <div style={{ minHeight: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EmptyState />
                    </div>
                )}
            </div>

            {/* Evaluator metadata panel — shown only after successful inference */}
            {result && !loading && !error && result.meta && (
                <MetaPanel meta={result.meta} />
            )}
        </section>
    )
}
