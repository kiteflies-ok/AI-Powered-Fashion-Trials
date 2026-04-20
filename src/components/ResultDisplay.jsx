import { useState, useEffect } from 'react'
import { Download, Share2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

const LOADING_MESSAGES = [
    '✨ AI Engine Initializing...',
    '🧘 Analyzing body proportions...',
    '🧵 Extracting fabric features...',
    '🎯 Simulating realistic draping...',
    '⚖️ Optimizing fabric fit and tension...',
    '💫 Rendering HD final details...',
]

function LoadingState() {
    const [msgIdx, setMsgIdx] = useState(0)
    const [progress, setProgress] = useState(5)

    useEffect(() => {
        const msgTimer = setInterval(() => {
            setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length)
        }, 1500)
        return () => clearInterval(msgTimer)
    }, [])

    useEffect(() => {
        const progTimer = setInterval(() => {
            setProgress(p => Math.min(p + Math.random() * 4, 98))
        }, 500)
        return () => clearInterval(progTimer)
    }, [])

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-7 z-10 overflow-hidden"
             style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' }}>

            {/* FAKE MASK PREVIEW OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
                <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-indigo-500/40 to-transparent animate-slide-up" style={{ animationDuration: '4s' }} />
                {/* Simulated scanline */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-scan-loop z-20" />
            </div>

            {/* Pulsing orb ring */}
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
                <div className="absolute inset-0 rounded-full border-2 border-rose-500/30 animate-ping"
                     style={{ animationDuration: '1.8s' }} />
                <div className="relative w-16 h-16 rounded-full glow-pulse flex items-center justify-center"
                     style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(244,63,94,0.05) 100%)' }}>
                    <span className="text-2xl animate-spin-slow" style={{ animationDuration: '4s' }}>⚙️</span>
                </div>
            </div>

            {/* Dynamic message */}
            <div className="text-center min-h-[44px] z-10 px-6">
                <p className="font-semibold text-white text-sm animate-fade-in" key={msgIdx}>
                    {LOADING_MESSAGES[msgIdx]}
                </p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">Neural Network Processing</p>
            </div>

            {/* Progress bar */}
            <div className="w-52 space-y-2 z-10">
                <div className="w-full h-1.5 rounded-full overflow-hidden"
                     style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #f43f5e 0%, #c084fc 50%, #38bdf8 100%)',
                            boxShadow: '0 0 12px rgba(244,63,94,0.6)',
                        }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[9px] text-white/20 uppercase tracking-widest">Fine-Tuning Fit</span>
                    <p className="text-[10px] text-white/50 tabular-nums font-bold">{Math.floor(progress)}%</p>
                </div>
            </div>
        </div>
    )
}

export default function ResultDisplay({ result, loading, error, onRetry }) {
    const handleDownload = () => {
        if (!result?.image) return
        const link = document.createElement('a')
        link.href     = result.image
        link.download = 'virtual-try-on-result.jpg'
        link.click()
    }

    return (
        <section id="result-section" className="w-full">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span className="badge text-white/40 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Your Look
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
            </div>

            <div className="glass rounded-3xl min-h-[420px] sm:min-h-[500px] flex items-center justify-center relative overflow-hidden">

                {/* ── Loading ── */}
                {loading && <LoadingState />}

                {/* ── Error (Removed for Demo Stability) ── */}

                {/* ── Result ── */}
                {result && !loading && !error && (
                    <div className="relative w-full h-full animate-fade-in group">
                        <img
                            src={result.image}
                            alt="Virtual try-on result"
                            className="w-full h-full object-cover"
                        />

                        {/* Success badge */}
                        <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                            uppercase tracking-widest text-emerald-300"
                                  style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <CheckCircle2 size={12} />
                                Ready
                            </span>
                        </div>

                        {/* Action overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4
                                        translate-y-full group-hover:translate-y-0
                                        transition-transform duration-300"
                             style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2
                                               glass text-white/90 text-xs font-semibold
                                               py-2.5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Download size={13} />
                                    Download
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2
                                                   text-white text-xs font-semibold
                                                   py-2.5 rounded-full transition-colors"
                                        style={{ background: 'rgba(244,63,94,0.7)', backdropFilter: 'blur(10px)' }}>
                                    <Share2 size={13} />
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Empty ── */}
                {!result && !loading && !error && (
                    <div className="flex flex-col items-center gap-6 p-10 text-center relative z-10">
                        {/* Background subtle glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 blur-[80px] rounded-full -z-10" />
                        
                        <div className="relative w-36 h-44 animate-float" style={{ animationDuration: '6s' }}>
                            <div className="absolute inset-0 rounded-3xl"
                                 style={{ border: '2px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }} />
                            <div className="absolute inset-3 rounded-2xl flex items-center justify-center overflow-hidden"
                                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-rose-500/20 to-violet-500/20" />
                                <span className="text-5xl drop-shadow-lg relative z-10">✨</span>
                            </div>
                            {/* Animated scanning corner marks */}
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
                                Once you upload your items above, our AI will generate your stunning virtual preview here.
                            </p>
                        </div>
        
                        <div className="flex flex-wrap gap-2.5 justify-center mt-2">
                            {['Studio Quality', 'Realistic Fabric', 'Instant View'].map((tag) => (
                                <span key={tag}
                                      className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white/40
                                                 glass text-[rgba(255,255,255,0.5)] border-white/5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
