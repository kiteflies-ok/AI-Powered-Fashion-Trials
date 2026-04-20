import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'

export default function AIStatus({ statusData }) {
    if (!statusData) return null
    const { status, progress, message, error } = statusData

    if (status === 'ready') return (
        <div className="flex items-center justify-center py-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-fade-in text-xs font-bold uppercase tracking-widest text-emerald-300"
                 style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={14} />
                AI Engine Synchronized
            </div>
        </div>
    )

    if (status === 'error') return (
        <div className="processing-glow text-center p-6 rounded-3xl mx-auto max-w-sm"
             style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
            <h3 className="text-sm font-bold text-violet-300 uppercase tracking-widest flex items-center justify-center">
                AI Engine Optimizing<span className="loading-dots w-4 text-left inline-block"></span>
            </h3>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
                Preparing high-quality results for you
            </p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-1.5 rounded-full text-[10px] font-bold text-white/70 uppercase tracking-widest
                           hover:bg-white/10 hover:text-white transition-all
                           border border-white/10 bg-white/5"
            >
                Restart Simulation
            </button>
        </div>
    )

    return (
        <div className="glass w-full max-w-sm mx-auto p-4 rounded-2xl space-y-3 animate-slide-up border-rose-500/10">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl"
                         style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.15)' }}>
                        <Loader2 className="animate-spin text-rose-400" size={16} />
                    </div>
                    <div className="space-y-0">
                        <h4 className="text-xs font-bold text-white/90 leading-tight">AI Engine Warmup</h4>
                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Synchronizing...</p>
                    </div>
                </div>
                <span className="text-xl font-black text-white/90 tabular-nums">{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="relative w-full h-1 rounded-full overflow-hidden"
                 style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #f43f5e, #c084fc)',
                        boxShadow: '0 0 8px rgba(244,63,94,0.4)',
                    }}
                />
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <Info size={12} className="text-white/20 shrink-0" />
                <p className="text-[10px] text-white/40 truncate">
                    {message || 'Optimizing neural pathways...'}
                </p>
            </div>
        </div>
    )
}
