import { useRef } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

function addRipple(e) {
    const btn  = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x    = e.clientX - rect.left - size / 2
    const y    = e.clientY - rect.top  - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 700)
}

export default function TryOnButton({ onClick, disabled, loading }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <button
                id="try-on-btn"
                className="btn-primary min-w-[220px]"
                onClick={(e) => { if (!disabled && !loading) { addRipple(e); onClick() } }}
                disabled={disabled || loading}
                aria-label="Try on the garment"
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Processing…</span>
                    </>
                ) : (
                    <>
                        <Sparkles size={18} className="animate-float" style={{ animationDuration: '2s' }} />
                        <span>Try It On</span>
                    </>
                )}
            </button>

            {disabled && !loading && (
                <p className="text-xs text-white/25 text-center max-w-[220px]">
                    Upload both photos to get started
                </p>
            )}
        </div>
    )
}
